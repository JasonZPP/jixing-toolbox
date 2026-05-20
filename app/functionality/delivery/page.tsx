'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { calcFbaUs, getSizeStandard } from '@/lib/calc/fba-us'

export default function DeliveryPage() {
  const [weight, setWeight] = useState(8)
  const [unit, setUnit] = useState<'oz' | 'g'>('oz')
  const [length, setLength] = useState(8)
  const [width, setWidth] = useState(5)
  const [height, setHeight] = useState(2)
  const [dimUnit, setDimUnit] = useState<'in' | 'cm'>('in')
  const [isPeak, setIsPeak] = useState(false)
  const [price, setPrice] = useState(30)
  const [exchangeRate, setExchangeRate] = useState(7.2)

  const weightOz = unit === 'oz' ? weight : weight / 28.35
  const lengthIn = dimUnit === 'in' ? length : length / 2.54
  const widthIn = dimUnit === 'in' ? width : width / 2.54
  const heightIn = dimUnit === 'in' ? height : height / 2.54

  const size = getSizeStandard({ weightOz, lengthIn, widthIn, heightIn })
  const fbaFee = calcFbaUs({ weightOz, lengthIn, widthIn, heightIn, year: 2026, isPeak })
  const commission = price * 0.15
  const netProfit = price - fbaFee - commission

  return (
    <ToolLayout title="美国站配送费计算" description="基于2026年最新费率表计算FBA配送费">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">产品参数</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500">重量</label>
              <input type="number" min="0" step="0.1" value={weight} onChange={e => setWeight(+e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500">单位</label>
              <select value={unit} onChange={e => setUnit(e.target.value as 'oz' | 'g')}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="oz">oz</option>
                <option value="g">克(g)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            {(['长', '宽', '高'] as const).map((label, idx) => {
              const vals = [length, width, height]
              const setters = [setLength, setWidth, setHeight]
              return (
                <div key={label} className="flex-1">
                  <label className="text-xs text-gray-500">{label}</label>
                  <input type="number" min="0" step="0.1" value={vals[idx]} onChange={e => setters[idx](+e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              )
            })}
            <div>
              <label className="text-xs text-gray-500">单位</label>
              <select value={dimUnit} onChange={e => setDimUnit(e.target.value as 'in' | 'cm')}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="in">英寸</option>
                <option value="cm">cm</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={isPeak} onChange={e => setIsPeak(e.target.checked)} />
            旺季（10月15日 - 1月14日）
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500">售价 ($)</label>
              <input type="number" min="0" step="0.5" value={price} onChange={e => setPrice(+e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500">汇率 (¥/$)</label>
              <input type="number" min="1" step="0.1" value={exchangeRate} onChange={e => setExchangeRate(+e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
          <h3 className="font-semibold text-gray-700 mb-4">计算结果（2026年费率）</h3>
          {[
            { label: '尺寸标准', value: size },
            { label: '实际重量', value: `${weightOz.toFixed(1)} oz` },
            { label: 'FBA配送费（含燃油附加）', value: `$${fbaFee.toFixed(2)}` },
            { label: '平台佣金 (15%)', value: `-$${commission.toFixed(2)}` },
            { label: '预估净利润（不含采购/头程）', value: `$${netProfit.toFixed(2)} / ¥${(netProfit*exchangeRate).toFixed(0)}`, highlight: true },
          ].map(row => (
            <div key={row.label} className={`flex justify-between border-b border-gray-50 pb-3 ${(row as {highlight?: boolean}).highlight ? 'font-bold text-indigo-600' : 'text-gray-600'}`}>
              <span className="text-sm">{row.label}</span>
              <span className="text-sm">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
