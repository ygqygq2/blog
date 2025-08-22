// 替代 pliny/utils/contentlayer 的工具函数
import type { BlogPost } from './blog'

export type CoreContent<T> = T extends BlogPost
  ? Omit<T, 'body' | '_raw' | '_id'> & {
      // 明确指定核心字段的类型，覆盖索引签名
      slug: string
      title: string
      date: string
      tags: string[]
      lastmod?: string
      draft?: boolean
      summary?: string
      images?: string[]
      author?: string
      authors?: string[]
      layout?: string
      bibliography?: string
      canonicalUrl?: string
      categories?: string[]
      type: string
      path: string
      filePath: string
      toc: Array<{
        value: string
        url: string
        depth: number
      }>
    }
  : Omit<T, 'body' | '_raw' | '_id'>

export function coreContent<T>(content: T): CoreContent<T> {
  return content as CoreContent<T>
}

export function allCoreContent<T>(contents: T[]): CoreContent<T>[] {
  return contents.map(c => coreContent(c))
}

export function sortPosts<T extends { date: string }>(posts: T[]): T[] {
  return posts.sort((a, b) => {
    if (a.date > b.date) return -1
    if (a.date < b.date) return 1
    return 0
  })
}
