'use client'

import { useState, useMemo } from 'react'

interface Belt {
  id: number
  city: string
  province: string
  region: '华南' | '华东' | '华北' | '华中' | '西南' | '东北'
  categories: string[]
  mainProducts: string
}

const BELTS: Belt[] = [
  // ── 华南 ──────────────────────────────────────────────────────────────────
  { id:1,  city:'广州',       province:'广东', region:'华南', categories:['服装纺织','美妆个护','家居用品'], mainProducts:'服装批发、美妆日化、家居用品、电子配件' },
  { id:2,  city:'深圳',       province:'广东', region:'华南', categories:['电子数码','家居用品','灯具照明'], mainProducts:'电子产品、LED灯具、智能硬件、小家电' },
  { id:3,  city:'东莞',       province:'广东', region:'华南', categories:['家居用品','玩具礼品','电子数码'], mainProducts:'家具、玩具、鞋类、五金电子' },
  { id:4,  city:'佛山',       province:'广东', region:'华南', categories:['家居用品','灯具照明','建材五金'], mainProducts:'陶瓷卫浴、铝材建材、家具、灯饰' },
  { id:5,  city:'中山',       province:'广东', region:'华南', categories:['灯具照明','家居用品','电子数码'], mainProducts:'灯饰照明、家用电器、家居用品' },
  { id:6,  city:'潮州/汕头',  province:'广东', region:'华南', categories:['玩具礼品','服装纺织','食品饮料'], mainProducts:'婚庆礼品、工艺品、内衣、食品' },
  { id:7,  city:'揭阳',       province:'广东', region:'华南', categories:['建材五金','玩具礼品'],            mainProducts:'五金制品、玩具、塑料制品' },
  { id:8,  city:'惠州',       province:'广东', region:'华南', categories:['电子数码'],                       mainProducts:'锂电池、电子器件、新能源产品' },
  // ── 华东 ──────────────────────────────────────────────────────────────────
  { id:9,  city:'义乌',       province:'浙江', region:'华东', categories:['小商品','玩具礼品','节日装饰','家居用品'], mainProducts:'小商品批发、饰品、玩具、圣诞品、日用百货' },
  { id:10, city:'杭州',       province:'浙江', region:'华东', categories:['服装纺织','美妆个护','电子数码'],  mainProducts:'时尚服装、美妆、直播电商、数字消费品' },
  { id:11, city:'宁波',       province:'浙江', region:'华东', categories:['家居用品','文具办公','电子数码'],  mainProducts:'家居用品、文具、电动工具、化妆品' },
  { id:12, city:'温州',       province:'浙江', region:'华东', categories:['鞋类箱包','电子数码','建材五金'],  mainProducts:'皮鞋、眼镜、电气设备、打火机' },
  { id:13, city:'嘉兴',       province:'浙江', region:'华东', categories:['鞋类箱包','服装纺织'],            mainProducts:'箱包皮具、毛衫针织、羽绒服' },
  { id:14, city:'绍兴/柯桥',  province:'浙江', region:'华东', categories:['服装纺织'],                       mainProducts:'纺织面料、印染布料、家纺产品' },
  { id:15, city:'台州',       province:'浙江', region:'华东', categories:['汽车配件','建材五金','家居用品'],  mainProducts:'摩托车配件、塑料模具、眼镜、缝纫机' },
  { id:16, city:'海宁',       province:'浙江', region:'华东', categories:['鞋类箱包','服装纺织'],            mainProducts:'皮革制品、皮草、皮衣' },
  { id:17, city:'泉州',       province:'福建', region:'华东', categories:['鞋类箱包','服装纺织','运动户外'], mainProducts:'运动鞋、休闲鞋、品牌代工服装' },
  { id:18, city:'莆田',       province:'福建', region:'华东', categories:['鞋类箱包'],                       mainProducts:'运动鞋（品牌代工）、旅游鞋' },
  { id:19, city:'福州',       province:'福建', region:'华东', categories:['食品饮料','鞋类箱包'],            mainProducts:'茶叶、海产品、鞋服' },
  { id:20, city:'厦门',       province:'福建', region:'华东', categories:['灯具照明','食品饮料','电子数码'],  mainProducts:'LED照明、食品、石材、机械设备' },
  { id:21, city:'苏州',       province:'江苏', region:'华东', categories:['电子数码','服装纺织','建材五金'],  mainProducts:'精密机械、电子信息、丝绸纺织' },
  { id:22, city:'常州',       province:'江苏', region:'华东', categories:['汽车配件','电子数码'],            mainProducts:'工程机械、动力电池、碳纤维' },
  { id:23, city:'扬州',       province:'江苏', region:'华东', categories:['美妆个护','玩具礼品'],            mainProducts:'美容美发工具、化妆品、玩具' },
  { id:24, city:'青岛',       province:'山东', region:'华东', categories:['服装纺织','家居用品','食品饮料'],  mainProducts:'家纺、地毯、海洋食品、啤酒' },
  { id:25, city:'临沂',       province:'山东', region:'华东', categories:['小商品','建材五金','家居用品'],   mainProducts:'小商品批发、日化、五金建材' },
  { id:26, city:'潍坊',       province:'山东', region:'华东', categories:['玩具礼品','节日装饰'],            mainProducts:'风筝、节日装饰品、蔬菜' },
  { id:27, city:'景德镇',     province:'江西', region:'华东', categories:['家居用品','玩具礼品'],            mainProducts:'陶瓷、瓷器工艺品、茶具' },
  { id:28, city:'上海',       province:'上海', region:'华东', categories:['美妆个护','电子数码','食品饮料'], mainProducts:'化工原料、医疗器械、高端消费品' },
  // ── 华北 ──────────────────────────────────────────────────────────────────
  { id:29, city:'白沟',       province:'河北', region:'华北', categories:['鞋类箱包'],                       mainProducts:'箱包、旅行包、钱包皮具' },
  { id:30, city:'保定',       province:'河北', region:'华北', categories:['汽车配件','服装纺织'],            mainProducts:'汽车配件、羽绒服、纺织品' },
  { id:31, city:'辛集',       province:'河北', region:'华北', categories:['鞋类箱包'],                       mainProducts:'皮革、皮衣、皮鞋' },
  { id:32, city:'北京',       province:'北京', region:'华北', categories:['电子数码','小商品'],              mainProducts:'文化创意产品、科技产品、旅游纪念品' },
  { id:33, city:'天津',       province:'天津', region:'华北', categories:['建材五金','汽车配件'],            mainProducts:'机械、化工、自行车、汽车配件' },
  // ── 华中 ──────────────────────────────────────────────────────────────────
  { id:34, city:'许昌',       province:'河南', region:'华中', categories:['美妆个护'],                       mainProducts:'假发、发制品、美发工具' },
  { id:35, city:'新乡',       province:'河南', region:'华中', categories:['服装纺织','家居用品'],            mainProducts:'家纺床品、劳保用品' },
  { id:36, city:'株洲',       province:'湖南', region:'华中', categories:['服装纺织'],                       mainProducts:'服装批发、童装、休闲装' },
  { id:37, city:'武汉',       province:'湖北', region:'华中', categories:['电子数码','汽车配件'],            mainProducts:'光电子、汽车零部件、医疗器械' },
  // ── 西南 ──────────────────────────────────────────────────────────────────
  { id:38, city:'成都',       province:'四川', region:'西南', categories:['家居用品','服装纺织','电子数码'], mainProducts:'家具、竹制品、时尚服装、电商仓储' },
  { id:39, city:'重庆',       province:'重庆', region:'西南', categories:['汽车配件','电子数码'],            mainProducts:'摩托车、汽车配件、笔记本电脑' },
  { id:40, city:'昆明',       province:'云南', region:'西南', categories:['食品饮料','玩具礼品'],            mainProducts:'鲜花、茶叶、烟草、特色农产品' },
  // ── 东北 ──────────────────────────────────────────────────────────────────
  { id:41, city:'沈阳',       province:'辽宁', region:'东北', categories:['建材五金','汽车配件'],            mainProducts:'机械设备、钢铁、化工产品' },
]

const ALL_PROVINCES = Array.from(new Set(BELTS.map(b => b.province))).sort()
const ALL_CATEGORIES = [
  '小商品', '电子数码', '服装纺织', '玩具礼品', '美妆个护',
  '运动户外', '家居用品', '鞋类箱包', '建材五金', '汽车配件',
  '节日装饰', '文具办公', '灯具照明', '食品饮料',
]
const ALL_REGIONS = ['华南', '华东', '华北', '华中', '西南', '东北'] as const

export default function ChinaIndustryBeltsPage() {
  const [query, setQuery] = useState('')
  const [province, setProvince] = useState('')
  const [region, setRegion] = useState('')
  const [category, setCategory] = useState('')

  const filtered = useMemo(() => BELTS.filter(b => {
    if (province && b.province !== province) return false
    if (region && b.region !== region) return false
    if (category && !b.categories.includes(category)) return false
    if (query) {
      const q = query.toLowerCase()
      return (
        b.city.includes(q) ||
        b.province.includes(q) ||
        b.mainProducts.toLowerCase().includes(q) ||
        b.categories.some(c => c.includes(q))
      )
    }
    return true
  }), [query, province, region, category])

  const hasFilter = !!query || !!province || !!region || !!category
  const resetAll = () => { setQuery(''); setProvince(''); setRegion(''); setCategory('') }

  const REGION_COLORS: Record<string, string> = {
    '华南': 'bg-orange-100 text-orange-600',
    '华东': 'bg-blue-100 text-blue-600',
    '华北': 'bg-gray-100 text-gray-600',
    '华中': 'bg-green-100 text-green-600',
    '西南': 'bg-purple-100 text-purple-600',
    '东北': 'bg-red-100 text-red-600',
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">🏭 中国产业带</h1>
        <p className="text-sm text-gray-400 mt-1">
          {BELTS.length} 个产业带 · {ALL_PROVINCES.length} 个省份 · 按大区 / 省份 / 品类快速筛选
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
            placeholder="搜索城市、省份或产品品类..."
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-300"
          />
          {query && <button onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-500 text-xs">✕</button>}
        </div>

        {/* Region filter */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-gray-400 flex-shrink-0">大区</span>
          {ALL_REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setRegion(p => p === r ? '' : r)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                region === r
                  ? `${REGION_COLORS[r]} border-current/30`
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Province filter */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-gray-400 flex-shrink-0">省份</span>
          <select
            value={province}
            onChange={e => setProvince(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 outline-none bg-white focus:border-[#5b5bd6]/40"
          >
            <option value="">全部省份</option>
            {ALL_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="text-xs text-gray-400 flex-shrink-0">品类</span>
          {ALL_CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(p => p === c ? '' : c)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                category === c
                  ? 'bg-[#5b5bd6]/10 border-[#5b5bd6]/30 text-[#5b5bd6] font-semibold'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {hasFilter && (
          <div className="flex justify-end">
            <button onClick={resetAll} className="text-xs text-gray-400 hover:text-gray-600 underline">
              重置筛选
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-4 text-xs text-gray-400">
        <span>{filtered.length} 个产业带</span>
        <span>{Array.from(new Set(filtered.map(b => b.province))).length} 个省份</span>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">🏗️</p>
          <p className="text-sm text-gray-400">未找到匹配的产业带</p>
          <p className="text-xs text-gray-300 mt-1">尝试调整筛选条件或清空搜索词</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(belt => (
            <div
              key={belt.id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-black text-gray-800">{belt.city}</h3>
                  <p className="text-xs text-gray-400">{belt.province}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${REGION_COLORS[belt.region]}`}>
                  {belt.region}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-2.5">{belt.mainProducts}</p>
              <div className="flex gap-1 flex-wrap">
                {belt.categories.map(c => (
                  <span
                    key={c}
                    onClick={() => setCategory(prev => prev === c ? '' : c)}
                    className={`text-[10px] px-1.5 py-0.5 rounded border cursor-pointer transition-all ${
                      category === c
                        ? 'bg-[#5b5bd6]/10 border-[#5b5bd6]/30 text-[#5b5bd6] font-semibold'
                        : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
