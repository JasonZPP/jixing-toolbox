'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Plus, Trash2 } from 'lucide-react'

interface SkuRow {
  id: number
  name: string
  length: number
  width: number
  height: number
  units: number
  ageDays: number
}

let nextId = 1

type ProductType = 'standard' | 'oversize'

// 基本月度仓储费率（美元/立方英尺）
const BASE_RATE: Record<ProductType, { off: number; peak: number }> = {
  standard: { off: 0.78, peak: 2.40 },
  oversize: { off: 0.56, peak: 1.40 },
}

// 超龄库存附加费率（美元/立方英尺/月）按库龄天数分段
function agedSurchargeRate(days: number): number {
  if (days <= 180) return 0
  if (days <= 210) return 0.50
  if (days <= 240) return 1.00
  if (days <= 270) return 1.50
  if (days <= 300) return 3.80
  if (days <= 330) return 4.65
  if (days <= 365) return 5.55
  return 6.90
}

function cubicFeet(l: number, w: number, h: number): number {
  return (l * w * h) / 1728
}

export default function StorageFeePage() {
  const [rows, setRows] = useState<SkuRow[]>([
    { id: nextId++, name: 'SKU-001', length: 10, width: 8, height: 4, units: 100, ageDays: 30 },
  ])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [productType, setProductType] = useState<ProductType>('standard')
  const [utilSurcharge, setUtilSurcharge] = useState(0)

  const isPeak = month >= 10 && month <= 12
  const baseRate = BASE_RATE[productType][isPeak ? 'peak' : 'off']

  const addRow = () => setRows(p => [...p, { id: nextId++, name: `SKU-00${p.length + 1}`, length: 10, width: 8, height: 4, units: 100, ageDays: 30 }])
  const removeRow = (id: number) => setRows(p => p.filter(r => r.id !== id))
  const updateRow = <K extends keyof SkuRow>(id: number, key: K, value: SkuRow[K]) =>
    setRows(p => p.map(r => r.id === id ? { ...r, [key]: value } : r))

  const computed = rows.map(r => {
    const cf = cubicFeet(r.length, r.width, r.height)
    const totalCf = cf * r.units
    const base = totalCf * baseRate
    const util = totalCf * utilSurcharge
    const aged = totalCf * agedSurchargeRate(r.ageDays)
    return { ...r, cf, totalCf, base, util, aged, total: base + util + aged }
  })

  const grand = computed.reduce((s, r) => ({
    base: s.base + r.base, util: s.util + r.util, aged: s.aged + r.aged, total: s.total + r.total,
  }), { base: 0, util: 0, aged: 0, total: 0 })

  const ic = 'w-full text-right border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/40'

  return (
    <ToolLayout title="FBA全能仓储费计算器" description="基本月度仓储费 + 仓储利用率附加费 + 超龄库存附加费，支持多SKU批量计算">
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">月份</label>
            <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}月{(m >= 10 && m <= 12) ? '（旺季）' : '（淡季）'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">商品类型</label>
            <select value={productType} onChange={e => setProductType(e.target.value as ProductType)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40">
              <option value="standard">标准尺寸</option>
              <option value="oversize">大件商品</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">仓储利用率附加费（$/立方英尺）</label>
            <input type="number" min="0" step="0.05" value={utilSurcharge}
              onChange={e => setUtilSurcharge(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          当前基础费率 <span className="font-medium text-[#5b5bd6]">${baseRate}/立方英尺</span>（{productType === 'standard' ? '标准尺寸' : '大件'}·{isPeak ? '旺季' : '淡季'}）。
          仓储利用率附加费由账户库存周转比决定，请在亚马逊后台「库存绩效」中查看实际费率后填入。超龄附加费按库龄天数自动分段（181天起）。
        </p>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs text-gray-500 uppercase">
                <th className="p-3 text-left">SKU</th>
                <th className="p-3 text-right">长(in)</th>
                <th className="p-3 text-right">宽(in)</th>
                <th className="p-3 text-right">高(in)</th>
                <th className="p-3 text-right">数量</th>
                <th className="p-3 text-right">库龄(天)</th>
                <th className="p-3 text-right">基本费</th>
                <th className="p-3 text-right">利用率附加</th>
                <th className="p-3 text-right">超龄附加</th>
                <th className="p-3 text-right">小计</th>
                <th className="p-3 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {computed.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-slate-50/50">
                  <td className="p-2 min-w-[110px]"><input value={r.name} onChange={e => updateRow(r.id, 'name', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/40"/></td>
                  <td className="p-2 w-16"><input type="number" min="0.1" step="0.1" value={r.length} onChange={e => updateRow(r.id, 'length', parseFloat(e.target.value) || 0)} className={ic}/></td>
                  <td className="p-2 w-16"><input type="number" min="0.1" step="0.1" value={r.width} onChange={e => updateRow(r.id, 'width', parseFloat(e.target.value) || 0)} className={ic}/></td>
                  <td className="p-2 w-16"><input type="number" min="0.1" step="0.1" value={r.height} onChange={e => updateRow(r.id, 'height', parseFloat(e.target.value) || 0)} className={ic}/></td>
                  <td className="p-2 w-20"><input type="number" min="0" step="1" value={r.units} onChange={e => updateRow(r.id, 'units', parseInt(e.target.value) || 0)} className={ic}/></td>
                  <td className="p-2 w-20"><input type="number" min="0" step="1" value={r.ageDays} onChange={e => updateRow(r.id, 'ageDays', parseInt(e.target.value) || 0)} className={ic}/></td>
                  <td className="p-3 text-right text-gray-600">${r.base.toFixed(2)}</td>
                  <td className="p-3 text-right text-gray-600">${r.util.toFixed(2)}</td>
                  <td className={`p-3 text-right ${r.aged > 0 ? 'text-orange-500 font-medium' : 'text-gray-400'}`}>${r.aged.toFixed(2)}</td>
                  <td className="p-3 text-right font-semibold text-[#5b5bd6]">${r.total.toFixed(2)}</td>
                  <td className="p-2"><button onClick={() => removeRow(r.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="h-3.5 w-3.5"/></button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#5b5bd6]/5 border-t border-[#5b5bd6]/10 font-bold text-gray-700">
                <td colSpan={6} className="p-3 text-sm">合计（{rows.length} 个SKU）</td>
                <td className="p-3 text-right text-sm">${grand.base.toFixed(2)}</td>
                <td className="p-3 text-right text-sm">${grand.util.toFixed(2)}</td>
                <td className="p-3 text-right text-sm text-orange-500">${grand.aged.toFixed(2)}</td>
                <td className="p-3 text-right text-[#5b5bd6] text-base">${grand.total.toFixed(2)}</td>
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

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 space-y-1">
          <p className="font-medium">超龄库存附加费分段（$/立方英尺/月）</p>
          <p>181-210天 +$0.50 ｜ 211-240天 +$1.00 ｜ 241-270天 +$1.50 ｜ 271-300天 +$3.80 ｜ 301-330天 +$4.65 ｜ 331-365天 +$5.55 ｜ 365天以上 +$6.90</p>
          <p className="text-amber-600">注：以上为常见费率参考，亚马逊费率每年调整，实际以后台费用预览为准。</p>
        </div>
      </div>
    </ToolLayout>
  )
}
