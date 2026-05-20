'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'

function calcStorageFee(cubicFt: number, isPeak: boolean): number {
  return cubicFt * (isPeak ? 2.40 : 0.78)
}

export default function StorageFeePage() {
  const [length, setLength] = useState(10)
  const [width, setWidth] = useState(8)
  const [height, setHeight] = useState(4)
  const [units, setUnits] = useState(100)
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  const isPeak = month >= 10 || month === 1
  const cubicInch = length * width * height
  const cubicFt = cubicInch / 1728
  const feePerUnit = calcStorageFee(cubicFt, isPeak)
  const totalFee = feePerUnit * units

  return (
    <ToolLayout title="FBA全能仓储费计算器" description="按体积和月份计算月仓储费，含旺季附加费">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">产品参数</h3>
          {[
            { label: '长 (inches)', value: length, setter: setLength },
            { label: '宽 (inches)', value: width, setter: setWidth },
            { label: '高 (inches)', value: height, setter: setHeight },
            { label: '库存数量', value: units, setter: setUnits },
          ].map(({ label, value, setter }) => (
            <div key={label} className="flex items-center justify-between">
              <label className="text-sm text-gray-600">{label}</label>
              <input type="number" min="0" step="0.1" value={value}
                onChange={e => setter(parseFloat(e.target.value)||0)}
                className="w-32 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          ))}
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">月份</label>
            <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
              className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {Array.from({length:12},(_,i)=>i+1).map(m => (
                <option key={m} value={m}>{m}月{(m>=10||m===1)?'（旺季）':''}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
          <h3 className="font-semibold text-gray-700">计算结果</h3>
          {[
            { label: '体积（立方英寸）', value: cubicInch.toFixed(1) },
            { label: '体积（立方英尺）', value: cubicFt.toFixed(4) },
            { label: '费率', value: `$${isPeak ? 2.40 : 0.78}/立方英尺${isPeak ? '（旺季）' : ''}` },
            { label: '单件仓储费/月', value: `$${feePerUnit.toFixed(4)}` },
            { label: `${units}件总仓储费/月`, value: `$${totalFee.toFixed(2)}`, highlight: true },
          ].map(row => (
            <div key={row.label} className={`flex justify-between border-b border-gray-50 pb-3 ${(row as {highlight?:boolean}).highlight ? 'font-bold text-indigo-600' : 'text-gray-600'}`}>
              <span className="text-sm">{row.label}</span>
              <span className="text-sm">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
