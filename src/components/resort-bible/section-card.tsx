/**
 * SectionCard - Generic reusable card with title, content, divider, optional edit controls
 * LuxeFlow design: white cards, subtle shadow, 4-8px radius, divider lines
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface SectionCardProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Optional edit button or controls in header */
  editControls?: React.ReactNode
}

export function SectionCard({
  title,
  icon,
  children,
  className,
  editControls,
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        'rounded-lg border border-border bg-card shadow-card transition-shadow duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-3">
        <CardTitle className="flex items-center gap-2 font-serif text-base font-semibold">
          {icon}
          {title}
        </CardTitle>
        {editControls}
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  )
}
