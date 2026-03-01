/**
 * Client Detail API - documents, notes, communications, bookings, VIP flags
 * Uses mock data for local development; swap for Supabase/Edge Function in production
 */
import { api } from '@/lib/api'
import { clientsApi } from '@/api/clients'
import type {
  ClientDetail,
  Document,
  Note,
  Communication,
  BookingSummary,
  TravelHistoryItem,
  VIPFlag,
  NoteVisibility,
  DocumentType,
} from '@/types/client-detail'

/** Normalize array response - runtime safety */
function normalizeArray<T>(raw: unknown): T[] {
  const arr = raw as T[] | { data?: T[] } | null | undefined
  if (Array.isArray(arr)) return arr
  if (arr && Array.isArray((arr as { data?: T[] }).data)) return (arr as { data: T[] }).data
  return []
}

/** Build ClientDetail from base Client + extended data */
function buildClientDetail(
  base: { id: string; firstName: string; lastName: string; email: string | null; phone: string | null; lastActive: string | null; lastContact?: string | null; outstandingBalance?: number; avatarUrl?: string | null; createdAt: string; updatedAt: string } | null,
  extended: Partial<ClientDetail>
): ClientDetail | null {
  if (!base) return null
  return {
    id: base.id,
    firstName: base.firstName,
    lastName: base.lastName,
    email: base.email,
    phone: base.phone,
    address: extended.address ?? null,
    language: extended.language ?? null,
    currency: extended.currency ?? 'EUR',
    vipFlags: extended.vipFlags ?? [],
    preferences: extended.preferences ?? null,
    billingDetails: extended.billingDetails ?? null,
    avatarUrl: base.avatarUrl ?? null,
    lastActive: base.lastActive,
    lastContact: base.lastContact ?? null,
    outstandingBalance: base.outstandingBalance ?? 0,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  }
}

/** Mock extended data per client */
const MOCK_EXTENDED: Record<string, Partial<ClientDetail>> = {
  c1: {
    address: '123 Park Avenue, New York, NY 10028',
    language: 'en',
    currency: 'USD',
    vipFlags: ['vip', 'preferred'],
    preferences: {
      travel: { maxBudget: 50000, kidsPolicy: 'no', mealPreferences: ['vegetarian', 'gluten-free'] },
      communication: { channel: 'email', optInNewsletter: true },
    },
    billingDetails: {
      billingContact: 'Sarah Mitchell',
      billingAddress: '123 Park Avenue, New York, NY 10028',
      paymentMethod: 'Amex',
      taxId: undefined,
    },
  },
  c2: {
    address: '45 Kensington High Street, London W8 5ED',
    language: 'en',
    currency: 'GBP',
    vipFlags: [],
    preferences: { travel: { maxBudget: 25000 }, communication: { channel: 'phone' } },
    billingDetails: { billingContact: 'James Chen', paymentMethod: 'Visa' },
  },
  c3: {
    address: '12 Rue de Rivoli, 75001 Paris',
    language: 'fr',
    currency: 'EUR',
    vipFlags: ['vip'],
    preferences: { travel: { mealPreferences: ['halal'] }, communication: { optInNewsletter: false } },
    billingDetails: { billingContact: 'Emma Laurent', paymentMethod: 'Mastercard' },
  },
  c4: {
    address: null,
    language: 'de',
    currency: 'EUR',
    vipFlags: ['vip'],
    preferences: null,
    billingDetails: { billingContact: 'Sophie Müller' },
  },
  c5: {
    address: null,
    language: 'es',
    currency: 'EUR',
    vipFlags: [],
    preferences: null,
    billingDetails: null,
  },
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'd1',
    clientId: 'c1',
    type: 'passport',
    fileUrl: '/placeholder.pdf',
    issuingCountry: 'US',
    expiryDate: '2028-03-15',
    uploadedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'd2',
    clientId: 'c1',
    type: 'visa',
    fileUrl: '/placeholder.pdf',
    issuingCountry: 'Schengen',
    expiryDate: '2025-06-30',
    uploadedAt: '2024-06-01T14:00:00Z',
  },
]

const MOCK_NOTES: Note[] = [
  {
    id: 'n1',
    clientId: 'c1',
    authorId: 'u1',
    authorName: 'Agent Smith',
    content: 'VIP - prefers ocean view. Helicopter transfer requested for next trip.',
    visibility: 'team',
    mentions: [],
    createdAt: '2025-02-28T10:00:00Z',
    updatedAt: '2025-02-28T10:00:00Z',
  },
]

const MOCK_COMMUNICATIONS: Communication[] = [
  {
    id: 'com1',
    clientId: 'c1',
    type: 'email',
    content: 'Re: Villa Serenity booking confirmation',
    senderId: 'u1',
    senderName: 'Agent Smith',
    recipients: ['sarah@example.com'],
    timestamp: '2025-02-28T10:00:00Z',
    attachments: [],
  },
  {
    id: 'com2',
    clientId: 'c1',
    type: 'call',
    content: 'Discussed upgrade options for March trip',
    senderId: 'u1',
    senderName: 'Agent Smith',
    recipients: [],
    timestamp: '2025-02-27T15:30:00Z',
  },
]

function getMockBookings(clientId: string): BookingSummary[] {
  const all: BookingSummary[] = [
    {
      id: 'b1',
      resortId: 'r1',
      resortName: 'Villa Serenity',
      status: 'confirmed',
      checkIn: '2025-03-15',
      checkOut: '2025-03-22',
      price: 12400,
      currency: 'EUR',
    },
    {
      id: 'b2',
      resortId: 'r2',
      resortName: 'Mountain Lodge',
      status: 'completed',
      checkIn: '2024-12-20',
      checkOut: '2024-12-25',
      price: 8200,
      currency: 'EUR',
    },
  ]
  return ['c1', 'c2', 'c3'].includes(clientId) ? all : []
}

const MOCK_TRAVEL_HISTORY: TravelHistoryItem[] = [
  {
    id: 'th1',
    bookingId: 'b0',
    resortName: 'Aman Sveti Stefan',
    checkIn: '2024-08-10',
    checkOut: '2024-08-17',
    summary: '7-night stay, sea view suite',
  },
]

const MOCK_VIP_FLAGS: VIPFlag[] = [
  { id: 'vf1', clientId: 'c1', flagName: 'vip', isActive: true, setBy: 'admin', changedAt: '2024-01-15T00:00:00Z' },
  { id: 'vf2', clientId: 'c1', flagName: 'preferred', isActive: true, setBy: 'admin', changedAt: '2024-06-01T00:00:00Z' },
]

export const clientDetailApi = {
  /** GET /clients/:clientId - full client detail */
  async getClientDetail(clientId: string): Promise<ClientDetail | null> {
    try {
      const res = await api.get<ClientDetail>(`/clients/${clientId}`)
      if (res) return res
    } catch {
      // fallback to mock
    }
    const base = await clientsApi.getClient(clientId)
    const extended = MOCK_EXTENDED[clientId ?? ''] ?? {}
    return buildClientDetail(base, extended)
  },

  /** GET /clients/:clientId/documents */
  async getDocuments(clientId: string): Promise<Document[]> {
    try {
      const res = await api.get<Document[] | { data?: Document[] }>(`/clients/${clientId}/documents`)
      return normalizeArray<Document>(res)
    } catch {
      return (MOCK_DOCUMENTS ?? []).filter((d) => d.clientId === clientId)
    }
  },

  /** POST /clients/:clientId/documents */
  async uploadDocument(
    clientId: string,
    payload: { type: DocumentType; fileUrl: string; issuingCountry?: string; expiryDate?: string }
  ): Promise<Document> {
    try {
      const res = await api.post<Document>(`/clients/${clientId}/documents`, payload)
      return res as Document
    } catch {
      const doc: Document = {
        id: `d-${Date.now()}`,
        clientId,
        type: payload.type,
        fileUrl: payload.fileUrl,
        issuingCountry: payload.issuingCountry,
        expiryDate: payload.expiryDate,
        uploadedAt: new Date().toISOString(),
      }
      return doc
    }
  },

  /** GET /clients/:clientId/notes */
  async getNotes(clientId: string): Promise<Note[]> {
    try {
      const res = await api.get<Note[] | { data?: Note[] }>(`/clients/${clientId}/notes`)
      return normalizeArray<Note>(res)
    } catch {
      return (MOCK_NOTES ?? []).filter((n) => n.clientId === clientId)
    }
  },

  /** POST /clients/:clientId/notes */
  async createNote(
    clientId: string,
    payload: { content: string; visibility: NoteVisibility; mentions?: string[] }
  ): Promise<Note> {
    try {
      const res = await api.post<Note>(`/clients/${clientId}/notes`, payload)
      return res as Note
    } catch {
      return {
        id: `n-${Date.now()}`,
        clientId,
        authorId: 'current',
        authorName: 'Current User',
        content: payload.content,
        visibility: payload.visibility,
        mentions: payload.mentions ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
  },

  /** GET /clients/:clientId/communications */
  async getCommunications(clientId: string): Promise<Communication[]> {
    try {
      const res = await api.get<Communication[] | { data?: Communication[] }>(
        `/clients/${clientId}/communications`
      )
      return normalizeArray<Communication>(res)
    } catch {
      return (MOCK_COMMUNICATIONS ?? []).filter((c) => c.clientId === clientId)
    }
  },

  /** GET /clients/:clientId/bookings */
  async getBookings(clientId: string): Promise<BookingSummary[]> {
    try {
      const res = await api.get<BookingSummary[] | { data?: BookingSummary[] }>(
        `/clients/${clientId}/bookings`
      )
      return normalizeArray<BookingSummary>(res)
    } catch {
      return getMockBookings(clientId)
    }
  },

  /** GET /clients/:clientId/travel-history */
  async getTravelHistory(clientId: string): Promise<TravelHistoryItem[]> {
    try {
      const res = await api.get<TravelHistoryItem[] | { data?: TravelHistoryItem[] }>(
        `/clients/${clientId}/travel-history`
      )
      return normalizeArray<TravelHistoryItem>(res)
    } catch {
      return ['c1', 'c2', 'c3'].includes(clientId) ? [...(MOCK_TRAVEL_HISTORY ?? [])] : []
    }
  },

  /** GET /clients/:clientId/vip-flags */
  async getVipFlags(clientId: string): Promise<VIPFlag[]> {
    try {
      const res = await api.get<VIPFlag[] | { data?: VIPFlag[] }>(`/clients/${clientId}/vip-flags`)
      return normalizeArray<VIPFlag>(res)
    } catch {
      return (MOCK_VIP_FLAGS ?? []).filter((v) => v.clientId === clientId)
    }
  },

  /** PATCH /clients/:clientId/vip-flags */
  async updateVipFlags(clientId: string, flags: { flagName: string; isActive: boolean }[]): Promise<VIPFlag[]> {
    try {
      const res = await api.patch<VIPFlag[]>(`/clients/${clientId}/vip-flags`, { flags })
      return Array.isArray(res) ? res : []
    } catch {
      return (MOCK_VIP_FLAGS ?? []).filter((v) => v.clientId === clientId)
    }
  },
}
