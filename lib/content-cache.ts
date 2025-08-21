interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface BlogPostMeta {
  slug: string
  title: string
  date: string
  tags: string[]
  draft?: boolean
  summary?: string
  [key: string]: any
}

class ContentCache {
  private contentCache = new Map<string, CacheEntry<any>>()
  private indexCache = new Map<string, CacheEntry<BlogPostMeta>>()
  private lastIndexUpdate = 0
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5分钟

  // 检查索引是否新鲜
  isIndexFresh(): boolean {
    const now = Date.now()
    return now - this.lastIndexUpdate < this.DEFAULT_TTL
  }

  // 更新索引时间戳
  updateIndex(): void {
    this.lastIndexUpdate = Date.now()
  }

  // 设置单个文章元数据
  setPost(slug: string, post: BlogPostMeta): void {
    this.indexCache.set(slug, {
      data: post,
      timestamp: Date.now(),
      ttl: this.DEFAULT_TTL,
    })
  }

  // 设置完整内容
  setContent(slug: string, content: any): void {
    this.contentCache.set(slug, {
      data: content,
      timestamp: Date.now(),
      ttl: this.DEFAULT_TTL,
    })
  }

  // 获取所有文章元数据
  getAllPosts(): BlogPostMeta[] {
    const posts: BlogPostMeta[] = []
    const now = Date.now()

    for (const [slug, entry] of this.indexCache.entries()) {
      if (now - entry.timestamp < entry.ttl) {
        posts.push(entry.data)
      } else {
        this.indexCache.delete(slug)
      }
    }

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // 获取单个内容
  getContent(slug: string): any | null {
    const entry = this.contentCache.get(slug)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.contentCache.delete(slug)
      return null
    }

    return entry.data
  }

  // 清除过期缓存
  cleanup(): void {
    const now = Date.now()

    for (const [key, entry] of this.contentCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.contentCache.delete(key)
      }
    }

    for (const [key, entry] of this.indexCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.indexCache.delete(key)
      }
    }
  }

  // 获取缓存统计
  getStats() {
    return {
      contentCacheSize: this.contentCache.size,
      indexCacheSize: this.indexCache.size,
      lastIndexUpdate: this.lastIndexUpdate,
      isIndexFresh: this.isIndexFresh(),
    }
  }
}

// 导出单例
export const contentCache = new ContentCache()

// 导出便捷函数
export function getCachedContent(slug: string) {
  return contentCache.getContent(slug)
}

// 定期清理过期缓存 (仅在 Node.js 环境下)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  setInterval(() => {
    contentCache.cleanup()
  }, 60 * 1000) // 每分钟清理一次
}
