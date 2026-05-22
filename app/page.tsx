'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { tools, toolsByCategory, categoryLabels } from '@/lib/tools'
import { filterTools } from '@/lib/filterTools'

const CATEGORIES = [
  { key: 'all', label: '全部', count: tools.length },
  { key: 'ad', label: '广告', count: toolsByCategory.ad.length },
  { key: 'ops', label: '运营', count: toolsByCategory.ops.length },
  { key: 'image', label: '图片文本', count: toolsByCategory.image.length },
  { key: 'other', label: '其他', count: toolsByCategory.other.length },
] as const

type CategoryKey = (typeof CATEGORIES)[number]['key']

const CATEGORY_ORDER = ['ad', 'ops', 'image', 'other'] as const

function daysUntil(target: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.max(0, Math.round((target.getTime() - now.getTime()) / 86400000))
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function blackFriday(year: number): Date {
  // 4th Thursday of November + 1 day
  const nov1 = new Date(year, 10, 1)
  const thu = (4 - nov1.getDay() + 7) % 7  // days until first Thursday
  return new Date(year, 10, 1 + thu + 21 + 1)
}

// Chinese New Year dates (hardcoded for next few years)
const CNY: Record<number, [number, number]> = {
  2026: [1, 17],  // Feb 17, 2026
  2027: [2, 5],   // Feb 5, 2027 (approx)
  2028: [1, 26],  // Jan 26, 2028
}

function nextCNY(): Date {
  const now = new Date()
  const year = now.getFullYear()
  const [m, d] = CNY[year] ?? [1, 28]
  const candidate = new Date(year, m - 1, d)
  if (candidate > now) return candidate
  const [nm, nd] = CNY[year + 1] ?? [1, 28]
  return new Date(year + 1, nm - 1, nd)
}

function nextDate(month: number, day: number): Date {
  const now = new Date()
  const candidate = new Date(now.getFullYear(), month - 1, day)
  if (candidate > now) return candidate
  return new Date(now.getFullYear() + 1, month - 1, day)
}

function CountdownBar() {
  const now = new Date()
  const year = now.getFullYear()
  const week = getWeekNumber(now)
  const yearEnd = new Date(year + 1, 0, 1)
  const bf = blackFriday(year) > now ? blackFriday(year) : blackFriday(year + 1)
  const cm = new Date(bf); cm.setDate(cm.getDate() + 3) // Monday after BF

  const items = [
    { label: `${year}年第`, value: String(week), suffix: '周', color: 'text-[#5b5bd6]' },
    { label: '距2027年还有', value: String(daysUntil(yearEnd)), suffix: '天', color: 'text-orange-500' },
    { label: '距黑五还有', value: String(daysUntil(bf)), suffix: '天', color: 'text-red-500' },
    { label: '距网络星期一还有', value: String(daysUntil(cm)), suffix: '天', color: 'text-red-500' },
    { label: '距圣诞节还有', value: String(daysUntil(nextDate(12, 25))), suffix: '天', color: 'text-red-500' },
    { label: '距春节还有', value: String(daysUntil(nextCNY())), suffix: '天', color: 'text-red-500' },
    { label: '距情人节还有', value: String(daysUntil(nextDate(2, 14))), suffix: '天', color: 'text-red-500' },
  ]

  return (
    <div className="bg-white border-b border-black/[0.05] px-5 py-1.5 flex items-center gap-4 flex-wrap text-[11px] text-gray-400 overflow-x-auto">
      {items.map((item, i) => (
        <span key={i} className="whitespace-nowrap flex items-center gap-0.5 flex-shrink-0">
          {item.label}
          <span className={`font-bold mx-0.5 ${item.color}`}>{item.value}</span>
          {item.suffix}
          {i < items.length - 1 && <span className="ml-3 text-gray-200">|</span>}
        </span>
      ))}
    </div>
  )
}

function ToolIcon({ name }: { name: string }) {
  const Icon =
    (Icons as unknown as Record<string, React.FC<{ className?: string }>>)[name] ??
    Icons.Wrench
  return <Icon className="h-3.5 w-3.5" />
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const filtered = useMemo(
    () => filterTools(tools, query, activeCategory),
    [query, activeCategory]
  )

  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.map(cat => ({
        key: cat,
        label: categoryLabels[cat],
        tools: filtered.filter(t => t.category === cat),
      })).filter(g => g.tools.length > 0),
    [filtered]
  )

  return (
    <div className="flex flex-col md:flex-row flex-1">

      {/* LEFT: Magazine Cover Panel — hidden on mobile */}
      <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col sticky top-14 h-[calc(100vh-56px)] bg-gradient-to-b from-[#0d0f24] to-[#07090f] border-r border-[#5b5bd6]/10 p-7 relative overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#5b5bd6]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full bg-purple-900/20 blur-2xl pointer-events-none" />

        {/* Edition label */}
        <div className="flex items-center gap-2 mb-5 relative z-10">
          <div className="w-4 h-px bg-[#5b5bd6]" />
          <span className="text-[9px] tracking-[0.25em] uppercase text-[#5b5bd6] font-bold">
            Vol.01 · 2026
          </span>
        </div>

        {/* Big magazine title */}
        <div className="relative z-10 mb-1">
          <h1 className="text-[42px] font-black leading-[0.9] tracking-[-0.05em] text-white">
            极星
            <span className="block bg-gradient-to-br from-[#818cf8] to-[#5b5bd6] bg-clip-text text-transparent">
              工具
            </span>
            箱
          </h1>
        </div>
        <p className="text-[10px] tracking-[0.08em] text-white/25 uppercase mb-5 relative z-10">
          Jixing Toolbox
        </p>

        {/* Divider */}
        <div className="w-7 h-0.5 bg-gradient-to-r from-[#5b5bd6] to-[#5b5bd6]/20 rounded-full mb-4 relative z-10" />

        {/* Description */}
        <p className="text-[10.5px] text-white/[0.28] leading-[1.75] flex-1 relative z-10">
          亚马逊跨境电商卖家的效率中枢，覆盖广告竞价、FBA运营、图文处理全链路。
        </p>

        {/* Stats */}
        <div className="flex flex-col gap-3 mt-6 relative z-10">
          {[
            { n: String(tools.length), l: '专业工具' },
            { n: '4', l: '核心模块' },
            { n: '0', l: '登录要求' },
          ].map(({ n, l }) => (
            <div key={l} className="flex items-baseline gap-2">
              <span className="text-2xl font-black bg-gradient-to-br from-white to-[#818cf8] bg-clip-text text-transparent leading-none">
                {n}
              </span>
              <span className="text-[9px] text-white/[0.22] uppercase tracking-widest">{l}</span>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div className="mt-5 self-start flex items-center gap-1.5 bg-[#5b5bd6]/10 border border-[#5b5bd6]/[0.22] rounded-full px-3 py-1 relative z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5b5bd6] shadow-[0_0_6px_#5b5bd6]" />
          <span className="text-[8.5px] text-[#8080ff] font-semibold tracking-wide">
            免费 · 本地运行
          </span>
        </div>
      </aside>

      {/* RIGHT: Tools Area */}
      <div className="flex-1 flex flex-col bg-[#f8f8fc] min-h-[calc(100vh-56px)]">

        {/* Search + Category Tabs */}
        <div className="px-5 pt-4 pb-3 border-b border-black/[0.04]">
          <h1 className="md:hidden text-sm font-black text-gray-800 mb-3">极星工具箱</h1>
          <div className="flex items-center gap-2 bg-white border border-black/[0.08] rounded-xl px-4 py-2.5 mb-3">
            <Icons.Search className="w-4 h-4 text-black/25 flex-shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索工具，例如「FBA」「CPC」..."
              className="flex-1 text-sm text-black/70 bg-transparent outline-none placeholder:text-black/30"
            />
            <kbd className="hidden sm:inline text-[10px] text-black/25 bg-black/5 border border-black/[0.08] rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${
                  activeCategory === cat.key
                    ? 'bg-[#5b5bd6]/10 border-[#5b5bd6]/30 text-[#5b5bd6]'
                    : 'border-black/[0.08] text-black/30 hover:text-black/50 hover:border-black/15'
                }`}
              >
                {cat.label} {cat.count}
              </button>
            ))}
          </div>
        </div>

        {/* Countdown bar */}
        <CountdownBar />

        {/* Tool Sections */}
        <div className="flex-1 px-5 py-4 flex flex-col gap-6">

          {/* Quick resource links */}
          <div className="flex gap-2 flex-wrap">
            {[
              { href: '/marketing-calendar', icon: '📅', label: '2026年电商营销日历' },
              { href: '/marketing-calendar-summary', icon: '📊', label: '2026年亚马逊全球营销日历' },
              { href: '/china-industry-belts', icon: '🏭', label: '中国产业带' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#5b5bd6]/20 rounded-lg text-xs font-medium text-[#5b5bd6] hover:bg-[#5b5bd6]/5 hover:border-[#5b5bd6]/40 transition-all whitespace-nowrap"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-black/25">
              <Icons.SearchX className="w-8 h-8 mb-3 opacity-40" />
              <p className="text-sm">未找到匹配的工具</p>
              <p className="text-xs mt-1">试试其他关键词或切换分类</p>
            </div>
          ) : (
            grouped.map(group => (
              <section key={group.key}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[9.5px] font-bold text-[#5b5bd6] tracking-[0.18em] uppercase whitespace-nowrap">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#5b5bd6]/20 to-transparent" />
                  <span className="text-[9px] text-black/20">{group.tools.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {group.tools.map(tool => (
                    <Link
                      key={tool.slug}
                      href={`/functionality/${tool.slug}`}
                      className="group bg-white border border-black/[0.06] rounded-xl p-4 hover:border-[#5b5bd6]/40 hover:shadow-sm transition-all relative overflow-hidden"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                          tool.color === 'blue'
                            ? 'bg-[#5b5bd6]/10 text-[#5b5bd6]'
                            : 'bg-orange-400/15 text-orange-500'
                        }`}
                      >
                        <ToolIcon name={tool.icon} />
                      </div>
                      <p className="text-sm font-bold text-gray-800 leading-snug mb-1">
                        {tool.name}
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                        {tool.description}
                      </p>
                      <span className="absolute bottom-3 right-3 text-[#5b5bd6]/40 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-black/[0.04] px-5 py-3 flex justify-between items-center">
          <span className="text-xs text-black/25">© 2026 极星共合 · 所有工具免费，无需注册</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-black/25 hover:text-black/40 underline">
              隐私说明
            </Link>
            <Link href="/suggest" className="text-xs text-black/25 hover:text-black/40 underline">
              提需求
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
