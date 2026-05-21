# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the homepage to a split-mood layout — dark magazine cover panel on the left, light tool-browsing area on the right — with real-time search and category filtering.

**Architecture:** The homepage (`app/page.tsx`) becomes a Client Component owning all search/filter state via `useState` + `useMemo`. A pure utility function `lib/filterTools.ts` handles the filter logic and is unit-tested independently. The Navbar is restyled to dark and the global AnnouncementBar is removed from the layout.

**Tech Stack:** Next.js 14 App Router, React (useState/useMemo), Tailwind CSS v3, lucide-react icons, Jest (already configured)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `app/layout.tsx` | Modify | Remove AnnouncementBar; change body bg |
| `components/Navbar.tsx` | Modify | Dark theme; brand simplified to icon + "极星" |
| `lib/filterTools.ts` | Create | Pure filter function (testable) |
| `lib/__tests__/filterTools.test.ts` | Create | Unit tests for filter logic |
| `app/page.tsx` | Rewrite | Full homepage: left cover + right tool area |

---

## Task 1: Remove AnnouncementBar and update layout background

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Read the current layout**

```bash
cat app/layout.tsx
```

Expected output shows `<AnnouncementBar />` and `bg-slate-50` on body.

- [ ] **Step 2: Remove AnnouncementBar from layout and update body background**

Replace the entire `app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: '极星工具箱',
  description: '本站不需要注册，所有工具免费使用。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#f8f8fc] flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify the dev server still starts without errors**

```bash
npm run dev
```

Open http://localhost:3000 — no red errors in console. The purple announcement bar should be gone.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: remove announcement bar, update body bg for new homepage"
```

---

## Task 2: Redesign Navbar to dark theme

**Files:**
- Modify: `components/Navbar.tsx`

- [ ] **Step 1: Replace Navbar.tsx entirely**

The current Navbar is `bg-[#5b5bd6]` purple with brand text "极星工具箱". Replace with dark theme and shortened brand. Write this exact content to `components/Navbar.tsx`:

```tsx
import Link from 'next/link'

const navLinks = [
  { href: '/about', label: '关于' },
  { href: '/blog', label: '博客' },
  { href: '/suggest', label: '提需求' },
  { href: '/reward', label: '打赏支持' },
]

export default function Navbar() {
  return (
    <header className="h-14 bg-[#07090f] border-b border-[#5b5bd6]/10 text-white flex items-center px-5 justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5b5bd6] to-[#818cf8] flex items-center justify-center text-white text-sm select-none">
          ⬡
        </div>
        <span className="text-sm font-bold text-white/75">极星</span>
      </Link>
      <nav className="hidden md:flex items-center gap-5">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: Check the dev server**

```bash
npm run dev
```

Navigate to http://localhost:3000 — Navbar should be dark/black, showing "⬡ 极星" on the left and nav links on the right. Navigate to any tool page (e.g. http://localhost:3000/functionality/ad-calc) — Navbar should look consistent.

- [ ] **Step 3: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat: redesign navbar to dark theme, simplify brand to 极星"
```

---

## Task 3: filterTools utility and unit tests

**Files:**
- Create: `lib/filterTools.ts`
- Create: `lib/__tests__/filterTools.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `lib/__tests__/filterTools.test.ts`:

```ts
import { filterTools } from '../filterTools'
import type { Tool } from '../types'

const mockTools: Tool[] = [
  { slug: 'ad-calc', name: '广告竞价计算', description: 'CPC出价策略模拟', category: 'ad', icon: 'Calculator', color: 'blue' },
  { slug: 'delivery', name: '美国站配送费计算', description: 'FBA配送费精准计算', category: 'ops', icon: 'Truck', color: 'orange' },
  { slug: 'image-comp', name: '图片压缩与格式转换', description: '无损压缩JPG PNG WebP', category: 'image', icon: 'ImageDown', color: 'blue' },
]

describe('filterTools', () => {
  it('returns all tools when query is empty and category is all', () => {
    expect(filterTools(mockTools, '', 'all')).toHaveLength(3)
  })

  it('filters by category', () => {
    const result = filterTools(mockTools, '', 'ad')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('ad-calc')
  })

  it('filters by query matching name', () => {
    const result = filterTools(mockTools, 'FBA', 'all')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('delivery')
  })

  it('filters by query matching description', () => {
    const result = filterTools(mockTools, 'CPC', 'all')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('ad-calc')
  })

  it('combines category and query filters', () => {
    expect(filterTools(mockTools, 'JPG', 'ad')).toHaveLength(0)
    expect(filterTools(mockTools, 'JPG', 'image')).toHaveLength(1)
  })

  it('is case-insensitive', () => {
    expect(filterTools(mockTools, 'fba', 'all')).toHaveLength(1)
  })

  it('trims whitespace from query', () => {
    expect(filterTools(mockTools, '  FBA  ', 'all')).toHaveLength(1)
  })

  it('returns empty array when no tool matches', () => {
    expect(filterTools(mockTools, 'xyznotexist', 'all')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run the tests — confirm they fail**

```bash
npx jest lib/__tests__/filterTools.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '../filterTools'`

- [ ] **Step 3: Create the implementation**

Create `lib/filterTools.ts`:

```ts
import type { Tool } from './types'

export function filterTools(tools: Tool[], query: string, category: string): Tool[] {
  const q = query.trim().toLowerCase()
  return tools.filter(tool => {
    const matchesCategory = category === 'all' || tool.category === category
    const matchesQuery =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q)
    return matchesCategory && matchesQuery
  })
}
```

- [ ] **Step 4: Run the tests — confirm they all pass**

```bash
npx jest lib/__tests__/filterTools.test.ts --no-coverage
```

Expected: PASS — 8 tests, 0 failures. If any fail, fix `lib/filterTools.ts` until all 8 pass.

- [ ] **Step 5: Commit**

```bash
git add lib/filterTools.ts lib/__tests__/filterTools.test.ts
git commit -m "feat: add filterTools utility with unit tests"
```

---

## Task 4: Rewrite homepage with split layout

**Files:**
- Rewrite: `app/page.tsx`

Context: The layout (`app/layout.tsx`) renders `<Navbar />` then `{children}`. The body is `flex flex-col min-h-screen`. So `page.tsx` just needs to return `<div className="flex flex-col md:flex-row flex-1">` — the `flex-1` makes it fill the remaining height below the Navbar.

The icon rendering pattern (from `components/ToolCard.tsx`):
```tsx
const Icon = (Icons as unknown as Record<string, React.FC<{ className?: string }>>)[tool.icon] ?? Icons.Wrench
```

- [ ] **Step 1: Write the new homepage**

Replace the entire `app/page.tsx` with:

```tsx
'use client'

import { useState, useMemo } from 'react'
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

const CATEGORY_ORDER = ['ad', 'ops', 'image', 'other'] as const

function ToolIcon({ name }: { name: string }) {
  const Icon =
    (Icons as unknown as Record<string, React.FC<{ className?: string }>>)[name] ??
    Icons.Wrench
  return <Icon className="h-3.5 w-3.5" />
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

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
            { n: '38', l: '专业工具' },
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
          <div className="flex items-center gap-2 bg-white border border-black/[0.08] rounded-xl px-4 py-2.5 mb-3">
            <Icons.Search className="w-4 h-4 text-black/25 flex-shrink-0" />
            <input
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

        {/* Tool Sections */}
        <div className="flex-1 px-5 py-4 flex flex-col gap-6">
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
                      className="group bg-white border border-black/[0.06] rounded-xl p-3 hover:border-[#5b5bd6]/40 hover:shadow-sm transition-all relative overflow-hidden"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2.5 ${
                          tool.color === 'blue'
                            ? 'bg-[#5b5bd6]/10 text-[#5b5bd6]'
                            : 'bg-orange-400/15 text-orange-500'
                        }`}
                      >
                        <ToolIcon name={tool.icon} />
                      </div>
                      <p className="text-[11px] font-bold text-gray-800 leading-snug mb-1">
                        {tool.name}
                      </p>
                      <p className="text-[9.5px] text-gray-400 leading-relaxed line-clamp-2">
                        {tool.description}
                      </p>
                      <span className="absolute bottom-2.5 right-3 text-[#5b5bd6]/40 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
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
```

- [ ] **Step 2: Run type-check to catch any issues**

```bash
npx tsc --noEmit
```

Expected: no errors. If errors appear, fix them before proceeding.

- [ ] **Step 3: Start dev server and verify the homepage**

```bash
npm run dev
```

Check each of these in http://localhost:3000:
1. Left panel is visible (dark, shows "极星工具箱" big title, stats, badge)
2. Right panel is light (`#f8f8fc` background), shows search + tabs + tools
3. Type "FBA" in the search box — tool list filters in real time
4. Click "广告" tab — only ad tools show
5. Combine: type "CPC" while "广告" tab is active — shows only CPC tool
6. Clear search — all tools return
7. Click a tool card — navigates to the tool page
8. On the tool page, the Navbar is dark and consistent

- [ ] **Step 4: Verify mobile layout (resize browser to < 768px)**

Left panel should disappear (`hidden md:flex`). Right panel should be full width. Tools show in 1 column.

- [ ] **Step 5: Run a production build to confirm no build errors**

```bash
npm run build
```

Expected: ✓ Compiled successfully, no TypeScript or ESLint errors.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx lib/filterTools.ts
git commit -m "feat: redesign homepage with split layout, real-time search, and category filter"
```

---

## Self-Review

**Spec coverage:**
- [x] Navbar dark + simplified brand → Task 2
- [x] Remove announcement bar → Task 1
- [x] Left panel: Vol label, big title, subtitle, divider, desc, stats, badge → Task 4
- [x] Right panel: search bar with real-time filter → Task 4
- [x] Category tabs with counts → Task 4
- [x] Tool cards: icon, name, desc, hover arrow, link → Task 4
- [x] Empty state when no results → Task 4
- [x] Footer inside right panel → Task 4
- [x] Mobile: left panel hidden → Task 4 (`hidden md:flex`)
- [x] filterTools pure function tested → Task 3

**Placeholder scan:** None found.

**Type consistency:** `filterTools(tools: Tool[], query: string, category: string): Tool[]` used consistently in both `lib/filterTools.ts` and `app/page.tsx`.
