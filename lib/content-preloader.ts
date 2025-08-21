// 内容预加载器 - 在构建时预加载热门内容
import { getAllBlogPosts } from './blog'
import { contentCache } from './content-cache'

export class ContentPreloader {
  private static instance: ContentPreloader
  private isPreloaded = false

  static getInstance(): ContentPreloader {
    if (!ContentPreloader.instance) {
      ContentPreloader.instance = new ContentPreloader()
    }
    return ContentPreloader.instance
  }

  async preloadContent(): Promise<void> {
    if (this.isPreloaded) return

    try {
      console.log('📚 预加载内容开始...')
      const startTime = Date.now()

      // 预加载所有文章元数据
      const posts = await getAllBlogPosts()
      console.log(`✅ 预加载 ${posts.length} 篇文章元数据`)

      // 预加载热门文章的完整内容（最新的20篇）
      const recentPosts = posts.slice(0, 20)
      for (const post of recentPosts) {
        contentCache.setContent(post.slug, post)
      }

      const endTime = Date.now()
      console.log(`🚀 内容预加载完成，耗时: ${endTime - startTime}ms`)
      this.isPreloaded = true
    } catch (error) {
      console.error('❌ 内容预加载失败:', error)
    }
  }

  getPreloadStats() {
    return {
      isPreloaded: this.isPreloaded,
      cacheStats: contentCache.getStats(),
    }
  }
}

// 在服务器启动时预加载内容
if (typeof window === 'undefined') {
  const preloader = ContentPreloader.getInstance()
  // 延迟预加载，避免阻塞启动
  setTimeout(() => {
    preloader.preloadContent()
  }, 100)
}
