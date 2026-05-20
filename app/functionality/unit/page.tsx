'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'

type Category = 'length' | 'weight' | 'volume' | 'temperature'

const CONVERSIONS: Record<Category, { label: string; units: string[]; toBase: number[]; fromBase: (v:number)=>number[] }> = {
  length: {
    label: '长度', units: ['英寸(in)', '厘米(cm)', '毫米(mm)', '英尺(ft)', '米(m)'],
    toBase: [1, 1/2.54, 1/25.4, 12, 39.3701],
    fromBase: (v) => [v, v*2.54, v*25.4, v/12, v/39.3701],
  },
  weight: {
    label: '重量', units: ['盎司(oz)', '克(g)', '千克(kg)', '磅(lb)'],
    toBase: [1, 1/28.3495, 1/453.592, 16],
    fromBase: (v) => [v, v*28.3495, v*0.028349, v/16],
  },
  volume: {
    label: '体积', units: ['立方英寸(in³)', '立方厘米(cm³)', '立方英尺(ft³)', '升(L)'],
    toBase: [1, 1/16.3871, 1728, 1/0.0163871],
    fromBase: (v) => [v, v*16.3871, v/1728, v*0.0163871],
  },
  temperature: {
    label: '温度', units: ['摄氏度(°C)', '华氏度(°F)', '开尔文(K)'],
    toBase: [1, 1, 1],
    fromBase: (c) => [c, c*9/5+32, c+273.15],
  },
}

export default function UnitPage() {
  const [category, setCategory] = useState<Category>('length')
  const [fromUnit, setFromUnit] = useState(0)
  const [value, setValue] = useState(1)

  const conv = CONVERSIONS[category]
  const baseValue = category === 'temperature'
    ? (fromUnit === 0 ? value : fromUnit === 1 ? (value - 32) * 5/9 : value - 273.15)
    : value * conv.toBase[fromUnit]
  const results = conv.fromBase(baseValue)

  return (
    <ToolLayout title="单位换算" description="长度、重量、体积、温度常用单位互转">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-lg">
        <div className="flex gap-3 mb-6 flex-wrap">
          {(Object.keys(CONVERSIONS) as Category[]).map(cat => (
            <button key={cat} onClick={() => { setCategory(cat); setFromUnit(0); setValue(1) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${category === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>
              {CONVERSIONS[cat].label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 mb-6">
          <input type="number" value={value} onChange={e => setValue(parseFloat(e.target.value)||0)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <select value={fromUnit} onChange={e => setFromUnit(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {conv.units.map((u, i) => <option key={i} value={i}>{u}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          {conv.units.map((u, i) => i !== fromUnit && (
            <div key={i} className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-gray-600">{u}</span>
              <span className="text-sm font-bold text-indigo-600">{results[i].toFixed(6).replace(/\.?0+$/, '')}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
