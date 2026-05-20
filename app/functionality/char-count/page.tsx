'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'

export default function CharCountPage() {
  const [text, setText] = useState('')

  const chars = text.length
  const bytes = new TextEncoder().encode(text).length
  const lines = text ? text.split('\n').length : 0
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chinese = (text.match(/[一-龥]/g) || []).length
  const noSpace = text.replace(/\s/g, '').length

  return (
    <ToolLayout title="字符统计" description="实时统计字节数、字符数、行数、单词数，多语言支持">
      <div className="space-y-4 max-w-2xl">
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="粘贴文本..." rows={10}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            {label:'字符数（含空格）',value:chars},
            {label:'字符数（不含空格）',value:noSpace},
            {label:'字节数（UTF-8）',value:bytes},
            {label:'单词数',value:words},
            {label:'行数',value:lines},
            {label:'中文字符数',value:chinese},
          ].map(s=>(
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">{s.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
