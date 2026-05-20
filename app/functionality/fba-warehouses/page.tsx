'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { FBA_WAREHOUSES } from '@/lib/data/fba-warehouses'
import { Search } from 'lucide-react'

export default function FbaWarehousesPage() {
  const [query, setQuery] = useState('')

  const filtered = FBA_WAREHOUSES.filter(w =>
    w.code.toLowerCase().includes(query.toLowerCase()) ||
    w.address.toLowerCase().includes(query.toLowerCase()) ||
    w.state.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <ToolLayout title="FBA仓库查询" description="全美FBA仓库地址一览，按州或仓库代码筛选">
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="输入仓库代码或州名..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 bg-slate-50 border-b border-gray-100 px-4 py-2 text-xs text-gray-500 font-semibold uppercase">
            <span>仓库代码</span><span className="col-span-2">地址</span>
          </div>
          <div className="overflow-y-auto max-h-[500px]">
            {filtered.map(w=>(
              <div key={w.code} className="grid grid-cols-3 px-4 py-3 border-b border-gray-50 hover:bg-slate-50 text-sm">
                <span className="font-bold text-indigo-600">{w.code}</span>
                <span className="col-span-2 text-gray-600">{w.address}</span>
              </div>
            ))}
            {!filtered.length && <p className="text-center text-gray-400 py-8 text-sm">未找到匹配仓库</p>}
          </div>
        </div>
        <p className="text-xs text-gray-400">共 {filtered.length}/{FBA_WAREHOUSES.length} 个仓库</p>
      </div>
    </ToolLayout>
  )
}
