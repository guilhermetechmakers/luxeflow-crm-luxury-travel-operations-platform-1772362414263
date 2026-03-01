/**
 * TimelineComponent - Timeline of stages with timestamps, actors, editable stage dates
 * Horizontal layout for desktop, vertical stacked on mobile
 */
import { Check, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TimelineStage, TimelineStageType } from '@/types/booking'

const STAGE_ORDER: TimelineStageType[] = [
  'quote',
  'confirmed',
  'pre_arrival',
  'in_stay',
  'post_stay',
]

const STAGE_LABELS: Record<TimelineStageType, string> = {
  quote: 'Quote',
  confirmed: 'Confirmed',
  pre_arrival: 'Pre-arrival',
  in_stay: 'In-stay',
  post_stay: 'Post-stay',
}

export interface TimelineComponentProps {
  stages: TimelineStage[]
  currentStatus?: string
  onStageDateChange?: (stageId: string, timestamp: string) => void
  canEdit?: boolean
}

export function TimelineComponent({
  stages = [],
  currentStatus,
}: TimelineComponentProps) {
  const stageMap = new Map((stages ?? []).map((s) => [s.stage, s]))
  const orderedStages = STAGE_ORDER.map((stage) => ({
    key: stage,
    label: STAGE_LABELS[stage],
    data: stageMap.get(stage),
  }))

  const currentIndex = STAGE_ORDER.indexOf((currentStatus as TimelineStageType) ?? 'quote')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex min-w-max flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">
            {(orderedStages ?? []).map((item, idx) => {
              const isComplete = currentIndex > idx || (item.data && currentIndex >= idx)
              const isCurrent = currentIndex === idx

              return (
                <div
                  key={item.key}
                  className={cn(
                    'flex flex-1 items-center gap-2 rounded-lg border px-4 py-3 transition-all duration-200',
                    isCurrent && 'border-accent bg-accent/10',
                    isComplete && !isCurrent && 'border-green-500/30 bg-green-500/5',
                    !isComplete && 'border-border bg-secondary/30'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      isComplete ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4" aria-hidden />
                    ) : (
                      <span className="text-xs font-medium">{idx + 1}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.label}</p>
                    {item.data?.timestamp && (
                      <p className="text-xs text-muted-foreground">
                        {formatShortDate(item.data.timestamp)}
                        {item.data.actor_name ? ` · ${item.data.actor_name}` : ''}
                      </p>
                    )}
                  </div>
                  {idx < orderedStages.length - 1 && (
                    <ChevronRight
                      className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block"
                      aria-hidden
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
