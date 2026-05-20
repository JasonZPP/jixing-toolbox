'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'

export default function CartonCalcPage() {
  const [pL, setPL] = useState(10); const [pW, setPW] = useState(8); const [pH, setPH] = useState(4)
  const [cL, setCL] = useState(40); const [cW, setCW] = useState(30); const [cH, setCH] = useState(25)
  const [weightPerUnit, setWeightPerUnit] = useState(0.3)
  const [totalUnits, setTotalUnits] = useState(50)

  const qtyPerCarton = Math.max(1, Math.floor(cL/pL) * Math.floor(cW/pW) * Math.floor(cH/pH))
  const cartons = Math.ceil(totalUnits / qtyPerCarton)
  const volWeightKg = (cL * cW * cH) / 6000
  const actualWeightKg = weightPerUnit * qtyPerCarton
  const chargeableWeight = Math.max(volWeightKg, actualWeightKg)

  return (
    <ToolLayout title="外箱装箱计算器" description="计算装箱数量、总重量与体积重">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">产品尺寸 (cm)</h3>
          <div className="grid grid-cols-3 gap-3">
            {([['长', pL, setPL], ['宽', pW, setPW], ['高', pH, setPH]] as const).map(([label, val, setter]) => (
              <div key={String(label)}>
                <label className="text-xs text-gray-500">{label}</label>
                <input type="number" min="0.1" step="0.1" value={val}
                  onChange={e => setter(+e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-gray-700">外箱内径 (cm)</h3>
          <div className="grid grid-cols-3 gap-3">
            {([['长', cL, setCL], ['宽', cW, setCW], ['高', cH, setCH]] as const).map(([label, val, setter]) => (
              <div key={String(label)}>
                <label className="text-xs text-gray-500">{label}</label>
                <input type="number" min="1" step="1" value={val}
                  onChange={e => setter(+e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">单件重量 (kg)</label>
            <input type="number" min="0" step="0.01" value={weightPerUnit} onChange={e => setWeightPerUnit(+e.target.value)}
              className="w-32 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">发货总数量</label>
            <input type="number" min="1" step="1" value={totalUnits} onChange={e => setTotalUnits(+e.target.value)}
              className="w-32 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
          <h3 className="font-semibold text-gray-700">计算结果</h3>
          {[
            { label: '每箱装数', value: `${qtyPerCarton} 件` },
            { label: '总箱数', value: `${cartons} 箱`, highlight: true },
            { label: '每箱实重', value: `${actualWeightKg.toFixed(2)} kg` },
            { label: '每箱体积重 (÷6000)', value: `${volWeightKg.toFixed(2)} kg` },
            { label: '计费重量（取大值）', value: `${chargeableWeight.toFixed(2)} kg` },
            { label: '总计费重量', value: `${(chargeableWeight*cartons).toFixed(1)} kg`, highlight: true },
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
