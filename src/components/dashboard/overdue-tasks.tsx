/**
 * Overdue Tasks widget - list with title, due date, assignee, priority
 */
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Task } from '@/types/dashboard'

interface OverdueTasksProps {
  tasks: Task[]
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

const priorityVariant = (p: Task['priority']) => {
  switch (p) {
    case 'urgent':
      return 'destructive'
    case 'high':
      return 'warning'
    case 'medium':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function OverdueTasks({ tasks = [] }: OverdueTasksProps) {
  const items = Array.isArray(tasks) ? tasks : []
  const sorted = [...items].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overdue Tasks</CardTitle>
        <CardDescription>Tasks past due date</CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No overdue tasks</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {sorted.slice(0, 5).map((task) => (
              <li key={task.id}>
                <Link
                  to={`/dashboard/tasks?task=${task.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
                >
                  <Badge variant={priorityVariant(task.priority)} className="shrink-0">
                    {task.priority}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {formatDate(task.dueDate)}
                      {task.assigneeName && ` · ${task.assigneeName}`}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {sorted.length > 5 && (
          <Link
            to="/dashboard/tasks"
            className="mt-4 block text-center text-sm font-medium text-accent hover:underline"
          >
            View all ({sorted.length})
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
