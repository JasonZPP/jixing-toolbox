'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload } from 'lucide-react'

interface ReturnRow { asin: string; reason: string; qty: number }

function parseCsv(text: string): ReturnRow[] {
  const lines = text.trim().split('\n')
  const h = lines[0].split(',').map(s=>s.replace(/"/g,'').trim())
  return lines.slice(1).map(line=>{
    const c = line.split(',')
    const get = (n:string) => { const i=h.findIndex(x=>x.toLowerCase().includes(n)); return i>=0?c[i]?.replace(/"/g,'').trim()||'':'' }
    return { asin: get('asin'), reason: get('reason'), qty: parseInt(get('quantity')||get('qty'))||1 }
  }).filter(r=>r.asin)
}

export default function ReturnsV2Page() {
  const [rows, setRows] = useState<ReturnRow[]>([])
  const handleFile = useCallback((file:File) => {
    const r = new FileReader()
    r.onload = e => setRows(parseCsv(e.target?.result as string))
    r.readAsText(file, 'utf-8')
  }, [])
  const byAsin = rows.reduce((m,r)=>{m.set(r.asin,(m.get(r.asin)||0)+r.qty);return m}, new Map<string,number>())
  const byReason = rows.reduce((m,r)=>{m.set(r.reason,(m.get(r.reason)||0)+r.qty);return m}, new Map<string,number>())

  return (
    <ToolLayout title="退货报告分析V2" description="上传退货报告CSV，按ASIN和退货原因分类统计">
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 bg-white"
          onClick={()=>document.getElementById('returns-file')?.click()}
          onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile(f)}}>
          <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3"/>
          <p className="text-sm text-gray-500">拖拽或点击上传退货报告 CSV</p>
          <input id="returns-file" type="file" accept=".csv" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f)}}/>
        </div>
        {rows.length>0&&(
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 mb-3">按ASIN统计（Top 20）</h3>
              {Array.from(byAsin.entries()).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([asin,qty])=>(
                <div key={asin} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                  <span className="text-gray-700 font-mono">{asin}</span>
                  <span className="font-bold text-indigo-600">{qty}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 mb-3">按退货原因统计</h3>
              {Array.from(byReason.entries()).sort((a,b)=>b[1]-a[1]).map(([reason,qty])=>(
                <div key={reason} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                  <span className="text-gray-600 truncate max-w-xs">{reason||'未知原因'}</span>
                  <span className="font-bold text-orange-500 ml-2">{qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
