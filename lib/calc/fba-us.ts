export interface FbaUsInput {
  weightOz: number
  lengthIn: number
  widthIn: number
  heightIn: number
  year?: 2025 | 2026
  isPeak?: boolean
}

export function getSizeStandard(input: Omit<FbaUsInput, 'year' | 'isPeak'>): string {
  const { weightOz, lengthIn, widthIn, heightIn } = input
  const dims = [lengthIn, widthIn, heightIn].sort((a, b) => b - a)
  if (weightOz <= 15 && dims[0] <= 9 && dims[1] <= 6 && dims[2] <= 0.75) return 'Small Standard'
  if (weightOz <= 400 && dims[0] <= 18 && dims[1] <= 14 && dims[2] <= 8) return 'Large Standard'
  if (dims[0] <= 60 && dims[1] <= 30 && weightOz <= 1120) return 'Large Bulky'
  return 'Extra Large'
}

const FEE_2026: Record<string, (weightOz: number) => number> = {
  'Small Standard': (w) => w <= 2 ? 3.56 : w <= 4 ? 3.69 : w <= 6 ? 3.90 : w <= 8 ? 3.99 : w <= 10 ? 4.15 : w <= 12 ? 4.23 : w <= 14 ? 4.39 : 4.55,
  'Large Standard': (w) => {
    const lb = w / 16
    if (lb <= 0.5) return 4.99; if (lb <= 1) return 5.15; if (lb <= 1.5) return 5.42
    if (lb <= 2) return 5.69; if (lb <= 2.5) return 6.00; if (lb <= 3) return 6.30
    return 6.30 + (lb - 3) * 0.32
  },
  'Large Bulky': (w) => { const lb = w / 16; return 9.73 + Math.max(0, lb - 1) * 0.42 },
  'Extra Large': (w) => { const lb = w / 16; return 26.33 + Math.max(0, lb - 90) * 0.83 },
}

export function calcFbaUs(input: FbaUsInput): number {
  const size = getSizeStandard(input)
  const fee = FEE_2026[size]?.(input.weightOz) ?? 0
  const fuelSurcharge = fee * 0.035
  const peakSurcharge = input.isPeak ? (size.includes('Small') || size === 'Large Standard' ? 0.35 : 0.60) : 0
  return fee + fuelSurcharge + peakSurcharge
}
