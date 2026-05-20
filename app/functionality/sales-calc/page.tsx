'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Plus, Trash2 } from 'lucide-react'

interface SkuRow { name: string; price: number; units: number }

export default function SalesCalcPage() {
  const [rows, setRows] = useState<SkuRow[]>([{ name: 'SKU-001', price: 29.99, units: 50 }])
  const add = () => setRows(p => [...p, { name: `SKU-00${p.length+1}`, price: 0, units: 0 }])
  const remove = (i: number) => setRows(p => p.filter((_, idx) => idx !== i))
  const update = <K extends keyof SkuRow>(i: number, k: K, v: SkuRow[K]) =>
    setRows(p => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r))
  const total = rows.reduce((s, r) => s + r.price * r.units, 0)

  return (
    <ToolLayout title="亚马逊销售额计算" description="多SKU价格×销量批量汇总">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-xs text-gray-500 uppercase">
              <th className="p-3 text-left">SKU / 产品名</th>
              <th className="p-3 text-right">售价 ($)</th>
              <th className="p-3 text-right">销量</th>
              <th className="p-3 text-right">小计 ($)</th>
              <th className="p-3 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="p-2"><input value={r.name} onChange={e => update(i, 'name', e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" /></td>
                <td className="p-2"><input type="number" min="0" step="0.01" value={r.price} onChange={e => update(i, 'price', +e.target.value)}
                  className="w-full text-right border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" /></td>
                <td className="p-2"><input type="number" min="0" step="1" value={r.units} onChange={e => update(i, 'units', +e.target.value)}
                  className="w-full text-right border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" /></td>
                <td className="p-3 text-right font-medium text-gray-700">${(r.price*r.units).toFixed(2)}</td>
                <td className="p-2"><button onClick={() => remove(i)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-indigo-50">
              <td colSpan={3} className="p-3 font-bold text-gray-700">总计</td>
              <td className="p-3 text-right font-bold text-indigo-600 text-base">${total.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <div className="p-4 border-t border-gray-100">
          <button onClick={add} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
            <Plus className="h-4 w-4" /> 添加SKU
          </button>
        </div>
      </div>
    </ToolLayout>
  )
}
