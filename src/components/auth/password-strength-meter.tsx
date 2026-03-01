/**
 * PasswordStrengthMeter - Visual and textual password strength feedback
 * LuxeFlow CRM - Uses project validation utilities
 */
import { getPasswordStrength } from '@/lib/validation'
import { cn } from '@/lib/utils'

export interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const { score, label, checks } = getPasswordStrength(password ?? '')

  if (!password || password.length === 0) {
    return null
  }

  const barColors = [
    'bg-destructive',
    'bg-destructive/80',
    'bg-amber-500',
    'bg-accent/80',
    'bg-accent',
  ]
  const barColor = barColors[Math.min(score, 4)]

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Password strength: ${label}`}
      className={cn('space-y-2', className)}
    >
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i < score ? barColor : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{label}</span>
      </p>
      <ul className="space-y-1 text-xs text-muted-foreground" aria-hidden>
        {(checks ?? []).map((check, i) => (
          <li
            key={i}
            className={cn(
              'flex items-center gap-2',
              check.met ? 'text-accent' : 'text-muted-foreground'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full',
                check.met ? 'bg-accent' : 'bg-muted'
              )}
            />
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
