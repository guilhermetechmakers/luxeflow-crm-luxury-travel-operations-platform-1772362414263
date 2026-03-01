import { useState } from 'react'
import { TrendingUp, FileText, Banknote } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/format'
import { useRevenueSnapshot } from '@/hooks/use-dashboard-data'
import type { RevenueSnapshot, DateRangeKey } from '@/types/dashboard'

const RANGE_OPTIONS: { value: DateRangeKey; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

interface KPICardProps {
  label: string
  value: string | number
  icon: React.ElementType
  className?: string
}

function KPICard({ label, value, icon: Icon, className }: KPICardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-4 transition-all hover:shadow-card-hover ${className ?? ''}`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}

export function RevenueSnapshotWidget() {
  const [range, setRange] = useState<DateRangeKey>('7d')
  const { data, isLoading } = useRevenueSnapshot(range)

  const snapshot = data ?? ({} as RevenueSnapshot)
  const bookings = snapshot?.bookings ?? 0
  const gbv = snapshot?.gbv ?? 0
  const commission = snapshot?.commission ?? 0
  const currency = snapshot?.currency ?? 'EUR'

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Snapshot</CardTitle>
          <CardDescription>Bookings, GBV, and commission</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Revenue Snapshot</CardTitle>
          <CardDescription>Bookings, GBV, and commission</CardDescription>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as DateRangeKey)}>
          <SelectTrigger className="w-[160px]" aria-label="Date range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <KPICard
            label="Bookings"
            value={bookings}
            icon={FileText}
            className="border-l-4 border-l-luxe-accent"
          />
          <KPICard
            label="Gross Booking Value"
            value={formatCurrency(gbv, currency)}
            icon={TrendingUp}
            className="border-l-4 border-l-luxe-supporting"
          />
          <KPICard
            label="Commission Earned"
            value={formatCurrency(commission, currency)}
            icon={Banknote}
            className="border-l-4 border-l-luxe-accent"
          />
        </div>
      </CardContent>
    </Card>
  )
}
