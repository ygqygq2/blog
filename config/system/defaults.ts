/**
 * 系统默认配置
 * 这些是项目的系统级默认设置，与用户配置 (siteMetadata.cjs) 互补
 */

import type { AppConfig, ModeConfig, TocConfig } from '../types'

// 默认 TOC 配置
export const DEFAULT_TOC_CONFIG: TocConfig = {
  enabled: true,
  showInlineMarker: true,
  showSidebar: true,
  showMobileToc: true,
  maxDepth: 3, // 支持 h1, h2, h3
  minHeadings: 2, // 至少2个标题才显示目录
}

// 默认应用功能配置
export const DEFAULT_APP_CONFIG: AppConfig = {
  toc: DEFAULT_TOC_CONFIG,
  newsletter: true,
  comments: true,
  rss: true,
  search: true,
  analytics: true,
}

// 默认模式配置（仅用于类型和默认值参考）
export const DEFAULT_MODE_CONFIG: ModeConfig = {
  isStatic: false,
  dynamic: 'auto',
  apiDynamic: 'force-dynamic',
  shouldGenerateStaticParams: false,
}

// 系统级常量配置
export const SYSTEM_CONFIG = {
  // 支持的主题
  SUPPORTED_THEMES: ['system', 'dark', 'light'] as const,

  // 支持的搜索提供商
  SUPPORTED_SEARCH_PROVIDERS: ['enhanced', 'kbar', 'algolia', 'local'] as const,

  // 支持的评论提供商
  SUPPORTED_COMMENT_PROVIDERS: ['giscus', 'utterances', 'disqus'] as const,

  // 支持的邮件订阅提供商
  SUPPORTED_NEWSLETTER_PROVIDERS: [
    'mailchimp',
    'buttondown',
    'convertkit',
    'klaviyo',
    'revue',
    'emailoctopus',
    'beehive',
  ] as const,

  // 默认文件路径
  DEFAULT_PATHS: {
    searchJson: '/search.json',
    searchEnhancedJson: '/search-enhanced.json',
    rssXml: '/feed.xml',
    sitemapXml: '/sitemap.xml',
  },

  // 性能相关配置
  PERFORMANCE: {
    debounceDelay: 300,
    throttleLimit: 100,
    searchThreshold: 0.3,
    maxSearchResults: 15,
  },

  // 布局相关配置
  LAYOUT: {
    headerHeight: 64,
    tocSidebarWidth: 240,
    tocOffsetTop: 80,
    mobileBreakpoint: 768,
  },
} as const
