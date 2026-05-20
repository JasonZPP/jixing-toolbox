'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'

const MARKETS = [
  { name: '美国', url: (asin:string)=>`https://www.amazon.com/dp/${asin}` },
  { name: '英国', url: (asin:string)=>`https://www.amazon.co.uk/dp/${asin}` },
  { name: '德国', url: (asin:string)=>`https://www.amazon.de/dp/${asin}` },
  { name: '日本', url: (asin:string)=>`https://www.amazon.co.jp/dp/${asin}` },
  { name: '加拿大', url: (asin:string)=>`https://www.amazon.ca/dp/${asin}` },
]

export default function AmazonGlobalPage() {
  const [input, setInput] = useState('')
  const asins = input.split(/[\n,\s]+/).map(s=>s.trim().toUpperCase()).filter(s=>/^[A-Z0-9]{10}$/.test(s))
  const invalid = input.split(/[\n,\s]+/).map(s=>s.trim()).filter(s=>s&&!/^[A-Z0-9]{10}$/.test(s))

  return (
    <ToolLayout title="亚马逊批量查询" description="批量验证ASIN格式并生成各站点商品链接">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={10} placeholder="每行或逗号分隔一个ASIN（10位字母数字）..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
          <p className="text-xs text-gray-500">有效 <span className="text-green-600 font-medium">{asins.length}</span> 个，
            无效 <span className="text-red-500 font-medium">{invalid.length}</span> 个</p>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[500px]">
          {asins.map(asin=>(
            <div key={asin} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="font-bold text-gray-700 font-mono mb-2">{asin}</p>
              <div className="flex flex-wrap gap-2">
                {MARKETS.map(m=>(
                  <a key={m.name} href={m.url(asin)} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-indigo-600 border border-indigo-200 rounded px-2 py-1 hover:bg-indigo-50">{m.name}</a>
                ))}
              </div>
            </div>
          ))}
          {!asins.length && <p className="text-sm text-gray-400 text-center py-8">输入ASIN后显示链接</p>}
        </div>
      </div>
    </ToolLayout>
  )
}
