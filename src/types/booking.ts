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

// --- Booking Detail (full lifecycle-aware record) ---

export type TimelineStageType =
  | 'quote'
  | 'confirmed'
  | 'pre_arrival'
  | 'in_stay'
  | 'post_stay'

export interface TimelineStage {
  id: string
  booking_id: string
  stage: TimelineStageType
  timestamp: string
  actor_id?: string
  actor_name?: string
  note?: string
}

export interface ItineraryItem {
  id: string
  type: 'activity' | 'transfer'
  title: string
  description?: string
  time?: string
  location?: string
}

export interface ItineraryDay {
  id: string
  day_index: number
  date: string
  activities: ItineraryItem[]
  transfers: ItineraryItem[]
}

export interface RatePlan {
  id: string
  name: string
  amount: number
  currency: string
  taxes?: number
  fees?: number
  discount?: number
}

export type CommissionModelType = 'percentage' | 'fixed' | 'tiered'

export interface CommissionModel {
  type: CommissionModelType
  value: number
  calculated_commission: number
  supplier_net: number
}

export interface PaymentMilestone {
  id: string
  booking_id: string
  milestone: string
  due_date: string
  amount: number
  currency: string
  status: 'paid' | 'unpaid' | 'overdue'
  paid_at?: string
  payment_link?: string
}

export interface AttachmentDetail {
  id: string
  booking_id: string
  filename: string
  url: string
  type: string
  uploaded_at: string
  uploaded_by?: string
  version?: number
}

export interface NoteDetail {
  id: string
  booking_id: string
  author_id: string
  author_name?: string
  content: string
  created_at: string
  tags?: string[]
}

export interface ApprovalDetail {
  id: string
  booking_id: string
  requester_id: string
  requester_name?: string
  status: 'pending' | 'approved' | 'denied'
  due_by?: string
  history?: { timestamp: string; actor: string; action: string }[]
}

export interface SupplierReferenceDetail {
  id: string
  booking_id: string
  supplier_id: string
  supplier_name?: string
  reference_numbers?: string
  contact?: string
  contract_attachments?: string[]
}

export interface ClientRef {
  id: string
  name: string
  avatar_url?: string
}

export interface ResortRef {
  id: string
  name: string
  location?: string
  transfer_time?: string
  transfer_time_minutes?: number
}

export interface RoomCategoryRef {
  id: string
  name: string
  bed_config?: string
  capacity?: number
}

export interface BookingDetail {
  id: string
  reference: string
  client_id: string
  client?: ClientRef
  resort_id: string
  resort?: ResortRef
  room_category_id?: string
  room_category?: RoomCategoryRef
  status: BookingStatus
  check_in: string
  check_out: string
  total_amount: number
  outstanding_balance: number
  currency: string
  timeline?: TimelineStage[]
  itinerary?: ItineraryDay[]
  rates?: RatePlan[]
  commission?: CommissionModel
  payments?: PaymentMilestone[]
  supplier_references?: SupplierReferenceDetail[]
  attachments?: AttachmentDetail[]
  notes?: NoteDetail[]
  approvals?: ApprovalDetail[]
  deadlines?: { id: string; title: string; due_date: string; type: string }[]
}

// --- Booking Wizard / Create Edit ---

export interface ResortBibleItem {
  id: string
  name: string
  location?: string
  transfer_time_minutes?: number
  transfer_time?: string
  kids_policy?: string
  beach_proximity?: string
  room_types?: RoomCategoryRef[]
  capacity?: number
  seasonality?: string
  image_url?: string
  tags?: string[]
  inclusions?: string[]
}

export interface PaymentMilestoneInput {
  id: string
  milestone: string
  due_date: string
  amount: number
  currency: string
  status?: 'paid' | 'unpaid' | 'overdue'
}

export interface SupplierReferenceInput {
  id: string
  supplier_name: string
  reference_code?: string
  contact?: string
  notes?: string
}

export interface AttachmentInput {
  id: string
  filename: string
  url: string
  type: string
}

export interface BookingDraftClient {
  id?: string
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  vip?: boolean
  family?: boolean
  country?: string
  notes?: string
}

export interface BookingDraft {
  id?: string
  client_id?: string
  client?: BookingDraftClient | { id: string; name: string; email?: string; phone?: string } | null
  resort_id?: string
  resort?: ResortRef | ResortBibleItem | null
  room_category_id?: string
  room_category?: RoomCategoryRef | null
  check_in: string
  check_out: string
  rate_plan_id?: string
  rate_plan?: RatePlan | null
  commission_model?: CommissionModel | null
  total_amount?: number
  currency: string
  payment_schedule: PaymentMilestoneInput[]
  itinerary: ItineraryDay[]
  supplier_references: SupplierReferenceInput[]
  attachments: AttachmentInput[]
  internal_notes?: string
}

export interface ValidationError {
  step: number
  field?: string
  message: string
}
