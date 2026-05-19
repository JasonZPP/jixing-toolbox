import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto text-center py-6">
      <p className="text-xs text-gray-400">
        © 2026 极星共合&nbsp;&nbsp;
        <Link href="/privacy" className="hover:text-gray-600 underline">隐私说明</Link>
        &nbsp;&nbsp;
        <span className="text-gray-300">|</span>
        &nbsp;&nbsp;本站不需要注册，所有工具免费使用。
      </p>
    </footer>
  )
}
