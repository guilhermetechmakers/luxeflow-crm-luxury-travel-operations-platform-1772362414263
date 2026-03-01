/**
 * draftToDetail - Convert BookingDraft to Partial<BookingDetail> for template generation
 * Runtime safety: all arrays guarded with ?? []
 */
import type { BookingDraft, BookingDetail } from '@/types/booking'

function getClientName(draft: BookingDraft): string {
  const c = draft.client
  if (!c) return 'Unknown'
  if ('firstName' in c && 'lastName' in c) {
    return `${(c as { firstName?: string }).firstName ?? ''} ${(c as { lastName?: string }).lastName ?? ''}`.trim() || 'Unknown'
  }
  return (c as { name?: string }).name ?? 'Unknown'
}

export function draftToDetail(draft: BookingDraft): Partial<BookingDetail> {
  const clientId = (draft.client as { id?: string } | undefined)?.id ?? ''
  const clientName = getClientName(draft)
  const totalAmount = draft.rate_plan?.amount ?? 0
  const schedule = draft.payment_schedule ?? []
  const itinerary = draft.itinerary ?? []
  const attachments = draft.attachments ?? []
  const supplierRefs = draft.supplier_references ?? []

  const payments = schedule.map((p, i) => ({
    id: (p as { id?: string }).id ?? `p${i}`,
    booking_id: draft.id ?? '',
    milestone: p.milestone ?? 'Payment',
    due_date: p.due_date,
    amount: p.amount,
    currency: p.currency ?? draft.currency ?? 'EUR',
    status: (p.status ?? 'unpaid') as 'paid' | 'unpaid' | 'overdue',
  }))

  const supplierReferences = supplierRefs.map((s, i) => ({
    id: (s as { id?: string }).id ?? `s${i}`,
    booking_id: draft.id ?? '',
    supplier_id: s.supplier_name ?? `sup${i}`,
    supplier_name: s.supplier_name,
    reference_numbers: s.reference_code,
    contact: s.contact,
  }))

  const attachmentsDetail = attachments.map((a, i) => ({
    id: a.id ?? `att${i}`,
    booking_id: draft.id ?? '',
    filename: a.filename,
    url: a.url,
    type: a.type,
    uploaded_at: new Date().toISOString(),
  }))

  return {
    id: draft.id ?? `draft-${Date.now()}`,
    reference: draft.id ? `LF-${new Date().getFullYear()}-${String(draft.id).slice(-4)}` : 'DRAFT',
    client_id: clientId,
    client: { id: clientId, name: clientName },
    resort_id: (draft.resort as { id?: string } | undefined)?.id ?? '',
    resort: draft.resort
      ? {
          id: draft.resort.id,
          name: draft.resort.name,
          location: draft.resort.location,
          transfer_time_minutes: draft.resort.transfer_time_minutes,
        }
      : undefined,
    room_category_id: draft.room_category?.id,
    room_category: draft.room_category ?? undefined,
    status: 'quote',
    check_in: draft.check_in ?? '',
    check_out: draft.check_out ?? '',
    total_amount: totalAmount,
    outstanding_balance: totalAmount,
    currency: draft.currency ?? 'EUR',
    rates: draft.rate_plan ? [draft.rate_plan] : [],
    commission: draft.commission_model ?? undefined,
    payments,
    itinerary,
    supplier_references: supplierReferences,
    attachments: attachmentsDetail,
    deadlines: schedule
      .filter((p) => p.due_date)
      .map((p, i) => ({
        id: `d${i}`,
        title: p.milestone ?? 'Payment',
        due_date: p.due_date,
        type: 'payment',
      })),
  }
}
