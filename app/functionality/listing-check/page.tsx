'use client'
import { useMemo, useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const BANNED_SYMBOLS = ['!', '?', '$', '~', '*', '#', '@', '^', '<', '>', '{', '}']
const BANNED_PHRASES = [
  'best seller', 'best-seller', '100%', 'free shipping', 'satisfaction guaranteed',
  'full refund', '全额退款', 'eco-friendly', 'eco friendly', '生态友好', 'environmentally friendly',
  'cheap', 'sale', 'discount', 'on sale', 'top rated', 'amazon',
]
const LOWERCASE_OK = new Set(['a', 'an', 'the', 'and', 'or', 'for', 'of', 'to', 'in', 'on', 'with', 'by', 'at'])

type Status = 'pass' | 'warn' | 'fail'
interface Check { label: string; status: Status; detail: string }

function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

export default function ListingCheckPage() {
  const [title, setTitle] = useState('')
  const [bullets, setBullets] = useState(['', '', '', '', ''])
  const [desc, setDesc] = useState('')
  const [keywords, setKeywords] = useState('')

  const kwList = useMemo(() =>
    keywords.split(/[,，\n]/).map(k => k.trim().toLowerCase()).filter(Boolean),
    [keywords])

  const checks = useMemo<Check[]>(() => {
    const out: Check[] = []
    const titleLen = title.length
    out.push({
      label: '标题字符数', status: !title ? 'fail' : titleLen > 200 ? 'fail' : titleLen > 150 ? 'warn' : 'pass',
      detail: !title ? '标题不能为空' : titleLen > 200 ? `${titleLen} 字符，超过 200 上限` : titleLen > 150 ? `${titleLen} 字符，移动端可能被折叠（建议 ≤150）` : `${titleLen} 字符`,
    })
    const titleSyms = BANNED_SYMBOLS.filter(s => title.includes(s))
    out.push({
      label: '标题禁用符号', status: titleSyms.length ? 'fail' : 'pass',
      detail: titleSyms.length ? `含禁用符号：${titleSyms.join(' ')}` : '未发现禁用符号',
    })
    out.push({
      label: '标题结尾标点', status: /[.,;:!?，。；：]$/.test(title.trim()) ? 'fail' : 'pass',
      detail: /[.,;:!?，。；：]$/.test(title.trim()) ? '标题结尾不应有标点符号' : '结尾无标点',
    })
    out.push({
      label: '标题非全大写', status: title && title === title.toUpperCase() && /[A-Z]/.test(title) ? 'fail' : 'pass',
      detail: title && title === title.toUpperCase() && /[A-Z]/.test(title) ? '标题全大写会被降权' : '大小写正常',
    })
    const badCap = title.split(/\s+/).filter(w => /^[a-z]/.test(w) && !LOWERCASE_OK.has(w.toLowerCase()) && w.length > 1)
    out.push({
      label: '标题首字母大写', status: badCap.length ? 'warn' : 'pass',
      detail: badCap.length ? `未首字母大写（介词连词除外）：${badCap.slice(0, 5).join(' ')}` : '符合首字母大写规范',
    })
    const filled = bullets.filter(b => b.trim())
    out.push({
      label: '五点描述数量', status: filled.length === 5 ? 'pass' : filled.length >= 3 ? 'warn' : 'fail',
      detail: `已填写 ${filled.length}/5 条`,
    })
    const longBullet = bullets.findIndex(b => b.length > 250)
    out.push({
      label: '要点字符数', status: longBullet >= 0 ? 'warn' : 'pass',
      detail: longBullet >= 0 ? `第 ${longBullet + 1} 条要点超 250 字符，移动端易被折叠` : '各要点长度合规',
    })
    out.push({
      label: '长描述字符数', status: desc.length > 2000 ? 'fail' : 'pass',
      detail: desc.length > 2000 ? `${desc.length} 字符，超过 2000 上限` : `${desc.length} 字符`,
    })
    const allText = [title, ...bullets, desc].join(' ').toLowerCase()
    const foundPhrases = BANNED_PHRASES.filter(p => allText.includes(p.toLowerCase()))
    out.push({
      label: '违禁内容检测', status: foundPhrases.length ? 'fail' : 'pass',
      detail: foundPhrases.length ? `含违禁短语：${foundPhrases.join('、')}` : '未发现违禁短语',
    })
    return out
  }, [title, bullets, desc])

  const kwStats = useMemo(() => {
    const allText = [title, ...bullets, desc].join(' ').toLowerCase()
    return kwList.map(kw => {
      const matches = allText.match(new RegExp(escapeRe(kw), 'g'))
      return { kw, count: matches ? matches.length : 0 }
    })
  }, [kwList, title, bullets, desc])

  const totalEmbed = kwStats.reduce((s, k) => s + k.count, 0)
  const passed = checks.filter(c => c.status === 'pass').length

  const setBullet = (i: number, v: string) => setBullets(p => p.map((b, idx) => idx === i ? v : b))
  const ic = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40 resize-none'

  const ICONS: Record<Status, React.ReactNode> = {
    pass: <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5"/>,
    warn: <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5"/>,
    fail: <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5"/>,
  }
  const CARD: Record<Status, string> = {
    pass: 'bg-green-50 border-green-200', warn: 'bg-orange-50 border-orange-200', fail: 'bg-red-50 border-red-200',
  }

  return (
    <ToolLayout title="Listing自检工具" description="文案合规检查 + 关键词埋入统计，覆盖标题/五点/描述全项规则">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">商品标题（{title.length} 字符）</label>
            <textarea value={title} onChange={e => setTitle(e.target.value)} rows={3} placeholder="粘贴产品标题..." className={ic}/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">五点描述（每个要点单独填写）</label>
            {bullets.map((b, i) => (
              <textarea key={i} value={b} onChange={e => setBullet(i, e.target.value)} rows={2}
                placeholder={`要点 ${i + 1}`} className={`${ic} mb-2`}/>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">长描述（{desc.length} 字符）</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="粘贴长描述..." className={ic}/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">产品关键词（用逗号分隔或分行填写）</label>
            <textarea value={keywords} onChange={e => setKeywords(e.target.value)} rows={3}
              placeholder="walnut organizer, desk storage, ..." className={ic}/>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">合规检查</h3>
            <span className={`text-sm font-bold ${passed === checks.length ? 'text-green-600' : 'text-orange-500'}`}>
              {passed}/{checks.length} 通过
            </span>
          </div>
          {checks.map(c => (
            <div key={c.label} className={`flex items-start gap-3 p-3 rounded-xl border ${CARD[c.status]}`}>
              {ICONS[c.status]}
              <div>
                <p className="text-sm font-medium text-gray-700">{c.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.detail}</p>
              </div>
            </div>
          ))}

          {kwList.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">关键词埋入统计</h3>
                <span className="text-xs text-gray-500">埋入总次数 {totalEmbed}</span>
              </div>
              <div className="space-y-1">
                {kwStats.map(({ kw, count }) => (
                  <div key={kw} className="flex justify-between text-sm py-1 border-b border-gray-50">
                    <span className="text-gray-700">{kw}</span>
                    <span className={`font-semibold ${count === 0 ? 'text-red-500' : 'text-[#5b5bd6]'}`}>
                      {count === 0 ? '未埋入' : `${count} 次`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
