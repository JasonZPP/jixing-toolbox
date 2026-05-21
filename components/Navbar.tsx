import Link from 'next/link'

const navLinks = [
  { href: '/about', label: '关于' },
  { href: '/blog', label: '博客' },
  { href: '/suggest', label: '提需求' },
  { href: '/reward', label: '打赏支持' },
]

export default function Navbar() {
  return (
    <header className="h-14 bg-[#07090f] border-b border-[#5b5bd6]/10 text-white flex items-center px-5 justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5b5bd6] to-[#818cf8] flex items-center justify-center text-white text-sm select-none">
          ⬡
        </div>
        <span className="text-sm font-bold text-white/75">极星</span>
      </Link>
      <nav className="hidden md:flex items-center gap-5">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
