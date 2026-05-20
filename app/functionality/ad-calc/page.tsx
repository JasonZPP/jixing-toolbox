'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { calcMaxCpc, MULTIPLIERS } from '@/lib/calc/ad-calc'

type Strategy = 'fixed' | 'updown' | 'downonly'
type Position = 'top' | 'product' | 'rest'

interface Row {
  strategy: Strategy
  position: string
  label: string
  bid: number
  percentage: number
}

const INITIAL_ROWS: Row[] = [
  { strategy: 'fixed',    position: 'top',     label: '页首（固定竞价）',     bid: 1.0, percentage: 0 },
  { strategy: 'fixed',    position: 'product',  label: '商品页（固定竞价）',   bid: 1.0, percentage: 0 },
  { strategy: 'fixed',    position: 'rest',     label: '其他位置（固定竞价）', bid: 1.0, percentage: 0 },
  { strategy: 'updown',   position: 'top',      label: '页首（动态升降）',     bid: 1.0, percentage: 0 },
  { strategy: 'updown',   position: 'product',  label: '商品页（动态升降）',   bid: 1.0, percentage: 0 },
  { strategy: 'updown',   position: 'rest',     label: '其他位置（动态升降）', bid: 1.0, percentage: 0 },
  { strategy: 'downonly', position: 'top',      label: '页首（仅降低）',       bid: 1.0, percentage: 0 },
  { strategy: 'downonly', position: 'product',  label: '商品页（仅降低）',     bid: 1.0, percentage: 0 },
  { strategy: 'downonly', position: 'rest',     label: '其他位置（仅降低）',   bid: 1.0, percentage: 0 },
]

export default function AdCalcPage() {
  const [rows, setRows] = useState(INITIAL_ROWS)

  const update = (i: number, field: 'bid' | 'percentage', val: string) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: parseFloat(val) || 0 } : r))
  }

  return (
    <ToolLayout title="广告竞价计算" description="公式：最高CPC = 出价 × (1 + 调整比例/100) × 竞价倍数">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50 text-gray-500 text-xs uppercase">
              <th className="p-3 text-left">广告位</th>
              <th className="p-3 text-right">出价 ($)</th>
              <th className="p-3 text-right">调整比例 (%)</th>
              <th className="p-3 text-right">竞价倍数</th>
              <th className="p-3 text-right font-bold text-indigo-600">最高CPC ($)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const multiplier = MULTIPLIERS[row.strategy][row.position as Position] ?? 1
              const maxCpc = calcMaxCpc({ bid: row.bid, percentage: row.percentage, multiplier })
              return (
                <tr key={i} className="border-b border-gray-50 hover:bg-slate-50">
                  <td className="p-3 text-gray-700">{row.label}</td>
                  <td className="p-3">
                    <input type="number" min="0" step="0.01" value={row.bid}
                      onChange={e => update(i, 'bid', e.target.value)}
                      className="w-24 text-right border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                  </td>
                  <td className="p-3">
                    <input type="number" min="0" step="1" value={row.percentage}
                      onChange={e => update(i, 'percentage', e.target.value)}
                      className="w-24 text-right border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                  </td>
                  <td className="p-3 text-right text-gray-500">{multiplier}x</td>
                  <td className="p-3 text-right font-bold text-indigo-600">${maxCpc.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-gray-400">
        调整比例直接输入数字（如输入 28 表示 28%）。竞价倍数由竞价策略和广告位决定。
      </p>
    </ToolLayout>
  )
}
