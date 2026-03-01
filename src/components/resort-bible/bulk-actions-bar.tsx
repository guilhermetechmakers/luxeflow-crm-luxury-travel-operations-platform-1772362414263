/**
 * BulkActionsBar - Import, Export, Sync Partners, Run Migration, Apply Presets
 * Always visible; shows selection count and clear when items selected
 */
import { Download, Upload, RefreshCw, Database, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface BulkActionsBarProps {
  selectedIds?: string[]
  onClearSelection?: () => void
  onImport?: () => void
  onExport?: () => void
  onSyncPartners?: () => void
  onRunMigration?: () => void
  onApplyPresets?: () => void
  className?: string
}

export function BulkActionsBar({
  selectedIds = [],
  onClearSelection,
  onImport,
  onExport,
  onSyncPartners,
  onRunMigration,
  onApplyPresets,
  className,
}: BulkActionsBarProps) {
  const count = (selectedIds ?? []).length

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-2 shadow-card transition-all duration-200',
        count > 0 && 'border-accent/30 bg-accent/5',
        className
      )}
      role="region"
      aria-label="Bulk actions"
    >
      {count > 0 && (
        <>
          <span className="text-sm font-medium text-foreground">{count} selected</span>
          {onClearSelection && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearSelection}
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport} aria-label="Export resorts">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      )}
      {onImport && (
        <Button variant="outline" size="sm" onClick={onImport} aria-label="Import CSV">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      )}
      {onSyncPartners && (
        <Button variant="outline" size="sm" onClick={onSyncPartners} aria-label="Sync partners">
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync Partners
        </Button>
      )}
      {onRunMigration && (
        <Button variant="outline" size="sm" onClick={onRunMigration} aria-label="Run migration">
          <Database className="mr-2 h-4 w-4" />
          Run Migration
        </Button>
      )}
      {onApplyPresets && (
        <Button variant="outline" size="sm" onClick={onApplyPresets} aria-label="Apply presets">
          Apply Presets
        </Button>
      )}
    </div>
  )
}
