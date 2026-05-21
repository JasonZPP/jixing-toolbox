'use client'

import { useState, useMemo } from 'react'

type Market = 'us' | 'uk' | 'de' | 'jp' | 'ca'
type Category = '旺季' | '促销' | '节日' | 'Amazon大促'

interface GlobalEvent {
  month: number
  date: string
  name: string
  market: Market
  category: Category
  tip?: string
}

const MARKET_INFO: Record<Market, { flag: string; name: string; label: string }> = {
  us: { flag: '🇺🇸', name: '美国', label: '美国站' },
  uk: { flag: '🇬🇧', name: '英国', label: '英国站' },
  de: { flag: '🇩🇪', name: '德国', label: '德国站' },
  jp: { flag: '🇯🇵', name: '日本', label: '日本站' },
  ca: { flag: '🇨🇦', name: '加拿大', label: '加拿大站' },
}

const CAT_STYLE: Record<Category, string> = {
  '旺季':     'bg-orange-100 text-orange-600 border-orange-200',
  '促销':     'bg-purple-100 text-purple-600 border-purple-200',
  '节日':     'bg-blue-100 text-blue-600 border-blue-200',
  'Amazon大促':'bg-[#5b5bd6]/10 text-[#5b5bd6] border-[#5b5bd6]/25',
}

const MONTHS = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
const Q_MONTHS: [number[], number[], number[], number[]] = [[1,2,3],[4,5,6],[7,8,9],[10,11,12]]

const EVENTS: GlobalEvent[] = [
  // ── January ──────────────────────────────────────────────────────────────
  { month:1,  date:'1/1',  name:"New Year's Day",      market:'us', category:'节日' },
  { month:1,  date:'1/1',  name:"New Year's Day",      market:'uk', category:'节日' },
  { month:1,  date:'1/1',  name:'Neujahr',             market:'de', category:'节日' },
  { month:1,  date:'1/1',  name:'元日',                market:'jp', category:'节日' },
  { month:1,  date:'1/1',  name:"New Year's Day",      market:'ca', category:'节日' },
  { month:1,  date:'1/19', name:'MLK Day',             market:'us', category:'节日' },
  // ── February ──────────────────────────────────────────────────────────────
  { month:2,  date:'2/14', name:"Valentine's Day",     market:'us', category:'节日', tip:'礼品旺季' },
  { month:2,  date:'2/14', name:"Valentine's Day",     market:'uk', category:'节日', tip:'礼品旺季' },
  { month:2,  date:'2/14', name:'Valentinstag',        market:'de', category:'节日', tip:'礼品旺季' },
  { month:2,  date:'2/14', name:'バレンタインデー',    market:'jp', category:'节日', tip:'礼品旺季' },
  { month:2,  date:'2/14', name:"Valentine's Day",     market:'ca', category:'节日', tip:'礼品旺季' },
  { month:2,  date:'2/16', name:"Presidents' Day",     market:'us', category:'节日' },
  // ── March ──────────────────────────────────────────────────────────────────
  { month:3,  date:'3/14', name:'ホワイトデー',        market:'jp', category:'节日', tip:'白色情人节回礼' },
  { month:3,  date:'3/17', name:"St. Patrick's Day",   market:'us', category:'节日' },
  { month:3,  date:'3/17', name:"St. Patrick's Day",   market:'uk', category:'节日' },
  { month:3,  date:'3/22', name:'Spring Sale',         market:'us', category:'Amazon大促', tip:'亚马逊春季大促' },
  { month:3,  date:'3/22', name:'Spring Sale',         market:'uk', category:'Amazon大促' },
  { month:3,  date:'3/22', name:'Spring Sale',         market:'de', category:'Amazon大促' },
  { month:3,  date:'3/22', name:'Spring Sale',         market:'jp', category:'Amazon大促' },
  { month:3,  date:'3/22', name:'Spring Sale',         market:'ca', category:'Amazon大促' },
  // ── April ──────────────────────────────────────────────────────────────────
  { month:4,  date:'4/5',  name:'Easter',              market:'us', category:'节日' },
  { month:4,  date:'4/5',  name:'Easter',              market:'uk', category:'节日' },
  { month:4,  date:'4/6',  name:'Ostermontag',         market:'de', category:'节日' },
  { month:4,  date:'4/5',  name:'Easter',              market:'ca', category:'节日' },
  // ── May ──────────────────────────────────────────────────────────────────
  { month:5,  date:'5/10', name:"Mother's Day",        market:'us', category:'节日', tip:'家居美妆礼品旺季' },
  { month:5,  date:'5/10', name:'Mothering Sunday',    market:'uk', category:'节日' },
  { month:5,  date:'5/10', name:'Muttertag',           market:'de', category:'节日' },
  { month:5,  date:'5/10', name:"Mother's Day",        market:'ca', category:'节日' },
  { month:5,  date:'5/25', name:'Memorial Day',        market:'us', category:'节日' },
  { month:5,  date:'5/26', name:'Victoria Day',        market:'ca', category:'节日' },
  // ── June ──────────────────────────────────────────────────────────────────
  { month:6,  date:'6/21', name:"Father's Day",        market:'us', category:'节日', tip:'户外工具科技礼品' },
  { month:6,  date:'6/21', name:"Father's Day",        market:'uk', category:'节日' },
  { month:6,  date:'6/21', name:'Vatertag',            market:'de', category:'节日' },
  { month:6,  date:'6/21', name:"Father's Day",        market:'ca', category:'节日' },
  // ── July ──────────────────────────────────────────────────────────────────
  { month:7,  date:'7/1',  name:'Canada Day',          market:'ca', category:'节日' },
  { month:7,  date:'7/1',  name:'お中元シーズン',      market:'jp', category:'旺季', tip:'中元节送礼旺季（7-8月）' },
  { month:7,  date:'7/4',  name:'Independence Day',    market:'us', category:'节日' },
  { month:7,  date:'7/15', name:'Prime Day',           market:'us', category:'Amazon大促', tip:'全年最大促销，提前6周备货' },
  { month:7,  date:'7/15', name:'Prime Day',           market:'uk', category:'Amazon大促' },
  { month:7,  date:'7/15', name:'Prime Day',           market:'de', category:'Amazon大促' },
  { month:7,  date:'7/15', name:'Prime Day',           market:'jp', category:'Amazon大促' },
  { month:7,  date:'7/15', name:'Prime Day',           market:'ca', category:'Amazon大促' },
  // ── August ──────────────────────────────────────────────────────────────
  { month:8,  date:'8/1',  name:'Back to School',      market:'us', category:'旺季', tip:'文具收纳学习用品' },
  { month:8,  date:'8/1',  name:'Back to School',      market:'uk', category:'旺季' },
  { month:8,  date:'8/1',  name:'Schulstart',          market:'de', category:'旺季' },
  { month:8,  date:'8/1',  name:'Back to School',      market:'ca', category:'旺季' },
  { month:8,  date:'8/13', name:'お盆',                market:'jp', category:'节日' },
  // ── September ────────────────────────────────────────────────────────────
  { month:9,  date:'9/7',  name:'Labor Day',           market:'us', category:'节日' },
  { month:9,  date:'9/7',  name:'Labour Day',          market:'ca', category:'节日' },
  // ── October ──────────────────────────────────────────────────────────────
  { month:10, date:'10/13',name:'Prime Early Access',  market:'us', category:'Amazon大促', tip:'年底旺季预热' },
  { month:10, date:'10/13',name:'Prime Early Access',  market:'uk', category:'Amazon大促' },
  { month:10, date:'10/13',name:'Prime Early Access',  market:'de', category:'Amazon大促' },
  { month:10, date:'10/13',name:'Prime Early Access',  market:'jp', category:'Amazon大促' },
  { month:10, date:'10/13',name:'Prime Early Access',  market:'ca', category:'Amazon大促' },
  { month:10, date:'10/14',name:'Thanksgiving Day',    market:'ca', category:'节日' },
  { month:10, date:'10/31',name:'Halloween',           market:'us', category:'节日', tip:'装饰品服装旺季' },
  { month:10, date:'10/31',name:'Halloween',           market:'uk', category:'节日' },
  { month:10, date:'10/31',name:'Halloween',           market:'de', category:'节日' },
  { month:10, date:'10/31',name:'ハロウィン',           market:'jp', category:'节日' },
  { month:10, date:'10/31',name:'Halloween',           market:'ca', category:'节日' },
  // ── November ─────────────────────────────────────────────────────────────
  { month:11, date:'11/11',name:'Veterans Day',        market:'us', category:'节日' },
  { month:11, date:'11/11',name:'Remembrance Day',     market:'ca', category:'节日' },
  { month:11, date:'11/26',name:'Thanksgiving',        market:'us', category:'节日', tip:'黑五前关键节点' },
  { month:11, date:'11/27',name:'Black Friday',        market:'us', category:'Amazon大促', tip:'全年最大单日销售' },
  { month:11, date:'11/27',name:'Black Friday',        market:'uk', category:'Amazon大促' },
  { month:11, date:'11/27',name:'Black Week',          market:'de', category:'Amazon大促' },
  { month:11, date:'11/27',name:'Black Friday',        market:'jp', category:'Amazon大促' },
  { month:11, date:'11/27',name:'Black Friday',        market:'ca', category:'Amazon大促' },
  { month:11, date:'11/30',name:'Cyber Monday',        market:'us', category:'Amazon大促', tip:'线上促销高峰' },
  { month:11, date:'11/30',name:'Cyber Monday',        market:'uk', category:'Amazon大促' },
  { month:11, date:'11/30',name:'Cyber Monday',        market:'de', category:'Amazon大促' },
  { month:11, date:'11/30',name:'Cyber Monday',        market:'jp', category:'Amazon大促' },
  { month:11, date:'11/30',name:'Cyber Monday',        market:'ca', category:'Amazon大促' },
  // ── December ─────────────────────────────────────────────────────────────
  { month:12, date:'12/1', name:'Holiday Peak',        market:'us', category:'旺季', tip:'12月全程旺季' },
  { month:12, date:'12/1', name:'Holiday Peak',        market:'uk', category:'旺季' },
  { month:12, date:'12/1', name:'Weihnachtszeit',      market:'de', category:'旺季', tip:'圣诞旺季' },
  { month:12, date:'12/1', name:'お歳暮シーズン',      market:'jp', category:'旺季', tip:'年末送礼旺季' },
  { month:12, date:'12/1', name:'Holiday Peak',        market:'ca', category:'旺季' },
  { month:12, date:'12/25',name:'Christmas',           market:'us', category:'节日' },
  { month:12, date:'12/25',name:'Christmas',           market:'uk', category:'节日' },
  { month:12, date:'12/25',name:'Weihnachten',         market:'de', category:'节日' },
  { month:12, date:'12/25',name:'クリスマス',           market:'jp', category:'节日' },
  { month:12, date:'12/25',name:'Christmas',           market:'ca', category:'节日' },
  { month:12, date:'12/26',name:'Boxing Day',          market:'uk', category:'节日', tip:'圣诞促销' },
  { month:12, date:'12/26',name:'Boxing Day',          market:'ca', category:'节日', tip:'圣诞促销' },
]

export default function MarketingCalendarSummaryPage() {
  const [market, setMarket] = useState<'all' | Market>('all')
  const [cats, setCats] = useState<Set<Category>>(new Set())
  const [month, setMonth] = useState(0)
  const [quarter, setQuarter] = useState(0)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => EVENTS.filter(e => {
    if (market !== 'all' && e.market !== market) return false
    if (cats.size > 0 && !cats.has(e.category)) return false
    if (month > 0 && e.month !== month) return false
    if (quarter > 0 && !Q_MONTHS[quarter - 1].includes(e.month)) return false
    if (query) {
      const q = query.toLowerCase()
      return e.name.toLowerCase().includes(q)
    }
    return true
  }), [market, cats, month, quarter, query])

  const grouped = useMemo(() => {
    const map = new Map<number, GlobalEvent[]>()
    for (const e of filtered) {
      if (!map.has(e.month)) map.set(e.month, [])
      map.get(e.month)!.push(e)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([m, events]) => ({
        month: m,
        label: MONTHS[m - 1],
        events: [...events].sort((a, b) => {
          const da = parseInt(a.date.split('/')[1])
          const db = parseInt(b.date.split('/')[1])
          return da - db
        }),
      }))
  }, [filtered])

  const toggleCat = (c: Category) =>
    setCats(p => { const n = new Set(p); n.has(c) ? n.delete(c) : n.add(c); return n })

  const hasFilter = market !== 'all' || cats.size > 0 || month > 0 || quarter > 0 || !!query
  const resetAll = () => { setMarket('all'); setCats(new Set()); setMonth(0); setQuarter(0); setQuery('') }

  const MARKETS_ORDER: Array<'all' | Market> = ['all', 'us', 'uk', 'de', 'jp', 'ca']

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">📊 2026年亚马逊全球营销日历</h1>
        <p className="text-sm text-gray-400 mt-1">
          美国 / 英国 / 德国 / 日本 / 加拿大五大站点重要节点全览
        </p>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {(Object.entries(MARKET_INFO) as [Market, typeof MARKET_INFO[Market]][]).map(([key, info]) => {
          const count = EVENTS.filter(e => e.market === key).length
          return (
            <button
              key={key}
              onClick={() => setMarket(market === key ? 'all' : key)}
              className={`rounded-xl border p-3 text-center transition-all ${
                market === key
                  ? 'bg-[#5b5bd6]/10 border-[#5b5bd6]/30'
                  : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="text-xl mb-1">{info.flag}</div>
              <div className="text-xs font-bold text-gray-700">{info.name}</div>
              <div className="text-[10px] text-gray-400">{count} 个节点</div>
            </button>
          )
        })}
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索节点名称..."
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-300"
          />
          {query && <button onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-500 text-xs">✕</button>}
        </div>

        {/* Market tabs */}
        <div className="flex gap-2 flex-wrap">
          {MARKETS_ORDER.map(key => (
            <button
              key={key}
              onClick={() => setMarket(key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                market === key
                  ? 'bg-[#5b5bd6]/10 border-[#5b5bd6]/30 text-[#5b5bd6]'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              {key === 'all' ? '🌐 全部' : `${MARKET_INFO[key].flag} ${MARKET_INFO[key].name}`}
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(CAT_STYLE) as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => toggleCat(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                cats.has(cat) ? CAT_STYLE[cat] : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quarter + Month selectors */}
        <div className="flex gap-1.5 flex-wrap items-center">
          {[1, 2, 3, 4].map(q => (
            <button
              key={q}
              onClick={() => { setQuarter(p => p === q ? 0 : q); setMonth(0) }}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                quarter === q ? 'bg-[#5b5bd6]/10 border-[#5b5bd6]/30 text-[#5b5bd6] font-semibold' : 'border-gray-200 text-gray-400'
              }`}
            >
              Q{q}
            </button>
          ))}
          <div className="w-px h-4 bg-gray-200 mx-0.5" />
          {MONTHS.map((mn, i) => (
            <button
              key={i}
              onClick={() => { setMonth(p => p === i + 1 ? 0 : i + 1); setQuarter(0) }}
              className={`text-xs px-2 py-1 rounded-lg border transition-all ${
                month === i + 1 ? 'bg-[#5b5bd6]/10 border-[#5b5bd6]/30 text-[#5b5bd6] font-semibold' : 'border-gray-200 text-gray-400'
              }`}
            >
              {mn}
            </button>
          ))}
          {hasFilter && (
            <button onClick={resetAll} className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline">
              重置筛选
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-4 text-xs text-gray-400">
        <span>{filtered.length} 个节点</span>
        <span>{grouped.length} 个月份</span>
      </div>

      {/* Events */}
      {grouped.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-sm text-gray-400">未找到匹配的节点</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ month: m, label, events }) => (
            <section key={m}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-black text-gray-700">{label}</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-100 to-transparent" />
                <span className="text-xs text-gray-300">{events.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {events.map((ev, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 hover:border-gray-200 transition-all">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${CAT_STYLE[ev.category]}`}>
                        {ev.category}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-sm">{MARKET_INFO[ev.market].flag}</span>
                        <span className="text-xs text-gray-400 tabular-nums">{ev.date}</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-800 leading-snug">{ev.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{MARKET_INFO[ev.market].label}</p>
                    {ev.tip && (
                      <p className="text-[10px] mt-1.5 text-gray-500 leading-relaxed border-t border-gray-100 pt-1.5">
                        💡 {ev.tip}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
