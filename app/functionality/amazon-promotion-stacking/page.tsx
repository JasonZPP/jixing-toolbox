'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'

type DiscType = 'pct' | 'dollar'
type StackRel = 'stack' | 'choice' | 'exclusive'

interface Activity {
  key: string; name: string; short: string; note: string
}

const ACTIVITIES: Activity[] = [
  { key: 'coupon',       name: '优惠券（Coupon）',    short: '优惠券',   note: '折扣 Percentage off；同一商品同时只有一张优惠券生效' },
  { key: 'b2b',         name: 'B2B 价格',            short: 'B2B',      note: '折扣 Percentage off；面向企业买家按采购量阶梯优惠' },
  { key: 'unrestricted',name: '促销-无限制型',        short: '无限制型', note: '折扣 Percentage off / 买赠 BxGy；买家可叠加两种不同无限制促销' },
  { key: 'priority',    name: '促销-优先型',          short: '优先型',   note: '折扣 Percentage off / 买赠 BxGy；买家只用折扣更优惠的那个（不叠加）' },
  { key: 'social',      name: '社交媒体促销代码',     short: '社交媒体', note: '站外社媒渠道分发的专属折扣码' },
  { key: 'points',      name: '日本站积分',           short: '积分',     note: '日本站专属积分返还，折算为等效折扣率' },
  { key: 'deal',        name: '秒杀（LD）',           short: '秒杀',     note: '折扣/买赠；4小时限时闪购，展示在 Deals 页面' },
  { key: 'outlet',      name: '奥特莱斯（Outlet）',   short: '奥特莱斯', note: '对即将到期或过季库存折扣清仓，由亚马逊审核入场' },
  { key: 'sale',        name: '价格折扣',             short: '价格折扣', note: '设定折后基础价，其余所有优惠以此为起算点，最先生效' },
  { key: 'btc',         name: '品牌定制促销',         short: '品牌促销', note: '面向品牌指定受众的促销活动，等效于促销-无限制型' },
  { key: 'bcc',         name: '品牌定制优惠券',       short: '品牌券',   note: '面向品牌指定受众的优惠券，等效于普通优惠券' },
  { key: 'ped',         name: 'Prime 专享折扣',       short: 'Prime折扣',note: '面向 Prime 会员的额外折扣，基于当前价叠加' },
]

// Stacking relationship matrix (symmetric)
// 'stack' = 叠加(折上折)  'choice' = 可自主选择  'exclusive' = 互斥(取最优)
const MATRIX: Record<string, Record<string, StackRel>> = {
  coupon:       { b2b: 'stack', unrestricted: 'choice', priority: 'choice', btc: 'choice', social: 'choice', ped: 'stack', points: 'stack', outlet: 'stack', deal: 'stack', bcc: 'exclusive' },
  bcc:          { b2b: 'stack', unrestricted: 'choice', priority: 'choice', btc: 'choice', social: 'choice', ped: 'stack', points: 'stack', outlet: 'stack', deal: 'stack' },
  b2b:          { unrestricted: 'stack', priority: 'stack', btc: 'stack', social: 'stack', ped: 'stack', points: 'exclusive', outlet: 'exclusive', deal: 'exclusive' },
  unrestricted: { priority: 'stack', btc: 'stack', social: 'stack', ped: 'stack', points: 'stack', outlet: 'stack', deal: 'stack' },
  priority:     { btc: 'stack', social: 'exclusive', ped: 'stack', points: 'stack', outlet: 'stack', deal: 'stack' },
  btc:          { social: 'choice', ped: 'stack', points: 'stack', outlet: 'stack', deal: 'stack' },
  social:       { ped: 'stack', points: 'stack', outlet: 'stack', deal: 'stack' },
  ped:          { points: 'stack', outlet: 'stack', deal: 'stack' },
  points:       { outlet: 'stack', deal: 'stack' },
  outlet:       { deal: 'stack' },
}

function getRelation(a: string, b: string): StackRel {
  return MATRIX[a]?.[b] ?? MATRIX[b]?.[a] ?? 'stack'
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|')
}

interface ActivityState {
  type: DiscType
  value: number
}

export default function PromotionStackingPage() {
  const [price, setPrice] = useState(100)
  const [inputs, setInputs] = useState<Record<string, ActivityState>>({
    coupon: { type: 'dollar', value: 5 },
    b2b:    { type: 'pct',    value: 10 },
  })
  const [choiceYes, setChoiceYes] = useState<Record<string, boolean>>({}) // pairKey → bool

  const selected = useMemo(
    () => ACTIVITIES.filter(a => a.key in inputs),
    [inputs])

  const hasSale = 'sale' in inputs

  const toggleActivity = (key: string) => {
    setInputs(prev => {
      const next = { ...prev }
      if (key in next) { delete next[key] }
      else { next[key] = { type: 'pct', value: 10 } }
      return next
    })
  }
  const updateInput = (key: string, field: keyof ActivityState, val: string | number) => {
    setInputs(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }))
  }
  const reset = () => { setInputs({}); setChoiceYes({}) }

  // All pairs of selected non-sale activities
  const nonSaleSelected = useMemo(() => selected.filter(a => a.key !== 'sale'), [selected])

  const pairs = useMemo(() => {
    const result: Array<{ a: Activity; b: Activity; rel: StackRel; key: string }> = []
    for (let i = 0; i < nonSaleSelected.length; i++) {
      for (let j = i + 1; j < nonSaleSelected.length; j++) {
        const a = nonSaleSelected[i], b = nonSaleSelected[j]
        result.push({ a, b, rel: getRelation(a.key, b.key), key: pairKey(a.key, b.key) })
      }
    }
    return result
  }, [nonSaleSelected])

  // Calculate effective discount as pct (0-1) based on base price
  function effectivePct(key: string, basePrice: number): number {
    const inp = inputs[key]
    if (!inp) return 0
    if (inp.type === 'dollar') return basePrice > 0 ? Math.min(inp.value / basePrice, 1) : 0
    return inp.value / 100
  }

  // Determine which activities are skipped based on exclusive/choice rules
  const { skippedKeys, finalPrice, steps } = useMemo(() => {
    const skipped = new Set<string>()

    // Step 1: apply sale price discount to get base
    let basePrice = price
    if (hasSale) {
      const inp = inputs.sale
      if (inp.type === 'dollar') basePrice = Math.max(0, price - inp.value)
      else basePrice = price * (1 - inp.value / 100)
    }

    // Step 2: determine skips (exclusive or choice=NO → keep better one)
    for (const { a, b, rel, key } of pairs) {
      if (rel === 'exclusive' || (rel === 'choice' && !choiceYes[key])) {
        const dA = effectivePct(a.key, basePrice)
        const dB = effectivePct(b.key, basePrice)
        if (!skipped.has(a.key) && !skipped.has(b.key)) {
          if (dA >= dB) skipped.add(b.key)
          else skipped.add(a.key)
        }
      }
    }

    // Step 3: additive — sum all % discounts, then subtract all $ discounts
    // (matches reference site logic: total % applied to base, then $ off)
    let totalPct = 0
    let totalDollar = 0
    const steps: Array<{ key: string; name: string; short: string; inp: ActivityState; after: number; skipped: boolean }> = []

    if (hasSale) {
      const inp = inputs.sale
      const after = inp.type === 'dollar' ? Math.max(0, price - inp.value) : price * (1 - inp.value / 100)
      steps.push({ key: 'sale', name: '价格折扣', short: '价格折扣', inp, after, skipped: false })
    }

    for (const a of nonSaleSelected) {
      const inp = inputs[a.key]
      const sk = skipped.has(a.key)
      if (!sk) {
        if (inp.type === 'pct') totalPct += inp.value / 100
        else totalDollar += inp.value
      }
      steps.push({ key: a.key, name: a.name, short: a.short, inp, after: 0, skipped: sk })
    }

    const afterPct = basePrice * Math.max(0, 1 - totalPct)
    const cur = Math.max(0, afterPct - totalDollar)

    // fill in step 'after' for display (cumulative for show)
    let running = basePrice
    for (const s of steps) {
      if (s.key === 'sale') { running = s.after; continue }
      if (s.skipped) { s.after = running; continue }
      const inp = s.inp
      if (inp.type === 'pct') running = running * (1 - inp.value / 100)
      else running = Math.max(0, running - inp.value)
      s.after = running
    }

    return { skippedKeys: skipped, finalPrice: cur, steps }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, price, pairs, choiceYes, hasSale, nonSaleSelected])

  const totalDiscount = price > 0 ? (1 - finalPrice / price) * 100 : 0
  const saved = price - finalPrice
  const enough = selected.length >= 2

  function fmtDisc(inp: ActivityState): string {
    return inp.type === 'dollar' ? `-$${inp.value}` : `-${inp.value}%`
  }

  const REL_STYLE: Record<StackRel, string> = {
    stack:     'bg-red-50 text-red-600 border-red-200',
    choice:    'bg-orange-50 text-orange-600 border-orange-200',
    exclusive: 'bg-green-50 text-green-600 border-green-200',
  }
  const REL_LABEL: Record<StackRel, string> = {
    stack:     '叠加（折上折）',
    choice:    '可自主选择',
    exclusive: '互斥（取最优）',
  }

  return (
    <ToolLayout title="亚马逊促销叠加计算器" description="基于2024年亚马逊各类促销叠加逻辑规则进行构建">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── Left: activity selection ─────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">① 选择活动 &amp; 设置力度</p>
              <p className="text-xs text-gray-400">商品原价 (Price) $
                <input type="number" min="0" step="1" value={price}
                  onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                  className="inline w-20 ml-1 text-right border border-gray-200 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/40"/>
              </p>
            </div>
            <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500">重置所有</button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ACTIVITIES.map(a => {
              const on = a.key in inputs
              const inp = inputs[a.key]
              return (
                <div key={a.key}
                  className={`rounded-xl border p-3 cursor-pointer transition-colors ${on ? 'border-[#5b5bd6] bg-[#5b5bd6]/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                  onClick={() => !on && toggleActivity(a.key)}>
                  <div className="flex items-start justify-between gap-1">
                    <label className="flex items-center gap-1.5 cursor-pointer flex-1" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={on} onChange={() => toggleActivity(a.key)} className="accent-[#5b5bd6] flex-shrink-0"/>
                      <span className={`text-xs font-medium leading-tight ${on ? 'text-[#5b5bd6]' : 'text-gray-600'}`}>{a.name}</span>
                    </label>
                  </div>
                  {on && inp && (
                    <div className="flex items-center gap-1 mt-2" onClick={e => e.stopPropagation()}>
                      <select value={inp.type}
                        onChange={e => updateInput(a.key, 'type', e.target.value)}
                        className="border border-gray-200 rounded px-1 py-0.5 text-xs focus:outline-none bg-white">
                        <option value="pct">% Off</option>
                        <option value="dollar">$ Off</option>
                      </select>
                      <input type="number" min="0" step="1" value={inp.value}
                        onChange={e => updateInput(a.key, 'value', parseFloat(e.target.value) || 0)}
                        className="w-14 text-right border border-gray-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/50"/>
                    </div>
                  )}
                  {!on && (
                    <p className="text-[10px] text-gray-400 mt-1 leading-tight line-clamp-2">{a.note}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Right: stacking analysis ─────────────────── */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">② 叠加逻辑检测</p>

          {hasSale && (
            <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600">
              首先应用价格折扣 ({fmtDisc(inputs.sale)})，后续所有活动在折后价基础上计算
            </div>
          )}

          {pairs.length === 0 && !enough && (
            <p className="text-sm text-gray-400 py-8 text-center">👈 请在左侧勾选至少两个活动</p>
          )}

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {pairs.map(({ a, b, rel, key }) => {
              const isYes = !!choiceYes[key]
              return (
                <div key={key} className={`rounded-lg border px-3 py-2 ${REL_STYLE[rel]}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">
                      {a.name} + {b.name}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${REL_STYLE[rel]}`}>
                        {REL_LABEL[rel]}
                      </span>
                      {rel === 'exclusive' && skippedKeys.has(a.key) && (
                        <span className="text-[10px] opacity-60">取 {b.short}</span>
                      )}
                      {rel === 'exclusive' && skippedKeys.has(b.key) && (
                        <span className="text-[10px] opacity-60">取 {a.short}</span>
                      )}
                    </div>
                  </div>
                  {rel === 'choice' && (
                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-current/10">
                      <span className="text-[11px] opacity-70">允许叠加使用?</span>
                      <label className="flex items-center gap-1.5 cursor-pointer" onClick={e => e.stopPropagation()}>
                        <span className={`text-[10px] font-medium ${isYes ? 'text-[#5b5bd6]' : 'opacity-50'}`}>
                          {isYes ? '是 (YES)' : '否 (NO)'}
                        </span>
                        <div
                          onClick={() => setChoiceYes(p => ({ ...p, [key]: !isYes }))}
                          className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${isYes ? 'bg-[#5b5bd6]' : 'bg-gray-300'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${isYes ? 'translate-x-4' : 'translate-x-0.5'}`}/>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Result */}
          {enough && (
            <div className="bg-gray-900 rounded-xl p-4 text-white space-y-2">
              <div className="flex gap-1 flex-wrap pb-2 border-b border-gray-700">
                {steps.filter(s => !s.skipped).map((s, i) => (
                  <div key={s.key} className="flex items-center gap-1">
                    {i > 0 && <span className="text-gray-600 text-xs">→</span>}
                    <div className="flex flex-col items-center bg-gray-800 rounded-lg px-2 py-1 min-w-[40px]">
                      <span className="text-gray-200 text-xs font-semibold">{fmtDisc(s.inp)}</span>
                      <span className="text-gray-500 text-[9px] leading-tight">{s.short}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">实际扣除金额</span>
                <span className="text-gray-200">-${saved.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-gray-400 text-sm">预估最终售价</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${finalPrice.toFixed(2)}</div>
                  <div className="text-xs text-orange-400">{totalDiscount.toFixed(0)}% off</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Rules section ─────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
          <p className="font-semibold text-amber-700">⚡ 核心建议</p>
          <p className="text-amber-600">建议在同一时间段，对同一 ASIN，只选择一种促销类型，优先选择价格折扣上去。</p>
          <div className="space-y-1 mt-2 text-gray-600">
            <p className="font-medium">各类促销说明：</p>
            <p>· <strong>秒杀</strong>：折扣/买赠 | 实现 BxGy</p>
            <p>· <strong>促销-无限制型</strong>：买家可针对同一订单使用两种不同的无限制促销折扣或优惠（叠加）</p>
            <p>· <strong>促销-优先型</strong>：买家只针对同一订单使用折扣更优惠的促销活动（不叠加）</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
          <p className="font-semibold text-blue-700">关于「可自主选择」的叠加说明</p>
          <p>只有当优惠券和促销（一一对应）都选择「是，允许叠加使用」时，促销才会叠加使用，否则的话，系统会在两个优惠中取优惠更大的那一个。</p>
          <p className="font-semibold text-blue-700 mt-2">本工具计算逻辑说明</p>
          <p>· <strong>优先扣减折扣</strong>：首先应用&ldquo;价格折扣&rdquo;(Price Discount)以确定基础折扣价格。</p>
          <p>· <strong>优惠券折扣</strong>：随后的优惠券和其他促销活动通常是在上一步的价格折扣活动基础上进行计算，多张优惠券取折扣比例最大的（取 10%+20%+30% 总折比例）。</p>
          <p className="text-orange-500 mt-1">⚠ 注：计算金额仅供参考，实际金额请以亚马逊后台最终结算为准。</p>
        </div>
      </div>
    </ToolLayout>
  )
}
