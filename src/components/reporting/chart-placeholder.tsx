/**
 * ChartPlaceholder - Accessible placeholder for future chart integrations
 * Use where charts will be added later; ensures proper ARIA labels and layout
 */
import { cn } from '@/lib/utils'

export interface ChartPlaceholderProps {
  title?: string
  description?: string
  className?: string
  'aria-label'?: string
}

export function ChartPlaceholder({
  title = 'Chart',
  description = 'Chart visualization will appear here.',
  className,
  'aria-label': ariaLabel = 'Chart placeholder',
}: ChartPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        'flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8',
        className
      )}
    >
      <div className="h-12 w-12 rounded-full bg-accent/20" aria-hidden />
      <p className="mt-3 font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
