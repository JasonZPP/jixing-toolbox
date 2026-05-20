'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload } from 'lucide-react'

interface ImageInfo { name: string; size: string; type: string; width: number; height: number; dataUrl: string }

export default function ImageInfoViewerPage() {
  const [images, setImages] = useState<ImageInfo[]>([])

  const processFiles = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        const img = new Image()
        img.onload = () => {
          setImages(p => [...p, {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: file.type,
            width: img.width,
            height: img.height,
            dataUrl: e.target?.result as string
          }])
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }, [])

  return (
    <ToolLayout title="批量图片信息查看器" description="读取图片尺寸、大小、格式等信息">
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 bg-white"
          onClick={()=>document.getElementById('img-info-file')?.click()}
          onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();processFiles(e.dataTransfer.files)}}>
          <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3"/>
          <p className="text-sm text-gray-500">拖拽或点击上传图片（支持批量）</p>
          <input id="img-info-file" type="file" accept="image/*" multiple className="hidden"
            onChange={e=>{if(e.target.files) processFiles(e.target.files)}}/>
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <img src={img.dataUrl} alt={img.name} className="w-full h-32 object-cover"/>
                <div className="p-3 space-y-1">
                  <p className="text-xs font-medium text-gray-700 truncate">{img.name}</p>
                  <p className="text-xs text-gray-500">{img.width}×{img.height}px</p>
                  <p className="text-xs text-gray-500">{img.size}</p>
                  <p className="text-xs text-gray-400">{img.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
