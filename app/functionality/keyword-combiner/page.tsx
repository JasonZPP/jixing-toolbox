'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy } from 'lucide-react'

export default function KeywordCombinerPage() {
  const [groups, setGroups] = useState(['walnut wood', 'remote control\nphone\ntablet'])
  const [sep, setSep] = useState(' ')

  const combos = useMemo(() => {
    const arrays = groups.map(g => g.split('\n').map(w=>w.trim()).filter(Boolean))
    if (!arrays.length || arrays.some(a=>!a.length)) return []
    const result: string[] = ['']
    for (const arr of arrays) {
      const next: string[] = []
      for (const prefix of result) for (const word of arr)
        next.push(prefix ? prefix + sep + word : word)
      result.splice(0, result.length, ...next)
    }
    return result
  }, [groups, sep])

  const addGroup = () => setGroups(p=>[...p,''])
  const remove = (i:number) => setGroups(p=>p.filter((_,idx)=>idx!==i))
  const update = (i:number, v:string) => setGroups(p=>p.map((g,idx)=>idx===i?v:g))

  return (
    <ToolLayout title="关键词组合工具" description="多组词根笛卡尔积生成所有关键词组合">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">分隔符</label>
            <input value={sep} onChange={e=>setSep(e.target.value)} maxLength={5}
              className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          </div>
          {groups.map((g,i)=>(
            <div key={i}>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-gray-600">词组 {i+1}（每行一个词）</label>
                <button onClick={()=>remove(i)} className="text-xs text-red-400 hover:text-red-600">移除</button>
              </div>
              <textarea value={g} onChange={e=>update(i,e.target.value)} rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
            </div>
          ))}
          <button onClick={addGroup} className="text-sm text-indigo-600 hover:text-indigo-800">+ 添加词组</button>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-gray-700">组合结果（{combos.length} 条）</p>
            <button onClick={()=>navigator.clipboard.writeText(combos.join('\n'))}
              className="flex items-center gap-1 text-xs text-indigo-600 border border-indigo-200 rounded px-2 py-1">
              <Copy className="h-3.5 w-3.5"/> 复制全部
            </button>
          </div>
          <div className="overflow-y-auto max-h-80 space-y-1">
            {combos.map((c,i)=>(
              <div key={i} className="text-sm text-gray-700 py-1 border-b border-gray-50">{c}</div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
