/**
 * DeadlinesSlaCard - Deadlines related to approvals, document deliveries, task due dates
 */
import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface DeadlineItem {
  id: string
  title: string
  due_date: string
  type: string
}

export interface DeadlinesSlaCardProps {
  deadlines: DeadlineItem[]
  isLoading?: boolean
}

export function DeadlinesSlaCard({
  deadlines = [],
  isLoading = false,
}: DeadlinesSlaCardProps) {
  const items = (deadlines ?? []).slice().sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )
  const now = new Date()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deadlines & SLA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-secondary/50" aria-hidden />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deadlines & SLA</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50" aria-hidden />
            <p className="mt-2 text-sm text-muted-foreground">No deadlines</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {(items ?? []).map((d) => {
              const isOverdue = new Date(d.due_date) < now
              return (
                <li
                  key={d.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2',
                    isOverdue ? 'border-destructive/30 bg-destructive/5' : 'border-border'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <span className="font-medium">{d.title}</span>
                    <span className="text-xs text-muted-foreground capitalize">({d.type})</span>
                  </div>
                  <span
                    className={cn(
                      'text-sm',
                      isOverdue ? 'font-medium text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {formatShortDate(d.due_date)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
