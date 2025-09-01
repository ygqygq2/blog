// 应用功能配置
import { defaultTocConfig, TocConfig } from './toc'

export interface AppConfig {
  // 内容功能
  toc: TocConfig
  newsletter: boolean
  comments: boolean
  rss: boolean
  search: boolean
  analytics: boolean
}

// 默认功能配置
export const defaultAppConfig: AppConfig = {
  toc: defaultTocConfig,
  newsletter: true,
  comments: true,
  rss: true,
  search: true,
  analytics: true,
}
