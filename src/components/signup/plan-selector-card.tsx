/**
 * PlanSelectorCard - Plan options with trial default and pricing
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface Plan {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
}

export interface PlanSelectorCardProps {
  plans: Plan[]
  selectedPlanId: string
  onSelect: (planId: string) => void
  disabled?: boolean
}

export function PlanSelectorCard({
  plans,
  selectedPlanId,
  onSelect,
  disabled,
}: PlanSelectorCardProps) {
  const plansList = Array.isArray(plans) ? plans : []

  return (
    <Card className="shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg">Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plansList.map((plan) => {
            const isSelected = selectedPlanId === plan.id
            const isTrial = plan.id === 'trial'

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => !disabled && onSelect(plan.id)}
                disabled={disabled}
                className={cn(
                  'flex flex-col rounded-lg border-2 p-4 text-left transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-accent bg-accent/5 shadow-md'
                    : 'border-border bg-card hover:border-accent/50 hover:shadow-sm',
                  disabled && 'cursor-not-allowed opacity-60'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-semibold">{plan.name}</span>
                  {isTrial && (
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                      Default
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold">
                    ${plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/{plan.duration}</span>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {(plan.features ?? []).map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
