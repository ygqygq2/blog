// TOC (Table of Contents) 目录配置
export interface TocConfig {
  enabled: boolean // 是否启用 TOC 功能
  showInlineMarker: boolean // 是否显示文内 [toc] 标记的目录
  showSidebar: boolean // 是否显示右侧固定目录
  showMobileToc: boolean // 是否在移动端显示目录
  maxDepth: number // 目录最大深度 (从 h1 开始计算)
  minHeadings: number // 显示目录的最少标题数量
}

// 默认 TOC 配置
export const defaultTocConfig: TocConfig = {
  enabled: true,
  showInlineMarker: true,
  showSidebar: true,
  showMobileToc: true,
  maxDepth: 3, // 支持 h1, h2, h3
  minHeadings: 2, // 至少2个标题才显示目录
}
