'use client'
import { useState } from 'react'
import Footer from '@/components/Footer'

export default function SuggestPage() {
  const [tool, setTool] = useState('')
  const [desc, setDesc] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const submit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true) }
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">提需求</h1>
      <p className="text-gray-500 mb-8 text-sm">告诉我们你需要什么工具，我们会优先考虑高频需求</p>
      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <p className="text-green-700 font-semibold text-lg">✅ 收到了！感谢你的建议</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div><label className="text-sm font-medium text-gray-700 block mb-1">希望增加的工具名称</label>
            <input required value={tool} onChange={e=>setTool(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/></div>
          <div><label className="text-sm font-medium text-gray-700 block mb-1">详细描述（可选）</label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/></div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">提交建议</button>
        </form>
      )}
      <Footer />
    </div>
  )
}
