import { calcProfit, calcBreakevenAcos } from '@/lib/calc/cpc'

describe('calcProfit', () => {
  it('profit = price - fba - commission - adCost', () => {
    const result = calcProfit({ price: 30, fbaFee: 5, commissionRate: 0.15, cpc: 0.5, cvr: 0.1 })
    expect(result.netProfit).toBeCloseTo(15.5)
  })
})

describe('calcBreakevenAcos', () => {
  it('breakeven acos = (price - fba - commission) / price', () => {
    const result = calcBreakevenAcos({ price: 30, fbaFee: 5, commissionRate: 0.15 })
    expect(result).toBeCloseTo(0.683, 2)
  })
})
