import Footer from '@/components/Footer'

export default function RewardPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">打赏支持</h1>
      <p className="text-gray-500 mb-8 text-sm">如果极星工具箱帮到了你，欢迎请我们喝杯咖啡 ☕</p>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <p className="text-gray-400 text-sm">微信/支付宝收款码（请在此处替换为你的收款码图片）</p>
        <div className="w-48 h-48 bg-slate-100 rounded-xl mx-auto mt-4 flex items-center justify-center text-gray-300 text-sm">收款码</div>
      </div>
      <Footer />
    </div>
  )
}
