/**
 * Quick Actions widget - shortcuts for New Client, New Booking, Create Task, Search Resort
 */
import { Link } from 'react-router-dom'
import { UserPlus, FileText, CheckSquare, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ACTIONS = [
  { label: 'New Client', icon: UserPlus, to: '/dashboard/clients/new' },
  { label: 'New Booking', icon: FileText, to: '/dashboard/bookings/new' },
  { label: 'Create Task', icon: CheckSquare, to: '/dashboard/tasks?new=1' },
  { label: 'Search Resort', icon: Search, to: '/dashboard/resorts' },
] as const

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Create or jump to common tasks</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {ACTIONS.map(({ label, icon: Icon, to }) => (
          <Button key={label} asChild variant="outline" className="transition-all duration-200 hover:scale-[1.02]">
            <Link to={to}>
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
