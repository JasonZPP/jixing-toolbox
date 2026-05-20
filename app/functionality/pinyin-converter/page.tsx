'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy } from 'lucide-react'

type PinyinMode = 'tone' | 'no-tone' | 'initial'

export default function PinyinPage() {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<PinyinMode>('tone')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const convert = async () => {
    setLoading(true)
    try {
      const { pinyin } = await import('pinyin-pro')
      const options = mode === 'tone' ? { toneType: 'symbol' as const }
        : mode === 'no-tone' ? { toneType: 'none' as const }
        : { pattern: 'initial' as const, toneType: 'none' as const }
      setResult(pinyin(text, options))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolLayout title="汉字转拼音" description="支持带声调、不带声调、首字母三种模式，批量转换">
      <div className="space-y-4 max-w-2xl">
        <div className="flex gap-2">
          {([['tone', '带声调'], ['no-tone', '不带声调'], ['initial', '首字母']] as [PinyinMode, string][]).map(([m, l], idx) => (
            <button key={idx} onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-400'}`}>
              {l}
            </button>
          ))}
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="输入汉字..." rows={6}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
        <button onClick={convert} disabled={!text.trim() || loading}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? '转换中...' : '转换'}
        </button>
        {result && (
          <div className="relative">
            <textarea readOnly value={result} rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-slate-50 resize-none" />
            <button onClick={() => navigator.clipboard.writeText(result)}
              className="absolute top-3 right-3 flex items-center gap-1 text-xs text-indigo-600 bg-white border border-indigo-200 rounded-lg px-3 py-1.5">
              <Copy className="h-3.5 w-3.5" /> 复制
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
