/**
 * AttachmentsAndSuppliers - Upload attachments; capture supplier references
 */
import { useState } from 'react'
import { Paperclip, Building2, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { AttachmentInput, SupplierReferenceInput } from '@/types/booking'

function uid(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function supUid(): string {
  return `sup-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface AttachmentsAndSuppliersProps {
  attachments: AttachmentInput[]
  supplierReferences: SupplierReferenceInput[]
  onAttachmentsChange: (attachments: AttachmentInput[]) => void
  onSuppliersChange: (suppliers: SupplierReferenceInput[]) => void
  errors?: string[]
}

export function AttachmentsAndSuppliers({
  attachments = [],
  supplierReferences = [],
  onAttachmentsChange,
  onSuppliersChange,
  errors = [],
}: AttachmentsAndSuppliersProps) {
  const [newFileName, setNewFileName] = useState('')
  const [newFileUrl, setNewFileUrl] = useState('')
  const [newFileType, setNewFileType] = useState('document')

  const attList = attachments ?? []
  const supList = supplierReferences ?? []

  const handleAddAttachment = () => {
    const name = (newFileName ?? '').trim()
    if (!name) return
    onAttachmentsChange([
      ...attList,
      { id: uid(), filename: name, url: newFileUrl || '#', type: newFileType } as AttachmentInput,
    ])
    setNewFileName('')
    setNewFileUrl('')
  }

  const handleRemoveAttachment = (attId: string) => {
    onAttachmentsChange(attList.filter((a) => (a.id ?? a.filename) !== attId))
  }

  const handleAddSupplier = () => {
    onSuppliersChange([
      ...supList,
      {
        id: supUid(),
        supplier_name: '',
        reference_code: '',
        contact: '',
        notes: '',
      } as SupplierReferenceInput,
    ])
  }

  const getSupId = (s: SupplierReferenceInput, i: number) => s.id ?? `sup-${i}`

  const handleUpdateSupplier = (supId: string, updates: Partial<SupplierReferenceInput>) => {
    onSuppliersChange(
      supList.map((s, i) => (getSupId(s, i) === supId ? { ...s, ...updates } : s))
    )
  }

  const handleRemoveSupplier = (supId: string) => {
    onSuppliersChange(supList.filter((s, i) => getSupId(s, i) !== supId))
  }

  const hasErrors = (errors ?? []).length > 0

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Attachments</CardTitle>
          <p className="text-sm text-muted-foreground">
            Attach contracts, supplier quotes, and other documents.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Filename (e.g. contract.pdf)"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="flex-1"
            />
            <select
              value={newFileType}
              onChange={(e) => setNewFileType(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="document">Document</option>
              <option value="contract">Contract</option>
              <option value="invoice">Invoice</option>
              <option value="other">Other</option>
            </select>
            <Button type="button" size="sm" onClick={handleAddAttachment}>
              <Plus className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          {attList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
              <Paperclip className="h-10 w-10 text-muted-foreground" aria-hidden />
              <p className="mt-2 text-sm text-muted-foreground">No attachments yet</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {attList.map((a, i) => (
                <li
                  key={a.id ?? `att-${i}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="truncate text-sm font-medium">{a.filename}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">({a.type})</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAttachment(a.id ?? a.filename)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label="Remove attachment"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-lg">Supplier References</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Capture supplier names, reference codes, and contact details.
              </p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={handleAddSupplier}>
              <Plus className="h-4 w-4" aria-hidden />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {supList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground" aria-hidden />
              <p className="mt-2 text-sm text-muted-foreground">No supplier references yet</p>
              <Button size="sm" className="mt-4" onClick={handleAddSupplier}>
                Add First Supplier
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {supList.map((s, i) => (
                <div
                  key={s.id ?? `sup-${i}`}
                  className="space-y-2 rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Label className="sr-only">Supplier name</Label>
                    <Input
                      placeholder="Supplier name"
                      value={s.supplier_name ?? ''}
                      onChange={(e) => handleUpdateSupplier(getSupId(s, i), { supplier_name: e.target.value })}
                      className="flex-1 font-medium"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSupplier(getSupId(s, i))}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label="Remove supplier"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                  <Input
                    placeholder="Reference code"
                    value={s.reference_code ?? ''}
                    onChange={(e) => handleUpdateSupplier(getSupId(s, i), { reference_code: e.target.value })}
                  />
                  <Input
                    placeholder="Contact (email/phone)"
                    value={s.contact ?? ''}
                    onChange={(e) => handleUpdateSupplier(getSupId(s, i), { contact: e.target.value })}
                  />
                  <Input
                    placeholder="Notes"
                    value={s.notes ?? ''}
                    onChange={(e) => handleUpdateSupplier(getSupId(s, i), { notes: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {hasErrors && (
        <div className="lg:col-span-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          {(errors ?? []).map((msg, i) => (
            <p key={i} className="text-sm text-destructive">
              {msg}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
