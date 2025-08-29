// NOTE: 这个文件仅保留类型/常量声明，用于配置目录下的静态声明。
// 运行时相关的函数已移动到 `lib/mode.ts`，请在运行时代码中使用 `import { getModeConfig, getBuildConfig, isStaticMode } from '../lib/mode'`。

// 仅导出类型以便在 config 目录中引用
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

// 保留一个默认静态配置常量，供静态代码或文档使用
export const DEFAULT_MODE: ModeConfig = {
  isStatic: false,
  dynamic: 'auto',
  apiDynamic: 'force-dynamic',
  shouldGenerateStaticParams: false,
}
