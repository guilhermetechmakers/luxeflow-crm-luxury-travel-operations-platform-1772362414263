/**
 * KidsPolicyPanel - Policy text, age ranges, recommended accommodations
 * Runtime safety: guarded access
 */
import { Users } from 'lucide-react'
import type { Resort } from '@/types/resort-bible'
import { SectionCard } from './section-card'
import { cn } from '@/lib/utils'

export interface KidsPolicyPanelProps {
  resort?: Resort | null
  className?: string
}

export function KidsPolicyPanel({ resort, className }: KidsPolicyPanelProps) {
  const kidsPolicy = resort?.kidsPolicy ?? ''

  if (!kidsPolicy) {
    return (
      <SectionCard
        title="Kids policy"
        icon={<Users className="h-5 w-5 text-accent" />}
      >
        <p className="text-muted-foreground">—</p>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Kids policy"
      icon={<Users className="h-5 w-5 text-accent" />}
      className={cn(className)}
    >
      <p className="text-muted-foreground">{kidsPolicy}</p>
    </SectionCard>
  )
}
