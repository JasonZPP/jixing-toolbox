'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy } from 'lucide-react'

const CATEGORIES: { key: string; label: string; words: string[] }[] = [
  { key: 'article', label: '冠词', words: ['a', 'an', 'the'] },
  { key: 'prep', label: '介词', words: ['in', 'on', 'at', 'by', 'for', 'with', 'about', 'to', 'from', 'of', 'into', 'over', 'under', 'between', 'through', 'during', 'before', 'after', 'above', 'below'] },
  { key: 'pronoun', label: '代词', words: ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that', 'these', 'those'] },
  { key: 'aux', label: '助动词', words: ['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must'] },
  { key: 'conj', label: '连词', words: ['and', 'or', 'but', 'nor', 'so', 'yet', 'because', 'although', 'while', 'if', 'unless', 'since', 'though', 'whereas'] },
]

export default function ContentFilterPage() {
  const [text, setText] = useState('')
  const [active, setActive] = useState<Set<string>>(new Set(['article']))
  const [customInput, setCustomInput] = useState('')
  const [customWords, setCustomWords] = useState<string[]>([])
  const [ignoreCase, setIgnoreCase] = useState(true)
  const [removePunct, setRemovePunct] = useState(false)

  const toggle = (key: string) =>
    setActive(p => { const n = new Set(p); if (n.has(key)) n.delete(key); else n.add(key); return n })

  const filterSet = useMemo(() => {
    const s = new Set<string>()
    for (const cat of CATEGORIES) if (active.has(cat.key)) for (const w of cat.words) s.add(w)
    for (const w of customWords) s.add(ignoreCase ? w.toLowerCase() : w)
    return s
  }, [active, customWords, ignoreCase])

  const { result, originalCount, filteredCount } = useMemo(() => {
    let working = removePunct ? text.replace(/[.,!?;:"'()[\]{}]/g, '') : text
    const tokens = working.split(/(\s+)/)
    const kept: string[] = []
    let orig = 0, removed = 0
    for (const tok of tokens) {
      if (/^\s+$/.test(tok) || tok === '') { kept.push(tok); continue }
      orig++
      const cmp = ignoreCase ? tok.toLowerCase() : tok
      if (filterSet.has(cmp)) { removed++; continue }
      kept.push(tok)
    }
    working = kept.join('').replace(/[ \t]{2,}/g, ' ').trim()
    return { result: working, originalCount: orig, filteredCount: orig - removed }
  }, [text, filterSet, ignoreCase, removePunct])

  const removedCount = originalCount - filteredCount
  const removeRate = originalCount > 0 ? (removedCount / originalCount) * 100 : 0

  const addCustom = () => {
    const words = customInput.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean)
    const fresh = words.filter(w => !customWords.includes(w))
    if (fresh.length) setCustomWords(p => [...p, ...fresh])
    setCustomInput('')
  }

  return (
    <ToolLayout title="英文文本过滤工具" description="按词性类别或自定义词库过滤英文文本，统计删除词数与删除率">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">预设词类（勾选要过滤的类别）</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c.key} onClick={() => toggle(c.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${active.has(c.key) ? 'bg-[#5b5bd6] text-white border-[#5b5bd6]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#5b5bd6]/40'}`}>
                  {c.label}（{c.words.length}）
                </button>
              ))}
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">自定义过滤词（逗号或空格分隔）</label>
              <div className="flex gap-2">
                <input value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="输入要过滤的词..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
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
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={ignoreCase} onChange={e => setIgnoreCase(e.target.checked)}/> 忽略大小写
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={removePunct} onChange={e => setRemovePunct(e.target.checked)}/> 删除标点符号
              </label>
            </div>
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="请输入或粘贴英文文本..." rows={9}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40 resize-none"/>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {([['原始词数', originalCount], ['过滤后词数', filteredCount], ['删除词数', removedCount]] as [string, number][]).map(([k, v]) => (
              <div key={k} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                <p className="text-lg font-bold text-[#5b5bd6]">{v}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">删除率：<span className="font-medium text-orange-500">{removeRate.toFixed(1)}%</span></p>
          <div className="relative">
            <textarea readOnly value={result} rows={11} placeholder="过滤后的文本将显示在这里..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-slate-50 resize-none"/>
            {result && (
              <button onClick={() => navigator.clipboard.writeText(result)}
                className="absolute top-3 right-3 flex items-center gap-1 text-xs text-[#5b5bd6] bg-white border border-[#5b5bd6]/30 rounded-lg px-3 py-1.5 hover:bg-[#5b5bd6]/5">
                <Copy className="h-3.5 w-3.5"/> 复制结果
              </button>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
