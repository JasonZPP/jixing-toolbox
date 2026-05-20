'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'

export default function MaxReserveFeePage() {
  const [cubicFt, setCubicFt] = useState(1.0)
  const [units, setUnits] = useState(100)
  const [month, setMonth] = useState(6)

  const isPeak = month >= 10 || month === 1
  const storageRate = isPeak ? 2.40 : 0.78
  const reserveFeeRate = isPeak ? 1.50 : 0.50
  const storageCost = cubicFt * units * storageRate
  const reserveFee = cubicFt * units * reserveFeeRate
  const maxFreeUnits = cubicFt > 0 ? Math.floor(storageCost / reserveFeeRate / cubicFt) : 0

  return (
    <ToolLayout title="最高预留费计算工具" description="计算白嫖库容的最优预留数量">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-md space-y-4">
        {[
          { label: '单件体积 (立方英尺)', value: cubicFt, setter: setCubicFt, step: 0.01 },
          { label: '库存数量', value: units, setter: setUnits, step: 1 },
        ].map(({ label, value, setter, step }) => (
          <div key={label} className="flex items-center justify-between">
            <label className="text-sm text-gray-600">{label}</label>
            <input type="number" min="0" step={step} value={value} onChange={e => setter(parseFloat(e.target.value)||0)}
              className="w-32 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
        ))}
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">月份</label>
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
            className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {Array.from({length:12},(_,i)=>i+1).map(m=>(
              <option key={m} value={m}>{m}月{(m>=10||m===1)?'（旺季）':''}</option>
            ))}
          </select>
        </div>
        <div className="border-t border-gray-100 pt-4 space-y-2">
          {[
            { label: '仓储费/月', value: `$${storageCost.toFixed(2)}` },
            { label: '预留费/月', value: `$${reserveFee.toFixed(2)}` },
            { label: '最大免费预留件数', value: `${maxFreeUnits} 件`, highlight: true },
          ].map(row => (
            <div key={row.label} className={`flex justify-between border-b border-gray-50 pb-2 ${(row as {highlight?:boolean}).highlight ? 'font-bold text-indigo-600' : 'text-gray-600'}`}>
              <span className="text-sm">{row.label}</span>
              <span className="text-sm">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
