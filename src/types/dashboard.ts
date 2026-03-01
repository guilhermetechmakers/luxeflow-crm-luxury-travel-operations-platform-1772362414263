/**
 * Dashboard data models for LuxeFlow CRM
 * All types support null-safe handling per runtime safety rules
 */

export interface Stay {
  id: string
  clientId: string
  bookingId?: string
  clientName?: string
  resortId?: string
  resort?: string
  roomType?: string
  checkIn: string
  checkOut: string
  status: string
}

export interface Payment {
  id: string
  bookingId: string
  bookingRef?: string
  clientId: string
  clientName?: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue' | 'partial'
  currency?: string
}

export interface Task {
  id: string
  title: string
  dueDate: string
  assigneeId?: string
  assigneeName?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: string
}

export interface RevenueSnapshot {
  bookings: number
  gbv: number
  commission: number
  currency: string
  range: string
}

export interface Alert {
  id: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  dueDate?: string
  type?: string
}

export interface Approval {
  id: string
  type: string
  title: string
  dueDate?: string
  status: string
}

export interface DashboardOverview {
  upcomingStays: Stay[]
  paymentsDue: Payment[]
  overdueTasks: Task[]
  approvals: Approval[]
  alerts: Alert[]
  revenue: RevenueSnapshot | null
}

export type DateRangeKey = '7d' | '30d' | '90d'

export type UserRole = 'Admin' | 'Agent' | 'Ops' | 'Finance'

export interface Permissions {
  role: UserRole
  canViewOperations: boolean
  canViewRevenue: boolean
  canViewPayments: boolean
  canViewTasks: boolean
  canViewAlerts: boolean
  canViewApprovals: boolean
}
