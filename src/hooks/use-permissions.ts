/**
 * usePermissions - determines which widgets to show based on user role
 * Integrates with auth context for role-aware rendering
 */
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { dashboardApi } from '@/api/dashboard'
import type { UserRole } from '@/types/auth'

export interface WidgetPermissions {
  showOperationsCommand: boolean
  showUpcomingStays: boolean
  showPaymentDue: boolean
  showOverdueTasks: boolean
  showRevenueSnapshot: boolean
  showAlerts: boolean
  showQuickActions: boolean
  showAIAssistant: boolean
  showApprovals: boolean
}

const ROLE_WIDGET_MAP: Record<UserRole, Partial<WidgetPermissions>> = {
  Admin: {
    showOperationsCommand: true,
    showUpcomingStays: true,
    showPaymentDue: true,
    showOverdueTasks: true,
    showRevenueSnapshot: true,
    showAlerts: true,
    showQuickActions: true,
    showAIAssistant: true,
    showApprovals: true,
  },
  Ops: {
    showOperationsCommand: true,
    showUpcomingStays: true,
    showPaymentDue: true,
    showOverdueTasks: true,
    showRevenueSnapshot: false,
    showAlerts: true,
    showQuickActions: true,
    showAIAssistant: true,
    showApprovals: true,
  },
  Agent: {
    showOperationsCommand: true,
    showUpcomingStays: true,
    showPaymentDue: false,
    showOverdueTasks: true,
    showRevenueSnapshot: false,
    showAlerts: true,
    showQuickActions: true,
    showAIAssistant: true,
    showApprovals: false,
  },
  Finance: {
    showOperationsCommand: false,
    showUpcomingStays: false,
    showPaymentDue: true,
    showOverdueTasks: false,
    showRevenueSnapshot: true,
    showAlerts: true,
    showQuickActions: false,
    showAIAssistant: false,
    showApprovals: false,
  },
}

export function usePermissions(): WidgetPermissions {
  const { user } = useAuth()
  const role = (user?.roles?.[0] ?? 'Agent') as UserRole

  const { data } = useQuery({
    queryKey: ['permissions', role],
    queryFn: () => dashboardApi.getPermissions(),
    staleTime: 5 * 60 * 1000,
  })

  const roleMap = ROLE_WIDGET_MAP[role] ?? ROLE_WIDGET_MAP.Agent
  const apiPerms = data?.permissions ?? {}

  return {
    showOperationsCommand: apiPerms.canViewOperations ?? roleMap.showOperationsCommand ?? true,
    showUpcomingStays: true,
    showPaymentDue: apiPerms.canViewPayments ?? roleMap.showPaymentDue ?? true,
    showOverdueTasks: apiPerms.canViewTasks ?? roleMap.showOverdueTasks ?? true,
    showRevenueSnapshot: apiPerms.canViewRevenue ?? roleMap.showRevenueSnapshot ?? false,
    showAlerts: apiPerms.canViewAlerts ?? roleMap.showAlerts ?? true,
    showQuickActions: true,
    showAIAssistant: true,
    showApprovals: apiPerms.canViewApprovals ?? roleMap.showApprovals ?? false,
  }
}
