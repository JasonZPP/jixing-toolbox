'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { CheckCircle, XCircle } from 'lucide-react'

interface CheckResult { rule: string; pass: boolean; detail: string }

function checkListing(title: string, bullets: string[], description: string): CheckResult[] {
  return [
    { rule: '标题字数 80-200', pass: title.length >= 80 && title.length <= 200,
      detail: `当前 ${title.length} 字符` },
    { rule: '标题不含特殊符号 ! ? @ # $ %', pass: !/[!?@#$%]/.test(title),
      detail: '亚马逊禁止标题含部分特殊符号' },
    { rule: '要点数量 5 条', pass: bullets.filter(b=>b.trim()).length === 5,
      detail: `当前 ${bullets.filter(b=>b.trim()).length} 条` },
    { rule: '每条要点 ≤ 500 字符', pass: bullets.every(b => b.length <= 500),
      detail: bullets.some(b=>b.length>500) ? '有要点超出500字符' : '全部符合' },
    { rule: '描述字数 ≤ 2000', pass: description.length <= 2000,
      detail: `当前 ${description.length} 字符` },
    { rule: '标题不全大写', pass: title !== title.toUpperCase(),
      detail: '标题全大写会被降权' },
  ]
}

export default function ListingCheckPage() {
  const [title, setTitle] = useState('')
  const [bullets, setBullets] = useState(['','','','',''])
  const [desc, setDesc] = useState('')
  const [checked, setChecked] = useState(false)

  const results = checked ? checkListing(title, bullets, desc) : []
  const passed = results.filter(r=>r.pass).length

  return (
    <ToolLayout title="Listing自检工具" description="检查标题字数、要点格式、关键词密度等规则">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">标题 ({title.length} 字符)</label>
            <textarea value={title} onChange={e=>setTitle(e.target.value)} rows={3} placeholder="粘贴产品标题..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">五要点（每行一条）</label>
            {bullets.map((b,i) => (
              <textarea key={i} value={b} onChange={e=>setBullets(p=>p.map((v,idx)=>idx===i?e.target.value:v))}
                rows={2} placeholder={`要点 ${i+1}`}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none mb-2"/>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">描述 ({desc.length} 字符)</label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4} placeholder="粘贴产品描述..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
          </div>
          <button onClick={()=>setChecked(true)}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
            开始自检
          </button>
        </div>
        {checked && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-700">检查结果</h3>
              <span className={`text-sm font-bold ${passed===results.length?'text-green-600':'text-orange-500'}`}>
                {passed}/{results.length} 通过
              </span>
            </div>
            {results.map(r => (
              <div key={r.rule} className={`flex items-start gap-3 p-3 rounded-xl border ${r.pass?'bg-green-50 border-green-200':'bg-red-50 border-red-200'}`}>
                {r.pass ? <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5"/> : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5"/>}
                <div>
                  <p className={`text-sm font-medium ${r.pass?'text-green-700':'text-red-700'}`}>{r.rule}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
