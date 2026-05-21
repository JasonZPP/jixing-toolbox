'use client'
import { useRef, useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Undo, Redo, Eraser, Copy, Code,
} from 'lucide-react'

export default function EditorPage() {
  const ref = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'edit' | 'code'>('edit')
  const [code, setCode] = useState('')

  const exec = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); ref.current?.focus() }

  const insertLink = () => {
    const url = prompt('请输入链接地址：')
    if (url) exec('createLink', url)
  }
  const insertImage = () => {
    const url = prompt('请输入图片地址：')
    if (url) exec('insertImage', url)
  }
  const toCode = () => {
    if (mode === 'edit') { setCode(ref.current?.innerHTML || ''); setMode('code') }
    else { setMode('edit'); setTimeout(() => { if (ref.current) ref.current.innerHTML = code }, 0) }
  }
  const copyHtml = () => navigator.clipboard.writeText(mode === 'code' ? code : (ref.current?.innerHTML || ''))
  const copyText = () => navigator.clipboard.writeText(ref.current?.innerText || '')

  const btn = (icon: React.ReactNode, fn: () => void, title: string) => (
    <button title={title} onMouseDown={e => { e.preventDefault(); fn() }}
      className="p-2 rounded hover:bg-gray-200 text-gray-600">{icon}</button>
  )

  return (
    <ToolLayout title="可视化编辑器" description="富文本编辑：格式化、列表、链接图片、撤销重做、HTML代码模式">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-3xl">
        <div className="flex items-center gap-0.5 p-2 border-b border-gray-100 bg-slate-50 flex-wrap">
          {btn(<Bold className="h-4 w-4"/>, () => exec('bold'), '粗体')}
          {btn(<Italic className="h-4 w-4"/>, () => exec('italic'), '斜体')}
          {btn(<Underline className="h-4 w-4"/>, () => exec('underline'), '下划线')}
          {btn(<Strikethrough className="h-4 w-4"/>, () => exec('strikeThrough'), '删除线')}
          <span className="w-px h-5 bg-gray-200 mx-1"/>
          {btn(<AlignLeft className="h-4 w-4"/>, () => exec('justifyLeft'), '左对齐')}
          {btn(<AlignCenter className="h-4 w-4"/>, () => exec('justifyCenter'), '居中')}
          {btn(<AlignRight className="h-4 w-4"/>, () => exec('justifyRight'), '右对齐')}
          <span className="w-px h-5 bg-gray-200 mx-1"/>
          {btn(<List className="h-4 w-4"/>, () => exec('insertUnorderedList'), '无序列表')}
          {btn(<ListOrdered className="h-4 w-4"/>, () => exec('insertOrderedList'), '有序列表')}
          {btn(<LinkIcon className="h-4 w-4"/>, insertLink, '插入链接')}
          {btn(<ImageIcon className="h-4 w-4"/>, insertImage, '插入图片')}
          <span className="w-px h-5 bg-gray-200 mx-1"/>
          {btn(<Undo className="h-4 w-4"/>, () => exec('undo'), '撤销')}
          {btn(<Redo className="h-4 w-4"/>, () => exec('redo'), '重做')}
          {btn(<Eraser className="h-4 w-4"/>, () => exec('removeFormat'), '清除格式')}
          <input type="color" onChange={e => exec('foreColor', e.target.value)} title="文字颜色"
            className="w-7 h-7 cursor-pointer rounded border border-gray-200 ml-1"/>
          <select onChange={e => exec('fontSize', e.target.value)} title="字号"
            className="border border-gray-200 rounded px-2 py-1 text-sm ml-1">
            {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{[10, 13, 16, 18, 24, 32, 48][n - 1]}px</option>)}
          </select>
          <div className="ml-auto flex gap-1">
            <button onMouseDown={e => { e.preventDefault(); toCode() }}
              className={`flex items-center gap-1 text-xs rounded px-2.5 py-1.5 ${mode === 'code' ? 'bg-[#5b5bd6] text-white' : 'text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>
              <Code className="h-3.5 w-3.5"/> {mode === 'code' ? '编辑模式' : '代码模式'}
            </button>
            <button onMouseDown={e => { e.preventDefault(); copyHtml() }}
              className="text-xs text-gray-600 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-100">复制HTML</button>
            <button onMouseDown={e => { e.preventDefault(); copyText() }}
              className="flex items-center gap-1 text-xs text-[#5b5bd6] border border-[#5b5bd6]/30 rounded px-2.5 py-1.5 hover:bg-[#5b5bd6]/5">
              <Copy className="h-3.5 w-3.5"/> 复制纯文本
            </button>
          </div>
        </div>
        {mode === 'edit' ? (
          <div ref={ref} contentEditable suppressContentEditableWarning
            className="min-h-64 p-4 text-sm focus:outline-none prose-sm"/>
        ) : (
          <textarea value={code} onChange={e => setCode(e.target.value)}
            className="w-full min-h-64 p-4 text-sm font-mono focus:outline-none resize-none bg-slate-50"/>
        )}
      </div>
      <p className="mt-3 text-xs text-gray-400 max-w-3xl">
        小贴士：编辑模式用工具栏排版，代码模式可直接查看/粘贴 HTML 源码；切回编辑模式会应用代码内容。
      </p>
    </ToolLayout>
  )
}
