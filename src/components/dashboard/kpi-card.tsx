import { cn } from '@/lib/utils'

export interface KPICardProps {
  label: string
  value: string | number
  trend?: string
  positive?: boolean
  icon?: React.ReactNode
  className?: string
}

export function KPICard({ label, value, trend, positive, icon, className }: KPICardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {trend != null && (
          <span
            className={cn(
              'text-sm font-medium',
              positive === true ? 'text-green-600' : positive === false ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {trend}
          </span>
        )}
        {icon}
      </div>
      <p className="mt-2 font-serif text-2xl font-semibold">{value}</p>
    </div>
  )
}
