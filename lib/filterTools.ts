import type { Tool } from './types'

export function filterTools(tools: Tool[], query: string, category: string): Tool[] {
  const q = query.trim().toLowerCase()
  return tools.filter(tool => {
    const matchesCategory = category === 'all' || tool.category === category
    const matchesQuery =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q)
    return matchesCategory && matchesQuery
  })
}
