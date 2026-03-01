/**
 * BulkExportPanel - Select fields, export button, status of export jobs
 * Triggers server-side export; provides download link or feedback
 */
import { useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { bookingsApi } from '@/api/bookings'

const EXPORT_FIELDS = [
  { id: 'booking_ref', label: 'Reference' },
  { id: 'client_name', label: 'Client' },
  { id: 'resort_name', label: 'Resort' },
  { id: 'check_in', label: 'Check-in' },
  { id: 'check_out', label: 'Check-out' },
  { id: 'status', label: 'Status' },
  { id: 'value', label: 'Value' },
  { id: 'commission', label: 'Commission' },
  { id: 'balance_due', label: 'Balance' },
] as const

export interface BulkExportPanelProps {
  selectedIds: string[]
  onClearSelection: () => void
  onExportComplete?: () => void
}

export function BulkExportPanel({
  selectedIds,
  onClearSelection,
  onExportComplete,
}: BulkExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(EXPORT_FIELDS.map((f) => f.id))
  )

  const count = selectedIds?.length ?? 0
  if (count === 0) return null

  const setFieldChecked = (id: string, checked: boolean) => {
    setSelectedFields((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true)
    try {
      const fields = Array.from(selectedFields)
      const res = await bookingsApi.bulkExport({
        booking_ids: selectedIds,
        fields: fields.length > 0 ? fields : undefined,
        format,
      })
      if (res?.url) {
        window.open(res.url, '_blank')
        toast.success('Export ready for download')
      } else {
        toast.success(`Export prepared for ${count} booking(s)`)
      }
      onClearSelection()
      onExportComplete?.()
    } catch {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2"
      role="region"
      aria-label="Bulk export actions"
    >
      <span className="text-sm font-medium text-foreground">
        {count} selected
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting}>
            Select fields
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {EXPORT_FIELDS.map((f) => (
            <DropdownMenuCheckboxItem
              key={f.id}
              checked={selectedFields.has(f.id)}
              onCheckedChange={(checked) => setFieldChecked(f.id, checked === true)}
            >
              {f.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        size="sm"
        disabled={isExporting}
        onClick={() => handleExport('csv')}
        aria-label="Export as CSV"
      >
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={isExporting}
        onClick={() => handleExport('xlsx')}
        aria-label="Export as Excel"
      >
        Export Excel
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClearSelection}
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
