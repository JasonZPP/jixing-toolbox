import Footer from '@/components/Footer'

const BELTS = [
  { city: '义乌', province: '浙江', category: '小商品、日用百货、饰品' },
  { city: '广州', province: '广东', category: '服装、美妆、电子配件' },
  { city: '深圳', province: '广东', category: '电子产品、数码配件、LED灯' },
  { city: '东莞', province: '广东', category: '家具、玩具、鞋类' },
  { city: '潮州/汕头', province: '广东', category: '婚庆礼品、工艺品、内衣' },
  { city: '宁波', province: '浙江', category: '家居用品、文具、化妆品' },
  { city: '嘉兴', province: '浙江', category: '箱包、皮具' },
  { city: '绍兴/柯桥', province: '浙江', category: '纺织面料' },
  { city: '温州', province: '浙江', category: '皮鞋、眼镜、电器' },
  { city: '福州/泉州', province: '福建', category: '运动鞋、休闲鞋、服装' },
  { city: '莆田', province: '福建', category: '鞋类（复刻与品牌代工）' },
  { city: '济南/青岛', province: '山东', category: '家纺、地毯' },
  { city: '杭州', province: '浙江', category: '数字经济、服装、美妆' },
  { city: '上海', province: '上海', category: '化工原料、医疗器械' },
  { city: '重庆', province: '重庆', category: '摩托车、汽车配件' },
]

export default function ChinaIndustryBeltsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">中国产业带目录</h1>
      <p className="text-gray-500 text-sm mb-8">主要跨境电商供货产业带一览</p>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-slate-50 text-xs text-gray-500 uppercase">
            <th className="p-3 text-left">城市</th><th className="p-3 text-left">省份</th><th className="p-3 text-left">主要品类</th>
          </tr></thead>
          <tbody>
            {BELTS.map((b,i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-slate-50">
                <td className="p-3 font-medium text-gray-700">{b.city}</td>
                <td className="p-3 text-gray-500">{b.province}</td>
                <td className="p-3 text-gray-600">{b.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  )
}
