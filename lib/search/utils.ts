/**
 * 搜索工具函数
 */

/**
 * 转义正则表达式特殊字符
 */
export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 计算文章权重
 */
export function calculatePostWeight(post: {
  lastmod?: string
  date: string
  readingTime?: { minutes?: number }
  tags?: string[]
}): number {
  let weight = 1.0
  const now = new Date()
  const postDate = new Date(post.lastmod || post.date)
  const daysSinceUpdate = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24)

  if (daysSinceUpdate < 30) {
    weight += 0.5
  } else if (daysSinceUpdate < 90) {
    weight += 0.3
  } else if (daysSinceUpdate < 180) {
    weight += 0.1
  }

  const readingMinutes = post.readingTime?.minutes || 1
  if (readingMinutes > 10) {
    weight += 0.2
  } else if (readingMinutes < 3) {
    weight -= 0.1
  }

  const tagCount = post.tags?.length || 0
  if (tagCount > 3) {
    weight += 0.1
  }

  const highValueTags = ['教程', 'tutorial', '深度', '原创', '实战', '系列']
  const hasHighValueTag = post.tags?.some((tag: string) =>
    highValueTags.some(hvTag => tag.toLowerCase().includes(hvTag.toLowerCase())),
  )
  if (hasHighValueTag) {
    weight += 0.3
  }

  return Math.max(0.1, Math.min(3.0, weight))
}

/**
 * 获取内容块总数
 */
export function getTotalContentBlocks(indices: { contents: { length: number }[] }[]): number {
  return indices.reduce((total, index) => total + index.contents.length, 0)
}
