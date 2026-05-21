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
  const maxLineLen = text ? Math.max(...text.split('\n').map(l => l.length)) : 0

  const stats: [string, number][] = [
    ['字符数（含空格）', chars],
    ['字符数（不含空格）', noSpace],
    ['字节数（UTF-8）', bytes],
    ['单词数', words],
    ['行数', lines],
    ['中文字符数', chinese],
  ]

  return (
    <ToolLayout title="字符统计" description="实时统计字符数、字节数、行数、单词数，含亚马逊后台字数参考">
      <div className="space-y-4 max-w-2xl">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setText(t => t.replace(/\n/g, ' '))}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:border-[#5b5bd6]/40">清除换行符</button>
          <button onClick={() => setText(t => t.split('\n').map(l => l.trim()).join('\n').trim())}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:border-[#5b5bd6]/40">清除首尾空白</button>
          <button onClick={() => setText('')}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:border-red-300 hover:text-red-500">清空</button>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="粘贴或输入待统计的文本..." rows={9}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40 resize-none"/>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats.map(([label, value]) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-[#5b5bd6]">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 space-y-1">
          <p className="font-medium">温馨提示 · 亚马逊后台常见字数限制</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>标题：建议不超过 200 字符（移动端约 80 字符内显示完整）</li>
            <li>五点描述：每条建议不超过 250 字符</li>
            <li>Search Terms 后台关键词：每行不超过 250 字节</li>
            <li>当前文本最长一行：{maxLineLen} 字符</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
