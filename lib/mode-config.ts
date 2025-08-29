// @deprecated 此文件已废弃，请使用 @/config/index 中的新配置系统
// 为了向后兼容，保留部分导出

import {
  getBuildConfig,
  getFeatureConfig,
  getModeConfig as getNewModeConfig,
  isFeatureEnabled as newIsFeatureEnabled,
  isStaticMode as newIsStaticMode,
} from '../config'
import type { FeatureConfig } from '../config/features'

/**
 * @deprecated 请使用 @/config 中的 getModeConfig
 */
export function getModeConfig() {
  const modeConfig = getNewModeConfig()
  const buildConfig = getBuildConfig()
  const featureConfig = getFeatureConfig()

  return {
    isStatic: modeConfig.isStatic,
    dynamic: modeConfig.dynamic,
    apiDynamic: modeConfig.apiDynamic,
    shouldGenerateStaticParams: modeConfig.shouldGenerateStaticParams,
    // 功能可用性配置 - 转换为旧格式
    features: {
      newsletter: featureConfig.newsletter,
      comments: featureConfig.comments,
      rss: featureConfig.rss,
      search: featureConfig.search,
      analytics: featureConfig.analytics,
    },
    // 构建配置
    build: buildConfig,
  }
}

/**
 * @deprecated 请使用 @/config 中的 getModeConfig
 */
export const pageConfig = getModeConfig()

/**
 * @deprecated 请使用 @/config 中的 getModeConfig
 */
export const apiConfig = getModeConfig()

/**
 * @deprecated 请使用 @/config 中的 isStaticMode
 */
export const isStaticMode = newIsStaticMode

/**
 * @deprecated 请使用 @/config 中的 isFeatureEnabled
 */
export function isFeatureEnabled(feature: keyof typeof pageConfig.features): boolean {
  // 简单映射到新的功能配置系统
  const featureMap: Record<string, keyof FeatureConfig> = {
    newsletter: 'newsletter',
    comments: 'comments',
    rss: 'rss',
    search: 'search',
    analytics: 'analytics',
  }

  const mappedFeature = featureMap[feature as string] as keyof FeatureConfig
  if (mappedFeature) {
    return newIsFeatureEnabled(mappedFeature)
  }

  return false
}
