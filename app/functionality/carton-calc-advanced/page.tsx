'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Plus, Trash2 } from 'lucide-react'

type Mode = 'smart' | 'known' | 'multi'
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

interface MultiProduct {
  id: number
  name: string
  pL: number; pW: number; pH: number; pWt: number
  qty: number
}

let nextId = 1

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

  // multi mode state
  const [multiCL, setMultiCL] = useState(60)
  const [multiCW, setMultiCW] = useState(40)
  const [multiCH, setMultiCH] = useState(35)
  const [multiCWt, setMultiCWt] = useState(1.5)
  const [multiVolDiv, setMultiVolDiv] = useState(6000)
  const [multiCustomDiv, setMultiCustomDiv] = useState(6000)
  const [products, setProducts] = useState<MultiProduct[]>([
    { id: nextId++, name: '产品 A', pL: 20, pW: 15, pH: 8, pWt: 0.5, qty: 30 },
    { id: nextId++, name: '产品 B', pL: 12, pW: 10, pH: 6, pWt: 0.3, qty: 20 },
  ])

  const activeDiv = VOL_DIVS.includes(volDiv) ? volDiv : customDiv
  const cartonVolWt = (cL * cW * cH) / activeDiv
  const orientations = getOrientations(pL, pW, pH, cL, cW, cH)
  const best = orientations[0]
  const smartCartons = best && best.qty > 0 ? Math.ceil(totalQty / best.qty) : 0
  const qtyPerCarton = knownCartons > 0 ? Math.floor(totalQty / knownCartons) : 0
  const remainder = totalQty % knownCartons

  const addProduct = () => {
    setProducts(p => [...p, { id: nextId++, name: `产品 ${String.fromCharCode(65 + p.length)}`, pL: 15, pW: 10, pH: 8, pWt: 0.3, qty: 20 }])
  }
  const removeProduct = (id: number) => setProducts(p => p.filter(x => x.id !== id))
  const updateProduct = (id: number, field: keyof MultiProduct, value: string | number) => {
    setProducts(p => p.map(x => x.id === id ? { ...x, [field]: value } : x))
  }

  const multiActiveDiv = VOL_DIVS.includes(multiVolDiv) ? multiVolDiv : multiCustomDiv
  const multiCartonVol = multiCL * multiCW * multiCH
  const multiCartonVolWt = multiCartonVol / multiActiveDiv

  interface MultiResult {
    name: string; pL: number; pW: number; pH: number; qty: number; pWt: number
    bestLabel: string; perCarton: number; cartons: number; totalWt: number
  }
  const multiResults: MultiResult[] = products.map(p => {
    const ors = getOrientations(p.pL, p.pW, p.pH, multiCL, multiCW, multiCH)
    const b = ors[0]
    const perCarton = b ? b.qty : 0
    const cartons = perCarton > 0 ? Math.ceil(p.qty / perCarton) : 0
    const totalWt = cartons > 0 ? cartons * (multiCWt + perCarton * p.pWt) : 0
    return { name: p.name, pL: p.pL, pW: p.pW, pH: p.pH, qty: p.qty, pWt: p.pWt, bestLabel: b ? b.label : '—', perCarton, cartons, totalWt }
  })
  const totalCartons = multiResults.reduce((s, r) => s + r.cartons, 0)
  const totalGrossWt = multiResults.reduce((s, r) => s + r.totalWt, 0)

  const ic = 'w-28 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40'
  const icNarrow = 'w-20 text-right border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40'

  return (
    <ToolLayout title="外箱装箱计算器" description="6方向智能测算最优装箱方案，支持多品混装最优方案">
      <div className="space-y-5">
        <div className="flex gap-2 flex-wrap">
          {([['smart', '智能测算箱数'], ['known', '已知箱数分配'], ['multi', '多品最优装箱']] as [Mode, string][]).map(([m, l]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-[#5b5bd6] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#5b5bd6]/40'}`}>
              {l}
            </button>
          ))}
        </div>

        {mode !== 'multi' ? (
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
        ) : (
          /* Multi-product mode */
          <div className="space-y-5">
            {/* Shared carton size */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">共用外箱规格</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {([['外箱长 (cm)', multiCL, setMultiCL], ['外箱宽 (cm)', multiCW, setMultiCW], ['外箱高 (cm)', multiCH, setMultiCH], ['箱皮重量 (kg)', multiCWt, setMultiCWt]] as [string, number, React.Dispatch<React.SetStateAction<number>>][]).map(([label, val, setter]) => (
                  <div key={label}>
                    <label className="text-xs text-gray-500 block mb-1">{label}</label>
                    <input type="number" min="0.1" step="0.1" value={val}
                      onChange={e => setter(parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs text-gray-500">体积重除数</label>
                <div className="flex gap-1.5 flex-wrap">
                  {VOL_DIVS.map(d => (
                    <button key={d} onClick={() => setMultiVolDiv(d)}
                      className={`px-2.5 py-1 rounded text-xs font-medium ${multiVolDiv === d ? 'bg-[#5b5bd6] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>{d}</button>
                  ))}
                  <button onClick={() => setMultiVolDiv(0)}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${!VOL_DIVS.includes(multiVolDiv) ? 'bg-[#5b5bd6] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>自定义</button>
                  {!VOL_DIVS.includes(multiVolDiv) && (
                    <input type="number" min="1000" step="100" value={multiCustomDiv}
                      onChange={e => setMultiCustomDiv(parseInt(e.target.value) || 6000)}
                      className="w-24 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
                  )}
                </div>
              </div>
            </div>

            {/* Product list */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">产品列表（各自独立装箱）</h3>
                <button onClick={addProduct}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5b5bd6] text-white text-xs font-medium hover:bg-[#4a4abf] transition-colors">
                  <Plus className="h-3.5 w-3.5"/> 添加产品
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-100">
                      <th className="text-left pb-2 font-medium">产品名</th>
                      <th className="text-center pb-2 font-medium">长(cm)</th>
                      <th className="text-center pb-2 font-medium">宽(cm)</th>
                      <th className="text-center pb-2 font-medium">高(cm)</th>
                      <th className="text-center pb-2 font-medium">重量(kg)</th>
                      <th className="text-center pb-2 font-medium">数量</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(p => (
                      <tr key={p.id}>
                        <td className="py-2 pr-2">
                          <input value={p.name} onChange={e => updateProduct(p.id, 'name', e.target.value)}
                            className="w-24 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/50"/>
                        </td>
                        {(['pL', 'pW', 'pH', 'pWt', 'qty'] as (keyof MultiProduct)[]).map(field => (
                          <td key={field} className="py-2 px-1 text-center">
                            <input type="number" min="0.1" step={field === 'qty' ? '1' : '0.1'}
                              value={p[field] as number}
                              onChange={e => updateProduct(p.id, field, field === 'qty' ? parseInt(e.target.value) || 1 : parseFloat(e.target.value) || 0)}
                              className={icNarrow + ' w-full'}/>
                          </td>
                        ))}
                        <td className="py-2 pl-1">
                          <button onClick={() => removeProduct(p.id)}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4"/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Multi results */}
            <div className="bg-[#5b5bd6]/5 border border-[#5b5bd6]/20 rounded-xl p-5">
              <h3 className="text-sm font-bold text-[#5b5bd6] mb-3">各产品最优装箱方案</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-[#5b5bd6]/15">
                      <th className="text-left pb-2 font-medium">产品</th>
                      <th className="text-center pb-2 font-medium">最优方向</th>
                      <th className="text-center pb-2 font-medium">每箱件数</th>
                      <th className="text-center pb-2 font-medium">需要箱数</th>
                      <th className="text-right pb-2 font-medium">总毛重</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#5b5bd6]/10">
                    {multiResults.map(r => (
                      <tr key={r.name}>
                        <td className="py-2 text-gray-700 font-medium">{r.name}</td>
                        <td className="py-2 text-center">
                          {r.perCarton > 0 ? (
                            <span className="font-mono text-xs text-gray-600">{r.bestLabel} cm</span>
                          ) : (
                            <span className="text-red-500 text-xs">装不下</span>
                          )}
                        </td>
                        <td className="py-2 text-center font-semibold text-gray-800">
                          {r.perCarton > 0 ? `${r.perCarton} 件` : '—'}
                        </td>
                        <td className="py-2 text-center font-semibold text-[#5b5bd6]">
                          {r.cartons > 0 ? `${r.cartons} 箱` : '—'}
                        </td>
                        <td className="py-2 text-right text-gray-600">
                          {r.totalWt > 0 ? `${r.totalWt.toFixed(2)} kg` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[#5b5bd6]/20">
                      <td colSpan={3} className="pt-2 text-sm font-semibold text-gray-700">汇总</td>
                      <td className="pt-2 text-center font-bold text-[#5b5bd6]">{totalCartons} 箱</td>
                      <td className="pt-2 text-right font-bold text-gray-800">{totalGrossWt.toFixed(2)} kg</td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="pt-1 text-xs text-gray-400">
                        外箱体积重 {multiCartonVolWt.toFixed(2)} kg（{multiCL}×{multiCW}×{multiCH} cm ÷{multiActiveDiv}）
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
