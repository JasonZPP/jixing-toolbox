import type { Tool } from './types'

export const tools: Tool[] = [
  // 广告工具 (4)
  { slug: 'ad-calc', name: '广告竞价计算', description: '支持固定竞价、动态竞价策略的CPC出价计算，实时预览广告位最高出价', category: 'ad', icon: 'Calculator', color: 'blue' },
  { slug: 'cpc-compass', name: 'CPC利润测算', description: '综合FBA费用、佣金、CPC成本，精准估算每单净利润与盈亏平衡ACOS', category: 'ad', icon: 'Crosshair', color: 'blue' },
  { slug: 'amazon-ads-analyzer', name: '亚马逊广告分析工具', description: '上传广告报告CSV，多维度KPI可视化分析，快速定位投放问题', category: 'ad', icon: 'ChartColumn', color: 'blue' },
  { slug: 'amazon-bulk-ads-tool', name: '亚马逊广告批量处理工具', description: '批量修改广告出价与预算，前端处理无需上传数据，导出即用', category: 'ad', icon: 'Layers', color: 'blue' },
  // 运营工具 (17)
  { slug: 'delivery', name: '美国站配送费计算', description: '2025/2026最新费率，根据尺寸重量精准计算FBA配送费与利润', category: 'ops', icon: 'Truck', color: 'orange' },
  { slug: 'amazon-eu-fba-calculator', name: 'Amazon EU FBA 费用计算器', description: '覆盖英/德/法/意/西五国，多地区FBA费用横向对比', category: 'ops', icon: 'Globe', color: 'orange' },
  { slug: 'storage-fee-calc', name: 'FBA全能仓储费计算器', description: '按体积和月份计算仓储费，含旺季附加费，支持多SKU批量计算', category: 'ops', icon: 'Warehouse', color: 'orange' },
  { slug: 'returns-v2', name: '退货报告分析V2', description: '上传退货报告CSV，按ASIN和退货原因分类统计，快速定位问题产品', category: 'ops', icon: 'RotateCcw', color: 'orange' },
  { slug: 'forbidden-words', name: '亚马逊文案违禁词检测', description: '内置500+违禁词库，一键检测Listing文案合规性，高亮标注风险词', category: 'ops', icon: 'ShieldAlert', color: 'orange' },
  { slug: 'unit', name: '单位换算', description: '长度、重量、体积、温度等常用单位互转，跨境卖家必备工具', category: 'ops', icon: 'ArrowLeftRight', color: 'orange' },
  { slug: 'amazon-promotion-stacking', name: '亚马逊促销叠加计算器', description: '多重折扣叠加后净价精确计算，避免促销设置失误', category: 'ops', icon: 'Tag', color: 'orange' },
  { slug: 'listing-check', name: 'Listing自检工具', description: '检查标题字数、要点格式、关键词密度等规则，提升Listing质量分', category: 'ops', icon: 'ClipboardCheck', color: 'orange' },
  { slug: 'fba-warehouses', name: 'FBA仓库查询', description: '全美FBA仓库地址一览，按州筛选，快速确认发货目的地', category: 'ops', icon: 'MapPin', color: 'orange' },
  { slug: 'fba-label-editor', name: 'FBA标签编辑器', description: '在线编辑打印FNSKU标签，自定义尺寸与内容，直接打印', category: 'ops', icon: 'Printer', color: 'orange' },
  { slug: 'keyword-combiner', name: '关键词组合工具', description: '多组词根笛卡尔积生成所有关键词组合，批量导出用于广告投放', category: 'ops', icon: 'Combine', color: 'orange' },
  { slug: 'natural-traffic-tool', name: '自然流量分析工具', description: '上传搜索词报告，分析自然流量关键词表现，发现增量机会', category: 'ops', icon: 'TrendingUp', color: 'orange' },
  { slug: 'amazon-global', name: '亚马逊批量查询', description: '批量验证ASIN格式并生成各站点商品链接，多站点运营必备', category: 'ops', icon: 'Search', color: 'orange' },
  { slug: 'keyword-strategy', name: '关键词策略工具', description: '词根拆分与频次统计，结合匹配类型分析，制定精准投放策略', category: 'ops', icon: 'Target', color: 'orange' },
  { slug: 'search-term-volatility', name: '搜索词波动分析', description: '对比两期搜索词数据，量化关键词流量增减变化，把握市场动态', category: 'ops', icon: 'Activity', color: 'orange' },
  { slug: 'rating-sales-reverse', name: '亚马逊评分销量反推', description: '基于评分数量估算竞品月销量，快速评估市场规模', category: 'ops', icon: 'Star', color: 'orange' },
  { slug: 'max-reserve-fee', name: '最高预留费计算工具', description: '计算白嫖库容的最优预留数量，最大化免费仓储空间利用率', category: 'ops', icon: 'PackageCheck', color: 'orange' },
  // 图文工具 (11)
  { slug: 'word-count', name: '词频统计', description: '快速统计文本词频，输出排名表，适用于关键词密度分析', category: 'image', icon: 'BarChart2', color: 'blue' },
  { slug: 'image-compression', name: '图片压缩与格式转换', description: '无损/有损压缩，支持JPG/PNG/WebP互转，批量处理', category: 'image', icon: 'ImageDown', color: 'blue' },
  { slug: 'image-resizer', name: '图片尺寸修改工具', description: '批量修改图片尺寸，支持等比缩放与自定义尺寸', category: 'image', icon: 'Scaling', color: 'blue' },
  { slug: 'editor', name: '可视化编辑器', description: '富文本在线编辑，支持格式化、颜色、对齐，一键复制结果', category: 'image', icon: 'PenLine', color: 'blue' },
  { slug: 'case', name: '大小写转换', description: '全大写、全小写、首字母大写、句首大写一键转换', category: 'image', icon: 'CaseSensitive', color: 'blue' },
  { slug: 'char-count', name: '字符统计', description: '实时统计字节数、字符数、行数、单词数，多语言支持', category: 'image', icon: 'Hash', color: 'blue' },
  { slug: 'text-compare', name: '文本比较工具', description: '逐字差异对比高亮，快速定位两份文本的不同之处', category: 'image', icon: 'GitCompare', color: 'blue' },
  { slug: 'duplicate-remover', name: '去除重复文本工具', description: '按行去重，保留原始顺序，支持忽略空行和大小写', category: 'image', icon: 'Copy', color: 'blue' },
  { slug: 'content-filter', name: '英文文本过滤工具', description: '按规则提取或过滤英文字符，批量清洗文本数据', category: 'image', icon: 'Filter', color: 'blue' },
  { slug: 'pinyin-converter', name: '汉字转拼音', description: '支持带声调、不带声调、首字母三种模式，批量转换', category: 'image', icon: 'Languages', color: 'blue' },
  { slug: 'image-info-viewer', name: '批量图片信息查看器', description: '读取图片EXIF数据，展示尺寸、大小、格式、拍摄参数', category: 'image', icon: 'Info', color: 'blue' },
  // 其他工具 (6)
  { slug: 'carton-calc-advanced', name: '外箱装箱计算器', description: '输入产品与外箱尺寸，计算装箱数量、总重量与体积重', category: 'other', icon: 'Package', color: 'orange' },
{ slug: 'sales-calc', name: '亚马逊销售额计算', description: '多SKU价格×销量批量汇总，快速统计总销售额', category: 'other', icon: 'DollarSign', color: 'orange' },
  { slug: 'image-to-pdf-batch', name: '批量图片转PDF', description: '多张图片合并为单个PDF，支持排序与页面设置', category: 'other', icon: 'FileImage', color: 'orange' },
  { slug: 'pdf-image-watermark-redaction', name: 'PDF / 图片 水印与打码工具', description: '添加文字水印或对敏感区域马赛克打码，保护商业文件', category: 'other', icon: 'Stamp', color: 'orange' },
  { slug: 'image-batch-renamer', name: '图片批量重命名工具', description: '按规则批量重命名图片文件，支持前缀/序号/日期，打包下载', category: 'other', icon: 'FilePen', color: 'orange' },
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
