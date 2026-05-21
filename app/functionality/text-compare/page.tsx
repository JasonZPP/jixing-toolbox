'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { diff_match_patch } from 'diff-match-patch'

export default function TextComparePage() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')

  const { diffs, similarity, equalChars, addChars, delChars, lineStats } = useMemo(() => {
    const dmp = new diff_match_patch()
    const d = dmp.diff_main(left, right)
    dmp.diff_cleanupSemantic(d)
    let eq = 0, add = 0, del = 0
    for (const [op, t] of d) {
      if (op === 0) eq += t.length
      else if (op === 1) add += t.length
      else del += t.length
    }
    const total = eq + add + del
    const sim = total > 0 ? (eq / total) * 100 : 100

    const lLines = left ? left.split('\n') : []
    const rLines = right ? right.split('\n') : []
    const rSet = new Map<string, number>()
    for (const l of rLines) rSet.set(l, (rSet.get(l) || 0) + 1)
    const lSet = new Map<string, number>()
    for (const l of lLines) lSet.set(l, (lSet.get(l) || 0) + 1)
    let sameLines = 0
    for (const [l, c] of Array.from(lSet.entries())) sameLines += Math.min(c, rSet.get(l) || 0)

    return {
      diffs: d, similarity: sim, equalChars: eq, addChars: add, delChars: del,
      lineStats: { same: sameLines, removed: lLines.length - sameLines, added: rLines.length - sameLines },
    }
  }, [left, right])

  const renderDiff = (side: 'left' | 'right') =>
    diffs.map((d, i) => {
      const [op, t] = d
      if (op === 0) return <span key={i} className="text-gray-700">{t}</span>
      if (op === -1 && side === 'left') return <span key={i} className="bg-red-100 text-red-700 line-through">{t}</span>
      if (op === 1 && side === 'right') return <span key={i} className="bg-green-100 text-green-700">{t}</span>
      return null
    })

  const hasInput = left || right
  const identical = hasInput && left === right

  return (
    <ToolLayout title="文本比较工具" description="逐字差异高亮 + 行级分析 + 相似度，适合文档版本与合同对比">
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">原始文本</label>
            <textarea value={left} onChange={e => setLeft(e.target.value)} rows={9} placeholder="在此输入原始文本..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40 resize-none"/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">对比文本</label>
            <textarea value={right} onChange={e => setRight(e.target.value)} rows={9} placeholder="在此输入要对比的文本..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40 resize-none"/>
          </div>
        </div>

        {hasInput && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {([
                ['相似度', `${similarity.toFixed(1)}%`, 'text-[#5b5bd6]'],
                ['相同字符', equalChars.toString(), 'text-gray-700'],
                ['新增字符', `+${addChars}`, 'text-green-600'],
                ['删除字符', `-${delChars}`, 'text-red-500'],
                ['相同/增/删 行', `${lineStats.same}/${lineStats.added}/${lineStats.removed}`, 'text-gray-700'],
              ] as [string, string, string][]).map(([k, v, cls]) => (
                <div key={k} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                  <p className={`text-lg font-bold ${cls}`}>{v}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{k}</p>
                </div>
              ))}
            </div>

            {identical ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-sm text-green-700">
                两段文本完全相同，没有发现差异
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <p className="text-xs text-gray-400 mb-2 font-medium">原始文本（红色删除线 = 已删除）</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{renderDiff('left')}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <p className="text-xs text-gray-400 mb-2 font-medium">对比文本（绿色背景 = 新增）</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{renderDiff('right')}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
