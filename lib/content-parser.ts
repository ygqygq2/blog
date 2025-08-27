/**
 * 内容处理和分词工具
 */

import { SearchableContent } from './search-types'

/**
 * 简单的中文分词实现
 * 在生产环境中建议使用 nodejieba 或其他专业分词库
 */
export class ChineseTokenizer {
  // 中文标点符号
  private static readonly CHINESE_PUNCTUATION = /[，。！？；：""''（）【】《》]/g

  // 英文分词正则
  private static readonly WORD_BOUNDARY = /\b/g

  // 中文字符正则
  private static readonly CHINESE_CHAR = /[\u4e00-\u9fff]/

  /**
   * 对文本进行分词
   */
  static tokenize(text: string): string[] {
    const tokens: string[] = []

    // 清理文本
    const cleanText = text.replace(/\s+/g, ' ').replace(this.CHINESE_PUNCTUATION, ' ').trim()

    // 分离中英文
    const segments = this.splitMixedText(cleanText)

    for (const segment of segments) {
      if (this.isChinese(segment)) {
        // 中文按字符分词，同时保留词组
        tokens.push(...this.tokenizeChinese(segment))
      } else {
        // 英文按单词分词
        tokens.push(...this.tokenizeEnglish(segment))
      }
    }

    return tokens.filter(token => token.length > 0)
  }

  /**
   * 分离中英文混合文本
   */
  private static splitMixedText(text: string): string[] {
    const segments: string[] = []
    let current = ''
    let isChinese = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const charIsChinese = this.CHINESE_CHAR.test(char)

      if (i === 0) {
        isChinese = charIsChinese
        current = char
      } else if (charIsChinese === isChinese) {
        current += char
      } else {
        if (current.trim()) {
          segments.push(current.trim())
        }
        current = char
        isChinese = charIsChinese
      }
    }

    if (current.trim()) {
      segments.push(current.trim())
    }

    return segments
  }

  /**
   * 判断是否为中文文本
   */
  private static isChinese(text: string): boolean {
    return this.CHINESE_CHAR.test(text)
  }

  /**
   * 中文分词
   */
  private static tokenizeChinese(text: string): string[] {
    const tokens: string[] = []

    // 单字分词
    for (const char of text) {
      if (char.trim() && this.CHINESE_CHAR.test(char)) {
        tokens.push(char)
      }
    }

    // 二字词组
    for (let i = 0; i < text.length - 1; i++) {
      const bigram = text.slice(i, i + 2)
      if (bigram.length === 2 && /^[\u4e00-\u9fff]{2}$/.test(bigram)) {
        tokens.push(bigram)
      }
    }

    // 三字词组
    for (let i = 0; i < text.length - 2; i++) {
      const trigram = text.slice(i, i + 3)
      if (trigram.length === 3 && /^[\u4e00-\u9fff]{3}$/.test(trigram)) {
        tokens.push(trigram)
      }
    }

    return tokens
  }

  /**
   * 英文分词
   */
  private static tokenizeEnglish(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 0 && /^[a-zA-Z0-9]+$/.test(word))
  }
}

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
