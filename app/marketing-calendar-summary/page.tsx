import Footer from '@/components/Footer'

const MARKETS = [
  { name: '🇺🇸 美国', key: ['Prime Day', 'Black Friday', 'Cyber Monday', 'Back to School', 'Holiday Season'] },
  { name: '🇬🇧 英国', key: ['Boxing Day (12/26)', 'Black Friday', 'Summer Sale', 'Prime Day'] },
  { name: '🇩🇪 德国', key: ['Weihnachten (12/25)', 'Black Week', 'Prime Day', 'Oktoberfest Season'] },
  { name: '🇯🇵 日本', key: ['プライムデー', 'お中元 (7月)', 'お歳暮 (12月)', 'ブラックフライデー'] },
  { name: '🇨🇦 加拿大', key: ['Prime Day', 'Boxing Day (12/26)', 'Back to School', 'Black Friday'] },
]

export default function MarketingCalendarSummaryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">2026年亚马逊全球营销日历</h1>
      <p className="text-gray-500 text-sm mb-8">主要站点核心营销节点对比</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MARKETS.map(m => (
          <div key={m.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-700 mb-3">{m.name}</h2>
            <ul className="space-y-1">
              {m.key.map(k => <li key={k} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-orange-400">•</span>{k}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  )
}
