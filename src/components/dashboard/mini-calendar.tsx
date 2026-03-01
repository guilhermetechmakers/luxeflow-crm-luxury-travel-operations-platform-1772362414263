import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface MiniCalendarProps {
  /** ISO date strings for dates to highlight */
  highlightDates?: string[]
  month?: number
  year?: number
  className?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function MiniCalendar({
  highlightDates = [],
  month = new Date().getMonth(),
  year = new Date().getFullYear(),
  className,
}: MiniCalendarProps) {
  const { days } = useMemo(() => {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const startOffset = first.getDay()
    const totalDays = last.getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < startOffset; i++) days.push(null)
    for (let d = 1; d <= totalDays; d++) days.push(d)
    return { days }
  }, [year, month])

  const highlightSet = useMemo(() => {
    const set = new Set<string>()
    ;(highlightDates ?? []).forEach((d) => set.add(d.slice(0, 10)))
    return set
  }, [highlightDates])

  return (
    <div className={cn('rounded-lg border border-border bg-card p-3', className)}>
      <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
        {new Date(year, month).toLocaleString('default', { month: 'short', year: 'numeric' })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {DAYS.map((d) => (
          <div key={d} className="py-1 font-medium text-muted-foreground">
            {d.slice(0, 2)}
          </div>
        ))}
        {days.map((d, i) => {
          if (d === null) return <div key={`empty-${i}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const isHighlighted = highlightSet.has(dateStr)
          return (
            <div
              key={dateStr}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md',
                isHighlighted ? 'bg-accent/20 font-semibold text-accent' : 'text-foreground'
              )}
            >
              {d}
            </div>
          )
        })}
      </div>
    </div>
  )
}
