/**
 * Booking Wizard API - resorts, rates, create/update booking
 * Runtime safety: all responses validated with nullish coalescing and Array.isArray checks
 */
import { api } from '@/lib/api'
import { bookingsApi } from '@/api/bookings'
import { clientsApi } from '@/api/clients'
import type {
  ResortBibleItem,
  RatePlan,
  CommissionModel,
  BookingDraft,
  BookingDetail,
} from '@/types/booking'
import type { Client } from '@/types/client'

const MOCK_RESORTS: ResortBibleItem[] = [
  {
    id: 'r1',
    name: 'Villa Serenity',
    location: 'Amalfi Coast',
    transfer_time_minutes: 45,
    transfer_time: '45 min',
    kids_policy: 'All ages welcome',
    beach_proximity: 'Beachfront',
    capacity: 8,
    image_url: undefined,
    tags: ['Family', 'Beach', 'Luxury'],
    room_types: [
      { id: 'rc1', name: 'Deluxe Suite', bed_config: '1 King, 1 Sofa', capacity: 4 },
      { id: 'rc2', name: 'Ocean View Villa', bed_config: '2 King', capacity: 6 },
    ],
  },
  {
    id: 'r2',
    name: 'Ocean View Resort',
    location: 'Santorini',
    transfer_time_minutes: 25,
    transfer_time: '25 min',
    kids_policy: '12+ only',
    beach_proximity: 'Cliffside',
    capacity: 4,
    image_url: undefined,
    tags: ['Luxury', 'Spa', 'Romantic'],
    room_types: [
      { id: 'rc3', name: 'Infinity Suite', bed_config: '1 King', capacity: 2 },
      { id: 'rc4', name: 'Cave Suite', bed_config: '1 King', capacity: 2 },
    ],
  },
  {
    id: 'r3',
    name: 'Mountain Lodge',
    location: 'Swiss Alps',
    transfer_time_minutes: 60,
    transfer_time: '60 min',
    kids_policy: 'All ages',
    beach_proximity: 'N/A',
    capacity: 6,
    image_url: undefined,
    tags: ['Ski', 'Wellness', 'Family'],
    room_types: [
      { id: 'rc5', name: 'Alpine Chalet', bed_config: '2 King, 2 Twin', capacity: 6 },
    ],
  },
]

const MOCK_RATE_PLANS: RatePlan[] = [
  { id: 'rp1', name: 'Bed & Breakfast', amount: 450, currency: 'EUR', taxes: 45, fees: 0, discount: 0 },
  { id: 'rp2', name: 'Half Board', amount: 620, currency: 'EUR', taxes: 62, fees: 0, discount: 0 },
  { id: 'rp3', name: 'All Inclusive', amount: 890, currency: 'EUR', taxes: 89, fees: 0, discount: 0 },
]

function getClientName(c: Client): string {
  return `${c?.firstName ?? ''} ${c?.lastName ?? ''}`.trim() || 'Unknown'
}

export const wizardApi = {
  /**
   * Search resorts with filters (Resort Bible)
   */
  async searchResorts(params: {
    query?: string
    kids_policy?: string
    transfer_max_minutes?: number
    location?: string
    beach_proximity?: string
  }): Promise<ResortBibleItem[]> {
    try {
      const qs = new URLSearchParams()
      if (params.query) qs.set('query', params.query)
      if (params.kids_policy) qs.set('kids_policy', params.kids_policy)
      if (params.transfer_max_minutes != null) qs.set('transfer_max', String(params.transfer_max_minutes))
      if (params.location) qs.set('location', params.location)
      if (params.beach_proximity) qs.set('beach_proximity', params.beach_proximity)
      const res = await api.get<ResortBibleItem[] | { data?: ResortBibleItem[] }>(`/resorts?${qs.toString()}`)
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: ResortBibleItem[] })?.data) ? (res as { data: ResortBibleItem[] }).data : []
      return list ?? MOCK_RESORTS
    } catch {
      const q = (params.query ?? '').toLowerCase().trim()
      let result = [...(MOCK_RESORTS ?? [])]
      if (q) {
        result = result.filter(
          (r) =>
            (r.name ?? '').toLowerCase().includes(q) ||
            (r.location ?? '').toLowerCase().includes(q) ||
            (r.tags ?? []).some((t) => t.toLowerCase().includes(q))
        )
      }
      return result ?? []
    }
  },

  /**
   * Get resort details with room categories
   */
  async getResortDetails(id: string): Promise<ResortBibleItem | null> {
    try {
      const res = await api.get<ResortBibleItem>(`/resorts/${id}`)
      return res ?? null
    } catch {
      return (MOCK_RESORTS ?? []).find((r) => r.id === id) ?? null
    }
  },

  /**
   * List rate plans for resort/room
   */
  async listRatePlans(resortId?: string, roomCategoryId?: string): Promise<RatePlan[]> {
    try {
      const qs = new URLSearchParams()
      if (resortId) qs.set('resort_id', resortId)
      if (roomCategoryId) qs.set('room_category_id', roomCategoryId)
      const res = await api.get<RatePlan[] | { data?: RatePlan[] }>(`/rates?${qs.toString()}`)
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: RatePlan[] })?.data) ? (res as { data: RatePlan[] }).data : []
      return list ?? MOCK_RATE_PLANS
    } catch {
      return MOCK_RATE_PLANS ?? []
    }
  },

  /**
   * Calculate commission for a given amount and model
   */
  calculateCommission(
    amount: number,
    model: { type: 'percentage' | 'fixed' | 'tiered'; value: number }
  ): CommissionModel {
    let calculated = 0
    if (model.type === 'percentage') {
      calculated = (amount * (model.value ?? 0)) / 100
    } else if (model.type === 'fixed') {
      calculated = model.value ?? 0
    } else if (model.type === 'tiered') {
      calculated = (amount * (model.value ?? 10)) / 100
    }
    return {
      type: model.type,
      value: model.value,
      calculated_commission: calculated,
      supplier_net: amount - calculated,
    }
  },

  /**
   * Search clients for wizard
   */
  async searchClients(query: string): Promise<{ id: string; name: string; email?: string; phone?: string }[]> {
    const q = (query ?? '').trim()
    if (!q) return []
    const { data } = await clientsApi.getClients({ search: q, limit: 10 })
    return (data ?? []).map((c) => ({
      id: c.id,
      name: getClientName(c),
      email: c.email ?? undefined,
      phone: c.phone ?? undefined,
    }))
  },

  /**
   * Create booking (draft, quote, or confirmed)
   */
  async createBooking(
    draft: BookingDraft,
    action: 'draft' | 'quote' | 'confirmed'
  ): Promise<BookingDetail | null> {
    try {
      const res = await api.post<BookingDetail>('/bookings', { ...draft, action })
      return res ?? null
    } catch {
      const id = `b${Date.now()}`
      const total = draft.total_amount ?? draft.rate_plan?.amount ?? 0
      const commission = draft.commission_model ?? {
        type: 'percentage' as const,
        value: 10,
        calculated_commission: total * 0.1,
        supplier_net: total * 0.9,
      }
      return {
        id,
        reference: `LF-${new Date().getFullYear()}-${String(id).slice(-3)}`,
        client_id: draft.client_id ?? '',
        client: draft.client ? { id: draft.client.id ?? '', name: 'firstName' in draft.client ? `${(draft.client as { firstName?: string }).firstName ?? ''} ${(draft.client as { lastName?: string }).lastName ?? ''}`.trim() : (draft.client as { name?: string }).name ?? '' } : undefined,
        resort_id: draft.resort_id ?? '',
        resort: draft.resort ? { id: draft.resort.id, name: draft.resort.name, location: draft.resort.location, transfer_time_minutes: draft.resort.transfer_time_minutes } : undefined,
        room_category_id: draft.room_category_id,
        room_category: draft.room_category ?? undefined,
        status: action === 'confirmed' ? 'confirmed' : action === 'quote' ? 'quote' : 'quote',
        check_in: draft.check_in ?? '',
        check_out: draft.check_out ?? '',
        total_amount: total,
        outstanding_balance: total,
        currency: draft.currency ?? 'EUR',
        rates: draft.rate_plan ? [draft.rate_plan] : [],
        commission,
        payments: (draft.payment_schedule ?? []).map((p, i) => ({
          id: `p${i}`,
          booking_id: id,
          milestone: p.milestone,
          due_date: p.due_date,
          amount: p.amount,
          currency: p.currency,
          status: (p.status ?? 'unpaid') as 'paid' | 'unpaid' | 'overdue',
        })),
        supplier_references: (draft.supplier_references ?? []).map((s, i) => ({
          id: `s${i}`,
          booking_id: id,
          supplier_id: s.supplier_name,
          supplier_name: s.supplier_name,
          reference_numbers: s.reference_code,
          contact: s.contact,
        })),
        attachments: (draft.attachments ?? []).map((a, i) => ({
          id: `att${i}`,
          booking_id: id,
          filename: a.filename,
          url: a.url,
          type: a.type,
          uploaded_at: new Date().toISOString(),
        })),
        itinerary: draft.itinerary ?? [],
      }
    }
  },

  /**
   * Update booking
   */
  async updateBooking(id: string, draft: Partial<BookingDraft>): Promise<BookingDetail | null> {
    return bookingsApi.updateBooking(id, draft as Record<string, unknown>)
  },

  /**
   * Get booking for edit
   */
  async getBookingForEdit(id: string): Promise<BookingDetail | null> {
    return bookingsApi.getBookingDetail(id)
  },
}
