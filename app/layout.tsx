import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: '极星工具箱',
  description: '本站不需要注册，所有工具免费使用。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#f8f8fc] flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
