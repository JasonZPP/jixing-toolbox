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

type ProductType = 'standard' | 'oversize' | 'hazmat_standard' | 'hazmat_oversize'

const BASE_RATE: Record<ProductType, { off: number; peak: number }> = {
  standard:        { off: 0.78,  peak: 2.40 },
  oversize:        { off: 0.56,  peak: 1.40 },
  hazmat_standard: { off: 0.99,  peak: 3.63 },
  hazmat_oversize: { off: 0.78,  peak: 2.43 },
}

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  standard:        '标准尺寸',
  oversize:        '大件商品',
  hazmat_standard: '危险品（标准尺寸）',
  hazmat_oversize: '危险品（大件）',
}

// Inventory Storage Utilization Surcharge — product-type specific rates ($/cf/month)
const UTIL_TIERS_STANDARD: Array<{ max: number; rate: number; label: string }> = [
  { max: 22,  rate: 0.00, label: '≤22 周' },
  { max: 26,  rate: 0.17, label: '23–26 周' },
  { max: 30,  rate: 0.23, label: '27–30 周' },
  { max: 34,  rate: 0.30, label: '31–34 周' },
  { max: 38,  rate: 0.39, label: '35–38 周' },
  { max: 42,  rate: 0.51, label: '39–42 周' },
  { max: 46,  rate: 0.67, label: '43–46 周' },
  { max: 50,  rate: 0.87, label: '47–50 周' },
  { max: 52,  rate: 1.13, label: '51–52 周' },
  { max: Infinity, rate: 1.88, label: '>52 周' },
]

const UTIL_TIERS_OVERSIZE: Array<{ max: number; rate: number; label: string }> = [
  { max: 26,  rate: 0.00, label: '≤26 周' },
  { max: 30,  rate: 0.08, label: '27–30 周' },
  { max: 34,  rate: 0.11, label: '31–34 周' },
  { max: 38,  rate: 0.14, label: '35–38 周' },
  { max: 42,  rate: 0.18, label: '39–42 周' },
  { max: 46,  rate: 0.24, label: '43–46 周' },
  { max: 50,  rate: 0.31, label: '47–50 周' },
  { max: 52,  rate: 0.40, label: '51–52 周' },
  { max: Infinity, rate: 0.66, label: '>52 周' },
]

function getUtilTiers(pt: ProductType) {
  return (pt === 'oversize' || pt === 'hazmat_oversize') ? UTIL_TIERS_OVERSIZE : UTIL_TIERS_STANDARD
}

function utilRateFromWeeks(weeks: number, pt: ProductType): number {
  const tiers = getUtilTiers(pt)
  return tiers.find(t => weeks <= t.max)?.rate ?? tiers[tiers.length - 1].rate
}

// 2024 Aged Inventory Surcharge ($/cf/month)
function agedSurchargeRate(days: number): number {
  if (days <= 180) return 0
  if (days <= 210) return 0.50
  if (days <= 240) return 1.00
  if (days <= 270) return 1.50
  if (days <= 300) return 5.45
  if (days <= 330) return 5.70
  if (days <= 365) return 5.90
  if (days <= 455) return 6.90
  return 10.00
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
  const [weeksOfSupply, setWeeksOfSupply] = useState(20)
  const [showTierTable, setShowTierTable] = useState(false)

  const isPeak = month >= 10 && month <= 12
  const baseRate = BASE_RATE[productType][isPeak ? 'peak' : 'off']
  const utilSurcharge = utilRateFromWeeks(weeksOfSupply, productType)

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
  const utilTiers = getUtilTiers(productType)
  const activeTier = utilTiers.find(t => weeksOfSupply <= t.max)

  return (
    <ToolLayout title="FBA全能仓储费计算器" description="基本月度仓储费 + 仓储利用率附加费 + 超龄库存附加费，支持多SKU批量计算">
      <div className="space-y-4">
        {/* Global Settings */}
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
              {(Object.keys(PRODUCT_TYPE_LABELS) as ProductType[]).map(k => (
                <option key={k} value={k}>{PRODUCT_TYPE_LABELS[k]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              库存供应周数（Weeks of Supply）
              <button onClick={() => setShowTierTable(v => !v)} className="ml-2 text-[#5b5bd6] underline text-xs">
                {showTierTable ? '收起费率表' : '查看费率表'}
              </button>
            </label>
            <input type="number" min="1" step="1" value={weeksOfSupply}
              onChange={e => setWeeksOfSupply(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
          </div>
        </div>

        {/* Utilization tier reference */}
        {showTierTable && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 mb-2">仓储利用率附加费分段（按库存供应周数）</p>
            <div className="grid grid-cols-5 gap-1">
              {utilTiers.map(t => (
                <div key={t.label} className={`rounded-lg px-2 py-1.5 text-center text-xs border ${activeTier?.label === t.label ? 'bg-[#5b5bd6] text-white border-[#5b5bd6]' : 'bg-white text-gray-600 border-blue-100'}`}>
                  <div className="font-medium">{t.label}</div>
                  <div>{t.rate === 0 ? '免收' : `$${t.rate.toFixed(2)}/cf`}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400">
          基础费率 <span className="font-medium text-[#5b5bd6]">${baseRate}/立方英尺</span>（{PRODUCT_TYPE_LABELS[productType]}·{isPeak ? '旺季' : '淡季'}）
          · 利用率附加费 <span className="font-medium text-[#5b5bd6]">${utilSurcharge.toFixed(2)}/cf</span>（{activeTier?.label}，{(productType === 'oversize' || productType === 'hazmat_oversize') ? '大件费率' : '标准尺寸费率'}）。
          超龄附加费按库龄天数自动分段（181天起，455天以上 $10.00/cf）。
        </p>

        {/* SKU Table */}
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

        {/* Aged inventory reference */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 space-y-1">
          <p className="font-medium">超龄库存附加费分段（$/立方英尺/月）</p>
          <p>181–210天 +$0.50 ｜ 211–240天 +$1.00 ｜ 241–270天 +$1.50 ｜ 271–300天 +$5.45 ｜ 301–330天 +$5.70 ｜ 331–365天 +$5.90 ｜ 366–455天 +$6.90 ｜ <span className="font-semibold">455天以上 +$10.00</span></p>
          <p className="text-amber-600">注：费率数据参考亚马逊2024年收费标准，实际以后台费用预览为准。</p>
        </div>
      </div>
    </ToolLayout>
  )
}
