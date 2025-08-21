export interface AnalyticsConfig {
  // 根据需要添加配置
  provider?: string
  googleAnalytics?: {
    googleAnalyticsId: string
  }
  simpleAnalytics?: boolean
  umami?: {
    umamiWebsiteId: string
  }
  posthog?: {
    posthogProjectApiKey: string
  }
  plausibleAnalytics?: {
    plausibleDataDomain: string
  }
}

export function Analytics({ analyticsConfig }: { analyticsConfig: AnalyticsConfig }) {
  // 暂时返回空组件，后续可以根据需要添加具体的分析代码
  return null
}
