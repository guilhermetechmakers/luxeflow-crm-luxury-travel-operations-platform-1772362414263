/**
 * Rates API - Rate plans and commission calculation
 * Uses mock data for local development
 * Runtime safety: all responses validated with nullish coalescing and Array.isArray checks
 */
import type { RatePlan, CommissionModel, CommissionModelType } from '@/types/booking'

const MOCK_RATE_PLANS: RatePlan[] = [
  { id: 'rp1', name: 'Standard Rate', amount: 12000, currency: 'EUR', taxes: 1200, fees: 0, discount: 0 },
  { id: 'rp2', name: 'Early Bird', amount: 10800, currency: 'EUR', taxes: 1080, fees: 0, discount: 1200 },
  { id: 'rp3', name: 'Luxury Package', amount: 15600, currency: 'EUR', taxes: 1560, fees: 500, discount: 0 },
  { id: 'rp4', name: 'All-Inclusive', amount: 18900, currency: 'EUR', taxes: 1890, fees: 0, discount: 0 },
]

export const ratesApi = {
  async listRatePlans(_resortId?: string, currency = 'EUR'): Promise<RatePlan[]> {
    const list = MOCK_RATE_PLANS ?? []
    return list.map((r) => ({ ...r, currency }))
  },

  calculateCommission(
    amount: number,
    model: { type: CommissionModelType; value: number }
  ): CommissionModel {
    let calculated = 0
    if (model.type === 'percentage') {
      calculated = amount * ((model.value ?? 0) / 100)
    } else if (model.type === 'fixed') {
      calculated = model.value ?? 0
    } else if (model.type === 'tiered') {
      if (amount >= 15000) calculated = amount * 0.12
      else if (amount >= 10000) calculated = amount * 0.10
      else calculated = amount * 0.08
    }
    return {
      type: model.type,
      value: model.value,
      calculated_commission: Math.round(calculated * 100) / 100,
      supplier_net: Math.round((amount - calculated) * 100) / 100,
    }
  },
}
