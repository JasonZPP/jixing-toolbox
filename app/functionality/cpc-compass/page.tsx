'use client'
import { useState, useEffect } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { calcFbaUs, getSizeStandard } from '@/lib/calc/fba-us'
import { Save, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

interface Category { name: string; rate: number }
const CATEGORIES: Category[] = [
  { name: '家居及厨房用品', rate: 0.15 },
  { name: '运动户外', rate: 0.15 },
  { name: '玩具和游戏', rate: 0.15 },
  { name: '工具和家居装修', rate: 0.15 },
  { name: '办公用品', rate: 0.15 },
  { name: '宠物用品', rate: 0.15 },
  { name: '家具', rate: 0.15 },
  { name: '草坪和园艺', rate: 0.15 },
  { name: '服装', rate: 0.17 },
  { name: '鞋靴', rate: 0.15 },
  { name: '电子产品配件', rate: 0.15 },
  { name: '消费类电子产品', rate: 0.08 },
  { name: '电脑', rate: 0.08 },
  { name: '珠宝首饰', rate: 0.20 },
  { name: '钟表', rate: 0.16 },
  { name: '食品', rate: 0.15 },
  { name: '其他', rate: 0.15 },
]

interface Strategy { name: string; factor: number; emoji: string; note: string }
const STRATEGIES: Strategy[] = [
  { name: '新品冲榜', factor: 1.0, emoji: '🚀', note: '允许阶段性亏损抢排名' },
  { name: '稳健增长', factor: 0.7, emoji: '📈', note: '兼顾排名与利润' },
  { name: '利润收割', factor: 0.4, emoji: '💰', note: '保利润为先' },
  { name: '清仓回款', factor: 1.2, emoji: '💸', note: '加速回款可接受亏损' },
]

const SIZE_LABEL: Record<string, string> = {
  'Small Standard': '小号标准尺寸',
  'Large Standard': '大号标准尺寸',
  'Large Bulky': '大号大件',
  'Extra Large': '超大件',
}

type FbaMode = 'auto' | 'manual'

interface CalcRecord {
  id: string
  name: string
  savedAt: string
  cost: number; shipping: number; categoryIdx: number; price: number
  returnRate: number; returnFee: number; rate: number; cvr: number; targetAcos: number
  fbaMode: FbaMode; manualFba: number
  length: number; width: number; height: number; weightG: number; isPeak: boolean
  grossMargin: number; netProfit: number; recommendedCpc: number
}

const STORAGE_KEY = 'cpc_compass_records_v1'

function loadRecords(): CalcRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

export default function CpcCompassPage() {
  const [cost, setCost] = useState(8)
  const [shipping, setShipping] = useState(1.5)
  const [categoryIdx, setCategoryIdx] = useState(0)
  const [price, setPrice] = useState(29.99)
  const [returnRate, setReturnRate] = useState(5)
  const [returnFee, setReturnFee] = useState(3)
  const [rate, setRate] = useState(7.25)
  const [cvr, setCvr] = useState(10)
  const [targetAcos, setTargetAcos] = useState(20)

  const [fbaMode, setFbaMode] = useState<FbaMode>('auto')
  const [manualFba, setManualFba] = useState(5.5)
  const [length, setLength] = useState(20)
  const [width, setWidth] = useState(15)
  const [height, setHeight] = useState(5)
  const [weightG, setWeightG] = useState(300)
  const [isPeak, setIsPeak] = useState(false)

  const [records, setRecords] = useState<CalcRecord[]>([])
  const [showRecords, setShowRecords] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)

  useEffect(() => { setRecords(loadRecords()) }, [])

  const weightOz = weightG / 28.35
  const lengthIn = length / 2.54
  const widthIn = width / 2.54
  const heightIn = height / 2.54
  const sizeTier = getSizeStandard({ weightOz, lengthIn, widthIn, heightIn })
  const autoFba = calcFbaUs({ weightOz, lengthIn, widthIn, heightIn, year: 2026, isPeak })
  const fbaFee = fbaMode === 'auto' ? autoFba : manualFba

  const commRate = CATEGORIES[categoryIdx].rate
  const commission = price * commRate
  const rr = returnRate / 100
  const cvrFrac = cvr / 100

  const purchaseUSD = cost / rate
  const shippingUSD = shipping / rate
  const grossMargin = price * (1 - rr) - purchaseUSD - shippingUSD - fbaFee - commission - rr * returnFee
  const marginRate = price > 0 ? grossMargin / price : 0

  const breakevenAcos = price > 0 ? grossMargin / price : 0
  const breakevenClicks = cvrFrac > 0 ? 1 / cvrFrac : 0
  const recommendedCpc = (targetAcos / 100) * price * cvrFrac
  const safeCpc = breakevenAcos * price * cvrFrac
  const adCostPerSale = (targetAcos / 100) * price
  const netProfit = grossMargin - adCostPerSale
  const netMarginRate = price > 0 ? netProfit / price : 0
  const minCvr = price > 0 && recommendedCpc > 0 ? (recommendedCpc / ((targetAcos / 100) * price)) * 100 : 0

  const applyStrategy = (s: Strategy) => setTargetAcos(Math.max(0, marginRate * 100 * s.factor))

  const saveRecord = () => {
    const name = saveName.trim() || `记录 ${new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`
    const rec: CalcRecord = {
      id: Date.now().toString(),
      name,
      savedAt: new Date().toLocaleString('zh-CN'),
      cost, shipping, categoryIdx, price, returnRate, returnFee, rate, cvr, targetAcos,
      fbaMode, manualFba, length, width, height, weightG, isPeak,
      grossMargin, netProfit, recommendedCpc,
    }
    const next = [rec, ...records].slice(0, 30)
    setRecords(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSaveName('')
    setShowSaveInput(false)
    setShowRecords(true)
  }

  const loadRecord = (r: CalcRecord) => {
    setCost(r.cost); setShipping(r.shipping); setCategoryIdx(r.categoryIdx); setPrice(r.price)
    setReturnRate(r.returnRate); setReturnFee(r.returnFee); setRate(r.rate); setCvr(r.cvr)
    setTargetAcos(r.targetAcos); setFbaMode(r.fbaMode); setManualFba(r.manualFba)
    setLength(r.length); setWidth(r.width); setHeight(r.height); setWeightG(r.weightG)
    setIsPeak(r.isPeak)
    setShowRecords(false)
  }

  const deleteRecord = (id: string) => {
    const next = records.filter(r => r.id !== id)
    setRecords(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const ic = 'w-32 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40'
  const icSm = 'w-20 text-right border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40'

  return (
    <ToolLayout title="CPC利润测算" description="综合采购、头程、FBA、佣金、退货损失，反推目标CPC与盈亏平衡点">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">产品基础档案</h3>
            <div className="flex items-center justify-between"><label className="text-sm text-gray-600">采购成本 (¥)</label><input type="number" min="0" step="0.5" value={cost} onChange={e => setCost(parseFloat(e.target.value) || 0)} className={ic}/></div>
            <div className="flex items-center justify-between"><label className="text-sm text-gray-600">头程运费 (¥)</label><input type="number" min="0" step="0.5" value={shipping} onChange={e => setShipping(parseFloat(e.target.value) || 0)} className={ic}/></div>
            <div className="flex items-center justify-between"><label className="text-sm text-gray-600">汇率 (USD/RMB)</label><input type="number" min="1" step="0.01" value={rate} onChange={e => setRate(parseFloat(e.target.value) || 7.25)} className={ic}/></div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">产品类目（决定佣金）</label>
              <select value={categoryIdx} onChange={e => setCategoryIdx(parseInt(e.target.value))}
                className="w-44 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40">
                {CATEGORIES.map((c, i) => <option key={c.name} value={i}>{c.name}（{(c.rate * 100).toFixed(0)}%）</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between"><label className="text-sm text-gray-600">售价 ($)</label><input type="number" min="0" step="0.5" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} className={ic}/></div>
            <div className="flex items-center justify-between"><label className="text-sm text-gray-600">退货率 (%)</label><input type="number" min="0" step="0.5" value={returnRate} onChange={e => setReturnRate(parseFloat(e.target.value) || 0)} className={ic}/></div>
            <div className="flex items-center justify-between"><label className="text-sm text-gray-600">每单退货杂费 ($)</label><input type="number" min="0" step="0.5" value={returnFee} onChange={e => setReturnFee(parseFloat(e.target.value) || 0)} className={ic}/></div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">FBA 配送费</h3>
              <div className="flex gap-1">
                {([['auto', '按尺寸自动测算'], ['manual', '手动输入']] as [FbaMode, string][]).map(([m, l]) => (
                  <button key={m} onClick={() => setFbaMode(m as FbaMode)}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${fbaMode === m ? 'bg-[#5b5bd6] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>{l}</button>
                ))}
              </div>
            </div>
            {fbaMode === 'auto' ? (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {([['长cm', length, setLength], ['宽cm', width, setWidth], ['高cm', height, setHeight], ['重量g', weightG, setWeightG]] as [string, number, React.Dispatch<React.SetStateAction<number>>][]).map(([l, v, s]) => (
                    <div key={l}>
                      <label className="text-xs text-gray-500 block mb-1">{l}</label>
                      <input type="number" min="0" step="1" value={v} onChange={e => s(parseFloat(e.target.value) || 0)} className={icSm + ' w-full'}/>
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={isPeak} onChange={e => setIsPeak(e.target.checked)}/> 旺季配送（含旺季附加费）
                </label>
                <div className="flex justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-gray-500">尺寸分段：{SIZE_LABEL[sizeTier] || sizeTier}</span>
                  <span className="font-semibold text-[#5b5bd6]">FBA ${autoFba.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">FBA配送费 ($)</label>
                <input type="number" min="0" step="0.1" value={manualFba} onChange={e => setManualFba(parseFloat(e.target.value) || 0)} className={ic}/>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">广告参数</h3>
            <div className="flex items-center justify-between"><label className="text-sm text-gray-600">预估转化率 CVR (%)</label><input type="number" min="0.1" step="0.5" value={cvr} onChange={e => setCvr(parseFloat(e.target.value) || 0.1)} className={ic}/></div>
            <div className="flex items-center justify-between"><label className="text-sm text-gray-600">目标 ACOS (%)</label><input type="number" min="0" step="1" value={targetAcos} onChange={e => setTargetAcos(parseFloat(e.target.value) || 0)} className={ic}/></div>
            <div>
              <label className="text-xs text-gray-500 block mb-2">推广阶段策略（自动设定目标 ACOS = 毛利率 × 系数）</label>
              <div className="grid grid-cols-2 gap-2">
                {STRATEGIES.map(s => (
                  <button key={s.name} onClick={() => applyStrategy(s)}
                    className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-[#5b5bd6]/10 transition-colors">
                    <span className="text-sm font-medium text-gray-700">{s.emoji} {s.name}</span>
                    <span className="block text-xs text-gray-400">{s.note}（{(s.factor * 100).toFixed(0)}%）</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">利润测算</h3>
            <div className="space-y-1.5">
              {([
                ['售价', `$${price.toFixed(2)}`, ''],
                ['采购+头程', `-$${(purchaseUSD + shippingUSD).toFixed(2)}`, 'text-gray-500'],
                [`平台佣金（${(commRate * 100).toFixed(0)}%）`, `-$${commission.toFixed(2)}`, 'text-gray-500'],
                ['FBA配送费', `-$${fbaFee.toFixed(2)}`, 'text-gray-500'],
                [`退货损失（${returnRate}%）`, `-$${(price * rr + rr * returnFee).toFixed(2)}`, 'text-gray-500'],
                ['有效毛利', `$${grossMargin.toFixed(2)}`, grossMargin >= 0 ? 'text-gray-800 font-semibold' : 'text-red-500 font-semibold'],
                ['毛利率', `${(marginRate * 100).toFixed(1)}%`, 'text-gray-800 font-semibold'],
              ] as [string, string, string][]).map(([k, v, cls]) => (
                <div key={k} className="flex justify-between text-sm border-b border-gray-50 pb-1.5">
                  <span className="text-gray-600">{k}</span>
                  <span className={cls || 'text-gray-700'}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#5b5bd6]/5 border border-[#5b5bd6]/20 rounded-xl p-5">
            <h3 className="text-sm font-bold text-[#5b5bd6] mb-3">反推 CPC & 综合利润</h3>
            <div className="space-y-1.5">
              {([
                ['盈亏平衡 ACOS', `${(breakevenAcos * 100).toFixed(1)}%`],
                ['不亏本点击数（每单）', `${breakevenClicks.toFixed(1)} 次`],
                ['安全 CPC（保本上限）', `$${safeCpc.toFixed(2)}`],
                [`建议 CPC（目标ACOS ${targetAcos}%）`, `$${recommendedCpc.toFixed(2)}`],
                ['最低保本转化率', `${minCvr > 0 && isFinite(minCvr) ? minCvr.toFixed(1) : '0.0'}%`],
                ['每单广告花费', `$${adCostPerSale.toFixed(2)}`],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm border-b border-[#5b5bd6]/10 pb-1.5">
                  <span className="text-gray-600">{k}</span>
                  <span className="font-semibold text-gray-800">{v}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm pt-1">
                <span className="text-gray-600">综合利润 / 利润率</span>
                <span className={`font-bold ${netProfit >= 0 ? 'text-[#5b5bd6]' : 'text-red-500'}`}>
                  ${netProfit.toFixed(2)} / {(netMarginRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            {grossMargin <= 0 && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg p-3">
                基础毛利已为负，请检查成本或定价 —— 此时任何广告投放都会扩大亏损。
              </p>
            )}
            {grossMargin > 0 && netProfit < 0 && (
              <p className="mt-3 text-xs text-orange-600 bg-orange-50 rounded-lg p-3">
                综合利润为负：目标 ACOS {targetAcos}% 已超过盈亏平衡 ACOS {(breakevenAcos * 100).toFixed(1)}%，广告花费过高。
              </p>
            )}
          </div>

          {/* 测算记录管理 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-[#5b5bd6]"/>
                测算记录管理
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setShowSaveInput(v => !v)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5b5bd6] text-white text-xs font-medium hover:bg-[#4a4abf] transition-colors">
                  <Save className="h-3.5 w-3.5"/> 保存当前
                </button>
                {records.length > 0 && (
                  <button onClick={() => setShowRecords(v => !v)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-gray-600 text-xs font-medium hover:bg-slate-200 transition-colors">
                    {showRecords ? <ChevronUp className="h-3.5 w-3.5"/> : <ChevronDown className="h-3.5 w-3.5"/>}
                    {records.length} 条记录
                  </button>
                )}
              </div>
            </div>

            {showSaveInput && (
              <div className="flex gap-2 mb-3">
                <input
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveRecord()}
                  placeholder="输入记录名称（可选）"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"
                  autoFocus
                />
                <button onClick={saveRecord}
                  className="px-4 py-2 rounded-lg bg-[#5b5bd6] text-white text-sm font-medium hover:bg-[#4a4abf]">
                  确认保存
                </button>
                <button onClick={() => { setShowSaveInput(false); setSaveName('') }}
                  className="px-3 py-2 rounded-lg bg-slate-100 text-gray-600 text-sm hover:bg-slate-200">
                  取消
                </button>
              </div>
            )}

            {showRecords && records.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {records.map(r => (
                  <div key={r.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5 hover:bg-[#5b5bd6]/5 transition-colors">
                    <button onClick={() => loadRecord(r)} className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-700">{r.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        售价 ${r.price} · 毛利 ${r.grossMargin.toFixed(2)} · CPC ${r.recommendedCpc.toFixed(2)} · {r.savedAt}
                      </p>
                    </button>
                    <button onClick={() => deleteRecord(r.id)}
                      className="ml-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="h-4 w-4"/>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {records.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3">暂无保存记录，点击「保存当前」将当前测算存档</p>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
