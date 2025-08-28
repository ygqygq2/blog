export interface TocHeading {
  value: string
  url: string
  depth: number
}

export function extractTocHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = []
  const lines = content.split('\n')

  // 跟踪是否在代码块中
  let inCodeBlock = false

  for (const line of lines) {
    // 检查是否进入或退出代码块
    if (line.trim().match(/^```/)) {
      inCodeBlock = !inCodeBlock
      continue
    }

    // 如果在代码块中，跳过
    if (inCodeBlock) continue

    // 只匹配行首是#的标题，忽略其他情况
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const depth = match[1].length
      const text = match[2].trim()

      // 生成与rehype-slug插件兼容的ID
      // 注意：这里需要与生成的HTML中的ID格式匹配
      const url =
        '#' +
        text
          .toLowerCase()
          // 替换非字母数字字符为连字符
          .replace(/[^\w\s-]/g, '')
          // 空格替换为连字符
          .replace(/\s+/g, '-')
          // 移除多余连字符
          .replace(/-+/g, '-')
          // 去掉前后的连字符
          .replace(/^-+|-+$/g, '')

      headings.push({
        value: text,
        url,
        depth,
      })
    }
  }

  return headings
}
