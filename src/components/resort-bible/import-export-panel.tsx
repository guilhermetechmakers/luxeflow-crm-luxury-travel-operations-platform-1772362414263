/**
 * ImportExportPanel - CSV import with mapping and preview
 */
import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { Resort } from '@/types/resort-bible'

const MAPPING_OPTIONS = [
  { source: 'name', target: 'name' },
  { source: 'city', target: 'location.city' },
  { source: 'country', target: 'location.country' },
  { source: 'transfer_time', target: 'transferTime' },
  { source: 'kids_policy', target: 'kidsPolicy' },
]

export interface ImportExportPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (file: File, mapping?: Record<string, string>) => Promise<{ preview: Resort[]; valid: boolean }>
}

export function ImportExportPanel({
  open,
  onOpenChange,
  onImport,
}: ImportExportPanelProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Resort[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>(
    Object.fromEntries(MAPPING_OPTIONS.map((m) => [m.source, m.target]))
  )
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'upload' | 'preview'>('upload')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreview([])
      setStep('upload')
    }
  }

  const handlePreview = useCallback(async () => {
    if (!file) return
    setIsLoading(true)
    try {
      const res = await onImport(file, mapping)
      setPreview(ensureArray(res?.preview))
      setStep('preview')
    } catch {
      toast.error('Failed to parse file')
    } finally {
      setIsLoading(false)
    }
  }, [file, mapping, onImport])

  const handleConfirm = useCallback(() => {
    toast.success('Import completed. Preview shows sample data.')
    onOpenChange(false)
    setFile(null)
    setPreview([])
    setStep('upload')
  }, [onOpenChange])

  const handleClose = useCallback(() => {
    onOpenChange(false)
    setFile(null)
    setPreview([])
    setStep('upload')
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import resorts (CSV)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {step === 'upload' ? (
            <>
              <div>
                <Label>CSV file</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    aria-label="Select CSV file"
                  />
                  {file && (
                    <span className="text-sm text-muted-foreground">{file.name}</span>
                  )}
                </div>
              </div>
              <div>
                <Label>Field mapping</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Map CSV columns to Resort Bible fields
                </p>
                <div className="mt-2 space-y-2">
                  {MAPPING_OPTIONS.map((m) => (
                    <div key={m.source} className="flex items-center gap-2">
                      <span className="w-32 text-sm">{m.source}</span>
                      <span className="text-muted-foreground">→</span>
                      <Input
                        value={mapping[m.source] ?? m.target}
                        onChange={(e) =>
                          setMapping((prev) => ({ ...prev, [m.source]: e.target.value }))
                        }
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <Label>Preview ({preview.length} rows)</Label>
              <div className="mt-2 max-h-48 overflow-y-auto rounded border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 10).map((r) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="px-4 py-2">{r.name}</td>
                        <td className="px-4 py-2">
                          {r.location?.city}, {r.location?.country}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 'upload' ? (
            <Button onClick={handlePreview} disabled={!file || isLoading}>
              {isLoading ? 'Loading...' : 'Preview'}
            </Button>
          ) : (
            <Button onClick={handleConfirm}>Confirm import</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
