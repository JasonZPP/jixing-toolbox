import { render, screen } from '@testing-library/react'
import ToolCard from '@/components/ToolCard'
import type { Tool } from '@/lib/types'

const mockTool: Tool = {
  slug: 'test-tool',
  name: '测试工具',
  description: '这是测试工具的描述',
  category: 'ad',
  icon: 'Calculator',
  color: 'blue',
}

describe('ToolCard', () => {
  it('renders tool name and description', () => {
    render(<ToolCard tool={mockTool} />)
    expect(screen.getByText('测试工具')).toBeInTheDocument()
    expect(screen.getByText('这是测试工具的描述')).toBeInTheDocument()
  })

  it('links to the correct tool page', () => {
    render(<ToolCard tool={mockTool} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/functionality/test-tool')
  })
})
