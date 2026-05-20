'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'

export default function RatingSalesReversePage() {
  const [reviewCount, setReviewCount] = useState(500)
  const [period, setPeriod] = useState(12)
  const [rr, setRr] = useState(5)

  const monthlySales = Math.round((reviewCount / period) / (rr / 100))

  return (
    <ToolLayout title="亚马逊评分销量反推" description="基于评论数量估算竞品月销量">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-md space-y-4">
        {[
          { label: '总评论数', value: reviewCount, setter: setReviewCount, step: 10 },
          { label: '上架月数', value: period, setter: setPeriod, step: 1 },
          { label: '预估留评率 (%)', value: rr, setter: setRr, step: 0.5 },
        ].map(({ label, value, setter, step }) => (
          <div key={label} className="flex items-center justify-between">
            <label className="text-sm text-gray-600">{label}</label>
            <input type="number" min="0.1" step={step} value={value} onChange={e => setter(parseFloat(e.target.value)||1)}
              className="w-32 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
        ))}
        <div className="border-t border-gray-100 pt-4 text-center">
          <p className="text-xs text-gray-400 mb-1">估算月销量</p>
          <p className="text-4xl font-bold text-indigo-600">{monthlySales.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">公式：总评论数 ÷ 上架月数 ÷ 留评率</p>
        </div>
      </div>
    </ToolLayout>
  )
}
