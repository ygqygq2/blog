/**
 * 配置管理器
 * 负责合并系统配置和用户配置，提供运行时配置获取
 */

import { getModeConfig } from '../../lib/mode'
import type { AppConfig } from '../types'
import { DEFAULT_APP_CONFIG } from './defaults'

/**
 * 根据运行模式和用户配置获取最终的应用配置
 * 这里会合并系统默认配置、用户配置(siteMetadata.cjs)和运行时模式
 */
export function getAppConfig(): AppConfig {
  const modeConfig = getModeConfig()

  // 基于默认配置创建副本
  const config: AppConfig = JSON.parse(JSON.stringify(DEFAULT_APP_CONFIG))

  // 根据运行模式调整功能可用性
  if (modeConfig.isStatic) {
    // 静态模式下某些功能限制
    config.newsletter = false // 静态模式下禁用邮件订阅
    // 可以根据需要添加更多静态模式的限制
  }

  return config
}

/**
 * 检查功能是否在当前模式下可用
 * @param feature 功能名称
 * @returns 是否可用
 */
export function isFeatureEnabled(feature: keyof AppConfig): boolean {
  const config = getAppConfig()
  const featureValue = config[feature]

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
  return getAppConfig().toc
}

/**
 * 获取用户配置 (siteMetadata)
 * 这个函数在服务器端和客户端都可用
 */
export function getSiteMetadata() {
  // 在客户端，我们可能需要从 API 获取或从全局变量获取
  // 在服务器端，直接 require
  if (typeof window === 'undefined') {
    // 服务器端
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../data/siteMetadata.cjs')
  } else {
    // 客户端 - 这里可以根据需要实现客户端获取逻辑
    // 比如从 window 全局变量或 API 获取
    throw new Error('getSiteMetadata() 在客户端需要特殊实现')
  }
}
