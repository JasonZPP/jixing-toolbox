import type { Tool } from './types'

export const tools: Tool[] = [
  // 广告工具 (4)
  { slug: 'ad-calc', name: '广告竞价计算', description: '支持固定竞价、动态竞价策略的CPC出价计算，实时预览广告位最高出价', category: 'ad', icon: 'Calculator', color: 'blue' },
  { slug: 'cpc-compass', name: 'CPC利润测算', description: '综合FBA费用、佣金、CPC成本，精准估算每单净利润与盈亏平衡ACOS', category: 'ad', icon: 'Crosshair', color: 'blue' },
  { slug: 'amazon-ads-analyzer', name: '亚马逊广告分析工具', description: '上传广告报告CSV，多维度KPI可视化分析，快速定位投放问题', category: 'ad', icon: 'ChartColumn', color: 'blue' },
  { slug: 'amazon-bulk-ads-tool', name: '亚马逊广告批量处理工具', description: '批量修改广告出价与预算，前端处理无需上传数据，导出即用', category: 'ad', icon: 'Layers', color: 'blue' },
  // 运营工具 (9)
  { slug: 'delivery', name: '美国站配送费计算', description: '2025/2026最新费率，根据尺寸重量精准计算FBA配送费与利润', category: 'ops', icon: 'Truck', color: 'orange' },
  { slug: 'storage-fee-calc', name: 'FBA全能仓储费计算器', description: '按体积和月份计算仓储费，含旺季附加费，支持多SKU批量计算', category: 'ops', icon: 'Warehouse', color: 'orange' },
  { slug: 'returns-v2', name: '退货报告分析V2', description: '上传退货报告CSV，按ASIN和退货原因分类统计，快速定位问题产品', category: 'ops', icon: 'RotateCcw', color: 'orange' },
  { slug: 'forbidden-words', name: '亚马逊文案违禁词检测', description: '内置500+违禁词库，一键检测Listing文案合规性，高亮标注风险词', category: 'ops', icon: 'ShieldAlert', color: 'orange' },
  { slug: 'unit', name: '单位换算', description: '长度、重量、体积、温度等常用单位互转，跨境卖家必备工具', category: 'ops', icon: 'ArrowLeftRight', color: 'orange' },
  { slug: 'amazon-promotion-stacking', name: '亚马逊促销叠加计算器', description: '多重折扣叠加后净价精确计算，避免促销设置失误', category: 'ops', icon: 'Tag', color: 'orange' },
  { slug: 'listing-check', name: 'Listing自检工具', description: '检查标题字数、要点格式、关键词密度等规则，提升Listing质量分', category: 'ops', icon: 'ClipboardCheck', color: 'orange' },
  { slug: 'fba-warehouses', name: 'FBA仓库查询', description: '全美FBA仓库地址一览，按州筛选，快速确认发货目的地', category: 'ops', icon: 'MapPin', color: 'orange' },
  { slug: 'amazon-global', name: '亚马逊批量查询', description: '批量验证ASIN格式并生成各站点商品链接，多站点运营必备', category: 'ops', icon: 'Search', color: 'orange' },
  // 图文工具 (7)
  { slug: 'image-compression', name: '图片压缩与格式转换', description: '无损/有损压缩，支持JPG/PNG/WebP互转，批量处理', category: 'image', icon: 'ImageDown', color: 'blue' },
  { slug: 'image-resizer', name: '图片尺寸修改工具', description: '批量修改图片尺寸，支持等比缩放与自定义尺寸', category: 'image', icon: 'Scaling', color: 'blue' },
  { slug: 'image-to-pdf-batch', name: '批量图片转PDF', description: '多张图片合并为单个PDF，支持排序与页面设置', category: 'image', icon: 'FileImage', color: 'blue' },
  { slug: 'pdf-image-watermark-redaction', name: 'PDF / 图片 水印与打码工具', description: '添加文字水印或对敏感区域马赛克打码，保护商业文件', category: 'image', icon: 'Stamp', color: 'blue' },
  { slug: 'image-batch-renamer', name: '图片批量重命名工具', description: '按规则批量重命名图片文件，支持前缀/序号/日期，打包下载', category: 'image', icon: 'FilePen', color: 'blue' },
  { slug: 'online-ps', name: '在线PS', description: '在线图片编辑工具，抠图、修图、合成一站搞定', category: 'image', icon: 'Wand2', color: 'blue', externalUrl: 'https://tugaigai.com/online_ps/' },
  { slug: 'image-upscaler', name: '图片高清放大', description: 'AI智能放大图片，最高4倍无损放大，保留细节', category: 'image', icon: 'ZoomIn', color: 'blue', externalUrl: 'https://imgupscaler.com/' },
  // 其他工具 (1)
  { slug: 'carton-calc-advanced', name: '外箱装箱计算器', description: '输入产品与外箱尺寸，计算装箱数量、总重量与体积重', category: 'other', icon: 'Package', color: 'orange' },
]

export const toolsByCategory = {
  ad: tools.filter(t => t.category === 'ad'),
  ops: tools.filter(t => t.category === 'ops'),
  image: tools.filter(t => t.category === 'image'),
  other: tools.filter(t => t.category === 'other'),
}

export const categoryLabels: Record<string, string> = {
  ad: '广告工具',
  ops: '运营工具',
  image: '图片文本',
  other: '其他工具',
}
