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
  BookingDetail,
  TimelineStage,
  ItineraryDay,
  PaymentMilestone,
  AttachmentDetail,
  NoteDetail,
  ApprovalDetail,
  SupplierReferenceDetail,
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

  /**
   * GET /api/bookings/:id - Full BookingDetail payload
   */
  async getBookingDetail(id: string): Promise<BookingDetail | null> {
    try {
      const res = await api.get<BookingDetail>(`/bookings/${id}`)
      return res ?? null
    } catch {
      return buildMockBookingDetail(id)
    }
  },

  /**
   * PUT /api/bookings/:id - Partial field updates
   */
  async updateBooking(id: string, updates: Record<string, unknown>): Promise<BookingDetail | null> {
    try {
      const res = await api.put<BookingDetail>(`/bookings/${id}`, updates)
      return res ?? null
    } catch {
      const detail = buildMockBookingDetail(id)
      return detail ? { ...detail, ...updates } as BookingDetail : null
    }
  },

  /**
   * POST /api/bookings/:id/attachments
   */
  async addAttachment(id: string, file: { filename: string; url: string; type: string }): Promise<AttachmentDetail | null> {
    try {
      const res = await api.post<AttachmentDetail>(`/bookings/${id}/attachments`, file)
      return res ?? null
    } catch {
      return {
        id: `att-${Date.now()}`,
        booking_id: id,
        filename: file.filename,
        url: file.url,
        type: file.type,
        uploaded_at: new Date().toISOString(),
      }
    }
  },

  /**
   * POST /api/bookings/:id/notes
   */
  async addNote(id: string, content: string): Promise<NoteDetail | null> {
    try {
      const res = await api.post<NoteDetail>(`/bookings/${id}/notes`, { content })
      return res ?? null
    } catch {
      return {
        id: `note-${Date.now()}`,
        booking_id: id,
        author_id: 'current',
        author_name: 'Current User',
        content,
        created_at: new Date().toISOString(),
      }
    }
  },

  /**
   * POST /api/bookings/:id/tasks
   */
  async createTask(id: string, task: { title: string; due_date?: string; assignee_id?: string }): Promise<{ success: boolean }> {
    try {
      await api.post(`/bookings/${id}/tasks`, task)
      return { success: true }
    } catch {
      return { success: true }
    }
  },

  /**
   * POST /api/bookings/:id/approvals/:approvalId/action - approve, deny, or escalate
   */
  async approvalAction(
    id: string,
    approvalId: string,
    action: 'approve' | 'deny' | 'escalate',
    payload?: { comments?: string }
  ): Promise<ApprovalDetail | null> {
    try {
      const res = await api.post<ApprovalDetail>(
        `/bookings/${id}/approvals/${approvalId}/action`,
        { action, ...payload }
      )
      return res ?? null
    } catch {
      const detail = buildMockBookingDetail(id)
      const approvals = detail?.approvals ?? []
      const existing = approvals.find((a) => a.id === approvalId)
      if (existing) {
        return {
          ...existing,
          status: action === 'approve' ? 'approved' : action === 'deny' ? 'denied' : 'pending',
          history: [
            ...(existing.history ?? []),
            {
              timestamp: new Date().toISOString(),
              actor: 'Current User',
              action: action === 'approve' ? 'Approved' : action === 'deny' ? 'Denied' : 'Escalated',
            },
          ],
        }
      }
      return null
    }
  },

  /**
   * POST /api/bookings/:id/approvals
   */
  async requestApproval(id: string, payload?: { approver_id?: string }): Promise<ApprovalDetail | null> {
    try {
      const res = await api.post<ApprovalDetail>(`/bookings/${id}/approvals`, payload ?? {})
      return res ?? null
    } catch {
      return {
        id: `apr-${Date.now()}`,
        booking_id: id,
        requester_id: 'current',
        requester_name: 'Current User',
        status: 'pending',
        due_by: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    }
  },

  /**
   * GET /api/bookings/:id/payments
   */
  async getPayments(id: string): Promise<PaymentMilestone[]> {
    try {
      const res = await api.get<PaymentMilestone[] | { data?: PaymentMilestone[] }>(`/bookings/${id}/payments`)
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: PaymentMilestone[] })?.data) ? (res as { data: PaymentMilestone[] }).data : []
      return list ?? []
    } catch {
      const detail = buildMockBookingDetail(id)
      return detail?.payments ?? []
    }
  },

  /**
   * POST /api/bookings/:id/payments
   */
  async createPayment(id: string, milestone: { milestone: string; due_date: string; amount: number; currency: string }): Promise<PaymentMilestone | null> {
    try {
      const res = await api.post<PaymentMilestone>(`/bookings/${id}/payments`, milestone)
      return res ?? null
    } catch {
      return {
        id: `pay-${Date.now()}`,
        booking_id: id,
        milestone: milestone.milestone,
        due_date: milestone.due_date,
        amount: milestone.amount,
        currency: milestone.currency,
        status: 'unpaid',
      }
    }
  },

  /**
   * GET /api/bookings/:id/suppliers
   */
  async getSuppliers(id: string): Promise<SupplierReferenceDetail[]> {
    try {
      const res = await api.get<SupplierReferenceDetail[] | { data?: SupplierReferenceDetail[] }>(`/bookings/${id}/suppliers`)
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: SupplierReferenceDetail[] })?.data) ? (res as { data: SupplierReferenceDetail[] }).data : []
      return list ?? []
    } catch {
      const detail = buildMockBookingDetail(id)
      return detail?.supplier_references ?? []
    }
  },

  /**
   * GET /api/bookings/:id/itinerary
   */
  async getItinerary(id: string): Promise<ItineraryDay[]> {
    try {
      const res = await api.get<ItineraryDay[] | { data?: ItineraryDay[] }>(`/bookings/${id}/itinerary`)
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: ItineraryDay[] })?.data) ? (res as { data: ItineraryDay[] }).data : []
      return list ?? []
    } catch {
      const detail = buildMockBookingDetail(id)
      return detail?.itinerary ?? []
    }
  },

  /**
   * PUT /api/bookings/:id/timeline - Update stage date
   */
  async updateTimelineStage(id: string, stageId: string, timestamp: string): Promise<TimelineStage | null> {
    try {
      const res = await api.put<TimelineStage>(`/bookings/${id}/timeline/${stageId}`, { timestamp })
      return res ?? null
    } catch {
      return null
    }
  },
}

/** Build mock BookingDetail for local dev when API unavailable */
function buildMockBookingDetail(id: string): BookingDetail | null {
  const summary = (MOCK_BOOKINGS ?? []).find((b) => b.id === id)
  if (!summary) return null

  const timeline: TimelineStage[] = [
    { id: 't1', booking_id: id, stage: 'quote', timestamp: '2025-02-20T10:00:00Z', actor_name: 'Sarah Mitchell' },
    { id: 't2', booking_id: id, stage: 'confirmed', timestamp: '2025-02-25T14:00:00Z', actor_name: 'Sarah Mitchell' },
    { id: 't3', booking_id: id, stage: 'pre_arrival', timestamp: '2025-02-28T09:00:00Z', actor_name: 'James Chen' },
  ]

  const itinerary: ItineraryDay[] = [
    {
      id: 'i1',
      day_index: 1,
      date: summary.check_in,
      activities: [
        { id: 'a1', type: 'activity', title: 'Arrival & Check-in', time: '14:00', location: summary.resort_name },
      ],
      transfers: [
        { id: 'tr1', type: 'transfer', title: 'Airport to Resort', time: '12:00', description: 'Private car' },
      ],
    },
    {
      id: 'i2',
      day_index: 2,
      date: '2025-03-16',
      activities: [
        { id: 'a2', type: 'activity', title: 'Spa Day', time: '10:00' },
        { id: 'a3', type: 'activity', title: 'Dinner at La Terrazza', time: '19:30' },
      ],
      transfers: [],
    },
  ]

  const payments: PaymentMilestone[] = [
    { id: 'p1', booking_id: id, milestone: 'Deposit', due_date: '2025-03-01', amount: 6200, currency: summary.currency, status: summary.balance_due > 0 ? 'unpaid' : 'paid', paid_at: summary.balance_due === 0 ? '2025-02-28' : undefined },
    { id: 'p2', booking_id: id, milestone: 'Balance', due_date: '2025-03-10', amount: summary.value - 6200, currency: summary.currency, status: summary.balance_due > 0 ? 'unpaid' : 'paid' },
  ]

  const attachments: AttachmentDetail[] = [
    { id: 'att1', booking_id: id, filename: 'contract.pdf', url: '#', type: 'contract', uploaded_at: '2025-02-25T10:00:00Z', uploaded_by: 'Sarah Mitchell' },
  ]

  const notes: NoteDetail[] = [
    { id: 'n1', booking_id: id, author_id: 'a1', author_name: 'Sarah Mitchell', content: 'Client prefers early check-in if possible.', created_at: '2025-02-26T11:00:00Z' },
  ]

  const approvals: ApprovalDetail[] = summary.status === 'quote' ? [
    { id: 'apr1', booking_id: id, requester_id: 'a1', requester_name: 'Sarah Mitchell', status: 'pending', due_by: '2025-03-05T17:00:00Z' },
  ] : []

  const supplierRefs: SupplierReferenceDetail[] = [
    { id: 's1', booking_id: id, supplier_id: 'sup1', supplier_name: 'Villa Serenity Management', reference_numbers: 'VS-2025-001', contact: 'reservations@villaserenity.com' },
  ]

  const resortData = (MOCK_RESORTS ?? []).find((r) => r.id === summary.resort_id)
  return {
    id: summary.id,
    reference: summary.booking_ref,
    client_id: summary.client_id,
    client: { id: summary.client_id, name: summary.client_name },
    resort_id: summary.resort_id,
    resort: {
      id: summary.resort_id,
      name: summary.resort_name,
      location: resortData?.location,
      transfer_time_minutes: 45,
    },
    room_category: {
      id: 'rc1',
      name: 'Deluxe Suite',
      bed_config: '1 King, 1 Sofa bed',
      capacity: 4,
    },
    status: summary.status,
    room_category_id: 'rc1',
    check_in: summary.check_in,
    check_out: summary.check_out,
    total_amount: summary.value,
    outstanding_balance: summary.balance_due,
    currency: summary.currency,
    timeline,
    itinerary,
    rates: [
      { id: 'r1', name: 'Deluxe Suite', amount: summary.value, currency: summary.currency, taxes: summary.value * 0.1, fees: 0, discount: 0 },
    ],
    commission: { type: 'percentage', value: 10, calculated_commission: summary.commission, supplier_net: summary.value - summary.commission },
    payments,
    supplier_references: supplierRefs,
    attachments,
    notes,
    approvals,
    deadlines: [
      { id: 'd1', title: 'Final payment due', due_date: '2025-03-10', type: 'payment' },
    ],
  }
}
