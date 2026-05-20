'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Plus, Trash2 } from 'lucide-react'

interface Partner { name: string; investment: number; workRatio: number }

export default function PartnerEquityPage() {
  const [partners, setPartners] = useState<Partner[]>([
    { name: 'Jason', investment: 50000, workRatio: 60 },
    { name: '合伙人', investment: 30000, workRatio: 40 },
  ])
  const [profit, setProfit] = useState(20000)
  const [investWeight, setInvestWeight] = useState(50)

  const workWeight = 100 - investWeight
  const totalInv = partners.reduce((s, p) => s + p.investment, 0)
  const totalWork = partners.reduce((s, p) => s + p.workRatio, 0)

  const shares = partners.map(p => {
    const invShare = totalInv > 0 ? (p.investment / totalInv) * (investWeight / 100) : 0
    const workShare = totalWork > 0 ? (p.workRatio / totalWork) * (workWeight / 100) : 0
    const equity = invShare + workShare
    return { ...p, equity, payout: profit * equity }
  })

  const add = () => setPartners(prev => [...prev, { name: `合伙人${prev.length+1}`, investment: 10000, workRatio: 20 }])
  const remove = (i: number) => setPartners(prev => prev.filter((_, idx) => idx !== i))
  const update = <K extends keyof Partner>(i: number, k: K, v: Partner[K]) =>
    setPartners(prev => prev.map((p, idx) => idx === i ? { ...p, [k]: v } : p))

  return (
    <ToolLayout title="合伙人权益计算器" description="按投资额与工作贡献比例计算利润分配">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 flex-wrap mb-4">
          <div>
            <label className="text-xs text-gray-500">本期利润 (¥)</label>
            <input type="number" min="0" step="100" value={profit} onChange={e => setProfit(+e.target.value)}
              className="block w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500">投资权重 (%，其余为工作权重)</label>
            <input type="number" min="0" max="100" step="5" value={investWeight} onChange={e => setInvestWeight(+e.target.value)}
              className="block w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
        </div>
        <div className="space-y-3">
          {partners.map((p, i) => (
            <div key={i} className="flex items-center gap-3 flex-wrap">
              <input value={p.name} onChange={e => update(i, 'name', e.target.value)}
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-500">投资(¥)</label>
                <input type="number" min="0" step="1000" value={p.investment} onChange={e => update(i, 'investment', +e.target.value)}
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-500">工作比重</label>
                <input type="number" min="0" step="5" value={p.workRatio} onChange={e => update(i, 'workRatio', +e.target.value)}
                  className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="ml-auto text-right">
                <span className="text-sm font-bold text-indigo-600">{(shares[i]?.equity*100).toFixed(1)}%</span>
                <span className="text-sm text-gray-500 ml-2">¥{shares[i]?.payout.toFixed(0)}</span>
              </div>
              <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <button onClick={add} className="mt-3 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
          <Plus className="h-4 w-4" /> 添加合伙人
        </button>
      </div>
    </ToolLayout>
  )
}
