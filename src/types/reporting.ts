/**
 * Reporting & Performance types for LuxeFlow CRM
 * All types support null-safe handling per runtime safety rules
 */

export interface ReportingFilters {
  resortId?: string
  agentId?: string
  startDate: string
  endDate: string
}

export interface KPIData {
  bookingsCount: number
  totalBookingValue: number
  totalCommission: number
  conversionRate: number
  pipelineQuoteCount: number
  pipelineConfirmedCount: number
  averageDealSize: number
}

export interface BreakdownItem {
  id: string
  name: string
  value: number
  count: number
  percentage?: number
}

export type BreakdownType = 'agent' | 'resort' | 'source'

export interface PipelineStage {
  stage: string
  count: number
  value: number
  conversionRate?: number
}

export interface ScheduledReport {
  id: string
  name: string
  cadence: 'daily' | 'weekly' | 'monthly'
  format: 'csv' | 'pdf'
  recipients: string[]
  filters: ReportingFilters
  nextRunAt?: string
}

export interface CustomReportDefinition {
  id: string
  name: string
  metrics: string[]
  filters: ReportingFilters
  groupings: BreakdownType[]
  createdAt: string
}

export type DateRangePreset = '7d' | '14d' | '30d' | 'ytd' | 'custom'
