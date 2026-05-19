import { tools, toolsByCategory } from '@/lib/tools'

describe('tools data', () => {
  it('should have exactly 38 tools', () => {
    expect(tools).toHaveLength(38)
  })

  it('every tool should have required fields', () => {
    tools.forEach(tool => {
      expect(tool.slug).toBeTruthy()
      expect(tool.name).toBeTruthy()
      expect(tool.description).toBeTruthy()
      expect(tool.category).toMatch(/^(ad|ops|image|other)$/)
    })
  })

  it('all slugs should be unique', () => {
    const slugs = tools.map(t => t.slug)
    const unique = new Set(slugs)
    expect(unique.size).toBe(tools.length)
  })

  it('toolsByCategory should group correctly', () => {
    expect(toolsByCategory.ad).toHaveLength(4)
    expect(toolsByCategory.ops).toHaveLength(17)
    expect(toolsByCategory.image).toHaveLength(11)
    expect(toolsByCategory.other).toHaveLength(6)
  })
})
