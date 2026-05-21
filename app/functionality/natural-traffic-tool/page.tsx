'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload } from 'lucide-react'

interface TrafficRow { term: string; impressions: number; clicks: number; orders: number }

function parseCsv(text: string): TrafficRow[] {
  const lines = text.trim().split('\n')
  const h = lines[0].split(',').map(s=>s.replace(/"/g,'').trim().toLowerCase())
  const get = (c:string[], n:string) => { const i=h.findIndex(x=>x.includes(n)); return i>=0?c[i]?.replace(/"/g,'').trim()||'':'' }
  return lines.slice(1).map(line => {
    const c = line.split(',')
    return { term: get(c,'search term')||get(c,'搜索词'), impressions: parseInt(get(c,'impression'))||0, clicks: parseInt(get(c,'click'))||0, orders: parseInt(get(c,'order'))||0 }
  }).filter(r=>r.term)
}

export default function NaturalTrafficPage() {
  const [rows, setRows] = useState<TrafficRow[]>([])
  const handleFile = useCallback((f:File) => {
    const r = new FileReader()
    r.onload = e => setRows(parseCsv(e.target?.result as string))
    r.readAsText(f, 'utf-8')
  }, [])

  return (
    <ToolLayout title="自然流量分析工具" description="上传搜索词报告，分析自然流量关键词表现">
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 bg-white"
          onClick={()=>document.getElementById('traffic-file')?.click()}
          onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile(f)}}>
          <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3"/>
          <p className="text-sm text-gray-500">拖拽或点击上传搜索词报告 CSV</p>
          <input id="traffic-file" type="file" accept=".csv" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f)}}/>
        </div>
        {rows.length>0&&(
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-slate-50 text-xs text-gray-500 uppercase">
                <th className="p-3 text-left">搜索词</th><th className="p-3 text-right">展示</th>
                <th className="p-3 text-right">点击</th><th className="p-3 text-right">订单</th>
                <th className="p-3 text-right">CTR</th><th className="p-3 text-right">CVR</th>
              </tr></thead>
              <tbody>
                {rows.sort((a,b)=>b.clicks-a.clicks).slice(0,100).map((r,i)=>(
                  <tr key={i} className="border-b border-gray-50 hover:bg-slate-50">
                    <td className="p-3">{r.term}</td><td className="p-3 text-right">{r.impressions}</td>
                    <td className="p-3 text-right">{r.clicks}</td><td className="p-3 text-right">{r.orders}</td>
                    <td className="p-3 text-right">{r.impressions>0?((r.clicks/r.impressions)*100).toFixed(2)+'%':'—'}</td>
                    <td className="p-3 text-right">{r.clicks>0?((r.orders/r.clicks)*100).toFixed(1)+'%':'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
