/**
 * MigrateWizardModal - Migration mapping wizard for legacy data
 */
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import type { MigrationMap } from '@/types/resort-bible'

const DEFAULT_FIELDS = [
  { sourceField: 'name', targetField: 'name' },
  { sourceField: 'city', targetField: 'location.city' },
  { sourceField: 'country', targetField: 'location.country' },
]

export interface MigrateWizardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRun: (mapping: MigrationMap[]) => Promise<{ jobId: string; status: string }>
}

export function MigrateWizardModal({
  open,
  onOpenChange,
  onRun,
}: MigrateWizardModalProps) {
  const [mappings, setMappings] = useState<{ sourceField: string; targetField: string }[]>(
    () => [...DEFAULT_FIELDS]
  )
  const [isRunning, setIsRunning] = useState(false)

  const addRow = () => {
    setMappings((prev) => [...prev, { sourceField: '', targetField: '' }])
  }

  const removeRow = (i: number) => {
    setMappings((prev) => prev.filter((_, idx) => idx !== i))
  }

  const updateRow = (i: number, field: 'sourceField' | 'targetField', value: string) => {
    setMappings((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: value }
      return next
    })
  }

  const handleRun = async () => {
    const valid = mappings.filter((m) => m.sourceField.trim() && m.targetField.trim())
    if (valid.length === 0) {
      toast.error('Add at least one mapping')
      return
    }
    setIsRunning(true)
    try {
      const res = await onRun(valid)
      toast.success(`Migration queued: ${res.jobId}`)
      onOpenChange(false)
      setMappings([...DEFAULT_FIELDS])
    } catch {
      toast.error('Failed to start migration')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Migration wizard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Map source fields from your legacy data to Resort Bible fields.
          </p>
          <div className="space-y-2">
            <div className="flex gap-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span className="w-1/2">Source field</span>
              <span className="w-1/2">Target field</span>
              <span className="w-10" />
            </div>
            {mappings.map((m, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="e.g. resort_name"
                  value={m.sourceField}
                  onChange={(e) => updateRow(i, 'sourceField', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="e.g. name"
                  value={m.targetField}
                  onChange={(e) => updateRow(i, 'targetField', e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(i)}
                  aria-label="Remove mapping"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addRow} aria-label="Add mapping">
              <Plus className="mr-2 h-4 w-4" />
              Add mapping
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRun} disabled={isRunning}>
            {isRunning ? 'Running...' : 'Run migration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
