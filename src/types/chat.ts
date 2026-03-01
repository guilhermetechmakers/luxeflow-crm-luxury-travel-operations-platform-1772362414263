/**
 * Team Chat types for LuxeFlow CRM
 * Runtime safety: all arrays use optional chaining and defaults
 */

export interface ChatUser {
  id: string
  name: string
  avatarUrl?: string | null
  role?: string
  permissions?: string[]
}

export interface Channel {
  id: string
  name: string
  isDirect: boolean
  memberIds: string[]
  createdAt: string
  lastMessageAt?: string
  unreadCount?: number
}

export interface ChatAttachment {
  id: string
  messageId: string
  filename: string
  url: string
  mimeType: string
  size: number
  uploadedAt: string
}

export interface ChatMessage {
  id: string
  channelId: string
  senderId: string
  content: string
  createdAt: string
  attachments: ChatAttachment[]
  linkedBookingId?: string | null
  linkedClientId?: string | null
  mentions: string[]
  pinned?: boolean
  reactions?: Record<string, string[]>
}

export interface ChannelsResponse {
  data: Channel[]
  count: number
}

export interface MessagesResponse {
  data: ChatMessage[]
  count: number
}

export interface MessageCreatePayload {
  channelId: string
  content: string
  linkedBookingId?: string
  linkedClientId?: string
  mentions?: string[]
  attachmentIds?: string[]
}

export interface NoteFromMessage {
  id: string
  content: string
  relatedMessageId: string
  createdAt: string
}
