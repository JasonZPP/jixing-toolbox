'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy } from 'lucide-react'

export default function DuplicateRemoverPage() {
  const [text, setText] = useState('')
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [ignoreEmpty, setIgnoreEmpty] = useState(true)

  const lines = text.split('\n')
  const seen = new Set<string>()
  const unique = lines.filter(line => {
    if (ignoreEmpty && line.trim() === '') return false
    const key = ignoreCase ? line.toLowerCase() : line
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  const removed = lines.length - unique.length
  const result = unique.join('\n')

  return (
    <ToolLayout title="去除重复文本工具" description="按行去重，保留原始顺序，支持忽略空行和大小写">
      <div className="space-y-4 max-w-2xl">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={ignoreCase} onChange={e=>setIgnoreCase(e.target.checked)}/> 忽略大小写
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={ignoreEmpty} onChange={e=>setIgnoreEmpty(e.target.checked)}/> 忽略空行
          </label>
        </div>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="每行一条，粘贴需要去重的文本..." rows={8}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
        {text && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                原始 <span className="font-medium">{lines.length}</span> 行 → 去重后 <span className="font-medium text-indigo-600">{unique.length}</span> 行
                （移除 <span className="text-red-500 font-medium">{removed}</span> 条重复）
              </p>
              <button onClick={()=>navigator.clipboard.writeText(result)}
                className="flex items-center gap-1 text-xs text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50">
                <Copy className="h-3.5 w-3.5"/> 复制结果
              </button>
            </div>
            <textarea readOnly value={result} rows={8}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-slate-50 resize-none"/>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
