'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload, Download, X } from 'lucide-react'

export default function ImageToPdfPage() {
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([])
  const [converting, setConverting] = useState(false)

  const addFiles = useCallback((fl: FileList) => {
    Array.from(fl).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => setFiles(p => [...p, { file, preview: e.target?.result as string }])
      reader.readAsDataURL(file)
    })
  }, [])

  const remove = (i: number) => setFiles(p => p.filter((_, idx) => idx !== i))

  const convert = async () => {
    setConverting(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      for (let i = 0; i < files.length; i++) {
        const { preview } = files[i]
        const img = new Image(); img.src = preview
        await new Promise(r => { img.onload = r })
        const ratio = img.width / img.height
        const pageW = 190, pageH = pageW / ratio
        if (i > 0) doc.addPage()
        doc.addImage(preview, 'JPEG', 10, 10, pageW, Math.min(pageH, 277))
      }
      doc.save('images.pdf')
    } finally {
      setConverting(false)
    }
  }

  return (
    <ToolLayout title="批量图片转PDF" description="多张图片合并为单个PDF，支持排序与页面设置">
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 bg-white"
          onClick={() => document.getElementById('pdf-file')?.click()}
          onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }}>
          <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2"/>
          <p className="text-sm text-gray-500">拖拽或点击添加图片（将按顺序合并为PDF）</p>
          <input id="pdf-file" type="file" accept="image/*" multiple className="hidden"
            onChange={e => { if (e.target.files) addFiles(e.target.files) }}/>
        </div>
        {files.length > 0 && (
          <>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {files.map((f, i) => (
                <div key={i} className="relative group">
                  <img src={f.preview} alt="" className="w-full h-20 object-cover rounded-lg border border-gray-200"/>
                  <span className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1 rounded">{i+1}</span>
                  <button onClick={() => remove(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100">
                    <X className="h-3 w-3"/>
                  </button>
                </div>
              ))}
            </div>
            <button onClick={convert} disabled={converting}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              <Download className="h-4 w-4"/>
              {converting ? '生成中...' : `生成PDF（${files.length}页）`}
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
