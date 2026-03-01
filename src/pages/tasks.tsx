import { useState } from 'react'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const mockTasks = [
  { id: '1', title: 'Send pre-arrival email', status: 'todo', due: '2025-03-05', assignee: 'You' },
  { id: '2', title: 'Confirm transfer booking', status: 'in-progress', due: '2025-03-06', assignee: 'You' },
  { id: '3', title: 'Prepare welcome pack', status: 'done', due: '2025-03-04', assignee: 'Ops' },
]

export function Tasks() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Tasks</h1>
          <p className="mt-1 text-muted-foreground">Operational tasks and SLAs</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === 'kanban' ? 'default' : 'outline'} size="icon" onClick={() => setView('kanban')}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}>
            <List className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {view === 'kanban' ? (
            <div className="grid gap-4 md:grid-cols-3">
              {['To Do', 'In Progress', 'Done'].map((col) => (
                <div key={col} className="space-y-2">
                  <h3 className="font-medium">{col}</h3>
                  <div className="space-y-2 rounded-lg bg-secondary/30 p-2">
                    {mockTasks
                      .filter((t) =>
                        (col === 'To Do' && t.status === 'todo') ||
                        (col === 'In Progress' && t.status === 'in-progress') ||
                        (col === 'Done' && t.status === 'done')
                      )
                      .map((t) => (
                        <div
                          key={t.id}
                          className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
                        >
                          <p className="font-medium">{t.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">Due: {t.due}</p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {mockTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-sm text-muted-foreground">Due: {t.due} · {t.assignee}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
