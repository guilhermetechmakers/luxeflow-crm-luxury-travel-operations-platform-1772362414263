/**
 * BulkActionsBar - Import, Export, Sync Partners, Run Migration, Apply Presets
 */
import { Download, Upload, RefreshCw, Database, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface BulkActionsBarProps {
  selectedIds: string[]
  onClearSelection: () => void
  onImport?: () => void
  onExport?: () => void
  onSyncPartners?: () => void
  onRunMigration?: () => void
  onApplyPresets?: () => void
  className?: string
}

export function BulkActionsBar({
  selectedIds,
  onClearSelection,
  onImport,
  onExport,
  onSyncPartners,
  onRunMigration,
  onApplyPresets,
  className,
}: BulkActionsBarProps) {
  const count = selectedIds?.length ?? 0
  if (count === 0) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2',
        className
      )}
      role="region"
      aria-label="Bulk actions"
    >
      <span className="text-sm font-medium text-foreground">{count} selected</span>
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport} aria-label="Export selected">
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
