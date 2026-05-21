import { filterTools } from '../filterTools'
import type { Tool } from '../types'

const mockTools: Tool[] = [
  { slug: 'ad-calc', name: '广告竞价计算', description: 'CPC出价策略模拟', category: 'ad', icon: 'Calculator', color: 'blue' },
  { slug: 'delivery', name: '美国站配送费计算', description: 'FBA配送费精准计算', category: 'ops', icon: 'Truck', color: 'orange' },
  { slug: 'image-comp', name: '图片压缩与格式转换', description: '无损压缩JPG PNG WebP', category: 'image', icon: 'ImageDown', color: 'blue' },
]

describe('filterTools', () => {
  it('returns all tools when query is empty and category is all', () => {
    expect(filterTools(mockTools, '', 'all')).toHaveLength(3)
  })

  it('filters by category', () => {
    const result = filterTools(mockTools, '', 'ad')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('ad-calc')
  })

  it('filters by query matching name', () => {
    const result = filterTools(mockTools, 'FBA', 'all')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('delivery')
  })

  it('filters by query matching description', () => {
    const result = filterTools(mockTools, 'CPC', 'all')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('ad-calc')
  })

  it('combines category and query filters', () => {
    expect(filterTools(mockTools, 'JPG', 'ad')).toHaveLength(0)
    expect(filterTools(mockTools, 'JPG', 'image')).toHaveLength(1)
  })

  it('is case-insensitive', () => {
    expect(filterTools(mockTools, 'fba', 'all')).toHaveLength(1)
  })

  it('trims whitespace from query', () => {
    expect(filterTools(mockTools, '  FBA  ', 'all')).toHaveLength(1)
  })

  it('returns empty array when no tool matches', () => {
    expect(filterTools(mockTools, 'xyznotexist', 'all')).toHaveLength(0)
  })
})
