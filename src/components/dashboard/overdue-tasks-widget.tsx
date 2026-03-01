import { Link } from 'react-router-dom'
import { CheckSquare } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatShortDate } from '@/lib/format'
import { getPriorityColor } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/dashboard'

interface OverdueTasksWidgetProps {
  tasks: Task[]
  isLoading?: boolean
}

export function OverdueTasksWidget({ tasks = [], isLoading = false }: OverdueTasksWidgetProps) {
  const items = Array.isArray(tasks) ? tasks : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overdue Tasks</CardTitle>
          <CardDescription>Tasks past due date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Overdue Tasks</CardTitle>
          <CardDescription>Tasks past due date</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/tasks">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckSquare className="h-12 w-12 text-muted-foreground/50" aria-hidden />
            <p className="mt-2 text-sm text-muted-foreground">No overdue tasks</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {(items ?? []).map((t) => (
              <li key={t?.id ?? ''}>
                <Link
                  to="/dashboard/tasks"
                  className="flex items-center gap-4 rounded-lg border border-border p-3 transition-all hover:border-accent/30 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <CheckSquare className="h-5 w-5 text-destructive" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{t?.title ?? '—'}</p>
                    <p className="text-sm text-muted-foreground">
                      {t?.assigneeName ?? 'Unassigned'} · {formatShortDate(t?.dueDate)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium',
                      getPriorityColor(t?.priority ?? '')
                    )}
                  >
                    {t?.priority ?? 'medium'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
