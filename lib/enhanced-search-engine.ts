/**
 * 增强搜索引擎
 */

import type { FuseResult } from 'fuse.js'
import Fuse from 'fuse.js'

import { ChineseTokenizer } from './content-parser'
import { EnhancedSearchIndex, SearchableContent, SearchConfig, SearchResult } from './search-types'

export class EnhancedSearchEngine {
  private indices: EnhancedSearchIndex[] = []
  private fuseInstance: Fuse<EnhancedSearchIndex> | null = null
  private contentFuseInstance: Fuse<SearchableContent & { postSlug: string }> | null = null
  private config: SearchConfig
  private isLoaded = false

  constructor(config?: Partial<SearchConfig>) {
    this.config = {
      threshold: 0.3,
      minMatchCharLength: 2,
      maxResults: 10,
      maxMatchesPerPost: 3,
      contextLength: 100,
      fieldWeights: {
        title: 3,
        summary: 2,
        heading: 2.5,
        paragraph: 1,
        code: 1.5,
        tags: 1,
      },
      enableRandomSort: true, // 默认启用随机排序
      randomSortWeight: 0.3, // 随机权重30%，相关性权重70%
      ...config,
    }
  }

  /**
   * 加载搜索索引
   */
  async loadIndex(indexUrl: string = '/search-enhanced.json'): Promise<void> {
    try {
      console.log('🔍 加载增强搜索索引...')
      const response = await fetch(indexUrl)
      if (!response.ok) {
        throw new Error(`Failed to load search index: ${response.status}`)
      }

      this.indices = await response.json()
      this.initializeFuseInstances()
      this.isLoaded = true
      console.log(`✅ 搜索索引加载完成，包含 ${this.indices.length} 篇文章`)
    } catch (error) {
      console.error('❌ 搜索索引加载失败:', error)
      // 尝试回退到简单索引
      await this.loadFallbackIndex()
    }
  }

  /**
   * 回退到简单索引
   */
  private async loadFallbackIndex(): Promise<void> {
    try {
      console.log('🔄 尝试加载兼容索引...')
      const response = await fetch('/search.json')
      const simpleIndices: {
        slug: string
        title: string
        summary?: string
        tags?: string[]
        date: string
        content?: string
      }[] = await response.json()

      // 转换为增强索引格式
      this.indices = simpleIndices.map(
        (item: {
          slug: string
          title: string
          summary?: string
          tags?: string[]
          date: string
          content?: string
        }) => ({
          slug: item.slug,
          title: item.title,
          summary: item.summary || '',
          tags: item.tags || [],
          date: item.date,
          readingTime: {
            text: '阅读时间未知',
            minutes: 1,
            words: 100,
          },
          contents: [
            {
              id: 'fallback-0',
              type: 'paragraph' as const,
              content: item.content || item.summary || '',
              plainText: item.content || item.summary || '',
              position: 0,
            },
          ],
          toc: [],
          weight: 1,
        }),
      )

      this.initializeFuseInstances()
      this.isLoaded = true
      console.log(`✅ 兼容索引加载完成，包含 ${this.indices.length} 篇文章`)
    } catch (error) {
      console.error('❌ 兼容索引加载也失败了:', error)
      throw error
    }
  }

  /**
   * 初始化 Fuse 实例
   */
  private initializeFuseInstances(): void {
    // 文章级别的搜索实例
    this.fuseInstance = new Fuse(this.indices, {
      keys: [
        { name: 'title', weight: this.config.fieldWeights.title },
        { name: 'summary', weight: this.config.fieldWeights.summary },
        { name: 'tags', weight: this.config.fieldWeights.tags },
      ],
      threshold: this.config.threshold,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: this.config.minMatchCharLength,
    })

    // 内容级别的搜索实例
    const allContents: (SearchableContent & { postSlug: string })[] = []
    for (const index of this.indices) {
      for (const content of index.contents) {
        allContents.push({
          ...content,
          postSlug: index.slug,
        })
      }
    }

    this.contentFuseInstance = new Fuse(allContents, {
      keys: [
        { name: 'plainText', weight: this.getContentWeight('paragraph') },
        { name: 'content', weight: this.getContentWeight('paragraph') * 0.8 },
      ],
      threshold: this.config.threshold,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: this.config.minMatchCharLength,
    })
  }

  /**
   * 获取内容类型的权重
   */
  private getContentWeight(type: SearchableContent['type']): number {
    return this.config.fieldWeights[type] || 1
  }

  /**
   * 执行搜索
   */
  async search(query: string): Promise<SearchResult[]> {
    if (!this.isLoaded || !this.fuseInstance || !this.contentFuseInstance) {
      throw new Error('搜索索引未加载')
    }

    if (!query || query.trim().length < this.config.minMatchCharLength) {
      return []
    }

    console.log(`🔍 搜索关键词: "${query}"`)
    const startTime = performance.now()

    // 1. 文章级别搜索
    const postResults = this.fuseInstance.search(query)

    // 2. 内容级别搜索
    const contentResults = this.contentFuseInstance.search(query)

    // 3. 合并和整理结果
    const combinedResults = this.combineResults(query, postResults, contentResults)

    // 4. 应用高级过滤和排序
    const finalResults = this.rankAndFilterResults(combinedResults)

    const endTime = performance.now()
    console.log(
      `✅ 搜索完成，耗时: ${(endTime - startTime).toFixed(2)}ms，返回 ${finalResults.length} 个结果`,
    )

    return finalResults
  }

  /**
   * 合并搜索结果
   */
  private combineResults(
    query: string,
    postResults: FuseResult<EnhancedSearchIndex>[],
    contentResults: FuseResult<SearchableContent & { postSlug: string }>[],
  ): Map<string, SearchResult> {
    const resultsMap = new Map<string, SearchResult>()

    // 处理文章级别的匹配
    for (const result of postResults) {
      const post = result.item
      if (!resultsMap.has(post.slug)) {
        resultsMap.set(post.slug, {
          post: {
            slug: post.slug,
            title: post.title,
            summary: post.summary,
            tags: post.tags,
            date: post.date,
            readingTime: post.readingTime,
          },
          matches: [],
          totalScore: result.score || 0,
        })
      }
    }

    // 处理内容级别的匹配
    for (const result of contentResults) {
      const content = result.item
      const postSlug = content.postSlug

      // 找到对应的文章
      const postIndex = this.indices.find(index => index.slug === postSlug)
      if (!postIndex) continue

      if (!resultsMap.has(postSlug)) {
        resultsMap.set(postSlug, {
          post: {
            slug: postIndex.slug,
            title: postIndex.title,
            summary: postIndex.summary,
            tags: postIndex.tags,
            date: postIndex.date,
            readingTime: postIndex.readingTime,
          },
          matches: [],
          totalScore: 0,
        })
      }

      const searchResult = resultsMap.get(postSlug)!

      // 生成高亮片段
      const highlights = this.generateHighlights(query, content.plainText)
      const context = this.generateContext(content.plainText, query)

      searchResult.matches.push({
        content,
        score: result.score || 0,
        highlights,
        context,
      })
    }

    return resultsMap
  }

  /**
   * 生成高亮片段
   */
  private generateHighlights(query: string, text: string): string[] {
    const tokens = ChineseTokenizer.tokenize(query.toLowerCase())
    const highlights: string[] = []

    for (const token of tokens) {
      const regex = new RegExp(`(.{0,20})(${this.escapeRegex(token)})(.{0,20})`, 'gi')
      const matches = text.matchAll(regex)

      for (const match of matches) {
        highlights.push(`${match[1]}<mark>${match[2]}</mark>${match[3]}`)
      }
    }

    return highlights.slice(0, 3) // 限制高亮片段数量
  }

  /**
   * 生成上下文
   */
  private generateContext(text: string, query: string): { before: string; after: string } {
    const queryIndex = text.toLowerCase().indexOf(query.toLowerCase())

    if (queryIndex === -1) {
      return {
        before: text.slice(0, this.config.contextLength),
        after: text.slice(-this.config.contextLength),
      }
    }

    const beforeStart = Math.max(0, queryIndex - this.config.contextLength / 2)
    const afterEnd = Math.min(
      text.length,
      queryIndex + query.length + this.config.contextLength / 2,
    )

    return {
      before: text.slice(beforeStart, queryIndex),
      after: text.slice(queryIndex + query.length, afterEnd),
    }
  }

  /**
   * 排序和过滤结果
   */
  private rankAndFilterResults(resultsMap: Map<string, SearchResult>): SearchResult[] {
    const results = Array.from(resultsMap.values())

    // 计算总分数
    for (const result of results) {
      let totalScore = result.totalScore

      // 加上内容匹配分数
      for (const match of result.matches) {
        totalScore += (1 - match.score) * this.getContentWeight(match.content.type)
      }

      // 应用文章权重
      const postIndex = this.indices.find(index => index.slug === result.post.slug)
      if (postIndex) {
        totalScore *= postIndex.weight
      }

      result.totalScore = totalScore
    }

    // 排序：结合相关性和随机性
    if (this.config.enableRandomSort && this.config.randomSortWeight !== undefined) {
      // 随机排序模式：结合相关性分数和随机因子
      results.sort((a, b) => {
        const randomFactorA = Math.random()
        const randomFactorB = Math.random()

        // 结合相关性分数和随机因子
        const finalScoreA =
          (1 - this.config.randomSortWeight!) * a.totalScore +
          this.config.randomSortWeight! * randomFactorA
        const finalScoreB =
          (1 - this.config.randomSortWeight!) * b.totalScore +
          this.config.randomSortWeight! * randomFactorB

        return finalScoreB - finalScoreA
      })
    } else {
      // 传统排序：按相关性分数
      results.sort((a, b) => b.totalScore - a.totalScore)
    }

    // 限制每篇文章的匹配数量
    for (const result of results) {
      result.matches = result.matches
        .sort((a, b) => a.score - b.score) // 分数越低越好（Fuse.js 的分数机制）
        .slice(0, this.config.maxMatchesPerPost)
    }

    // 返回限定数量的结果
    return results.slice(0, this.config.maxResults)
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 获取搜索建议
   */
  getSuggestions(query: string, limit: number = 5): string[] {
    if (!this.isLoaded || query.length < 2) {
      return []
    }

    const suggestions = new Set<string>()

    // 从文章标题中提取建议
    for (const index of this.indices) {
      const title = index.title.toLowerCase()
      if (title.includes(query.toLowerCase())) {
        suggestions.add(index.title)
      }

      // 从标签中提取建议
      for (const tag of index.tags) {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(tag)
        }
      }
    }

    return Array.from(suggestions).slice(0, limit)
  }

  /**
   * 获取统计信息
   */
  getStats() {
    if (!this.isLoaded) {
      return null
    }

    const totalContents = this.indices.reduce((sum, index) => sum + index.contents.length, 0)
    const avgContentsPerPost = totalContents / this.indices.length

    return {
      totalPosts: this.indices.length,
      totalContents,
      avgContentsPerPost: Math.round(avgContentsPerPost * 100) / 100,
      isLoaded: this.isLoaded,
    }
  }

  /**
   * 获取初始显示的文章列表（无搜索时显示）
   * 支持随机排序满足用户偏好
   */
  getInitialArticles(limit: number = 10): SearchResult[] {
    if (!this.isLoaded) {
      return []
    }

    // 获取所有文章
    const articles = this.indices.slice()

    // 如果启用随机排序，对文章进行打乱
    if (this.config.enableRandomSort) {
      // Fisher-Yates 打乱算法
      for (let i = articles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[articles[i], articles[j]] = [articles[j], articles[i]]
      }
    } else {
      // 传统排序：按权重和日期排序
      articles.sort((a, b) => {
        const weightDiff = b.weight - a.weight
        if (Math.abs(weightDiff) > 0.1) return weightDiff
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
    }

    // 转换为 SearchResult 格式
    return articles.slice(0, limit).map(article => ({
      post: {
        slug: article.slug,
        title: article.title,
        summary: article.summary,
        tags: article.tags,
        date: article.date,
        readingTime: article.readingTime,
      },
      matches: [], // 初始显示时没有具体匹配片段
      totalScore: article.weight, // 使用文章权重作为分数
    }))
  }
}
