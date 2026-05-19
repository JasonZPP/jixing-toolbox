'use client'
import { useState } from 'react'
import { X } from 'lucide-react'

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className="w-full border-y border-orange-200 bg-orange-50">
      <div className="mx-auto flex min-h-10 max-w-screen-2xl items-center justify-center px-3 py-1 text-xs text-orange-700 md:h-10 md:py-0 md:text-sm">
        <span>
          🎉 极星工具箱持续更新中 &nbsp;—&nbsp;
          <a href="/suggest" className="underline decoration-orange-400 underline-offset-4 hover:decoration-orange-600">
            提交你想要的工具
          </a>
        </span>
        <button onClick={() => setVisible(false)} className="ml-4 p-1 hover:text-orange-900">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
