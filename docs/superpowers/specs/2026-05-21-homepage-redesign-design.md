# 极星工具箱首页改版设计规格

## 设计决策摘要

| 项目 | 决策 |
|------|------|
| 布局 | 左右分栏：左侧固定 220px 封面面板 + 右侧弹性内容区 |
| 配色 | 分栏对比（B）：左侧暗夜深蓝，右侧明亮白底 |
| 风格来源 | 左侧参考高端数字杂志封面；右侧参考 Linear / Notion 工具列表 |
| 核心改动 | 去除公告栏；导航栏去除重复品牌名；首页内嵌实时搜索 |

---

## 1. 整体结构

```
┌─────────────────────────────────────────────────────────┐
│ Navbar (全宽, 高 56px, 深色背景)                         │
├─────────────┬───────────────────────────────────────────┤
│             │  搜索栏 + 分类 Tabs                        │
│  封面面板   ├───────────────────────────────────────────┤
│  (220px)    │  工具分组列表（按类目分 section）           │
│             │                                           │
│             ├───────────────────────────────────────────┤
│             │  Footer                                   │
└─────────────┴───────────────────────────────────────────┘
```

- 外层容器最大宽度：`max-w-7xl`，无左右 padding（全幅铺满）
- 左右分栏高度：`min-h-[calc(100vh-56px)]`，左侧 sticky 固定
- 不引入 Sidebar（Sidebar 只在单个工具页出现）

---

## 2. Navbar

**文件**：`components/Navbar.tsx`（修改现有文件）

| 属性 | 值 |
|------|----|
| 高度 | 56px |
| 背景 | `#07090f`（深黑，与左侧封面融为一体）|
| 底部边框 | `border-b border-[#5b5bd6]/10` |
| 位置 | `sticky top-0 z-50` |

**左侧品牌区**：
- Logo 图标：28×28px，渐变圆角方块（`#5b5bd6 → #818cf8`），内含 ⬡ 符号
- 品牌文字："极星"（不是"极星工具箱"，避免与封面重复），`font-bold text-sm text-white/75`

**右侧导航链接**：关于 / 博客 / 提需求 / 打赏支持，`text-xs text-white/40 hover:text-white/70`

> 移除原有的 `h-14 bg-[#5b5bd6]` 紫色 Navbar 样式，改为深色透明风格。

---

## 3. 左侧封面面板

**位置**：`app/page.tsx` 内联实现，宽度 `w-[220px]`，`sticky top-14`（贴紧 Navbar 下边）

**背景**：`linear-gradient(170deg, #0d0f24 0%, #07090f 65%)`，右边 `border-r border-[#5b5bd6]/10`

**装饰光晕**：两个 `position: absolute` 的 radial-gradient 圆，左上角蓝紫色，右下角深紫色

### 内容从上到下

1. **版次标签**
   - 格式：一条 16px 横线 + `VOL.01 · 2026`
   - 样式：`text-[9px] tracking-[0.25em] uppercase text-[#5b5bd6] font-bold`

2. **主标题**
   - 三行：极星 / 工具（渐变高亮）/ 箱
   - `font-size: 42px, font-weight: 900, line-height: 0.9, letter-spacing: -0.05em`
   - "工具"使用 `bg-gradient-to-br from-[#818cf8] to-[#5b5bd6] bg-clip-text text-transparent`

3. **英文副标题**
   - `Jixing Toolbox`，`text-[10px] tracking-[0.08em] text-white/25 uppercase`

4. **分隔线**
   - 28px 宽，2px 高，`bg-gradient-to-r from-[#5b5bd6] to-[#5b5bd6]/20`

5. **描述文字**
   - "亚马逊跨境电商卖家的效率中枢，覆盖广告竞价、FBA运营、图文处理全链路。"
   - `text-[10.5px] text-white/28 leading-[1.75]`，`flex-1`（撑开，把统计数字推到底部）

6. **统计数字**（三行）
   - 格式：大号数字 + 小标签，`margin-top: auto`
   - 数字：38 / 4 / 0，标签：专业工具 / 核心模块 / 登录要求
   - 数字样式：`text-2xl font-black`，渐变白→紫
   - 标签样式：`text-[9px] text-white/22 uppercase tracking-widest`

7. **徽章**
   - "● 免费 · 本地运行"，带一个 5px 蓝色脉冲点
   - 圆角胶囊，`border border-[#5b5bd6]/22 bg-[#5b5bd6]/10 text-[#8080ff] text-[8.5px]`

---

## 4. 右侧内容区

**背景**：`#f8f8fc`（极浅蓝白，与左侧形成明暗对比）

### 4.1 搜索栏区域

`padding: 16px 20px 12px`，底部 `border-b border-black/4`

**搜索框**：
- 背景 `bg-white`，边框 `border border-black/8`，圆角 `rounded-xl`
- 左侧 🔍 图标（`text-black/25`）
- 占位符："搜索工具，例如「FBA」「CPC」..."（`text-black/30`）
- 右侧 `⌘K` 快捷键提示（`bg-black/5 border border-black/8 rounded`）
- **实时搜索**：`onChange` → 过滤 `tools` 数组，按 `name + description` 字段匹配，不区分大小写

**分类 Tabs**：
- 全部 38 / 广告 4 / 运营 17 / 图片文本 11 / 其他 6
- 激活态：`bg-[#5b5bd6]/10 border-[#5b5bd6]/30 text-[#5b5bd6]`
- 非激活：`border-black/8 text-black/30`
- 点击 Tab 切换过滤，与搜索词可叠加（先按 Tab 过滤类目，再按搜索词过滤）

### 4.2 工具分组列表

`padding: 16px 20px`，工具分 4 个 section 展示（广告工具 / 运营工具 / 图片文本 / 其他工具）

**Section 标题**：
- 格式：`SECTION_NAME` + 渐变分隔线 + 工具数量
- 标签：`text-[9.5px] font-bold text-[#5b5bd6] tracking-[0.18em] uppercase`
- 分隔线：`flex-1 h-px bg-gradient-to-r from-[#5b5bd6]/20 to-transparent`

**工具卡片**（3列网格，gap-2）：
- 背景 `bg-white`，边框 `border border-black/6`，圆角 `rounded-xl`
- `padding: 12px`
- 悬停：`border-[#5b5bd6]/40 bg-[#5b5bd6]/3 shadow-sm`，右下角出现 `→` 箭头
- 内容：
  - 图标方块（28×28，蓝色/橙色渐变浅底）
  - 工具名称：`text-[11px] font-bold text-gray-800`
  - 描述：`text-[9.5px] text-gray-400 leading-relaxed`（2行省略）
- 点击跳转 `/functionality/{slug}`（使用 Next.js `<Link>`）

**搜索无结果时**：显示空状态提示 "未找到匹配的工具，试试其他关键词"

### 4.3 Footer（在右侧内容区底部）

- `border-t border-black/4 px-5 py-3`，左右 flex 布局
- 左：`© 2026 极星共合 · 所有工具免费，无需注册`（`text-xs text-black/25`）
- 右：隐私说明 / 提需求（`text-xs text-black/25 underline`）

---

## 5. 响应式行为

| 断点 | 行为 |
|------|------|
| `< 768px (md)` | 左侧封面面板隐藏（`hidden md:block`），右侧全宽显示 |
| `≥ 768px` | 标准左右分栏布局 |
| 工具网格 | 移动端 1列 → md 2列 → lg 3列 |

---

## 6. 受影响的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `app/page.tsx` | **重写** | 实现完整首页新布局（封面面板 + 搜索 + 工具列表）|
| `components/Navbar.tsx` | **修改** | 深色背景 + 品牌简化为"极星"图标 + 文字 |
| `components/ToolCard.tsx` | **可选复用** | 新首页的工具卡片与现有 ToolCard 样式不同（浅色主题），考虑内联实现或新建 `HomeToolCard.tsx` |
| `components/Footer.tsx` | 不改动 | Footer 只在工具页使用；首页 Footer 内联在右侧内容区 |

---

## 7. 技术约束

- 不引入新的 npm 包，纯 Tailwind CSS + Next.js 内置能力
- 搜索功能用 `useState` + `useMemo` 实现，不需要后端
- 左侧面板 `position: sticky` 依赖父容器高度足够（工具列表撑开即可）
- Navbar 改为深色后，需确认现有工具页中 Navbar 不受影响（Navbar 在工具页同样显示）

---

## 8. 自检结果

- [x] 无 TBD/TODO 占位符
- [x] 响应式覆盖（移动端封面隐藏）
- [x] 搜索 + Tab 过滤均有具体行为说明
- [x] 工具数量与 `lib/tools.ts` 对齐（38 = 4+17+11+6）
- [x] Navbar 改动范围明确，不影响工具页
- [x] 无引入新依赖
