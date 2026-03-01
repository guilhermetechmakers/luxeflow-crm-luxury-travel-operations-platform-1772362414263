/**
 * DiningPanel - List of dining venues with hours, dress codes, notes
 * Supports string[], DiningOption[], and DiningSection[] formats
 * Runtime safety: all arrays guarded
 */
import { Utensils } from 'lucide-react'
import type { Resort, DiningOption, DiningSection } from '@/types/resort-bible'
import { SectionCard } from './section-card'
import { cn } from '@/lib/utils'

export interface DiningPanelProps {
  resort?: Resort | null
  className?: string
}

type DiningItem = { id?: string; name: string; hours?: string; notes?: string }

function normalizeDining(dining: Resort['dining']): DiningItem[] {
  if (!dining) return []
  if (!Array.isArray(dining)) return []
  const first = dining[0]
  if (typeof first === 'string') {
    return (dining as string[]).map((name, i) => ({ id: `d-${i}`, name }))
  }
  if (first && typeof first === 'object' && 'name' in first) {
    return (dining as DiningSection[]).map((d) => ({
      id: d.id,
      name: d.name,
      hours: d.hours,
      notes: d.notes,
    }))
  }
  return (dining as DiningOption[]).flatMap((d, i) => {
    const opts = d.options ?? []
    const hoursArr = Array.isArray(d.hours) ? d.hours : d.hours ? [d.hours] : []
    return opts.map((opt, j) => ({
      id: `d-${i}-${j}`,
      name: opt,
      hours: hoursArr[j],
      notes: d.notes,
    }))
  })
}

export function DiningPanel({ resort, className }: DiningPanelProps) {
  const items = normalizeDining(resort?.dining)

  if (items.length === 0) {
    return (
      <SectionCard
        title="Dining"
        icon={<Utensils className="h-5 w-5 text-accent" />}
      >
        <p className="text-muted-foreground">No dining information</p>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Dining"
      icon={<Utensils className="h-5 w-5 text-accent" />}
      className={cn(className)}
    >
      <ul className="space-y-4" role="list">
        {items.map((item) => (
          <li
            key={item.id ?? item.name}
            className="border-b border-border pb-4 last:border-0 last:pb-0"
          >
            <h4 className="font-medium text-foreground">{item.name}</h4>
            {item.hours && (
              <p className="mt-1 text-sm text-muted-foreground">
                Hours: {item.hours}
              </p>
            )}
            {item.notes && (
              <p className="mt-1 text-sm text-muted-foreground italic">
                {item.notes}
              </p>
            )}
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
