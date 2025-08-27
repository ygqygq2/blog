/**
 * 增强的搜索索引生成器
 */

import { writeFileSync } from 'fs'
import { slug } from 'github-slugger'

import { getAllBlogPosts } from './blog'
import { ContentParser } from './content-parser'
import { EnhancedSearchIndex } from './search-types'

/**
 * 创建增强的搜索索引
 */
export async function createEnhancedSearchIndex() {
  console.log('🔍 开始生成增强搜索索引...')
  const startTime = Date.now()

  const allBlogs = await getAllBlogPosts()
  const searchIndices: EnhancedSearchIndex[] = []

  let processedCount = 0
  const totalCount = allBlogs.filter(
    post => !post.draft || process.env.NODE_ENV !== 'production',
  ).length

  for (const post of allBlogs) {
    // 跳过草稿
    if (post.draft && process.env.NODE_ENV === 'production') continue

    console.log(`📄 处理文章: ${post.title} (${++processedCount}/${totalCount})`)

    try {
      // 解析文章内容
      const contents = ContentParser.parseContent(post.body.raw)

      // 计算文章权重（基于更新时间、阅读时间等）
      const weight = calculatePostWeight(post)

      // 创建增强索引
      const searchIndex: EnhancedSearchIndex = {
        slug: post.slug,
        title: post.title,
        summary: post.summary || '',
        tags: post.tags || [],
        date: post.date,
        lastmod: post.lastmod,
        author: post.author,
        readingTime: {
          text: post.readingTime.text,
          minutes: post.readingTime.minutes,
          words: post.readingTime.words,
        },
        contents,
        toc: post.toc.map((item, index) => ({
          ...item,
          position: index,
        })),
        weight,
      }

      searchIndices.push(searchIndex)
    } catch (error) {
      console.error(`❌ 处理文章失败: ${post.title}`, error)
      // 创建基础索引作为回退
      const fallbackIndex: EnhancedSearchIndex = {
        slug: post.slug,
        title: post.title,
        summary: post.summary || '',
        tags: post.tags || [],
        date: post.date,
        lastmod: post.lastmod,
        author: post.author,
        readingTime: {
          text: post.readingTime.text,
          minutes: post.readingTime.minutes,
          words: post.readingTime.words,
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
        toc: post.toc.map((item, index) => ({
          ...item,
          position: index,
        })),
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

/**
 * 生成多个搜索索引文件
 */
async function generateSearchIndices(indices: EnhancedSearchIndex[]) {
  // 1. 生成完整的增强索引（用于高级搜索）
  writeFileSync('public/search-enhanced.json', JSON.stringify(indices, null, 0))
  console.log('📝 生成增强搜索索引: search-enhanced.json')

  // 2. 生成兼容的简化索引（向后兼容）
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
  console.log('📝 生成兼容搜索索引: search.json')

  // 3. 生成元数据索引（快速预览）
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

  // 4. 生成分片索引（大型博客优化）
  const chunkSize = 20
  const chunks: EnhancedSearchIndex[][] = []
  for (let i = 0; i < indices.length; i += chunkSize) {
    chunks.push(indices.slice(i, i + chunkSize))
  }

  const manifest = {
    version: Date.now(),
    totalPosts: indices.length,
    chunks: chunks.length,
    chunkSize,
    lastUpdate: new Date().toISOString(),
  }

  writeFileSync('public/search-manifest.json', JSON.stringify(manifest, null, 2))

  for (let i = 0; i < chunks.length; i++) {
    writeFileSync(`public/search-chunk-${i}.json`, JSON.stringify(chunks[i], null, 0))
  }

  console.log(`📝 生成 ${chunks.length} 个分片索引文件`)
}

/**
 * 计算文章权重
 */
function calculatePostWeight(post: {
  date: string
  lastmod?: string
  readingTime: { minutes: number }
  tags?: string[]
}): number {
  let weight = 1.0

  // 基于更新时间的权重
  const now = new Date()
  const postDate = new Date(post.lastmod || post.date)
  const daysSinceUpdate = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24)

  // 最近更新的文章权重更高
  if (daysSinceUpdate < 30) {
    weight += 0.5
  } else if (daysSinceUpdate < 90) {
    weight += 0.3
  } else if (daysSinceUpdate < 180) {
    weight += 0.1
  }

  // 基于阅读时间的权重
  const readingMinutes = post.readingTime.minutes
  if (readingMinutes > 10) {
    weight += 0.2 // 长文章可能更有价值
  } else if (readingMinutes < 3) {
    weight -= 0.1 // 很短的文章权重略低
  }

  // 基于标签数量的权重
  const tagCount = post.tags?.length || 0
  if (tagCount > 3) {
    weight += 0.1
  }

  // 特殊标签的权重加成
  const highValueTags = ['教程', 'tutorial', '深度', '原创', '实战', '系列']
  const hasHighValueTag = post.tags?.some((tag: string) =>
    highValueTags.some(hvTag => tag.toLowerCase().includes(hvTag.toLowerCase())),
  )
  if (hasHighValueTag) {
    weight += 0.3
  }

  return Math.max(0.1, Math.min(3.0, weight)) // 限制权重范围
}

/**
 * 统计总内容块数量
 */
function getTotalContentBlocks(indices: EnhancedSearchIndex[]): number {
  return indices.reduce((total, index) => total + index.contents.length, 0)
}

/**
 * 兼容原有的搜索索引生成（保持向后兼容）
 */
export async function createSearchIndex() {
  console.log('📄 生成兼容搜索索引...')

  const allBlogs = await getAllBlogPosts()
  const searchData = allBlogs
    .filter(post => !post.draft || process.env.NODE_ENV !== 'production')
    .map(post => ({
      slug: post.slug,
      title: post.title,
      summary: post.summary || '',
      content: post.body.raw,
      tags: post.tags,
      date: post.date,
    }))

  writeFileSync('public/search.json', JSON.stringify(searchData))
  console.log('✅ 兼容搜索索引生成完成...')
}

/**
 * 创建标签统计（保持向后兼容）
 */
export async function createTagCount() {
  const allBlogs = await getAllBlogPosts()
  const tagCount: Record<string, number> = {}

  allBlogs.forEach(file => {
    if (file.tags && (!file.draft || process.env.NODE_ENV !== 'production')) {
      file.tags.forEach(tag => {
        const formattedTag = slug(tag)
        if (formattedTag in tagCount) {
          tagCount[formattedTag] += 1
        } else {
          tagCount[formattedTag] = 1
        }
      })
    }
  })

  writeFileSync('./app/tag-data.json', JSON.stringify(tagCount))
  console.log('✅ 标签统计生成完成...')
}
