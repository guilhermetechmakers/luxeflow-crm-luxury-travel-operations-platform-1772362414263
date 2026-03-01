/**
 * BillingPanel - Billing details, payment methods, due dates, outstanding balance
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import type { ClientDetail } from '@/types/client-detail'

export interface BillingPanelProps {
  profile: ClientDetail | null
}

export function BillingPanel({
  profile,
}: BillingPanelProps) {
  const billing = profile?.billingDetails ?? null
  const currency = profile?.currency ?? 'EUR'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Outstanding Balance
          </p>
          <p className="mt-1 font-serif text-2xl font-semibold">
            {formatCurrency(profile?.outstandingBalance ?? 0, currency)}
          </p>
        </div>

        {billing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Billing Contact
              </p>
              <p className="mt-1">{billing.billingContact ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Payment Method
              </p>
              <p className="mt-1">{billing.paymentMethod ?? '—'}</p>
            </div>
            {billing.billingAddress && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Billing Address
                </p>
                <p className="mt-1">{billing.billingAddress}</p>
              </div>
            )}
            {billing.taxId && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tax ID
                </p>
                <p className="mt-1">{billing.taxId}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">No billing details on file</p>
        )}
      </CardContent>
    </Card>
  )
}
