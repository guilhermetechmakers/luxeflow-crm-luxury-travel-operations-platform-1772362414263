/**
 * NextStepsChecklist - Onboarding steps with completion indicators
 * LuxeFlow CRM - Accessible list, progress indicator
 */
import { Check, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChecklistStep {
  id: string
  label: string
  completed?: boolean
}

export interface NextStepsChecklistProps {
  steps: ChecklistStep[]
  onStepClick?: (step: ChecklistStep) => void
  className?: string
}

const stepIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  profile: User,
  team: Users,
}

const DEFAULT_STEPS: ChecklistStep[] = [
  { id: 'profile', label: 'Complete Profile', completed: false },
  { id: 'team', label: 'Invite Team', completed: false },
]

export function NextStepsChecklist({
  steps,
  onStepClick,
  className,
}: NextStepsChecklistProps) {
  const safeSteps =
    Array.isArray(steps) && steps.length > 0 ? steps : DEFAULT_STEPS
  const completedCount = safeSteps.filter((s) => s?.completed === true).length
  const totalCount = safeSteps.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className={cn('space-y-4', className)} role="group" aria-label="Next steps">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">Next steps</span>
        <span className="text-muted-foreground">
          {completedCount} of {totalCount} complete
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Onboarding progress"
      >
        <div
          className="h-full bg-accent transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <ul className="space-y-3" aria-label="Checklist">
        {(safeSteps ?? []).map((step) => {
          const completed = step?.completed === true
          const Icon = stepIcons[step?.id ?? ''] ?? Check
          return (
            <li key={step?.id ?? 'unknown'}>
              <button
                type="button"
                onClick={() => onStepClick?.(step)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-all duration-200',
                  'hover:border-accent/40 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  completed && 'border-accent/30 bg-accent/5'
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    completed ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {completed ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    <Icon className="h-4 w-4" aria-hidden />
                  )}
                </span>
                <span
                  className={cn(
                    'flex-1 font-medium',
                    completed ? 'text-muted-foreground line-through' : 'text-foreground'
                  )}
                >
                  {step?.label ?? 'Step'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
