/**
 * Team Chat hooks - channels, messages, users, search
 * Uses TanStack React Query for caching and invalidation
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '@/api/chat'
import type { MessageCreatePayload } from '@/types/chat'
import type { TaskCreatePayload } from '@/types/task'

const CHANNELS_KEY = ['chat', 'channels'] as const
const MESSAGES_KEY = (channelId: string) => ['chat', 'messages', channelId] as const
const USERS_KEY = (query: string) => ['chat', 'users', query] as const
const ALL_USERS_KEY = ['chat', 'users', 'all'] as const
const SEARCH_KEY = (q: string, scope?: string) => ['chat', 'search', q, scope] as const
const PINNED_KEY = (channelId: string) => ['chat', 'pinned', channelId] as const

export function useChannels(userId?: string) {
  return useQuery({
    queryKey: [...CHANNELS_KEY, userId ?? 'all'],
    queryFn: () => chatApi.getChannels(userId),
  })
}

export function useMessages(channelId: string | null, enabled = true) {
  return useQuery({
    queryKey: MESSAGES_KEY(channelId ?? ''),
    queryFn: () => chatApi.getMessages(channelId!, 100, 0),
    enabled: enabled && !!channelId,
  })
}

export function useChatUsers() {
  return useQuery({
    queryKey: ALL_USERS_KEY,
    queryFn: () => chatApi.getUsers(),
  })
}

export function useSearchUsers(query: string, enabled = true) {
  return useQuery({
    queryKey: USERS_KEY(query),
    queryFn: () => chatApi.searchUsers(query),
    enabled: enabled && query.length >= 2,
  })
}

export function useSearchMessages(q: string, scope?: 'messages' | 'attachments' | 'linked', enabled = true) {
  return useQuery({
    queryKey: SEARCH_KEY(q, scope),
    queryFn: () => chatApi.searchMessages(q, scope),
    enabled: enabled && q.length >= 2,
  })
}

export function usePinnedMessages(channelId: string | null, enabled = true) {
  return useQuery({
    queryKey: PINNED_KEY(channelId ?? ''),
    queryFn: () => chatApi.getPinnedMessages(channelId!),
    enabled: enabled && !!channelId,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: MessageCreatePayload) => chatApi.sendMessage(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: MESSAGES_KEY(vars.channelId) })
      qc.invalidateQueries({ queryKey: CHANNELS_KEY })
    },
  })
}

export function useCreateTaskFromMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId, payload }: { messageId: string; payload: TaskCreatePayload }) =>
      chatApi.createTaskFromMessage(messageId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useConvertToNote() {
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content?: string }) =>
      chatApi.convertToNote(messageId, content),
  })
}

export function useTogglePinMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ channelId, messageId, pinned }: { channelId: string; messageId: string; pinned: boolean }) =>
      chatApi.togglePinMessage(channelId, messageId, pinned),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: MESSAGES_KEY(vars.channelId) })
      qc.invalidateQueries({ queryKey: PINNED_KEY(vars.channelId) })
    },
  })
}
