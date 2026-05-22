'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload, Copy, Download } from 'lucide-react'
import { FORBIDDEN_CATEGORIES, FORBIDDEN_WORDS } from '@/lib/data/forbidden-words'

const CUSTOM_KEY = 'jixing_forbidden_custom_words'
const DISABLED_CATS_KEY = 'jixing_forbidden_disabled_cats'

function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

function countHits(text: string, word: string): number {
  if (!text || !word) return 0
  const boundary = /^[\x00-\x7F]+$/.test(word)
  const re = new RegExp(boundary ? `\\b${escapeRe(word)}\\b` : escapeRe(word), 'gi')
  const m = text.match(re)
  return m ? m.length : 0
}

export default function ForbiddenWordsPage() {
  const [text, setText] = useState('')
  const [customInput, setCustomInput] = useState('')
  const [customWords, setCustomWords] = useState<string[]>([])
  const [replacements, setReplacements] = useState<Record<string, string>>({})
  const [disabledCats, setDisabledCats] = useState<string[]>([])
  const [showCatPanel, setShowCatPanel] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_KEY)
      if (saved) setCustomWords(JSON.parse(saved))
      const dc = localStorage.getItem(DISABLED_CATS_KEY)
      if (dc) setDisabledCats(JSON.parse(dc))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(customWords)) } catch { /* ignore */ }
  }, [customWords])

  useEffect(() => {
    try { localStorage.setItem(DISABLED_CATS_KEY, JSON.stringify(disabledCats)) } catch { /* ignore */ }
  }, [disabledCats])

  const toggleCat = (key: string) => {
    setDisabledCats(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const exportTxt = () => {
    const blob = new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'checked-text.txt'
    a.click()
  }

  const enabledPresetWords = useMemo(
    () => FORBIDDEN_CATEGORIES.filter(c => !disabledCats.includes(c.key)).flatMap(c => c.words),
    [disabledCats])

  const allWords = useMemo(() => [...enabledPresetWords, ...customWords], [enabledPresetWords, customWords])

  const wordCategoryMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const cat of FORBIDDEN_CATEGORIES) {
      for (const w of cat.words) map[w.toLowerCase()] = cat.name
    }
    return map
  }, [])

  const hits = useMemo(() => {
    if (!text) return []
    return allWords
      .map(w => ({
        word: w,
        count: countHits(text, w),
        custom: customWords.includes(w),
        category: wordCategoryMap[w.toLowerCase()] ?? (customWords.includes(w) ? '自定义' : ''),
      }))
      .filter(h => h.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [text, allWords, customWords, wordCategoryMap])

  const totalHits = hits.reduce((s, h) => s + h.count, 0)

  const hitsByCategory = useMemo(() => {
    const map: Record<string, typeof hits> = {}
    for (const h of hits) {
      const cat = h.category || '其他'
      if (!map[cat]) map[cat] = []
      map[cat].push(h)
    }
    return map
  }, [hits])

  const highlighted = useMemo(() => {
    if (!text || !hits.length) return text.replace(/</g, '&lt;')
    let result = text.replace(/</g, '&lt;')
    for (const { word } of hits) {
      const boundary = /^[\x00-\x7F]+$/.test(word)
      const re = new RegExp(boundary ? `\\b${escapeRe(word)}\\b` : escapeRe(word), 'gi')
      result = result.replace(re, '<mark class="bg-red-100 text-red-700 rounded px-0.5">$&</mark>')
    }
    return result
  }, [text, hits])

  const addCustom = () => {
    const words = customInput.split(/[\n,，]/).map(s => s.trim()).filter(Boolean)
    const fresh = words.filter(w => !allWords.includes(w))
    if (fresh.length) setCustomWords(p => [...p, ...fresh])
    setCustomInput('')
  }

  const handleFile = useCallback((file: File) => {
    const r = new FileReader()
    r.onload = e => setText(e.target?.result as string)
    r.readAsText(file, 'utf-8')
  }, [])

  const applyReplacements = () => {
    let result = text
    for (const { word } of hits) {
      const rep = replacements[word]
      if (rep === undefined || rep === '') continue
      const boundary = /^[\x00-\x7F]+$/.test(word)
      const re = new RegExp(boundary ? `\\b${escapeRe(word)}\\b` : escapeRe(word), 'gi')
      result = result.replace(re, rep)
    }
    setText(result)
    setReplacements({})
  }

  const hasReplacements = Object.values(replacements).some(v => v.trim())
  const activePresetCount = FORBIDDEN_WORDS.length - FORBIDDEN_CATEGORIES.filter(c => disabledCats.includes(c.key)).flatMap(c => c.words).length

  return (
    <ToolLayout title="亚马逊文案违禁词检测" description="内置违禁词库+自定义词库，整词匹配统计命中次数，支持一键替换">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Text input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">文案文本（{text.length} 字符）</label>
              <button onClick={() => document.getElementById('fw-file')?.click()}
                className="text-xs text-[#5b5bd6] flex items-center gap-1 hover:underline">
                <Upload className="h-3.5 w-3.5"/> 上传文件
              </button>
              <input id="fw-file" type="file" accept=".txt,.csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}/>
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={10} placeholder="粘贴或上传 Listing 文案..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40 resize-none"/>
          </div>

          {/* Category toggles */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                预设词库 · 已启用 <span className="text-[#5b5bd6]">{activePresetCount}</span> / {FORBIDDEN_WORDS.length} 个词
              </label>
              <button onClick={() => setShowCatPanel(v => !v)} className="text-xs text-[#5b5bd6] hover:underline">
                {showCatPanel ? '收起分类' : '管理分类'}
              </button>
            </div>
            {showCatPanel && (
              <div className="grid grid-cols-1 gap-1.5 mt-2">
                {FORBIDDEN_CATEGORIES.map(cat => {
                  const disabled = disabledCats.includes(cat.key)
                  return (
                    <label key={cat.key} className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 cursor-pointer border transition-colors ${disabled ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-[#5b5bd6]/20 bg-[#5b5bd6]/5'}`}>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={!disabled} onChange={() => toggleCat(cat.key)} className="accent-[#5b5bd6]"/>
                        <span className="text-sm text-gray-700">{cat.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{cat.words.length} 词</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Custom words */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <label className="text-sm font-medium text-gray-700 block mb-1">自定义违禁词（逗号或换行分隔）</label>
            <div className="flex gap-2">
              <input value={customInput} onChange={e => setCustomInput(e.target.value)}
                placeholder="输入自定义违禁词..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
              <button onClick={addCustom} className="px-4 py-2 bg-[#5b5bd6] text-white rounded-lg text-sm hover:bg-[#5b5bd6]/90">添加</button>
            </div>
            {customWords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {customWords.map(w => (
                  <span key={w} className="text-xs bg-slate-100 text-gray-600 rounded px-2 py-1 flex items-center gap-1">
                    {w}
                    <button onClick={() => setCustomWords(p => p.filter(x => x !== w))} className="text-gray-400 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {text && hits.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-700">✅ 未检测到违禁词</p>
              <p className="text-xs text-green-600 mt-1">已检测 {allWords.length} 个词（{activePresetCount} 预设 + {customWords.length} 自定义）</p>
            </div>
          )}

          {hits.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-red-700">发现 {hits.length} 个违禁词，共命中 {totalHits} 处</h3>
                {hasReplacements && (
                  <button onClick={applyReplacements} className="text-xs bg-[#5b5bd6] text-white rounded px-3 py-1.5 hover:bg-[#5b5bd6]/90">
                    应用替换
                  </button>
                )}
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Object.entries(hitsByCategory).map(([catName, catHits]) => (
                  <div key={catName}>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">{catName}</p>
                    <div className="space-y-1.5">
                      {catHits.map(h => (
                        <div key={h.word} className="flex items-center gap-2">
                          <span className="text-sm bg-red-100 text-red-700 rounded px-2 py-1 font-medium whitespace-nowrap">
                            {h.word} ×{h.count}
                          </span>
                          <input value={replacements[h.word] || ''} onChange={e => setReplacements(p => ({ ...p, [h.word]: e.target.value }))}
                            placeholder="替换为（选填）"
                            className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/50"/>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {text && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-400">文案预览（红色为违禁词）</p>
                <div className="flex gap-3">
                  <button onClick={() => navigator.clipboard.writeText(text)}
                    className="text-xs text-[#5b5bd6] flex items-center gap-1 hover:underline">
                    <Copy className="h-3.5 w-3.5"/> 复制
                  </button>
                  <button onClick={exportTxt}
                    className="text-xs text-[#5b5bd6] flex items-center gap-1 hover:underline">
                    <Download className="h-3.5 w-3.5"/> 导出TXT
                  </button>
                </div>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlighted }}/>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
