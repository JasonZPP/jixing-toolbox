import Link from 'next/link'
import * as Icons from 'lucide-react'
import type { Tool } from '@/lib/types'

interface Props { tool: Tool }

export default function ToolCard({ tool }: Props) {
  const Icon = (Icons as Record<string, React.FC<{ className?: string }>>)[tool.icon] ?? Icons.Wrench
  const iconBg = tool.color === 'blue' ? 'bg-blue-600' : 'bg-orange-500'
  const ctaColor = tool.color === 'blue' ? 'text-blue-600' : 'text-orange-500'

  return (
    <Link
      href={`/functionality/${tool.slug}`}
      className="bg-white rounded-xl border border-gray-100 shadow-sm group relative p-6 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden block"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 pt-1 group-hover:text-gray-900">{tool.name}</h3>
        </div>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed mb-8 line-clamp-2">{tool.description}</p>
      <div className={`absolute bottom-6 left-6 flex items-center gap-2 text-sm font-bold ${ctaColor} opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300`}>
        立即使用 <Icons.ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  )
}
