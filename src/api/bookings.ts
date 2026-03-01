/**
 * Bookings API - list, filter, bulk export, lifecycle, reminders, invoices
 * Uses mock data for local development; swap for Supabase/Edge Function in production
 * Runtime safety: all responses validated with nullish coalescing and Array.isArray checks
 */
import { api } from '@/lib/api'
import type {
  BookingSummary,
  Booking,
  BookingFilters,
  BookingsResponse,
  BulkExportRequest,
  BulkExportResponse,
  Agent,
  Resort,
  BookingStatus,
} from '@/types/booking'

const MOCK_AGENTS: Agent[] = [
  { id: 'a1', name: 'Sarah Mitchell' },
  { id: 'a2', name: 'James Chen' },
  { id: 'a3', name: 'Emma Laurent' },
]

const MOCK_RESORTS: Resort[] = [
  { id: 'r1', name: 'Villa Serenity', location: 'Amalfi Coast' },
  { id: 'r2', name: 'Ocean View Resort', location: 'Santorini' },
  { id: 'r3', name: 'Mountain Lodge', location: 'Swiss Alps' },
  { id: 'r4', name: 'Château des Alpes', location: 'France' },
  { id: 'r5', name: 'Palazzo Riviera', location: 'Italy' },
]

const MOCK_BOOKINGS: BookingSummary[] = [
  {
    id: 'b1',
    booking_ref: 'LF-2025-001',
    client_id: 'c1',
    client_name: 'Sarah Mitchell',
    resort_id: 'r1',
    resort_name: 'Villa Serenity',
    agent_id: 'a1',
    agent_name: 'Sarah Mitchell',
    check_in: '2025-03-15',
    check_out: '2025-03-22',
    status: 'confirmed',
    value: 12400,
    commission: 1240,
    balance_due: 0,
    currency: 'EUR',
    last_updated: '2025-02-28T10:00:00Z',
  },
  {
    id: 'b2',
    booking_ref: 'LF-2025-002',
    client_id: 'c2',
    client_name: 'James Chen',
    resort_id: 'r2',
    resort_name: 'Ocean View Resort',
    agent_id: 'a2',
    agent_name: 'James Chen',
    check_in: '2025-04-01',
    check_out: '2025-04-08',
    status: 'quote',
    value: 8200,
    commission: 820,
    balance_due: 8200,
    currency: 'EUR',
    last_updated: '2025-02-25T14:30:00Z',
  },
  {
    id: 'b3',
    booking_ref: 'LF-2025-003',
    client_id: 'c3',
    client_name: 'Emma Laurent',
    resort_id: 'r3',
    resort_name: 'Mountain Lodge',
    agent_id: 'a1',
    agent_name: 'Sarah Mitchell',
    check_in: '2025-03-08',
    check_out: '2025-03-15',
    status: 'pre_arrival',
    value: 15600,
    commission: 1560,
    balance_due: 4500,
    currency: 'EUR',
    last_updated: '2025-02-27T09:15:00Z',
  },
  {
    id: 'b4',
    booking_ref: 'LF-2025-004',
    client_id: 'c4',
    client_name: 'Sophie Müller',
    resort_id: 'r4',
    resort_name: 'Château des Alpes',
    agent_id: 'a2',
    agent_name: 'James Chen',
    check_in: '2025-03-05',
    check_out: '2025-03-12',
    status: 'in_stay',
    value: 18900,
    commission: 1890,
    balance_due: 0,
    currency: 'EUR',
    last_updated: '2025-02-26T16:00:00Z',
  },
  {
    id: 'b5',
    booking_ref: 'LF-2024-089',
    client_id: 'c5',
    client_name: 'Michael Rodriguez',
    resort_id: 'r5',
    resort_name: 'Palazzo Riviera',
    agent_id: 'a3',
    agent_name: 'Emma Laurent',
    check_in: '2025-01-10',
    check_out: '2025-01-17',
    status: 'completed',
    value: 11200,
    commission: 1120,
    balance_due: 0,
    currency: 'EUR',
    last_updated: '2025-01-18T11:00:00Z',
  },
]

/** Normalize API response - ensure arrays, safe defaults (runtime safety) */
function normalizeBookingsResponse(raw: unknown): BookingsResponse {
  const data = raw as Partial<BookingsResponse> | null | undefined
  const list = Array.isArray(data?.data) ? data.data : []
  const count = typeof data?.count === 'number' ? data.count : list.length
  return { data: list, count }
}

/** Filter and sort bookings client-side for mock; in production this would be server-side */
function filterAndSortBookings(
  bookings: BookingSummary[],
  filters: BookingFilters
): BookingsResponse {
  let result = [...(bookings ?? [])]

  const search = (filters.search ?? '').toLowerCase().trim()
  if (search) {
    result = result.filter(
      (b) =>
        (b.client_name ?? '').toLowerCase().includes(search) ||
        (b.booking_ref ?? '').toLowerCase().includes(search) ||
        (b.resort_name ?? '').toLowerCase().includes(search)
    )
  }

  if (filters.status) {
    result = result.filter((b) => b.status === filters.status)
  }
  if (filters.agent_id) {
    result = result.filter((b) => b.agent_id === filters.agent_id)
  }
  if (filters.resort_id) {
    result = result.filter((b) => b.resort_id === filters.resort_id)
  }
  if (filters.check_in_from) {
    const from = filters.check_in_from
    result = result.filter((b) => (b.check_in ?? '') >= from)
  }
  if (filters.check_in_to) {
    const to = filters.check_in_to
    result = result.filter((b) => (b.check_in ?? '') <= to)
  }
  if (typeof filters.balance_min === 'number' && filters.balance_min > 0) {
    result = result.filter((b) => (b.balance_due ?? 0) >= filters.balance_min!)
  }

  const sortField = filters.sort ?? 'last_updated'
  const sortOrder = filters.sortOrder ?? 'desc'
  const mult = sortOrder === 'asc' ? 1 : -1

  result.sort((a, b) => {
    let av: string | number | null = null
    let bv: string | number | null = null
    switch (sortField) {
      case 'check_in':
        av = a.check_in ?? ''
        bv = b.check_in ?? ''
        break
      case 'check_out':
        av = a.check_out ?? ''
        bv = b.check_out ?? ''
        break
      case 'value':
        av = a.value ?? 0
        bv = b.value ?? 0
        return mult * (Number(av) - Number(bv))
      case 'balance_due':
        av = a.balance_due ?? 0
        bv = b.balance_due ?? 0
        return mult * (Number(av) - Number(bv))
      case 'status':
        av = a.status ?? ''
        bv = b.status ?? ''
        break
      case 'last_updated':
        av = a.last_updated ?? ''
        bv = b.last_updated ?? ''
        break
      case 'booking_ref':
        av = a.booking_ref ?? ''
        bv = b.booking_ref ?? ''
        break
      default:
        av = a.last_updated ?? ''
        bv = b.last_updated ?? ''
    }
    return mult * String(av).localeCompare(String(bv))
  })

  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 50))
  const start = (page - 1) * pageSize
  const paginated = result.slice(start, start + pageSize)

  return { data: paginated, count: result.length }
}

export const bookingsApi = {
  /**
   * GET /api/bookings?filters...&page=&pageSize=&sort=
   */
  async getBookings(filters: BookingFilters = {}): Promise<BookingsResponse> {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.agent_id) params.set('agent_id', filters.agent_id)
      if (filters.resort_id) params.set('resort_id', filters.resort_id)
      if (filters.check_in_from) params.set('check_in_from', filters.check_in_from)
      if (filters.check_in_to) params.set('check_in_to', filters.check_in_to)
      if (filters.balance_min != null) params.set('balance_min', String(filters.balance_min))
      if (filters.search) params.set('search', filters.search)
      if (filters.sort) params.set('sort', filters.sort)
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder ?? 'desc')
      if (filters.page) params.set('page', String(filters.page))
      if (filters.pageSize) params.set('pageSize', String(filters.pageSize))

      const qs = params.toString()
      const res = await api.get<BookingsResponse>(`/bookings?${qs}`)
      return normalizeBookingsResponse(res)
    } catch {
      return filterAndSortBookings(MOCK_BOOKINGS, filters)
    }
  },

  /**
   * GET /api/bookings/:id
   */
  async getBooking(id: string): Promise<Booking | null> {
    try {
      const res = await api.get<Booking>(`/bookings/${id}`)
      return res ?? null
    } catch {
      const summary = (MOCK_BOOKINGS ?? []).find((b) => b.id === id)
      return summary ? { ...summary } : null
    }
  },

  /**
   * GET /api/agents
   */
  async getAgents(): Promise<Agent[]> {
    try {
      const res = await api.get<Agent[] | { data?: Agent[] }>('/agents')
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: Agent[] })?.data) ? (res as { data: Agent[] }).data : []
      return list ?? MOCK_AGENTS
    } catch {
      return MOCK_AGENTS
    }
  },

  /**
   * GET /api/resorts
   */
  async getResorts(): Promise<Resort[]> {
    try {
      const res = await api.get<Resort[] | { data?: Resort[] }>('/resorts')
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: Resort[] })?.data) ? (res as { data: Resort[] }).data : []
      return list ?? MOCK_RESORTS
    } catch {
      return MOCK_RESORTS
    }
  },

  /**
   * POST /api/bookings/export
   */
  async bulkExport(request: BulkExportRequest): Promise<BulkExportResponse> {
    try {
      const res = await api.post<BulkExportResponse>('/bookings/export', request)
      return res ?? {}
    } catch {
      return { url: undefined, status: 'completed' }
    }
  },

  /**
   * PATCH /api/bookings/:id/lifecycle
   */
  async updateLifecycle(id: string, status: BookingStatus): Promise<Booking | null> {
    try {
      const res = await api.patch<Booking>(`/bookings/${id}/lifecycle`, { status })
      return res ?? null
    } catch {
      const idx = (MOCK_BOOKINGS ?? []).findIndex((b) => b.id === id)
      if (idx >= 0 && MOCK_BOOKINGS[idx]) {
        const updated = { ...MOCK_BOOKINGS[idx]!, status }
        MOCK_BOOKINGS[idx] = updated
        return updated as Booking
      }
      return null
    }
  },

  /**
   * POST /api/bookings/:id/reminder
   */
  async sendReminder(id: string): Promise<{ success: boolean }> {
    try {
      await api.post(`/bookings/${id}/reminder`, {})
      return { success: true }
    } catch {
      return { success: false }
    }
  },

  /**
   * POST /api/bookings/:id/invoice
   */
  async createInvoice(id: string): Promise<{ success: boolean; invoice_id?: string }> {
    try {
      const res = await api.post<{ invoice_id?: string }>(`/bookings/${id}/invoice`, {})
      return { success: true, invoice_id: res?.invoice_id }
    } catch {
      return { success: false }
    }
  },
}
