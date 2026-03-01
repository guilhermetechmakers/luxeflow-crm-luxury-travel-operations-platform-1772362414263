/**
 * useTasks - fetches task list with filters, pagination, sorting
 * Guards against null/undefined per runtime safety rules
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/api/tasks'
import type {
  TaskFilters,
  TaskCreatePayload,
  TaskUpdatePayload,
  TaskStatus,
} from '@/types/task'

const QUERY_KEY = ['tasks'] as const

function buildQueryKey(filters: TaskFilters): readonly [string, TaskFilters] {
  return [...QUERY_KEY, filters] as const
}

export function useTasks(filters: TaskFilters = {}) {
  const query = useQuery({
    queryKey: buildQueryKey(filters),
    queryFn: () => tasksApi.getTasks(filters),
    staleTime: 60 * 1000,
  })

  const data = query.data ?? null
  const tasks = Array.isArray(data?.data) ? data.data : []
  const count = typeof data?.count === 'number' ? data.count : 0

  return {
    ...query,
    tasks,
    count,
    data,
  }
}

export function useTask(id: string | null) {
  const query = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => (id ? tasksApi.getTask(id) : null),
    enabled: !!id,
    staleTime: 30 * 1000,
  })

  return {
    ...query,
    task: query.data ?? null,
  }
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TaskCreatePayload) => tasksApi.createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TaskUpdatePayload }) =>
      tasksApi.updateTask(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] })
    },
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useBulkUpdateTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      ids,
      updates,
    }: {
      ids: string[]
      updates: Partial<TaskUpdatePayload>
    }) => tasksApi.bulkUpdateTasks(ids, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useTaskTemplates() {
  const query = useQuery({
    queryKey: ['tasks', 'templates'],
    queryFn: () => tasksApi.getTemplates(),
    staleTime: 5 * 60 * 1000,
  })

  const templates = Array.isArray(query.data) ? query.data : []
  return { ...query, templates }
}

export function useAgentsForTasks() {
  const query = useQuery({
    queryKey: ['tasks', 'agents'],
    queryFn: () => tasksApi.getAgents(),
    staleTime: 5 * 60 * 1000,
  })

  const agents = Array.isArray(query.data) ? query.data : []
  return { ...query, agents }
}
