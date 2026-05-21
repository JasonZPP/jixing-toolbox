'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'

type Mode = 'smart' | 'known'
const VOL_DIVS: number[] = [5000, 6000, 8000]

function getOrientations(pL: number, pW: number, pH: number, cL: number, cW: number, cH: number) {
  const perms: [number, number, number][] = [
    [pL, pW, pH], [pL, pH, pW], [pW, pL, pH],
    [pW, pH, pL], [pH, pL, pW], [pH, pW, pL],
  ]
  return perms.map(([a, b, c]) => ({
    label: `${a}×${b}×${c}`,
    qty: Math.floor(cL / a) * Math.floor(cW / b) * Math.floor(cH / c),
  })).sort((a, b) => b.qty - a.qty)
}

export default function CartonCalcPage() {
  const [mode, setMode] = useState<Mode>('smart')
  const [pL, setPL] = useState(10)
  const [pW, setPW] = useState(8)
  const [pH, setPH] = useState(4)
  const [pWt, setPWt] = useState(0.3)
  const [cL, setCL] = useState(40)
  const [cW, setCW] = useState(30)
  const [cH, setCH] = useState(25)
  const [cWt, setCWt] = useState(1.0)
  const [totalQty, setTotalQty] = useState(50)
  const [knownCartons, setKnownCartons] = useState(5)
  const [volDiv, setVolDiv] = useState(6000)
  const [customDiv, setCustomDiv] = useState(6000)

  const activeDiv = VOL_DIVS.includes(volDiv) ? volDiv : customDiv
  const cartonVolWt = (cL * cW * cH) / activeDiv
  const orientations = getOrientations(pL, pW, pH, cL, cW, cH)
  const best = orientations[0]
  const smartCartons = best && best.qty > 0 ? Math.ceil(totalQty / best.qty) : 0
  const qtyPerCarton = knownCartons > 0 ? Math.floor(totalQty / knownCartons) : 0
  const remainder = totalQty % knownCartons

  const ic = 'w-28 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40'

  return (
    <ToolLayout title="外箱装箱计算器" description="6方向智能测算最优装箱方案，含体积重计算">
      <div className="space-y-5">
        <div className="flex gap-2">
          {([['smart', '智能测算箱数'], ['known', '已知箱数分配']] as [Mode, string][]).map(([m, l]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-[#5b5bd6] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#5b5bd6]/40'}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">产品尺寸 (cm) & 重量</h3>
              <div className="flex justify-between items-center"><label className="text-sm text-gray-600">长</label><input type="number" min="0.1" step="0.1" value={pL} onChange={e => setPL(parseFloat(e.target.value) || 0)} className={ic}/></div>
              <div className="flex justify-between items-center"><label className="text-sm text-gray-600">宽</label><input type="number" min="0.1" step="0.1" value={pW} onChange={e => setPW(parseFloat(e.target.value) || 0)} className={ic}/></div>
              <div className="flex justify-between items-center"><label className="text-sm text-gray-600">高</label><input type="number" min="0.1" step="0.1" value={pH} onChange={e => setPH(parseFloat(e.target.value) || 0)} className={ic}/></div>
              <div className="flex justify-between items-center"><label className="text-sm text-gray-600">单件重量 (kg)</label><input type="number" min="0" step="0.01" value={pWt} onChange={e => setPWt(parseFloat(e.target.value) || 0)} className={ic}/></div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">外箱尺寸 (cm) & 重量</h3>
              <div className="flex justify-between items-center"><label className="text-sm text-gray-600">长</label><input type="number" min="0.1" step="0.1" value={cL} onChange={e => setCL(parseFloat(e.target.value) || 0)} className={ic}/></div>
              <div className="flex justify-between items-center"><label className="text-sm text-gray-600">宽</label><input type="number" min="0.1" step="0.1" value={cW} onChange={e => setCW(parseFloat(e.target.value) || 0)} className={ic}/></div>
              <div className="flex justify-between items-center"><label className="text-sm text-gray-600">高</label><input type="number" min="0.1" step="0.1" value={cH} onChange={e => setCH(parseFloat(e.target.value) || 0)} className={ic}/></div>
              <div className="flex justify-between items-center"><label className="text-sm text-gray-600">箱皮重量 (kg)</label><input type="number" min="0" step="0.1" value={cWt} onChange={e => setCWt(parseFloat(e.target.value) || 0)} className={ic}/></div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-600">总发货数量</label>
                <input type="number" min="1" value={totalQty} onChange={e => setTotalQty(parseInt(e.target.value) || 1)} className={ic}/>
              </div>
              {mode === 'known' && (
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">已知箱数</label>
                  <input type="number" min="1" value={knownCartons} onChange={e => setKnownCartons(parseInt(e.target.value) || 1)} className={ic}/>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-600 block mb-2">体积重除数</label>
                <div className="flex gap-2 flex-wrap">
                  {VOL_DIVS.map(d => (
                    <button key={d} onClick={() => setVolDiv(d)}
                      className={`px-3 py-1.5 rounded text-sm font-medium ${volDiv === d ? 'bg-[#5b5bd6] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>{d}</button>
                  ))}
                  <button onClick={() => setVolDiv(0)}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${!VOL_DIVS.includes(volDiv) ? 'bg-[#5b5bd6] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>自定义</button>
                </div>
                {!VOL_DIVS.includes(volDiv) && (
                  <input type="number" min="1000" step="100" value={customDiv}
                    onChange={e => setCustomDiv(parseInt(e.target.value) || 6000)}
                    className="mt-2 w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {mode === 'smart' ? (
              <>
                {best && best.qty > 0 ? (
                  <div className="bg-[#5b5bd6]/5 border border-[#5b5bd6]/20 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-[#5b5bd6] mb-3">最优方案</h3>
                    <div className="space-y-2">
                      {([
                        ['最优装箱方向', `${best.label} cm`],
                        ['每箱数量', `${best.qty} 件`],
                        ['需要箱数', `${smartCartons} 箱`],
                        ['外箱体积重', `${cartonVolWt.toFixed(2)} kg（÷${activeDiv}）`],
                        ['每箱毛重', `${(cWt + best.qty * pWt).toFixed(2)} kg`],
                        ['总毛重', `${(smartCartons * (cWt + best.qty * pWt)).toFixed(2)} kg`],
                      ] as [string, string][]).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm border-b border-[#5b5bd6]/10 pb-2">
                          <span className="text-gray-600">{k}</span>
                          <span className="font-semibold text-gray-800">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-600">
                    任何方向均无法装入外箱，请检查尺寸是否正确（单位：cm）。
                  </div>
                )}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">全部6种装箱方向对比</h3>
                  <div className="space-y-1">
                    {orientations.map((r, i) => (
                      <div key={i} className={`flex justify-between py-1.5 border-b border-gray-50 text-sm ${i === 0 && r.qty > 0 ? 'text-[#5b5bd6] font-semibold' : r.qty === 0 ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className="font-mono text-xs">{r.label} cm</span>
                        <span>{r.qty > 0 ? `${r.qty} 件/箱${i === 0 ? ' ✓ 最优' : ''}` : '装不下'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">装箱结果</h3>
                <div className="space-y-2">
                  {([
                    ['总发货数量', `${totalQty} 件`],
                    ['已知箱数', `${knownCartons} 箱`],
                    ['每箱数量（整除）', `${qtyPerCarton} 件`],
                    ['余件（最后一箱）', `${remainder} 件`],
                    ['外箱体积重', `${cartonVolWt.toFixed(2)} kg（÷${activeDiv}）`],
                    ['每箱毛重', `${(cWt + qtyPerCarton * pWt).toFixed(2)} kg`],
                    ['总毛重', `${(knownCartons * (cWt + qtyPerCarton * pWt)).toFixed(2)} kg`],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                      <span className="text-gray-600">{k}</span>
                      <span className="font-semibold text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
