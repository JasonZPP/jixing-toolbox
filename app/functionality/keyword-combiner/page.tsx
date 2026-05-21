'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy } from 'lucide-react'

const SEPARATORS: { label: string; value: string }[] = [
  { label: '空格', value: ' ' },
  { label: '横杠', value: '-' },
  { label: '下划线', value: '_' },
  { label: '加号', value: '+' },
  { label: '逗号', value: ',' },
  { label: '紧凑（无）', value: '' },
]

export default function KeywordCombinerPage() {
  const [groups, setGroups] = useState(['walnut wood', 'remote control\nphone\ntablet', 'organizer\nholder\nstand'])
  const [sep, setSep] = useState(' ')
  const [prefix, setPrefix] = useState('')
  const [suffix, setSuffix] = useState('')

  const combos = useMemo(() => {
    const arrays = groups.map(g => g.split('\n').map(w => w.trim()).filter(Boolean))
    const active = arrays.filter(a => a.length)
    if (!active.length) return []
    let result: string[] = ['']
    for (const arr of active) {
      const next: string[] = []
      for (const p of result) for (const w of arr) next.push(p ? p + sep + w : w)
      result = next
    }
    return result.map(c => `${prefix}${prefix ? sep : ''}${c}${suffix ? sep + suffix : ''}`)
  }, [groups, sep, prefix, suffix])

  const update = (i: number, v: string) => setGroups(p => p.map((g, idx) => idx === i ? v : g))
  const addGroup = () => setGroups(p => [...p, ''])
  const remove = (i: number) => setGroups(p => p.filter((_, idx) => idx !== i))
  const reset = () => { setGroups(['', '', '']); setPrefix(''); setSuffix(''); setSep(' ') }

  return (
    <ToolLayout title="关键词组合工具" description="多组词根笛卡尔积生成长尾词，支持自定义分隔符与批量前后缀">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1.5">连接符号</label>
              <div className="flex gap-1.5 flex-wrap">
                {SEPARATORS.map(s => (
                  <button key={s.label} onClick={() => setSep(s.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${sep === s.value ? 'bg-[#5b5bd6] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">批量前缀</label>
                <input value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="选填"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">批量后缀</label>
                <input value={suffix} onChange={e => setSuffix(e.target.value)} placeholder="选填"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
              </div>
            </div>
          </div>
          {groups.map((g, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-gray-600">关键词组 {i + 1}（每行一个词）</label>
                {groups.length > 1 && <button onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">移除</button>}
              </div>
              <textarea value={g} onChange={e => update(i, e.target.value)} rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40 resize-none"/>
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={addGroup} className="text-sm text-[#5b5bd6] hover:underline">+ 添加关键词组</button>
            <button onClick={reset} className="text-sm text-gray-400 hover:text-red-500">重置</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-gray-700">生成结果（{combos.length} 个组合）</p>
            <button onClick={() => navigator.clipboard.writeText(combos.join('\n'))}
              className="flex items-center gap-1 text-xs text-[#5b5bd6] border border-[#5b5bd6]/30 rounded px-2 py-1 hover:bg-[#5b5bd6]/5">
              <Copy className="h-3.5 w-3.5"/> 一键复制
            </button>
          </div>
          <div className="overflow-y-auto max-h-[28rem] space-y-1">
            {combos.map((c, i) => (
              <div key={i} className="text-sm text-gray-700 py-1 border-b border-gray-50">{c}</div>
            ))}
            {!combos.length && <p className="text-sm text-gray-400 text-center py-8">填写关键词组后显示组合</p>}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
