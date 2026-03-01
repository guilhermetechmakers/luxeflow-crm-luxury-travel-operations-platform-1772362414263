/**
 * Booking utilities - SafeArrayOps, DataValidators, ConflictChecker
 * Runtime safety: guard all array operations, validate inputs, detect conflicts
 */
import type { BookingDetail, ItineraryDay, CommissionModel } from '@/types/booking'

/** Safe array operations - guard against null/undefined */
export const SafeArrayOps = {
  /** Return array or empty array */
  ensure<T>(value: T[] | null | undefined): T[] {
    return Array.isArray(value) ? value : []
  },

  /** Map with null safety */
  map<T, U>(items: T[] | null | undefined, fn: (item: T) => U): U[] {
    const arr = Array.isArray(items) ? items : []
    return arr.map(fn)
  },

  /** Filter with null safety */
  filter<T>(items: T[] | null | undefined, fn: (item: T) => boolean): T[] {
    const arr = Array.isArray(items) ? items : []
    return arr.filter(fn)
  },

  /** Find with null safety */
  find<T>(items: T[] | null | undefined, fn: (item: T) => boolean): T | undefined {
    const arr = Array.isArray(items) ? items : []
    return arr.find(fn)
  },

  /** Reduce with null safety */
  reduce<T, U>(items: T[] | null | undefined, fn: (acc: U, item: T) => U, initial: U): U {
    const arr = Array.isArray(items) ? items : []
    return arr.reduce(fn, initial)
  },
}

/** Data validators for booking inputs */
export const DataValidators = {
  /** Timeline: Quote <= Confirmed <= Pre-arrival <= In-stay start <= In-stay end <= Post-stay */
  isValidTimelineOrder(stages: Array<{ stage: string; timestamp: string }>): boolean {
    const order = ['quote', 'confirmed', 'pre_arrival', 'in_stay', 'post_stay']
    const timestamps = order.map((s) => {
      const stage = stages?.find((st) => st.stage === s)
      return stage?.timestamp ? new Date(stage.timestamp).getTime() : null
    })
    for (let i = 1; i < timestamps.length; i++) {
      const prev = timestamps[i - 1]
      const curr = timestamps[i]
      if (prev != null && curr != null && curr < prev) return false
    }
    return true
  },

  /** Payment: due date valid, amount positive */
  isValidPayment(milestone: { due_date: string; amount: number }): boolean {
    const d = new Date(milestone.due_date)
    if (Number.isNaN(d.getTime())) return false
    return typeof milestone.amount === 'number' && milestone.amount >= 0
  },

  /** Attachment: valid mime, size within limit */
  isValidAttachment(file: { type?: string; size?: number }): { valid: boolean; error?: string } {
    const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.type && !ALLOWED.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Use PDF, JPEG, PNG, or DOC.' }
    }
    if (file.size != null && file.size > MAX_SIZE) {
      return { valid: false, error: 'File too large (max 10MB)' }
    }
    return { valid: true }
  },

  /** Required fields for stage */
  requiredFieldsForStage(stage: string): string[] {
    const map: Record<string, string[]> = {
      quote: ['client_id', 'resort_id', 'check_in', 'check_out'],
      confirmed: ['client_id', 'resort_id', 'check_in', 'check_out', 'total_amount'],
      pre_arrival: ['client_id', 'resort_id', 'check_in', 'check_out', 'total_amount'],
      in_stay: ['client_id', 'resort_id', 'check_in', 'check_out', 'total_amount'],
      post_stay: ['client_id', 'resort_id', 'check_in', 'check_out', 'total_amount'],
    }
    return map[stage] ?? []
  },
}

/** Conflict checker - scheduling, deadlines */
export const ConflictChecker = {
  /** Balance urgency: overdue, due_soon, or ok */
  getBalanceUrgency(
    balance: number,
    nextDueDate?: string,
    _nextAmount?: number
  ): 'overdue' | 'due_soon' | 'ok' {
    if (balance <= 0) return 'ok'
    if (!nextDueDate) return 'ok'
    const due = new Date(nextDueDate)
    const now = new Date()
    if (due < now) return 'overdue'
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    if (due <= sevenDays) return 'due_soon'
    return 'ok'
  },

  /** Check if payment is overdue */
  isPaymentOverdue(dueDate: string, status: string): boolean {
    if (status === 'paid') return false
    return new Date(dueDate) < new Date()
  },

  /** Check if payment is due within N days */
  isPaymentDueSoon(dueDate: string, status: string, days = 7): boolean {
    if (status === 'paid') return false
    const due = new Date(dueDate)
    const now = new Date()
    const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    return due >= now && due <= limit
  },

  /** Check if stay is within N days */
  isStayUpcoming(checkIn: string, days = 7): boolean {
    const checkInDate = new Date(checkIn)
    const now = new Date()
    const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    return checkInDate >= now && checkInDate <= limit
  },

  /** Check if deadline is overdue */
  isDeadlineOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date()
  },

  /** Check date range overlap */
  hasDateOverlap(
    aStart: string,
    aEnd: string,
    bStart: string,
    bEnd: string
  ): boolean {
    const aS = new Date(aStart).getTime()
    const aE = new Date(aEnd).getTime()
    const bS = new Date(bStart).getTime()
    const bE = new Date(bEnd).getTime()
    return aS < bE && bS < aE
  },
}

/** Convert BookingDraft to BookingDetail for template generation */
export function draftToDetail(draft: {
  id?: string
  client?: { id?: string; firstName?: string; lastName?: string; name?: string } | null
  resort?: { id?: string; name?: string; location?: string; transfer_time_minutes?: number } | null
  room_category?: { id?: string; name?: string; bed_config?: string; capacity?: number } | null
  check_in?: string
  check_out?: string
  rate_plan?: { id?: string; name?: string; amount?: number; currency?: string; taxes?: number; fees?: number; discount?: number } | null
  commission_model?: { type?: string; value?: number; calculated_commission?: number; supplier_net?: number } | null
  payment_schedule?: Array<{ id?: string; milestone?: string; due_date?: string; amount?: number; currency?: string; status?: string }>
  itinerary?: Array<{ id?: string; day_index?: number; date?: string; activities?: unknown[]; transfers?: unknown[] }>
  attachments?: Array<{ id?: string; filename?: string; url?: string; type?: string }>
  supplier_references?: Array<{ id?: string; supplier_name?: string; reference_code?: string; contact?: string }>
  currency?: string
}): BookingDetail {
  const client = draft.client
  const clientName = client
    ? ('firstName' in client && 'lastName' in client
      ? `${(client as { firstName?: string; lastName?: string }).firstName ?? ''} ${(client as { lastName?: string }).lastName ?? ''}`.trim()
      : (client as { name?: string }).name ?? '') || 'Unknown'
    : 'Unknown'

  const totalAmount = draft.rate_plan?.amount ?? 0
  const schedule = draft.payment_schedule ?? []
  const outstandingBalance = Math.max(0, totalAmount - 0)

  const payments = schedule.map((p, i) => ({
    id: (p as { id?: string }).id ?? `p${i}`,
    booking_id: draft.id ?? '',
    milestone: p.milestone ?? 'Payment',
    due_date: p.due_date ?? '',
    amount: p.amount ?? 0,
    currency: p.currency ?? draft.currency ?? 'EUR',
    status: ((p as { status?: string }).status as 'paid' | 'unpaid' | 'overdue') ?? 'unpaid',
  }))

  const supplierRefs = (draft.supplier_references ?? []).map((s, i) => ({
    id: (s as { id?: string }).id ?? `s${i}`,
    booking_id: draft.id ?? '',
    supplier_id: (s as { id?: string }).id ?? (s as { supplier_name?: string }).supplier_name ?? `sup${i}`,
    supplier_name: (s as { supplier_name?: string }).supplier_name,
    reference_numbers: (s as { reference_code?: string }).reference_code,
    contact: (s as { contact?: string }).contact,
  }))

  const attachments = (draft.attachments ?? []).map((a, i) => ({
    id: (a as { id?: string }).id ?? `att${i}`,
    booking_id: draft.id ?? '',
    filename: (a as { filename?: string }).filename ?? '',
    url: (a as { url?: string }).url ?? '',
    type: (a as { type?: string }).type ?? 'document',
    uploaded_at: new Date().toISOString(),
  }))

  return {
    id: draft.id ?? `draft-${Date.now()}`,
    reference: `LF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    client_id: (client as { id?: string } | undefined)?.id ?? '',
    client: { id: (client as { id?: string } | undefined)?.id ?? '', name: clientName },
    resort_id: (draft.resort as { id?: string } | undefined)?.id ?? '',
    resort: draft.resort
      ? {
          id: (draft.resort as { id?: string }).id ?? '',
          name: (draft.resort as { name?: string }).name ?? '',
          location: (draft.resort as { location?: string }).location,
          transfer_time_minutes: (draft.resort as { transfer_time_minutes?: number }).transfer_time_minutes,
        }
      : undefined,
    room_category_id: draft.room_category?.id,
    room_category: draft.room_category
      ? {
          id: draft.room_category.id ?? '',
          name: draft.room_category.name ?? '',
          bed_config: draft.room_category.bed_config,
          capacity: draft.room_category.capacity,
        }
      : undefined,
    status: 'quote',
    check_in: draft.check_in ?? '',
    check_out: draft.check_out ?? '',
    total_amount: totalAmount,
    outstanding_balance: outstandingBalance,
    currency: draft.currency ?? 'EUR',
    timeline: [
      { id: 't1', booking_id: draft.id ?? '', stage: 'quote', timestamp: new Date().toISOString(), actor_name: 'Current User' },
    ],
    itinerary: (draft.itinerary ?? []).map((d, i) => ({
      id: d.id ?? `day-${i}`,
      day_index: d.day_index ?? i + 1,
      date: d.date ?? '',
      activities: d.activities ?? [],
      transfers: d.transfers ?? [],
    })) as ItineraryDay[],
    rates: draft.rate_plan
      ? [{ id: draft.rate_plan.id ?? 'rp1', name: draft.rate_plan.name ?? '', amount: draft.rate_plan.amount ?? 0, currency: draft.rate_plan.currency ?? 'EUR', taxes: draft.rate_plan.taxes, fees: draft.rate_plan.fees, discount: draft.rate_plan.discount }]
      : [],
    commission: draft.commission_model
      ? {
          type: (draft.commission_model.type ?? 'percentage') as CommissionModel['type'],
          value: draft.commission_model.value ?? 0,
          calculated_commission: draft.commission_model.calculated_commission ?? 0,
          supplier_net: draft.commission_model.supplier_net ?? 0,
        }
      : undefined,
    payments,
    supplier_references: supplierRefs,
    attachments,
    notes: [],
    approvals: [],
    deadlines: schedule
      .filter((p) => p.due_date)
      .map((p, i) => ({
        id: `d${i}`,
        title: p.milestone ?? 'Payment',
        due_date: p.due_date ?? '',
        type: 'payment',
      })),
  }
}
