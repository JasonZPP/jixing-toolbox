export interface AdCalcInput {
  bid: number
  percentage: number
  multiplier: number
}

export function calcMaxCpc({ bid, percentage, multiplier }: AdCalcInput): number {
  return bid * (1 + percentage / 100) * multiplier
}

export interface AdRow {
  position: string
  strategy: 'fixed' | 'updown' | 'downonly'
  bid: number
  percentage: number
  multiplier: number
}

export function calcRow(row: AdRow) {
  const newCpc = calcMaxCpc({ bid: row.bid, percentage: row.percentage, multiplier: row.multiplier })
  return { ...row, newCpc }
}

export const MULTIPLIERS: Record<string, Record<string, number>> = {
  fixed:    { top: 1, product: 1, rest: 1 },
  updown:   { top: 2, product: 1.5, rest: 1 },
  downonly: { top: 1, product: 1,   rest: 1 },
}
