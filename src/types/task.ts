/**
 * Task-related types for LuxeFlow CRM tasks module
 * Runtime safety: all arrays use optional chaining and defaults
 */

export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'blocked'
  | 'done'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type ReminderType = 'in_app' | 'email' | 'sms'

export interface TaskReminder {
  id: string
  taskId: string
  type: ReminderType
  sendAt: string
  payload?: Record<string, unknown>
}

export interface EscalationRule {
  id: string
  taskId: string
  condition: Record<string, unknown>
  action: string
}

export interface Task {
  id: string
  title: string
  description?: string
  assigneeId?: string
  assigneeName?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  status: TaskStatus
  slaLabel?: string
  templateId?: string
  bookingId?: string
  bookingReference?: string
  clientId?: string
  clientName?: string
  resortName?: string
  mentions: string[]
  priority: TaskPriority
  reminders: TaskReminder[]
  escalations: EscalationRule[]
  isTemplateLinked?: boolean
}

export interface TaskTemplate {
  id: string
  name: string
  defaults: Record<string, unknown>
  bookingContextId?: string
  clientContextId?: string
  tasks?: Partial<Task>[]
}

export interface BookingContext {
  id: string
  reference: string
  resort?: string
  stage?: string
  startDate?: string
  endDate?: string
}

export interface ClientContext {
  id: string
  name: string
  vipFlags?: string[]
  contactPrefs?: Record<string, unknown>
}

export interface TaskFilters {
  status?: TaskStatus | TaskStatus[]
  assigneeId?: string
  slaLabel?: string
  dueDateFrom?: string
  dueDateTo?: string
  bookingId?: string
  clientId?: string
  resortId?: string
  priority?: TaskPriority | TaskPriority[]
  search?: string
  sort?: 'dueDate' | 'priority' | 'assignee' | 'booking' | 'client' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface TasksResponse {
  data: Task[]
  count: number
}

export interface TaskCreatePayload {
  title: string
  description?: string
  assigneeId?: string
  dueDate?: string
  status?: TaskStatus
  slaLabel?: string
  templateId?: string
  bookingId?: string
  clientId?: string
  mentions?: string[]
  priority?: TaskPriority
}

export interface TaskUpdatePayload extends Partial<TaskCreatePayload> {
  status?: TaskStatus
}
