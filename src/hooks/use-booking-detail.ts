/**
 * useBookingDetail - Fetches full booking detail with related data
 * Guards against null/undefined per runtime safety rules
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '@/api/bookings'

const QUERY_KEY = ['booking-detail'] as const

function buildQueryKey(id: string): readonly [string, string] {
  return [...QUERY_KEY, id] as const
}

export function useBookingDetail(bookingId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: buildQueryKey(bookingId),
    queryFn: () => bookingsApi.getBookingDetail(bookingId),
    enabled: !!bookingId,
    staleTime: 60 * 1000,
  })

  const detail = query.data ?? null
  const timeline = detail?.timeline ?? []
  const itinerary = detail?.itinerary ?? []
  const payments = detail?.payments ?? []
  const attachments = detail?.attachments ?? []
  const notes = detail?.notes ?? []
  const approvals = detail?.approvals ?? []
  const supplierRefs = detail?.supplier_references ?? []

  const invalidate = () => queryClient.invalidateQueries({ queryKey: buildQueryKey(bookingId) })

  const updateMutation = useMutation({
    mutationFn: (updates: Record<string, unknown>) => bookingsApi.updateBooking(bookingId, updates),
    onSuccess: () => invalidate(),
  })

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => bookingsApi.addNote(bookingId, content),
    onSuccess: () => invalidate(),
  })

  const addAttachmentMutation = useMutation({
    mutationFn: (file: { filename: string; url: string; type: string }) =>
      bookingsApi.addAttachment(bookingId, file),
    onSuccess: () => invalidate(),
  })

  const createTaskMutation = useMutation({
    mutationFn: (task: { title: string; due_date?: string; assignee_id?: string }) =>
      bookingsApi.createTask(bookingId, task),
    onSuccess: () => invalidate(),
  })

  const requestApprovalMutation = useMutation({
    mutationFn: (payload?: { approver_id?: string }) => bookingsApi.requestApproval(bookingId, payload ?? {}),
    onSuccess: () => invalidate(),
  })

  const createPaymentMutation = useMutation({
    mutationFn: (milestone: { milestone: string; due_date: string; amount: number; currency: string }) =>
      bookingsApi.createPayment(bookingId, milestone),
    onSuccess: () => invalidate(),
  })

  const createInvoiceMutation = useMutation({
    mutationFn: () => bookingsApi.createInvoice(bookingId),
    onSuccess: () => invalidate(),
  })

  return {
    ...query,
    detail,
    timeline,
    itinerary,
    payments,
    attachments,
    notes,
    approvals,
    supplierRefs,
    invalidate,
    updateMutation,
    addNoteMutation,
    addAttachmentMutation,
    createTaskMutation,
    requestApprovalMutation,
    createPaymentMutation,
    createInvoiceMutation,
  }
}
