/**
 * ResortPoliciesPanel - Dining options, kids policy, restrictions, transfer times
 * Supports both legacy string[] dining and DiningOption[] format
 */
import { Utensils, Users, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Resort, DiningOption } from '@/types/resort-bible'
import { cn } from '@/lib/utils'

export interface ResortPoliciesPanelProps {
  resort?: Resort | null
  className?: string
}

function normalizeDining(dining: Resort['dining']): string[] {
  if (!dining) return []
  if (Array.isArray(dining)) {
    const first = dining[0]
    if (typeof first === 'string') return dining as string[]
    return (dining as DiningOption[]).flatMap((d) => d.options ?? [])
  }
  return []
}

function normalizeRestrictions(restrictions: Resort['restrictions']): string[] {
  if (!restrictions) return []
  if (Array.isArray(restrictions)) return restrictions
  return [restrictions]
}

function getTransferDisplay(resort: Resort): string {
  const times = resort?.transferTimes
  if (Array.isArray(times) && times.length > 0) {
    return times.join('; ')
  }
  return resort?.transferTime ?? '—'
}

export function ResortPoliciesPanel({ resort, className }: ResortPoliciesPanelProps) {
  const dining = normalizeDining(resort?.dining)
  const restrictions = normalizeRestrictions(resort?.restrictions)
  const transferDisplay = resort ? getTransferDisplay(resort) : '—'
  const kidsPolicy = resort?.kidsPolicy ?? '—'

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Dining options
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dining.length === 0 ? (
            <p className="text-muted-foreground">No dining information</p>
          ) : (
            <ul className="list-disc space-y-1 pl-4 text-muted-foreground" role="list">
              {dining.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kids policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{kidsPolicy}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transfer times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{transferDisplay}</p>
        </CardContent>
      </Card>

      {restrictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-4 text-muted-foreground" role="list">
              {restrictions.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
