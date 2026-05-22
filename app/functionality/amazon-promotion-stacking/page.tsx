'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'

type Group = 'base' | 'promotion' | 'coupon' | 'member' | 'event' | 'b2b'

interface Activity {
  key: string; name: string; note: string; group: Group; order: number
}

const ACTIVITIES: Activity[] = [
  { key: 'sale',         name: '价格折扣（Sale Price）',  group: 'base',      order: 1,  note: '设定折后基础价，所有优惠以此为起算点，最先生效' },
  { key: 'priority',     name: '促销-优先型',             group: 'promotion', order: 2,  note: '面向指定受众的受限促销，优先级最高，基于当前价叠加' },
  { key: 'unrestricted', name: '促销-无限制型',           group: 'promotion', order: 3,  note: '面向所有买家的无限制折扣，与优先型同类，取较优者' },
  { key: 'btc',          name: '品牌定制促销',            group: 'promotion', order: 4,  note: '面向品牌指定受众人群的定制化促销活动' },
  { key: 'coupon',       name: '优惠券（Coupon）',        group: 'coupon',    order: 5,  note: '在折后价基础上再减，同一商品同时只有一张优惠券生效' },
  { key: 'bcc',          name: '品牌定制优惠券',          group: 'coupon',    order: 6,  note: '面向品牌指定受众的定制化优惠券，与普通优惠券同类' },
  { key: 'ped',          name: 'Prime 专享折扣',          group: 'member',    order: 7,  note: '面向 Prime 会员的额外折扣，基于当前价叠加' },
  { key: 'social',       name: '社交媒体促销代码',        group: 'member',    order: 8,  note: '通过站外社媒渠道分发的专属折扣码' },
  { key: 'deal',         name: '秒杀（Lightning Deal）',  group: 'event',     order: 9,  note: '限时促销，需申请并通过亚马逊审核' },
  { key: 'outlet',       name: '奥特莱斯（Outlet）',      group: 'event',     order: 10, note: '清仓促销，对库存商品折扣，由亚马逊审核入场' },
  { key: 'b2b',          name: 'B2B 企业价格',            group: 'b2b',       order: 11, note: '面向企业买家的数量阶梯折扣，按采购量递增优惠' },
  { key: 'points',       name: '日本站积分',              group: 'b2b',       order: 12, note: '日本站专属积分返还，折算为等效折扣率' },
]

const GROUP_STYLE: Record<Group, string> = {
  base:      'bg-slate-100 text-slate-600',
  promotion: 'bg-blue-50 text-blue-600',
  coupon:    'bg-purple-50 text-purple-600',
  member:    'bg-green-50 text-green-600',
  event:     'bg-orange-50 text-orange-600',
  b2b:       'bg-teal-50 text-teal-600',
}
const GROUP_LABEL: Record<Group, string> = {
  base: '基础', promotion: '促销', coupon: '优惠券', member: '会员', event: '限时', b2b: '企业',
}

export default function PromotionStackingPage() {
  const [price, setPrice] = useState(50)
  const [selected, setSelected] = useState<Record<string, number>>({ sale: 15, coupon: 10 })
  const [stackConsent, setStackConsent] = useState<Record<string, boolean>>({})

  const toggle = (key: string) => {
    setSelected(prev => {
      const next = { ...prev }
      if (key in next) delete next[key]
      else next[key] = 10
      return next
    })
    setStackConsent(prev => { const next = { ...prev }; delete next[key]; return next })
  }
  const setDiscount = (key: string, val: number) =>
    setSelected(prev => ({ ...prev, [key]: Math.min(100, Math.max(0, val)) }))
  const reset = () => { setSelected({}); setStackConsent({}) }

  const selectedActivities = useMemo(
    () => ACTIVITIES.filter(a => a.key in selected).sort((a, b) => a.order - b.order),
    [selected])

  const hasCoupon = selectedActivities.some(a => a.group === 'coupon')
  const hasPromo  = selectedActivities.some(a => a.group === 'promotion')
  const needsStackChoice = hasCoupon && hasPromo

  const allCouponsConsent = selectedActivities.filter(a => a.group === 'coupon').every(a => stackConsent[a.key])
  const allPromosConsent  = selectedActivities.filter(a => a.group === 'promotion').every(a => stackConsent[a.key])
  const stackingAllowed = needsStackChoice && allCouponsConsent && allPromosConsent

  const { steps, finalPrice } = useMemo(() => {
    if (selectedActivities.length === 0) return { steps: [] as Array<{key:string;name:string;discount:number;after:number;skipped:boolean}>, finalPrice: price }

    const skipKeys = new Set<string>()
    if (needsStackChoice && !stackingAllowed) {
      const promoMax = selectedActivities
        .filter(a => a.group === 'promotion')
        .reduce((max, a) => Math.max(max, selected[a.key] ?? 0), 0)
      const couponMax = selectedActivities
        .filter(a => a.group === 'coupon')
        .reduce((max, a) => Math.max(max, selected[a.key] ?? 0), 0)
      if (promoMax >= couponMax) {
        selectedActivities.filter(a => a.group === 'coupon').forEach(a => skipKeys.add(a.key))
      } else {
        selectedActivities.filter(a => a.group === 'promotion').forEach(a => skipKeys.add(a.key))
      }
    }

    let cur = price
    const steps = selectedActivities.map(a => {
      const d = selected[a.key] ?? 0
      const skipped = skipKeys.has(a.key)
      const after = skipped ? cur : cur * (1 - d / 100)
      if (!skipped) cur = after
      return { key: a.key, name: a.name, discount: d, after, skipped }
    })
    return { steps, finalPrice: cur }
  }, [selectedActivities, selected, needsStackChoice, stackingAllowed, price])

  const totalDiscount = price > 0 ? (1 - finalPrice / price) * 100 : 0
  const saved = price - finalPrice
  const enough = selectedActivities.length >= 2

  return (
    <ToolLayout title="亚马逊促销叠加计算器" description="多种促销活动的最终售价与总折扣精确计算，系统根据亚马逊规则自动判断叠加顺序">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">① 选择活动 &amp; 设置力度</h3>
                <p className="text-xs text-gray-400 mt-0.5">至少选择 2 个活动</p>
              </div>
              <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500">重置所有</button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">商品原价（$）</label>
              <input type="number" min="0" step="0.5" value={price}
                onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                className="w-28 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
            </div>

            {ACTIVITIES.map(a => {
              const on = a.key in selected
              return (
                <div key={a.key} className={`rounded-lg border p-3 transition-colors ${on ? 'border-[#5b5bd6]/30 bg-[#5b5bd6]/5' : 'border-gray-100'}`}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={on} onChange={() => toggle(a.key)} className="accent-[#5b5bd6]"/>
                    <span className="text-sm font-medium text-gray-700">{a.name}</span>
                    <span className={`text-[10px] rounded px-1.5 py-0.5 font-medium ${GROUP_STYLE[a.group]}`}>{GROUP_LABEL[a.group]}</span>
                  </label>
                  <p className="text-xs text-gray-400 mt-1 ml-6">{a.note}</p>
                  {on && (
                    <div className="flex items-center gap-2 mt-2 ml-6 flex-wrap">
                      <span className="text-xs text-gray-500">折扣力度</span>
                      <input type="number" min="0" max="100" step="1" value={selected[a.key]}
                        onChange={e => setDiscount(a.key, parseFloat(e.target.value) || 0)}
                        className="w-20 text-right border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/50"/>
                      <span className="text-xs text-gray-500">%</span>
                      {needsStackChoice && (a.group === 'coupon' || a.group === 'promotion') && (
                        <label className="flex items-center gap-1 ml-1 cursor-pointer">
                          <input type="checkbox"
                            checked={!!stackConsent[a.key]}
                            onChange={e => setStackConsent(p => ({ ...p, [a.key]: e.target.checked }))}
                            className="accent-[#5b5bd6]"/>
                          <span className="text-xs text-[#5b5bd6]">是，允许叠加使用</span>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          {needsStackChoice && (
            <div className={`rounded-xl border p-4 text-sm ${stackingAllowed ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <p className={`font-medium ${stackingAllowed ? 'text-green-700' : 'text-amber-700'}`}>
                {stackingAllowed ? '✅ 促销 + 优惠券 均已允许叠加，两者同时生效' : '⚠️ 检测到促销与优惠券同时选中'}
              </p>
              {!stackingAllowed && (
                <p className="text-xs text-amber-600 mt-1">
                  只有当「促销类」和「优惠券类」两侧都勾选「是，允许叠加使用」时，才会同时生效；否则系统自动取折扣力度更大的一个。
                </p>
              )}
            </div>
          )}

          <div className="bg-[#5b5bd6]/5 border border-[#5b5bd6]/20 rounded-xl p-5">
            <h3 className="text-sm font-bold text-[#5b5bd6] mb-3">② 计算结果</h3>
            {enough ? (
              <div className="space-y-2">
                {steps.length > 0 && (
                  <div className="mb-3 border-b border-[#5b5bd6]/10 pb-3">
                    <p className="text-xs text-gray-400 mb-2">叠加链路（按亚马逊规则自动排序）</p>
                    <div className="flex items-center gap-1.5 text-xs flex-wrap">
                      <span className="font-medium text-gray-700">${price.toFixed(2)}</span>
                      {steps.map((s, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className="text-gray-400">→</span>
                          <span className={`rounded px-1.5 py-0.5 ${s.skipped ? 'bg-gray-100 text-gray-400 line-through' : 'bg-white border border-[#5b5bd6]/20 text-gray-600'}`}>
                            -{s.discount}%
                          </span>
                          <span className={`font-medium ${s.skipped ? 'text-gray-300' : 'text-gray-700'}`}>${s.after.toFixed(2)}</span>
                        </span>
                      ))}
                    </div>
                    {steps.some(s => s.skipped) && (
                      <p className="text-xs text-gray-400 mt-1.5">划线项：未允许叠加，已取更优方案后跳过</p>
                    )}
                  </div>
                )}
                {([
                  ['商品原价',     `$${price.toFixed(2)}`,         'text-gray-700'],
                  ['总折扣率',     `${totalDiscount.toFixed(1)}%`,  'text-orange-500 font-semibold'],
                  ['实际扣除金额', `-$${saved.toFixed(2)}`,         'text-gray-500'],
                  ['预估最终售价', `$${finalPrice.toFixed(2)}`,     'text-[#5b5bd6] font-bold text-base'],
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

          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-xs text-gray-500 space-y-1.5">
            <p className="font-medium text-gray-600">亚马逊促销叠加规则说明</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>「价格折扣」最先生效，形成新基础价，后续所有优惠基于此价叠加。</li>
              <li>「促销」与「优惠券」默认不叠加，系统取折扣力度更大的一个；若双方均勾选「允许叠加」则同时生效。</li>
              <li>Prime 专享折扣、社交媒体促销代码在优惠券/促销之后叠加计算。</li>
              <li>秒杀、奥特莱斯通常不与其他促销叠加，需在后台确认具体规则。</li>
              <li>计算结果仅供参考，实际以亚马逊后台最终结算为准。</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
