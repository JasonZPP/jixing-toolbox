'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'

export default function PromotionStackingPage() {
  const [price, setPrice] = useState(50)
  const [discounts, setDiscounts] = useState([10, 5])

  const finalPrice = discounts.reduce((p, d) => p * (1 - d / 100), price)
  const totalDiscount = ((1 - finalPrice / price) * 100)

  const addDiscount = () => setDiscounts(prev => [...prev, 5])
  const removeDiscount = (i: number) => setDiscounts(prev => prev.filter((_, idx) => idx !== i))
  const update = (i: number, val: string) => setDiscounts(prev => prev.map((d, idx) => idx === i ? parseFloat(val)||0 : d))

  return (
    <ToolLayout title="亚马逊促销叠加计算器" description="计算多重折扣叠加后的最终价格">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">原始售价 ($)</label>
          <input type="number" min="0" step="0.5" value={price} onChange={e => setPrice(+e.target.value)}
            className="w-32 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div className="space-y-2">
          {discounts.map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm text-gray-500">折扣 {i+1} (%)</span>
              <input type="number" min="0" max="100" step="0.5" value={d} onChange={e => update(i, e.target.value)}
                className="w-24 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <button onClick={() => removeDiscount(i)} className="text-red-400 hover:text-red-600 text-xs">移除</button>
            </div>
          ))}
          <button onClick={addDiscount} className="text-sm text-indigo-600 hover:text-indigo-800">+ 添加折扣</button>
        </div>
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600"><span>叠加后价格</span><span className="font-bold text-indigo-600 text-base">${finalPrice.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm text-gray-600"><span>总折扣率</span><span className="font-medium text-orange-500">{totalDiscount.toFixed(1)}%</span></div>
          <div className="flex justify-between text-sm text-gray-600"><span>节省金额</span><span className="font-medium text-green-600">${(price-finalPrice).toFixed(2)}</span></div>
        </div>
      </div>
    </ToolLayout>
  )
}
