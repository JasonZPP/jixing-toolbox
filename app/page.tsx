import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ToolCard from '@/components/ToolCard'
import Footer from '@/components/Footer'
import { tools, toolsByCategory, categoryLabels } from '@/lib/tools'
import type { ToolCategory } from '@/lib/types'

const categories: ToolCategory[] = ['ad', 'ops', 'image', 'other']

export default function HomePage() {
  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-12 px-8 text-center space-y-6 relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />
        <h1 className="text-3xl font-bold text-gray-800">一站式跨境电商工具箱</h1>
        <p className="text-sm text-gray-500">轻松处理您的数据，提升工作效率</p>
        <div className="text-center mt-3 text-sm text-gray-500 font-medium">
          <span>已累计上线：<span className="text-indigo-600 font-bold">{tools.length}</span> 个工具</span>
        </div>
        <div className="text-center mt-8">
          <Link
            href="/functionality"
            className="inline-flex bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all items-center gap-2 mx-auto"
          >
            查看全部工具 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map(cat => (
          <section key={cat}>
            <h2 className="text-xl font-bold text-gray-700 mb-4">{categoryLabels[cat]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {toolsByCategory[cat].map(tool => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <Footer />
    </div>
  )
}
