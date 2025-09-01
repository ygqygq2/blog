/**
 * 系统配置类型定义
 * 这些类型用于 TypeScript 项目中的类型检查和开发体验
 */

// 构建模式配置类型
export interface BuildConfig {
  outputMode?: string
  generateRss: boolean
  enableApiRoutes: boolean
}

// 运行模式配置类型
export interface ModeConfig {
  isStatic: boolean
  dynamic: string
  apiDynamic: string
  shouldGenerateStaticParams: boolean
}

// TOC (目录) 配置类型
export interface TocConfig {
  enabled: boolean // 是否启用 TOC 功能
  showInlineMarker: boolean // 是否显示文内 [toc] 标记的目录
  showSidebar: boolean // 是否显示右侧固定目录
  showMobileToc: boolean // 是否在移动端显示目录
  maxDepth: number // 目录最大深度 (从 h1 开始计算)
  minHeadings: number // 显示目录的最少标题数量
}

// 应用功能配置类型
export interface AppConfig {
  // 内容功能
  toc: TocConfig
  newsletter: boolean
  comments: boolean
  rss: boolean
  search: boolean
  analytics: boolean
}

// 搜索配置类型
export interface SearchConfig {
  provider: 'enhanced' | 'kbar' | 'algolia' | 'local'
  kbarConfig?: {
    searchDocumentsPath: string
  }
  enhancedConfig?: {
    searchDocumentsPath: string
    fallbackPath: string
    enableRandomSort: boolean
    randomSortWeight: number
    maxResults: number
    threshold: number
  }
  algoliaConfig?: {
    appId: string
    apiKey: string
    indexName: string
  }
}

// 分析配置类型
export interface AnalyticsConfig {
  umamiAnalytics?: {
    umamiWebsiteId?: string
    src?: string
  }
  plausibleAnalytics?: {
    plausibleDataDomain: string
    src?: string
  }
  googleAnalytics?: {
    googleAnalyticsId: string
  }
  posthogAnalytics?: {
    posthogProjectApiKey: string
  }
  simpleAnalytics?: Record<string, unknown>
}

// 评论配置类型
export interface CommentsConfig {
  provider: 'giscus' | 'utterances' | 'disqus'
  giscusConfig?: {
    repo: string
    repositoryId: string
    category: string
    categoryId: string
    mapping: string
    reactions: string
    metadata: string
    theme: string
    darkTheme: string
    themeURL?: string
    lang: string
  }
}

// 邮件订阅配置类型
export interface NewsletterConfig {
  provider:
    | 'mailchimp'
    | 'buttondown'
    | 'convertkit'
    | 'klaviyo'
    | 'revue'
    | 'emailoctopus'
    | 'beehive'
}

// 站点元数据类型（用于类型检查 siteMetadata.cjs）
export interface SiteMetadata {
  title: string
  author: string
  headerTitle: string
  description: string
  language: string
  theme: 'system' | 'dark' | 'light'
  siteUrl: string
  siteRepo: string
  siteLogo: string
  socialBanner: string
  mastodon?: string
  email: string
  github: string
  x?: string
  locale: string
  stickyNav: boolean
  staticMode: boolean
  analytics: AnalyticsConfig
  newsletter: NewsletterConfig
  comments: CommentsConfig
  search: SearchConfig
}
