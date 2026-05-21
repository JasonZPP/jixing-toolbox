'use client'
import { useState, useEffect } from 'react'
import ToolLayout from '@/components/ToolLayout'

interface Site { code: string; name: string; domain: string }
interface Region { region: string; sites: Site[] }

const REGIONS: Region[] = [
  { region: '北美', sites: [
    { code: 'US', name: '美国', domain: 'amazon.com' },
    { code: 'CA', name: '加拿大', domain: 'amazon.ca' },
    { code: 'MX', name: '墨西哥', domain: 'amazon.com.mx' },
    { code: 'BR', name: '巴西', domain: 'amazon.com.br' },
  ]},
  { region: '欧洲', sites: [
    { code: 'UK', name: '英国', domain: 'amazon.co.uk' },
    { code: 'DE', name: '德国', domain: 'amazon.de' },
    { code: 'FR', name: '法国', domain: 'amazon.fr' },
    { code: 'IT', name: '意大利', domain: 'amazon.it' },
    { code: 'ES', name: '西班牙', domain: 'amazon.es' },
    { code: 'NL', name: '荷兰', domain: 'amazon.nl' },
    { code: 'SE', name: '瑞典', domain: 'amazon.se' },
    { code: 'PL', name: '波兰', domain: 'amazon.pl' },
    { code: 'BE', name: '比利时', domain: 'amazon.com.be' },
    { code: 'TR', name: '土耳其', domain: 'amazon.com.tr' },
  ]},
  { region: '亚太', sites: [
    { code: 'JP', name: '日本', domain: 'amazon.co.jp' },
    { code: 'AU', name: '澳大利亚', domain: 'amazon.com.au' },
    { code: 'SG', name: '新加坡', domain: 'amazon.sg' },
    { code: 'IN', name: '印度', domain: 'amazon.in' },
  ]},
  { region: '中东', sites: [
    { code: 'AE', name: '阿联酋', domain: 'amazon.ae' },
    { code: 'SA', name: '沙特', domain: 'amazon.sa' },
    { code: 'EG', name: '埃及', domain: 'amazon.eg' },
  ]},
]
const ALL_SITES = REGIONS.flatMap(r => r.sites)

type Mode = 'asin' | 'keyword'
const HISTORY_KEY = 'jixing_amazon_global_history'

function buildUrl(domain: string, mode: Mode, q: string): string {
  return mode === 'asin'
    ? `https://www.${domain}/dp/${q}`
    : `https://www.${domain}/s?k=${encodeURIComponent(q)}`
}

export default function AmazonGlobalPage() {
  const [mode, setMode] = useState<Mode>('asin')
  const [input, setInput] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set(['US', 'UK', 'DE', 'JP', 'CA']))
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    try {
      const h = localStorage.getItem(HISTORY_KEY)
      if (h) setHistory(JSON.parse(h))
    } catch { /* ignore */ }
  }, [])

  const queries = input.split(/[\n,，\s]+/).map(s => s.trim()).filter(Boolean)
  const validQueries = mode === 'asin'
    ? queries.map(s => s.toUpperCase()).filter(s => /^[A-Z0-9]{10}$/.test(s))
    : queries
  const invalidCount = mode === 'asin'
    ? queries.filter(s => !/^[A-Z0-9]{10}$/i.test(s)).length
    : 0

  const toggleSite = (code: string) =>
    setSelected(p => { const n = new Set(p); if (n.has(code)) n.delete(code); else n.add(code); return n })
  const toggleRegion = (sites: Site[]) => {
    const allOn = sites.every(s => selected.has(s.code))
    setSelected(p => {
      const n = new Set(p)
      for (const s of sites) { if (allOn) n.delete(s.code); else n.add(s.code) }
      return n
    })
  }

  const saveHistory = (q: string) => {
    setHistory(prev => {
      const next = [q, ...prev.filter(x => x !== q)].slice(0, 15)
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }
  const clearHistory = () => {
    if (!confirm('确定要清空历史记录吗？')) return
    setHistory([])
    try { localStorage.removeItem(HISTORY_KEY) } catch { /* ignore */ }
  }

  const selectedSites = ALL_SITES.filter(s => selected.has(s.code))
  const openAll = () => {
    for (const q of validQueries) {
      saveHistory(q)
      for (const site of selectedSites) window.open(buildUrl(site.domain, mode, q), '_blank')
    }
  }

  return (
    <ToolLayout title="亚马逊批量查询" description="批量生成 ASIN / 关键词在各站点的商品与搜索链接，一键打开">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            {([['asin', 'ASIN 查询'], ['keyword', '关键词搜索']] as [Mode, string][]).map(([m, l]) => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-[#5b5bd6] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#5b5bd6]/40'}`}>
                {l}
              </button>
            ))}
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={8}
            placeholder={mode === 'asin' ? '每行或逗号分隔一个 ASIN（10 位字母数字）...' : '每行或逗号分隔一个关键词...'}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40 resize-none"/>
          <p className="text-xs text-gray-500">
            有效 <span className="text-green-600 font-medium">{validQueries.length}</span> 个
            {mode === 'asin' && invalidCount > 0 && <>，无效 <span className="text-red-500 font-medium">{invalidCount}</span> 个</>}
            ，已选 <span className="text-[#5b5bd6] font-medium">{selected.size}</span> 个站点
          </p>
          <button onClick={openAll} disabled={!validQueries.length || !selected.size}
            className="w-full py-2.5 bg-[#5b5bd6] text-white rounded-xl text-sm font-medium hover:bg-[#5b5bd6]/90 disabled:opacity-40">
            一键打开全部（{validQueries.length * selected.size} 个标签页）
          </button>

          {history.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-700">历史搜索记录</h3>
                <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-500">清空历史</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {history.map(h => (
                  <button key={h} onClick={() => setInput(prev => prev ? `${prev}\n${h}` : h)}
                    className="text-xs bg-slate-100 text-gray-600 rounded px-2 py-1 hover:bg-[#5b5bd6]/10 hover:text-[#5b5bd6]">
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {REGIONS.map(r => {
            const allOn = r.sites.every(s => selected.has(s.code))
            return (
              <div key={r.region} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">{r.region}</h3>
                  <button onClick={() => toggleRegion(r.sites)} className="text-xs text-[#5b5bd6] hover:underline">
                    {allOn ? '取消本区' : '全选本区'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.sites.map(s => (
                    <button key={s.code} onClick={() => toggleSite(s.code)}
                      className={`text-xs rounded-lg px-2.5 py-1.5 border transition-colors ${selected.has(s.code) ? 'bg-[#5b5bd6] text-white border-[#5b5bd6]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#5b5bd6]/40'}`}>
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {validQueries.length > 0 && selectedSites.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">生成的链接</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {validQueries.map(q => (
              <div key={q} className="border-b border-gray-50 pb-2">
                <p className="font-mono text-sm font-bold text-gray-700 mb-1">{q}</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSites.map(s => (
                    <a key={s.code} href={buildUrl(s.domain, mode, q)} target="_blank" rel="noopener noreferrer"
                      onClick={() => saveHistory(q)}
                      className="text-xs text-[#5b5bd6] border border-[#5b5bd6]/30 rounded px-2 py-1 hover:bg-[#5b5bd6]/5">
                      {s.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
