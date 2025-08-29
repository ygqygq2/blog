/**
 * 搜索分词器
 */

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
