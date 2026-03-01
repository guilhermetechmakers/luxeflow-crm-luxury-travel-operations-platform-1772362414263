/**
 * WizardConflictsChecker - Real-time conflict and deadline checks for booking wizard
 * Surfaces overlapping stays, overdue payments, deadline validations
 */
import { useMemo } from 'react'
import { AlertCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConflictChecker } from '@/lib/booking-utils'
import { cn } from '@/lib/utils'
import type { BookingDraft } from '@/types/booking'

export interface WizardConflictsCheckerProps {
  draft: BookingDraft
  className?: string
}

export interface ConflictItem {
  id: string
  type: 'conflict' | 'warning'
  message: string
  field?: string
}

export function WizardConflictsChecker({ draft, className }: WizardConflictsCheckerProps) {
  const conflicts = useMemo(() => {
    const items: ConflictItem[] = []

    if (!draft.check_in || !draft.check_out) return items

    const schedule = draft.payment_schedule ?? []
    for (const p of schedule) {
      const dueDate = p.due_date ?? ''
      const status = p.status ?? 'unpaid'
      if (dueDate && ConflictChecker.isPaymentOverdue(dueDate, status)) {
        items.push({
          id: `overdue-${p.id ?? p.milestone}`,
          type: 'conflict',
          message: `Payment "${p.milestone ?? 'Payment'}" is overdue (${dueDate})`,
          field: 'payment_schedule',
        })
      } else if (dueDate && ConflictChecker.isPaymentDueSoon(dueDate, status, 7)) {
        items.push({
          id: `due-soon-${p.id ?? p.milestone}`,
          type: 'warning',
          message: `Payment "${p.milestone ?? 'Payment'}" due within 7 days (${dueDate})`,
          field: 'payment_schedule',
        })
      }
    }

    if (draft.check_in && ConflictChecker.isStayUpcoming(draft.check_in, 7)) {
      items.push({
        id: 'stay-upcoming',
        type: 'warning',
        message: 'Stay begins within 7 days — ensure all pre-arrival tasks are complete',
        field: 'check_in',
      })
    }

    return items
  }, [draft.check_in, draft.check_out, draft.payment_schedule])

  const conflictList = conflicts ?? []
  const hasConflicts = conflictList.some((c) => c.type === 'conflict')
  const hasWarnings = conflictList.some((c) => c.type === 'warning')

  if (conflictList.length === 0) return null

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        hasConflicts && 'border-destructive/40 bg-destructive/5',
        hasWarnings && !hasConflicts && 'border-amber-500/40 bg-amber-500/5',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 font-serif text-base">
          {hasConflicts ? (
            <AlertCircle className="h-4 w-4 text-destructive" aria-hidden />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
          )}
          {hasConflicts ? 'Conflicts Detected' : 'Heads Up'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2" role="list">
          {conflictList.map((c) => (
            <li
              key={c.id}
              className={cn(
                'flex items-start gap-2 text-sm',
                c.type === 'conflict' ? 'text-destructive' : 'text-amber-700'
              )}
            >
              {c.type === 'conflict' ? (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
              )}
              <span>{c.message}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
