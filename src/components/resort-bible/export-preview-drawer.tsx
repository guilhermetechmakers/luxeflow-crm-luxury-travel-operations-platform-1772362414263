/**
 * ExportPreviewDrawer - Preview export data before bulk export
 * Uses DataGridExportPreview for field mapping visibility
 */
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { ensureArray } from '@/lib/resort-bible-utils'
import { DataGridExportPreview } from './data-grid-export-preview'
import type { Resort } from '@/types/resort-bible'

function getLocationLabel(resort: Resort): string {
  const loc = resort?.location
  if (!loc) return ''
  return [loc.city, loc.region, loc.country].filter(Boolean).join(', ')
}

const EXPORT_COLUMNS = [
  { key: 'name', header: 'Name', accessor: (r: Resort) => r.name },
  { key: 'location', header: 'Location', render: (r: Resort) => getLocationLabel(r) },
  { key: 'transferTime', header: 'Transfer', accessor: (r: Resort) => r.transferTime },
  { key: 'kidsPolicy', header: 'Kids Policy', accessor: (r: Resort) => r.kidsPolicy },
]

export interface ExportPreviewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: Resort[]
  onExport: (format: 'csv' | 'json') => void
  isExporting?: boolean
}

export function ExportPreviewDrawer({
  open,
  onOpenChange,
  data,
  onExport,
  isExporting,
}: ExportPreviewDrawerProps) {
  const list = ensureArray(data)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Export preview</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            {list.length} resort{list.length !== 1 ? 's' : ''} will be exported.
          </p>
          <DataGridExportPreview
            data={list}
            columns={EXPORT_COLUMNS}
            maxRows={50}
            emptyMessage="No resorts to export"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={isExporting}
              onClick={() => onExport('csv')}
              aria-label="Export as CSV"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={() => onExport('json')}
              aria-label="Export as JSON"
            >
              Export JSON
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
