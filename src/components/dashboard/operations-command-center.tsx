/**
 * Operations Command Center - upcoming checks, balances, overdue tasks, approvals
 */
import { Link } from 'react-router-dom'
import {
  Calendar,
  CreditCard,
  CheckSquare,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Stay, Payment, Task, Approval } from '@/types/dashboard'

interface OperationsCommandCenterProps {
  upcomingStays: Stay[]
  paymentsDue: Payment[]
  overdueTasks: Task[]
  approvals: Approval[]
}

export function OperationsCommandCenter({
  upcomingStays = [],
  paymentsDue = [],
  overdueTasks = [],
  approvals = [],
}: OperationsCommandCenterProps) {
  const checkIns = (upcomingStays ?? []).filter((s) => s.checkIn)
  const overdueCount = (overdueTasks ?? []).length
  const pendingPayments = (paymentsDue ?? []).filter((p) => p.status === 'pending' || p.status === 'overdue')
  const approvalCount = (approvals ?? []).filter((a) => a.status === 'pending').length

  const sections = [
    {
      label: 'Check-ins (7 days)',
      count: checkIns.length,
      icon: Calendar,
      to: '/dashboard/calendar',
      color: 'text-luxe-accent',
    },
    {
      label: 'Due payments',
      count: pendingPayments.length,
      icon: CreditCard,
      to: '/dashboard/transactions',
      color: 'text-amber-600',
    },
    {
      label: 'Overdue tasks',
      count: overdueCount,
      icon: CheckSquare,
      to: '/dashboard/tasks',
      color: 'text-destructive',
    },
    {
      label: 'Pending approvals',
      count: approvalCount,
      icon: AlertCircle,
      to: '/dashboard/bookings',
      color: 'text-blue-600',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operations Command Center</CardTitle>
        <CardDescription>Time-critical items for the next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map(({ label, count, icon: Icon, to, color }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-4 rounded-lg border border-border p-4 transition-all duration-200 hover:border-accent/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
                <div className={`rounded-lg bg-secondary p-3 ${color}`}>
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-2xl font-semibold">{count}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" aria-hidden />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
