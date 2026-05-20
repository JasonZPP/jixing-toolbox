'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy } from 'lucide-react'

type FilterMode = 'keep-english' | 'remove-english' | 'keep-chinese' | 'remove-chinese' | 'keep-numbers' | 'remove-special'

const MODES: { value: FilterMode; label: string; fn: (t: string) => string }[] = [
  { value: 'keep-english', label: '仅保留英文', fn: t => t.replace(/[^a-zA-Z\s]/g, '') },
  { value: 'remove-english', label: '移除英文', fn: t => t.replace(/[a-zA-Z]/g, '') },
  { value: 'keep-chinese', label: '仅保留中文', fn: t => t.replace(/[^一-龥]/g, '') },
  { value: 'remove-chinese', label: '移除中文', fn: t => t.replace(/[一-龥]/g, '') },
  { value: 'keep-numbers', label: '仅保留数字', fn: t => t.replace(/[^0-9]/g, '') },
  { value: 'remove-special', label: '移除特殊字符', fn: t => t.replace(/[^a-zA-Z0-9一-龥\s]/g, '') },
]

export default function ContentFilterPage() {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<FilterMode>('keep-english')

  const fn = MODES.find(m => m.value === mode)?.fn ?? (t => t)
  const result = fn(text)

  return (
    <ToolLayout title="英文文本过滤工具" description="按规则提取或过滤文本内容，批量清洗文本数据">
      <div className="space-y-4 max-w-2xl">
        <div className="flex gap-2 flex-wrap">
          {MODES.map((m, idx) => (
            <button key={idx} onClick={() => setMode(m.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${mode === m.value ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-400'}`}>
              {m.label}
            </button>
          ))}
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="粘贴需要过滤的文本..." rows={8}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
        {text && (
          <div className="relative">
            <textarea readOnly value={result} rows={8}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-slate-50 resize-none" />
            <button onClick={() => navigator.clipboard.writeText(result)}
              className="absolute top-3 right-3 flex items-center gap-1 text-xs text-indigo-600 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50">
              <Copy className="h-3.5 w-3.5" /> 复制
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
