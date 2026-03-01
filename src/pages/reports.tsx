/**
 * Reporting & Performance - Analytics workspace for LuxeFlow CRM
 * KPIs, breakdowns, pipeline funnel, exports, custom report builder
 * All data guarded for runtime safety
 */
import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  KPICard,
  DateRangePicker,
  BreakdownPanel,
  PipelineFunnel,
  ExportPanel,
  CustomReportBuilder,
} from '@/components/reporting'
import {
  reportingApi,
  getDefaultReportingFilters,
  verifySeedData,
} from '@/api/reporting'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Euro, Percent, TrendingUp, Filter } from 'lucide-react'
import type {
  ReportingFilters,
  BreakdownType,
  DateRangePreset,
  CustomReportDefinition,
} from '@/types/reporting'

export function Reports() {
  const [datePreset, setDatePreset] = useState<DateRangePreset>('30d')
  const [filters, setFilters] = useState<ReportingFilters>(() => getDefaultReportingFilters())
  const [breakdownType, setBreakdownType] = useState<BreakdownType>('agent')

  const handleCustomReportLoad = useCallback((def: CustomReportDefinition) => {
    const newFilters = def.filters ?? getDefaultReportingFilters()
    setFilters(newFilters)
    const firstGrouping = (def.groupings ?? [])[0]
    if (firstGrouping) setBreakdownType(firstGrouping)
    setDatePreset('custom')
  }, [])

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['reporting', 'kpis', filters],
    queryFn: () => reportingApi.getKPIs(filters),
  })

  const { data: breakdown, isLoading: breakdownLoading } = useQuery({
    queryKey: ['reporting', 'breakdown', breakdownType, filters],
    queryFn: () => reportingApi.getBreakdown(breakdownType, filters),
  })

  const { data: pipeline, isLoading: pipelineLoading } = useQuery({
    queryKey: ['reporting', 'pipeline', filters],
    queryFn: () => reportingApi.getPipeline(filters),
  })

  const { data: agents = [] } = useQuery({
    queryKey: ['reporting', 'agents'],
    queryFn: () => reportingApi.getAgents(),
  })

  const { data: resorts = [] } = useQuery({
    queryKey: ['reporting', 'resorts'],
    queryFn: () => reportingApi.getResorts(),
  })

  const agentList = Array.isArray(agents) ? agents : []
  const resortList = Array.isArray(resorts) ? resorts : []

  const handleRangeChange = useCallback(
    (startDate: string, endDate: string, preset: DateRangePreset) => {
      setDatePreset(preset)
      setFilters((prev) => ({ ...prev, startDate, endDate }))
    },
    []
  )

  const handleAgentChange = useCallback((agentId: string) => {
    setFilters((prev) => ({ ...prev, agentId: agentId === 'all' ? undefined : agentId }))
  }, [])

  const handleResortChange = useCallback((resortId: string) => {
    setFilters((prev) => ({ ...prev, resortId: resortId === 'all' ? undefined : resortId }))
  }, [])

  const kpiData = kpis ?? {
    bookingsCount: 0,
    totalBookingValue: 0,
    totalCommission: 0,
    conversionRate: 0,
    pipelineQuoteCount: 0,
    pipelineConfirmedCount: 0,
    averageDealSize: 0,
  }

  const { hasData, message } = verifySeedData(kpiData.bookingsCount + (kpiData.pipelineQuoteCount ?? 0))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Reporting & Performance</h1>
          <p className="mt-1 text-muted-foreground">
            Financial and operational analytics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            startDate={filters.startDate}
            endDate={filters.endDate}
            preset={datePreset}
            onRangeChange={handleRangeChange}
          />
          <Select value={filters.agentId ?? 'all'} onValueChange={handleAgentChange}>
            <SelectTrigger className="w-[180px]" aria-label="Filter by agent">
              <SelectValue placeholder="All agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agents</SelectItem>
              {agentList.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name ?? 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.resortId ?? 'all'} onValueChange={handleResortChange}>
            <SelectTrigger className="w-[180px]" aria-label="Filter by resort">
              <SelectValue placeholder="All resorts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All resorts</SelectItem>
              {resortList.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name ?? 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CustomReportBuilder filters={filters} onSave={handleCustomReportLoad} />
        </div>
      </div>

      {/* Empty state message */}
      {!hasData && message && (
        <div
          className="rounded-lg border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground"
          role="status"
        >
          {message}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpisLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))
        ) : (
          <>
            <KPICard
              label="Bookings"
              value={kpiData.bookingsCount}
              tooltip="Confirmed bookings in the selected period"
              icon={<BookOpen className="h-4 w-4" />}
            />
            <KPICard
              label="Booking Value"
              value={`€${(kpiData.totalBookingValue ?? 0).toLocaleString('en-EU')}`}
              tooltip="Total value of confirmed bookings"
              icon={<Euro className="h-4 w-4" />}
            />
            <KPICard
              label="Commission"
              value={`€${(kpiData.totalCommission ?? 0).toLocaleString('en-EU')}`}
              tooltip="Total commission earned"
              icon={<Euro className="h-4 w-4" />}
            />
            <KPICard
              label="Conversion"
              value={`${kpiData.conversionRate ?? 0}%`}
              tooltip="Quote to confirmed conversion rate"
              icon={<Percent className="h-4 w-4" />}
            />
            <KPICard
              label="Pipeline (Quote)"
              value={kpiData.pipelineQuoteCount ?? 0}
              tooltip="Deals in quote stage"
              icon={<Filter className="h-4 w-4" />}
            />
            <KPICard
              label="Avg Deal Size"
              value={`€${(kpiData.averageDealSize ?? 0).toLocaleString('en-EU')}`}
              tooltip="Average value per confirmed booking"
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BreakdownPanel
            type={breakdownType}
            items={breakdown ?? []}
            isLoading={breakdownLoading}
            onTypeChange={setBreakdownType}
          />
        </div>
        <div className="space-y-6">
          <PipelineFunnel stages={pipeline ?? []} isLoading={pipelineLoading} />
          <ExportPanel filters={filters} hasData={hasData} />
        </div>
      </div>
    </div>
  )
}
