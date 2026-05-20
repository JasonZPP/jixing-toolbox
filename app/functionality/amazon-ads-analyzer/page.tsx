'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload } from 'lucide-react'

interface AdRow {
  campaign: string
  impressions: number
  clicks: number
  spend: number
  sales: number
  orders: number
}

function parseAdsCsv(text: string): AdRow[] {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  return lines.slice(1).map(line => {
    const cols = line.split(',')
    const get = (name: string) => {
      const i = headers.findIndex(h => h.includes(name))
      return i >= 0 ? parseFloat(cols[i]?.replace(/"/g, '') || '0') || 0 : 0
    }
    const getStr = (name: string) => {
      const i = headers.findIndex(h => h.includes(name))
      return i >= 0 ? cols[i]?.replace(/"/g, '').trim() || '' : ''
    }
    return {
      campaign: getStr('Campaign Name') || getStr('广告活动名称') || getStr('活动'),
      impressions: get('Impressions') || get('展示量'),
      clicks: get('Clicks') || get('点击量'),
      spend: get('Spend') || get('花费'),
      sales: get('Sales') || get('销售额'),
      orders: get('Orders') || get('订单数'),
    }
  }).filter(r => r.campaign)
}

export default function AdsAnalyzerPage() {
  const [rows, setRows] = useState<AdRow[]>([])
  const [error, setError] = useState('')

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const parsed = parseAdsCsv(e.target?.result as string)
        setRows(parsed)
        setError('')
      } catch {
        setError('CSV解析失败，请确认格式正确')
      }
    }
    reader.readAsText(file, 'utf-8')
  }, [])

  const total = rows.reduce((acc, r) => ({
    impressions: acc.impressions + r.impressions,
    clicks: acc.clicks + r.clicks,
    spend: acc.spend + r.spend,
    sales: acc.sales + r.sales,
    orders: acc.orders + r.orders,
  }), { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 })

  const ctr = total.impressions > 0 ? total.clicks / total.impressions : 0
  const acos = total.sales > 0 ? total.spend / total.sales : 0
  const cpc = total.clicks > 0 ? total.spend / total.clicks : 0
  const cvr = total.clicks > 0 ? total.orders / total.clicks : 0

  return (
    <ToolLayout title="亚马逊广告分析工具" description="上传广告报告CSV，自动计算KPI汇总">
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 transition-colors bg-white mb-6"
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onClick={() => document.getElementById('ads-file')?.click()}
      >
        <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">拖拽或点击上传广告报告 CSV</p>
        <input id="ads-file" type="file" accept=".csv" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {rows.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: '总花费', value: `$${total.spend.toFixed(2)}` },
              { label: '总销售额', value: `$${total.sales.toFixed(2)}` },
              { label: 'ACOS', value: `${(acos*100).toFixed(1)}%`, highlight: acos > 0.3 },
              { label: 'CPC', value: `$${cpc.toFixed(2)}` },
              { label: '点击率 CTR', value: `${(ctr*100).toFixed(2)}%` },
              { label: '转化率 CVR', value: `${(cvr*100).toFixed(1)}%` },
              { label: '总点击', value: total.clicks.toLocaleString() },
              { label: '总订单', value: total.orders.toLocaleString() },
            ].map(kpi => (
              <div key={kpi.label} className={`bg-white rounded-xl border shadow-sm p-4 ${kpi.highlight ? 'border-red-200' : 'border-gray-100'}`}>
                <p className="text-xs text-gray-400">{kpi.label}</p>
                <p className={`text-xl font-bold mt-1 ${kpi.highlight ? 'text-red-500' : 'text-gray-800'}`}>{kpi.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50 text-xs text-gray-500 uppercase">
                  <th className="p-3 text-left">广告活动</th>
                  <th className="p-3 text-right">花费($)</th>
                  <th className="p-3 text-right">销售额($)</th>
                  <th className="p-3 text-right">ACOS</th>
                  <th className="p-3 text-right">点击</th>
                  <th className="p-3 text-right">订单</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const rowAcos = r.sales > 0 ? r.spend / r.sales : 0
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-slate-50">
                      <td className="p-3 text-gray-700 max-w-xs truncate">{r.campaign}</td>
                      <td className="p-3 text-right">${r.spend.toFixed(2)}</td>
                      <td className="p-3 text-right">${r.sales.toFixed(2)}</td>
                      <td className={`p-3 text-right font-medium ${rowAcos > 0.3 ? 'text-red-500' : 'text-green-600'}`}>
                        {(rowAcos*100).toFixed(1)}%
                      </td>
                      <td className="p-3 text-right">{r.clicks}</td>
                      <td className="p-3 text-right">{r.orders}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </ToolLayout>
  )
}
