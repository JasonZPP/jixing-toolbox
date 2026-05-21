'use client'
import { useState, useCallback, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload } from 'lucide-react'

interface ReturnRow { asin: string; sku: string; reason: string; qty: number; date: string; center: string }

function splitLine(line: string, sep: string): string[] {
  return line.split(sep).map(s => s.replace(/"/g, '').trim())
}

function parseCsv(text: string): ReturnRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const sep = lines[0].includes('\t') ? '\t' : ','
  const h = splitLine(lines[0], sep).map(s => s.toLowerCase())
  const idx = (...names: string[]) => {
    for (const n of names) { const i = h.findIndex(x => x.includes(n)); if (i >= 0) return i }
    return -1
  }
  const iAsin = idx('asin'), iSku = idx('sku', 'merchant'), iReason = idx('reason'),
    iQty = idx('quantity', 'qty'), iDate = idx('date', 'return-date'), iCenter = idx('fulfillment-center', 'center', 'detailed-disposition')
  return lines.slice(1).flatMap(line => {
    if (!line.trim()) return []
    const c = splitLine(line, sep)
    const asin = iAsin >= 0 ? c[iAsin] || '' : ''
    if (!asin) return []
    return [{
      asin,
      sku: iSku >= 0 ? c[iSku] || '' : '',
      reason: iReason >= 0 ? c[iReason] || '未知原因' : '未知原因',
      qty: iQty >= 0 ? parseInt(c[iQty]) || 1 : 1,
      date: iDate >= 0 ? (c[iDate] || '').slice(0, 10) : '',
      center: iCenter >= 0 ? c[iCenter] || '未知' : '未知',
    }]
  })
}

function tally(rows: ReturnRow[], key: (r: ReturnRow) => string): [string, number][] {
  const m = new Map<string, number>()
  for (const r of rows) m.set(key(r), (m.get(key(r)) || 0) + r.qty)
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1])
}

export default function ReturnsV2Page() {
  const [rows, setRows] = useState<ReturnRow[]>([])
  const [fileName, setFileName] = useState('')

  const handleFile = useCallback((file: File) => {
    const r = new FileReader()
    r.onload = e => { setRows(parseCsv(e.target?.result as string)); setFileName(file.name) }
    r.readAsText(file, 'utf-8')
  }, [])

  const stats = useMemo(() => {
    const total = rows.reduce((s, r) => s + r.qty, 0)
    const byAsin = tally(rows, r => r.asin)
    const byReason = tally(rows, r => r.reason)
    const byCenter = tally(rows, r => r.center)
    const byDate = tally(rows, r => r.date).filter(([d]) => d).sort((a, b) => a[0].localeCompare(b[0]))
    const days = byDate.length || 1
    return { total, byAsin, byReason, byCenter, byDate, days, count: rows.length }
  }, [rows])

  const Bar = ({ value, max }: { value: number; max: number }) => (
    <div className="w-24 bg-gray-100 rounded-full h-1.5">
      <div className="bg-[#5b5bd6] h-1.5 rounded-full" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}/>
    </div>
  )

  return (
    <ToolLayout title="退货报告分析V2" description="上传退货报告CSV，多维度分析退货原因、趋势、产品与配送中心">
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#5b5bd6]/50 bg-white transition-colors"
          onClick={() => document.getElementById('returns-file')?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}>
          <Upload className="h-9 w-9 text-gray-300 mx-auto mb-2"/>
          <p className="text-sm text-gray-500">{fileName || '点击或拖拽上传退货报告 CSV'}</p>
          <input id="returns-file" type="file" accept=".csv,.txt,.tsv" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}/>
        </div>

        {rows.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {([
                ['退货商品总数', stats.total.toLocaleString()],
                ['退货记录数', stats.count.toLocaleString()],
                ['平均每日退货', (stats.total / stats.days).toFixed(1)],
                ['产品种类', stats.byAsin.length.toString()],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{v}</p>
                </div>
              ))}
            </div>

            {stats.byDate.length > 1 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">退货趋势（每日退货数量）</h3>
                <div className="flex items-end gap-1 h-32">
                  {stats.byDate.map(([d, v]) => {
                    const max = Math.max(...stats.byDate.map(x => x[1]))
                    return (
                      <div key={d} className="flex-1 flex flex-col items-center justify-end group" title={`${d}: ${v}`}>
                        <div className="w-full bg-[#5b5bd6]/70 rounded-t hover:bg-[#5b5bd6] transition-colors"
                          style={{ height: `${max > 0 ? (v / max) * 100 : 0}%` }}/>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>{stats.byDate[0][0]}</span>
                  <span>{stats.byDate[stats.byDate.length - 1][0]}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">退货原因分布</h3>
                {stats.byReason.slice(0, 12).map(([reason, qty]) => (
                  <div key={reason} className="flex items-center justify-between py-1.5 border-b border-gray-50 text-sm gap-3">
                    <span className="text-gray-600 truncate flex-1">{reason}</span>
                    <Bar value={qty} max={stats.byReason[0][1]}/>
                    <span className="font-semibold text-[#5b5bd6] w-10 text-right">{qty}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">退货数量排行（Top 12 产品）</h3>
                {stats.byAsin.slice(0, 12).map(([asin, qty]) => (
                  <div key={asin} className="flex items-center justify-between py-1.5 border-b border-gray-50 text-sm gap-3">
                    <span className="text-gray-600 font-mono truncate flex-1">{asin}</span>
                    <Bar value={qty} max={stats.byAsin[0][1]}/>
                    <span className="font-semibold text-orange-500 w-10 text-right">{qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {stats.byCenter.length > 1 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">配送中心退货分布</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {stats.byCenter.slice(0, 12).map(([center, qty]) => (
                    <div key={center} className="flex justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
                      <span className="text-gray-600 truncate">{center}</span>
                      <span className="font-semibold text-gray-800 ml-2">{qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
