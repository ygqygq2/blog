export interface SearchConfig {
  provider?: 'algolia' | 'kbar'
  kbarConfig?: {
    searchDocumentsPath: string
  }
  algoliaConfig?: {
    appId: string
    apiKey: string
    indexName: string
  }
}

export function SearchProvider({
  children,
  searchConfig,
}: {
  children: React.ReactNode
  searchConfig: SearchConfig
}) {
  // 暂时只是一个简单的 wrapper，后续可以根据需要添加搜索功能
  return <>{children}</>
}
