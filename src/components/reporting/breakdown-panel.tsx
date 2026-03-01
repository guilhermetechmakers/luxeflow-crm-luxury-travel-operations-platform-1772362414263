/**
 * BreakdownPanel - Toggleable breakdown by agent, resort, or source
 * Sortable columns, responsive cards on mobile
 */
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { Users, MapPin, Share2, ChevronDown, ChevronUp } from 'lucide-react'
import type { BreakdownItem, BreakdownType } from '@/types/reporting'

const BREAKDOWN_CONFIG: Record<
  BreakdownType,
  { label: string; icon: React.ElementType }
> = {
  agent: { label: 'By Agent', icon: Users },
  resort: { label: 'By Resort', icon: MapPin },
  source: { label: 'By Source', icon: Share2 },
}

export interface BreakdownPanelProps {
  type: BreakdownType
  items: BreakdownItem[]
  isLoading?: boolean
  onTypeChange?: (type: BreakdownType) => void
}

export function BreakdownPanel({
  type,
  items,
  isLoading = false,
  onTypeChange,
}: BreakdownPanelProps) {
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'count'>('value')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const list = useMemo(() => {
    const arr = Array.isArray(items) ? items : []
    const sorted = [...arr].sort((a, b) => {
      let av: string | number = a.name
      let bv: string | number = b.name
      if (sortBy === 'value') {
        av = a.value ?? 0
        bv = b.value ?? 0
      } else if (sortBy === 'count') {
        av = a.count ?? 0
        bv = b.count ?? 0
      }
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv))
      return sortOrder === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [items, sortBy, sortOrder])

  const config = BREAKDOWN_CONFIG[type] ?? BREAKDOWN_CONFIG.agent
  const Icon = config.icon

  const toggleSort = (field: 'name' | 'value' | 'count') => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const chartData = list.slice(0, 8).map((i) => ({
    name: i.name.length > 12 ? `${i.name.slice(0, 12)}…` : i.name,
    value: i.value ?? 0,
    fullName: i.name,
  }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 font-serif text-lg">
          <Icon className="h-5 w-5 text-accent" />
          {config.label}
        </CardTitle>
        {onTypeChange && (
          <div className="flex gap-1">
            {(['agent', 'resort', 'source'] as const).map((t) => (
              <Button
                key={t}
                variant={type === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTypeChange(t)}
                aria-pressed={type === t}
              >
                {BREAKDOWN_CONFIG[t].label.replace('By ', '')}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Icon className="h-12 w-12 opacity-50" />
            <p className="text-sm">No data for the selected filters</p>
          </div>
        ) : (
          <>
            <div className="mb-6 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 24 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {(chartData ?? []).map((_, i) => (
                      <Cell key={i} fill="rgb(138, 154, 91)" fillOpacity={0.7 + (i % 3) * 0.1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        type="button"
                        className="flex items-center gap-1 font-medium hover:text-accent"
                        onClick={() => toggleSort('name')}
                      >
                        Name
                        {sortBy === 'name' &&
                          (sortOrder === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        className="flex items-center gap-1 font-medium hover:text-accent"
                        onClick={() => toggleSort('value')}
                      >
                        Value
                        {sortBy === 'value' &&
                          (sortOrder === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        className="flex items-center gap-1 font-medium hover:text-accent"
                        onClick={() => toggleSort('count')}
                      >
                        Count
                        {sortBy === 'count' &&
                          (sortOrder === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((item) => (
                    <TableRow key={item.id} className="transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        €{(item.value ?? 0).toLocaleString('en-EU')}
                      </TableCell>
                      <TableCell>{item.count ?? 0}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.percentage != null ? `${item.percentage}%` : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
