'use client'
import { Fragment, useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { MULTIPLIERS } from '@/lib/calc/ad-calc'

type Strategy = 'fixed' | 'updown' | 'downonly'
type Position = 'top' | 'product' | 'rest'

interface Row {
  strategy: Strategy
  position: Position
  positionLabel: string
  bidOld: string
  bidNew: string
  pctOld: string
  pctNew: string
}

const POSITIONS: { position: Position; label: string }[] = [
  { position: 'top', label: '搜索结果顶部（首页）' },
  { position: 'product', label: '商品页面' },
  { position: 'rest', label: '搜索结果其余位置' },
]

const STRATEGY_META: { strategy: Strategy; label: string; band: string; text: string }[] = [
  { strategy: 'fixed', label: 'Fixed bids（固定竞价）', band: 'bg-red-50 border-red-100', text: 'text-red-600' },
  { strategy: 'updown', label: 'up and down（动态竞价-提高和降低）', band: 'bg-purple-50 border-purple-100', text: 'text-purple-600' },
  { strategy: 'downonly', label: 'down only（动态竞价-仅降低）', band: 'bg-blue-50 border-blue-100', text: 'text-blue-600' },
]

function makeRows(): Row[] {
  const rows: Row[] = []
  for (const { strategy } of STRATEGY_META) {
    for (const { position, label } of POSITIONS) {
      rows.push({ strategy, position, positionLabel: label, bidOld: '', bidNew: '', pctOld: '', pctNew: '' })
    }
  }
  return rows
}

function cpc(bid: string, pct: string, multiplier: number): string {
  const b = parseFloat(bid)
  if (isNaN(b)) return '—'
  const p = parseFloat(pct)
  return (b * (1 + (isNaN(p) ? 0 : p) / 100) * multiplier).toFixed(3)
}

export default function AdCalcPage() {
  const [rows, setRows] = useState<Row[]>(makeRows())

  const update = (i: number, field: 'bidOld' | 'bidNew' | 'pctOld' | 'pctNew', val: string) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  const reset = () => setRows(makeRows())

  const inputCls = 'w-20 text-center border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/50'

  return (
    <ToolLayout title="广告竞价计算" description="按竞价策略与广告位计算实际最高CPC，支持原/新出价对比">
      <div className="space-y-4">
        <div className="flex justify-end">
          <button onClick={reset} className="text-sm text-gray-500 hover:text-[#5b5bd6] border border-gray-200 rounded-lg px-3 py-1.5">
            清空
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#5b5bd6]/5 text-xs font-semibold text-gray-600 border-b border-gray-200">
                <th className="p-3 border-r border-gray-200 text-left">广告位</th>
                <th className="p-3 border-r border-gray-200">最高倍数</th>
                <th className="p-3 border-r border-gray-200">原出价</th>
                <th className="p-3 border-r border-gray-200">新出价</th>
                <th className="p-3 border-r border-gray-200">原百分比 %</th>
                <th className="p-3 border-r border-gray-200">新百分比 %</th>
                <th className="p-3 border-r border-gray-200 text-[#5b5bd6]">原CPC</th>
                <th className="p-3 text-[#5b5bd6]">新CPC</th>
              </tr>
            </thead>
            <tbody>
              {STRATEGY_META.map(sm => (
                <Fragment key={sm.strategy}>
                  <tr className={`${sm.band} border-b`}>
                    <td colSpan={8} className={`p-2 pl-3 text-xs font-bold ${sm.text}`}>{sm.label}</td>
                  </tr>
                  {rows.map((row, i) => {
                    if (row.strategy !== sm.strategy) return null
                    const mult = MULTIPLIERS[row.strategy][row.position] ?? 1
                    return (
                      <tr key={i} className="border-b border-gray-100 hover:bg-slate-50">
                        <td className="p-3 border-r border-gray-100 text-gray-700">{row.positionLabel}</td>
                        <td className="p-3 border-r border-gray-100 text-center text-gray-500">{mult}×</td>
                        <td className="p-2 border-r border-gray-100 text-center">
                          <input type="number" min="0" step="0.01" value={row.bidOld} placeholder="0"
                            onChange={e => update(i, 'bidOld', e.target.value)} className={inputCls}/>
                        </td>
                        <td className="p-2 border-r border-gray-100 text-center">
                          <input type="number" min="0" step="0.01" value={row.bidNew} placeholder="0"
                            onChange={e => update(i, 'bidNew', e.target.value)} className={inputCls}/>
                        </td>
                        <td className="p-2 border-r border-gray-100 text-center">
                          <input type="number" step="1" value={row.pctOld} placeholder="0"
                            onChange={e => update(i, 'pctOld', e.target.value)} className={inputCls}/>
                        </td>
                        <td className="p-2 border-r border-gray-100 text-center">
                          <input type="number" step="1" value={row.pctNew} placeholder="0"
                            onChange={e => update(i, 'pctNew', e.target.value)} className={inputCls}/>
                        </td>
                        <td className="p-3 border-r border-gray-100 text-center font-semibold text-gray-600 bg-[#5b5bd6]/5">
                          ${cpc(row.bidOld, row.pctOld, mult)}
                        </td>
                        <td className="p-3 text-center font-semibold text-[#5b5bd6] bg-[#5b5bd6]/5">
                          ${cpc(row.bidNew, row.pctNew, mult)}
                        </td>
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-600">说明</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>实际最高CPC = 出价 × (1 + 百分比/100) × 最高倍数</li>
            <li>百分比直接输入数字（如 28 代表 28%），无需输入 % 号</li>
            <li>最高倍数由竞价策略与广告位决定：固定竞价均为 1×；动态竞价-提高和降低在首页为 2×、商品页/其余位置为 1.5×；仅降低均为 1×</li>
            <li>原/新两栏便于对比调价前后的实际 CPC 变化</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
