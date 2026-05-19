import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

const navLinks = [
  { href: '/about', label: '关于' },
  { href: '/blog', label: '博客' },
  { href: '/suggest', label: '提需求' },
  { href: '/reward', label: '打赏支持' },
]

export default function Navbar() {
  return (
    <header className="h-14 bg-[#5b5bd6] text-white flex items-center px-4 md:px-10 shadow-md z-20 justify-between md:justify-start sticky top-0">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg min-w-0 flex-1">
        <LayoutDashboard className="h-5 w-5 shrink-0" />
        <span className="truncate md:text-lg text-base">极星工具箱</span>
      </Link>
      <nav className="hidden md:flex ml-auto mr-6 items-center gap-6 shrink-0">
        {navLinks.map(link => (
          <Link key={link.href} href={link.href} className="text-sm text-white/90 hover:text-white">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
