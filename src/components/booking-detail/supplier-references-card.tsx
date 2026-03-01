/**
 * SupplierReferencesCard - Supplier contacts, reference numbers, contract attachments
 */
import { Building2, FileText, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SupplierReferenceDetail } from '@/types/booking'

export interface SupplierReferencesCardProps {
  suppliers: SupplierReferenceDetail[]
  isLoading?: boolean
  onAddReference?: () => void
  canEdit?: boolean
}

export function SupplierReferencesCard({
  suppliers = [],
  isLoading = false,
  onAddReference,
  canEdit = false,
}: SupplierReferencesCardProps) {
  const list = suppliers ?? []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supplier References</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-lg bg-secondary/50" />
            <div className="h-20 animate-pulse rounded-lg bg-secondary/50" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Supplier References</CardTitle>
          {canEdit && onAddReference && (
            <Button size="sm" variant="outline" onClick={onAddReference}>
              Add Reference
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="mt-4 text-muted-foreground">No supplier references</p>
            {canEdit && onAddReference && (
              <Button size="sm" className="mt-4" onClick={onAddReference}>
                Add Reference
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {(list ?? []).map((supplier) => (
              <div
                key={supplier.id}
                className={cn(
                  'rounded-lg border border-border p-4 transition-all duration-200',
                  'hover:border-accent/30'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded bg-secondary p-2">
                    <Building2
                      className="h-5 w-5 text-muted-foreground"
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {supplier.supplier_name ?? 'Unknown Supplier'}
                    </p>
                    {supplier.reference_numbers && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Ref: {supplier.reference_numbers}
                      </p>
                    )}
                    {supplier.contact && (
                      <a
                        href={`mailto:${supplier.contact}`}
                        className="mt-2 flex items-center gap-2 text-sm text-accent hover:underline"
                      >
                        <Mail className="h-4 w-4" aria-hidden />
                        {supplier.contact}
                      </a>
                    )}
                    {(supplier.contract_attachments ?? []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(supplier.contract_attachments ?? []).map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accent"
                          >
                            <FileText className="h-4 w-4" aria-hidden />
                            Contract
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
