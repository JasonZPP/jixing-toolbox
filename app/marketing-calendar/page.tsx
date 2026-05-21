'use client'

import { useState, useMemo } from 'react'

type Country = 'us' | 'jp' | 'global'
type Category = '法定假日' | '海外节日' | '活动促销' | '节气季节'

interface CalEvent {
  month: number
  date: string
  name: string
  nameEn: string
  category: Category
  country: Country
  tip?: string
}

const CAT_STYLE: Record<Category, { pill: string; card: string }> = {
  '法定假日': { pill: 'bg-red-100 text-red-600 border-red-200',      card: 'bg-red-50 border-red-100' },
  '海外节日': { pill: 'bg-blue-100 text-blue-600 border-blue-200',   card: 'bg-blue-50 border-blue-100' },
  '活动促销': { pill: 'bg-purple-100 text-purple-600 border-purple-200', card: 'bg-purple-50 border-purple-100' },
  '节气季节': { pill: 'bg-green-100 text-green-600 border-green-200', card: 'bg-green-50 border-green-100' },
}

const MONTHS = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
const Q_MONTHS: [number[], number[], number[], number[]] = [[1,2,3],[4,5,6],[7,8,9],[10,11,12]]

const EVENTS: CalEvent[] = [
  // ── January ──────────────────────────────────────────────────────────────
  { month:1,  date:'1/1',  name:'元旦',            nameEn:"New Year's Day",         category:'法定假日', country:'us' },
  { month:1,  date:'1/1',  name:'元日',            nameEn:"New Year's Day (JP)",    category:'法定假日', country:'jp' },
  { month:1,  date:'1/5',  name:'小寒',            nameEn:'Minor Cold',             category:'节气季节', country:'global' },
  { month:1,  date:'1/12', name:'成人の日',        nameEn:'Coming of Age Day',      category:'法定假日', country:'jp' },
  { month:1,  date:'1/19', name:'马丁路德金日',    nameEn:'MLK Day',                category:'法定假日', country:'us' },
  { month:1,  date:'1/20', name:'大寒',            nameEn:'Major Cold',             category:'节气季节', country:'global' },
  // ── February ──────────────────────────────────────────────────────────────
  { month:2,  date:'2/1',  name:'超级碗备货期',    nameEn:'Super Bowl Week (~)',    category:'活动促销', country:'us',    tip:'体育周边、零食、家居娱乐备货' },
  { month:2,  date:'2/3',  name:'立春',            nameEn:'Start of Spring',        category:'节气季节', country:'global' },
  { month:2,  date:'2/11', name:'建国記念の日',    nameEn:'National Foundation Day',category:'法定假日', country:'jp' },
  { month:2,  date:'2/14', name:'情人节',          nameEn:"Valentine's Day",        category:'海外节日', country:'us',    tip:'礼品、首饰、鲜花、糖果旺季' },
  { month:2,  date:'2/14', name:'バレンタインデー',nameEn:"Valentine's Day (JP)",   category:'海外节日', country:'jp',    tip:'日本女生送男生巧克力' },
  { month:2,  date:'2/16', name:'总统日',          nameEn:"Presidents' Day",        category:'法定假日', country:'us' },
  { month:2,  date:'2/18', name:'雨水',            nameEn:'Rain Water',             category:'节气季节', country:'global' },
  { month:2,  date:'2/23', name:'天皇誕生日',      nameEn:"Emperor's Birthday",     category:'法定假日', country:'jp' },
  // ── March ──────────────────────────────────────────────────────────────────
  { month:3,  date:'3/3',  name:'ひな祭り',        nameEn:'Hinamatsuri',            category:'海外节日', country:'jp',    tip:'女儿节，娃娃/玩具/和风礼品' },
  { month:3,  date:'3/5',  name:'惊蛰',            nameEn:'Awakening of Insects',   category:'节气季节', country:'global' },
  { month:3,  date:'3/14', name:'ホワイトデー',    nameEn:'White Day',              category:'海外节日', country:'jp',    tip:'情人节回礼，男生送女生糖果礼品' },
  { month:3,  date:'3/17', name:'圣帕特里克节',    nameEn:"St. Patrick's Day",      category:'海外节日', country:'us' },
  { month:3,  date:'3/20', name:'春分の日',        nameEn:'Vernal Equinox Day',     category:'法定假日', country:'jp' },
  { month:3,  date:'3/20', name:'春分',            nameEn:'Spring Equinox',         category:'节气季节', country:'global' },
  { month:3,  date:'3/22', name:'亚马逊春季大促',  nameEn:'Amazon Spring Sale (~)', category:'活动促销', country:'us',    tip:'春季大促，家居、户外品类流量高峰' },
  // ── April ──────────────────────────────────────────────────────────────────
  { month:4,  date:'4/4',  name:'清明',            nameEn:'Clear and Bright',       category:'节气季节', country:'global' },
  { month:4,  date:'4/5',  name:'复活节',          nameEn:'Easter Sunday',          category:'海外节日', country:'us',    tip:'家居装饰、礼篮类产品需求旺' },
  { month:4,  date:'4/20', name:'谷雨',            nameEn:'Grain Rain',             category:'节气季节', country:'global' },
  { month:4,  date:'4/29', name:'昭和の日',        nameEn:'Showa Day',              category:'法定假日', country:'jp' },
  // ── May ──────────────────────────────────────────────────────────────────
  { month:5,  date:'5/3',  name:'憲法記念日',      nameEn:'Constitution Day',       category:'法定假日', country:'jp' },
  { month:5,  date:'5/4',  name:'みどりの日',      nameEn:'Greenery Day',           category:'法定假日', country:'jp' },
  { month:5,  date:'5/5',  name:'立夏',            nameEn:'Start of Summer',        category:'节气季节', country:'global' },
  { month:5,  date:'5/5',  name:'こどもの日',      nameEn:"Children's Day",         category:'法定假日', country:'jp',    tip:'儿童节，玩具/礼品旺季' },
  { month:5,  date:'5/10', name:'母亲节',          nameEn:"Mother's Day",           category:'海外节日', country:'us',    tip:'家居、美妆、珠宝饰品旺季' },
  { month:5,  date:'5/20', name:'小满',            nameEn:'Grain Buds',             category:'节气季节', country:'global' },
  { month:5,  date:'5/25', name:'阵亡将士纪念日',  nameEn:'Memorial Day',           category:'法定假日', country:'us' },
  // ── June ──────────────────────────────────────────────────────────────────
  { month:6,  date:'6/5',  name:'芒种',            nameEn:'Grain in Ear',           category:'节气季节', country:'global' },
  { month:6,  date:'6/19', name:'六月节',          nameEn:'Juneteenth',             category:'法定假日', country:'us' },
  { month:6,  date:'6/21', name:'父亲节',          nameEn:"Father's Day",           category:'海外节日', country:'us',    tip:'户外装备、工具、科技礼品旺季' },
  { month:6,  date:'6/21', name:'夏至',            nameEn:'Summer Solstice',        category:'节气季节', country:'global' },
  // ── July ──────────────────────────────────────────────────────────────────
  { month:7,  date:'7/1',  name:'お中元シーズン',  nameEn:'Obon Gift Season',       category:'活动促销', country:'jp',    tip:'日本中元节送礼旺季（7-8月），食品/家居礼盒' },
  { month:7,  date:'7/4',  name:'独立日',          nameEn:'Independence Day',       category:'法定假日', country:'us' },
  { month:7,  date:'7/7',  name:'小暑',            nameEn:'Minor Heat',             category:'节气季节', country:'global' },
  { month:7,  date:'7/15', name:'Prime Day',       nameEn:'Amazon Prime Day (~)',   category:'活动促销', country:'us',    tip:'全年最大促销之一，提前6周备货，广告预算翻倍' },
  { month:7,  date:'7/20', name:'海の日',          nameEn:'Marine Day',             category:'法定假日', country:'jp' },
  { month:7,  date:'7/22', name:'大暑',            nameEn:'Major Heat',             category:'节气季节', country:'global' },
  // ── August ──────────────────────────────────────────────────────────────
  { month:8,  date:'8/1',  name:'返校季',          nameEn:'Back to School',         category:'活动促销', country:'us',    tip:'文具、背包、收纳、学习用品旺季' },
  { month:8,  date:'8/7',  name:'立秋',            nameEn:'Start of Autumn',        category:'节气季节', country:'global' },
  { month:8,  date:'8/11', name:'山の日',          nameEn:'Mountain Day',           category:'法定假日', country:'jp' },
  { month:8,  date:'8/13', name:'お盆',            nameEn:'Obon Festival',          category:'海外节日', country:'jp',    tip:'日本盂兰盆节，家居、礼品需求' },
  { month:8,  date:'8/22', name:'处暑',            nameEn:'End of Heat',            category:'节气季节', country:'global' },
  // ── September ────────────────────────────────────────────────────────────
  { month:9,  date:'9/1',  name:'Q4备货入库截止',  nameEn:'Q4 Inbound Deadline (~)',category:'活动促销', country:'us',    tip:'旺季备货须在9月中前到达FBA仓库' },
  { month:9,  date:'9/7',  name:'劳工节',          nameEn:'Labor Day',              category:'法定假日', country:'us' },
  { month:9,  date:'9/7',  name:'白露',            nameEn:'White Dew',              category:'节气季节', country:'global' },
  { month:9,  date:'9/21', name:'敬老の日',        nameEn:'Respect for the Aged Day', category:'法定假日', country:'jp' },
  { month:9,  date:'9/22', name:'秋分',            nameEn:'Autumnal Equinox',       category:'节气季节', country:'global' },
  { month:9,  date:'9/23', name:'秋分の日',        nameEn:'Autumn Equinox Day',     category:'法定假日', country:'jp' },
  // ── October ──────────────────────────────────────────────────────────────
  { month:10, date:'10/7', name:'寒露',            nameEn:'Cold Dew',               category:'节气季节', country:'global' },
  { month:10, date:'10/12',name:'哥伦布日',        nameEn:'Columbus Day',           category:'法定假日', country:'us' },
  { month:10, date:'10/12',name:'スポーツの日',    nameEn:'Sports Day',             category:'法定假日', country:'jp' },
  { month:10, date:'10/13',name:'Prime早期促销',   nameEn:'Prime Early Access (~)', category:'活动促销', country:'us',    tip:'年底旺季预热，流量提升明显，提前跑促销位' },
  { month:10, date:'10/15',name:'FBA旺季仓储费起征',nameEn:'FBA Peak Surcharge Starts', category:'活动促销', country:'us', tip:'10/15-1/14旺季仓储附加费，控制库存量' },
  { month:10, date:'10/23',name:'霜降',            nameEn:"Frost's Descent",        category:'节气季节', country:'global' },
  { month:10, date:'10/31',name:'万圣节',          nameEn:'Halloween',              category:'海外节日', country:'us',    tip:'装饰品、服装、糖果旺季，提前3周出单' },
  { month:10, date:'10/31',name:'ハロウィン',      nameEn:'Halloween (JP)',         category:'海外节日', country:'jp' },
  // ── November ─────────────────────────────────────────────────────────────
  { month:11, date:'11/3', name:'文化の日',        nameEn:'Culture Day',            category:'法定假日', country:'jp' },
  { month:11, date:'11/7', name:'立冬',            nameEn:'Start of Winter',        category:'节气季节', country:'global' },
  { month:11, date:'11/11',name:'退伍军人节',      nameEn:'Veterans Day',           category:'法定假日', country:'us' },
  { month:11, date:'11/15',name:'七五三',          nameEn:'Shichi-go-san',          category:'海外节日', country:'jp',    tip:'儿童成长礼仪节，礼品/和服配饰' },
  { month:11, date:'11/22',name:'小雪',            nameEn:'Minor Snow',             category:'节气季节', country:'global' },
  { month:11, date:'11/23',name:'勤労感謝の日',    nameEn:'Labour Thanksgiving Day',category:'法定假日', country:'jp' },
  { month:11, date:'11/26',name:'感恩节',          nameEn:'Thanksgiving Day',       category:'法定假日', country:'us',    tip:'黑五前关键节点，旺季高峰开始' },
  { month:11, date:'11/27',name:'黑色星期五',      nameEn:'Black Friday',           category:'活动促销', country:'us',    tip:'全年最大单日销售节点，广告竞争最激烈' },
  { month:11, date:'11/30',name:'网络星期一',      nameEn:'Cyber Monday',           category:'活动促销', country:'us',    tip:'线上促销高峰，转化率全年最高' },
  // ── December ─────────────────────────────────────────────────────────────
  { month:12, date:'12/1', name:'节日旺季',        nameEn:'Holiday Peak Season',    category:'活动促销', country:'us',    tip:'12月全程保持FBA库存充足，勿断货' },
  { month:12, date:'12/1', name:'お歳暮シーズン',  nameEn:'Year-end Gift Season',   category:'活动促销', country:'jp',    tip:'日本年末送礼旺季，食品/家居礼盒热销' },
  { month:12, date:'12/7', name:'大雪',            nameEn:'Major Snow',             category:'节气季节', country:'global' },
  { month:12, date:'12/21',name:'冬至',            nameEn:'Winter Solstice',        category:'节气季节', country:'global' },
  { month:12, date:'12/25',name:'圣诞节',          nameEn:'Christmas Day',          category:'法定假日', country:'us',    tip:'礼品包装、家居装饰、玩具全线旺季' },
  { month:12, date:'12/25',name:'クリスマス',      nameEn:'Christmas (JP)',         category:'海外节日', country:'jp' },
  { month:12, date:'12/31',name:'新年前夜',        nameEn:"New Year's Eve",         category:'海外节日', country:'us' },
]

export default function MarketingCalendarPage() {
  const [country, setCountry] = useState<'all' | 'us' | 'jp'>('all')
  const [cats, setCats] = useState<Set<Category>>(new Set())
  const [month, setMonth] = useState(0)
  const [quarter, setQuarter] = useState(0)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => EVENTS.filter(e => {
    if (country === 'us' && e.country !== 'us' && e.country !== 'global') return false
    if (country === 'jp' && e.country !== 'jp' && e.country !== 'global') return false
    if (cats.size > 0 && !cats.has(e.category)) return false
    if (month > 0 && e.month !== month) return false
    if (quarter > 0 && !Q_MONTHS[quarter - 1].includes(e.month)) return false
    if (query) {
      const q = query.toLowerCase()
      return e.name.toLowerCase().includes(q) || e.nameEn.toLowerCase().includes(q)
    }
    return true
  }), [country, cats, month, quarter, query])

  const grouped = useMemo(() => {
    const map = new Map<number, CalEvent[]>()
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
    setCats(p => { const n = new Set(p); if (n.has(c)) n.delete(c); else n.add(c); return n })

  const hasFilter = country !== 'all' || cats.size > 0 || month > 0 || quarter > 0 || !!query

  const resetAll = () => { setCountry('all'); setCats(new Set()); setMonth(0); setQuarter(0); setQuery('') }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">📅 2026年电商营销日历</h1>
        <p className="text-sm text-gray-400 mt-1">
          全览节日、促销节点与重要活动 · 支持按国家 / 类型 / 月份筛选
        </p>
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
            placeholder="搜索节日或活动名称..."
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-300"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-500 text-xs">✕</button>
          )}
        </div>

        {/* Country tabs */}
        <div className="flex gap-2">
          {(['all', 'us', 'jp'] as const).map(key => (
            <button
              key={key}
              onClick={() => setCountry(key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                country === key
                  ? 'bg-[#5b5bd6]/10 border-[#5b5bd6]/30 text-[#5b5bd6]'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500'
              }`}
            >
              {key === 'all' ? '🌐 全部' : key === 'us' ? '🇺🇸 美国' : '🇯🇵 日本'}
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
                cats.has(cat) ? CAT_STYLE[cat].pill : 'border-gray-200 text-gray-400 hover:border-gray-300'
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
                quarter === q
                  ? 'bg-[#5b5bd6]/10 border-[#5b5bd6]/30 text-[#5b5bd6] font-semibold'
                  : 'border-gray-200 text-gray-400'
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
                month === i + 1
                  ? 'bg-[#5b5bd6]/10 border-[#5b5bd6]/30 text-[#5b5bd6] font-semibold'
                  : 'border-gray-200 text-gray-400'
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
          <p className="text-sm text-gray-400">未找到匹配的活动节点</p>
          <p className="text-xs text-gray-300 mt-1">尝试调整筛选条件</p>
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
                  <div key={i} className={`rounded-xl border p-3 ${CAT_STYLE[ev.category].card}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${CAT_STYLE[ev.category].pill}`}>
                        {ev.category}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {ev.country !== 'global' && (
                          <span className="text-xs">{ev.country === 'us' ? '🇺🇸' : '🇯🇵'}</span>
                        )}
                        <span className="text-xs text-gray-400 tabular-nums">{ev.date}</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-800 leading-snug">{ev.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{ev.nameEn}</p>
                    {ev.tip && (
                      <p className="text-[10px] mt-1.5 text-gray-500 leading-relaxed border-t border-gray-200/60 pt-1.5">
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
