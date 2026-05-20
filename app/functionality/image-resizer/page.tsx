'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload, Download } from 'lucide-react'

interface ResizeResult { name: string; dataUrl: string; width: number; height: number }

export default function ImageResizerPage() {
  const [files, setFiles] = useState<File[]>([])
  const [targetW, setTargetW] = useState(800)
  const [targetH, setTargetH] = useState(800)
  const [keepRatio, setKeepRatio] = useState(true)
  const [results, setResults] = useState<ResizeResult[]>([])

  const addFiles = useCallback((fl: FileList) => setFiles(p => [...p, ...Array.from(fl)]), [])

  const resize = async () => {
    const out: ResizeResult[] = []
    for (const file of files) {
      const bmp = await createImageBitmap(file)
      let w = targetW, h = targetH
      if (keepRatio) {
        const ratio = bmp.width / bmp.height
        if (targetW / targetH > ratio) w = Math.round(h * ratio)
        else h = Math.round(w / ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h)
      out.push({ name: file.name, dataUrl: canvas.toDataURL('image/jpeg', 0.92), width: w, height: h })
    }
    setResults(out)
  }

  const download = (r: ResizeResult) => {
    const a = document.createElement('a'); a.href = r.dataUrl
    a.download = r.name.replace(/\.[^.]+$/, `_${r.width}x${r.height}.jpg`); a.click()
  }

  return (
    <ToolLayout title="图片尺寸修改工具" description="批量修改图片尺寸，支持等比缩放与自定义尺寸">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">宽度 (px)</label>
            <input type="number" min="1" value={targetW} onChange={e=>setTargetW(+e.target.value)}
              className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">高度 (px)</label>
            <input type="number" min="1" value={targetH} onChange={e=>setTargetH(+e.target.value)}
              className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={keepRatio} onChange={e=>setKeepRatio(e.target.checked)}/> 保持比例
          </label>
          <button onClick={resize} disabled={!files.length}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            开始调整
          </button>
        </div>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 bg-white"
          onClick={()=>document.getElementById('resize-file')?.click()}
          onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();addFiles(e.dataTransfer.files)}}>
          <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2"/>
          <p className="text-sm text-gray-500">拖拽或点击添加图片（{files.length} 个已选）</p>
          <input id="resize-file" type="file" accept="image/*" multiple className="hidden" onChange={e=>{if(e.target.files)addFiles(e.target.files)}}/>
        </div>
        {results.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((r,i)=>(
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <img src={r.dataUrl} alt={r.name} className="w-full h-28 object-cover"/>
                <div className="p-3">
                  <p className="text-xs text-gray-700 truncate">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.width}×{r.height}px</p>
                  <button onClick={()=>download(r)}
                    className="mt-2 w-full text-xs text-indigo-600 border border-indigo-200 rounded px-2 py-1 hover:bg-indigo-50 flex items-center justify-center gap-1">
                    <Download className="h-3 w-3"/> 下载
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
