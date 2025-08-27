/**
 * 增强的搜索索引类型定义
 */

export interface SearchableContent {
  /** 内容块的唯一标识符 */
  id: string
  /** 内容类型 */
  type: 'heading' | 'paragraph' | 'code' | 'list' | 'quote'
  /** 原始内容 */
  content: string
  /** 处理后的纯文本内容 */
  plainText: string
  /** 中文分词结果 */
  tokens?: string[]
  /** 在文档中的位置（行号或段落索引） */
  position: number
  /** 标题层级（仅用于heading类型） */
  level?: number
  /** 编程语言（仅用于code类型） */
  language?: string
}

export interface EnhancedSearchIndex {
  /** 文章基本信息 */
  slug: string
  title: string
  summary: string
  tags: string[]
  date: string
  lastmod?: string
  author?: string
  /** 文章阅读时间信息 */
  readingTime: {
    text: string
    minutes: number
    words: number
  }
  /** 文章的可搜索内容块 */
  contents: SearchableContent[]
  /** 文章的目录结构 */
  toc: Array<{
    value: string
    url: string
    depth: number
    position: number
  }>
  /** 搜索权重（基于文章热度、更新时间等） */
  weight: number
}

export interface SearchResult {
  /** 匹配的文章信息 */
  post: {
    slug: string
    title: string
    summary: string
    tags: string[]
    date: string
    readingTime: {
      text: string
      minutes: number
    }
  }
  /** 匹配的内容片段 */
  matches: Array<{
    /** 匹配的内容块 */
    content: SearchableContent
    /** 匹配分数 */
    score: number
    /** 高亮的文本片段 */
    highlights: string[]
    /** 上下文片段 */
    context: {
      before: string
      after: string
    }
  }>
  /** 总体匹配分数 */
  totalScore: number
}

export interface SearchConfig {
  /** 模糊搜索阈值 */
  threshold: number
  /** 最小匹配字符长度 */
  minMatchCharLength: number
  /** 搜索结果数量限制 */
  maxResults: number
  /** 每个文章的最大匹配片段数 */
  maxMatchesPerPost: number
  /** 上下文长度（字符数） */
  contextLength: number
  /** 搜索字段权重配置 */
  fieldWeights: {
    title: number
    summary: number
    heading: number
    paragraph: number
    code: number
    tags: number
  }
  /** 是否启用随机排序 */
  enableRandomSort?: boolean
  /** 随机排序的权重（0-1，0为完全随机，1为完全按相关性） */
  randomSortWeight?: number
}
