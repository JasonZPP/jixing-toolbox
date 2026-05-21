'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { toolsByCategory, categoryLabels } from '@/lib/tools'

const CATEGORY_ORDER = ['ad', 'ops', 'image', 'other'] as const

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-14 bg-[#07090f] border-b border-[#5b5bd6]/10 text-white flex items-center px-5 justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5b5bd6] to-[#818cf8] flex items-center justify-center text-white text-sm select-none">
          ⬡
        </div>
        <span className="text-sm font-bold text-white/75">极星</span>
      </Link>

      <nav className="hidden md:flex items-center gap-5">
        {/* 功能分类 dropdown */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            功能分类
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute top-full right-0 mt-2 bg-white shadow-2xl rounded-xl border border-black/8 py-2 z-50 w-56 max-h-[70vh] overflow-y-auto">
              {CATEGORY_ORDER.map(cat => (
                <div key={cat}>
                  <div className="px-4 pt-3 pb-1 text-[11px] font-black text-[#5b5bd6] tracking-[0.2em] uppercase">
                    {categoryLabels[cat]}
                  </div>
                  {toolsByCategory[cat].map(tool => (
                    <Link
                      key={tool.slug}
                      href={`/functionality/${tool.slug}`}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-1.5 text-[13px] text-gray-600 hover:bg-[#5b5bd6]/5 hover:text-[#5b5bd6] transition-colors"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 关于 */}
        <Link href="/about" className="text-xs text-white/40 hover:text-white/70 transition-colors">
          关于
        </Link>
      </nav>
    </header>
  )
}
