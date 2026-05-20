'use client'
import { useRef } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Copy } from 'lucide-react'

export default function EditorPage() {
  const ref = useRef<HTMLDivElement>(null)
  const exec = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); ref.current?.focus() }

  return (
    <ToolLayout title="可视化编辑器" description="富文本在线编辑，支持格式化、颜色、对齐">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-3xl">
        <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-slate-50 flex-wrap">
          {[
            [<Bold key="b" className="h-4 w-4" />, () => exec('bold')],
            [<Italic key="i" className="h-4 w-4" />, () => exec('italic')],
            [<Underline key="u" className="h-4 w-4" />, () => exec('underline')],
            [<AlignLeft key="al" className="h-4 w-4" />, () => exec('justifyLeft')],
            [<AlignCenter key="ac" className="h-4 w-4" />, () => exec('justifyCenter')],
            [<AlignRight key="ar" className="h-4 w-4" />, () => exec('justifyRight')],
          ].map(([icon, fn], i) => (
            <button key={i} onMouseDown={e => { e.preventDefault(); (fn as () => void)() }}
              className="p-2 rounded hover:bg-gray-200 text-gray-600">{icon as React.ReactNode}</button>
          ))}
          <input type="color" onChange={e => exec('foreColor', e.target.value)} title="字体颜色"
            className="w-7 h-7 cursor-pointer rounded border border-gray-200" />
          <select onChange={e => exec('fontSize', e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-sm">
            {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{[10, 13, 16, 18, 24, 32, 48][n - 1]}px</option>)}
          </select>
          <button onMouseDown={e => { e.preventDefault(); navigator.clipboard.writeText(ref.current?.innerText || '') }}
            className="ml-auto flex items-center gap-1 text-xs text-indigo-600 border border-indigo-200 rounded px-3 py-1.5 hover:bg-indigo-50">
            <Copy className="h-3.5 w-3.5" /> 复制纯文本
          </button>
        </div>
        <div ref={ref} contentEditable suppressContentEditableWarning
          className="min-h-64 p-4 text-sm focus:outline-none">
        </div>
      </div>
    </ToolLayout>
  )
}
