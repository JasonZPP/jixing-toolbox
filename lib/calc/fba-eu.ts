export type EuMarket = 'UK' | 'DE' | 'FR' | 'IT' | 'ES'

export interface EuFbaInput {
  weightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  market: EuMarket
}

const EU_FEES_2026: Record<EuMarket, (kg: number) => number> = {
  UK: (kg) => kg <= 0.1 ? 2.40 : kg <= 0.2 ? 2.68 : kg <= 0.5 ? 3.40 : kg <= 1 ? 4.12 : 4.12 + (kg-1)*1.1,
  DE: (kg) => kg <= 0.1 ? 2.55 : kg <= 0.2 ? 2.85 : kg <= 0.5 ? 3.58 : kg <= 1 ? 4.31 : 4.31 + (kg-1)*1.1,
  FR: (kg) => kg <= 0.1 ? 2.62 : kg <= 0.2 ? 2.93 : kg <= 0.5 ? 3.68 : kg <= 1 ? 4.43 : 4.43 + (kg-1)*1.2,
  IT: (kg) => kg <= 0.1 ? 2.61 : kg <= 0.2 ? 2.91 : kg <= 0.5 ? 3.66 : kg <= 1 ? 4.41 : 4.41 + (kg-1)*1.2,
  ES: (kg) => kg <= 0.1 ? 2.48 : kg <= 0.2 ? 2.77 : kg <= 0.5 ? 3.48 : kg <= 1 ? 4.19 : 4.19 + (kg-1)*1.1,
}

export function calcFbaEu(input: EuFbaInput): number {
  return EU_FEES_2026[input.market]?.(input.weightKg) ?? 0
}

export function calcAllMarkets(input: Omit<EuFbaInput, 'market'>): Record<EuMarket, number> {
  const markets: EuMarket[] = ['UK', 'DE', 'FR', 'IT', 'ES']
  return Object.fromEntries(markets.map(m => [m, calcFbaEu({ ...input, market: m })])) as Record<EuMarket, number>
}
