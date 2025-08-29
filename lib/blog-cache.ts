/**
 * 博客文章缓存管理
 */

import type { BlogPost } from './blog'

class BlogCache {
  private posts: Map<string, BlogPost> = new Map()
  private indexFresh: boolean = false
  private lastUpdate: number = 0

  // 设置单个文章
  setPost(slug: string, post: BlogPost): void {
    this.posts.set(slug, post)
  }

  // 获取缓存的文章
  getCachedContent(slug: string): BlogPost | null {
    return this.posts.get(slug) || null
  }

  // 获取所有文章
  getAllPosts(): BlogPost[] {
    return Array.from(this.posts.values())
  }

  // 更新索引状态
  updateIndex(): void {
    this.indexFresh = true
    this.lastUpdate = Date.now()
  }

  // 检查索引是否新鲜
  isIndexFresh(): boolean {
    // 5分钟内认为是新鲜的
    return this.indexFresh && Date.now() - this.lastUpdate < 5 * 60 * 1000
  }

  // 获取缓存统计信息
  getStats() {
    return {
      indexCacheSize: this.posts.size,
      lastUpdate: this.lastUpdate,
      isFresh: this.isIndexFresh(),
    }
  }

  // 设置完整内容
  setContent(slug: string, post: BlogPost): void {
    this.posts.set(slug, post)
  }
}

export const contentCache = new BlogCache()
export const getCachedContent = (slug: string) => contentCache.getCachedContent(slug)
