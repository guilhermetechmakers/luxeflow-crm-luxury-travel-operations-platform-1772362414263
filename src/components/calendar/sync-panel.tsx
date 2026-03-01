/**
 * SyncPanel - Google Calendar / iCal integration UI
 * Per-user sync settings, one-way vs two-way, export actions
 */
import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar, Download, RefreshCw, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SyncConfig } from '@/types/calendar'

export interface SyncPanelProps {
  syncConfig: SyncConfig | null
  onSetupSync?: (config: { provider: 'google' | 'ical'; sync_type: 'one-way' | 'two-way' }) => void
  onExportIcal?: (bookingId?: string) => void
  isLoading?: boolean
  className?: string
}

export function SyncPanel({
  syncConfig,
  onSetupSync,
  onExportIcal,
  isLoading = false,
  className: _className,
}: SyncPanelProps) {
  const [open, setOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'ical'>('google')
  const [selectedSyncType, setSelectedSyncType] = useState<'one-way' | 'two-way'>('one-way')

  const handleSetup = () => {
    onSetupSync?.({ provider: selectedProvider, sync_type: selectedSyncType })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <Calendar className="h-4 w-4 mr-2" />
          Sync & Export
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-serif font-semibold">Calendar Sync</h4>

          {syncConfig?.enabled ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>
                  {syncConfig.provider === 'google' ? 'Google Calendar' : 'iCal'} ·{' '}
                  {syncConfig.sync_type === 'one-way' ? 'One-way' : 'Two-way'} sync
                </span>
              </div>
              {syncConfig.last_sync_at && (
                <p className="text-xs text-muted-foreground pl-6">
                  Last synced: {new Date(syncConfig.last_sync_at).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Provider</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('google')}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg border text-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selectedProvider === 'google'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:bg-secondary'
                    )}
                  >
                    Google Calendar
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('ical')}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg border text-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selectedProvider === 'ical'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:bg-secondary'
                    )}
                  >
                    iCal
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Sync type</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSyncType('one-way')}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg border text-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selectedSyncType === 'one-way'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:bg-secondary'
                    )}
                  >
                    One-way
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSyncType('two-way')}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg border text-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selectedSyncType === 'two-way'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:bg-secondary'
                    )}
                  >
                    Two-way
                  </button>
                </div>
              </div>
              <Button size="sm" onClick={handleSetup} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Enable Sync
              </Button>
            </div>
          )}

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Export</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                onExportIcal?.()
                setOpen(false)
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export iCal (.ics)
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
