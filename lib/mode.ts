// 运行模式相关函数，放在 lib 目录中（运行时代码）
export interface ModeConfig {
  isStatic: boolean
  dynamic: string
  apiDynamic: string
  shouldGenerateStaticParams: boolean
}

export interface BuildConfig {
  outputMode?: string
  generateRss: boolean
  enableApiRoutes: boolean
}

export function getModeConfig(): ModeConfig {
  const isStaticMode = process.env.EXPORT === 'true' || process.env.EXPORT === '1'

  return {
    isStatic: isStaticMode,
    dynamic: isStaticMode ? 'force-static' : 'auto',
    apiDynamic: isStaticMode ? 'force-static' : 'force-dynamic',
    shouldGenerateStaticParams: isStaticMode,
  }
}

export function getBuildConfig(): BuildConfig {
  const isStaticMode = getModeConfig().isStatic

  return {
    outputMode: isStaticMode ? 'export' : undefined,
    generateRss: isStaticMode,
    enableApiRoutes: !isStaticMode,
  }
}

export const isStaticMode = getModeConfig().isStatic
