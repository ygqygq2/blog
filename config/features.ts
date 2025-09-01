// 功能特性配置文件 (已废弃，请使用 app.ts 和 toc.ts)
// 为了向后兼容保留此文件

import { AppConfig, defaultAppConfig } from './app'
import { TocConfig } from './toc'

// 重新导出类型以保持兼容性
export type FeatureConfig = AppConfig

// 重新导出默认配置
export const defaultFeatures: FeatureConfig = defaultAppConfig

// 重新导出 TOC 配置类型
export type { TocConfig }
