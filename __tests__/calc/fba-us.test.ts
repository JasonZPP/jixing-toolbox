import { calcFbaUs, getSizeStandard } from '@/lib/calc/fba-us'

describe('getSizeStandard', () => {
  it('small standard: ≤15oz, ≤9x6x0.75 inches', () => {
    expect(getSizeStandard({ weightOz: 14, lengthIn: 8, widthIn: 5, heightIn: 0.5 })).toBe('Small Standard')
  })
  it('large standard: >15oz or dimension exceeds small standard', () => {
    expect(getSizeStandard({ weightOz: 20, lengthIn: 10, widthIn: 7, heightIn: 2 })).toBe('Large Standard')
  })
})

describe('calcFbaUs', () => {
  it('returns a positive fee for small standard item (2026)', () => {
    const fee = calcFbaUs({ weightOz: 10, lengthIn: 8, widthIn: 5, heightIn: 0.5, year: 2026 })
    expect(fee).toBeGreaterThan(3)
  })
})
