/* eslint-disable no-undef */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { slug } from 'github-slugger'
import matter from 'gray-matter'
import path from 'path'

// 简化版本的内容生成脚本，直接读取文件而不依赖 TypeScript 模块

function getAllBlogPosts() {
  const blogDir = path.join(process.cwd(), 'data', 'blog')
  const posts = []

  function readDir(dir, basePath = '') {
    try {
      const files = readdirSync(dir)

      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = statSync(filePath)

        if (stat.isDirectory()) {
          readDir(filePath, path.join(basePath, file))
        } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
          const content = readFileSync(filePath, 'utf-8')
          const { data, content: bodyContent } = matter(content)

          const pathParts = basePath.split(path.sep).filter(Boolean)
          let postSlug = ''
          if (pathParts.length >= 2) {
            // 如果路径是 2024/03/article-name 这种格式，保持完整路径
            // 但如果文件名是 index.mdx，则不包含文件名部分
            if (file === 'index.mdx' || file === 'index.md') {
              postSlug = pathParts.join('/')
            } else {
              postSlug = pathParts.join('/') + '/' + file.replace(/\.(mdx?|md)$/, '')
            }
          } else {
            postSlug = basePath
              ? path.join(basePath, file.replace(/\.(mdx?|md)$/, ''))
              : file.replace(/\.(mdx?|md)$/, '')
          }
          const relativePath = path.relative(blogDir, filePath)

          posts.push({
            slug: postSlug.replace(/\\/g, '/'),
            path: relativePath.replace(/\.(mdx?|md)$/, '').replace(/\\/g, '/'),
            title: data.title || '',
            date: data.date || '',
            tags: data.tags || [],
            draft: data.draft || false,
            summary: data.summary || '',
            lastmod: data.lastmod,
            images: data.images,
            author: data.author || 'default',
            authors: data.authors || ['default'],
            categories: data.categories || [],
            body: {
              raw: bodyContent,
              code: bodyContent,
            },
            filePath: relativePath.replace(/\\/g, '/'),
          })
        }
      }
    } catch (error) {
      console.log('Error reading directory:', dir, error.message)
    }
  }

  try {
    readDir(blogDir)
  } catch {
    console.log('Blog directory not found:', blogDir)
  }

  console.log(`Found ${posts.length} blog posts`)
  return posts
}

function createTagCount() {
  const allBlogs = getAllBlogPosts()
  const tagCount = {}

  allBlogs.forEach((file) => {
    if (file.tags && (!file.draft || process.env.NODE_ENV !== 'production')) {
      file.tags.forEach((tag) => {
        const formattedTag = slug(tag)
        if (formattedTag in tagCount) {
          tagCount[formattedTag] += 1
        } else {
          tagCount[formattedTag] = 1
        }
      })
    }
  })

  writeFileSync('./app/tag-data.json', JSON.stringify(tagCount, null, 2))
  console.log('Tag count generated...', Object.keys(tagCount).length, 'tags')
}

function createSearchIndex() {
  const allBlogs = getAllBlogPosts()
  const searchData = allBlogs
    .filter((post) => !post.draft || process.env.NODE_ENV !== 'production')
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      summary: post.summary || '',
      content: post.body.raw.substring(0, 500), // 只取前500字符
      tags: post.tags,
      date: post.date,
    }))

  writeFileSync('public/search.json', JSON.stringify(searchData, null, 2))
  console.log('Search index generated...', searchData.length, 'posts')
}

console.log('Generating content...')
createTagCount()
createSearchIndex()
console.log('Content generation complete!')
