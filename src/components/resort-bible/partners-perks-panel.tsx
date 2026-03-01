/**
 * PartnersPerksPanel - List of partnerships and perk details
 * Runtime safety: all arrays guarded
 */
import { Gift, Handshake } from 'lucide-react'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { Resort, PartnerRef } from '@/types/resort-bible'
import { SectionCard } from './section-card'
import { cn } from '@/lib/utils'

export interface PartnersPerksPanelProps {
  resort?: Resort | null
  className?: string
}

export function PartnersPerksPanel({ resort, className }: PartnersPerksPanelProps) {
  const partners = ensureArray(resort?.partners)
  const perks = ensureArray(resort?.perks)

  const partnerPerks = partners.flatMap((p: PartnerRef) => p.perks ?? []).filter(Boolean)
  const allPerks = [...new Set([...perks, ...partnerPerks])]

  return (
    <div className={cn('space-y-4', className)}>
      {partners.length > 0 && (
        <SectionCard
          title="Partners"
          icon={<Handshake className="h-5 w-5 text-accent" />}
        >
          <ul className="space-y-3" role="list">
            {(partners ?? []).map((p) => (
              <li key={p.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <h4 className="font-medium">{p.name}</h4>
                {(p.perks ?? []).length > 0 && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {(p.perks ?? []).join(', ')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {allPerks.length > 0 && (
        <SectionCard
          title="Perks & inclusions"
          icon={<Gift className="h-5 w-5 text-accent" />}
        >
          <ul className="flex flex-wrap gap-2" role="list">
            {allPerks.map((p) => (
              <li key={p}>
                <span className="inline-flex rounded-full bg-accent/15 px-3 py-1 text-sm text-accent">
                  {p}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  )
}
