'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'

export default function MaxReserveFeePage() {
  const [capacity, setCapacity] = useState(100)
  const [salesForecast, setSalesForecast] = useState(5000)
  const [creditRate, setCreditRate] = useState(0.15)

  const valid = capacity > 0 && salesForecast > 0 && creditRate > 0
  const creditTotal = salesForecast * creditRate
  const maxReserveFee = creditTotal
  const perCubicFt = capacity > 0 ? maxReserveFee / capacity : 0

  return (
    <ToolLayout title="最高预留费计算工具" description="按销售额预估的绩效积分，计算白嫖FBA库容的最高预留费">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">输入参数</h3>
          <div>
            <label className="text-sm text-gray-600 block mb-1">计划申请 FBA 库容（立方英尺）</label>
            <input type="number" min="0" step="1" value={capacity}
              onChange={e => setCapacity(parseFloat(e.target.value) || 0)}
              placeholder="填写立方英尺"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">申请月份销售额预估（美元）</label>
            <input type="number" min="0" step="100" value={salesForecast}
              onChange={e => setSalesForecast(parseFloat(e.target.value) || 0)}
              placeholder="填写美元金额"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">绩效积分赚取率（每 $1 销售额产生积分）</label>
            <input type="number" min="0" step="0.01" value={creditRate}
              onChange={e => setCreditRate(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
            <p className="text-xs text-gray-400 mt-1">默认 0.15：每 $1 销售额产生 $0.15 绩效积分</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">分析结果</h3>
          {valid ? (
            <>
              <div className="space-y-1.5">
                {([
                  ['绩效积分总额', `$${creditTotal.toFixed(2)}`, false],
                  ['最高预留费（积分可全额抵扣）', `$${maxReserveFee.toFixed(2)}`, true],
                  ['每立方英尺最高预留费', `$${perCubicFt.toFixed(4)}`, false],
                ] as [string, string, boolean][]).map(([k, v, hl]) => (
                  <div key={k} className={`flex justify-between text-sm border-b border-gray-50 pb-1.5 ${hl ? 'font-bold text-[#5b5bd6]' : 'text-gray-600'}`}>
                    <span>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-slate-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                <p className="font-medium text-gray-600">详细计算过程</p>
                <p>绩效积分总额 = 销售额预估 ${salesForecast} × {creditRate} = ${creditTotal.toFixed(2)}</p>
                <p>最高预留费 = 绩效积分总额 = ${maxReserveFee.toFixed(2)}</p>
                <p>每立方英尺最高预留费 = ${maxReserveFee.toFixed(2)} ÷ {capacity} 立方英尺 = ${perCubicFt.toFixed(4)}</p>
                <p className="text-gray-400 pt-1">当预留费出价不超过此值时，可由绩效积分全额抵扣，相当于免费获取额外库容。</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">请输入有效的正数后查看结果</p>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
