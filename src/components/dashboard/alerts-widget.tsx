/**
 * Alerts widget - time-sensitive alerts with priority, description, due date
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import type { Alert } from '@/types/dashboard'

interface AlertsWidgetProps {
  alerts: Alert[]
}

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : ''

const priorityVariant = (p: Alert['priority']) => {
  switch (p) {
    case 'critical':
      return 'destructive'
    case 'high':
      return 'warning'
    case 'medium':
      return 'info'
    default:
      return 'secondary'
  }
}

export function AlertsWidget({ alerts = [] }: AlertsWidgetProps) {
  const items = Array.isArray(alerts) ? alerts : []
  const sorted = [...items].sort((a, b) => {
    const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0
    const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0
    return aDate - bDate
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" aria-hidden />
          Alerts
        </CardTitle>
        <CardDescription>Time-sensitive items requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50" aria-hidden />
            <p className="mt-2 text-sm text-muted-foreground">No alerts</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {sorted.slice(0, 5).map((alert) => (
              <li
                key={alert.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3 transition-all duration-200 hover:border-accent/30"
              >
                <Badge variant={priorityVariant(alert.priority)} className="shrink-0">
                  {alert.priority}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  {alert.dueDate && (
                    <p className="mt-1 text-xs text-muted-foreground">Due {formatDate(alert.dueDate)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
