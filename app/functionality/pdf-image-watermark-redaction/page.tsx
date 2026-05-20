'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload, Download } from 'lucide-react'

type Mode = 'watermark' | 'redact'

export default function WatermarkPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imgData, setImgData] = useState<HTMLImageElement | null>(null)
  const [mode, setMode] = useState<Mode>('watermark')
  const [watermarkText, setWatermarkText] = useState('极星共合')
  const [opacity, setOpacity] = useState(30)
  const [redactRects, setRedactRects] = useState<{x:number;y:number;w:number;h:number}[]>([])
  const [drawing, setDrawing] = useState(false)
  const [start, setStart] = useState({x:0,y:0})

  const loadImage = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image(); img.onload = () => setImgData(img); img.src = e.target?.result as string
    }; reader.readAsDataURL(file)
  }, [])

  const draw = useCallback(() => {
    if (!canvasRef.current || !imgData) return
    const c = canvasRef.current, ctx = c.getContext('2d')!
    c.width = imgData.width; c.height = imgData.height
    ctx.drawImage(imgData, 0, 0)
    if (mode === 'watermark') {
      ctx.globalAlpha = opacity / 100
      ctx.font = `bold ${Math.max(24, imgData.width / 15)}px sans-serif`
      ctx.fillStyle = '#5b5bd6'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      for (let y = 0; y < imgData.height; y += 120)
        for (let x = 0; x < imgData.width; x += 200) {
          ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI/6); ctx.fillText(watermarkText, 0, 0); ctx.restore()
        }
      ctx.globalAlpha = 1
    }
    if (mode === 'redact') {
      redactRects.forEach(r => {
        const iData = ctx.getImageData(r.x, r.y, Math.max(1,r.w), Math.max(1,r.h))
        const d = iData.data
        for (let i = 0; i < d.length; i += 4 * 10) {
          const avg = (d[i]+d[i+1]+d[i+2])/3
          for (let j = 0; j < 40 && i+j+2 < d.length; j += 4) { d[i+j]=avg;d[i+j+1]=avg;d[i+j+2]=avg }
        }
        ctx.putImageData(iData, r.x, r.y)
      })
    }
  }, [imgData, mode, watermarkText, opacity, redactRects])

  useEffect(() => { draw() }, [draw])

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const scaleX = imgData!.width / rect.width, scaleY = imgData!.height / rect.height
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const download = () => {
    const a = document.createElement('a'); a.href = canvasRef.current?.toDataURL('image/jpeg', 0.95) || ''
    a.download = 'processed.jpg'; a.click()
  }

  return (
    <ToolLayout title="PDF / 图片 水印与打码工具" description="添加文字水印或对敏感区域马赛克打码">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            {([['watermark','添加水印'],['redact','马赛克打码']] as [Mode,string][]).map(([m,l])=>(
              <button key={m} onClick={()=>setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode===m?'bg-indigo-600 text-white':'bg-slate-100 text-gray-600'}`}>{l}</button>
            ))}
          </div>
          {mode==='watermark'&&(
            <div className="space-y-3">
              <div><label className="text-xs text-gray-500 block mb-1">水印文字</label>
                <input value={watermarkText} onChange={e=>setWatermarkText(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/></div>
              <div><label className="text-xs text-gray-500 block mb-1">透明度 ({opacity}%)</label>
                <input type="range" min="5" max="100" value={opacity} onChange={e=>setOpacity(+e.target.value)} className="w-full"/></div>
            </div>
          )}
          {mode==='redact'&&<p className="text-xs text-gray-500 bg-slate-50 rounded-lg p-3">在右侧图片上拖拽选择需要打码的区域</p>}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400"
            onClick={()=>document.getElementById('wm-file')?.click()}>
            <Upload className="h-6 w-6 text-gray-300 mx-auto mb-1"/><p className="text-xs text-gray-500">上传图片</p>
            <input id="wm-file" type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)loadImage(f)}}/>
          </div>
          {imgData&&<button onClick={download} className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
            <Download className="h-4 w-4"/> 下载处理后图片
          </button>}
        </div>
        <div className="lg:col-span-2">
          {imgData ? (
            <canvas ref={canvasRef} className="w-full border border-gray-200 rounded-xl cursor-crosshair"
              onMouseDown={e=>{if(mode==='redact'){setDrawing(true);setStart(getPos(e))}}}
              onMouseMove={e=>{if(drawing&&mode==='redact'){const p=getPos(e);draw();const c=canvasRef.current!;const ctx=c.getContext('2d')!;ctx.strokeStyle='red';ctx.lineWidth=2;ctx.strokeRect(start.x,start.y,p.x-start.x,p.y-start.y)}}}
              onMouseUp={e=>{if(mode==='redact'){const p=getPos(e);setRedactRects(prev=>[...prev,{x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)}]);setDrawing(false)}}}/>
          ) : (
            <div className="bg-slate-100 rounded-xl h-64 flex items-center justify-center text-gray-400 text-sm">上传图片后在此预览</div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
