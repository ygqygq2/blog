// 替代 pliny/utils/contentlayer 的工具函数

export type CoreContent<T> = Omit<T, 'body' | '_raw' | '_id'>

export function coreContent<T>(content: T): CoreContent<T> {
  return content as CoreContent<T>
}

export function allCoreContent<T>(contents: T[]): CoreContent<T>[] {
  return contents.map((c) => coreContent(c))
}

export function sortPosts(posts: any[]) {
  return posts.sort((a, b) => {
    if (a.date > b.date) return -1
    if (a.date < b.date) return 1
    return 0
  })
}
