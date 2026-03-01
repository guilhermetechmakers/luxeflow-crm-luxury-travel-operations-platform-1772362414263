/**
 * RatesPanel - Breakdown of rate plans, currency, taxes/fees, commission
 * CommissionCalculator logic: percentage, fixed, tiered with supplier net
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { RatePlan, CommissionModel, CommissionModelType } from '@/types/booking'

/** Compute commission based on model (percentage, fixed, tiered) with supplier net */
export function computeCommission(
  totalAmount: number,
  model: CommissionModelType,
  value: number
): { calculated_commission: number; supplier_net: number } {
  let calculated_commission = 0
  if (model === 'percentage') {
    calculated_commission = totalAmount * (value / 100)
  } else if (model === 'fixed') {
    calculated_commission = value
  } else if (model === 'tiered') {
    calculated_commission = totalAmount * (value / 100)
  }
  return {
    calculated_commission,
    supplier_net: totalAmount - calculated_commission,
  }
}

export interface RatesPanelProps {
  rates?: RatePlan[]
  commission?: CommissionModel | null
  currency?: string
  totalAmount?: number
  isLoading?: boolean
}

function CommissionDisplay({ commission }: { commission: CommissionModel }) {
  const typeLabel =
    commission.type === 'percentage'
      ? `${commission.value}%`
      : commission.type === 'fixed'
        ? 'Fixed'
        : 'Tiered'

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Model</span>
        <span className="font-medium">{typeLabel}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Commission</span>
        <span className="font-medium text-accent">
          {formatCurrency(commission.calculated_commission)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Supplier net</span>
        <span className="font-medium">
          {formatCurrency(commission.supplier_net)}
        </span>
      </div>
    </div>
  )
}

export function RatesPanel({
  rates = [],
  commission,
  currency = 'EUR',
  totalAmount = 0,
  isLoading = false,
}: RatesPanelProps) {
  const rateList = rates ?? []
  const hasRates = rateList.length > 0

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rates & Commission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-16 animate-pulse rounded-lg bg-secondary/50" />
            <div className="h-16 animate-pulse rounded-lg bg-secondary/50" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rates & Commission</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasRates ? (
          <div className="space-y-4">
            {(rateList ?? []).map((rate) => (
              <div
                key={rate.id}
                className="rounded-lg border border-border p-4 transition-all duration-200 hover:border-accent/30"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{rate.name ?? 'Rate'}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(rate.amount, rate.currency ?? currency)}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    {(rate.taxes ?? 0) > 0 && (
                      <p className="text-muted-foreground">
                        Tax: {formatCurrency(rate.taxes, rate.currency ?? currency)}
                      </p>
                    )}
                    {(rate.fees ?? 0) > 0 && (
                      <p className="text-muted-foreground">
                        Fees: {formatCurrency(rate.fees, rate.currency ?? currency)}
                      </p>
                    )}
                    {(rate.discount ?? 0) > 0 && (
                      <p className="text-accent">
                        Discount: -{formatCurrency(rate.discount, rate.currency ?? currency)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No rate plans configured</p>
        )}

        {commission && (
          <div
            className={cn(
              'rounded-lg border border-border p-4',
              'bg-secondary/30'
            )}
          >
            <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Commission
            </h4>
            <CommissionDisplay commission={commission} />
          </div>
        )}

        {totalAmount > 0 && (
          <div className="flex justify-between border-t border-border pt-4">
            <span className="font-medium">Total</span>
            <span className="font-serif text-lg font-semibold">
              {formatCurrency(totalAmount, currency)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
