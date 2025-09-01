/**
 * 配置系统主入口
 * 提供统一的配置访问接口
 */

// 导出所有类型定义
export type * from './types'

// 导出系统默认配置
export {
  DEFAULT_APP_CONFIG,
  DEFAULT_MODE_CONFIG,
  DEFAULT_TOC_CONFIG,
  SYSTEM_CONFIG,
} from './system/defaults'

// 导出配置管理器
export { getAppConfig, getSiteMetadata, getTocConfig, isFeatureEnabled } from './system/manager'

// 导出模式相关配置（从 lib/mode 重新导出以便统一访问）
export { getBuildConfig, getModeConfig, isStaticMode } from '../lib/mode'
