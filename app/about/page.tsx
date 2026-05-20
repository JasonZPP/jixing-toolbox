import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">关于极星工具箱</h1>
      <div className="prose prose-gray max-w-none space-y-4 text-gray-600">
        <p>极星工具箱是极星共合为亚马逊跨境电商卖家打造的一站式在线工具集合，所有工具均免费使用，无需注册。</p>
        <p>工具覆盖广告管理、FBA运营、图片处理、文本工具等核心场景，帮助卖家提升运营效率。</p>
        <h2 className="text-xl font-semibold text-gray-700 mt-8">设计原则</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>所有计算在浏览器本地完成，数据不上传服务器</li>
          <li>无需注册，打开即用</li>
          <li>持续更新，根据卖家需求迭代</li>
        </ul>
      </div>
      <Footer />
    </div>
  )
}
