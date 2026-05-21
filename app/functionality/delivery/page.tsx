'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { calcFbaUs, getSizeStandard } from '@/lib/calc/fba-us'

const CATEGORIES: { name: string; rate: number }[] = [
  { name: '家居及厨房用品', rate: 0.15 },
  { name: '运动户外', rate: 0.15 },
  { name: '玩具和游戏', rate: 0.15 },
  { name: '工具和家居装修', rate: 0.15 },
  { name: '办公用品', rate: 0.15 },
  { name: '宠物用品', rate: 0.15 },
  { name: '服装', rate: 0.17 },
  { name: '消费类电子产品', rate: 0.08 },
  { name: '电子产品配件', rate: 0.15 },
  { name: '珠宝首饰', rate: 0.20 },
  { name: '其他', rate: 0.15 },
]

const SIZE_LABEL: Record<string, string> = {
  'Small Standard': '小号标准尺寸',
  'Large Standard': '大号标准尺寸',
  'Large Bulky': '大号大件',
  'Extra Large': '超大件',
}

export default function DeliveryPage() {
  const [weight, setWeight] = useState(8)
  const [wUnit, setWUnit] = useState<'oz' | 'g'>('oz')
  const [length, setLength] = useState(8)
  const [width, setWidth] = useState(5)
  const [height, setHeight] = useState(2)
  const [dimUnit, setDimUnit] = useState<'in' | 'cm'>('in')
  const [isPeak, setIsPeak] = useState(false)
  const [categoryIdx, setCategoryIdx] = useState(0)
  const [price, setPrice] = useState(29.99)
  const [cost, setCost] = useState(15)
  const [firstLeg, setFirstLeg] = useState(8)
  const [adCost, setAdCost] = useState(3)
  const [miscCost, setMiscCost] = useState(0)
  const [rate, setRate] = useState(7.25)
  const [returnRate, setReturnRate] = useState(5)
  const [unsellableRate, setUnsellableRate] = useState(50)

  const weightOz = wUnit === 'oz' ? weight : weight / 28.35
  const lengthIn = dimUnit === 'in' ? length : length / 2.54
  const widthIn = dimUnit === 'in' ? width : width / 2.54
  const heightIn = dimUnit === 'in' ? height : height / 2.54

  // 体积重 (oz): (L×W×H in inches) / 139 inch³-per-lb-equivalent → ×16 for oz; Amazon uses dim weight
  const dimWeightLb = (lengthIn * widthIn * heightIn) / 139
  const dimWeightOz = dimWeightLb * 16
  const shipWeightOz = Math.max(weightOz, dimWeightOz)

  const size = getSizeStandard({ weightOz: shipWeightOz, lengthIn, widthIn, heightIn })
  const fbaFee = calcFbaUs({ weightOz: shipWeightOz, lengthIn, widthIn, heightIn, year: 2026, isPeak })

  const commRate = CATEGORIES[categoryIdx].rate
  const commission = price * commRate
  const costUSD = cost / rate
  const firstLegUSD = firstLeg / rate
  const amazonFee = commission + fbaFee
  // 不可售损失：退货中无法二次销售的部分，损失其采购+头程成本
  const unsellableLoss = (returnRate / 100) * (unsellableRate / 100) * (costUSD + firstLegUSD)
  const netProfit = price - amazonFee - costUSD - firstLegUSD - adCost - miscCost - unsellableLoss
  const netMargin = price > 0 ? netProfit / price : 0

  const ic = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40'

  return (
    <ToolLayout title="美国站配送费计算" description="2026费率，按尺寸分段计算FBA配送费，综合采购/头程/广告测算利润">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">商品信息</h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-500">商品重量</label>
                <input type="number" min="0" step="0.1" value={weight} onChange={e => setWeight(parseFloat(e.target.value) || 0)} className={ic}/>
              </div>
              <select value={wUnit} onChange={e => setWUnit(e.target.value as 'oz' | 'g')} className="border border-gray-200 rounded-lg px-2 py-2 text-sm">
                <option value="oz">oz</option>
                <option value="g">克 g</option>
              </select>
            </div>
            <div className="flex gap-2 items-end">
              {([['长', length, setLength], ['宽', width, setWidth], ['高', height, setHeight]] as [string, number, React.Dispatch<React.SetStateAction<number>>][]).map(([l, v, s]) => (
                <div key={l} className="flex-1">
                  <label className="text-xs text-gray-500">{l}</label>
                  <input type="number" min="0" step="0.1" value={v} onChange={e => s(parseFloat(e.target.value) || 0)} className={ic}/>
                </div>
              ))}
              <select value={dimUnit} onChange={e => setDimUnit(e.target.value as 'in' | 'cm')} className="border border-gray-200 rounded-lg px-2 py-2 text-sm">
                <option value="in">英寸</option>
                <option value="cm">cm</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">商品类目（决定佣金率）</label>
              <select value={categoryIdx} onChange={e => setCategoryIdx(parseInt(e.target.value))} className={ic}>
                {CATEGORIES.map((c, i) => <option key={c.name} value={i}>{c.name}（{(c.rate * 100).toFixed(0)}%）</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={isPeak} onChange={e => setIsPeak(e.target.checked)}/>
              旺季配送（10月中 - 1月中，含旺季附加费）
            </label>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">成本与售价</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">售价 ($)</label><input type="number" min="0" step="0.5" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} className={ic}/></div>
              <div><label className="text-xs text-gray-500">汇率 (¥/$)</label><input type="number" min="1" step="0.01" value={rate} onChange={e => setRate(parseFloat(e.target.value) || 7.25)} className={ic}/></div>
              <div><label className="text-xs text-gray-500">采购成本 (¥)</label><input type="number" min="0" step="0.5" value={cost} onChange={e => setCost(parseFloat(e.target.value) || 0)} className={ic}/></div>
              <div><label className="text-xs text-gray-500">头程运费 (¥/件)</label><input type="number" min="0" step="0.5" value={firstLeg} onChange={e => setFirstLeg(parseFloat(e.target.value) || 0)} className={ic}/></div>
              <div><label className="text-xs text-gray-500">每单广告费 ($)</label><input type="number" min="0" step="0.5" value={adCost} onChange={e => setAdCost(parseFloat(e.target.value) || 0)} className={ic}/></div>
              <div><label className="text-xs text-gray-500">其他杂费 ($)</label><input type="number" min="0" step="0.5" value={miscCost} onChange={e => setMiscCost(parseFloat(e.target.value) || 0)} className={ic}/></div>
              <div><label className="text-xs text-gray-500">退货率 (%)</label><input type="number" min="0" step="0.5" value={returnRate} onChange={e => setReturnRate(parseFloat(e.target.value) || 0)} className={ic}/></div>
              <div><label className="text-xs text-gray-500">退货不可售比例 (%)</label><input type="number" min="0" max="100" step="5" value={unsellableRate} onChange={e => setUnsellableRate(parseFloat(e.target.value) || 0)} className={ic}/></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">尺寸与配送费</h3>
            <div className="space-y-1.5">
              {([
                ['尺寸分段', SIZE_LABEL[size] || size],
                ['实际重量', `${weightOz.toFixed(2)} oz`],
                ['体积重量', `${dimWeightOz.toFixed(2)} oz`],
                ['计费重量（取大值）', `${shipWeightOz.toFixed(2)} oz`],
                ['FBA配送费（含燃油附加费）', `$${fbaFee.toFixed(2)}`],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm border-b border-gray-50 pb-1.5">
                  <span className="text-gray-600">{k}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#5b5bd6]/5 border border-[#5b5bd6]/20 rounded-xl p-5">
            <h3 className="text-sm font-bold text-[#5b5bd6] mb-3">利润分析</h3>
            <div className="space-y-1.5">
              {([
                ['总售价', `$${price.toFixed(2)}`, 'text-gray-700'],
                [`平台佣金（${(commRate * 100).toFixed(0)}%）`, `-$${commission.toFixed(2)}`, 'text-gray-500'],
                ['FBA配送费', `-$${fbaFee.toFixed(2)}`, 'text-gray-500'],
                ['采购成本', `-$${costUSD.toFixed(2)}`, 'text-gray-500'],
                ['头程运费', `-$${firstLegUSD.toFixed(2)}`, 'text-gray-500'],
                ['广告费', `-$${adCost.toFixed(2)}`, 'text-gray-500'],
                ['其他杂费', `-$${miscCost.toFixed(2)}`, 'text-gray-500'],
                [`不可售损失（退货${returnRate}%×不可售${unsellableRate}%）`, `-$${unsellableLoss.toFixed(2)}`, 'text-gray-500'],
              ] as [string, string, string][]).map(([k, v, cls]) => (
                <div key={k} className="flex justify-between text-sm border-b border-[#5b5bd6]/10 pb-1.5">
                  <span className="text-gray-600">{k}</span>
                  <span className={cls}>{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-1">
                <span className="text-sm text-gray-600">净利润 / 净利率</span>
                <span className={`text-base font-bold ${netProfit >= 0 ? 'text-[#5b5bd6]' : 'text-red-500'}`}>
                  ${netProfit.toFixed(2)} · {(netMargin * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">人民币净利润</span>
                <span className={`text-sm font-semibold ${netProfit >= 0 ? 'text-gray-800' : 'text-red-500'}`}>
                  ¥{(netProfit * rate).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
