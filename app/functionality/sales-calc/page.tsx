'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload, X } from 'lucide-react'

function splitLine(line: string, sep: string): string[] {
  return line.split(sep).map(s => s.replace(/"/g, '').trim())
}

function findIdx(headers: string[], ...names: string[]): number {
  for (const name of names) {
    const i = headers.findIndex(h => h === name || h.toLowerCase().includes(name.toLowerCase()))
    if (i >= 0) return i
  }
  return -1
}

function parseSales(text: string): { gross: number; count: number } {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return { gross: 0, count: 0 }
  const sep = lines[0].includes('\t') ? '\t' : ','
  const headers = splitLine(lines[0], sep).map(h => h.toLowerCase())
  const priceIdx = findIdx(headers, 'item-price', 'item price', 'order-amount', 'item_price')
  const qtyIdx = findIdx(headers, 'quantity', 'quantity-purchased', 'quantity_purchased')
  const statusIdx = findIdx(headers, 'order-status', 'order status', 'order_status')
  let gross = 0, count = 0
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cols = splitLine(line, sep)
    const status = statusIdx >= 0 ? (cols[statusIdx] || '').toLowerCase() : ''
    if (status.includes('cancel') || status === 'pending') continue
    const price = priceIdx >= 0 ? parseFloat(cols[priceIdx] || '0') || 0 : 0
    const qty = qtyIdx >= 0 ? parseInt(cols[qtyIdx] || '1') || 1 : 1
    if (price > 0) { gross += price * qty; count++ }
  }
  return { gross, count }
}

function parseRefunds(text: string): number {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return 0
  const sep = lines[0].includes('\t') ? '\t' : ','
  const headers = splitLine(lines[0], sep).map(h => h.toLowerCase())
  const amtIdx = findIdx(headers, 'item-price', 'refund amount', 'order amount', 'charged amount', 'item_price')
  const qtyIdx = findIdx(headers, 'quantity')
  let total = 0
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cols = splitLine(line, sep)
    const amt = amtIdx >= 0 ? parseFloat(cols[amtIdx] || '0') || 0 : 0
    const qty = qtyIdx >= 0 ? parseInt(cols[qtyIdx] || '1') || 1 : 1
    if (amt > 0) total += amt * qty
  }
  return total
}

export default function SalesCalcPage() {
  const [grossUSD, setGrossUSD] = useState(0)
  const [refundUSD, setRefundUSD] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [rate, setRate] = useState(7.25)
  const [salesFile, setSalesFile] = useState('')
  const [refundFile, setRefundFile] = useState('')
  const [log, setLog] = useState<string[]>([])

  const handleSales = useCallback((file: File) => {
    const r = new FileReader()
    r.onload = e => {
      const { gross, count } = parseSales(e.target?.result as string)
      setGrossUSD(gross)
      setOrderCount(count)
      setSalesFile(file.name)
      setLog(p => [`✅ 销售报告：${file.name}，解析 ${count} 条记录，总销售额 $${gross.toFixed(2)}`, ...p].slice(0, 20))
    }
    r.readAsText(file, 'utf-8')
  }, [])

  const handleRefund = useCallback((file: File) => {
    const r = new FileReader()
    r.onload = e => {
      const total = parseRefunds(e.target?.result as string)
      setRefundUSD(total)
      setRefundFile(file.name)
      setLog(p => [`✅ 退款报告：${file.name}，退款总额 $${total.toFixed(2)}`, ...p].slice(0, 20))
    }
    r.readAsText(file, 'utf-8')
  }, [])

  const clearSales = () => { setGrossUSD(0); setOrderCount(0); setSalesFile('') }
  const clearRefund = () => { setRefundUSD(0); setRefundFile('') }

  const netUSD = grossUSD - refundUSD

  return (
    <ToolLayout title="亚马逊销售额计算" description="上传销售报告CSV，汇总净销售额并换算人民币">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Sales CSV upload */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              销售报告 <span className="text-xs text-gray-400 font-normal">（必填）</span>
            </p>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#5b5bd6]/50 bg-white transition-colors min-h-[100px] flex items-center justify-center"
              onClick={() => document.getElementById('sales-csv')?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleSales(f) }}
            >
              {salesFile ? (
                <div className="flex items-center justify-between w-full px-2">
                  <span className="text-sm text-[#5b5bd6] font-medium truncate">{salesFile}</span>
                  <button onClick={ev => { ev.stopPropagation(); clearSales() }} className="text-gray-400 hover:text-red-500 ml-2 shrink-0">
                    <X className="h-4 w-4"/>
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2"/>
                  <p className="text-sm text-gray-500">拖拽或点击上传 CSV / TXT</p>
                  <p className="text-xs text-gray-400 mt-1">后台 → 报告 → 按日期的订单报告</p>
                </div>
              )}
              <input id="sales-csv" type="file" accept=".csv,.txt,.tsv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleSales(f) }}/>
            </div>
          </div>

          {/* Refund CSV upload */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              退款报告 <span className="text-xs text-gray-400 font-normal">（可选）</span>
            </p>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#5b5bd6]/50 bg-white transition-colors min-h-[100px] flex items-center justify-center"
              onClick={() => document.getElementById('refund-csv')?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleRefund(f) }}
            >
              {refundFile ? (
                <div className="flex items-center justify-between w-full px-2">
                  <span className="text-sm text-[#5b5bd6] font-medium truncate">{refundFile}</span>
                  <button onClick={ev => { ev.stopPropagation(); clearRefund() }} className="text-gray-400 hover:text-red-500 ml-2 shrink-0">
                    <X className="h-4 w-4"/>
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2"/>
                  <p className="text-sm text-gray-500">拖拽或点击上传退款报告</p>
                  <p className="text-xs text-gray-400 mt-1">后台 → 报告 → 退款报告</p>
                </div>
              )}
              <input id="refund-csv" type="file" accept=".csv,.txt,.tsv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleRefund(f) }}/>
            </div>
          </div>
        </div>

        {/* Exchange rate */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 flex-wrap">
          <label className="text-sm text-gray-600 shrink-0">汇率 (USD → CNY)</label>
          <input type="number" step="0.01" min="1" value={rate}
            onChange={e => setRate(parseFloat(e.target.value) || 7.25)}
            className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
          <span className="text-xs text-gray-400">1 USD = {rate} CNY</span>
        </div>

        {/* Results */}
        {grossUSD > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {([
                ['销售总额', grossUSD, false, 'text-gray-800'],
                ['退款总额', refundUSD, false, 'text-red-500'],
                ['净销售额', netUSD, true, 'text-[#5b5bd6]'],
              ] as [string, number, boolean, string][]).map(([label, usd, hl, color]) => (
                <div key={label} className={`bg-white rounded-xl border shadow-sm p-5 ${hl ? 'border-[#5b5bd6]/30' : 'border-gray-100'}`}>
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>${usd.toFixed(2)}</p>
                  <p className="text-sm text-gray-400 mt-1">≈ ¥{(usd * rate).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">共解析 {orderCount} 条订单记录</p>
          </>
        )}

        {/* Log */}
        {log.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-4 space-y-1 max-h-36 overflow-y-auto">
            {log.map((l, i) => (
              <p key={i} className="text-xs text-green-400 font-mono">{l}</p>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
