'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { tools, categoryLabels } from '@/lib/tools'
import type { ToolCategory } from '@/lib/types'

const categories: ToolCategory[] = ['ad', 'ops', 'image', 'other']

export default function Sidebar() {
  const [query, setQuery] = useState('')
  const pathname = usePathname()

  const filtered = query
    ? tools.filter(t => t.name.includes(query) || t.description.includes(query))
    : tools

  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = filtered.filter(t => t.category === cat)
    return acc
  }, {} as Record<ToolCategory, typeof tools>)

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex flex-col">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索工具..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
          />
        </div>
      </div>
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {categories.map(cat => {
          const items = grouped[cat]
          if (!items?.length) return null
          return (
            <div key={cat} className="p-2 space-y-2">
              <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">
                {categoryLabels[cat]}
              </div>
              {items.map(tool => {
                const active = pathname === `/functionality/${tool.slug}`
                return (
                  <Link
                    key={tool.slug}
                    href={`/functionality/${tool.slug}`}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium text-center whitespace-normal break-words">{tool.name}</span>
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
