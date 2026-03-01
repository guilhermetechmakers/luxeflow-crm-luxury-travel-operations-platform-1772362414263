/**
 * PartnerBadges - Display partner affiliations and statuses
 */
import { ensureArray } from '@/lib/resort-bible-utils'
import type { PartnerRef } from '@/types/resort-bible'
import { cn } from '@/lib/utils'

export interface PartnerBadgesProps {
  partners?: PartnerRef[] | null
  maxVisible?: number
  className?: string
}

export function PartnerBadges({
  partners,
  maxVisible = 5,
  className,
}: PartnerBadgesProps) {
  const list = ensureArray(partners)

  if (list.length === 0) {
    return null
  }

  const visible = list.slice(0, maxVisible)
  const remaining = list.length - maxVisible

  return (
    <div
      className={cn('flex flex-wrap gap-1', className)}
      role="list"
      aria-label="Partner affiliations"
    >
      {visible.map((p) => (
        <span
          key={p.id}
          className="inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent"
          role="listitem"
        >
          {p.name}
        </span>
      ))}
      {remaining > 0 && (
        <span
          className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
          title={`${remaining} more partner${remaining !== 1 ? 's' : ''}`}
        >
          +{remaining}
        </span>
      )}
    </div>
  )
}
