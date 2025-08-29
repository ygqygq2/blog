// 功能特性配置文件
export interface FeatureConfig {
  // 内容功能
  toc: {
    enabled: boolean // 是否启用 TOC 功能
    showInlineMarker: boolean // 是否显示文内 [toc] 标记的目录
    showSidebar: boolean // 是否显示右侧固定目录
    showMobileToc: boolean // 是否在移动端显示目录
    maxDepth: number // 目录最大深度
    minHeadings: number // 显示目录的最少标题数量
  }
  newsletter: boolean
  comments: boolean
  rss: boolean
  search: boolean
  analytics: boolean
}

// 默认功能配置
export const defaultFeatures: FeatureConfig = {
  toc: {
    enabled: true,
    showInlineMarker: true,
    showSidebar: true,
    showMobileToc: true,
    maxDepth: 3,
    minHeadings: 2,
  },
  newsletter: true,
  comments: true,
  rss: true,
  search: true,
  analytics: true,
}
