'use client'
import { useRef, useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Printer, Download } from 'lucide-react'

export default function FbaLabelPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fnsku, setFnsku] = useState('X001XXXXXX')
  const [title, setTitle] = useState('产品名称')
  const [condition, setCondition] = useState('New')

  const draw = () => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    ctx.fillStyle = 'white'; ctx.fillRect(0,0,300,100)
    ctx.strokeStyle = 'black'; ctx.lineWidth = 1; ctx.strokeRect(0,0,300,100)
    ctx.fillStyle = 'black'; ctx.font = 'bold 14px monospace'
    ctx.fillText(fnsku, 10, 25)
    ctx.font = '11px sans-serif'
    const words = title.split(' '); let line = '', y = 45
    for (const w of words) {
      const t = line ? line+' '+w : w
      if (ctx.measureText(t).width > 280) { ctx.fillText(line, 10, y); line = w; y += 16 }
      else line = t
    }
    if (line) ctx.fillText(line, 10, y)
    ctx.font = '10px sans-serif'; ctx.fillText(condition, 10, 88)
  }

  const download = () => { draw(); const a = document.createElement('a'); a.href = canvasRef.current?.toDataURL()||''; a.download = 'fba-label.png'; a.click() }
  const print = () => { draw(); const w = window.open(''); w?.document.write(`<img src="${canvasRef.current?.toDataURL()}" onload="window.print();window.close()"/>`) }

  return (
    <ToolLayout title="FBA标签编辑器" description="在线编辑打印FNSKU标签，自定义内容，直接打印">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          {([['FNSKU',fnsku,setFnsku],['产品名称',title,setTitle],['产品状况',condition,setCondition]] as [string,string,React.Dispatch<React.SetStateAction<string>>][]).map(([label,v,s])=>(
            <div key={label}>
              <label className="text-sm text-gray-600 block mb-1">{label}</label>
              <input value={v} onChange={e=>s(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={draw} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">预览</button>
            <button onClick={download} className="flex items-center gap-1 px-4 py-2.5 bg-slate-100 text-gray-700 rounded-lg text-sm hover:bg-slate-200"><Download className="h-4 w-4"/>下载</button>
            <button onClick={print} className="flex items-center gap-1 px-4 py-2.5 bg-slate-100 text-gray-700 rounded-lg text-sm hover:bg-slate-200"><Printer className="h-4 w-4"/>打印</button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-center">
          <canvas ref={canvasRef} width={300} height={100} className="border border-gray-200 rounded" style={{imageRendering:'pixelated'}}/>
        </div>
      </div>
    </ToolLayout>
  )
}
