'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy } from 'lucide-react'

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'this', 'that', 'these', 'those',
  'it', 'its', 'as', 'from', 'into', 'than', 'then', 'so', 'such', 'will', 'can', 'do',
  'does', 'did', 'has', 'have', 'had', 'not', 'no', 'you', 'your', 'we', 'our', 'they',
])

export default function WordCountPage() {
  const [text, setText] = useState('')
  const [minLen, setMinLen] = useState(2)
  const [excludeStop, setExcludeStop] = useState(false)

  const { freq, wordCount, sentenceCount, charCount } = useMemo(() => {
    const words = text.toLowerCase().match(/[a-z一-龥]+/g) || []
    const map = new Map<string, number>()
    for (const w of words) {
      if (w.length < minLen) continue
      if (excludeStop && STOP_WORDS.has(w)) continue
      map.set(w, (map.get(w) || 0) + 1)
    }
    const entries: [string, number][] = Array.from(map.entries())
    entries.sort((a, b) => b[1] - a[1])
    const sentences = text.split(/[.!?。！？\n]+/).filter(s => s.trim()).length
    return { freq: entries, wordCount: words.length, sentenceCount: sentences, charCount: text.length }
  }, [text, minLen, excludeStop])

  const totalCounted = freq.reduce((s, [, c]) => s + c, 0)
  const maxCount = freq.length ? freq[0][1] : 1

  const copyResult = () => {
    const txt = freq.map(([w, c], i) => `${i + 1}\t${w}\t${c}\t${((c / totalCounted) * 100).toFixed(2)}%`).join('\n')
    navigator.clipboard.writeText(txt)
  }
  const download = () => {
    const csv = '排名,单词,出现次数,百分比\n' + freq.map(([w, c], i) => `${i + 1},${w},${c},${((c / totalCounted) * 100).toFixed(2)}%`).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'word-frequency.csv'
    a.click()
  }

  return (
    <ToolLayout title="词频统计" description="统计单词出现次数与占比，可排除语法词汇，结果支持复制与导出">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">最短词长</label>
              <input type="number" min="1" max="12" value={minLen} onChange={e => setMinLen(+e.target.value)}
                className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={excludeStop} onChange={e => setExcludeStop(e.target.checked)}/>
              排除语法词汇（the / and / is …）
            </label>
            {text && <button onClick={() => setText('')} className="text-sm text-gray-400 hover:text-red-500 ml-auto">清空</button>}
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="粘贴待统计的英文文本..." rows={14}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40 resize-none"/>
          <div className="grid grid-cols-3 gap-3">
            {([['当前单词数', wordCount], ['当前句子数', sentenceCount], ['当前字符数', charCount]] as [string, number][]).map(([k, v]) => (
              <div key={k} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                <p className="text-lg font-bold text-[#5b5bd6]">{v.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">词频统计（{freq.length} 个不同单词）</span>
            <div className="flex gap-2">
              <button onClick={copyResult} className="text-xs text-[#5b5bd6] flex items-center gap-1 hover:underline"><Copy className="h-3.5 w-3.5"/>复制</button>
              <button onClick={download} className="text-xs text-[#5b5bd6] hover:underline">下载CSV</button>
            </div>
          </div>
          <div className="grid grid-cols-[2rem_1fr_3rem_3.5rem] px-4 py-2 text-xs text-gray-400 border-b border-gray-50">
            <span>#</span><span>单词</span><span className="text-right">次数</span><span className="text-right">占比</span>
          </div>
          <div className="overflow-y-auto max-h-[26rem]">
            {freq.length === 0 ? (
              <p className="text-center text-gray-400 text-sm p-8">输入文本后显示词频</p>
            ) : freq.map(([word, count], i) => (
              <div key={word} className="grid grid-cols-[2rem_1fr_3rem_3.5rem] items-center px-4 py-1.5 border-b border-gray-50 hover:bg-slate-50 text-sm">
                <span className="text-xs text-gray-400">{i + 1}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-gray-700 truncate">{word}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[6rem]">
                    <div className="bg-[#5b5bd6] h-1.5 rounded-full" style={{ width: `${(count / maxCount) * 100}%` }}/>
                  </div>
                </div>
                <span className="text-right font-bold text-[#5b5bd6]">{count}</span>
                <span className="text-right text-xs text-gray-400">{((count / totalCounted) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
