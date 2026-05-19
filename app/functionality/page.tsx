import ToolCard from '@/components/ToolCard'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import { tools, toolsByCategory, categoryLabels } from '@/lib/tools'
import type { ToolCategory } from '@/lib/types'

const categories: ToolCategory[] = ['ad', 'ops', 'image', 'other']

export default function FunctionalityPage() {
  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">全部工具</h1>
          <p className="mt-2 text-sm text-gray-500">共 {tools.length} 个工具，持续更新中</p>
        </div>
        <div className="space-y-8">
          {categories.map(cat => (
            <section key={cat}>
              <h2 className="text-lg font-bold text-gray-600 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
                {categoryLabels[cat]}
                <span className="text-xs text-gray-400 font-normal">({toolsByCategory[cat].length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {toolsByCategory[cat].map(tool => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
        <Footer />
      </main>
    </div>
  )
}
