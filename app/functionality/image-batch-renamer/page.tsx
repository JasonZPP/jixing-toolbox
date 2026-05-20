'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload, Download } from 'lucide-react'

interface FileEntry { original: File; newName: string }

export default function ImageBatchRenamerPage() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [prefix, setPrefix] = useState('product')
  const [startNum, setStartNum] = useState(1)
  const [padLen, setPadLen] = useState(3)

  const addFiles = useCallback((fl: FileList) => {
    const arr = Array.from(fl).map(f => ({ original: f, newName: f.name }))
    setFiles(p => [...p, ...arr])
  }, [])

  const applyRename = () => {
    setFiles(prev => prev.map((f, i) => {
      const ext = f.original.name.split('.').pop() || 'jpg'
      const num = String(startNum + i).padStart(padLen, '0')
      return { ...f, newName: `${prefix}-${num}.${ext}` }
    }))
  }

  const downloadAll = async () => {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    for (const { original, newName } of files) zip.file(newName, original)
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'renamed.zip'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout title="图片批量重命名工具" description="按规则批量重命名图片文件，打包下载">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div><label className="text-xs text-gray-500 block mb-1">前缀</label>
            <input value={prefix} onChange={e=>setPrefix(e.target.value)}
              className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/></div>
          <div><label className="text-xs text-gray-500 block mb-1">起始编号</label>
            <input type="number" min="0" value={startNum} onChange={e=>setStartNum(+e.target.value)}
              className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/></div>
          <div><label className="text-xs text-gray-500 block mb-1">编号位数</label>
            <input type="number" min="1" max="6" value={padLen} onChange={e=>setPadLen(+e.target.value)}
              className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/></div>
          <button onClick={applyRename} disabled={!files.length}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">应用规则</button>
          {files.length>0&&<button onClick={downloadAll}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
            <Download className="h-4 w-4"/> 下载 ZIP</button>}
        </div>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 bg-white"
          onClick={()=>document.getElementById('rename-file')?.click()}
          onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();addFiles(e.dataTransfer.files)}}>
          <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2"/><p className="text-sm text-gray-500">拖拽或点击添加图片</p>
          <input id="rename-file" type="file" accept="image/*" multiple className="hidden" onChange={e=>{if(e.target.files)addFiles(e.target.files)}}/>
        </div>
        {files.length>0&&(
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-slate-50 text-xs text-gray-500 uppercase">
                <th className="p-3 text-left">原文件名</th><th className="p-3 text-left">新文件名</th>
              </tr></thead>
              <tbody>
                {files.map((f,i)=>(
                  <tr key={i} className="border-b border-gray-50 hover:bg-slate-50">
                    <td className="p-3 text-gray-400">{f.original.name}</td>
                    <td className="p-3 text-indigo-600 font-medium">{f.newName}</td>
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
