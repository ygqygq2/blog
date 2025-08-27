// 运行模式配置文件
// 在构建时根据环境变量设置不同的模式

/**
 * 获取当前运行模式配置
 * @returns {Object} 模式配置对象
 */
export function getModeConfig() {
  const isStaticMode = process.env.EXPORT === 'true' || process.env.EXPORT === '1'

  return {
    isStatic: isStaticMode,
    dynamic: isStaticMode ? 'force-static' : 'auto',
    apiDynamic: isStaticMode ? 'force-static' : 'force-dynamic',
    shouldGenerateStaticParams: isStaticMode,
    // 功能可用性配置
    features: {
      newsletter: !isStaticMode,
      comments: true, // 评论功能两种模式都可用
      rss: isStaticMode, // RSS仅在静态模式生成
      search: true, // 搜索功能两种模式都可用
      analytics: true, // 分析功能两种模式都可用
    },
    // 构建配置
    build: {
      outputMode: isStaticMode ? 'export' : undefined,
      generateRss: isStaticMode,
      enableApiRoutes: !isStaticMode,
    },
  }
}

/**
 * 页面动态配置
 * 用于页面组件的 dynamic 导出
 */
export const pageConfig = getModeConfig()

/**
 * API 路由动态配置
 * 用于 API 路由的 dynamic 导出
 */
export const apiConfig = getModeConfig()

/**
 * 检查功能是否在当前模式下可用
 * @param feature 功能名称
 * @returns 是否可用
 */
export function isFeatureEnabled(feature: keyof typeof pageConfig.features): boolean {
  return pageConfig.features[feature]
}
