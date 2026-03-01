/**
 * ExportPanel - CSV/PDF export actions and schedule exporter
 */
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Download, CalendarClock } from 'lucide-react'
import { toast } from 'sonner'
import { reportingApi } from '@/api/reporting'
import type { ReportingFilters } from '@/types/reporting'

export interface ExportPanelProps {
  filters: ReportingFilters
  hasData: boolean
  onScheduleCreated?: () => void
}

export function ExportPanel({
  filters,
  hasData,
  onScheduleCreated,
}: ExportPanelProps) {
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleName, setScheduleName] = useState('')
  const [scheduleCadence, setScheduleCadence] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [scheduleFormat, setScheduleFormat] = useState<'csv' | 'pdf'>('csv')
  const [scheduleRecipients, setScheduleRecipients] = useState('')
  const [scheduling, setScheduling] = useState(false)

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!hasData) {
      toast.error('No data to export. Adjust filters and try again.')
      return
    }
    setExporting(format)
    try {
      const result = await reportingApi.exportReport(filters, format)
      if (format === 'csv' && result.csv) {
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `luxeflow-report-${filters.startDate}-${filters.endDate}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Report exported as CSV')
      } else if (result.url) {
        window.open(result.url, '_blank')
        toast.success('Report exported')
      } else if (format === 'pdf') {
        toast.info('PDF export will be available when backend is configured.')
      } else {
        toast.error('Export failed. Please try again.')
      }
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setExporting(null)
    }
  }

  const handleSchedule = async () => {
    const name = scheduleName.trim()
    if (!name) {
      toast.error('Please enter a report name.')
      return
    }
    const recipients = scheduleRecipients
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter(Boolean)
    if (recipients.length === 0) {
      toast.error('Please enter at least one recipient email.')
      return
    }

    setScheduling(true)
    try {
      const result = await reportingApi.scheduleReport({
        name,
        cadence: scheduleCadence,
        format: scheduleFormat,
        recipients,
        filters,
      })
      if (result) {
        toast.success(`Scheduled report "${name}" created. Next run: ${result.nextRunAt ? new Date(result.nextRunAt).toLocaleDateString() : 'Soon'}.`)
        setScheduleOpen(false)
        setScheduleName('')
        setScheduleRecipients('')
        onScheduleCreated?.()
      } else {
        toast.error('Failed to create scheduled report.')
      }
    } catch {
      toast.error('Failed to create scheduled report.')
    } finally {
      setScheduling(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">Export & Schedule</CardTitle>
        <p className="text-sm text-muted-foreground">
          Download current view or schedule recurring reports
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={!hasData || exporting !== null}
            aria-label="Export to CSV"
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting === 'csv' ? 'Exporting…' : 'Export CSV'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={!hasData || exporting !== null}
            aria-label="Export to PDF"
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
          </Button>
          <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                aria-label="Schedule report"
              >
                <CalendarClock className="mr-2 h-4 w-4" />
                Schedule Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Report</DialogTitle>
                <DialogDescription>
                  Create a recurring report. At least one run per week is recommended.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="schedule-name">Report name</Label>
                  <Input
                    id="schedule-name"
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                    placeholder="e.g. Weekly Performance"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Cadence</Label>
                  <Select
                    value={scheduleCadence}
                    onValueChange={(v) => setScheduleCadence(v as 'daily' | 'weekly' | 'monthly')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Format</Label>
                  <Select
                    value={scheduleFormat}
                    onValueChange={(v) => setScheduleFormat(v as 'csv' | 'pdf')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="schedule-recipients">Recipients (comma-separated emails)</Label>
                  <Input
                    id="schedule-recipients"
                    value={scheduleRecipients}
                    onChange={(e) => setScheduleRecipients(e.target.value)}
                    placeholder="ops@luxeflow.com, finance@luxeflow.com"
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setScheduleOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSchedule} disabled={scheduling}>
                  {scheduling ? 'Creating…' : 'Create Schedule'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
