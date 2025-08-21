export interface TocHeading {
  value: string
  url: string
  depth: number
}

export function extractTocHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    // 匹配 Markdown 标题
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const depth = match[1].length
      const text = match[2].trim()
      // 生成锚点 URL
      const url =
        '#' +
        text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // 移除特殊字符
          .replace(/\s+/g, '-') // 空格替换为连字符
          .trim()

      headings.push({
        value: text,
        url,
        depth,
      })
    }
  }

  return headings
}
