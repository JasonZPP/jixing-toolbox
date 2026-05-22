'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Search, Check } from 'lucide-react'
import { FBA_WAREHOUSES } from '@/lib/data/fba-warehouses'

const COUNTRY_NAMES: Record<string, string> = {
  US: '美国', CA: '加拿大', GB: '英国', DE: '德国',
  JP: '日本', FR: '法国', IT: '意大利', ES: '西班牙',
  PL: '波兰', AU: '澳大利亚',
}

export default function FbaWarehousesPage() {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('全部')
  const [usRegion, setUsRegion] = useState('全部')
  const [stateFilter, setStateFilter] = useState('全部')
  const [copied, setCopied] = useState('')

  const countries = useMemo(
    () => ['全部', ...Array.from(new Set(FBA_WAREHOUSES.map(w => w.country))).sort()],
    [])

  const usStates = useMemo(
    () => Array.from(new Set(FBA_WAREHOUSES.filter(w => w.country === 'US').map(w => w.state))).sort(),
    [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return FBA_WAREHOUSES.filter(w => {
      if (country !== '全部' && w.country !== country) return false
      if (w.country === 'US' && usRegion !== '全部' && usRegion !== usRegionOf(w.state)) return false
      if (w.country === 'US' && stateFilter !== '全部' && w.state !== stateFilter) return false
      if (!q) return true
      return (
        w.code.toLowerCase().includes(q) ||
        w.address.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q) ||
        w.state.toLowerCase().includes(q) ||
        w.zip.toLowerCase().includes(q)
      )
    })
  }, [query, country, usRegion, stateFilter])

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 1200)
  }

  const reset = () => { setQuery(''); setCountry('全部'); setUsRegion('全部'); setStateFilter('全部') }

  return (
    <ToolLayout title="FBA仓库查询" description="全球FBA仓库地址查询，支持按国家、地区、州筛选，点击单元格一键复制">
      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="仓库代码、城市、邮编..."
              className="w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
          </div>

          <select value={country} onChange={e => { setCountry(e.target.value); setUsRegion('全部'); setStateFilter('全部') }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40">
            {countries.map(c => (
              <option key={c} value={c}>{c === '全部' ? '全部国家' : `${COUNTRY_NAMES[c] ?? c} (${c})`}</option>
            ))}
          </select>

          {(country === '全部' || country === 'US') && (
            <select value={usRegion} onChange={e => { setUsRegion(e.target.value); setStateFilter('全部') }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40">
              {['全部', '美东', '美中', '美西'].map(r => (
                <option key={r} value={r}>{r === '全部' ? '全部地区' : r}</option>
              ))}
            </select>
          )}

          {(country === '全部' || country === 'US') && (
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40">
              <option value="全部">全部州</option>
              {usStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}

          <button onClick={reset} className="text-sm text-gray-500 hover:text-[#5b5bd6] border border-gray-200 rounded-xl px-3 py-2">
            重置筛选
          </button>
        </div>

        <p className="text-xs text-gray-400">
          共 {filtered.length} / {FBA_WAREHOUSES.length} 个仓库，涵盖 {Object.keys(COUNTRY_NAMES).length} 个国家 · 点击仓库代码或地址即可复制
        </p>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[5rem_2.5rem_minmax(0,1fr)_7rem_4rem_5rem_4rem] bg-slate-50 border-b border-gray-100 px-4 py-2 text-xs text-gray-500 font-semibold uppercase">
            <span>代码</span>
            <span>国家</span>
            <span>地址</span>
            <span>城市</span>
            <span>州/省</span>
            <span>邮编</span>
            <span>地区</span>
          </div>
          <div className="overflow-y-auto max-h-[560px]">
            {filtered.map(w => {
              const regionLabel = w.country === 'US' ? usRegionOf(w.state) : (COUNTRY_NAMES[w.country] ?? w.country)
              return (
                <div key={w.code} className="grid grid-cols-[5rem_2.5rem_minmax(0,1fr)_7rem_4rem_5rem_4rem] px-4 py-2.5 border-b border-gray-50 hover:bg-slate-50 text-sm items-center gap-1">
                  <button onClick={() => copy(w.code)} className="font-bold text-[#5b5bd6] text-left hover:underline flex items-center gap-1">
                    {copied === w.code ? <Check className="h-3 w-3 text-green-500 flex-shrink-0"/> : null}{w.code}
                  </button>
                  <span className="text-xs text-gray-400 font-medium">{w.country}</span>
                  <button onClick={() => copy(w.address)} className="text-gray-600 text-left hover:text-[#5b5bd6] hover:underline truncate pr-1 text-xs">
                    {copied === w.address ? '✓ 已复制' : w.address}
                  </button>
                  <span className="text-gray-500 text-xs truncate">{w.city}</span>
                  <span className="text-gray-500 text-xs">{w.state}</span>
                  <button onClick={() => copy(w.zip)} className="text-gray-500 text-xs hover:text-[#5b5bd6] text-left">
                    {copied === w.zip ? '✓' : w.zip}
                  </button>
                  <span className="text-gray-400 text-xs">{regionLabel}</span>
                </div>
              )
            })}
            {!filtered.length && <p className="text-center text-gray-400 py-10 text-sm">没有找到匹配的仓库</p>}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}

function usRegionOf(state: string): string {
  const WEST_STATES = ['CA','WA','OR','NV','AZ','UT','CO','ID','MT','NM','WY','AK','HI']
  const CENTRAL_STATES = ['TX','IL','IN','OH','MO','OK','KS','MN','WI','IA','NE','ND','SD','TN','KY','MI','GA','MS']
  if (WEST_STATES.includes(state)) return '美西'
  if (CENTRAL_STATES.includes(state)) return '美中'
  return '美东'
}
