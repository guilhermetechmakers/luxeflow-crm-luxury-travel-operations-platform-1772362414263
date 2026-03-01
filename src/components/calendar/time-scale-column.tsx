/**
 * TimeScaleColumn - Hours of day in 30-minute increments
 * LuxeFlow design: clean typography, subtle borders
 */
import { cn } from '@/lib/utils'

export const PX_PER_HOUR = 48
export const SLOTS_PER_HOUR = 2
export const PX_PER_SLOT = PX_PER_HOUR / SLOTS_PER_HOUR

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7:00 - 20:00

export interface TimeScaleColumnProps {
  className?: string
}

export function TimeScaleColumn({ className }: TimeScaleColumnProps) {
  return (
    <div
      className={cn('flex flex-col shrink-0', className)}
      role="presentation"
      aria-hidden
    >
      <div className="h-10 shrink-0" /> {/* Header spacer */}
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="flex items-start border-b border-border/50"
          style={{ height: PX_PER_HOUR }}
        >
          <span className="text-xs text-muted-foreground pt-0.5">
            {String(hour).padStart(2, '0')}:00
          </span>
        </div>
      ))}
    </div>
  )
}
