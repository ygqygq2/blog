import { writeFileSync } from 'fs'
import { slug } from 'github-slugger'

import { getAllBlogPosts } from './blog'
import { createEnhancedSearchIndex } from './enhanced-search'

/**
 * Count the occurrences of all tags across blog posts and write to json file
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
  console.log('Tag count generated...')
}

/**
 * Create search index for blog posts
 */
export async function createSearchIndex() {
  console.log('🔄 开始生成搜索索引...')

  // 生成增强搜索索引
  await createEnhancedSearchIndex()

  // 生成兼容的简单索引（保持向后兼容）
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
