/**
 * DateRangePicker - Presets and custom range with validation
 * Presets: Last 7 days, 14 days, 30 days, YTD, Custom
 */
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DateRangePreset } from '@/types/reporting'

export interface DateRangePickerProps {
  startDate: string
  endDate: string
  preset?: DateRangePreset
  onRangeChange: (startDate: string, endDate: string, preset: DateRangePreset) => void
  maxRangeDays?: number
  className?: string
}

function getPresetRange(preset: DateRangePreset): { start: string; end: string } {
  const end = new Date()
  const start = new Date()

  switch (preset) {
    case '7d':
      start.setDate(start.getDate() - 7)
      break
    case '14d':
      start.setDate(start.getDate() - 14)
      break
    case '30d':
      start.setDate(start.getDate() - 30)
      break
    case 'ytd':
      start.setMonth(0)
      start.setDate(1)
      break
    default:
      return { start: '', end: '' }
  }

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

export function DateRangePicker({
  startDate,
  endDate,
  preset = '30d',
  onRangeChange,
  maxRangeDays = 365,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [customStart, setCustomStart] = useState(startDate)
  const [customEnd, setCustomEnd] = useState(endDate)
  const [activePreset, setActivePreset] = useState<DateRangePreset>(preset)

  useEffect(() => {
    setCustomStart(startDate)
    setCustomEnd(endDate)
    setActivePreset(preset)
  }, [startDate, endDate, preset])

  const handlePresetSelect = (value: string) => {
    const p = value as DateRangePreset
    if (p === 'custom') {
      setActivePreset('custom')
      return
    }
    const { start, end } = getPresetRange(p)
    setActivePreset(p)
    setCustomStart(start)
    setCustomEnd(end)
    onRangeChange(start, end, p)
    setOpen(false)
  }

  const handleCustomApply = () => {
    const s = customStart
    const e = customEnd
    if (!s || !e) return
    const startD = new Date(s)
    const endD = new Date(e)
    if (startD > endD) {
      setCustomEnd(s)
      setCustomStart(e)
      onRangeChange(e, s, 'custom')
    } else {
      const diff = Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24))
      if (diff > maxRangeDays) return
      onRangeChange(s, e, 'custom')
    }
    setActivePreset('custom')
    setOpen(false)
  }

  const displayLabel =
    activePreset === 'custom'
      ? `${startDate} — ${endDate}`
      : activePreset === '7d'
        ? 'Last 7 days'
        : activePreset === '14d'
          ? 'Last 14 days'
          : activePreset === '30d'
            ? 'Last 30 days'
            : activePreset === 'ytd'
              ? 'Year to date'
              : `${startDate} — ${endDate}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('min-w-[200px] justify-start gap-2', className)}
          aria-label="Select date range"
        >
          <Calendar className="h-4 w-4 shrink-0" />
          <span className="truncate">{displayLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Presets
            </Label>
            <Select value={activePreset} onValueChange={handlePresetSelect}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="14d">Last 14 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Custom range
            </Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                max={customEnd || undefined}
                aria-label="Start date"
              />
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                min={customStart || undefined}
                aria-label="End date"
              />
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={handleCustomApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
