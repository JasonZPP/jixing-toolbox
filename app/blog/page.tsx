import Footer from '@/components/Footer'

export default function BlogPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">博客</h1>
      <p className="text-gray-500 text-sm mb-8">分享亚马逊运营经验与工具使用技巧</p>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-gray-400">文章整理中，敬请期待</p>
      </div>
      <Footer />
    </div>
  )
}
