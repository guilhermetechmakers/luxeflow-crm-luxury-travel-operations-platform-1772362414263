/**
 * ValidationManager - Centralized validation rules for Booking Create/Edit Wizard
 * Supports step-level and full validation; runtime safety enforced
 * Integrates ConflictChecker for date overlaps, deadlines, SLA
 */
import { ConflictChecker } from '@/lib/booking-utils'
import type { BookingDraft, ValidationError, ItineraryItem } from '@/types/booking'

/** Check for overlapping times within a day's activities/transfers */
function hasItineraryTimeOverlap(items: ItineraryItem[]): boolean {
  const list = Array.isArray(items) ? items : []
  for (let i = 0; i < list.length; i++) {
    const a = list[i]
    if (!a?.time) continue
    const aTime = parseTime(a.time)
    for (let j = i + 1; j < list.length; j++) {
      const b = list[j]
      if (!b?.time) continue
      const bTime = parseTime(b.time)
      if (Math.abs(aTime - bTime) < 15) return true
    }
  }
  return false
}

function parseTime(t: string): number {
  const [h, m] = (t ?? '').split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function validateStep(step: number, draft: BookingDraft): ValidationError[] {
  const errors: ValidationError[] = []

  switch (step) {
    case 0: {
      if (!draft.client) {
        errors.push({ step: 0, field: 'client', message: 'Please select or create a client.' })
      } else {
        const c = draft.client
        const name = 'firstName' in c && 'lastName' in c
          ? `${(c as { firstName?: string; lastName?: string }).firstName ?? ''} ${(c as { firstName?: string; lastName?: string }).lastName ?? ''}`.trim()
          : (c as { name?: string }).name ?? ''
        if (!name) {
          errors.push({ step: 0, field: 'client', message: 'Client name is required.' })
        }
        const cExt = c as { email?: string; phone?: string; id?: string }
        const hasContact = (cExt.email ?? '').trim() || (cExt.phone ?? '').trim()
        if (!cExt.id && !hasContact) {
          errors.push({ step: 0, field: 'client', message: 'New clients must have email or phone.' })
        }
      }
      break
    }
    case 1: {
      if (!draft.check_in || !draft.check_out) {
        errors.push({ step: 1, field: 'dates', message: 'Check-in and check-out dates are required.' })
      }
      if (draft.check_in && draft.check_out && draft.check_in >= draft.check_out) {
        errors.push({ step: 1, field: 'dates', message: 'Check-out must be after check-in.' })
      }
      if (!draft.resort) {
        errors.push({ step: 1, field: 'resort', message: 'Please select a resort.' })
      }
      const resort = draft.resort as { room_types?: unknown[] } | undefined
      if (resort && (resort.room_types ?? []).length > 0 && !draft.room_category) {
        errors.push({ step: 1, field: 'room', message: 'Please select a room category.' })
      }
      break
    }
    case 2: {
      if (!draft.rate_plan) {
        errors.push({ step: 2, field: 'rate_plan', message: 'Please select a rate plan.' })
      }
      if (!draft.commission_model) {
        errors.push({ step: 2, field: 'commission', message: 'Commission must be configured.' })
      }
      break
    }
    case 3: {
      const schedule = draft.payment_schedule ?? []
      const total = draft.rate_plan?.amount ?? 0
      const sum = schedule.reduce((s, p) => s + (p.amount ?? 0), 0)
      if (total > 0 && Math.abs(sum - total) > 0.01) {
        errors.push({
          step: 3,
          field: 'payment_schedule',
          message: `Payment schedule total (${sum}) must match booking amount (${total}).`,
        })
      }
      if (schedule.length === 0 && total > 0) {
        errors.push({ step: 3, field: 'payment_schedule', message: 'Add at least one payment milestone.' })
      }
      for (const p of schedule) {
        if (p.due_date && ConflictChecker.isPaymentOverdue(p.due_date, p.status ?? 'unpaid')) {
          errors.push({
            step: 3,
            field: 'payment_schedule',
            message: `Milestone "${p.milestone ?? 'Payment'}" is overdue.`,
          })
        }
      }
      break
    }
    case 4: {
      const itinerary = draft.itinerary ?? []
      if (itinerary.length === 0) {
        errors.push({ step: 4, field: 'itinerary', message: 'Add at least one itinerary day.' })
      }
      for (const day of itinerary) {
        const allItems = [...(day.activities ?? []), ...(day.transfers ?? [])]
        if (hasItineraryTimeOverlap(allItems)) {
          errors.push({
            step: 4,
            field: 'itinerary',
            message: `Day ${day.day_index ?? ''} has overlapping activities/transfers. Adjust times.`,
          })
        }
      }
      break
    }
    case 5:
      break
    case 6:
      return validateFull(draft)
    default:
      break
  }

  return errors
}

export function validateFull(draft: BookingDraft): ValidationError[] {
  const errors: ValidationError[] = []
  for (let s = 0; s <= 6; s++) {
    errors.push(...validateStep(s, draft))
  }
  return errors
}

export function canSaveAsQuote(draft: BookingDraft): boolean {
  return validateFull(draft).length === 0
}

export function canConfirmBooking(draft: BookingDraft): boolean {
  return canSaveAsQuote(draft)
}
