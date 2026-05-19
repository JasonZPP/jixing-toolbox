import Sidebar from './Sidebar'
import Footer from './Footer'

interface Props {
  children: React.ReactNode
  title: string
  description?: string
}

export default function ToolLayout({ children, title, description }: Props) {
  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 relative flex flex-col min-h-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
        </div>
        <div className="flex-1">{children}</div>
        <Footer />
      </main>
    </div>
  )
}
