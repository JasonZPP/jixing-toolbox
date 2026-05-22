'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload, Copy, Download, Search, Plus, Trash2 } from 'lucide-react'
import { FORBIDDEN_CATEGORIES } from '@/lib/data/forbidden-words'

const CUSTOM_KEY = 'jixing_forbidden_custom_words'
const DISABLED_WORDS_KEY = 'jixing_forbidden_disabled_words'

function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

function countHits(text: string, word: string): number {
  if (!text || !word) return 0
  const boundary = /^[\x00-\x7F]+$/.test(word)
  const re = new RegExp(boundary ? `\\b${escapeRe(word)}\\b` : escapeRe(word), 'gi')
  const m = text.match(re)
  return m ? m.length : 0
}

type Tab = 'check' | 'library'

export default function ForbiddenWordsPage() {
  const [tab, setTab] = useState<Tab>('check')
  const [text, setText] = useState('')
  const [customInput, setCustomInput] = useState('')
  const [customWords, setCustomWords] = useState<string[]>([])
  const [disabledWords, setDisabledWords] = useState<string[]>([])
  const [replacements, setReplacements] = useState<Record<string, string>>({})
  const [libSearch, setLibSearch] = useState('')
  const [libCat, setLibCat] = useState('全部')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_KEY)
      if (saved) setCustomWords(JSON.parse(saved))
      const dw = localStorage.getItem(DISABLED_WORDS_KEY)
      if (dw) setDisabledWords(JSON.parse(dw))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(customWords)) } catch { /* ignore */ }
  }, [customWords])

  useEffect(() => {
    try { localStorage.setItem(DISABLED_WORDS_KEY, JSON.stringify(disabledWords)) } catch { /* ignore */ }
  }, [disabledWords])

  const toggleWord = (word: string) => {
    setDisabledWords(prev => prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word])
  }

  const toggleCatAll = (catKey: string, enable: boolean) => {
    const cat = FORBIDDEN_CATEGORIES.find(c => c.key === catKey)
    if (!cat) return
    if (enable) {
      setDisabledWords(prev => prev.filter(w => !cat.words.includes(w)))
    } else {
      setDisabledWords(prev => {
        const combined = [...prev, ...cat.words]
        return combined.filter((w, i) => combined.indexOf(w) === i)
      })
    }
  }

  const exportTxt = () => {
    const blob = new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'checked-text.txt'
    a.click()
  }

  const allPresetWords = useMemo(() => FORBIDDEN_CATEGORIES.flatMap(c => c.words), [])

  const enabledPresetWords = useMemo(
    () => allPresetWords.filter(w => !disabledWords.includes(w)),
    [allPresetWords, disabledWords])

  const allActiveWords = useMemo(() => [...enabledPresetWords, ...customWords], [enabledPresetWords, customWords])

  const wordCategoryMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const cat of FORBIDDEN_CATEGORIES) {
      for (const w of cat.words) map[w.toLowerCase()] = cat.name
    }
    return map
  }, [])

  const hits = useMemo(() => {
    if (!text) return []
    return allActiveWords
      .map(w => ({
        word: w,
        count: countHits(text, w),
        custom: customWords.includes(w),
        category: wordCategoryMap[w.toLowerCase()] ?? (customWords.includes(w) ? '自定义' : ''),
      }))
      .filter(h => h.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [text, allActiveWords, customWords, wordCategoryMap])

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
    const fresh = words.filter(w => !allPresetWords.includes(w) && !customWords.includes(w))
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

  // Library tab filtered words
  const libWords = useMemo(() => {
    const q = libSearch.toLowerCase()
    const rows: Array<{ word: string; category: string; catKey: string; disabled: boolean; custom: boolean }> = []
    for (const cat of FORBIDDEN_CATEGORIES) {
      if (libCat !== '全部' && cat.key !== libCat) continue
      for (const w of cat.words) {
        if (q && !w.toLowerCase().includes(q)) continue
        rows.push({ word: w, category: cat.name, catKey: cat.key, disabled: disabledWords.includes(w), custom: false })
      }
    }
    if (libCat === '全部' || libCat === '__custom__') {
      for (const w of customWords) {
        if (q && !w.toLowerCase().includes(q)) continue
        rows.push({ word: w, category: '自定义', catKey: '__custom__', disabled: false, custom: true })
      }
    }
    return rows
  }, [libSearch, libCat, disabledWords, customWords])

  const totalPreset = allPresetWords.length
  const enabledCount = enabledPresetWords.length

  return (
    <ToolLayout title="亚马逊文案违禁词检测" description="内置违禁词库+自定义词库，整词匹配统计命中次数，支持一键替换">
      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {([['check', '文案检测'], ['library', `词库管理（${totalPreset + customWords.length} 词）`]] as [Tab, string][]).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-[#5b5bd6] text-[#5b5bd6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'check' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
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

            <div className="bg-slate-50 rounded-xl border border-gray-100 p-3 text-xs text-gray-500">
              已启用 <span className="font-semibold text-[#5b5bd6]">{enabledCount}</span> / {totalPreset} 个预设词 + <span className="font-semibold text-[#5b5bd6]">{customWords.length}</span> 个自定义词。
              <button onClick={() => setTab('library')} className="ml-1 text-[#5b5bd6] hover:underline">前往词库管理 →</button>
            </div>
          </div>

          <div className="space-y-3">
            {text && hits.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-700">✅ 未检测到违禁词</p>
                <p className="text-xs text-green-600 mt-1">已检测 {enabledCount + customWords.length} 个词</p>
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
      )}

      {tab === 'library' && (
        <div className="space-y-4">
          {/* Library controls */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/>
              <input value={libSearch} onChange={e => setLibSearch(e.target.value)} placeholder="搜索词库..."
                className="w-52 pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
            </div>
            <select value={libCat} onChange={e => setLibCat(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40">
              <option value="全部">全部分类</option>
              {FORBIDDEN_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.name}（{c.words.length}）</option>)}
              {customWords.length > 0 && <option value="__custom__">自定义词库（{customWords.length}）</option>}
            </select>
            <span className="text-xs text-gray-400">共 {libWords.length} 词</span>
          </div>

          {/* Add custom word */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">添加自定义违禁词（逗号或换行分隔）</label>
            <div className="flex gap-2">
              <input value={customInput} onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustom()}
                placeholder="输入自定义违禁词..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
              <button onClick={addCustom} className="px-4 py-2 bg-[#5b5bd6] text-white rounded-lg text-sm hover:bg-[#5b5bd6]/90 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5"/> 添加
              </button>
            </div>
          </div>

          {/* Category batch toggles */}
          {libCat === '全部' && (
            <div className="flex flex-wrap gap-2">
              {FORBIDDEN_CATEGORIES.map(cat => {
                const words = cat.words
                const allEnabled = words.every(w => !disabledWords.includes(w))
                const allDisabled = words.every(w => disabledWords.includes(w))
                return (
                  <button key={cat.key}
                    onClick={() => toggleCatAll(cat.key, allDisabled || !allEnabled)}
                    className={`text-xs rounded-full px-3 py-1 border transition-colors ${allEnabled ? 'bg-[#5b5bd6] text-white border-[#5b5bd6]' : allDisabled ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-[#5b5bd6]/20 text-[#5b5bd6] border-[#5b5bd6]/30'}`}>
                    {cat.name} {allEnabled ? '✓' : allDisabled ? '✗' : '~'}
                  </button>
                )
              })}
            </div>
          )}

          {/* Word list */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1fr_6rem_4rem_4rem] bg-slate-50 border-b border-gray-100 px-4 py-2 text-xs text-gray-500 font-semibold uppercase">
              <span>词语</span>
              <span>分类</span>
              <span className="text-center">启用</span>
              <span className="text-center">删除</span>
            </div>
            <div className="overflow-y-auto max-h-[500px]">
              {libWords.length === 0 && (
                <p className="text-center text-gray-400 py-10 text-sm">没有找到匹配的词语</p>
              )}
              {libWords.map(item => (
                <div key={item.catKey + '|' + item.word} className="grid grid-cols-[1fr_6rem_4rem_4rem] px-4 py-2 border-b border-gray-50 hover:bg-slate-50 items-center text-sm">
                  <span className={`font-medium ${item.disabled ? 'text-gray-300 line-through' : 'text-gray-700'}`}>{item.word}</span>
                  <span className={`text-xs ${item.custom ? 'text-purple-500' : 'text-gray-400'}`}>{item.category}</span>
                  <div className="flex justify-center">
                    {item.custom ? (
                      <span className="text-xs text-purple-400">自定义</span>
                    ) : (
                      <input type="checkbox"
                        checked={!item.disabled}
                        onChange={() => toggleWord(item.word)}
                        className="accent-[#5b5bd6] w-4 h-4 cursor-pointer"/>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {item.custom && (
                      <button onClick={() => setCustomWords(p => p.filter(w => w !== item.word))}
                        className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5"/>
                      </button>
                    )}
                    {!item.custom && (
                      <button onClick={() => toggleWord(item.word)}
                        title={item.disabled ? '启用' : '禁用'}
                        className={`text-xs ${item.disabled ? 'text-green-400 hover:text-green-600' : 'text-gray-300 hover:text-orange-400'}`}>
                        {item.disabled ? '启' : '禁'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400">
            预设词库已启用 <span className="text-[#5b5bd6] font-medium">{enabledCount}</span> / {totalPreset} 个词 · 自定义 {customWords.length} 个词 · 禁用的词不参与文案检测
          </p>
        </div>
      )}
    </ToolLayout>
  )
}
