'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'

type Mode = 'sales' | 'rating'

export default function RatingSalesReversePage() {
  const [mode, setMode] = useState<Mode>('sales')

  // 销量反推
  const [reviewCount, setReviewCount] = useState(500)
  const [months, setMonths] = useState(12)
  const [reviewRate, setReviewRate] = useState(2)

  // 目标评分测算
  const [stars, setStars] = useState<number[]>([5, 8, 20, 60, 300])
  const [target, setTarget] = useState(4.5)

  const rr = reviewRate / 100
  const totalSales = rr > 0 ? Math.round(reviewCount / rr) : 0
  const monthlySales = months > 0 ? Math.round(totalSales / months) : 0

  const totalReviews = stars.reduce((s, c) => s + c, 0)
  const weightedSum = stars.reduce((s, c, i) => s + c * (i + 1), 0)
  const currentAvg = totalReviews > 0 ? weightedSum / totalReviews : 0
  const needFive = (target > currentAvg && target < 5)
    ? Math.ceil((target * totalReviews - weightedSum) / (5 - target))
    : 0

  const setStar = (i: number, v: number) => setStars(p => p.map((c, idx) => idx === i ? v : c))

  const ic = 'w-32 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40'

  return (
    <ToolLayout title="亚马逊评分销量反推" description="基于评论数估算竞品销量，按星级分布测算目标评分所需好评数">
      <div className="space-y-5">
        <div className="flex gap-2">
          {([['sales', '销量反推'], ['rating', '目标评分测算']] as [Mode, string][]).map(([m, l]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-[#5b5bd6] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#5b5bd6]/40'}`}>
              {l}
            </button>
          ))}
        </div>

        {mode === 'sales' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">竞品数据</h3>
              <div className="flex items-center justify-between"><label className="text-sm text-gray-600">总评论数</label><input type="number" min="0" step="10" value={reviewCount} onChange={e => setReviewCount(parseFloat(e.target.value) || 0)} className={ic}/></div>
              <div className="flex items-center justify-between"><label className="text-sm text-gray-600">上架月数</label><input type="number" min="1" step="1" value={months} onChange={e => setMonths(parseFloat(e.target.value) || 1)} className={ic}/></div>
              <div className="flex items-center justify-between"><label className="text-sm text-gray-600">预估留评率 (%)</label><input type="number" min="0.1" step="0.5" value={reviewRate} onChange={e => setReviewRate(parseFloat(e.target.value) || 0.1)} className={ic}/></div>
              <p className="text-xs text-gray-400">留评率指每 100 单产生评论的比例，文字评论通常仅占总销量的 1%-3%。</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-center">
              <div className="text-center mb-4">
                <p className="text-xs text-gray-400 mb-1">预估累计总销量</p>
                <p className="text-3xl font-bold text-gray-800">{totalSales.toLocaleString()}</p>
              </div>
              <div className="text-center border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 mb-1">预估月均销量</p>
                <p className="text-4xl font-bold text-[#5b5bd6]">{monthlySales.toLocaleString()}</p>
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">公式：总销量 = 总评论数 ÷ 留评率；月均 = 总销量 ÷ 上架月数</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">当前星级分布</h3>
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">{star} 星好评数量</label>
                  <input type="number" min="0" step="1" value={stars[star - 1]}
                    onChange={e => setStar(star - 1, parseFloat(e.target.value) || 0)} className={ic}/>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <label className="text-sm text-gray-600">目标评分</label>
                <input type="number" min="1" max="5" step="0.1" value={target}
                  onChange={e => setTarget(parseFloat(e.target.value) || 0)} className={ic}/>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">测算结果</h3>
              <div className="space-y-1.5">
                {([
                  ['总评价数', `${totalReviews}`],
                  ['当前评分', totalReviews > 0 ? currentAvg.toFixed(2) : '无法计算'],
                  ['目标评分', target.toFixed(1)],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm border-b border-gray-50 pb-1.5">
                    <span className="text-gray-600">{k}</span>
                    <span className="font-medium text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-[#5b5bd6]/5 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">达到目标评分还需新增 5 星好评</p>
                {target <= currentAvg ? (
                  <p className="text-base font-semibold text-green-600">当前评分已达标 ✓</p>
                ) : target >= 5 ? (
                  <p className="text-base font-semibold text-red-500">目标 5.0 在数学上无法精确达到</p>
                ) : (
                  <p className="text-3xl font-bold text-[#5b5bd6]">{needFive.toLocaleString()} 条</p>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3">原理：求解加权平均数的逆运算。新增 N 条 5 星后 (加权总分+5N)÷(总数+N)=目标分。建议通过优化产品质量与买家服务获取真实好评。</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
