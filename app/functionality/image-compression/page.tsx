'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload, Download } from 'lucide-react'

interface ImageFile { name: string; original: File; compressed?: Blob; originalSize: number; compressedSize?: number; preview?: string }

export default function ImageCompressionPage() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg')
  const [processing, setProcessing] = useState(false)

  const addFiles = useCallback((files: FileList) => {
    const newFiles: ImageFile[] = Array.from(files).map(f => ({ name: f.name, original: f, originalSize: f.size }))
    setImages(p => [...p, ...newFiles])
  }, [])

  const compress = async () => {
    setProcessing(true)
    try {
      const imageCompression = (await import('browser-image-compression')).default
      const options = { maxSizeMB: 2, useWebWorker: true, fileType: `image/${format}` as const, initialQuality: quality / 100 }
      const updated = await Promise.all(images.map(async img => {
        try {
          const blob = await imageCompression(img.original, options)
          const preview = URL.createObjectURL(blob)
          return { ...img, compressed: blob, compressedSize: blob.size, preview }
        } catch { return img }
      }))
      setImages(updated)
    } finally {
      setProcessing(false)
    }
  }

  const download = (img: ImageFile) => {
    if (!img.compressed) return
    const url = URL.createObjectURL(img.compressed)
    const a = document.createElement('a')
    const ext = format === 'jpeg' ? 'jpg' : format
    a.href = url; a.download = img.name.replace(/\.[^.]+$/, `.${ext}`); a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAll = async () => {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const ext = format === 'jpeg' ? 'jpg' : format
    images.filter(i => i.compressed).forEach(img => {
      zip.file(img.name.replace(/\.[^.]+$/, `.${ext}`), img.compressed!)
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'compressed.zip'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout title="图片压缩与格式转换" description="无损/有损压缩，支持JPG/PNG/WebP互转，批量处理">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">输出格式</label>
            <select value={format} onChange={e => setFormat(e.target.value as 'jpeg'|'png'|'webp')}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">质量 ({quality}%)</label>
            <input type="range" min="10" max="100" step="5" value={quality} onChange={e => setQuality(+e.target.value)}
              className="w-32"/>
          </div>
          <button onClick={compress} disabled={!images.length || processing}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {processing ? '处理中...' : '开始压缩'}
          </button>
          {images.some(i => i.compressed) && (
            <button onClick={downloadAll}
              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
              <Download className="h-4 w-4"/> 下载全部 ZIP
            </button>
          )}
        </div>
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 bg-white"
          onClick={() => document.getElementById('compress-file')?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
        >
          <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2"/>
          <p className="text-sm text-gray-500">拖拽或点击添加图片（支持批量）</p>
          <input id="compress-file" type="file" accept="image/*" multiple className="hidden"
            onChange={e => { if (e.target.files) addFiles(e.target.files) }}/>
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {img.preview && <img src={img.preview} alt={img.name} className="w-full h-28 object-cover"/>}
                <div className="p-3 space-y-1">
                  <p className="text-xs font-medium text-gray-700 truncate">{img.name}</p>
                  <p className="text-xs text-gray-400">{(img.originalSize/1024).toFixed(0)} KB</p>
                  {img.compressedSize && (
                    <>
                      <p className="text-xs text-green-600 font-medium">{(img.compressedSize/1024).toFixed(0)} KB
                        ({(100-(img.compressedSize/img.originalSize*100)).toFixed(0)}% 减小)
                      </p>
                      <button onClick={() => download(img)}
                        className="w-full text-xs text-indigo-600 border border-indigo-200 rounded px-2 py-1 hover:bg-indigo-50 flex items-center justify-center gap-1">
                        <Download className="h-3 w-3"/> 下载
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
