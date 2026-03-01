import { Link } from 'react-router-dom'
import { UserPlus, FileText, CheckSquare, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const actions = [
  { label: 'New Client', icon: UserPlus, to: '/dashboard/clients', description: 'Add a new client' },
  { label: 'New Booking', icon: FileText, to: '/dashboard/bookings/new', description: 'Create booking' },
  { label: 'Create Task', icon: CheckSquare, to: '/dashboard/tasks', description: 'Add a task' },
  { label: 'Search Resort', icon: Search, to: '/dashboard/resorts', description: 'Find resorts' },
]

export function QuickActionsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Create or jump to common tasks</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {actions.map(({ label, icon: Icon, to, description }) => (
          <Button key={label} asChild variant="outline" className="transition-all hover:scale-[1.02]">
            <Link to={to} aria-label={description}>
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
