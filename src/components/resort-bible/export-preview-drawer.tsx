/**
 * ExportPreviewDrawer - Preview export data before bulk export
 */
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { ensureArray } from '@/lib/resort-utils'
import type { Resort } from '@/types/resort'

export interface ExportPreviewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: Resort[]
  onExport: (format: 'csv' | 'json') => void
  isExporting?: boolean
}

function getLocationLabel(resort: Resort): string {
  const loc = resort?.location
  if (!loc) return ''
  return [loc.city, loc.country].filter(Boolean).join(', ')
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
          <div className="max-h-96 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-secondary">
                <tr>
                  <th className="border-b border-border px-4 py-2 text-left font-medium">Name</th>
                  <th className="border-b border-border px-4 py-2 text-left font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {list.slice(0, 50).map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2">{r.name}</td>
                    <td className="px-4 py-2">{getLocationLabel(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length > 50 && (
              <p className="px-4 py-2 text-xs text-muted-foreground">
                ... and {list.length - 50} more
              </p>
            )}
          </div>
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
