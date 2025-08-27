/**
 * 增量搜索索引更新机制
 */

import crypto from 'crypto'
import fs from 'fs'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

import { getAllBlogPosts } from './blog'
import { ContentParser } from './content-parser'
import { EnhancedSearchIndex } from './search-types'

interface IndexMetadata {
  version: string
  lastUpdate: string
  fileHashes: Record<string, string>
  totalPosts: number
  buildId: string
}

export class IncrementalIndexManager {
  private metadataPath = 'public/search-metadata.json'
  private indexPath = 'public/search-enhanced.json'
  private contentDir = path.join(process.cwd(), 'data', 'blog')

  /**
   * 执行增量更新
   */
  async performIncrementalUpdate(): Promise<boolean> {
    try {
      const currentHashes = await this.calculateFileHashes()
      const currentMetadata = this.loadMetadata()

      if (!this.needsUpdate(currentMetadata, currentHashes)) {
        console.log('📋 搜索索引已是最新，无需更新')
        return false
      }

      console.log('🔄 执行增量索引更新...')

      // 重新生成完整索引（简化版本）
      const allPosts = await getAllBlogPosts()
      const indices: EnhancedSearchIndex[] = []

      for (const post of allPosts) {
        if (post.draft && process.env.NODE_ENV === 'production') continue

        try {
          const contents = ContentParser.parseContent(post.body.raw)
          const weight = this.calculatePostWeight(post)

          indices.push({
            slug: post.slug,
            title: post.title,
            summary: post.summary || '',
            tags: post.tags || [],
            date: post.date,
            lastmod: post.lastmod,
            author: post.author,
            readingTime: post.readingTime,
            contents,
            toc: post.toc.map((item, index) => ({ ...item, position: index })),
            weight,
          })
        } catch (error) {
          console.error(`处理文章失败: ${post.title}`, error)
        }
      }

      // 排序并保存
      indices.sort(
        (a, b) => b.weight - a.weight || new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      await this.saveIndex(indices, currentHashes)

      console.log(`✅ 索引更新完成，包含 ${indices.length} 篇文章`)
      return true
    } catch (error) {
      console.error('❌ 增量更新失败:', error)
      return false
    }
  }

  private async calculateFileHashes(): Promise<Record<string, string>> {
    const hashes: Record<string, string> = {}

    if (!existsSync(this.contentDir)) return hashes

    const walkDir = (dir: string, basePath: string = '') => {
      const files = fs.readdirSync(dir)
      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
          walkDir(filePath, path.join(basePath, file))
        } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
          const relativePath = path.join(basePath, file)
          const content = fs.readFileSync(filePath, 'utf-8')
          hashes[relativePath] = crypto.createHash('md5').update(content).digest('hex')
        }
      }
    }

    walkDir(this.contentDir)
    return hashes
  }

  private loadMetadata(): IndexMetadata | null {
    if (!existsSync(this.metadataPath)) return null

    try {
      return JSON.parse(readFileSync(this.metadataPath, 'utf-8'))
    } catch {
      return null
    }
  }

  private needsUpdate(
    metadata: IndexMetadata | null,
    currentHashes: Record<string, string>,
  ): boolean {
    if (!metadata) return true

    const oldHashes = metadata.fileHashes
    const oldKeys = Object.keys(oldHashes)
    const newKeys = Object.keys(currentHashes)

    if (oldKeys.length !== newKeys.length) return true

    for (const [path, hash] of Object.entries(currentHashes)) {
      if (oldHashes[path] !== hash) return true
    }

    return false
  }

  private calculatePostWeight(post: {
    date: string
    lastmod?: string
    readingTime: { minutes: number }
    tags?: string[]
  }): number {
    let weight = 1.0
    const now = new Date()
    const postDate = new Date(post.lastmod || post.date)
    const daysSinceUpdate = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceUpdate < 30) weight += 0.5
    else if (daysSinceUpdate < 90) weight += 0.3
    else if (daysSinceUpdate < 180) weight += 0.1

    if (post.readingTime.minutes > 10) weight += 0.2
    if ((post.tags?.length || 0) > 3) weight += 0.1

    return Math.max(0.1, Math.min(3.0, weight))
  }

  private async saveIndex(indices: EnhancedSearchIndex[], hashes: Record<string, string>) {
    // 保存增强索引
    writeFileSync(this.indexPath, JSON.stringify(indices, null, 0))

    // 保存兼容索引
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

    // 保存元数据
    const metadata: IndexMetadata = {
      version: '1.0.0',
      lastUpdate: new Date().toISOString(),
      fileHashes: hashes,
      totalPosts: indices.length,
      buildId: crypto.randomBytes(8).toString('hex'),
    }
    writeFileSync(this.metadataPath, JSON.stringify(metadata, null, 2))
  }
}

export const indexManager = new IncrementalIndexManager()
export const updateSearchIndex = () => indexManager.performIncrementalUpdate()
