/**
 * User Profile types for LuxeFlow CRM
 * Profile, tokens, sessions, notifications, 2FA
 */

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  locale: string
  timeZone: string
  is2faEnabled: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  active: boolean
}

export interface ApiToken {
  id: string
  userId: string
  name: string
  scopes: string[]
  createdAt: string
  expiresAt?: string
  revoked: boolean
}

export interface UserSession {
  id: string
  userId: string
  deviceName: string
  ipAddress: string
  lastUsedAt: string
  isCurrent: boolean
}

/** Alias for API compatibility */
export type Session = UserSession

export type NotificationChannel = 'email' | 'sms' | 'in_app'

export type NotificationEvent =
  | 'booking_created'
  | 'booking_updated'
  | 'booking_cancelled'
  | 'payment_due'
  | 'payment_received'
  | 'system_alert'
  | 'personal_message'

export interface NotificationSettings {
  channels: Record<NotificationChannel, boolean>
  events: Record<NotificationEvent, NotificationChannel[]>
}

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEvent, string> = {
  booking_created: 'Booking created',
  booking_updated: 'Booking updated',
  booking_cancelled: 'Booking cancelled',
  payment_due: 'Payment due',
  payment_received: 'Payment received',
  system_alert: 'System alerts',
  personal_message: 'Personal messages',
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  channels: {
    email: true,
    sms: false,
    in_app: true,
  },
  events: {
    booking_created: ['email', 'in_app'],
    booking_updated: ['email', 'in_app'],
    booking_cancelled: ['email', 'in_app'],
    payment_due: ['email', 'in_app'],
    payment_received: ['email', 'in_app'],
    system_alert: ['email', 'in_app'],
    personal_message: ['email', 'in_app'],
  },
}

export interface SsoConnection {
  provider: string
  ssoId: string
  isActive: boolean
  lastUsed?: string
}

export const TOKEN_SCOPES = [
  { id: 'read:bookings', label: 'Read bookings' },
  { id: 'write:bookings', label: 'Write bookings' },
  { id: 'read:clients', label: 'Read clients' },
  { id: 'write:clients', label: 'Write clients' },
  { id: 'read:resorts', label: 'Read resorts' },
  { id: 'admin', label: 'Admin access' },
] as const

export const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
]

export const TIME_ZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
]
