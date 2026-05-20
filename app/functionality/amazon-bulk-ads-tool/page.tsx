'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload, Download } from 'lucide-react'

interface AdCampaign {
  name: string
  bid: number
  budget: number
  newBid: number
  newBudget: number
}

function parseCampaignCsv(text: string): AdCampaign[] {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  return lines.slice(1).map(line => {
    const cols = line.split(',')
    const get = (name: string) => {
      const i = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()))
      return i >= 0 ? parseFloat(cols[i]?.replace(/"/g, '') || '0') || 0 : 0
    }
    const getStr = (name: string) => {
      const i = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()))
      return i >= 0 ? cols[i]?.replace(/"/g, '').trim() || '' : ''
    }
    const bid = get('bid') || get('出价')
    const budget = get('budget') || get('预算')
    return { name: getStr('name') || getStr('活动'), bid, budget, newBid: bid, newBudget: budget }
  }).filter(r => r.name)
}

export default function BulkAdsPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([])
  const [bidAdj, setBidAdj] = useState(0)
  const [budgetAdj, setBudgetAdj] = useState(0)

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = e => setCampaigns(parseCampaignCsv(e.target?.result as string))
    reader.readAsText(file, 'utf-8')
  }, [])

  const applyAdjustments = () => {
    setCampaigns(prev => prev.map(c => ({
      ...c,
      newBid: Math.max(0.02, c.bid * (1 + bidAdj / 100)),
      newBudget: Math.max(1, c.budget * (1 + budgetAdj / 100)),
    })))
  }

  const exportCsv = () => {
    const header = 'Campaign Name,New Bid,New Budget\n'
    const rows = campaigns.map(c => `"${c.name}",${c.newBid.toFixed(2)},${c.newBudget.toFixed(2)}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'bulk-ads-export.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout title="亚马逊广告批量处理工具" description="上传广告活动CSV，批量调整出价与预算，导出结果">
      <div className="space-y-6">
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 bg-white"
          onClick={() => document.getElementById('bulk-file')?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        >
          <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">拖拽或点击上传广告活动 CSV</p>
          <input id="bulk-file" type="file" accept=".csv" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>

        {campaigns.length > 0 && (
          <>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-xs text-gray-500 block mb-1">出价调整幅度 (%)</label>
                <input type="number" value={bidAdj} onChange={e => setBidAdj(parseFloat(e.target.value)||0)}
                  className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">预算调整幅度 (%)</label>
                <input type="number" value={budgetAdj} onChange={e => setBudgetAdj(parseFloat(e.target.value)||0)}
                  className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <button onClick={applyAdjustments}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                应用调整
              </button>
              <button onClick={exportCsv}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2">
                <Download className="h-4 w-4" /> 导出 CSV
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs text-gray-500 uppercase">
                    <th className="p-3 text-left">广告活动</th>
                    <th className="p-3 text-right">原出价</th>
                    <th className="p-3 text-right">新出价</th>
                    <th className="p-3 text-right">原预算</th>
                    <th className="p-3 text-right">新预算</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-slate-50">
                      <td className="p-3 max-w-xs truncate">{c.name}</td>
                      <td className="p-3 text-right text-gray-400">${c.bid.toFixed(2)}</td>
                      <td className="p-3 text-right font-medium text-indigo-600">${c.newBid.toFixed(2)}</td>
                      <td className="p-3 text-right text-gray-400">${c.budget.toFixed(2)}</td>
                      <td className="p-3 text-right font-medium text-indigo-600">${c.newBudget.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
