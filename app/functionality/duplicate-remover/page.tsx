'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy } from 'lucide-react'

type SepMode = 'line' | 'space' | 'comma' | 'semicolon' | 'custom'
type SortMode = 'none' | 'asc' | 'desc' | 'length'

const SEP_OPTIONS: { mode: SepMode; label: string }[] = [
  { mode: 'line', label: '按行' },
  { mode: 'space', label: '按空格' },
  { mode: 'comma', label: '按逗号' },
  { mode: 'semicolon', label: '按分号' },
  { mode: 'custom', label: '自定义' },
]
const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: 'none', label: '保持原顺序' },
  { mode: 'asc', label: '升序' },
  { mode: 'desc', label: '降序' },
  { mode: 'length', label: '按长度' },
]

export default function DuplicateRemoverPage() {
  const [text, setText] = useState('')
  const [sepMode, setSepMode] = useState<SepMode>('line')
  const [customSep, setCustomSep] = useState(',')
  const [sortMode, setSortMode] = useState<SortMode>('none')
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [trim, setTrim] = useState(true)
  const [removeEmpty, setRemoveEmpty] = useState(true)
  const [removeNumeric, setRemoveNumeric] = useState(false)

  const { items, unique, joiner } = useMemo(() => {
    let splitter: string | RegExp = '\n'
    let join = '\n'
    if (sepMode === 'space') { splitter = /\s+/; join = ' ' }
    else if (sepMode === 'comma') { splitter = ','; join = ', ' }
    else if (sepMode === 'semicolon') { splitter = ';'; join = '; ' }
    else if (sepMode === 'custom') { splitter = customSep || ','; join = customSep || ',' }

    let arr = text.split(splitter)
    if (trim) arr = arr.map(s => s.trim())
    if (removeEmpty) arr = arr.filter(s => s !== '')
    if (removeNumeric) arr = arr.filter(s => !/^\d+$/.test(s.trim()))

    const seen = new Set<string>()
    let uniq = arr.filter(s => {
      const key = ignoreCase ? s.toLowerCase() : s
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    if (sortMode === 'asc') uniq = [...uniq].sort((a, b) => a.localeCompare(b))
    else if (sortMode === 'desc') uniq = [...uniq].sort((a, b) => b.localeCompare(a))
    else if (sortMode === 'length') uniq = [...uniq].sort((a, b) => a.length - b.length)

    return { items: arr, unique: uniq, joiner: join }
  }, [text, sepMode, customSep, sortMode, ignoreCase, trim, removeEmpty, removeNumeric])

  const removed = items.length - unique.length
  const compression = items.length > 0 ? (removed / items.length) * 100 : 0
  const result = unique.join(joiner)

  const download = () => {
    const blob = new Blob(['﻿' + result], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'deduped.txt'
    a.click()
  }

  return (
    <ToolLayout title="去除重复文本工具" description="按行/分隔符去重，支持大小写、空行、纯数字过滤与排序">
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">分隔符</span>
            {SEP_OPTIONS.map(o => (
              <button key={o.mode} onClick={() => setSepMode(o.mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${sepMode === o.mode ? 'bg-[#5b5bd6] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>
                {o.label}
              </button>
            ))}
            {sepMode === 'custom' && (
              <input value={customSep} onChange={e => setCustomSep(e.target.value)} maxLength={5}
                className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/50"/>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">排序</span>
            {SORT_OPTIONS.map(o => (
              <button key={o.mode} onClick={() => setSortMode(o.mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${sortMode === o.mode ? 'bg-[#5b5bd6] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>
                {o.label}
              </button>
            ))}
          </div>
          <div className="flex gap-4 flex-wrap">
            {([['区分大小写', !ignoreCase, (v: boolean) => setIgnoreCase(!v)],
               ['去除首尾空格', trim, setTrim],
               ['移除空行', removeEmpty, setRemoveEmpty],
               ['移除纯数字', removeNumeric, setRemoveNumeric]] as [string, boolean, (v: boolean) => void][]).map(([label, val, set]) => (
              <label key={label} className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={val} onChange={e => set(e.target.checked)}/> {label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="粘贴需要去重的文本..." rows={12}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40 resize-none"/>
          <div>
            <textarea readOnly value={result} rows={12} placeholder="去重结果将显示在这里..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-slate-50 resize-none"/>
          </div>
        </div>

        {text && (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-500">
              原始 <span className="font-medium text-gray-700">{items.length}</span> 条 →
              去重后 <span className="font-medium text-[#5b5bd6]">{unique.length}</span> 条 ·
              移除 <span className="text-red-500 font-medium">{removed}</span> 条 ·
              压缩率 <span className="font-medium text-orange-500">{compression.toFixed(1)}%</span>
            </p>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(result)}
                className="flex items-center gap-1 text-xs text-[#5b5bd6] border border-[#5b5bd6]/30 rounded-lg px-3 py-1.5 hover:bg-[#5b5bd6]/5">
                <Copy className="h-3.5 w-3.5"/> 复制结果
              </button>
              <button onClick={download}
                className="text-xs text-white bg-[#5b5bd6] rounded-lg px-3 py-1.5 hover:bg-[#5b5bd6]/90">下载 TXT</button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
