import Footer from '@/components/Footer'

const EVENTS = [
  { month: '一月', events: ["New Year's Day (1/1)", "Martin Luther King Jr. Day (1/20)"] },
  { month: '二月', events: ["Valentine's Day (2/14)", "Presidents' Day (2/17)"] },
  { month: '三月', events: ["St. Patrick's Day (3/17)", "Spring Equinox (3/20)"] },
  { month: '四月', events: ["Easter (4/20)", "Earth Day (4/22)"] },
  { month: '五月', events: ["Mother's Day (5/11)", "Memorial Day (5/26)"] },
  { month: '六月', events: ["Father's Day (6/15)", "Juneteenth (6/19)"] },
  { month: '七月', events: ['Prime Day (~7/8-9)', "Independence Day (7/4)"] },
  { month: '八月', events: ['Back to School Season', 'End of Summer Sales'] },
  { month: '九月', events: ['Labor Day (9/1)', 'Hispanic Heritage Month Starts'] },
  { month: '十月', events: ["Halloween (10/31)", 'FBA Peak Season Surcharge Starts (10/15)'] },
  { month: '十一月', events: ["Thanksgiving (11/27)", "Black Friday (11/28)", "Cyber Monday (12/1)"] },
  { month: '十二月', events: ["Christmas (12/25)", "New Year's Eve (12/31)"] },
]

export default function MarketingCalendarPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">2026年电商营销日历</h1>
      <p className="text-gray-500 text-sm mb-8">美国亚马逊主要营销节点一览</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EVENTS.map(m => (
          <div key={m.month} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-700 mb-3 text-lg">{m.month}</h2>
            <ul className="space-y-1">
              {m.events.map(e => <li key={e} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span>{e}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  )
}
