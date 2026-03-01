/**
 * CustomReportBuilder - UI to configure and save ad-hoc reports
 */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import type { CustomReportDefinition, ReportingFilters, BreakdownType } from '@/types/reporting'

const METRIC_OPTIONS = [
  { id: 'bookingsCount', label: 'Bookings count' },
  { id: 'totalBookingValue', label: 'Total booking value' },
  { id: 'totalCommission', label: 'Total commission' },
  { id: 'conversionRate', label: 'Conversion rate' },
  { id: 'averageDealSize', label: 'Average deal size' },
] as const

const GROUPING_OPTIONS: { id: BreakdownType; label: string }[] = [
  { id: 'agent', label: 'By Agent' },
  { id: 'resort', label: 'By Resort' },
  { id: 'source', label: 'By Source' },
]

export interface CustomReportBuilderProps {
  filters: ReportingFilters
  onSave?: (definition: CustomReportDefinition) => void
}

const STORAGE_KEY = 'luxeflow-custom-reports'

function loadSavedReports(): CustomReportDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveReport(def: CustomReportDefinition) {
  const existing = loadSavedReports()
  const updated = existing.filter((r) => r.id !== def.id)
  updated.push(def)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function CustomReportBuilder({ filters, onSave }: CustomReportBuilderProps) {
  const [open, setOpen] = useState(false)
  const [reportName, setReportName] = useState('')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['bookingsCount', 'totalBookingValue'])
  const [selectedGroupings, setSelectedGroupings] = useState<BreakdownType[]>(['agent'])
  const [savedReports, setSavedReports] = useState<CustomReportDefinition[]>(loadSavedReports)

  const toggleMetric = (id: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  const toggleGrouping = (id: BreakdownType) => {
    setSelectedGroupings((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  const handleSave = () => {
    const name = reportName.trim()
    if (!name) {
      toast.error('Please enter a report name.')
      return
    }
    if (selectedMetrics.length === 0) {
      toast.error('Select at least one metric.')
      return
    }

    const def: CustomReportDefinition = {
      id: `cr-${Date.now()}`,
      name,
      metrics: selectedMetrics,
      filters: { ...filters },
      groupings: [...selectedGroupings],
      createdAt: new Date().toISOString(),
    }
    saveReport(def)
    setSavedReports(loadSavedReports())
    setReportName('')
    setOpen(false)
    toast.success(`Report "${name}" saved.`)
    onSave?.(def)
  }

  const handleLoad = (def: CustomReportDefinition) => {
    setReportName(def.name)
    setSelectedMetrics(def.metrics ?? [])
    setSelectedGroupings(def.groupings ?? ['agent'])
    setOpen(false)
    toast.success(`Loaded report "${def.name}".`)
    onSave?.(def)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Custom report builder">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Custom Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Custom Report Builder</DialogTitle>
          <DialogDescription>
            Configure metrics, filters, and groupings. Save to reuse later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="report-name">Report name</Label>
            <Input
              id="report-name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g. Q1 Agent Performance"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="mb-2 block">Metrics</Label>
            <div className="flex flex-wrap gap-3">
              {METRIC_OPTIONS.map((m) => (
                <label
                  key={m.id}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Checkbox
                    checked={selectedMetrics.includes(m.id)}
                    onCheckedChange={() => toggleMetric(m.id)}
                  />
                  <span className="text-sm">{m.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Group by</Label>
            <div className="flex flex-wrap gap-3">
              {GROUPING_OPTIONS.map((g) => (
                <label
                  key={g.id}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Checkbox
                    checked={selectedGroupings.includes(g.id)}
                    onCheckedChange={() => toggleGrouping(g.id)}
                  />
                  <span className="text-sm">{g.label}</span>
                </label>
              ))}
            </div>
          </div>
          {savedReports.length > 0 && (
            <div>
              <Label className="mb-2 block">Saved reports</Label>
              <div className="flex flex-wrap gap-2">
                {savedReports.map((r) => (
                  <Button
                    key={r.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoad(r)}
                  >
                    {r.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
