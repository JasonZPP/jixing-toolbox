'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Plus, Trash2 } from 'lucide-react'

interface SkuRow { id: number; name: string; length: number; width: number; height: number; units: number }

let nextId = 1

function calcFee(length: number, width: number, height: number, units: number, isPeak: boolean): number {
  const cubicFt = (length * width * height) / 1728
  return cubicFt * units * (isPeak ? 2.40 : 0.78)
}

export default function StorageFeePage() {
  const [rows, setRows] = useState<SkuRow[]>([
    { id: nextId++, name: 'SKU-001', length: 10, width: 8, height: 4, units: 100 },
  ])
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  const isPeak = month >= 10 || month === 1
  const rate = isPeak ? 2.40 : 0.78

  const addRow = () => setRows(p => [...p, { id: nextId++, name: `SKU-00${p.length + 1}`, length: 10, width: 8, height: 4, units: 100 }])
  const removeRow = (id: number) => setRows(p => p.filter(r => r.id !== id))
  const updateRow = <K extends keyof SkuRow>(id: number, key: K, value: SkuRow[K]) =>
    setRows(p => p.map(r => r.id === id ? { ...r, [key]: value } : r))

  const totalFee = rows.reduce((sum, r) => sum + calcFee(r.length, r.width, r.height, r.units, isPeak), 0)

  const ic = 'w-full text-right border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/40'

  return (
    <ToolLayout title="FBA全能仓储费计算器" description="按体积和月份计算仓储费，含旺季附加费，支持多SKU批量计算">
      <div className="space-y-4">
        {/* Month + rate selector */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 flex-wrap">
          <label className="text-sm text-gray-600 shrink-0">月份</label>
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}月{(m >= 10 || m === 1) ? '（旺季）' : ''}</option>
            ))}
          </select>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${isPeak ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
            费率 ${rate}/立方英尺{isPeak ? '（旺季）' : '（淡季）'}
          </span>
        </div>

        {/* SKU table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs text-gray-500 uppercase">
                <th className="p-3 text-left">SKU / 产品名</th>
                <th className="p-3 text-right">长 (in)</th>
                <th className="p-3 text-right">宽 (in)</th>
                <th className="p-3 text-right">高 (in)</th>
                <th className="p-3 text-right">库存数量</th>
                <th className="p-3 text-right">体积 (ft³/件)</th>
                <th className="p-3 text-right">仓储费/月</th>
                <th className="p-3 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const cubicFt = (r.length * r.width * r.height) / 1728
                const fee = calcFee(r.length, r.width, r.height, r.units, isPeak)
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-slate-50/50">
                    <td className="p-2 min-w-[120px]">
                      <input value={r.name} onChange={e => updateRow(r.id, 'name', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/40"/>
                    </td>
                    <td className="p-2 w-20"><input type="number" min="0.1" step="0.1" value={r.length} onChange={e => updateRow(r.id, 'length', parseFloat(e.target.value) || 0)} className={ic}/></td>
                    <td className="p-2 w-20"><input type="number" min="0.1" step="0.1" value={r.width} onChange={e => updateRow(r.id, 'width', parseFloat(e.target.value) || 0)} className={ic}/></td>
                    <td className="p-2 w-20"><input type="number" min="0.1" step="0.1" value={r.height} onChange={e => updateRow(r.id, 'height', parseFloat(e.target.value) || 0)} className={ic}/></td>
                    <td className="p-2 w-24"><input type="number" min="0" step="1" value={r.units} onChange={e => updateRow(r.id, 'units', parseInt(e.target.value) || 0)} className={ic}/></td>
                    <td className="p-3 text-right text-gray-500 text-xs">{cubicFt.toFixed(4)}</td>
                    <td className="p-3 text-right font-semibold text-[#5b5bd6]">${fee.toFixed(2)}</td>
                    <td className="p-2">
                      <button onClick={() => removeRow(r.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="h-3.5 w-3.5"/>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#5b5bd6]/5 border-t border-[#5b5bd6]/10">
                <td colSpan={6} className="p-3 font-bold text-gray-700 text-sm">合计（{rows.length} 个SKU）</td>
                <td className="p-3 text-right font-bold text-[#5b5bd6] text-base">${totalFee.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <div className="p-4 border-t border-gray-100">
            <button onClick={addRow} className="flex items-center gap-1.5 text-sm text-[#5b5bd6] hover:text-[#5b5bd6]/80 font-medium">
              <Plus className="h-4 w-4"/> 添加SKU
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400">尺寸单位：英寸（inches）。体积重 = 长×宽×高÷1728（立方英尺）</p>
      </div>
    </ToolLayout>
  )
}
