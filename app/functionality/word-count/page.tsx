'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'

export default function WordCountPage() {
  const [text, setText] = useState('')
  const [minLen, setMinLen] = useState(2)

  const freq = useMemo(() => {
    if (!text.trim()) return []
    const words = text.toLowerCase().match(/[a-z一-龥]+/g) || []
    const map = new Map<string, number>()
    words.forEach(w => { if (w.length >= minLen) map.set(w, (map.get(w) || 0) + 1) })
    const entries: [string, number][] = Array.from(map.entries())
    return entries.sort((a, b) => b[1] - a[1]).slice(0, 100)
  }, [text, minLen])

  return (
    <ToolLayout title="词频统计" description="统计文本中各词出现频率，适用于关键词密度分析">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">最短词长</label>
            <input type="number" min="1" max="10" value={minLen} onChange={e=>setMinLen(+e.target.value)}
              className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          </div>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="粘贴文本..." rows={16}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-slate-50 text-xs text-gray-500 uppercase flex justify-between">
            <span>词语</span><span>频次</span>
          </div>
          <div className="overflow-y-auto max-h-96">
            {freq.length === 0 ? (
              <p className="text-center text-gray-400 text-sm p-8">输入文本后显示词频</p>
            ) : freq.map(([word, count], i) => (
              <div key={word} className="flex justify-between items-center px-4 py-2 border-b border-gray-50 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-6">{i+1}</span>
                  <span className="text-sm font-medium text-gray-700">{word}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{width:`${Math.min(100,(count/freq[0][1])*100)}%`}}/>
                  </div>
                  <span className="text-sm font-bold text-indigo-600 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
