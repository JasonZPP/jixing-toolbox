'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { FORBIDDEN_WORDS } from '@/lib/data/forbidden-words'

export default function ForbiddenWordsPage() {
  const [text, setText] = useState('')

  const found = useMemo(() => {
    if (!text) return []
    const lower = text.toLowerCase()
    return FORBIDDEN_WORDS.filter(w => lower.includes(w.toLowerCase()))
  }, [text])

  const highlighted = useMemo(() => {
    if (!text || !found.length) return text
    let result = text
    found.forEach(w => {
      result = result.replace(new RegExp(w, 'gi'), `<mark class="bg-red-100 text-red-700 rounded px-0.5">$&</mark>`)
    })
    return result
  }, [text, found])

  return (
    <ToolLayout title="亚马逊文案违禁词检测" description="内置违禁词库，一键检测Listing合规性，高亮标注风险词">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="粘贴Listing文案..." rows={12}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
        </div>
        <div className="space-y-3">
          {found.length > 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-700 mb-2">发现 {found.length} 个违禁词：</p>
              <div className="flex flex-wrap gap-2">
                {found.map(w => <span key={w} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">{w}</span>)}
              </div>
            </div>
          ) : text ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-700">✅ 未检测到违禁词</p>
            </div>
          ) : null}
          {text && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-2">文案预览（红色为违禁词）</p>
              <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{__html: highlighted}}/>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
