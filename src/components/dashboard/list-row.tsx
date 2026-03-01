import { cn } from '@/lib/utils'

export interface ListRowProps {
  title: string
  subtitle?: string
  badge?: React.ReactNode
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

export function ListRow({ title, subtitle, badge, onClick, className, children }: ListRowProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={cn(
        'flex items-center gap-4 rounded-lg border border-border p-3 transition-all duration-200',
        onClick && 'cursor-pointer hover:border-accent/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{title}</p>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {badge}
      {children}
    </div>
  )
}
