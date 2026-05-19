export type ToolCategory = 'ad' | 'ops' | 'image' | 'other'

export interface Tool {
  slug: string
  name: string
  description: string
  category: ToolCategory
  icon: string
  color: 'blue' | 'orange'
}
