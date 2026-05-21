'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload, Download } from 'lucide-react'

interface FileEntry { original: File; newName: string }
type Mode = 'serial' | 'keyword'
type Match = 'order' | 'random'

function ext(name: string) { return name.split('.').pop() || 'jpg' }
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ImageBatchRenamerPage() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [mode, setMode] = useState<Mode>('serial')
  const [prefix, setPrefix] = useState('product')
  const [startNum, setStartNum] = useState(1)
  const [padLen, setPadLen] = useState(3)
  const [keywords, setKeywords] = useState('')
  const [match, setMatch] = useState<Match>('order')

  const addFiles = useCallback((fl: FileList) => {
    const arr = Array.from(fl).filter(f => f.type.startsWith('image/')).map(f => ({ original: f, newName: f.name }))
    setFiles(p => [...p, ...arr])
  }, [])

  const applyRename = () => {
    setFiles(prev => {
      if (mode === 'serial') {
        return prev.map((f, i) => ({ ...f, newName: `${prefix}-${String(startNum + i).padStart(padLen, '0')}.${ext(f.original.name)}` }))
      }
      const kws = keywords.split(/[\n,;，；]/).map(k => k.trim()).filter(Boolean)
      if (!kws.length) return prev
      const pool = match === 'random' ? shuffle(kws) : kws
      return prev.map((f, i) => {
        const kw = pool[i % pool.length]
        const dup = i >= pool.length ? `-${Math.floor(i / pool.length) + 1}` : ''
        return { ...f, newName: `${kw}${dup}.${ext(f.original.name)}` }
      })
    })
  }

  const editName = (i: number, name: string) =>
    setFiles(p => p.map((f, idx) => idx === i ? { ...f, newName: name } : f))

  const downloadAll = async () => {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const used = new Map<string, number>()
    for (const { original, newName } of files) {
      let name = newName
      const n = used.get(name) || 0
      if (n > 0) {
        const dot = name.lastIndexOf('.')
        name = dot >= 0 ? `${name.slice(0, dot)}-${n}${name.slice(dot)}` : `${name}-${n}`
      }
      used.set(newName, n + 1)
      zip.file(name, original)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'renamed-images.zip'
    a.click()
  }

  const ic = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40'

  return (
    <ToolLayout title="图片批量重命名工具" description="按序号或关键词批量重命名图片，预览可手动编辑，打包下载">
      <div className="space-y-4">
        <div className="flex gap-2">
          {([['serial', '序号模式'], ['keyword', '关键词模式']] as [Mode, string][]).map(([m, l]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-[#5b5bd6] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#5b5bd6]/40'}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          {mode === 'serial' ? (
            <div className="flex flex-wrap gap-4 items-end">
              <div><label className="text-xs text-gray-500 block mb-1">文件名前缀</label><input value={prefix} onChange={e => setPrefix(e.target.value)} className={`w-36 ${ic}`}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">起始编号</label><input type="number" min="0" value={startNum} onChange={e => setStartNum(+e.target.value)} className={`w-24 ${ic}`}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">编号位数</label><input type="number" min="1" max="6" value={padLen} onChange={e => setPadLen(+e.target.value)} className={`w-20 ${ic}`}/></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">关键词（每行一个，或用逗号/分号分隔）</label>
                <textarea value={keywords} onChange={e => setKeywords(e.target.value)} rows={3}
                  placeholder="walnut-organizer&#10;desk-storage-box&#10;..."
                  className={`w-full ${ic} resize-none`}/>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-500">匹配方式</span>
                {([['order', '按顺序匹配'], ['random', '随机匹配']] as [Match, string][]).map(([m, l]) => (
                  <button key={m} onClick={() => setMatch(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${match === m ? 'bg-[#5b5bd6] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>
                    {l}
                  </button>
                ))}
                <span className="text-xs text-gray-400">关键词不足时循环使用并自动加序号，扩展名自动保留</span>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-3">
            <button onClick={applyRename} disabled={!files.length}
              className="px-4 py-2 bg-[#5b5bd6] text-white rounded-lg text-sm hover:bg-[#5b5bd6]/90 disabled:opacity-40">生成预览</button>
            {files.length > 0 && (
              <button onClick={downloadAll}
                className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                <Download className="h-4 w-4"/> 下载 ZIP
              </button>
            )}
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#5b5bd6]/50 bg-white"
          onClick={() => document.getElementById('rename-file')?.click()}
          onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }}>
          <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2"/>
          <p className="text-sm text-gray-500">拖拽或点击添加图片（已选 {files.length} 张，本地处理不上传）</p>
          <input id="rename-file" type="file" accept="image/*" multiple className="hidden"
            onChange={e => { if (e.target.files) addFiles(e.target.files) }}/>
        </div>

        {files.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs text-gray-500 uppercase">
                  <th className="p-3 text-left w-12">序号</th>
                  <th className="p-3 text-left">原文件名</th>
                  <th className="p-3 text-left">新文件名（可编辑）</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-slate-50">
                    <td className="p-3 text-gray-400">{i + 1}</td>
                    <td className="p-3 text-gray-400 truncate max-w-[14rem]">{f.original.name}</td>
                    <td className="p-2">
                      <input value={f.newName} onChange={e => editName(i, e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-[#5b5bd6] font-medium focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/50"/>
                    </td>
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
