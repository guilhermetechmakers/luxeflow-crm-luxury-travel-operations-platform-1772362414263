/**
 * MigrateWizardModal - Migration mapping wizard for legacy data
 * Steps: map columns, validate, preview, apply, report
 */
import { useState, useCallback } from 'react'
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
import { Plus, Trash2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MigrationMapItem } from '@/types/resort-bible'

const STEPS = ['Map columns', 'Validate', 'Preview', 'Apply', 'Report'] as const
const DEFAULT_FIELDS: MigrationMapItem[] = [
  { sourceField: 'name', targetField: 'name' },
  { sourceField: 'city', targetField: 'location.city' },
  { sourceField: 'country', targetField: 'location.country' },
]

const REQUIRED_TARGETS = ['name', 'location.city', 'location.country']

export interface MigrateWizardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRun: (mapping: MigrationMapItem[]) => Promise<{ jobId: string; status: string }>
}

export function MigrateWizardModal({
  open,
  onOpenChange,
  onRun,
}: MigrateWizardModalProps) {
  const [step, setStep] = useState(0)
  const [mappings, setMappings] = useState<MigrationMapItem[]>(() => [...DEFAULT_FIELDS])
  const [isRunning, setIsRunning] = useState(false)
  const [report, setReport] = useState<{ jobId: string; status: string } | null>(null)

  const validMappings = mappings.filter((m) => m.sourceField.trim() && m.targetField.trim())
  const targetFields = validMappings.map((m) => m.targetField.trim())
  const validationErrors: string[] = []
  REQUIRED_TARGETS.forEach((req) => {
    if (!targetFields.includes(req)) {
      validationErrors.push(`Missing required field: ${req}`)
    }
  })
  const isValid = validationErrors.length === 0 && validMappings.length > 0

  const addRow = useCallback(() => {
    setMappings((prev) => [...prev, { sourceField: '', targetField: '' }])
  }, [])

  const removeRow = useCallback((i: number) => {
    setMappings((prev) => prev.filter((_, idx) => idx !== i))
  }, [])

  const updateRow = useCallback(
    (i: number, field: 'sourceField' | 'targetField', value: string) => {
      setMappings((prev) => {
        const next = [...prev]
        next[i] = { ...next[i], [field]: value }
        return next
      })
    },
    []
  )

  const handleNext = useCallback(() => {
    if (step === 0 && !isValid) {
      toast.error('Fix validation errors before continuing')
      return
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    }
  }, [step, isValid])

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1)
    }
  }, [step])

  const handleApply = useCallback(async () => {
    if (!isValid) return
    setIsRunning(true)
    setReport(null)
    try {
      const res = await onRun(validMappings)
      setReport(res)
      setStep(STEPS.length - 1)
      toast.success(`Migration queued: ${res.jobId}`)
    } catch {
      toast.error('Failed to start migration')
    } finally {
      setIsRunning(false)
    }
  }, [onRun, validMappings, isValid])

  const handleClose = useCallback(() => {
    onOpenChange(false)
    setStep(0)
    setMappings([...DEFAULT_FIELDS])
    setReport(null)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Migration wizard</DialogTitle>
        </DialogHeader>

        <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <button
                type="button"
                onClick={() => i <= step && setStep(i)}
                className={cn(
                  'rounded px-2 py-1 text-xs font-medium transition-colors',
                  i === step && 'bg-accent text-accent-foreground',
                  i < step && 'text-muted-foreground hover:text-foreground',
                  i > step && 'text-muted-foreground'
                )}
                aria-current={i === step ? 'step' : undefined}
              >
                {label}
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[200px] space-y-4 py-4">
          {step === 0 && (
            <>
              <p className="text-sm text-muted-foreground">
                Map source fields from your legacy data to Resort Bible fields.
              </p>
              {validationErrors.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                  <ul className="text-sm text-destructive">
                    {validationErrors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
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
                      aria-label={`Source field ${i + 1}`}
                    />
                    <Input
                      placeholder="e.g. name"
                      value={m.targetField}
                      onChange={(e) => updateRow(i, 'targetField', e.target.value)}
                      className="flex-1"
                      aria-label={`Target field ${i + 1}`}
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
            </>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Validation results for your mapping configuration.
              </p>
              {isValid ? (
                <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 p-4">
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                  <div>
                    <p className="font-medium">All validations passed</p>
                    <p className="text-sm text-muted-foreground">
                      {validMappings.length} mapping(s) configured. Required fields present.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <AlertCircle className="h-6 w-6 shrink-0 text-destructive" />
                  <ul className="text-sm text-destructive">
                    {validationErrors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Preview of mapped fields. These will be applied when you run the migration.
              </p>
              <div className="rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Source</th>
                      <th className="px-4 py-2 text-left font-medium">Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validMappings.map((m, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-4 py-2">{m.sourceField}</td>
                        <td className="px-4 py-2">{m.targetField}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Run the migration with the configured mappings.
              </p>
              <Button
                onClick={handleApply}
                disabled={isRunning || !isValid}
                aria-label="Apply migration"
              >
                {isRunning ? 'Running...' : 'Apply migration'}
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm font-medium">Migration report</p>
              {report ? (
                <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 p-4">
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                  <div>
                    <p className="font-medium">Migration queued successfully</p>
                    <p className="text-sm text-muted-foreground">
                      Job ID: {report.jobId} · Status: {report.status}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Run the migration from the Apply step to see the report.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {step === 4 ? 'Close' : 'Cancel'}
          </Button>
          {step < 4 && (
            <>
              {step > 0 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={handleNext} disabled={step === 0 && !isValid}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleApply} disabled={isRunning || !isValid}>
                  {isRunning ? 'Running...' : 'Run migration'}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
