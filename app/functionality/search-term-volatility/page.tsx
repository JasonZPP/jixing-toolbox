'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'

export default function SearchTermVolatilityPage() {
  const [prev, setPrev] = useState('')
  const [curr, setCurr] = useState('')

  const parse = (text: string) => new Map(
    text.split('\n').map(l=>l.trim()).filter(Boolean).map(l => {
      const [t, ...r] = l.split(/\t|,/)
      return [t?.trim()||'', (parseFloat(r[r.length-1])||0)] as [string, number]
    })
  )

  const rows = useMemo(() => {
    if (!prev.trim() || !curr.trim()) return []
    const pm = parse(prev), cm = parse(curr)
    const terms = new Set([...Array.from(pm.keys()), ...Array.from(cm.keys())])
    return Array.from(terms).map(t => {
      const p = pm.get(t)||0, c = cm.get(t)||0, ch = c-p, pct = p>0?(ch/p)*100:100
      return { term: t, prev: p, curr: c, change: ch, pct }
    }).sort((a,b) => Math.abs(b.change)-Math.abs(a.change)).slice(0,50)
  }, [prev, curr])

  return (
    <ToolLayout title="搜索词波动分析" description="对比两期搜索词数据，量化关键词流量增减变化">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">上期数据（词{'\t'}量）</label>
            <textarea value={prev} onChange={e=>setPrev(e.target.value)} rows={8} placeholder="关键词&#9;展示量/点击量..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">本期数据</label>
            <textarea value={curr} onChange={e=>setCurr(e.target.value)} rows={8} placeholder="关键词&#9;展示量/点击量..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-slate-50 text-xs text-gray-500 uppercase">
              <th className="p-3 text-left">搜索词</th><th className="p-3 text-right">上期</th>
              <th className="p-3 text-right">本期</th><th className="p-3 text-right">变化</th>
            </tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.term} className="border-b border-gray-50 hover:bg-slate-50">
                  <td className="p-3">{r.term}</td><td className="p-3 text-right text-gray-400">{r.prev}</td>
                  <td className="p-3 text-right">{r.curr}</td>
                  <td className={`p-3 text-right font-medium ${r.change>0?'text-green-600':'text-red-500'}`}>
                    {r.change>0?'+':''}{r.change} ({r.pct.toFixed(0)}%)
                  </td>
                </tr>
              ))}
              {!rows.length&&<tr><td colSpan={4} className="text-center text-gray-400 py-8">粘贴两期数据后显示波动分析</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  )
}
