'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { calcProfit, calcBreakevenAcos } from '@/lib/calc/cpc'

const CATEGORIES = ['家居', '厨房', '运动', '玩具', '服装', '其他'] as const
const COMMISSION: Record<string, number> = {
  家居: 0.15, 厨房: 0.15, 运动: 0.15, 玩具: 0.15, 服装: 0.17, 其他: 0.15,
}

export default function CpcCompassPage() {
  const [price, setPrice] = useState(30)
  const [fbaFee, setFbaFee] = useState(5)
  const [category, setCategory] = useState('家居')
  const [cpc, setCpc] = useState(0.8)
  const [cvr, setCvr] = useState(0.1)

  const rate = COMMISSION[category]
  const result = calcProfit({ price, fbaFee, commissionRate: rate, cpc, cvr })
  const beAcos = calcBreakevenAcos({ price, fbaFee, commissionRate: rate })

  const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div className={`flex justify-between py-3 border-b border-gray-50 ${highlight ? 'font-bold text-indigo-600' : 'text-gray-600'}`}>
      <span className="text-sm">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )

  return (
    <ToolLayout title="CPC 利润测算" description="综合FBA费用、佣金、CPC成本估算每单净利润">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">基本参数</h3>
          {[
            { label: '售价 ($)', value: price, setter: setPrice, step: 0.5 },
            { label: 'FBA配送费 ($)', value: fbaFee, setter: setFbaFee, step: 0.1 },
            { label: '广告CPC ($)', value: cpc, setter: setCpc, step: 0.01 },
            { label: '广告转化率 (如 0.1 = 10%)', value: cvr, setter: setCvr, step: 0.01 },
          ].map(({ label, value, setter, step }) => (
            <div key={label} className="flex items-center justify-between">
              <label className="text-sm text-gray-600 w-44">{label}</label>
              <input type="number" min="0" step={step} value={value}
                onChange={e => setter(parseFloat(e.target.value) || 0)}
                className="w-32 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          ))}
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600 w-44">品类（佣金率）</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {CATEGORIES.map(c => <option key={c}>{c} ({(COMMISSION[c]*100).toFixed(0)}%)</option>)}
            </select>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">计算结果</h3>
          <Row label="售价" value={`$${price.toFixed(2)}`} />
          <Row label="FBA配送费" value={`-$${fbaFee.toFixed(2)}`} />
          <Row label={`平台佣金 (${(rate*100).toFixed(0)}%)`} value={`-$${result.commission.toFixed(2)}`} />
          <Row label="每单广告花费" value={`-$${result.adCostPerSale.toFixed(2)}`} />
          <Row label="实际ACOS" value={`${(result.acos*100).toFixed(1)}%`} />
          <Row label="盈亏平衡ACOS" value={`${(beAcos*100).toFixed(1)}%`} />
          <Row label="每单净利润" value={`$${result.netProfit.toFixed(2)}`} highlight />
          {result.netProfit < 0 && (
            <p className="mt-3 text-xs text-red-500 bg-red-50 rounded-lg p-3">
              当前参数下每单亏损 ${Math.abs(result.netProfit).toFixed(2)}，建议降低CPC或提升售价
            </p>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
