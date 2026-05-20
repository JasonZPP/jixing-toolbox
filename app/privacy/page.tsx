import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">隐私说明</h1>
      <div className="prose prose-gray max-w-none space-y-4 text-gray-600 text-sm">
        <p>极星工具箱重视您的隐私。本站的核心原则是：<strong>您的数据不会离开您的浏览器。</strong></p>
        <h2 className="text-lg font-semibold text-gray-700">数据处理方式</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>所有计算（FBA费用、CPC利润等）在您的浏览器本地完成，不上传服务器</li>
          <li>您上传的图片和CSV文件仅在浏览器内存中处理，页面关闭后自动清除</li>
          <li>本站不使用任何追踪Cookie</li>
          <li>本站不收集任何个人信息</li>
        </ul>
        <p>如有疑问，欢迎通过提需求页面联系我们。</p>
      </div>
      <Footer />
    </div>
  )
}
