/**
 * Conflicts API - Check booking conflicts and deadline validations
 * POST /conflicts/check, POST /deadlines/validate
 * Runtime safety: all responses validated with nullish coalescing
 */
import { api } from '@/lib/api'
import { bookingsApi } from '@/api/bookings'
import { ConflictChecker } from '@/lib/booking-utils'
import type { BookingDraft } from '@/types/booking'

export interface ConflictItem {
  id: string
  type: 'overlap' | 'deadline' | 'sla' | 'blackout'
  severity: 'error' | 'warning'
  message: string
  field?: string
  resolution?: string
}

export interface ConflictsCheckRequest {
  client_id?: string
  resort_id?: string
  check_in: string
  check_out: string
  booking_id?: string
}

export interface ConflictsCheckResponse {
  conflicts: ConflictItem[]
  status: 'ok' | 'has_conflicts'
}

export interface DeadlinesValidateRequest {
  check_in: string
  check_out: string
  payment_schedule: Array<{ milestone: string; due_date: string; amount: number }>
}

export interface DeadlinesValidateResponse {
  valid: boolean
  issues: ConflictItem[]
}

/** Check conflicts against existing bookings (client overlap, resort capacity, etc.) */
export async function checkConflicts(
  request: ConflictsCheckRequest
): Promise<ConflictsCheckResponse> {
  try {
    const res = await api.post<ConflictsCheckResponse>('/conflicts/check', request)
    const data = res ?? { conflicts: [], status: 'ok' }
    const conflicts = Array.isArray(data.conflicts) ? data.conflicts : []
    return { conflicts, status: conflicts.length > 0 ? 'has_conflicts' : 'ok' }
  } catch {
    return runLocalConflictCheck(request)
  }
}

/** Validate payment deadlines against lead times and SLAs */
export async function validateDeadlines(
  request: DeadlinesValidateRequest
): Promise<DeadlinesValidateResponse> {
  try {
    const res = await api.post<DeadlinesValidateResponse>('/deadlines/validate', request)
    const data = res ?? { valid: true, issues: [] }
    const issues = Array.isArray(data.issues) ? data.issues : []
    return { valid: issues.length === 0, issues }
  } catch {
    return runLocalDeadlineValidation(request)
  }
}

/** Local fallback when API unavailable - check client overlaps */
async function runLocalConflictCheck(
  request: ConflictsCheckRequest
): Promise<ConflictsCheckResponse> {
  const conflicts: ConflictItem[] = []
  const { client_id, check_in, check_out, booking_id } = request

  if (!client_id || !check_in || !check_out) {
    return { conflicts: [], status: 'ok' }
  }

  const fromDate = new Date(check_in)
  fromDate.setDate(fromDate.getDate() - 60)
  const toDate = new Date(check_out)
  toDate.setDate(toDate.getDate() + 60)
  const { data: bookings } = await bookingsApi.getBookings({
    check_in_from: fromDate.toISOString().slice(0, 10),
    check_in_to: toDate.toISOString().slice(0, 10),
  })

  const list = Array.isArray(bookings) ? bookings : []
  const clientBookings = list.filter((b) => b.client_id === client_id)
  for (const b of clientBookings) {
    if (b.id === booking_id) continue
    const overlap = ConflictChecker.hasDateOverlap(
      check_in,
      check_out,
      b.check_in ?? '',
      b.check_out ?? ''
    )
    if (overlap) {
      conflicts.push({
        id: `conflict-${b.id}`,
        type: 'overlap',
        severity: 'error',
        message: `Client has overlapping booking: ${b.booking_ref ?? b.id} (${b.check_in} – ${b.check_out})`,
        field: 'check_in',
        resolution: 'Adjust dates or select a different client.',
      })
    }
  }

  return {
    conflicts,
    status: conflicts.length > 0 ? 'has_conflicts' : 'ok',
  }
}

/** Local fallback - validate payment due dates */
function runLocalDeadlineValidation(
  request: DeadlinesValidateRequest
): DeadlinesValidateResponse {
  const issues: ConflictItem[] = []
  const { payment_schedule } = request
  const schedule = payment_schedule ?? []

  for (const p of schedule) {
    if (!p.due_date) continue
    if (ConflictChecker.isPaymentOverdue(p.due_date, 'unpaid')) {
      issues.push({
        id: `deadline-${p.milestone}`,
        type: 'deadline',
        severity: 'error',
        message: `Milestone "${p.milestone}" is overdue (${p.due_date})`,
        field: 'payment_schedule',
        resolution: 'Update due date or mark as paid.',
      })
    }
  }

  return { valid: issues.length === 0, issues }
}

/** Run full conflict and deadline checks for a draft */
export async function runFullChecks(draft: BookingDraft): Promise<ConflictItem[]> {
  const allConflicts: ConflictItem[] = []

  if (draft.client?.id && draft.check_in && draft.check_out) {
    const clientId = (draft.client as { id?: string }).id
    const res = await checkConflicts({
      client_id: clientId,
      resort_id: draft.resort?.id,
      check_in: draft.check_in,
      check_out: draft.check_out,
      booking_id: draft.id,
    })
    allConflicts.push(...(res.conflicts ?? []))
  }

  if (draft.check_in && (draft.payment_schedule ?? []).length > 0) {
    const deadlineRes = await validateDeadlines({
      check_in: draft.check_in,
      check_out: draft.check_out ?? draft.check_in,
      payment_schedule: (draft.payment_schedule ?? []).map((p) => ({
        milestone: p.milestone ?? 'Payment',
        due_date: p.due_date,
        amount: p.amount ?? 0,
      })),
    })
    allConflicts.push(...(deadlineRes.issues ?? []))
  }

  return allConflicts
}
