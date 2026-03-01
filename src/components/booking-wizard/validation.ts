/**
 * ValidationManager - Centralized validation rules for booking wizard
 * Runtime safety: guards all array/object access
 */
import type { BookingDraft, ItineraryDay } from '@/types/booking'

export function validateBookingDraft(draft: BookingDraft): string[] {
  const errors: string[] = []

  if (!draft.client_id && !draft.client?.id) {
    errors.push('Client is required.')
  }

  if (!draft.resort_id && !draft.resort?.id) {
    errors.push('Resort is required.')
  }

  if (!draft.room_category_id && !draft.room_category?.id) {
    errors.push('Room category is required.')
  }

  if (!draft.check_in || !draft.check_out) {
    errors.push('Check-in and check-out dates are required.')
  } else {
    const checkIn = new Date(draft.check_in)
    const checkOut = new Date(draft.check_out)
    if (checkOut <= checkIn) {
      errors.push('Check-out must be after check-in.')
    }
  }

  if (!draft.rate_plan?.id) {
    errors.push('Rate plan is required.')
  }

  const total = draft.total_amount ?? 0
  const schedule = draft.payment_schedule ?? []
  const scheduleSum = schedule.reduce((acc, m) => acc + (m.amount ?? 0), 0)
  if (total > 0 && schedule.length > 0) {
    if (Math.abs(scheduleSum - total) >= 0.01) {
      errors.push('Payment schedule total must equal booking total.')
    }
  }

  const itinerary = draft.itinerary ?? []
  if (itinerary.length > 0) {
    const hasOverlap = checkItineraryOverlaps(itinerary)
    if (hasOverlap) {
      errors.push('Itinerary has overlapping time blocks.')
    }
  }

  return errors
}

function checkItineraryOverlaps(days: ItineraryDay[]): boolean {
  for (const day of days ?? []) {
    const activities = day.activities ?? []
    const transfers = day.transfers ?? []
    const allItems = [...activities, ...transfers]
    const times: { start: number; end: number }[] = []
    for (const item of allItems) {
      const t = parseTime(item.time)
      if (t != null) {
        times.push({ start: t, end: t + 60 })
      }
    }
    for (let i = 0; i < times.length; i++) {
      for (let j = i + 1; j < times.length; j++) {
        if (times[i]!.end > times[j]!.start && times[j]!.end > times[i]!.start) {
          return true
        }
      }
    }
  }
  return false
}

function parseTime(timeStr: string | undefined): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null
  const [h, m] = timeStr.split(':').map(Number)
  if (Number.isNaN(h)) return null
  return (h ?? 0) * 60 + (m ?? 0)
}
