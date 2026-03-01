/**
 * Dashboard - Role-aware home screen for LuxeFlow CRM
 * Renders widgets based on permissions; all data guarded for runtime safety
 */
import { useMemo } from 'react'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { usePermissions } from '@/hooks/use-permissions'
import {
  OperationsCommandCenter,
  UpcomingStays,
  PaymentDueList,
  OverdueTasks,
  RevenueSnapshot,
  AlertsWidget,
  QuickActions,
  AIAssistantQuickAccess,
} from '@/components/dashboard'
import { Skeleton } from '@/components/ui/skeleton'

export function Dashboard() {
  const {
    upcomingStays,
    paymentsDue,
    overdueTasks,
    approvals,
    alerts,
    isLoading,
    isError,
  } = useDashboardData()
  const permissions = usePermissions()

  const stays = useMemo(() => upcomingStays ?? [], [upcomingStays])
  const payments = useMemo(() => paymentsDue ?? [], [paymentsDue])
  const tasks = useMemo(() => overdueTasks ?? [], [overdueTasks])
  const approvalList = useMemo(() => approvals ?? [], [approvals])
  const alertList = useMemo(() => alerts ?? [], [alerts])

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">Unable to load dashboard. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Your operations command center</p>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Operations Command Center */}
          {permissions.showOperationsCommand && (
            <OperationsCommandCenter
              upcomingStays={stays}
              paymentsDue={payments}
              overdueTasks={tasks}
              approvals={approvalList}
            />
          )}

          {/* Main grid: Stays, Payments, Tasks */}
          <div className="grid gap-6 lg:grid-cols-3">
            {permissions.showUpcomingStays && (
              <UpcomingStays stays={stays} />
            )}
            {permissions.showPaymentDue && (
              <PaymentDueList payments={payments} />
            )}
            {permissions.showOverdueTasks && (
              <OverdueTasks tasks={tasks} />
            )}
          </div>

          {/* Revenue Snapshot */}
          {permissions.showRevenueSnapshot && (
            <RevenueSnapshot />
          )}

          {/* Alerts */}
          {permissions.showAlerts && (
            <AlertsWidget alerts={alertList} />
          )}

          {/* Quick Actions & AI Assistant */}
          <div className="grid gap-6 lg:grid-cols-2">
            {permissions.showQuickActions && (
              <QuickActions />
            )}
            {permissions.showAIAssistant && (
              <AIAssistantQuickAccess />
            )}
          </div>
        </>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
