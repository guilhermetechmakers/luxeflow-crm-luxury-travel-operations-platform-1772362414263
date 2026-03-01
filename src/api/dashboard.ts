/**
 * Dashboard API - fetches role-specific overview data
 * Uses mock data for local development; swap for Supabase/Edge Function in production
 */
import type {
  DashboardOverview,
  Stay,
  Payment,
  Task,
  RevenueSnapshot,
  Alert,
  Approval,
  DateRangeKey,
} from '@/types/dashboard'

const MOCK_STAYS: Stay[] = [
  {
    id: '1',
    clientId: 'c1',
    bookingId: 'b1',
    clientName: 'Emma Laurent',
    resort: 'Villa Serenity',
    roomType: 'Ocean Suite',
    checkIn: '2025-03-03',
    checkOut: '2025-03-10',
    status: 'confirmed',
  },
  {
    id: '2',
    clientId: 'c2',
    bookingId: 'b2',
    clientName: 'James Chen',
    resort: 'Château des Alpes',
    roomType: 'Mountain View',
    checkIn: '2025-03-05',
    checkOut: '2025-03-12',
    status: 'confirmed',
  },
  {
    id: '3',
    clientId: 'c3',
    bookingId: 'b3',
    clientName: 'Sophie Müller',
    resort: 'Palazzo Riviera',
    roomType: 'Penthouse',
    checkIn: '2025-03-07',
    checkOut: '2025-03-14',
    status: 'confirmed',
  },
]

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    bookingId: 'b1',
    bookingRef: 'LF-2025-001',
    clientId: 'c1',
    clientName: 'Emma Laurent',
    amount: 4500,
    dueDate: '2025-03-02',
    status: 'overdue',
    currency: 'EUR',
  },
  {
    id: 'p2',
    bookingId: 'b2',
    bookingRef: 'LF-2025-002',
    clientId: 'c2',
    clientName: 'James Chen',
    amount: 8200,
    dueDate: '2025-03-05',
    status: 'pending',
    currency: 'EUR',
  },
  {
    id: 'p3',
    bookingId: 'b3',
    bookingRef: 'LF-2025-003',
    clientId: 'c3',
    clientName: 'Sophie Müller',
    amount: 12500,
    dueDate: '2025-03-08',
    status: 'pending',
    currency: 'EUR',
  },
]

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Confirm VIP transfer for Laurent family',
    dueDate: '2025-02-28',
    assigneeName: 'You',
    priority: 'high',
    status: 'overdue',
  },
  {
    id: 't2',
    title: 'Send pre-arrival questionnaire to Chen',
    dueDate: '2025-03-01',
    assigneeName: 'You',
    priority: 'medium',
    status: 'overdue',
  },
]

const MOCK_APPROVALS: Approval[] = [
  {
    id: 'a1',
    type: 'VIP Request',
    title: 'Helicopter transfer - Villa Serenity',
    dueDate: '2025-03-02',
    status: 'pending',
  },
]

const MOCK_ALERTS: Alert[] = [
  {
    id: 'al1',
    priority: 'high',
    message: 'Payment overdue for LF-2025-001',
    dueDate: '2025-03-02',
  },
  {
    id: 'al2',
    priority: 'medium',
    message: 'Vendor approval needed: Helicopter transfer',
    dueDate: '2025-03-02',
  },
]

const REVENUE_BY_RANGE: Record<DateRangeKey, RevenueSnapshot> = {
  '7d': { bookings: 8, gbv: 42500, commission: 3400, currency: 'EUR', range: '7d' },
  '30d': { bookings: 24, gbv: 124500, commission: 9960, currency: 'EUR', range: '30d' },
  '90d': { bookings: 72, gbv: 385000, commission: 30800, currency: 'EUR', range: '90d' },
}

/** Normalize API response - ensure arrays, safe defaults (runtime safety) */
function normalizeOverview(raw: unknown): DashboardOverview {
  const data = raw as Partial<DashboardOverview> | null | undefined
  return {
    upcomingStays: Array.isArray(data?.upcomingStays) ? data.upcomingStays : [],
    paymentsDue: Array.isArray(data?.paymentsDue) ? data.paymentsDue : [],
    overdueTasks: Array.isArray(data?.overdueTasks) ? data.overdueTasks : [],
    approvals: Array.isArray(data?.approvals) ? data.approvals : [],
    alerts: Array.isArray(data?.alerts) ? data.alerts : [],
    revenue: data?.revenue ?? null,
  }
}

export const dashboardApi = {
  /**
   * GET /api/dashboard/overview equivalent
   * Returns role-specific overview; uses mock data when backend unavailable
   */
  async getOverview(): Promise<DashboardOverview> {
    try {
      // In production: const res = await apiFetch<DashboardOverview>('/api/dashboard/overview')
      // For now: return mock data with proper normalization
      const mock: DashboardOverview = {
        upcomingStays: MOCK_STAYS,
        paymentsDue: MOCK_PAYMENTS,
        overdueTasks: MOCK_TASKS,
        approvals: MOCK_APPROVALS,
        alerts: MOCK_ALERTS,
        revenue: REVENUE_BY_RANGE['30d'],
      }
      return normalizeOverview(mock)
    } catch {
      return normalizeOverview({})
    }
  },

  /**
   * GET /api/revenue/snapshot?range=7d equivalent
   */
  async getRevenueSnapshot(range: DateRangeKey): Promise<RevenueSnapshot> {
    const snapshot = REVENUE_BY_RANGE[range] ?? REVENUE_BY_RANGE['30d']
    return { ...snapshot }
  },

  /**
   * GET /api/permissions equivalent
   * Returns user permissions based on role
   */
  async getPermissions(): Promise<{ role: string; permissions: Record<string, boolean> }> {
    // In production: fetch from API; for now return Admin-like permissions
    return {
      role: 'Admin',
      permissions: {
        canViewOperations: true,
        canViewRevenue: true,
        canViewPayments: true,
        canViewTasks: true,
        canViewAlerts: true,
        canViewApprovals: true,
      },
    }
  },
}
