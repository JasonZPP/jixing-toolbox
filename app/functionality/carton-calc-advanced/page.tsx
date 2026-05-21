'use client'
import { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'

type Mode = 'smart' | 'known' | 'multi'
type MultiSubMode = 'separate' | 'mixed' | 'split'
const VOL_DIVS: number[] = [5000, 6000, 8000]

// Color palette: [light fill, medium fill, dark stroke]
const PROD_PALETTE = [
  { f: '#c4b5fd', m: '#a78bfa', d: '#7c3aed' },
  { f: '#6ee7b7', m: '#34d399', d: '#059669' },
  { f: '#fca5a5', m: '#f87171', d: '#dc2626' },
  { f: '#93c5fd', m: '#60a5fa', d: '#2563eb' },
  { f: '#fde68a', m: '#fbbf24', d: '#d97706' },
]

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
  id: number; name: string
  pL: number; pW: number; pH: number; pWt: number; qty: number
}

interface PackedItem {
  x: number; y: number; z: number   // position in carton (x=along cL, y=height, z=along cW)
  w: number; h: number; d: number   // size
  name: string; ci: number          // color index
}

function packItems(
  cL: number, cW: number, cH: number,
  items: Array<{ name: string; w: number; d: number; h: number; qty: number; ci: number }>
): PackedItem[] {
  const placed: PackedItem[] = []
  let cx = 0, cy = 0, cz = 0
  let rowMaxD = 0, layerMaxH = 0
  for (const item of items) {
    if (!item.w || !item.d || !item.h || !item.qty) continue
    for (let q = 0; q < item.qty; q++) {
      if (cx + item.w > cL + 0.01) { cz += rowMaxD; cx = 0; rowMaxD = 0 }
      if (cz + item.d > cW + 0.01) { cy += layerMaxH; cz = 0; cx = 0; rowMaxD = 0; layerMaxH = 0 }
      if (cy + item.h > cH + 0.01) break
      placed.push({ x: cx, y: cy, z: cz, w: item.w, h: item.h, d: item.d, name: item.name, ci: item.ci })
      cx += item.w
      rowMaxD = Math.max(rowMaxD, item.d)
      layerMaxH = Math.max(layerMaxH, item.h)
    }
  }
  return placed
}

let nextId = 1

// ─── Single-product isometric diagram ───
function PackingDiagram({ cL, cW, cH, prodA, prodB, prodC, W = 280, H = 200 }: {
  cL: number; cW: number; cH: number
  prodA: number; prodB: number; prodC: number
  W?: number; H?: number
}) {
  if (!cL || !cW || !cH || !prodA || !prodB || !prodC) return null
  const nx = Math.floor(cL / prodA)
  const nz = Math.floor(cW / prodB)
  const ny = Math.floor(cH / prodC)
  if (!nx || !ny || !nz) return null

  const C30 = 0.8660254, S30 = 0.5
  const PAD = Math.round(Math.min(W, H) * 0.14)
  const S = Math.min(
    (W - PAD * 2) / ((cL + cW) * C30),
    (H - PAD * 2.2) / ((cL + cW) * S30 + cH),
  )
  const ox = W / 2 + (cW - cL) * C30 * S / 2
  const oy = H - PAD * 0.9

  const iso = (r: number, h: number, d: number): [number, number] => [
    ox + (r - d) * C30 * S,
    oy - ((r + d) * S30 + h) * S,
  ]
  const P = (arr: [number, number][]) => arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  type L4 = [number, number, number, number]

  const FF = [iso(0,0,0), iso(cL,0,0), iso(cL,cH,0), iso(0,cH,0)]
  const RF = [iso(cL,0,0), iso(cL,0,cW), iso(cL,cH,cW), iso(cL,cH,0)]
  const TF = [iso(0,cH,0), iso(cL,cH,0), iso(cL,cH,cW), iso(0,cH,cW)]
  const FO = [iso(0,0,0), iso(nx*prodA,0,0), iso(nx*prodA,ny*prodC,0), iso(0,ny*prodC,0)]
  const RO = [iso(cL,0,0), iso(cL,0,nz*prodB), iso(cL,ny*prodC,nz*prodB), iso(cL,ny*prodC,0)]
  const TO = [iso(0,cH,0), iso(nx*prodA,cH,0), iso(nx*prodA,cH,nz*prodB), iso(0,cH,nz*prodB)]

  const FL: L4[] = []
  for (let i = 1; i <= nx; i++) { const [x1,y1]=iso(i*prodA,0,0); const [x2,y2]=iso(i*prodA,ny*prodC,0); FL.push([x1,y1,x2,y2]) }
  for (let j = 1; j <= ny; j++) { const [x1,y1]=iso(0,j*prodC,0); const [x2,y2]=iso(nx*prodA,j*prodC,0); FL.push([x1,y1,x2,y2]) }
  const RL: L4[] = []
  for (let k = 1; k <= nz; k++) { const [x1,y1]=iso(cL,0,k*prodB); const [x2,y2]=iso(cL,ny*prodC,k*prodB); RL.push([x1,y1,x2,y2]) }
  for (let j = 1; j <= ny; j++) { const [x1,y1]=iso(cL,j*prodC,0); const [x2,y2]=iso(cL,j*prodC,nz*prodB); RL.push([x1,y1,x2,y2]) }
  const TL: L4[] = []
  for (let i = 1; i <= nx; i++) { const [x1,y1]=iso(i*prodA,cH,0); const [x2,y2]=iso(i*prodA,cH,nz*prodB); TL.push([x1,y1,x2,y2]) }
  for (let k = 1; k <= nz; k++) { const [x1,y1]=iso(0,cH,k*prodB); const [x2,y2]=iso(nx*prodA,cH,k*prodB); TL.push([x1,y1,x2,y2]) }

  const BE: [[number,number],[number,number]][] = [
    [iso(0,0,0), iso(0,0,cW)], [iso(0,0,cW), iso(cL,0,cW)], [iso(0,0,cW), iso(0,cH,cW)],
  ]
  const [lLx, lLy] = iso(cL / 2, 0, 0)
  const lHy = oy - cH / 2 * S
  const [lWx, lWy] = iso(cL, 0, cW / 2)
  const util = Math.round(nx * prodA * ny * prodC * nz * prodB / (cL * cW * cH) * 100)

  return (
    <div className="flex flex-col items-center select-none">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="max-w-full overflow-visible">
        {BE.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#9ca3af" strokeWidth="0.8" strokeDasharray="3,2"/>
        ))}
        <polygon points={P(FF)} fill="#f1efff" stroke="none"/>
        <polygon points={P(RF)} fill="#e8e5fe" stroke="none"/>
        <polygon points={P(TF)} fill="#f7f6ff" stroke="none"/>
        <polygon points={P(FO)} fill="#c4b5fd"/>
        <polygon points={P(RO)} fill="#b4a3fc"/>
        <polygon points={P(TO)} fill="#d4c7fe"/>
        {FL.map(([x1,y1,x2,y2],i) => <line key={`f${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6d28d9" strokeWidth="0.65" opacity="0.85"/>)}
        {RL.map(([x1,y1,x2,y2],i) => <line key={`r${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5b21b6" strokeWidth="0.65" opacity="0.85"/>)}
        {TL.map(([x1,y1,x2,y2],i) => <line key={`t${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4c1d95" strokeWidth="0.65" opacity="0.85"/>)}
        <polygon points={P(FF)} fill="none" stroke="#5b5bd6" strokeWidth="1.5"/>
        <polygon points={P(RF)} fill="none" stroke="#5b5bd6" strokeWidth="1.5"/>
        <polygon points={P(TF)} fill="none" stroke="#5b5bd6" strokeWidth="1.5"/>
        <text x={lLx} y={lLy + 13} textAnchor="middle" fontSize="9" fill="#6b7280">长 {cL}cm</text>
        <text x={ox - 10} y={lHy + 3} textAnchor="end" fontSize="9" fill="#6b7280">高 {cH}cm</text>
        <text x={lWx + 7} y={lWy + 10} textAnchor="start" fontSize="9" fill="#6b7280">宽 {cW}cm</text>
      </svg>
      <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-0.5 text-xs mt-1 px-2">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#c4b5fd] border border-[#6d28d9]/40"/>
          <span className="text-gray-500">产品占用</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#f1efff] border border-[#9ca3af]/40"/>
          <span className="text-gray-500">空余空间</span>
        </span>
        <span className="font-semibold text-[#5b5bd6]">{nx}列 × {ny}层 × {nz}深 = {nx * ny * nz} 件/箱</span>
        <span className="text-gray-400">利用率 {util}%</span>
      </div>
    </div>
  )
}

// ─── Multi-product isometric diagram ───
function MultiPackingDiagram({ cL, cW, cH, packed, legend, W = 320, H = 230 }: {
  cL: number; cW: number; cH: number
  packed: PackedItem[]
  legend: Array<{ name: string; ci: number; qty: number }>
  W?: number; H?: number
}) {
  if (!cL || !cW || !cH || packed.length === 0) return null

  const C30 = 0.8660254, S30 = 0.5
  const PAD = Math.round(Math.min(W, H) * 0.14)
  const S = Math.min(
    (W - PAD * 2) / ((cL + cW) * C30),
    (H - PAD * 2.2) / ((cL + cW) * S30 + cH),
  )
  const ox = W / 2 + (cW - cL) * C30 * S / 2
  const oy = H - PAD * 0.9

  const iso = (r: number, h: number, d: number): [number, number] => [
    ox + (r - d) * C30 * S,
    oy - ((r + d) * S30 + h) * S,
  ]
  const P = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  // Painter's order: back rows (large z) first, then left (small x), then lower (small y)
  const sorted = [...packed].sort((a, b) =>
    b.z !== a.z ? b.z - a.z : a.x !== b.x ? a.x - b.x : a.y - b.y
  )

  const FF = [iso(0,0,0), iso(cL,0,0), iso(cL,cH,0), iso(0,cH,0)]
  const RF = [iso(cL,0,0), iso(cL,0,cW), iso(cL,cH,cW), iso(cL,cH,0)]
  const TF = [iso(0,cH,0), iso(cL,cH,0), iso(cL,cH,cW), iso(0,cH,cW)]

  const backEdges: [[number,number],[number,number]][] = [
    [iso(0,0,0), iso(0,0,cW)],
    [iso(0,0,cW), iso(cL,0,cW)],
    [iso(0,0,cW), iso(0,cH,cW)],
  ]

  const [lLx, lLy] = iso(cL / 2, 0, 0)
  const lHy = oy - cH / 2 * S
  const [lWx, lWy] = iso(cL, 0, cW / 2)

  return (
    <div className="flex flex-col items-center select-none">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="max-w-full overflow-visible">
        {/* Hidden back edges */}
        {backEdges.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#9ca3af" strokeWidth="0.8" strokeDasharray="3,2"/>
        ))}

        {/* Carton face backgrounds (empty space) */}
        <polygon points={P(FF)} fill="#f5f4ff" stroke="none"/>
        <polygon points={P(RF)} fill="#eeecff" stroke="none"/>
        <polygon points={P(TF)} fill="#f8f7ff" stroke="none"/>

        {/* Products in painter's order */}
        {sorted.map((item, idx) => {
          const c = PROD_PALETTE[item.ci % PROD_PALETTE.length]
          const { x, y, z, w, h, d } = item
          const fF = [iso(x,y,z), iso(x+w,y,z), iso(x+w,y+h,z), iso(x,y+h,z)]
          const rF = [iso(x+w,y,z), iso(x+w,y,z+d), iso(x+w,y+h,z+d), iso(x+w,y+h,z)]
          const tF = [iso(x,y+h,z), iso(x+w,y+h,z), iso(x+w,y+h,z+d), iso(x,y+h,z+d)]
          return (
            <g key={idx}>
              <polygon points={P(fF)} fill={c.f} stroke={c.d} strokeWidth="0.6"/>
              <polygon points={P(rF)} fill={c.m} stroke={c.d} strokeWidth="0.6"/>
              <polygon points={P(tF)} fill={c.f} stroke={c.d} strokeWidth="0.6" opacity="0.9"/>
            </g>
          )
        })}

        {/* Carton outline on top */}
        <polygon points={P(FF)} fill="none" stroke="#5b5bd6" strokeWidth="1.5"/>
        <polygon points={P(RF)} fill="none" stroke="#5b5bd6" strokeWidth="1.5"/>
        <polygon points={P(TF)} fill="none" stroke="#5b5bd6" strokeWidth="1.5"/>

        {/* Dimension labels */}
        <text x={lLx} y={lLy + 13} textAnchor="middle" fontSize="9" fill="#6b7280">长 {cL}cm</text>
        <text x={ox - 10} y={lHy + 3} textAnchor="end" fontSize="9" fill="#6b7280">高 {cH}cm</text>
        <text x={lWx + 7} y={lWy + 10} textAnchor="start" fontSize="9" fill="#6b7280">宽 {cW}cm</text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-2 px-2">
        {legend.map(l => {
          const c = PROD_PALETTE[l.ci % PROD_PALETTE.length]
          return (
            <span key={l.name} className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm border" style={{ background: c.f, borderColor: c.d }}/>
              <span className="text-gray-600 font-medium">{l.name}</span>
              <span className="text-gray-400">× {l.qty} 件</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

function CartonConfig({ cL, cW, cH, cWt, volDiv, customDiv, setCL, setCW, setCH, setCWt, setVolDiv, setCustomDiv }: {
  cL: number; cW: number; cH: number; cWt: number; volDiv: number; customDiv: number
  setCL: (v: number) => void; setCW: (v: number) => void; setCH: (v: number) => void
  setCWt: (v: number) => void; setVolDiv: (v: number) => void; setCustomDiv: (v: number) => void
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">外箱规格</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([['外箱长(cm)', cL, setCL], ['外箱宽(cm)', cW, setCW], ['外箱高(cm)', cH, setCH], ['箱皮重(kg)', cWt, setCWt]] as [string, number, (v: number) => void][]).map(([label, val, setter]) => (
          <div key={label}>
            <label className="text-xs text-gray-500 block mb-1">{label}</label>
            <input type="number" min="0.1" step="0.1" value={val} onChange={e => setter(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40"/>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500">体积重除数</span>
        {VOL_DIVS.map(d => (
          <button key={d} onClick={() => setVolDiv(d)}
            className={`px-2.5 py-1 rounded text-xs font-medium ${volDiv === d ? 'bg-[#5b5bd6] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>{d}</button>
        ))}
        <button onClick={() => setVolDiv(0)}
          className={`px-2.5 py-1 rounded text-xs font-medium ${!VOL_DIVS.includes(volDiv) ? 'bg-[#5b5bd6] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>自定义</button>
        {!VOL_DIVS.includes(volDiv) && (
          <input type="number" min="1000" step="100" value={customDiv} onChange={e => setCustomDiv(parseInt(e.target.value) || 6000)}
            className="w-20 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/50"/>
        )}
      </div>
    </div>
  )
}

export default function CartonCalcPage() {
  const [mode, setMode] = useState<Mode>('smart')
  const [pL, setPL] = useState(10); const [pW, setPW] = useState(8); const [pH, setPH] = useState(4); const [pWt, setPWt] = useState(0.3)
  const [cL, setCL] = useState(40); const [cW, setCW] = useState(30); const [cH, setCH] = useState(25); const [cWt, setCWt] = useState(1.0)
  const [totalQty, setTotalQty] = useState(50); const [knownCartons, setKnownCartons] = useState(5)
  const [volDiv, setVolDiv] = useState(6000); const [customDiv, setCustomDiv] = useState(6000)

  const [multiSubMode, setMultiSubMode] = useState<MultiSubMode>('separate')
  const [multiCL, setMultiCL] = useState(60); const [multiCW, setMultiCW] = useState(40)
  const [multiCH, setMultiCH] = useState(35); const [multiCWt, setMultiCWt] = useState(1.5)
  const [multiVolDiv, setMultiVolDiv] = useState(6000); const [multiCustomDiv, setMultiCustomDiv] = useState(6000)
  const [maxCartonWt, setMaxCartonWt] = useState(20)
  const [targetCartons, setTargetCartons] = useState(5)
  const [products, setProducts] = useState<MultiProduct[]>([
    { id: nextId++, name: '产品 A', pL: 20, pW: 15, pH: 8, pWt: 0.5, qty: 30 },
    { id: nextId++, name: '产品 B', pL: 12, pW: 10, pH: 6, pWt: 0.3, qty: 20 },
  ])

  // Single-product calcs
  const activeDiv = VOL_DIVS.includes(volDiv) ? volDiv : customDiv
  const cartonVolWt = (cL * cW * cH) / activeDiv
  const orientations = getOrientations(pL, pW, pH, cL, cW, cH)
  const best = orientations[0]
  const smartCartons = best && best.qty > 0 ? Math.ceil(totalQty / best.qty) : 0
  const qtyPerCarton = knownCartons > 0 ? Math.floor(totalQty / knownCartons) : 0
  const remainder = totalQty % knownCartons
  const bestParts = best ? best.label.split('×').map(Number) : [0, 0, 0]

  const addProduct = () => setProducts(p => [...p, { id: nextId++, name: `产品 ${String.fromCharCode(65 + p.length)}`, pL: 15, pW: 10, pH: 8, pWt: 0.3, qty: 20 }])
  const removeProduct = (id: number) => setProducts(p => p.filter(x => x.id !== id))
  const updateProduct = (id: number, field: keyof MultiProduct, value: string | number) =>
    setProducts(p => p.map(x => x.id === id ? { ...x, [field]: value } : x))

  const multiActiveDiv = VOL_DIVS.includes(multiVolDiv) ? multiVolDiv : multiCustomDiv
  const multiCartonVol = multiCL * multiCW * multiCH
  const multiCartonVolWt = multiCartonVol / multiActiveDiv

  // Separate mode
  const sepResults = products.map(p => {
    const ors = getOrientations(p.pL, p.pW, p.pH, multiCL, multiCW, multiCH)
    const b = ors[0]
    const perCarton = b ? b.qty : 0
    const cartons = perCarton > 0 ? Math.ceil(p.qty / perCarton) : 0
    const parts = b ? b.label.split('×').map(Number) : [0, 0, 0]
    return { name: p.name, label: b ? b.label : '—', perCarton, cartons, parts,
      totalWt: cartons > 0 ? cartons * (multiCWt + perCarton * p.pWt) : 0 }
  })
  const sepTotal = sepResults.reduce((s, r) => s + r.cartons, 0)
  const sepTotalWt = sepResults.reduce((s, r) => s + r.totalWt, 0)

  // Mixed mode
  const totalProdVol = products.reduce((s, p) => s + p.pL * p.pW * p.pH * p.qty, 0)
  const totalProdWt = products.reduce((s, p) => s + p.pWt * p.qty, 0)
  const mixByVol = multiCartonVol > 0 ? Math.ceil(totalProdVol / multiCartonVol) : 1
  const netWtCap = maxCartonWt - multiCWt
  const mixByWt = netWtCap > 0 ? Math.ceil(totalProdWt / netWtCap) : 1
  const mixedN = Math.max(mixByVol, mixByWt, 1)
  const mixVolLimited = mixByVol >= mixByWt
  const mixedPerCarton = products.map(p => ({ name: p.name, base: Math.floor(p.qty / mixedN), extra: p.qty % mixedN }))
  const mixVolPerCarton = products.reduce((s, p) => s + p.pL * p.pW * p.pH * Math.floor(p.qty / mixedN), 0)
  const mixWtPerCarton = multiCWt + products.reduce((s, p) => s + p.pWt * Math.floor(p.qty / mixedN), 0)
  const mixVolUtil = multiCartonVol > 0 ? (mixVolPerCarton / multiCartonVol * 100) : 0
  const mixHasExtra = mixedPerCarton.some(p => p.extra > 0)

  // Split mode
  const splitN = Math.max(targetCartons, 1)
  const splitUnder5 = splitN < 5
  const splitPerCarton = products.map(p => ({ name: p.name, base: Math.floor(p.qty / splitN), extra: p.qty % splitN }))
  const splitVolPerCarton = products.reduce((s, p) => s + p.pL * p.pW * p.pH * Math.floor(p.qty / splitN), 0)
  const splitWtPerCarton = multiCWt + products.reduce((s, p) => s + p.pWt * Math.floor(p.qty / splitN), 0)
  const splitVolUtil = multiCartonVol > 0 ? (splitVolPerCarton / multiCartonVol * 100) : 0
  const splitFits = splitVolPerCarton <= multiCartonVol
  const splitHasRemainder = splitPerCarton.some(p => p.extra > 0)
  const splitAdjusted = products.map(p => {
    const rem = p.qty % splitN; if (rem === 0) return null
    return { name: p.name, current: p.qty, suggested: p.qty - rem }
  }).filter(Boolean)

  // Build packed items for mixed / split diagrams
  const buildDiagramItems = (perCarton: { name: string; base: number }[]) =>
    products.map((p, i) => {
      const bst = getOrientations(p.pL, p.pW, p.pH, multiCL, multiCW, multiCH)[0]
      const pts = bst ? bst.label.split('×').map(Number) : [0, 0, 0]
      const base = perCarton.find(r => r.name === p.name)?.base ?? 0
      return { name: p.name, w: pts[0], d: pts[1], h: pts[2], qty: base, ci: i }
    }).filter(item => item.qty > 0 && item.w > 0 && item.d > 0 && item.h > 0)

  const mixDiagramItems = buildDiagramItems(mixedPerCarton)
  const mixPacked = packItems(multiCL, multiCW, multiCH, mixDiagramItems)
  const splitDiagramItems = buildDiagramItems(splitPerCarton)
  const splitPacked = packItems(multiCL, multiCW, multiCH, splitDiagramItems)

  const ic = 'w-28 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40'
  const icNarrow = 'w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40 text-right'

  return (
    <ToolLayout title="外箱装箱计算器" description="6方向智能测算最优装箱方案，含物理堆放示意图">
      <div className="space-y-5">
        <div className="flex gap-2 flex-wrap">
          {([['smart', '智能测算箱数'], ['known', '已知箱数分配'], ['multi', '多品装箱']] as [Mode, string][]).map(([m, l]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-[#5b5bd6] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#5b5bd6]/40'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* ── Single-product modes ── */}
        {mode !== 'multi' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">产品尺寸 (cm) & 重量</h3>
                <div className="flex justify-between items-center"><label className="text-sm text-gray-600">长</label><input type="number" min="0.1" step="0.1" value={pL} onChange={e => setPL(parseFloat(e.target.value)||0)} className={ic}/></div>
                <div className="flex justify-between items-center"><label className="text-sm text-gray-600">宽</label><input type="number" min="0.1" step="0.1" value={pW} onChange={e => setPW(parseFloat(e.target.value)||0)} className={ic}/></div>
                <div className="flex justify-between items-center"><label className="text-sm text-gray-600">高</label><input type="number" min="0.1" step="0.1" value={pH} onChange={e => setPH(parseFloat(e.target.value)||0)} className={ic}/></div>
                <div className="flex justify-between items-center"><label className="text-sm text-gray-600">单件重量 (kg)</label><input type="number" min="0" step="0.01" value={pWt} onChange={e => setPWt(parseFloat(e.target.value)||0)} className={ic}/></div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">外箱尺寸 (cm) & 重量</h3>
                <div className="flex justify-between items-center"><label className="text-sm text-gray-600">长</label><input type="number" min="0.1" step="0.1" value={cL} onChange={e => setCL(parseFloat(e.target.value)||0)} className={ic}/></div>
                <div className="flex justify-between items-center"><label className="text-sm text-gray-600">宽</label><input type="number" min="0.1" step="0.1" value={cW} onChange={e => setCW(parseFloat(e.target.value)||0)} className={ic}/></div>
                <div className="flex justify-between items-center"><label className="text-sm text-gray-600">高</label><input type="number" min="0.1" step="0.1" value={cH} onChange={e => setCH(parseFloat(e.target.value)||0)} className={ic}/></div>
                <div className="flex justify-between items-center"><label className="text-sm text-gray-600">箱皮重量 (kg)</label><input type="number" min="0" step="0.1" value={cWt} onChange={e => setCWt(parseFloat(e.target.value)||0)} className={ic}/></div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">总发货数量</label>
                  <input type="number" min="1" value={totalQty} onChange={e => setTotalQty(parseInt(e.target.value)||1)} className={ic}/>
                </div>
                {mode === 'known' && (
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-600">已知箱数</label>
                    <input type="number" min="1" value={knownCartons} onChange={e => setKnownCartons(parseInt(e.target.value)||1)} className={ic}/>
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
                    <input type="number" min="1000" step="100" value={customDiv} onChange={e => setCustomDiv(parseInt(e.target.value)||6000)}
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
                            <span className="text-gray-600">{k}</span><span className="font-semibold text-gray-800">{v}</span>
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
                        <span className="text-gray-600">{k}</span><span className="font-semibold text-gray-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {best && best.qty > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">堆放示意图（最优方向）</h3>
                  <PackingDiagram
                    cL={cL} cW={cW} cH={cH}
                    prodA={bestParts[0]} prodB={bestParts[1]} prodC={bestParts[2]}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Multi-product mode ── */}
        {mode === 'multi' && (
          <div className="space-y-4">
            <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1 w-fit">
              {([
                ['separate', '各自独立装箱'],
                ['mixed', '混装方案'],
                ['split', '分仓等比（免配置费）'],
              ] as [MultiSubMode, string][]).map(([m, l]) => (
                <button key={m} onClick={() => setMultiSubMode(m)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${multiSubMode === m ? 'bg-white text-[#5b5bd6] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>

            <CartonConfig cL={multiCL} cW={multiCW} cH={multiCH} cWt={multiCWt} volDiv={multiVolDiv} customDiv={multiCustomDiv}
              setCL={setMultiCL} setCW={setMultiCW} setCH={setMultiCH} setCWt={setMultiCWt} setVolDiv={setMultiVolDiv} setCustomDiv={setMultiCustomDiv}/>

            {multiSubMode === 'mixed' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0"/>
                <p className="text-xs text-amber-700 flex-1">混装模式按体积比例估算，实际装箱数以物理堆放为准。</p>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-xs text-amber-700 whitespace-nowrap">单箱最大重量 (kg)</label>
                  <input type="number" min="1" step="1" value={maxCartonWt} onChange={e => setMaxCartonWt(parseFloat(e.target.value)||1)}
                    className="w-20 border border-amber-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 text-right"/>
                </div>
              </div>
            )}
            {multiSubMode === 'split' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-blue-700">
                    <CheckCircle className="h-4 w-4 text-blue-500 shrink-0"/>
                    亚马逊牙签分仓免配置费要求：≥5箱，且每箱SKU组合与数量完全相同
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <label className="text-xs text-blue-700 whitespace-nowrap">目标箱数</label>
                    <input type="number" min="1" step="1" value={targetCartons} onChange={e => setTargetCartons(parseInt(e.target.value)||1)}
                      className="w-20 border border-blue-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-right"/>
                  </div>
                </div>
                {splitUnder5 && <p className="mt-2 text-xs text-orange-600 font-medium">当前 {splitN} 箱，不满足亚马逊 5 箱最低要求，无法享受免配置费优惠。</p>}
              </div>
            )}

            {/* Product table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">产品列表</h3>
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
                      <th className="text-center pb-2 font-medium">总数量</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map((p, idx) => (
                      <tr key={p.id}>
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: PROD_PALETTE[idx % PROD_PALETTE.length].f, border: `1px solid ${PROD_PALETTE[idx % PROD_PALETTE.length].d}` }}/>
                            <input value={p.name} onChange={e => updateProduct(p.id, 'name', e.target.value)}
                              className="w-20 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#5b5bd6]/50"/>
                          </div>
                        </td>
                        {(['pL', 'pW', 'pH', 'pWt', 'qty'] as (keyof MultiProduct)[]).map(field => (
                          <td key={field} className="py-2 px-1 text-center">
                            <input type="number" min="0.1" step={field === 'qty' ? '1' : '0.1'}
                              value={p[field] as number}
                              onChange={e => updateProduct(p.id, field, field === 'qty' ? parseInt(e.target.value)||1 : parseFloat(e.target.value)||0)}
                              className={icNarrow}/>
                          </td>
                        ))}
                        <td className="py-2 pl-1">
                          <button onClick={() => removeProduct(p.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4"/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Separate results + per-product diagrams ── */}
            {multiSubMode === 'separate' && (
              <>
                <div className="bg-[#5b5bd6]/5 border border-[#5b5bd6]/20 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-[#5b5bd6] mb-3">各产品最优装箱方案</h3>
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
                      {sepResults.map((r, idx) => (
                        <tr key={r.name}>
                          <td className="py-2">
                            <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                              <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: PROD_PALETTE[idx % PROD_PALETTE.length].f, border: `1px solid ${PROD_PALETTE[idx % PROD_PALETTE.length].d}` }}/>
                              {r.name}
                            </span>
                          </td>
                          <td className="py-2 text-center">{r.perCarton > 0 ? <span className="font-mono text-xs text-gray-600">{r.label} cm</span> : <span className="text-red-500 text-xs">装不下</span>}</td>
                          <td className="py-2 text-center font-semibold text-gray-800">{r.perCarton > 0 ? `${r.perCarton} 件` : '—'}</td>
                          <td className="py-2 text-center font-semibold text-[#5b5bd6]">{r.cartons > 0 ? `${r.cartons} 箱` : '—'}</td>
                          <td className="py-2 text-right text-gray-600">{r.totalWt > 0 ? `${r.totalWt.toFixed(2)} kg` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[#5b5bd6]/20">
                        <td colSpan={3} className="pt-2 text-sm font-semibold text-gray-700">汇总</td>
                        <td className="pt-2 text-center font-bold text-[#5b5bd6]">{sepTotal} 箱</td>
                        <td className="pt-2 text-right font-bold text-gray-800">{sepTotalWt.toFixed(2)} kg</td>
                      </tr>
                      <tr><td colSpan={5} className="pt-1 text-xs text-gray-400">外箱体积重 {multiCartonVolWt.toFixed(2)} kg（{multiCL}×{multiCW}×{multiCH} cm ÷{multiActiveDiv}）</td></tr>
                    </tfoot>
                  </table>
                </div>

                {sepResults.some(r => r.perCarton > 0) && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">各产品堆放示意图</h3>
                    <div className={`grid gap-4 ${sepResults.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                      {sepResults.map((r, idx) => r.perCarton > 0 && (
                        <div key={r.name} className="rounded-xl border p-3" style={{ borderColor: PROD_PALETTE[idx % PROD_PALETTE.length].d + '40', background: PROD_PALETTE[idx % PROD_PALETTE.length].f + '18' }}>
                          <p className="text-xs font-semibold mb-2 text-center" style={{ color: PROD_PALETTE[idx % PROD_PALETTE.length].d }}>{r.name}</p>
                          <PackingDiagram
                            cL={multiCL} cW={multiCW} cH={multiCH}
                            prodA={r.parts[0]} prodB={r.parts[1]} prodC={r.parts[2]}
                            W={240} H={170}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Mixed results + diagram ── */}
            {multiSubMode === 'mixed' && (
              <>
                <div className="bg-[#5b5bd6]/5 border border-[#5b5bd6]/20 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-[#5b5bd6] mb-3">混装装箱方案</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {([
                      ['推荐箱数', `${mixedN} 箱`, `由${mixVolLimited ? '体积' : '重量'}限制（体积需 ${mixByVol} 箱，重量需 ${mixByWt} 箱）`],
                      ['每箱体积利用率', `${mixVolUtil.toFixed(1)}%`, `箱容 ${(multiCartonVol/1000).toFixed(1)} L，产品占 ${(mixVolPerCarton/1000).toFixed(1)} L`],
                      ['每箱估算毛重', `${mixWtPerCarton.toFixed(2)} kg`, `含箱皮 ${multiCWt} kg`],
                      ['总货物毛重', `${(mixedN * mixWtPerCarton).toFixed(2)} kg`, ''],
                    ] as [string, string, string][]).map(([k, v, sub]) => (
                      <div key={k} className="bg-white rounded-lg p-3 border border-[#5b5bd6]/10">
                        <p className="text-xs text-gray-500">{k}</p>
                        <p className="text-base font-bold text-[#5b5bd6] mt-0.5">{v}</p>
                        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
                      </div>
                    ))}
                  </div>
                  <h4 className="text-xs font-semibold text-gray-600 mb-2">每箱标准组合</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 border-b border-[#5b5bd6]/10">
                        <th className="text-left pb-1.5 font-medium">产品</th>
                        <th className="text-center pb-1.5 font-medium">每箱数量</th>
                        <th className="text-right pb-1.5 font-medium">溢出件数</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#5b5bd6]/8">
                      {mixedPerCarton.map((r, idx) => (
                        <tr key={r.name}>
                          <td className="py-2">
                            <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                              <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: PROD_PALETTE[idx % PROD_PALETTE.length].f, border: `1px solid ${PROD_PALETTE[idx % PROD_PALETTE.length].d}` }}/>
                              {r.name}
                            </span>
                          </td>
                          <td className="py-2 text-center font-semibold text-gray-800">{r.base} 件</td>
                          <td className="py-2 text-right">
                            {r.extra > 0 ? <span className="text-orange-500 text-xs">+{r.extra} 件（分散入前 {r.extra} 箱）</span> : <span className="text-green-500 text-xs">整除 ✓</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {mixHasExtra && (
                    <p className="mt-3 text-xs text-orange-600 bg-orange-50 rounded-lg p-2.5">
                      部分产品有余件，前几箱多装 1 件。若需完全相同可调整总数量为 {mixedN} 的整数倍。
                    </p>
                  )}
                </div>

                {mixPacked.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">单箱堆放示意图（混装）</h3>
                    <p className="text-xs text-gray-400 mb-3">按各产品最优朝向逐行摆放，不同颜色代表不同产品</p>
                    <MultiPackingDiagram
                      cL={multiCL} cW={multiCW} cH={multiCH}
                      packed={mixPacked}
                      legend={mixDiagramItems.map(i => ({ name: i.name, ci: i.ci, qty: i.qty }))}
                    />
                  </div>
                )}
              </>
            )}

            {/* ── Split results + diagram ── */}
            {multiSubMode === 'split' && (
              <div className="space-y-4">
                <div className={`rounded-xl p-5 border ${splitFits ? 'bg-[#5b5bd6]/5 border-[#5b5bd6]/20' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-bold ${splitFits ? 'text-[#5b5bd6]' : 'text-red-600'}`}>每箱统一组合（{splitN} 箱完全相同）</h3>
                    {splitFits
                      ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3.5 w-3.5"/>体积可装入</span>
                      : <span className="flex items-center gap-1 text-xs text-red-500"><AlertTriangle className="h-3.5 w-3.5"/>体积超出外箱</span>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {([
                      ['箱数', `${splitN} 箱`], ['每箱体积利用率', `${splitVolUtil.toFixed(1)}%`],
                      ['每箱毛重', `${splitWtPerCarton.toFixed(2)} kg`], ['总毛重', `${(splitN * splitWtPerCarton).toFixed(2)} kg`],
                    ] as [string, string][]).map(([k, v]) => (
                      <div key={k} className="bg-white rounded-lg p-3 border border-white/60">
                        <p className="text-xs text-gray-500">{k}</p>
                        <p className="text-base font-bold text-[#5b5bd6] mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 border-b border-[#5b5bd6]/10">
                        <th className="text-left pb-1.5 font-medium">产品 SKU</th>
                        <th className="text-center pb-1.5 font-medium">每箱数量</th>
                        <th className="text-center pb-1.5 font-medium">总数量</th>
                        <th className="text-right pb-1.5 font-medium">余件</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#5b5bd6]/8">
                      {splitPerCarton.map((r, idx) => (
                        <tr key={r.name}>
                          <td className="py-2">
                            <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                              <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: PROD_PALETTE[idx % PROD_PALETTE.length].f, border: `1px solid ${PROD_PALETTE[idx % PROD_PALETTE.length].d}` }}/>
                              {r.name}
                            </span>
                          </td>
                          <td className="py-2 text-center font-bold text-gray-800">{r.base} 件</td>
                          <td className="py-2 text-center text-gray-500">{r.base * splitN} 件</td>
                          <td className="py-2 text-right">
                            {r.extra > 0 ? <span className="text-orange-500 text-xs">{r.extra} 件无法等分</span> : <span className="text-green-500 text-xs">完全整除 ✓</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!splitFits && (
                    <div className="mt-3 text-xs text-red-600 bg-red-100 rounded-lg p-3">
                      每箱产品体积（{(splitVolPerCarton/1000).toFixed(1)} L）超出外箱容积（{(multiCartonVol/1000).toFixed(1)} L），建议增加箱数或使用更大外箱。
                    </div>
                  )}
                </div>

                {splitPacked.length > 0 && splitFits && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">单箱堆放示意图（等比分仓）</h3>
                    <p className="text-xs text-gray-400 mb-3">每箱 SKU 组合完全相同，不同颜色代表不同产品</p>
                    <MultiPackingDiagram
                      cL={multiCL} cW={multiCW} cH={multiCH}
                      packed={splitPacked}
                      legend={splitDiagramItems.map(i => ({ name: i.name, ci: i.ci, qty: i.qty }))}
                    />
                  </div>
                )}

                {splitHasRemainder && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-orange-700 mb-2">余件处理建议（调整总数量使能完全整除）</p>
                    <table className="w-full text-xs text-orange-700">
                      <thead><tr className="border-b border-orange-100"><th className="text-left pb-1 font-medium">产品</th><th className="text-center pb-1 font-medium">当前数量</th><th className="text-center pb-1 font-medium">余件</th><th className="text-right pb-1 font-medium">建议调整为</th></tr></thead>
                      <tbody>
                        {splitAdjusted.map(r => r && (
                          <tr key={r.name} className="border-b border-orange-50">
                            <td className="py-1 font-medium">{r.name}</td>
                            <td className="py-1 text-center">{r.current} 件</td>
                            <td className="py-1 text-center text-orange-500">{r.current - r.suggested} 件余</td>
                            <td className="py-1 text-right font-semibold">{r.suggested} 件（减 {r.current - r.suggested}）</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {splitUnder5 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-xs text-orange-700">
                    <p className="font-semibold mb-1">未达亚马逊分仓免配置费要求</p>
                    <p>亚马逊要求至少 <strong>5 箱</strong> 才可免除分仓配置费。当前设定 {splitN} 箱，建议目标箱数设为 5 或更多。</p>
                  </div>
                )}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-gray-500 space-y-1">
                  <p className="font-medium text-gray-600">亚马逊分仓免配置费规则说明</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li>每批货物发货箱数 ≥ 5 箱，且每箱内 SKU 种类和数量完全一致</li>
                    <li>适用于牙签分仓（Inbound Placement Service）</li>
                    <li>余件建议减量或单独一箱处理，不计入等比箱数</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
