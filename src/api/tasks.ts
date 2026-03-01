/**
 * Tasks API - CRUD, bulk ops, templates, reminders, escalations
 * Uses mock data for local development; swap for Supabase/Edge Function in production
 * Runtime safety: all responses validated with nullish coalescing and Array.isArray checks
 */
import { api } from '@/lib/api'
import type {
  Task,
  TaskTemplate,
  TaskFilters,
  TasksResponse,
  TaskCreatePayload,
  TaskUpdatePayload,
  BookingContext,
  ClientContext,
} from '@/types/task'

const MOCK_AGENTS = [
  { id: 'a1', name: 'Sarah Mitchell' },
  { id: 'a2', name: 'James Chen' },
  { id: 'a3', name: 'Emma Laurent' },
]

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Send pre-arrival email',
    description: 'Send welcome pack and arrival details to client',
    status: 'todo',
    dueDate: '2025-03-05',
    assigneeId: 'a1',
    assigneeName: 'Sarah Mitchell',
    slaLabel: '24h',
    bookingId: 'b1',
    bookingReference: 'LF-2025-001',
    clientId: 'c1',
    clientName: 'Sarah Mitchell',
    resortName: 'Villa Serenity',
    mentions: [],
    priority: 'medium',
    reminders: [],
    escalations: [],
    createdAt: '2025-02-28T10:00:00Z',
    updatedAt: '2025-02-28T10:00:00Z',
  },
  {
    id: 't2',
    title: 'Confirm transfer booking',
    description: 'Verify airport transfer with supplier',
    status: 'in_progress',
    dueDate: '2025-03-06',
    assigneeId: 'a1',
    assigneeName: 'Sarah Mitchell',
    slaLabel: '48h',
    bookingId: 'b3',
    bookingReference: 'LF-2025-003',
    clientId: 'c3',
    clientName: 'Emma Laurent',
    resortName: 'Mountain Lodge',
    mentions: ['a2'],
    priority: 'high',
    reminders: [],
    escalations: [],
    createdAt: '2025-02-27T09:00:00Z',
    updatedAt: '2025-02-28T14:00:00Z',
  },
  {
    id: 't3',
    title: 'Prepare welcome pack',
    description: 'Assemble welcome pack for Villa Serenity stay',
    status: 'done',
    dueDate: '2025-03-04',
    assigneeId: 'a3',
    assigneeName: 'Emma Laurent',
    slaLabel: '24h',
    bookingId: 'b1',
    bookingReference: 'LF-2025-001',
    clientId: 'c1',
    clientName: 'Sarah Mitchell',
    resortName: 'Villa Serenity',
    mentions: [],
    priority: 'medium',
    reminders: [],
    escalations: [],
    createdAt: '2025-02-28T08:00:00Z',
    updatedAt: '2025-02-28T16:00:00Z',
  },
  {
    id: 't4',
    title: 'Review quote approval',
    description: 'Awaiting client approval for LF-2025-002',
    status: 'blocked',
    dueDate: '2025-03-05',
    assigneeId: 'a2',
    assigneeName: 'James Chen',
    slaLabel: '72h',
    bookingId: 'b2',
    bookingReference: 'LF-2025-002',
    clientId: 'c2',
    clientName: 'James Chen',
    resortName: 'Ocean View Resort',
    mentions: ['a1'],
    priority: 'high',
    reminders: [],
    escalations: [],
    createdAt: '2025-02-25T14:00:00Z',
    updatedAt: '2025-02-26T11:00:00Z',
  },
  {
    id: 't5',
    title: 'Final payment reminder',
    description: 'Send balance due reminder for LF-2025-003',
    status: 'review',
    dueDate: '2025-03-02',
    assigneeId: 'a1',
    assigneeName: 'Sarah Mitchell',
    slaLabel: '24h',
    bookingId: 'b3',
    bookingReference: 'LF-2025-003',
    clientId: 'c3',
    clientName: 'Emma Laurent',
    resortName: 'Mountain Lodge',
    mentions: [],
    priority: 'urgent',
    reminders: [],
    escalations: [],
    createdAt: '2025-02-28T12:00:00Z',
    updatedAt: '2025-02-28T15:00:00Z',
  },
]

const MOCK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'tmpl1',
    name: 'Pre-arrival checklist',
    defaults: {
      title: 'Pre-arrival tasks',
      status: 'todo',
      slaLabel: '24h',
      priority: 'medium',
    },
    bookingContextId: 'booking',
    clientContextId: 'client',
  },
  {
    id: 'tmpl2',
    name: 'Quote follow-up',
    defaults: {
      title: 'Follow up on quote',
      status: 'todo',
      slaLabel: '48h',
      priority: 'high',
    },
  },
]

function normalizeTasksResponse(raw: unknown): TasksResponse {
  const data = raw as Partial<TasksResponse> | null | undefined
  const list = Array.isArray(data?.data) ? data.data : []
  const count = typeof data?.count === 'number' ? data.count : list.length
  return { data: list, count }
}

function filterAndSortTasks(tasks: Task[], filters: TaskFilters): TasksResponse {
  let result = [...(tasks ?? [])]

  const search = (filters.search ?? '').toLowerCase().trim()
  if (search) {
    result = result.filter(
      (t) =>
        (t.title ?? '').toLowerCase().includes(search) ||
        (t.bookingReference ?? '').toLowerCase().includes(search) ||
        (t.clientName ?? '').toLowerCase().includes(search) ||
        (t.assigneeName ?? '').toLowerCase().includes(search)
    )
  }

  const statusFilter = filters.status
  if (statusFilter) {
    const statuses = Array.isArray(statusFilter) ? statusFilter : [statusFilter]
    result = result.filter((t) => statuses.includes(t.status))
  }
  if (filters.assigneeId) {
    result = result.filter((t) => t.assigneeId === filters.assigneeId)
  }
  if (filters.slaLabel) {
    result = result.filter((t) => t.slaLabel === filters.slaLabel)
  }
  if (filters.dueDateFrom) {
    result = result.filter((t) => (t.dueDate ?? '') >= filters.dueDateFrom!)
  }
  if (filters.dueDateTo) {
    result = result.filter((t) => (t.dueDate ?? '') <= filters.dueDateTo!)
  }
  if (filters.bookingId) {
    result = result.filter((t) => t.bookingId === filters.bookingId)
  }
  if (filters.clientId) {
    result = result.filter((t) => t.clientId === filters.clientId)
  }
  const priorityFilter = filters.priority
  if (priorityFilter) {
    const priorities = Array.isArray(priorityFilter) ? priorityFilter : [priorityFilter]
    result = result.filter((t) => priorities.includes(t.priority))
  }

  const sortField = filters.sort ?? 'dueDate'
  const sortOrder = filters.sortOrder ?? 'asc'
  const mult = sortOrder === 'asc' ? 1 : -1

  result.sort((a, b) => {
    let av: string | number | null = null
    let bv: string | number | null = null
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
    switch (sortField) {
      case 'dueDate':
        av = a.dueDate ?? ''
        bv = b.dueDate ?? ''
        break
      case 'priority':
        av = priorityOrder[a.priority] ?? 0
        bv = priorityOrder[b.priority] ?? 0
        return mult * (Number(av) - Number(bv))
      case 'assignee':
        av = a.assigneeName ?? ''
        bv = b.assigneeName ?? ''
        break
      case 'booking':
        av = a.bookingReference ?? ''
        bv = b.bookingReference ?? ''
        break
      case 'client':
        av = a.clientName ?? ''
        bv = b.clientName ?? ''
        break
      case 'createdAt':
        av = a.createdAt ?? ''
        bv = b.createdAt ?? ''
        break
      default:
        av = a.dueDate ?? ''
        bv = b.dueDate ?? ''
    }
    return mult * String(av).localeCompare(String(bv))
  })

  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 50))
  const start = (page - 1) * pageSize
  const paginated = result.slice(start, start + pageSize)

  return { data: paginated, count: result.length }
}

export const tasksApi = {
  async getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => {
        if (v != null && v !== '') {
          params.set(k, Array.isArray(v) ? v.join(',') : String(v))
        }
      })
      const qs = params.toString()
      const res = await api.get<TasksResponse>(`/tasks?${qs}`)
      return normalizeTasksResponse(res)
    } catch {
      return filterAndSortTasks(MOCK_TASKS, filters)
    }
  },

  async getTask(id: string): Promise<Task | null> {
    try {
      const res = await api.get<Task>(`/tasks/${id}`)
      return res ?? null
    } catch {
      return (MOCK_TASKS ?? []).find((t) => t.id === id) ?? null
    }
  },

  async createTask(payload: TaskCreatePayload): Promise<Task | null> {
    try {
      const res = await api.post<Task>('/tasks', payload)
      return res ?? null
    } catch {
      const agent = MOCK_AGENTS.find((a) => a.id === payload.assigneeId)
      const task: Task = {
        id: `t-${Date.now()}`,
        title: payload.title,
        description: payload.description,
        assigneeId: payload.assigneeId,
        assigneeName: agent?.name,
        dueDate: payload.dueDate,
        status: payload.status ?? 'todo',
        slaLabel: payload.slaLabel,
        templateId: payload.templateId,
        bookingId: payload.bookingId,
        clientId: payload.clientId,
        mentions: payload.mentions ?? [],
        priority: payload.priority ?? 'medium',
        reminders: [],
        escalations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      MOCK_TASKS.push(task)
      return task
    }
  },

  async updateTask(id: string, updates: TaskUpdatePayload): Promise<Task | null> {
    try {
      const res = await api.patch<Task>(`/tasks/${id}`, updates)
      return res ?? null
    } catch {
      const idx = (MOCK_TASKS ?? []).findIndex((t) => t.id === id)
      if (idx >= 0 && MOCK_TASKS[idx]) {
        const agent = updates.assigneeId
          ? MOCK_AGENTS.find((a) => a.id === updates.assigneeId)
          : undefined
        const updated: Task = {
          ...MOCK_TASKS[idx]!,
          ...updates,
          assigneeName: agent?.name ?? MOCK_TASKS[idx]!.assigneeName,
          updatedAt: new Date().toISOString(),
        }
        MOCK_TASKS[idx] = updated
        return updated
      }
      return null
    }
  },

  async updateTaskStatus(id: string, status: Task['status']): Promise<Task | null> {
    return tasksApi.updateTask(id, { status })
  },

  async deleteTask(id: string): Promise<boolean> {
    try {
      await api.delete(`/tasks/${id}`)
      return true
    } catch {
      const idx = (MOCK_TASKS ?? []).findIndex((t) => t.id === id)
      if (idx >= 0) {
        MOCK_TASKS.splice(idx, 1)
        return true
      }
      return false
    }
  },

  async bulkUpdateTasks(
    ids: string[],
    updates: Partial<TaskUpdatePayload>
  ): Promise<{ updated: number }> {
    try {
      const res = await api.post<{ updated: number }>('/tasks/bulk', { ids, updates })
      return res ?? { updated: 0 }
    } catch {
      let updated = 0
      for (const id of ids ?? []) {
        const idx = MOCK_TASKS.findIndex((t) => t.id === id)
        if (idx >= 0 && MOCK_TASKS[idx]) {
          const agent = updates.assigneeId
            ? MOCK_AGENTS.find((a) => a.id === updates.assigneeId)
            : undefined
          MOCK_TASKS[idx] = {
            ...MOCK_TASKS[idx]!,
            ...updates,
            assigneeName: agent?.name ?? MOCK_TASKS[idx]!.assigneeName,
            updatedAt: new Date().toISOString(),
          }
          updated++
        }
      }
      return { updated }
    }
  },

  async getTemplates(): Promise<TaskTemplate[]> {
    try {
      const res = await api.get<TaskTemplate[] | { data?: TaskTemplate[] }>('/tasks/templates')
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: TaskTemplate[] })?.data) ? (res as { data: TaskTemplate[] }).data : []
      return list ?? MOCK_TEMPLATES
    } catch {
      return MOCK_TEMPLATES
    }
  },

  async getBookingContext(bookingId: string): Promise<BookingContext | null> {
    try {
      const res = await api.get<BookingContext>(`/bookings/${bookingId}/context`)
      return res ?? null
    } catch {
      const task = (MOCK_TASKS ?? []).find((t) => t.bookingId === bookingId)
      return task
        ? {
            id: bookingId,
            reference: task.bookingReference ?? '',
            resort: task.resortName,
          }
        : null
    }
  },

  async getClientContext(clientId: string): Promise<ClientContext | null> {
    try {
      const res = await api.get<ClientContext>(`/clients/${clientId}/context`)
      return res ?? null
    } catch {
      const task = (MOCK_TASKS ?? []).find((t) => t.clientId === clientId)
      return task ? { id: clientId, name: task.clientName ?? '' } : null
    }
  },

  async getAgents(): Promise<{ id: string; name: string }[]> {
    try {
      const res = await api.get<{ id: string; name: string }[] | { data?: { id: string; name: string }[] }>('/agents')
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: { id: string; name: string }[] })?.data) ? (res as { data: { id: string; name: string }[] }).data : []
      return list ?? MOCK_AGENTS
    } catch {
      return MOCK_AGENTS
    }
  },

  async sendReminder(taskId: string): Promise<{ success: boolean }> {
    try {
      await api.post(`/tasks/${taskId}/reminder`, {})
      return { success: true }
    } catch {
      return { success: false }
    }
  },
}
