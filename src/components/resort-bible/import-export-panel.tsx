/**
 * ImportExportPanel - CSV import with mapping, preview, and logs
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
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { ensureArray } from '@/lib/resort-bible-utils'
import { cn } from '@/lib/utils'
import type { Resort } from '@/types/resort-bible'

interface ImportLogEntry {
  id: string
  action: string
  status: 'completed' | 'failed' | 'in_progress'
  details?: string
  rowCount?: number
  timestamp: string
}

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
  const [step, setStep] = useState<'upload' | 'preview' | 'logs'>('upload')
  const [logs, setLogs] = useState<ImportLogEntry[]>([])

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
    const logEntry: ImportLogEntry = {
      id: `log-${Date.now()}`,
      action: 'CSV import',
      status: 'completed',
      details: `Imported ${preview.length} resort(s)`,
      rowCount: preview.length,
      timestamp: new Date().toISOString(),
    }
    setLogs((prev) => [logEntry, ...(prev ?? [])])
    setStep('logs')
    toast.success('Import completed')
  }, [preview.length])

  const handleClose = useCallback(() => {
    onOpenChange(false)
    setFile(null)
    setPreview([])
    setStep('upload')
  }, [onOpenChange])

  const handleBackToUpload = useCallback(() => {
    setStep('upload')
    setFile(null)
    setPreview([])
  }, [])

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
          ) : step === 'preview' ? (
            <div className="space-y-4">
              <div>
                <Label>Preview ({preview.length} rows)</Label>
                <div className="mt-2 max-h-48 overflow-y-auto rounded border border-border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-secondary">
                      <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(preview ?? []).slice(0, 10).map((r) => (
                        <tr key={r.id} className="border-t border-border">
                          <td className="px-4 py-2">{r.name}</td>
                          <td className="px-4 py-2">
                            {r.location?.city ?? ''}, {r.location?.country ?? ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Label>Import logs</Label>
              <div className="max-h-48 overflow-y-auto rounded border border-border">
                {(logs ?? []).length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No import logs yet
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {(logs ?? []).map((log: ImportLogEntry) => (
                      <li key={log.id} className="flex items-start gap-3 px-4 py-3">
                        {log.status === 'completed' && (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                        )}
                        {log.status === 'failed' && (
                          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                        )}
                        {log.status === 'in_progress' && (
                          <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={cn('text-sm font-medium', log.status === 'failed' && 'text-destructive')}>
                            {log.action}
                          </p>
                          {log.details && (
                            <p className="text-xs text-muted-foreground">{log.details}</p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={step === 'logs' ? handleBackToUpload : handleClose}>
            {step === 'logs' ? 'New import' : 'Cancel'}
          </Button>
          {step === 'upload' ? (
            <Button onClick={handlePreview} disabled={!file || isLoading}>
              {isLoading ? 'Loading...' : 'Preview'}
            </Button>
          ) : step === 'preview' ? (
            <Button onClick={handleConfirm}>Confirm import</Button>
          ) : (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
