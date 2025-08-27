/* eslint-disable */
import process from 'node:process'

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { slug } from 'github-slugger'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const siteMetadata = require('../data/siteMetadata.cjs')
const tagData = JSON.parse(readFileSync(path.resolve(process.cwd(), 'app/tag-data.json'), 'utf-8'))

// 简单的 HTML 转义函数
const escape = text => {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// 简单的排序函数
const sortPosts = posts => {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const generateRssItem = (config, post) => `
  <item>
    <guid>${config.siteUrl}/blog/${post.slug}</guid>
    <title>${escape(post.title)}</title>
    <link>${config.siteUrl}/blog/${post.slug}</link>
    ${post.summary ? `<description>${escape(post.summary)}</description>` : ''}
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <author>${config.email} (${config.author})</author>
    ${post.tags ? post.tags.map(t => `<category>${escape(t)}</category>`).join('') : ''}
  </item>
`

const generateRss = (config, posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(config.title)}</title>
      <link>${config.siteUrl}/blog</link>
      <description>${escape(config.description)}</description>
      <language>${config.language}</language>
      <managingEditor>${config.email} (${config.author})</managingEditor>
      <webMaster>${config.email} (${config.author})</webMaster>
      <lastBuildDate>${posts.length > 0 ? new Date(posts[0].date).toUTCString() : new Date().toUTCString()}</lastBuildDate>
      <atom:link href="${config.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map(post => generateRssItem(config, post)).join('')}
    </channel>
  </rss>
`

async function generateRSS(config, allBlogs, page = 'feed.xml') {
  const publishPosts = allBlogs.filter(post => post.draft !== true)
  // RSS for blog post
  if (publishPosts.length > 0) {
    const rss = generateRss(config, sortPosts(publishPosts))
    writeFileSync(`./public/${page}`, rss)
  }

  if (publishPosts.length > 0) {
    for (const tag of Object.keys(tagData)) {
      const filteredPosts = allBlogs.filter(
        post => post.tags && post.tags.map(t => slug(t)).includes(tag),
      )
      if (filteredPosts.length > 0) {
        const rss = generateRss(config, filteredPosts, `tags/${tag}/${page}`)
        const rssPath = path.join('public', 'tags', tag)
        mkdirSync(rssPath, { recursive: true })
        writeFileSync(path.join(rssPath, page), rss)
      }
    }
  }
}

const rss = async () => {
  // 检查是否为静态模式
  const isStaticMode = process.env.EXPORT === 'true' || process.env.EXPORT === '1'

  if (!isStaticMode) {
    console.log('Skipping RSS generation in dynamic mode')
    return
  }

  try {
    console.log('Generating RSS feeds for static deployment...')

    // 优先使用已生成的搜索索引，避免重新加载所有文章
    let allBlogs = []
    const searchIndexPath = path.join(process.cwd(), 'public', 'search.json')

    if (existsSync(searchIndexPath)) {
      console.log('📁 使用已生成的搜索索引进行 RSS 生成')
      const searchData = JSON.parse(readFileSync(searchIndexPath, 'utf-8'))
      allBlogs = searchData.map(item => ({
        slug: item.slug,
        title: item.title,
        date: item.date,
        tags: item.tags || [],
        summary: item.summary,
        draft: false, // 搜索索引中的都不是草稿
      }))
    } else {
      console.log('📁 搜索索引不存在，动态导入博客数据')
      // 动态导入博客数据
      const { getAllBlogPosts } = await import('../lib/blog.ts')
      allBlogs = await getAllBlogPosts()
    }

    console.log(`Found ${allBlogs.length} blog posts for RSS generation`)

    if (allBlogs.length === 0) {
      console.warn('No blog posts found, creating empty RSS feed')
      const basicRss = generateRss(siteMetadata, [])
      writeFileSync('./public/feed.xml', basicRss)
      return
    }

    await generateRSS(siteMetadata, allBlogs)
    console.log('RSS generation completed successfully')
    console.log('Generated feeds:')
    console.log('  - /feed.xml (main RSS feed)')
    console.log('  - /tags/*/feed.xml (tag-specific feeds)')
  } catch (error) {
    console.error('Error during RSS generation:', error)
    // 如果无法生成 RSS，创建一个基本的 RSS 文件
    const basicRss = generateRss(siteMetadata, [])
    writeFileSync('./public/feed.xml', basicRss)
    console.log('Created fallback RSS feed')
  }
}

export default rss
