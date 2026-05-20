import { calcMaxCpc } from '@/lib/calc/ad-calc'

describe('calcMaxCpc', () => {
  it('fixed bid: max cpc = bid * multiplier', () => {
    expect(calcMaxCpc({ bid: 1.0, percentage: 0, multiplier: 1 })).toBeCloseTo(1.0)
  })
  it('with placement modifier: bid * (1 + pct/100) * multiplier', () => {
    expect(calcMaxCpc({ bid: 1.0, percentage: 50, multiplier: 2 })).toBeCloseTo(3.0)
  })
  it('down only: no upward multiplier', () => {
    expect(calcMaxCpc({ bid: 2.0, percentage: 0, multiplier: 1 })).toBeCloseTo(2.0)
  })
})
