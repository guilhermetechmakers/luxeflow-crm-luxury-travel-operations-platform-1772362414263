/**
 * Reporting API - KPIs, breakdowns, pipeline, exports, scheduled reports
 * Uses mock data for local development; swap for Supabase/Edge Function in production
 * Runtime safety: all responses validated with nullish coalescing and Array.isArray checks
 */
import { api } from '@/lib/api'
import { bookingsApi } from '@/api/bookings'
import type {
  KPIData,
  BreakdownItem,
  BreakdownType,
  PipelineStage,
  ReportingFilters,
  ScheduledReport,
} from '@/types/reporting'

/** Normalize date range - default last 30 days */
function getDefaultDateRange(): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

/** Compute KPIs from bookings data */
async function computeKPIsFromBookings(filters: ReportingFilters): Promise<KPIData> {
  const { data: bookings = [] } = await bookingsApi.getBookings({
    check_in_from: filters.startDate,
    check_in_to: filters.endDate,
    agent_id: filters.agentId,
    resort_id: filters.resortId,
  })

  const list = Array.isArray(bookings) ? bookings : []
  const confirmed = list.filter((b) => b.status === 'confirmed' || b.status === 'pre_arrival' || b.status === 'in_stay' || b.status === 'completed')
  const quotes = list.filter((b) => b.status === 'quote')

  const totalValue = list.reduce((sum, b) => sum + (b.value ?? 0), 0)
  const totalCommission = list.reduce((sum, b) => sum + (b.commission ?? 0), 0)
  const conversionRate = quotes.length + confirmed.length > 0
    ? Math.round((confirmed.length / (quotes.length + confirmed.length)) * 100)
    : 0
  const avgDeal = confirmed.length > 0 ? Math.round(totalValue / confirmed.length) : 0

  return {
    bookingsCount: confirmed.length,
    totalBookingValue: totalValue,
    totalCommission,
    conversionRate,
    pipelineQuoteCount: quotes.length,
    pipelineConfirmedCount: confirmed.length,
    averageDealSize: avgDeal,
  }
}

/** Compute breakdown by agent */
async function computeAgentBreakdown(filters: ReportingFilters): Promise<BreakdownItem[]> {
  const { data: bookings = [] } = await bookingsApi.getBookings({
    check_in_from: filters.startDate,
    check_in_to: filters.endDate,
    agent_id: filters.agentId,
    resort_id: filters.resortId,
  })

  const list = Array.isArray(bookings) ? bookings : []
  const byAgent = new Map<string, { value: number; count: number; name: string }>()

  for (const b of list) {
    const aid = b.agent_id ?? 'unknown'
    const name = b.agent_name ?? 'Unknown'
    const existing = byAgent.get(aid) ?? { value: 0, count: 0, name }
    byAgent.set(aid, {
      value: existing.value + (b.value ?? 0),
      count: existing.count + 1,
      name,
    })
  }

  const total = list.reduce((s, b) => s + (b.value ?? 0), 0)
  return Array.from(byAgent.entries()).map(([id, v]) => ({
    id,
    name: v.name,
    value: v.value,
    count: v.count,
    percentage: total > 0 ? Math.round((v.value / total) * 100) : 0,
  }))
}

/** Compute breakdown by resort */
async function computeResortBreakdown(filters: ReportingFilters): Promise<BreakdownItem[]> {
  const { data: bookings = [] } = await bookingsApi.getBookings({
    check_in_from: filters.startDate,
    check_in_to: filters.endDate,
    agent_id: filters.agentId,
    resort_id: filters.resortId,
  })

  const list = Array.isArray(bookings) ? bookings : []
  const byResort = new Map<string, { value: number; count: number; name: string }>()

  for (const b of list) {
    const rid = b.resort_id ?? 'unknown'
    const name = b.resort_name ?? 'Unknown'
    const existing = byResort.get(rid) ?? { value: 0, count: 0, name }
    byResort.set(rid, {
      value: existing.value + (b.value ?? 0),
      count: existing.count + 1,
      name,
    })
  }

  const total = list.reduce((s, b) => s + (b.value ?? 0), 0)
  return Array.from(byResort.entries()).map(([id, v]) => ({
    id,
    name: v.name,
    value: v.value,
    count: v.count,
    percentage: total > 0 ? Math.round((v.value / total) * 100) : 0,
  }))
}

/** Compute breakdown by source - mock sources from booking ref prefix */
async function computeSourceBreakdown(filters: ReportingFilters): Promise<BreakdownItem[]> {
  const { data: bookings = [] } = await bookingsApi.getBookings({
    check_in_from: filters.startDate,
    check_in_to: filters.endDate,
    agent_id: filters.agentId,
    resort_id: filters.resortId,
  })

  const list = Array.isArray(bookings) ? bookings : []
  const bySource = new Map<string, { value: number; count: number }>()
  const sources = ['Direct', 'Referral', 'Partner', 'Website'] as const

  for (const b of list) {
    const idx = Math.abs((b.booking_ref ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % sources.length
    const source = sources[idx] ?? 'Direct'
    const existing = bySource.get(source) ?? { value: 0, count: 0 }
    bySource.set(source, {
      value: existing.value + (b.value ?? 0),
      count: existing.count + 1,
    })
  }

  const total = list.reduce((s, b) => s + (b.value ?? 0), 0)
  return Array.from(bySource.entries()).map(([id, v]) => ({
    id,
    name: id,
    value: v.value,
    count: v.count,
    percentage: total > 0 ? Math.round((v.value / total) * 100) : 0,
  }))
}

/** Compute pipeline stages from bookings */
async function computePipeline(filters: ReportingFilters): Promise<PipelineStage[]> {
  const { data: bookings = [] } = await bookingsApi.getBookings({
    check_in_from: filters.startDate,
    check_in_to: filters.endDate,
    agent_id: filters.agentId,
    resort_id: filters.resortId,
  })

  const list = Array.isArray(bookings) ? bookings : []
  const quote = list.filter((b) => b.status === 'quote')
  const confirmed = list.filter((b) =>
    ['confirmed', 'pre_arrival', 'in_stay', 'completed'].includes(b.status ?? '')
  )

  const quoteValue = quote.reduce((s, b) => s + (b.value ?? 0), 0)
  const confirmedValue = confirmed.reduce((s, b) => s + (b.value ?? 0), 0)
  const totalForConversion = quote.length + confirmed.length
  const convRate = totalForConversion > 0 ? Math.round((confirmed.length / totalForConversion) * 100) : 0

  return [
    { stage: 'Quote', count: quote.length, value: quoteValue },
    { stage: 'Confirmed', count: confirmed.length, value: confirmedValue, conversionRate: convRate },
  ]
}

export const reportingApi = {
  /**
   * GET /api/reporting/performance/kpis
   */
  async getKPIs(filters: ReportingFilters): Promise<KPIData> {
    try {
      const params = new URLSearchParams()
      params.set('startDate', filters.startDate)
      params.set('endDate', filters.endDate)
      if (filters.resortId) params.set('resortId', filters.resortId)
      if (filters.agentId) params.set('agentId', filters.agentId)

      const res = await api.get<KPIData>(`/reporting/performance/kpis?${params.toString()}`)
      return res ?? (await computeKPIsFromBookings(filters))
    } catch {
      return computeKPIsFromBookings(filters)
    }
  },

  /**
   * GET /api/reporting/performance/breakdown
   */
  async getBreakdown(type: BreakdownType, filters: ReportingFilters): Promise<BreakdownItem[]> {
    try {
      const params = new URLSearchParams()
      params.set('type', type)
      params.set('startDate', filters.startDate)
      params.set('endDate', filters.endDate)
      if (filters.resortId) params.set('resortId', filters.resortId)
      if (filters.agentId) params.set('agentId', filters.agentId)

      const res = await api.get<BreakdownItem[] | { data?: BreakdownItem[] }>(
        `/reporting/performance/breakdown?${params.toString()}`
      )
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: BreakdownItem[] })?.data)
        ? (res as { data: BreakdownItem[] }).data
        : []
      if (list.length > 0) return list ?? []
    } catch {
      // fall through to mock
    }

    if (type === 'agent') return computeAgentBreakdown(filters)
    if (type === 'resort') return computeResortBreakdown(filters)
    return computeSourceBreakdown(filters)
  },

  /**
   * GET /api/reporting/performance/pipeline
   */
  async getPipeline(filters: ReportingFilters): Promise<PipelineStage[]> {
    try {
      const params = new URLSearchParams()
      params.set('startDate', filters.startDate)
      params.set('endDate', filters.endDate)
      if (filters.resortId) params.set('resortId', filters.resortId)
      if (filters.agentId) params.set('agentId', filters.agentId)

      const res = await api.get<PipelineStage[] | { data?: PipelineStage[] }>(
        `/reporting/performance/pipeline?${params.toString()}`
      )
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: PipelineStage[] })?.data)
        ? (res as { data: PipelineStage[] }).data
        : []
      if (list.length > 0) return list ?? []
    } catch {
      // fall through
    }
    return computePipeline(filters)
  },

  /**
   * POST /api/reporting/scheduled
   */
  async scheduleReport(payload: Omit<ScheduledReport, 'id' | 'nextRunAt'>): Promise<ScheduledReport | null> {
    try {
      const res = await api.post<ScheduledReport>('/reporting/scheduled', payload)
      return res ?? null
    } catch {
      const next = new Date()
      next.setDate(next.getDate() + 7)
      return {
        id: `sr-${Date.now()}`,
        ...payload,
        nextRunAt: next.toISOString(),
      }
    }
  },

  /**
   * POST /api/reporting/export - returns blob URL or CSV string
   */
  async exportReport(
    filters: ReportingFilters,
    format: 'csv' | 'pdf'
  ): Promise<{ url?: string; blob?: Blob; csv?: string }> {
    try {
      const res = await api.post<{ url?: string }>('/reporting/export', { filters, format })
      return res ?? {}
    } catch {
      if (format === 'csv') {
        const { data: bookings = [] } = await bookingsApi.getBookings({
          check_in_from: filters.startDate,
          check_in_to: filters.endDate,
          agent_id: filters.agentId,
          resort_id: filters.resortId,
        })
        const list = Array.isArray(bookings) ? bookings : []
        const headers = 'Booking Ref,Client,Resort,Agent,Check-in,Value,Commission,Status'
        const rows = list.map((b) =>
          [
            b.booking_ref ?? '',
            b.client_name ?? '',
            b.resort_name ?? '',
            b.agent_name ?? '',
            b.check_in ?? '',
            b.value ?? 0,
            b.commission ?? 0,
            b.status ?? '',
          ].join(',')
        )
        const csv = [headers, ...rows].join('\n')
        return { csv }
      }
      return {}
    }
  },

  /**
   * Get agents for filter dropdown
   */
  async getAgents() {
    return bookingsApi.getAgents()
  },

  /**
   * Get resorts for filter dropdown
   */
  async getResorts() {
    return bookingsApi.getResorts()
  },
}

/** Seed data verifier - checks if reporting data is available */
export function verifySeedData(bookingsCount: number): { hasData: boolean; message: string } {
  if (bookingsCount > 0) {
    return { hasData: true, message: '' }
  }
  return {
    hasData: false,
    message: 'No booking data available for the selected filters. Try adjusting the date range or filters.',
  }
}

/** Get default date range for initial load */
export function getDefaultReportingFilters(): ReportingFilters {
  const { startDate, endDate } = getDefaultDateRange()
  return { startDate, endDate }
}
