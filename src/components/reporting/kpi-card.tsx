/**
 * KPICard - Reusable metric tile for Reporting & Performance
 * Displays a single KPI with optional trend and tooltip
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { HelpCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface KPICardProps {
  label: string
  value: string | number
  trend?: string
  trendUp?: boolean
  tooltip?: string
  icon?: React.ReactNode
  className?: string
}

export function KPICard({
  label,
  value,
  trend,
  trendUp = true,
  tooltip,
  icon,
  className,
}: KPICardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label={`More info about ${label}`}
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground">{icon}</div>
        )}
      </CardHeader>
      <CardContent>
        <p className="font-serif text-2xl font-semibold text-foreground">
          {value}
        </p>
        {trend != null && trend !== '' && (
          <div
            className={cn(
              'mt-1 flex items-center gap-1 text-sm',
              trendUp ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trendUp ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
