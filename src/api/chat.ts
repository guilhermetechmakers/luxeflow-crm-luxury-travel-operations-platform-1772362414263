/**
 * Team Chat API - channels, messages, attachments, search
 * Uses mock data for local development; swap for Supabase/Edge Function in production
 * Runtime safety: all responses validated with nullish coalescing and Array.isArray checks
 */
import { api } from '@/lib/api'
import type {
  Channel,
  ChatMessage,
  ChatUser,
  ChatAttachment,
  ChannelsResponse,
  MessagesResponse,
  MessageCreatePayload,
  NoteFromMessage,
} from '@/types/chat'
import type { TaskCreatePayload } from '@/types/task'

const MOCK_USERS: ChatUser[] = [
  { id: 'a1', name: 'Sarah Mitchell', avatarUrl: null, role: 'agent' },
  { id: 'a2', name: 'James Chen', avatarUrl: null, role: 'agent' },
  { id: 'a3', name: 'Emma Laurent', avatarUrl: null, role: 'ops' },
]

const MOCK_CHANNELS: Channel[] = [
  {
    id: 'ch1',
    name: 'General',
    isDirect: false,
    memberIds: ['a1', 'a2', 'a3'],
    createdAt: '2025-01-01T00:00:00Z',
    lastMessageAt: '2025-03-01T10:30:00Z',
    unreadCount: 0,
  },
  {
    id: 'ch2',
    name: 'Bookings',
    isDirect: false,
    memberIds: ['a1', 'a2', 'a3'],
    createdAt: '2025-01-02T00:00:00Z',
    lastMessageAt: '2025-02-28T14:00:00Z',
    unreadCount: 2,
  },
  {
    id: 'ch3',
    name: 'Ops',
    isDirect: false,
    memberIds: ['a1', 'a2', 'a3'],
    createdAt: '2025-01-03T00:00:00Z',
    lastMessageAt: '2025-02-27T09:00:00Z',
    unreadCount: 0,
  },
  {
    id: 'dm1',
    name: 'Sarah Mitchell',
    isDirect: true,
    memberIds: ['a1', 'a2'],
    createdAt: '2025-02-20T00:00:00Z',
    lastMessageAt: '2025-03-01T09:15:00Z',
    unreadCount: 0,
  },
  {
    id: 'dm2',
    name: 'James Chen',
    isDirect: true,
    memberIds: ['a1', 'a3'],
    createdAt: '2025-02-22T00:00:00Z',
    lastMessageAt: '2025-02-28T16:00:00Z',
    unreadCount: 0,
  },
]

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    channelId: 'ch1',
    senderId: 'a1',
    content: 'Welcome to the General channel! Use @mention for teammates and link bookings/clients for context.',
    createdAt: '2025-03-01T08:00:00Z',
    attachments: [],
    mentions: [],
    pinned: true,
  },
  {
    id: 'm2',
    channelId: 'ch1',
    senderId: 'a2',
    content: 'Thanks @Sarah Mitchell! Quick question about LF-2025-002 - has the client confirmed the dates?',
    createdAt: '2025-03-01T09:15:00Z',
    attachments: [],
    linkedBookingId: 'b2',
    linkedClientId: 'c2',
    mentions: ['a1'],
  },
  {
    id: 'm3',
    channelId: 'ch1',
    senderId: 'a1',
    content: 'Yes, James Chen confirmed yesterday. I\'ve updated the booking status.',
    createdAt: '2025-03-01T10:30:00Z',
    attachments: [],
    linkedClientId: 'c2',
    mentions: [],
  },
  {
    id: 'm4',
    channelId: 'ch2',
    senderId: 'a3',
    content: 'Pre-arrival checklist for Villa Serenity - LF-2025-001',
    createdAt: '2025-02-28T14:00:00Z',
    attachments: [
      {
        id: 'att1',
        messageId: 'm4',
        filename: 'checklist.pdf',
        url: '#',
        mimeType: 'application/pdf',
        size: 245000,
        uploadedAt: '2025-02-28T14:00:00Z',
      },
    ],
    linkedBookingId: 'b1',
    mentions: [],
  },
]

function normalizeChannelsResponse(raw: unknown): ChannelsResponse {
  const data = raw as Partial<ChannelsResponse> | null | undefined
  const list = Array.isArray(data?.data) ? data.data : []
  const count = typeof data?.count === 'number' ? data.count : list.length
  return { data: list, count }
}

function normalizeMessagesResponse(raw: unknown): MessagesResponse {
  const data = raw as Partial<MessagesResponse> | null | undefined
  const list = Array.isArray(data?.data) ? data.data : []
  const count = typeof data?.count === 'number' ? data.count : list.length
  return { data: list, count }
}

export const chatApi = {
  /** GET /api/channels?userId= */
  async getChannels(userId?: string): Promise<ChannelsResponse> {
    try {
      const qs = userId ? `?userId=${encodeURIComponent(userId)}` : ''
      const res = await api.get<ChannelsResponse>(`/channels${qs}`)
      return normalizeChannelsResponse(res)
    } catch {
      return { data: MOCK_CHANNELS ?? [], count: (MOCK_CHANNELS ?? []).length }
    }
  },

  /** POST /api/channels */
  async createChannel(payload: { name: string; isDirect?: boolean; memberIds?: string[] }): Promise<Channel | null> {
    try {
      const res = await api.post<Channel>('/channels', payload)
      return res ?? null
    } catch {
      const ch: Channel = {
        id: `ch-${Date.now()}`,
        name: payload.name,
        isDirect: payload.isDirect ?? false,
        memberIds: payload.memberIds ?? [],
        createdAt: new Date().toISOString(),
      }
      MOCK_CHANNELS.push(ch)
      return ch
    }
  },

  /** GET /api/messages?channelId=&limit=&offset= */
  async getMessages(channelId: string, limit = 100, offset = 0): Promise<MessagesResponse> {
    try {
      const params = new URLSearchParams()
      params.set('channelId', channelId)
      params.set('limit', String(limit))
      params.set('offset', String(offset))
      const res = await api.get<MessagesResponse>(`/messages?${params.toString()}`)
      return normalizeMessagesResponse(res)
    } catch {
      const filtered = (MOCK_MESSAGES ?? []).filter((m) => m.channelId === channelId)
      const paginated = filtered.slice(offset, offset + limit)
      return { data: paginated, count: filtered.length }
    }
  },

  /** POST /api/messages */
  async sendMessage(payload: MessageCreatePayload): Promise<ChatMessage | null> {
    try {
      const res = await api.post<ChatMessage>('/messages', payload)
      return res ?? null
    } catch {
      const msg: ChatMessage = {
        id: `m-${Date.now()}`,
        channelId: payload.channelId,
        senderId: 'a1',
        content: payload.content,
        createdAt: new Date().toISOString(),
        attachments: [],
        linkedBookingId: payload.linkedBookingId,
        linkedClientId: payload.linkedClientId,
        mentions: payload.mentions ?? [],
      }
      MOCK_MESSAGES.push(msg)
      return msg
    }
  },

  /** POST /api/messages/:id/attachments */
  async attachFile(messageId: string, file: { filename: string; url: string; mimeType: string; size: number }): Promise<ChatAttachment | null> {
    try {
      const res = await api.post<ChatAttachment>(`/messages/${messageId}/attachments`, file)
      return res ?? null
    } catch {
      const att: ChatAttachment = {
        id: `att-${Date.now()}`,
        messageId,
        filename: file.filename,
        url: file.url,
        mimeType: file.mimeType,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }
      const msg = (MOCK_MESSAGES ?? []).find((m) => m.id === messageId)
      if (msg) msg.attachments = [...(msg.attachments ?? []), att]
      return att
    }
  },

  /** POST /api/messages/:id/create-task */
  async createTaskFromMessage(messageId: string, payload: TaskCreatePayload): Promise<{ id: string } | null> {
    try {
      const res = await api.post<{ id: string }>(`/messages/${messageId}/create-task`, payload)
      return res ?? null
    } catch {
      return { id: `t-${Date.now()}` }
    }
  },

  /** POST /api/messages/:id/convert-to-note */
  async convertToNote(messageId: string, content?: string): Promise<NoteFromMessage | null> {
    try {
      const res = await api.post<NoteFromMessage>(`/messages/${messageId}/convert-to-note`, { content })
      return res ?? null
    } catch {
      const msg = (MOCK_MESSAGES ?? []).find((m) => m.id === messageId)
      return {
        id: `note-${Date.now()}`,
        content: content ?? msg?.content ?? '',
        relatedMessageId: messageId,
        createdAt: new Date().toISOString(),
      }
    }
  },

  /** GET /api/users - all users for DM list */
  async getUsers(): Promise<ChatUser[]> {
    try {
      const res = await api.get<ChatUser[] | { data?: ChatUser[] }>('/users')
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: ChatUser[] })?.data) ? (res as { data: ChatUser[] }).data : []
      return list ?? []
    } catch {
      return MOCK_USERS ?? []
    }
  },

  /** GET /api/users?query= */
  async searchUsers(query: string): Promise<ChatUser[]> {
    try {
      const res = await api.get<ChatUser[] | { data?: ChatUser[] }>(`/users?query=${encodeURIComponent(query)}`)
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: ChatUser[] })?.data) ? (res as { data: ChatUser[] }).data : []
      return list ?? []
    } catch {
      const q = (query ?? '').toLowerCase().trim()
      if (!q) return MOCK_USERS ?? []
      return (MOCK_USERS ?? []).filter((u) => (u.name ?? '').toLowerCase().includes(q)).slice(0, 10)
    }
  },

  /** GET /api/messages/search?q=&scope= */
  async searchMessages(q: string, scope?: 'messages' | 'attachments' | 'linked'): Promise<ChatMessage[]> {
    try {
      const params = new URLSearchParams({ q })
      if (scope) params.set('scope', scope)
      const res = await api.get<ChatMessage[] | { data?: ChatMessage[] }>(`/messages/search?${params.toString()}`)
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: ChatMessage[] })?.data) ? (res as { data: ChatMessage[] }).data : []
      return list ?? []
    } catch {
      const search = (q ?? '').toLowerCase().trim()
      if (!search) return []
      return (MOCK_MESSAGES ?? []).filter(
        (m) =>
          (m.content ?? '').toLowerCase().includes(search) ||
          (m.attachments ?? []).some((a) => (a.filename ?? '').toLowerCase().includes(search))
      )
    }
  },

  /** PATCH /api/channels/:id/pin - toggle pin on message */
  async togglePinMessage(channelId: string, messageId: string, pinned: boolean): Promise<boolean> {
    try {
      await api.patch(`/channels/${channelId}/messages/${messageId}/pin`, { pinned })
      return true
    } catch {
      const msg = (MOCK_MESSAGES ?? []).find((m) => m.id === messageId && m.channelId === channelId)
      if (msg) msg.pinned = pinned
      return true
    }
  },

  /** GET /api/channels/:id/pinned */
  async getPinnedMessages(channelId: string): Promise<ChatMessage[]> {
    try {
      const res = await api.get<ChatMessage[] | { data?: ChatMessage[] }>(`/channels/${channelId}/pinned`)
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: ChatMessage[] })?.data) ? (res as { data: ChatMessage[] }).data : []
      return list ?? []
    } catch {
      return (MOCK_MESSAGES ?? []).filter((m) => m.channelId === channelId && m.pinned)
    }
  },
}
