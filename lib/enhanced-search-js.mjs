/**
 * 增强搜索索引生成器 - JavaScript版本
 * 供构建脚本使用
 */

import crypto from 'crypto'
import { writeFileSync } from 'fs'

import { calculatePostWeight, getTotalContentBlocks } from './search/utils.ts'

// 简化的中文分词器
class SimpleTokenizer {
  static tokenize(text) {
    const tokens = []
    const cleanText = text
      .replace(/\s+/g, ' ')
      .replace(/[，。！？；：""''（）【】《》]/g, ' ')
      .trim()

    // 分离中英文
    const segments = this.splitMixedText(cleanText)

    for (const segment of segments) {
      if (this.isChinese(segment)) {
        tokens.push(...this.tokenizeChinese(segment))
      } else {
        tokens.push(...this.tokenizeEnglish(segment))
      }
    }

    return tokens.filter(token => token.length > 0)
  }

  static splitMixedText(text) {
    const segments = []
    let current = ''
    let isChinese = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const charIsChinese = /[\u4e00-\u9fff]/.test(char)

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

  static isChinese(text) {
    return /[\u4e00-\u9fff]/.test(text)
  }

  static tokenizeChinese(text) {
    const tokens = []

    // 单字分词
    for (const char of text) {
      if (char.trim() && /[\u4e00-\u9fff]/.test(char)) {
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

  static tokenizeEnglish(text) {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 0 && /^[a-zA-Z0-9]+$/.test(word))
  }
}

// 简化的内容解析器
class SimpleContentParser {
  static parseContent(rawContent) {
    const contents = []
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

  static createSearchableContent(line, position) {
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
        tokens: SimpleTokenizer.tokenize(plainText),
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
        tokens: SimpleTokenizer.tokenize(line),
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
        tokens: SimpleTokenizer.tokenize(plainText),
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
        tokens: SimpleTokenizer.tokenize(plainText),
        position,
      }
    }

    // 处理普通段落
    if (line.length > 10) {
      const plainText = this.stripMarkdown(line)

      return {
        id: `paragraph-${position}`,
        type: 'paragraph',
        content: line,
        plainText,
        tokens: SimpleTokenizer.tokenize(plainText),
        position,
      }
    }

    return null
  }

  static stripMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      .replace(/[#*>-]/g, '')
      .trim()
  }
}

// 主要的增强索引生成函数
export async function createEnhancedSearchIndexJS(posts) {
  console.log('🔍 开始生成增强搜索索引（JS版本）...')
  const startTime = Date.now()

  const searchIndices = []
  let processedCount = 0
  const totalCount = posts.filter(
    post => !post.draft || process.env.NODE_ENV !== 'production',
  ).length

  for (const post of posts) {
    if (post.draft && process.env.NODE_ENV === 'production') continue

    console.log(`📄 处理文章: ${post.title} (${++processedCount}/${totalCount})`)

    try {
      // 解析文章内容
      const contents = SimpleContentParser.parseContent(post.body.raw)

      // 计算文章权重
      const weight = calculatePostWeight(post)

      // 创建增强索引
      const searchIndex = {
        slug: post.slug,
        title: post.title,
        summary: post.summary || '',
        tags: post.tags || [],
        date: post.date,
        lastmod: post.lastmod,
        author: post.author,
        readingTime: {
          text: post.readingTime?.text || '1 min read',
          minutes: post.readingTime?.minutes || 1,
          words: post.readingTime?.words || 100,
        },
        contents,
        toc: (post.toc || []).map((item, index) => ({
          ...item,
          position: index,
        })),
        weight,
      }

      searchIndices.push(searchIndex)
    } catch (error) {
      console.error(`❌ 处理文章失败: ${post.title}`, error)
      // 创建基础索引作为回退
      const fallbackIndex = {
        slug: post.slug,
        title: post.title,
        summary: post.summary || '',
        tags: post.tags || [],
        date: post.date,
        lastmod: post.lastmod,
        author: post.author,
        readingTime: {
          text: '1 min read',
          minutes: 1,
          words: 100,
        },
        contents: [
          {
            id: 'fallback-0',
            type: 'paragraph',
            content: post.body.raw.slice(0, 500),
            plainText: post.body.raw.slice(0, 500),
            position: 0,
          },
        ],
        toc: [],
        weight: 1,
      }
      searchIndices.push(fallbackIndex)
    }
  }

  // 按权重和日期排序
  searchIndices.sort((a, b) => {
    const weightDiff = b.weight - a.weight
    if (Math.abs(weightDiff) > 0.1) return weightDiff
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // 生成多个索引文件
  await generateSearchIndices(searchIndices)

  const endTime = Date.now()
  console.log(`✅ 增强搜索索引生成完成，耗时: ${endTime - startTime}ms`)
  console.log(
    `📊 处理了 ${searchIndices.length} 篇文章，共 ${getTotalContentBlocks(searchIndices)} 个内容块`,
  )
}

async function generateSearchIndices(indices) {
  // 1. 生成完整的增强索引
  writeFileSync('public/search-enhanced.json', JSON.stringify(indices, null, 0))
  console.log('📝 生成增强搜索索引: search-enhanced.json')

  // 2. 更新兼容的简化索引
  const simpleIndices = indices.map(index => ({
    slug: index.slug,
    title: index.title,
    summary: index.summary,
    content: index.contents
      .map(c => c.plainText)
      .join(' ')
      .slice(0, 1000),
    tags: index.tags,
    date: index.date,
  }))
  writeFileSync('public/search.json', JSON.stringify(simpleIndices, null, 0))
  console.log('📝 更新兼容搜索索引: search.json')

  // 3. 生成元数据索引
  const metaIndices = indices.map(index => ({
    slug: index.slug,
    title: index.title,
    summary: index.summary,
    tags: index.tags,
    date: index.date,
    readingTime: index.readingTime,
    weight: index.weight,
    contentCount: index.contents.length,
  }))
  writeFileSync('public/search-meta.json', JSON.stringify(metaIndices, null, 0))
  console.log('📝 生成元数据索引: search-meta.json')

  // 4. 生成元数据信息
  const metadata = {
    version: Date.now(),
    totalPosts: indices.length,
    lastUpdate: new Date().toISOString(),
    buildId: crypto.randomBytes(8).toString('hex'),
  }
  writeFileSync('public/search-metadata.json', JSON.stringify(metadata, null, 2))
  console.log('📝 生成搜索元数据: search-metadata.json')
}
