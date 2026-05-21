'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Search, Check } from 'lucide-react'
import { FBA_WAREHOUSES } from '@/lib/data/fba-warehouses'

const REGION_MAP: Record<string, string> = {}
const WEST = ['CA', 'WA', 'OR', 'NV', 'AZ', 'UT', 'CO', 'ID', 'MT', 'NM', 'WY', 'AK', 'HI']
const CENTRAL = ['TX', 'IL', 'IN', 'OH', 'MO', 'OK', 'KS', 'MN', 'WI', 'IA', 'NE', 'ND', 'SD', 'TN', 'KY', 'MI']
WEST.forEach(s => { REGION_MAP[s] = '美西' })
CENTRAL.forEach(s => { REGION_MAP[s] = '美中' })
function regionOf(state: string): string { return REGION_MAP[state] || '美东' }

export default function FbaWarehousesPage() {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('全部')
  const [state, setState] = useState('全部')
  const [copied, setCopied] = useState('')

  const states = useMemo(
    () => Array.from(new Set(FBA_WAREHOUSES.map(w => w.state))).sort(),
    [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return FBA_WAREHOUSES.filter(w =>
      (region === '全部' || regionOf(w.state) === region) &&
      (state === '全部' || w.state === state) &&
      (!q || w.code.toLowerCase().includes(q) || w.address.toLowerCase().includes(q) || w.state.toLowerCase().includes(q))
    )
  }, [query, region, state])

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 1200)
  }
  const reset = () => { setQuery(''); setRegion('全部'); setState('全部') }

  return (
    <ToolLayout title="FBA仓库查询" description="全美FBA仓库地址查询，支持按地区、州筛选，点击单元格一键复制">
      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="输入仓库代码、地址或州名..."
              className="w-72 pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
          </div>
          <select value={region} onChange={e => { setRegion(e.target.value); setState('全部') }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40">
            {['全部', '美东', '美中', '美西'].map(r => <option key={r} value={r}>{r === '全部' ? '全部地区' : r}</option>)}
          </select>
          <select value={state} onChange={e => setState(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40">
            <option value="全部">全部州</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={reset} className="text-sm text-gray-500 hover:text-[#5b5bd6] border border-gray-200 rounded-xl px-3 py-2">
            重置筛选
          </button>
        </div>

        <p className="text-xs text-gray-400">
          共 {filtered.length} / {FBA_WAREHOUSES.length} 个仓库 · 提示：点击表格中的代码或地址即可复制
        </p>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[5rem_1fr_4rem_4rem] bg-slate-50 border-b border-gray-100 px-4 py-2 text-xs text-gray-500 font-semibold uppercase">
            <span>仓库代码</span><span>地址</span><span>地区</span><span>州</span>
          </div>
          <div className="overflow-y-auto max-h-[520px]">
            {filtered.map(w => (
              <div key={w.code} className="grid grid-cols-[5rem_1fr_4rem_4rem] px-4 py-2.5 border-b border-gray-50 hover:bg-slate-50 text-sm items-center">
                <button onClick={() => copy(w.code)} className="font-bold text-[#5b5bd6] text-left hover:underline flex items-center gap-1">
                  {copied === w.code ? <Check className="h-3 w-3 text-green-500"/> : null}{w.code}
                </button>
                <button onClick={() => copy(w.address)} className="text-gray-600 text-left hover:text-[#5b5bd6] hover:underline truncate pr-2">
                  {copied === w.address ? '✓ 已复制' : w.address}
                </button>
                <span className="text-gray-400 text-xs">{regionOf(w.state)}</span>
                <span className="text-gray-500">{w.state}</span>
              </div>
            ))}
            {!filtered.length && <p className="text-center text-gray-400 py-10 text-sm">没有找到匹配的仓库</p>}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
