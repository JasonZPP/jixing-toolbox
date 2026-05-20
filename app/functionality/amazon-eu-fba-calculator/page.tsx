'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { calcAllMarkets } from '@/lib/calc/fba-eu'
import type { EuMarket } from '@/lib/calc/fba-eu'

const MARKET_FLAGS: Record<EuMarket, string> = { UK: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', IT: '🇮🇹', ES: '🇪🇸' }
const MARKET_NAMES: Record<EuMarket, string> = { UK: '英国', DE: '德国', FR: '法国', IT: '意大利', ES: '西班牙' }

export default function EuFbaPage() {
  const [weight, setWeight] = useState(0.5)
  const [length, setLength] = useState(20)
  const [width, setWidth] = useState(15)
  const [height, setHeight] = useState(5)
  const [price, setPrice] = useState(25)

  const fees = calcAllMarkets({ weightKg: weight, lengthCm: length, widthCm: width, heightCm: height })
  const markets = Object.keys(fees) as EuMarket[]

  return (
    <ToolLayout title="Amazon EU FBA 费用计算器" description="五大欧洲站点FBA费用横向对比（2026年费率）">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">产品参数</h3>
          {[
            { label: '重量 (kg)', value: weight, setter: setWeight, step: 0.05 },
            { label: '长度 (cm)', value: length, setter: setLength, step: 1 },
            { label: '宽度 (cm)', value: width, setter: setWidth, step: 1 },
            { label: '高度 (cm)', value: height, setter: setHeight, step: 1 },
            { label: '售价 (€)', value: price, setter: setPrice, step: 0.5 },
          ].map(({ label, value, setter, step }) => (
            <div key={label} className="flex items-center justify-between">
              <label className="text-sm text-gray-600">{label}</label>
              <input type="number" min="0" step={step} value={value}
                onChange={e => setter(parseFloat(e.target.value)||0)}
                className="w-32 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">各站点费用对比</h3>
          <div className="space-y-3">
            {markets.map(m => {
              const fee = fees[m]
              const profit = price - fee - price * 0.15
              return (
                <div key={m} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm font-medium">{MARKET_FLAGS[m]} {MARKET_NAMES[m]}</span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-600">€{fee.toFixed(2)} FBA费</div>
                    <div className={`text-xs ${profit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      预估利润 €{profit.toFixed(2)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
