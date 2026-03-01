/**
 * Booking types for LuxeFlow CRM
 * All types support null-safe handling per runtime safety rules
 */

export type BookingStatus =
  | 'quote'
  | 'confirmed'
  | 'pre_arrival'
  | 'in_stay'
  | 'completed'

export interface BookingSummary {
  id: string
  booking_ref: string
  client_id: string
  client_name: string
  resort_id: string
  resort_name: string
  agent_id?: string
  agent_name?: string
  check_in: string
  check_out: string
  status: BookingStatus
  value: number
  commission: number
  balance_due: number
  currency: string
  last_updated: string
}

export interface Booking extends BookingSummary {
  timeline?: BookingTimelineEvent[]
  payment_schedule?: PaymentScheduleItem[]
  attachments?: Attachment[]
  supplier_references?: SupplierReference[]
  internal_notes?: InternalNote[]
  approvals?: Approval[]
}

export interface BookingTimelineEvent {
  id: string
  booking_id: string
  stage: string
  timestamp: string
  note?: string
}

export interface PaymentScheduleItem {
  id: string
  booking_id: string
  due_date: string
  amount: number
  status: 'paid' | 'unpaid' | 'overdue'
}

export interface Attachment {
  id: string
  booking_id: string
  type: string
  filename: string
  url: string
  uploaded_at: string
}

export interface SupplierReference {
  id: string
  booking_id: string
  supplier_id: string
  reference: string
}

export interface InternalNote {
  id: string
  booking_id: string
  author_id: string
  note: string
  timestamp: string
}

export interface Approval {
  id: string
  booking_id: string
  approver_id: string
  status: string
  due_by: string
}

export interface Agent {
  id: string
  name: string
}

export interface Resort {
  id: string
  name: string
  location?: string
}

export type BookingSortField =
  | 'check_in'
  | 'check_out'
  | 'value'
  | 'balance_due'
  | 'status'
  | 'last_updated'
  | 'booking_ref'

export interface BookingFilters {
  status?: BookingStatus
  agent_id?: string
  resort_id?: string
  date_from?: string
  date_to?: string
  check_in_from?: string
  check_in_to?: string
  balance_min?: number
  search?: string
  sort?: BookingSortField
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface BookingsResponse {
  data: BookingSummary[]
  count: number
}

export interface BulkExportRequest {
  booking_ids: string[]
  fields?: string[]
  format?: 'csv' | 'xlsx'
}

export interface BulkExportResponse {
  job_id?: string
  url?: string
  status?: string
}
