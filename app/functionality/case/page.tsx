'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy } from 'lucide-react'

type Mode = 'upper' | 'lower' | 'title' | 'sentence'

function convert(text: string, mode: Mode): string {
  switch (mode) {
    case 'upper': return text.toUpperCase()
    case 'lower': return text.toLowerCase()
    case 'title': return text.replace(/\b\w/g, c => c.toUpperCase())
    case 'sentence': return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }
}

export default function CasePage() {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<Mode>('upper')
  const [copied, setCopied] = useState(false)

  const result = convert(text, mode)

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout title="大小写转换" description="全大写、全小写、首字母大写、句首大写一键转换">
      <div className="space-y-4 max-w-2xl">
        <div className="flex gap-2 flex-wrap">
          {([['upper','全大写'],['lower','全小写'],['title','首字母大写'],['sentence','句首大写']] as [Mode,string][]).map(([m,l])=>(
            <button key={m} onClick={()=>setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode===m?'bg-indigo-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-indigo-400'}`}>
              {l}
            </button>
          ))}
        </div>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="输入英文文本..." rows={6}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
        <div className="relative">
          <textarea readOnly value={result} rows={6}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-slate-50 resize-none"/>
          <button onClick={copy}
            className="absolute top-3 right-3 flex items-center gap-1 text-xs text-indigo-600 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50">
            <Copy className="h-3.5 w-3.5"/>{copied?'已复制!':'复制'}
          </button>
        </div>
      </div>
    </ToolLayout>
  )
}
