'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'

export default function KeywordStrategyPage() {
  const [text, setText] = useState('')
  const [min, setMin] = useState(2)

  const analysis = useMemo(() => {
    if (!text.trim()) return { roots: [], phrases: [] }
    const words = text.toLowerCase().match(/[a-z]+/g) || []
    const freq = new Map<string,number>()
    words.forEach(w => { if (w.length >= min) freq.set(w, (freq.get(w)||0)+1) })
    const roots = Array.from(freq.entries()).filter(([,c])=>c>1).sort((a,b)=>b[1]-a[1]).slice(0,30)
    const lines = text.toLowerCase().split('\n').map(s=>s.trim()).filter(Boolean)
    const phraseFreq = new Map<string,number>()
    lines.forEach(line => {
      const ws = line.match(/[a-z]+/g) || []
      for (let i=0; i<ws.length-1; i++) {
        const phrase = ws[i]+' '+ws[i+1]
        phraseFreq.set(phrase, (phraseFreq.get(phrase)||0)+1)
      }
    })
    const phrases = Array.from(phraseFreq.entries()).filter(([,c])=>c>1).sort((a,b)=>b[1]-a[1]).slice(0,20)
    return { roots, phrases }
  }, [text, min])

  return (
    <ToolLayout title="关键词策略工具" description="词根拆分与频次统计，发现高频词根与短语">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">最短词长</label>
            <input type="number" min="1" max="10" value={min} onChange={e=>setMin(+e.target.value)}
              className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          </div>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={14} placeholder="粘贴关键词列表（每行一个）..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-semibold text-gray-700 mb-3">高频词根</h3>
          {analysis.roots.map(([w,c])=>(
            <div key={w} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
              <span className="text-gray-700">{w}</span><span className="font-bold text-indigo-600">{c}</span>
            </div>
          ))}
          {!analysis.roots.length && <p className="text-sm text-gray-400">暂无数据</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-semibold text-gray-700 mb-3">高频短语</h3>
          {analysis.phrases.map(([p,c])=>(
            <div key={p} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
              <span className="text-gray-700">{p}</span><span className="font-bold text-orange-500">{c}</span>
            </div>
          ))}
          {!analysis.phrases.length && <p className="text-sm text-gray-400">暂无数据</p>}
        </div>
      </div>
    </ToolLayout>
  )
}
