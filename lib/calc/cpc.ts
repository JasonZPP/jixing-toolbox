export interface ProfitInput {
  price: number
  fbaFee: number
  commissionRate: number
  cpc: number
  cvr: number
}

export function calcProfit(input: ProfitInput) {
  const { price, fbaFee, commissionRate, cpc, cvr } = input
  const commission = price * commissionRate
  const adCostPerSale = cvr > 0 ? cpc / cvr : 0
  const netProfit = price - fbaFee - commission - adCostPerSale
  const acos = adCostPerSale / price
  return { commission, adCostPerSale, netProfit, acos }
}

export function calcBreakevenAcos(input: { price: number; fbaFee: number; commissionRate: number }) {
  const { price, fbaFee, commissionRate } = input
  return (price - fbaFee - price * commissionRate) / price
}
