/**
 * QuickActionsBar - Sync/export, add event actions
 */
import { Button } from '@/components/ui/button'
import { Plus, Calendar } from 'lucide-react'
import { SyncPanel } from './sync-panel'
import type { SyncConfig } from '@/types/calendar'

export interface QuickActionsBarProps {
  syncConfig: SyncConfig | null
  onSetupSync?: (config: { provider: 'google' | 'ical'; sync_type: 'one-way' | 'two-way' }) => void
  onExportIcal?: () => void
  onAddEvent?: () => void
  onAddRoomBlock?: () => void
  isLoadingSync?: boolean
  className?: string
}

export function QuickActionsBar({
  syncConfig,
  onSetupSync,
  onExportIcal,
  onAddEvent,
  onAddRoomBlock,
  isLoadingSync = false,
  className,
}: QuickActionsBarProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <SyncPanel
        syncConfig={syncConfig}
        onSetupSync={onSetupSync}
        onExportIcal={onExportIcal}
        isLoading={isLoadingSync}
      />
      {onAddEvent && (
        <Button variant="outline" size="sm" onClick={onAddEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      )}
      {onAddRoomBlock && (
        <Button variant="outline" size="sm" onClick={onAddRoomBlock}>
          <Calendar className="h-4 w-4 mr-2" />
          Room Block
        </Button>
      )}
    </div>
  )
}
