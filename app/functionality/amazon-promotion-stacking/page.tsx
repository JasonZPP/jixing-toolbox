'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'

interface Activity { key: string; name: string; note: string; group: string }
const ACTIVITIES: Activity[] = [
  { key: 'sale',         name: '价格折扣（Sale Price）',       group: '基础',  note: '设定折后基础价，后续所有优惠基于此价格叠加计算' },
  { key: 'coupon',       name: '优惠券（Coupon）',             group: '基础',  note: '在折后价基础上再减，同一商品通常仅一张优惠券生效' },
  { key: 'ped',          name: 'Prime 会员专享折扣',           group: '会员',  note: '面向 Prime 会员的额外折扣，基于当前价叠加' },
  { key: 'btc',          name: '品牌定制优惠券',               group: '品牌',  note: '面向指定受众人群的品牌定制优惠券' },
  { key: 'btp',          name: '品牌定制促销',                 group: '品牌',  note: '面向指定受众人群的品牌定制促销活动' },
  { key: 'social',       name: '社交媒体促销代码',             group: '品牌',  note: '通过站外社媒渠道分发的专属促销代码' },
  { key: 'deal',         name: '秒杀 / 七天促销（Deal）',      group: '限时',  note: '限时秒杀或七天主推折扣，需申请并通过亚马逊审核' },
  { key: 'lightning',   name: '闪购（Lightning Deal）',        group: '限时',  note: '4小时限时秒杀，展示在 Deals 页面，流量集中' },
  { key: 'outlet',       name: '亚马逊特卖场（Outlet）',       group: '清仓',  note: '对即将到期或过季库存进行折扣清仓，由亚马逊审核入场' },
  { key: 'unrestricted', name: '无限制促销（Percentage Off）',  group: '基础',  note: '面向所有买家无资格限制的折扣，可与优惠券等叠加' },
  { key: 'prime_day',    name: 'Prime 会员日专属折扣',         group: '会员',  note: '仅在 Prime Day 活动期间生效的限时专属折扣' },
  { key: 'b2b',          name: 'B2B 企业价格',                 group: '企业',  note: '面向企业买家的数量阶梯折扣，按采购量递增优惠' },
]

const GROUP_COLORS: Record<string, string> = {
  基础: 'bg-slate-100 text-slate-600',
  会员: 'bg-blue-50 text-blue-600',
  品牌: 'bg-purple-50 text-purple-600',
  限时: 'bg-orange-50 text-orange-600',
  清仓: 'bg-red-50 text-red-600',
  企业: 'bg-green-50 text-green-600',
}

type StackMode = 'sequential' | 'best'

export default function PromotionStackingPage() {
  const [price, setPrice] = useState(50)
  const [selected, setSelected] = useState<Record<string, number>>({ sale: 15, coupon: 10 })
  const [mode, setMode] = useState<StackMode>('sequential')

  const toggle = (key: string) => {
    setSelected(prev => {
      const next = { ...prev }
      if (key in next) delete next[key]
      else next[key] = 10
      return next
    })
  }
  const setDiscount = (key: string, val: number) => setSelected(prev => ({ ...prev, [key]: val }))
  const reset = () => setSelected({})

  const entries = Object.entries(selected)
  const enough = entries.length >= 2

  let finalPrice = price
  const steps: Array<{ name: string; discount: number; after: number }> = []

  if (entries.length > 0) {
    if (mode === 'sequential') {
      let cur = price
      for (const [key, d] of entries) {
        const after = cur * (1 - d / 100)
        steps.push({ name: ACTIVITIES.find(a => a.key === key)?.name ?? key, discount: d, after })
        cur = after
      }
      finalPrice = cur
    } else {
      const best = Math.max(...entries.map(([, d]) => d))
      finalPrice = price * (1 - best / 100)
    }
  }
  const totalDiscount = price > 0 ? (1 - finalPrice / price) * 100 : 0
  const saved = price - finalPrice

  return (
    <ToolLayout title="亚马逊促销叠加计算器" description="多种促销活动叠加后的最终售价与总折扣精确计算">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">选择活动（至少 2 个）</h3>
              <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500">重置所有</button>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <label className="text-sm text-gray-600">商品原价 ($)</label>
              <input type="number" min="0" step="0.5" value={price}
                onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                className="w-28 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
            </div>
            {ACTIVITIES.map(a => {
              const on = a.key in selected
              return (
                <div key={a.key} className={`rounded-lg border p-3 transition-colors ${on ? 'border-[#5b5bd6]/30 bg-[#5b5bd6]/5' : 'border-gray-100'}`}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={on} onChange={() => toggle(a.key)}/>
                    <span className="text-sm font-medium text-gray-700">{a.name}</span>
                    <span className={`text-[10px] rounded px-1.5 py-0.5 font-medium ${GROUP_COLORS[a.group]}`}>{a.group}</span>
                  </label>
                  <p className="text-xs text-gray-400 mt-1 ml-6">{a.note}</p>
                  {on && (
                    <div className="flex items-center gap-2 mt-2 ml-6">
                      <span className="text-xs text-gray-500">折扣力度</span>
                      <input type="number" min="0" max="100" step="1" value={selected[a.key]}
                        onChange={e => setDiscount(a.key, parseFloat(e.target.value) || 0)}
                        className="w-20 text-right border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/50"/>
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">叠加方式</h3>
            <div className="flex gap-2">
              {([['sequential', '依次叠加（折上折）'], ['best', '取最优（只用最大一个）']] as [StackMode, string][]).map(([m, l]) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-[#5b5bd6] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#5b5bd6]/5 border border-[#5b5bd6]/20 rounded-xl p-5">
            <h3 className="text-sm font-bold text-[#5b5bd6] mb-3">计算结果</h3>
            {enough ? (
              <div className="space-y-1.5">
                {/* Sequential steps */}
                {mode === 'sequential' && steps.length > 0 && (
                  <div className="mb-3 space-y-1 border-b border-[#5b5bd6]/10 pb-3">
                    <p className="text-xs text-gray-400 mb-1">折扣链路（逐步计算）</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 flex-wrap">
                      <span className="font-medium">${price.toFixed(2)}</span>
                      {steps.map((s, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className="text-gray-400">→</span>
                          <span className="bg-white border border-[#5b5bd6]/20 rounded px-1.5 py-0.5">-{s.discount}%</span>
                          <span className="font-medium">${s.after.toFixed(2)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {([
                  ['商品原价', `$${price.toFixed(2)}`, 'text-gray-700'],
                  ['总折扣率', `${totalDiscount.toFixed(1)}%`, 'text-orange-500 font-semibold'],
                  ['实际扣除金额', `-$${saved.toFixed(2)}`, 'text-gray-500'],
                  ['预估最终售价', `$${finalPrice.toFixed(2)}`, 'text-[#5b5bd6] font-bold text-base'],
                ] as [string, string, string][]).map(([k, v, cls]) => (
                  <div key={k} className="flex justify-between text-sm border-b border-[#5b5bd6]/10 pb-1.5">
                    <span className="text-gray-600">{k}</span>
                    <span className={cls}>{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">👈 请在左侧勾选至少两个活动</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-600">官方活动注意事项</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>价格折扣会形成新的基础价，优惠券、专享折扣等基于折后价再计算（折上折）。</li>
              <li>同一订单通常仅一张优惠券生效；多张优惠券一般不叠加，系统取力度更大的一个。</li>
              <li>Lightning Deal 与 Prime Day 折扣一般不与其他促销叠加，需在后台确认规则。</li>
              <li>叠加多重促销可能造成价格远低于预期，建议先用本工具测算最终售价。</li>
              <li>计算结果仅供参考，实际扣除请以亚马逊后台最终结算为准。</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
