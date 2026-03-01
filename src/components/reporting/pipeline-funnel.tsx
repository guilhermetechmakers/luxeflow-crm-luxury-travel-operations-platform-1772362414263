/**
 * PipelineFunnel - Visual representation of stages Quote → Confirmed
 * Shows conversion rates between stages with tooltips
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PipelineStage } from '@/types/reporting'

export interface PipelineFunnelProps {
  stages: PipelineStage[]
  isLoading?: boolean
}

export function PipelineFunnel({ stages, isLoading = false }: PipelineFunnelProps) {
  const list = Array.isArray(stages) ? stages : []
  const maxCount = Math.max(...list.map((s) => s.count ?? 0), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-lg">
          <Filter className="h-5 w-5 text-accent" />
          Pipeline Funnel
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quote → Confirmed conversion
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Filter className="h-12 w-12 opacity-50" />
            <p className="text-sm">No pipeline data for the selected filters</p>
          </div>
        ) : (
          <div className="space-y-4" role="list" aria-label="Pipeline stages">
            {list.map((stage, idx) => {
              const width = maxCount > 0 ? Math.max(20, ((stage.count ?? 0) / maxCount) * 100) : 20
              return (
                <TooltipProvider key={stage.stage}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        role="listitem"
                        className="group relative"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium">{stage.stage}</span>
                          <span className="text-sm text-muted-foreground">
                            {stage.count ?? 0} deals
                            {stage.value != null && stage.value > 0 && (
                              <> · €{(stage.value ?? 0).toLocaleString('en-EU')}</>
                            )}
                          </span>
                        </div>
                        <div
                          className={cn(
                            'h-10 rounded-lg transition-all duration-300',
                            'bg-accent/20 group-hover:bg-accent/30'
                          )}
                          style={{ width: `${width}%` }}
                        />
                        {stage.conversionRate != null && idx > 0 && (
                          <span className="absolute -right-2 top-1/2 -translate-y-1/2 rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                            {stage.conversionRate}%
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="font-medium">{stage.stage}</p>
                      <p className="text-sm text-muted-foreground">
                        {stage.count ?? 0} deals, €{(stage.value ?? 0).toLocaleString('en-EU')} total
                        {stage.conversionRate != null && (
                          <> · {stage.conversionRate}% conversion</>
                        )}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
