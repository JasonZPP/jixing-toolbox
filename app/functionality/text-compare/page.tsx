'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { diff_match_patch } from 'diff-match-patch'

export default function TextComparePage() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')

  const diffs = useMemo(() => {
    const dmp = new diff_match_patch()
    return dmp.diff_main(left, right)
  }, [left, right])

  const renderDiff = (side: 'left' | 'right') =>
    diffs.map((d, i) => {
      const [op, text] = d
      if (op === 0) return <span key={i} className="text-gray-700">{text}</span>
      if (op === -1 && side === 'left') return <span key={i} className="bg-red-100 text-red-700 line-through">{text}</span>
      if (op === 1 && side === 'right') return <span key={i} className="bg-green-100 text-green-700">{text}</span>
      return null
    })

  return (
    <ToolLayout title="文本比较工具" description="逐字差异对比高亮，快速定位两份文本的不同之处">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">原始文本</label>
          <textarea value={left} onChange={e=>setLeft(e.target.value)} rows={10} placeholder="粘贴原始文本..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">修改后文本</label>
          <textarea value={right} onChange={e=>setRight(e.target.value)} rows={10} placeholder="粘贴修改后文本..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
        </div>
        {(left || right) && (
          <>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-2 font-medium">原始（红色=已删除）</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{renderDiff('left')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-2 font-medium">修改后（绿色=新增）</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{renderDiff('right')}</p>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
