/**
 * RelatedEntitiesRail - Quick access to Client, Resort, Tasks, Proposals
 * Collapsible right-side panel with deep links
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Building2,
  CheckSquare,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BookingDetail } from '@/types/booking'

export interface RelatedTask {
  id: string
  title: string
  status: string
  due_date?: string
}

export interface RelatedProposal {
  id: string
  title?: string
  status?: string
}

export interface RelatedEntitiesRailProps {
  detail: BookingDetail | null
  tasks?: RelatedTask[]
  proposals?: RelatedProposal[]
  isLoading?: boolean
  defaultCollapsed?: boolean
}

export function RelatedEntitiesRail({
  detail,
  tasks = [],
  proposals = [],
  isLoading = false,
  defaultCollapsed = false,
}: RelatedEntitiesRailProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const taskList = Array.isArray(tasks) ? tasks : []
  const proposalList = Array.isArray(proposals) ? proposals : []

  if (isLoading) {
    return (
      <Card className="w-full sm:w-72">
        <CardHeader>
          <CardTitle>Related</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-secondary/50"
                aria-hidden
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!detail) return null

  const clientId = detail.client_id ?? detail.client?.id
  const resortId = detail.resort_id ?? detail.resort?.id
  const clientName = detail.client?.name ?? 'Client'
  const resortName = detail.resort?.name ?? 'Resort'

  const hasContent =
    clientId ||
    resortId ||
    taskList.length > 0 ||
    proposalList.length > 0

  if (!hasContent) return null

  const content = (
    <Card className="w-full sm:w-72">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Related</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand rail' : 'Collapse rail'}
          className="shrink-0"
        >
          <ChevronRight
            className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
            aria-hidden
          />
        </Button>
      </CardHeader>
      {!collapsed && (
        <CardContent className="space-y-4">
          {clientId && (
            <Link
              to={`/dashboard/clients/${clientId}`}
              className={cn(
                'flex items-center gap-3 rounded-lg border border-border p-3 transition-all duration-200',
                'hover:border-accent/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
            >
              <div className="shrink-0 rounded-lg bg-secondary p-2">
                <User className="h-4 w-4 text-muted-foreground" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Client
                </p>
                <p className="truncate font-medium">{clientName}</p>
              </div>
            </Link>
          )}

          {resortId && (
            <Link
              to={`/dashboard/resorts/${resortId}`}
              className={cn(
                'flex items-center gap-3 rounded-lg border border-border p-3 transition-all duration-200',
                'hover:border-accent/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
            >
              <div className="shrink-0 rounded-lg bg-secondary p-2">
                <Building2
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Resort
                </p>
                <p className="truncate font-medium">{resortName}</p>
              </div>
            </Link>
          )}

          {taskList.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tasks
              </p>
              <ul className="space-y-2">
                {(taskList ?? []).slice(0, 3).map((task) => (
                  <li key={task.id}>
                    <Link
                      to={`/dashboard/tasks?booking=${detail.id}`}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-all duration-200',
                        'hover:border-accent/30'
                      )}
                    >
                      <CheckSquare
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <span className="truncate">{task.title ?? 'Task'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {proposalList.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Proposals
              </p>
              <ul className="space-y-2">
                {(proposalList ?? []).slice(0, 3).map((prop) => (
                  <li key={prop.id}>
                    <Link
                      to={`/dashboard/proposals/${prop.id}`}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-all duration-200',
                        'hover:border-accent/30'
                      )}
                    >
                      <FileText
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <span className="truncate">
                        {prop.title ?? `Proposal ${prop.id}`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )

  return (
    <aside
      className={cn(
        'shrink-0 transition-all duration-300',
        collapsed && 'sm:w-12'
      )}
      aria-label="Related entities"
    >
      {content}
    </aside>
  )
}
