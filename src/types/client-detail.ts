/**
 * Client Detail types - extended data for 360-degree client profile
 * All types support null-safe handling per runtime safety rules
 */

export interface ClientPreferences {
  travel?: {
    maxBudget?: number
    kidsPolicy?: string
    mealPreferences?: string[]
  }
  communication?: {
    channel?: string
    optInNewsletter?: boolean
  }
}

export interface ClientBillingDetails {
  billingContact?: string
  billingAddress?: string
  paymentMethod?: string
  taxId?: string
}

export interface ClientDetail {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  address?: string | null
  language?: string | null
  currency?: string | null
  vipFlags: string[]
  preferences: ClientPreferences | null
  billingDetails: ClientBillingDetails | null
  avatarUrl?: string | null
  lastActive: string | null
  lastContact?: string | null
  outstandingBalance?: number
  createdAt: string
  updatedAt: string
}

export interface ClientBase {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  lastActive: string | null
  createdAt: string
  updatedAt: string
}

export type DocumentType = 'passport' | 'visa' | 'other'

export interface Document {
  id: string
  clientId: string
  type: DocumentType
  fileUrl: string
  issuingCountry?: string
  expiryDate?: string
  uploadedAt: string
  scannedData?: unknown
}

export type NoteVisibility = 'private' | 'team' | 'org'

export interface Note {
  id: string
  clientId: string
  authorId: string
  authorName?: string
  content: string
  visibility: NoteVisibility
  mentions?: string[]
  createdAt: string
  updatedAt: string
}

export type CommunicationType = 'email' | 'call' | 'message'

export interface Communication {
  id: string
  clientId: string
  type: CommunicationType
  content: string
  senderId: string
  senderName?: string
  recipients: string[]
  timestamp: string
  attachments?: string[]
}

export interface BookingSummary {
  id: string
  resortId?: string
  resortName?: string
  status: string
  checkIn?: string
  checkOut?: string
  price?: number
  currency?: string
}

export interface TravelHistoryItem {
  id: string
  bookingId?: string
  resortName?: string
  checkIn?: string
  checkOut?: string
  summary?: string
}

export interface VIPFlag {
  id: string
  clientId: string
  flagName: string
  isActive: boolean
  setBy: string
  changedAt: string
}
