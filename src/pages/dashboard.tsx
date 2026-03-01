import { Link } from 'react-router-dom'
import {
  Calendar,
  CreditCard,
  CheckSquare,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const commandItems = [
  { label: 'Check-ins (7 days)', count: 3, icon: Calendar, to: '/dashboard/calendar', color: 'text-luxe-accent' },
  { label: 'Due payments', count: 5, icon: CreditCard, to: '/dashboard/transactions', color: 'text-amber-600' },
  { label: 'Overdue tasks', count: 2, icon: CheckSquare, to: '/dashboard/tasks', color: 'text-destructive' },
  { label: 'Pending approvals', count: 1, icon: AlertCircle, to: '/dashboard/bookings', color: 'text-blue-600' },
]

const kpis = [
  { label: 'Revenue (MTD)', value: '€124,500', trend: '+12%', positive: true },
  { label: 'Bookings', value: '24', trend: '+8%', positive: true },
  { label: 'Conversion', value: '34%', trend: '-2%', positive: false },
]

export function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Your operations command center</p>
      </div>

      {/* Command Center */}
      <Card>
        <CardHeader>
          <CardTitle>Operations Command Center</CardTitle>
          <CardDescription>Time-critical items for the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {commandItems.map(({ label, count, icon: Icon, to, color }) => (
              <Link key={label} to={to}>
                <div className="flex items-center gap-4 rounded-lg border border-border p-4 transition-all hover:border-accent/50 hover:shadow-md">
                  <div className={`rounded-lg bg-secondary p-3 ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-2xl font-semibold">{count}</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map(({ label, value, trend, positive }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <span
                className={`text-sm font-medium ${positive ? 'text-green-600' : 'text-destructive'}`}
              >
                {trend}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions & AI */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Create or jump to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/dashboard/bookings/new">
                <Plus className="h-4 w-4" />
                New Booking
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/dashboard/clients/new">New Client</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/dashboard/tasks">View Tasks</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-luxe-accent/30 bg-gradient-to-br from-luxe-accent/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-luxe-accent" />
              AI Assistant
            </CardTitle>
            <CardDescription>
              Get resort recommendations, draft itineraries, create tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/dashboard/ai">
                Open AI Assistant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tasks summary placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>Your assigned tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-3">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1 h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
          <Button asChild variant="ghost" className="mt-4 w-full">
            <Link to="/dashboard/tasks">View all tasks</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
