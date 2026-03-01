/**
 * RestrictionsPanel - Deposit, cancellation, minimum stay rules
 * Runtime safety: all arrays guarded
 */
import { AlertCircle } from 'lucide-react'
import type { Resort } from '@/types/resort-bible'
import { SectionCard } from './section-card'
import { cn } from '@/lib/utils'

export interface RestrictionsPanelProps {
  resort?: Resort | null
  className?: string
}

function normalizeRestrictions(restrictions: Resort['restrictions']): string[] {
  if (!restrictions) return []
  if (Array.isArray(restrictions)) return restrictions
  return [restrictions]
}

export function RestrictionsPanel({ resort, className }: RestrictionsPanelProps) {
  const restrictions = normalizeRestrictions(resort?.restrictions)

  if (restrictions.length === 0) {
    return (
      <SectionCard
        title="Restrictions"
        icon={<AlertCircle className="h-5 w-5 text-accent" />}
      >
        <p className="text-muted-foreground">No restrictions listed</p>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Restrictions"
      icon={<AlertCircle className="h-5 w-5 text-accent" />}
      className={cn(className)}
    >
      <ul className="list-disc space-y-1 pl-4 text-muted-foreground" role="list">
        {restrictions.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </SectionCard>
  )
}
