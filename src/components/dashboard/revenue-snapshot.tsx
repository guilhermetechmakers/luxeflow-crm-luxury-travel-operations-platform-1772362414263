/**
 * Revenue Snapshot widget - KPI cards (Bookings, GBV, Commission) and date range selector
 */
import { useMemo, useState } from 'react'
import { TrendingUp, FileText, CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRevenueSnapshot } from '@/hooks/use-dashboard-data'
import type { DateRangeKey, RevenueSnapshot } from '@/types/dashboard'

const RANGE_OPTIONS: { value: DateRangeKey; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

const formatCurrency = (amount: number, currency = 'EUR') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

interface KPICardProps {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
}

function KPICard({ label, value, icon: Icon }: KPICardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className="h-5 w-5 text-accent" aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}

export function RevenueSnapshot() {
  const [range, setRange] = useState<DateRangeKey>('30d')
  const { data, isLoading } = useRevenueSnapshot(range)

  const snapshot: RevenueSnapshot | null = data ?? null
  const bookings = snapshot?.bookings ?? 0
  const gbv = snapshot?.gbv ?? 0
  const commission = snapshot?.commission ?? 0
  const currency = snapshot?.currency ?? 'EUR'

  const kpis = useMemo(
    () => [
      { label: 'Bookings', value: bookings, icon: FileText },
      { label: 'Gross Booking Value', value: formatCurrency(gbv, currency), icon: CreditCard },
      { label: 'Commission Earned', value: formatCurrency(commission, currency), icon: TrendingUp },
    ],
    [bookings, gbv, commission, currency]
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Revenue Snapshot</CardTitle>
          <CardDescription>Bookings, GBV, and commission</CardDescription>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as DateRangeKey)}>
          <SelectTrigger className="w-[140px]" aria-label="Date range">
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
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {kpis.map(({ label, value, icon }) => (
              <KPICard key={label} label={label} value={value} icon={icon} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
