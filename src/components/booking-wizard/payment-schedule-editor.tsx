/**
 * PaymentScheduleEditor - Milestone-based payment schedule with date pickers, amounts, currency
 * Validation for conflicts with booking dates and deadlines
 */
import { Calendar, Plus, Trash2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ConflictChecker } from '@/lib/booking-utils'
import type { PaymentMilestoneInput } from '@/types/booking'

function nextId(): string {
  return `pm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface PaymentScheduleEditorProps {
  checkIn: string
  checkOut?: string
  totalAmount: number
  currency: string
  value: PaymentMilestoneInput[]
  onChange: (schedule: PaymentMilestoneInput[]) => void
  errors?: string[]
}

export function PaymentScheduleEditor({
  checkIn,
  totalAmount,
  currency,
  value,
  onChange,
  errors = [],
}: PaymentScheduleEditorProps) {
  const schedule = value ?? []
  const sum = schedule.reduce((s, p) => s + (p.amount ?? 0), 0)
  const diff = Math.abs(totalAmount - sum)
  const hasSumMismatch = totalAmount > 0 && diff > 0.01

  const handleAdd = () => {
    const due = checkIn ? new Date(checkIn) : new Date()
    due.setDate(due.getDate() - 14)
    onChange([
      ...schedule,
      {
        id: nextId(),
        milestone: 'Payment',
        due_date: due.toISOString().slice(0, 10),
        amount: 0,
        currency,
      },
    ])
  }

  const getItemId = (p: PaymentMilestoneInput, i: number) => p.id ?? `pm-${i}-${p.milestone}`

  const handleUpdate = (itemId: string, updates: Partial<PaymentMilestoneInput>) => {
    onChange(
      schedule.map((p, i) => (getItemId(p, i) === itemId ? { ...p, ...updates } : p))
    )
  }

  const handleRemove = (itemId: string) => {
    onChange(schedule.filter((p, i) => getItemId(p, i) !== itemId))
  }

  const hasErrors = (errors ?? []).length > 0 || hasSumMismatch

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Payment Schedule & Deadlines</CardTitle>
        <p className="text-sm text-muted-foreground">
          Define milestones with due dates and amounts. Total should match the booking value.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total amount: {formatCurrency(totalAmount, currency)}</span>
          <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4" aria-hidden />
            Add Milestone
          </Button>
        </div>

        {schedule.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="mt-4 text-muted-foreground">No payment milestones</p>
            <Button size="sm" className="mt-4" onClick={handleAdd}>
              Add First Milestone
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.map((item, idx) => {
              const itemId = item.id ?? `pm-${idx}-${item.milestone}`
              const dueDate = item.due_date ? new Date(item.due_date) : null
              const status = item.status ?? 'unpaid'
              const isOverdue =
                dueDate &&
                ConflictChecker.isPaymentOverdue(item.due_date!, status)
              const isDueSoon =
                dueDate &&
                ConflictChecker.isPaymentDueSoon(item.due_date!, status, 7)
              return (
                <div
                  key={itemId}
                  className={cn(
                    'flex flex-col gap-3 rounded-lg border p-4 transition-all sm:flex-row sm:items-end sm:gap-4',
                    isOverdue
                      ? 'border-destructive/50 bg-destructive/5'
                      : isDueSoon
                        ? 'border-amber-500/40 bg-amber-500/5'
                        : 'border-border'
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label className="sr-only">Milestone name</Label>
                    <Input
                      placeholder="e.g. Deposit, Balance"
                      value={item.milestone ?? ''}
                      onChange={(e) => handleUpdate(itemId, { milestone: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="sr-only">Due date</Label>
                        <Input
                          type="date"
                          value={item.due_date ?? ''}
                          onChange={(e) => handleUpdate(itemId, { due_date: e.target.value })}
                        />
                      </div>
                      <div className="w-32">
                        <Label className="sr-only">Amount</Label>
                        <Input
                          type="number"
                          min={0}
                          step={100}
                          placeholder="0"
                          value={item.amount ?? ''}
                          onChange={(e) =>
                            handleUpdate(itemId, { amount: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverdue && (
                      <span
                        className="flex items-center gap-1 text-xs font-medium text-destructive"
                        title="Overdue"
                      >
                        <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                        Overdue
                      </span>
                    )}
                    {isDueSoon && !isOverdue && (
                      <span
                        className="flex items-center gap-1 text-xs font-medium text-amber-600"
                        title="Due soon"
                      >
                        <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                        Due soon
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(item.amount ?? 0, item.currency ?? currency)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(itemId)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove milestone"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {schedule.length > 0 && (
          <div className="rounded-lg border border-border bg-secondary/30 p-3">
            <p className="text-sm">
              Schedule total: <strong>{formatCurrency(sum, currency)}</strong>
              {hasSumMismatch && (
                <span className="ml-2 text-destructive">
                  (diff: {formatCurrency(totalAmount - sum, currency)})
                </span>
              )}
            </p>
          </div>
        )}

        {hasErrors && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            {hasSumMismatch && (
              <p className="text-sm text-destructive">
                Payment schedule total must match the booking amount ({formatCurrency(totalAmount, currency)}).
              </p>
            )}
            {(errors ?? []).map((msg, i) => (
              <p key={i} className="text-sm text-destructive">
                {msg}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
