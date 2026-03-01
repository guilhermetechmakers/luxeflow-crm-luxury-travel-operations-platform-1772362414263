/**
 * SeasonalityPanel - Seasonal calendar or stacked indicators (no heavy charts)
 * Runtime safety: all arrays guarded
 */
import { Calendar } from 'lucide-react'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { Resort, Seasonal } from '@/types/resort-bible'
import { SectionCard } from './section-card'
import { cn } from '@/lib/utils'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export interface SeasonalityPanelProps {
  resort?: Resort | null
  className?: string
}

function formatSeasonRange(s: Seasonal): string {
  const start = MONTHS[(s.startMonth ?? 1) - 1]
  const end = MONTHS[(s.endMonth ?? 12) - 1]
  return s.notes ? `${start}–${end} (${s.notes})` : `${start}–${end}`
}

export function SeasonalityPanel({ resort, className }: SeasonalityPanelProps) {
  const seasonality = ensureArray(resort?.seasonality)

  if (seasonality.length === 0) {
    return (
      <SectionCard
        title="Seasonality"
        icon={<Calendar className="h-5 w-5 text-accent" />}
      >
        <p className="text-muted-foreground">No seasonality data</p>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Seasonality"
      icon={<Calendar className="h-5 w-5 text-accent" />}
      className={cn(className)}
    >
      <div className="space-y-3">
        {seasonality.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-md border border-border bg-secondary/50 px-3 py-2"
          >
            <span className="font-medium">{formatSeasonRange(s)}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
