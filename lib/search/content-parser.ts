/**
 * 搜索内容解析器
 */

import type { SearchableContent } from '../search-types'
import { ChineseTokenizer } from './tokenizer'

/**
 * 内容解析器
 */
export class ContentParser {
  /**
   * 解析 MDX 内容为可搜索的内容块
   */
  static parseContent(rawContent: string): SearchableContent[] {
    const contents: SearchableContent[] = []
    const lines = rawContent.split('\n')
    let position = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const content = this.createSearchableContent(line, position++)
      if (content) {
        contents.push(content)
      }
    }

    return contents
  }

  /**
   * 创建可搜索的内容块
   */
  private static createSearchableContent(line: string, position: number): SearchableContent | null {
    // 跳过前置内容和注释
    if (line.startsWith('---') || line.startsWith('import') || line.startsWith('//')) {
      return null
    }

    // 处理标题
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const content = headingMatch[2]
      const plainText = this.stripMarkdown(content)

      return {
        id: `heading-${position}`,
        type: 'heading',
        content,
        plainText,
        tokens: ChineseTokenizer.tokenize(plainText),
        position,
        level,
      }
    }

    // 处理代码块开始
    const codeBlockMatch = line.match(/^```(\w+)?/)
    if (codeBlockMatch) {
      return {
        id: `code-${position}`,
        type: 'code',
        content: line,
        plainText: line,
        tokens: ChineseTokenizer.tokenize(line),
        position,
        language: codeBlockMatch[1] || 'text',
      }
    }

    // 处理列表项
    const listMatch = line.match(/^[\s]*[-*+]\s+(.+)/)
    if (listMatch) {
      const content = listMatch[1]
      const plainText = this.stripMarkdown(content)

      return {
        id: `list-${position}`,
        type: 'list',
        content,
        plainText,
        tokens: ChineseTokenizer.tokenize(plainText),
        position,
      }
    }

    // 处理引用
    const quoteMatch = line.match(/^>\s+(.+)/)
    if (quoteMatch) {
      const content = quoteMatch[1]
      const plainText = this.stripMarkdown(content)

      return {
        id: `quote-${position}`,
        type: 'quote',
        content,
        plainText,
        tokens: ChineseTokenizer.tokenize(plainText),
        position,
      }
    }

    // 处理普通段落
    if (line.length > 10) {
      // 忽略太短的行
      const plainText = this.stripMarkdown(line)

      return {
        id: `paragraph-${position}`,
        type: 'paragraph',
        content: line,
        plainText,
        tokens: ChineseTokenizer.tokenize(plainText),
        position,
      }
    }

    return null
  }

  /**
   * 移除 Markdown 标记
   */
  private static stripMarkdown(text: string): string {
    return (
      text
        // 移除粗体和斜体
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        // 移除行内代码
        .replace(/`(.*?)`/g, '$1')
        // 移除链接
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // 移除图片
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        // 移除其他标记
        .replace(/[#*>-]/g, '')
        .trim()
    )
  }

  /**
   * 计算文本相似度
   */
  static calculateSimilarity(text1: string, text2: string): number {
    const tokens1 = new Set(ChineseTokenizer.tokenize(text1))
    const tokens2 = new Set(ChineseTokenizer.tokenize(text2))

    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)))
    const union = new Set([...tokens1, ...tokens2])

    return union.size > 0 ? intersection.size / union.size : 0
  }
}
