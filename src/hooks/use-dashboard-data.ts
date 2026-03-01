/**
 * useDashboardData - fetches and normalizes dashboard data per role
 * Uses React Query for caching and loading states
 */
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import type { DateRangeKey } from '@/types/dashboard'

const QUERY_KEY = ['dashboard', 'overview'] as const

export function useDashboardData() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => dashboardApi.getOverview(),
    staleTime: 60 * 1000,
  })

  const data = query.data ?? null
  const upcomingStays = data?.upcomingStays ?? []
  const paymentsDue = data?.paymentsDue ?? []
  const overdueTasks = data?.overdueTasks ?? []
  const approvals = data?.approvals ?? []
  const alerts = data?.alerts ?? []
  const revenue = data?.revenue ?? null

  return {
    ...query,
    data,
    upcomingStays,
    paymentsDue,
    overdueTasks,
    approvals,
    alerts,
    revenue,
  }
}

export function useRevenueSnapshot(range: DateRangeKey) {
  return useQuery({
    queryKey: ['dashboard', 'revenue', range],
    queryFn: () => dashboardApi.getRevenueSnapshot(range),
    staleTime: 60 * 1000,
  })
}
