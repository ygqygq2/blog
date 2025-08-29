// 综合配置管理
import { getBuildConfig, getModeConfig, isStaticMode } from '../lib/mode'
import { defaultFeatures, FeatureConfig } from './features'

// 根据运行模式调整功能配置
export function getFeatureConfig(): FeatureConfig {
  const modeConfig = getModeConfig()

  // 基于默认配置创建副本
  const features: FeatureConfig = JSON.parse(JSON.stringify(defaultFeatures))

  // 根据运行模式调整功能可用性
  if (modeConfig.isStatic) {
    // 静态模式下某些功能限制
    features.newsletter = false // 静态模式下禁用邮件订阅
  }

  return features
}

/**
 * 检查功能是否在当前模式下可用
 * @param feature 功能名称
 * @returns 是否可用
 */
export function isFeatureEnabled(feature: keyof FeatureConfig): boolean {
  const features = getFeatureConfig()
  const featureValue = features[feature]

  // 如果是对象类型（如 toc 配置），检查 enabled 属性
  if (typeof featureValue === 'object' && featureValue !== null && 'enabled' in featureValue) {
    return featureValue.enabled as boolean
  }

  // 如果是布尔值，直接返回
  return featureValue as boolean
}

/**
 * 获取 TOC 配置
 */
export function getTocConfig() {
  return getFeatureConfig().toc
}

// 导出模式相关配置
export { getBuildConfig, getModeConfig, isStaticMode }
