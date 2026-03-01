/**
 * RatesAndCommission - Rate plan list; commission model selector; auto-calc summary
 */
import { useState, useEffect } from 'react'
import { DollarSign, Percent } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ratesApi } from '@/api/rates'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { RatePlan, CommissionModel, CommissionModelType } from '@/types/booking'

const COMMISSION_TYPES: { value: CommissionModelType; label: string }[] = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed amount' },
  { value: 'tiered', label: 'Tiered' },
]

export interface RatesAndCommissionProps {
  resortId?: string
  currency: string
  value: { ratePlan: RatePlan | null; commission: CommissionModel | null }
  onChange: (ratePlan: RatePlan | null, commission: CommissionModel | null) => void
  errors?: string[]
}

export function RatesAndCommission({
  resortId,
  currency,
  value,
  onChange,
  errors = [],
}: RatesAndCommissionProps) {
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([])
  const [commissionType, setCommissionType] = useState<CommissionModelType>('percentage')
  const [commissionValue, setCommissionValue] = useState<string>('10')

  useEffect(() => {
    ratesApi.listRatePlans(resortId, currency).then((list) => {
      setRatePlans(Array.isArray(list) ? list : [])
    })
  }, [resortId, currency])

  useEffect(() => {
    if (value.commission) {
      setCommissionType(value.commission.type)
      setCommissionValue(String(value.commission.value))
    }
  }, [])

  const handleSelectRate = (plan: RatePlan) => {
    const model = ratesApi.calculateCommission(plan.amount, {
      type: commissionType,
      value: parseFloat(commissionValue) || 0,
    })
    onChange(plan, model)
  }

  const handleCommissionChange = () => {
    const amount = value.ratePlan?.amount ?? 0
    const numVal = parseFloat(commissionValue) || 0
    const model = ratesApi.calculateCommission(amount, { type: commissionType, value: numVal })
    onChange(value.ratePlan, model)
  }

  const plans = ratePlans ?? []
  const hasErrors = (errors ?? []).length > 0

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Rates & Commission</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select a rate plan and configure commission. Commission is auto-calculated.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Rate Plan</Label>
          {plans.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No rate plans available. Select a resort first.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => handleSelectRate(plan)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all duration-200',
                    value.ratePlan?.id === plan.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/30'
                  )}
                >
                  <div>
                    <p className="font-medium">{plan.name}</p>
                    {plan.taxes != null && plan.taxes > 0 && (
                      <p className="text-xs text-muted-foreground">
                        + {formatCurrency(plan.taxes, plan.currency)} taxes
                        {plan.fees != null && plan.fees > 0 && `, + ${formatCurrency(plan.fees, plan.currency)} fees`}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold">{formatCurrency(plan.amount, plan.currency ?? currency)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {value.ratePlan && (
          <>
            <div className="border-t border-border pt-4">
              <Label>Commission Model</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {COMMISSION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setCommissionType(t.value)
                      setTimeout(handleCommissionChange, 0)
                    }}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                      commissionType === t.value
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-border hover:border-accent/50'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <Label htmlFor="commission-value">
                  {commissionType === 'percentage' ? 'Percentage (%)' : 'Amount'}
                </Label>
                <Input
                  id="commission-value"
                  type="number"
                  min={0}
                  step={commissionType === 'percentage' ? 1 : 100}
                  value={commissionValue}
                  onChange={(e) => {
                    setCommissionValue(e.target.value)
                    setTimeout(handleCommissionChange, 0)
                  }}
                  onBlur={handleCommissionChange}
                  className="mt-1 max-w-[140px]"
                />
              </div>
            </div>

            {value.commission && (
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Commission Summary
                </h4>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <span>Commission:</span>
                    <span className="font-semibold">
                      {formatCurrency(value.commission.calculated_commission, currency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <span>Supplier net:</span>
                    <span className="font-semibold">
                      {formatCurrency(value.commission.supplier_net, currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {hasErrors && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            {(errors ?? []).map((msg, i) => (
              <p key={i} className="text-sm text-destructive">
                {msg}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
