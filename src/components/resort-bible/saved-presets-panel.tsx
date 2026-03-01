/**
 * SavedPresetsPanel - Create, edit, delete, apply saved filter presets
 */
import { useState } from 'react'
import { Bookmark, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { Preset, PresetInput, ResortFilters } from '@/types/resort-bible'

export interface SavedPresetsPanelProps {
  presets: Preset[]
  isLoading?: boolean
  onApply: (preset: Preset) => void
  onSave?: (input: PresetInput) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  currentFilters?: ResortFilters
  className?: string
}

export function SavedPresetsPanel({
  presets,
  isLoading,
  onApply,
  onSave,
  currentFilters,
  className,
}: SavedPresetsPanelProps) {
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const list = ensureArray(presets)

  const handleSave = async () => {
    if (!onSave || !newPresetName.trim()) return
    setIsSaving(true)
    try {
      await onSave({
        name: newPresetName.trim(),
        filters: currentFilters ?? {},
        shared: false,
      })
      setNewPresetName('')
      setSaveModalOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className={cn('flex items-center gap-2', className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isLoading} aria-label="Saved filters">
              <Bookmark className="mr-2 h-4 w-4" />
              Saved Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {list.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No saved presets
              </div>
            ) : (
              list.map((preset) => (
                <DropdownMenuItem
                  key={preset.id}
                  onClick={() => onApply(preset)}
                  className="cursor-pointer"
                >
                  {preset.name}
                </DropdownMenuItem>
              ))
            )}
            {onSave && (
              <DropdownMenuItem onClick={() => setSaveModalOpen(true)} className="border-t">
                <Plus className="mr-2 h-4 w-4" />
                Save current filters
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save filter preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="preset-name">Preset name</Label>
              <Input
                id="preset-name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="e.g. Family beach resorts"
                className="mt-2"
                aria-label="Preset name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!newPresetName.trim() || isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
