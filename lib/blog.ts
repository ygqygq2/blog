import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import readingTime from 'reading-time'

import { compileMDX } from './compile-mdx'
import { contentCache, getCachedContent } from './content-cache'
import { extractTocHeadings } from './toc'

interface StructuredData {
  '@context': string
  '@type': string
  headline: string
  datePublished: string
  dateModified: string
  description?: string
  image: string
  url: string
}

export type { StructuredData }

export interface BlogPost {
  slug: string
  title: string
  date: string
  tags: string[]
  lastmod?: string
  draft?: boolean
  summary?: string
  images?: string[]
  author?: string
  authors?: string[]
  layout?: string
  bibliography?: string
  canonicalUrl?: string
  categories?: string[]
  type: string
  body: {
    raw: string
    code: string
  }
  readingTime: {
    text: string
    minutes: number
    time: number
    words: number
  }
  path: string
  filePath: string
  toc: Array<{
    value: string
    url: string
    depth: number
  }>
  structuredData: StructuredData
  [key: string]: unknown
}

export interface Author {
  slug: string
  name: string
  avatar?: string
  occupation?: string
  company?: string
  email?: string
  twitter?: string
  linkedin?: string
  github?: string
  layout?: string
  body: {
    raw: string
    code: string
  }
}

const contentDir = path.join(process.cwd(), 'data')
const blogDir = path.join(contentDir, 'blog')
const authorsDir = path.join(contentDir, 'authors')

// 获取所有博客文章 - WSL 内存优化版本
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const isStatic = process.env.EXPORT === 'true' || process.env.EXPORT === '1'
  const isBuilding = process.env.CI === 'true' || process.env.NODE_ENV === 'production'

  // 在静态构建模式下，优先使用预生成的搜索索引
  if (isStatic || isBuilding) {
    try {
      const searchJsonPath = path.join(process.cwd(), 'public', 'search.json')
      if (fs.existsSync(searchJsonPath)) {
        console.log('📖 使用预生成的搜索索引数据')
        const searchData = JSON.parse(fs.readFileSync(searchJsonPath, 'utf-8'))
        const posts = searchData.map(
          (item: {
            slug: string
            title: string
            date: string
            lastmod?: string
            summary?: string
            images?: string[]
            content?: string
          }) => ({
            ...item,
            type: 'Blog',
            path: `blog/${item.slug}`,
            toc: [],
            readingTime: { text: '1 min read', minutes: 1, time: 60000, words: 100 },
            body: { code: '', raw: item.content || '' },
            structuredData: {
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: item.title,
              datePublished: item.date,
              dateModified: item.lastmod || item.date,
              description: item.summary,
              image: item.images?.[0] || '/static/images/twitter-card.png',
              url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ygqygq2.com'}/blog/${item.slug}`,
            },
          }),
        )
        // 按日期降序排序（最新的文章在前面）
        return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }
    } catch (error) {
      console.log('📄 搜索索引不可用，使用动态模式:', (error as Error).message)
    }
  }

  const stats = contentCache.getStats()

  // 在构建环境下，如果已经有缓存数据，直接返回，避免重复处理
  if (isBuilding && stats.indexCacheSize > 0) {
    console.log(`📦 构建模式：从缓存返回 ${stats.indexCacheSize} 篇文章，跳过重新加载`)
    return contentCache.getAllPosts() as BlogPost[]
  }

  // 检查缓存是否新鲜
  if (contentCache.isIndexFresh()) {
    const cachedPosts = contentCache.getAllPosts()
    if (cachedPosts.length > 0) {
      console.log(`✅ 从缓存获取 ${cachedPosts.length} 篇文章`)
      // 在非构建环境下，需要根据缓存的元数据重新读取完整内容
      if (!isBuilding) {
        const posts: BlogPost[] = []
        for (const meta of cachedPosts) {
          const post = await getBlogPost(meta.slug)
          if (post) posts.push(post)
        }
        return posts
      }
      return cachedPosts as BlogPost[]
    }
  }

  console.log(`🔄 重新加载所有文章 (静态模式: ${isStatic}, 构建模式: ${isBuilding})`)
  const posts: BlogPost[] = []
  let processedCount = 0
  const BATCH_SIZE = isStatic ? 3 : isBuilding ? 8 : 5 // WSL环境下使用更小的批次大小

  async function readDir(dir: string, basePath: string = ''): Promise<void> {
    try {
      const files = fs.readdirSync(dir)

      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
          await readDir(filePath, path.join(basePath, file))
        } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
          const content = fs.readFileSync(filePath, 'utf-8')
          const { data, content: body } = matter(content)

          // 跳过草稿
          if (data.draft === true) continue

          // 创建正确的 slug，保持年份/月份/文章名的格式
          const pathParts = basePath.split(path.sep).filter(Boolean)
          let slug = ''
          if (pathParts.length >= 2) {
            if (file === 'index.mdx' || file === 'index.md') {
              slug = pathParts.join('/')
            } else {
              slug = pathParts.join('/') + '/' + file.replace(/\.(mdx?|md)$/, '')
            }
          } else {
            slug = basePath
              ? path.join(basePath, file.replace(/\.(mdx?|md)$/, ''))
              : file.replace(/\.(mdx?|md)$/, '')
          }

          const relativePath = path.relative(blogDir, filePath)
          let urlPath = ''
          if (pathParts.length >= 2) {
            if (file === 'index.mdx' || file === 'index.md') {
              // 对于 index 文件，路径就是目录路径，不包含文件名
              urlPath = 'blog/' + pathParts.join('/')
            } else {
              urlPath = 'blog/' + pathParts.join('/') + '/' + file.replace(/\.(mdx?|md)$/, '')
            }
          } else {
            urlPath = basePath
              ? 'blog/' + path.join(basePath, file.replace(/\.(mdx?|md)$/, ''))
              : 'blog/' + file.replace(/\.(mdx?|md)$/, '')
          }

          // 注意：为提高开发模式性能，避免在扫描所有文章时预编译 MDX，
          // 改为在单篇文章请求时（getBlogPost）按需编译并缓存。
          const compiledMDX = ''
          const post: BlogPost = {
            slug: slug.replace(/\\/g, '/'),
            title: data.title || '',
            date: data.date || '',
            tags: data.tags || [],
            lastmod: data.lastmod,
            draft: data.draft || false,
            summary: data.summary || '',
            images: data.images,
            author: data.author || 'default',
            authors: data.authors || ['default'],
            layout: data.layout || 'PostLayout',
            bibliography: data.bibliography,
            canonicalUrl: data.canonicalUrl,
            categories: data.categories || [],
            type: data.type || 'Blog',
            body: {
              raw: body,
              code: compiledMDX,
            },
            readingTime: readingTime(body),
            path: urlPath.replace(/\\/g, '/'),
            filePath: relativePath.replace(/\\/g, '/'),
            toc: extractTocHeadings(body),
            structuredData: {
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: data.title,
              datePublished: data.date,
              dateModified: data.lastmod || data.date,
              description: data.summary,
              image: data.images ? data.images[0] : '/static/images/twitter-card.png',
              url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ygqygq2.com'}/blog/${slug}`,
            },
          }

          posts.push(post)
          // 缓存单个文章元数据
          contentCache.setPost(post.slug, post)

          processedCount++
          if (processedCount % BATCH_SIZE === 0) {
            // 在构建时减少延迟，在开发时增加延迟来避免内存压力
            const delay = isBuilding ? 5 : 20
            await new Promise(resolve => setTimeout(resolve, delay))

            // 在构建模式下，每处理一定数量后强制垃圾回收
            if (isBuilding && global.gc) {
              global.gc()
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reading directory:', dir, (error as Error).message)
    }
  }

  if (fs.existsSync(blogDir)) {
    await readDir(blogDir)
  }

  // 更新索引缓存
  contentCache.updateIndex()

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// 快速获取单个文章 - 修复版本
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  console.log(`🔍 查找文章: ${slug}`)

  // 首先尝试从缓存获取完整内容
  const cached = getCachedContent(slug)
  if (cached) {
    console.log(`✅ 从缓存获取文章: ${slug}`)
    return cached
  }

  // 在静态构建模式下，优先使用预生成的搜索索引
  const isStatic = process.env.EXPORT === 'true' || process.env.EXPORT === '1'
  const isBuilding = process.env.CI === 'true' || process.env.NODE_ENV === 'production'

  if (isStatic || isBuilding) {
    try {
      const searchJsonPath = path.join(process.cwd(), 'public', 'search.json')
      if (fs.existsSync(searchJsonPath)) {
        console.log('📖 使用预生成的搜索索引查找单篇文章')
        const searchData = JSON.parse(fs.readFileSync(searchJsonPath, 'utf-8'))
        const postData = searchData.find((item: { slug: string }) => item.slug === slug)

        if (postData) {
          // 读取完整的原始文件内容
          const blogDir = path.join(process.cwd(), 'data', 'blog')
          const possiblePaths = [
            path.join(blogDir, `${slug}.mdx`),
            path.join(blogDir, `${slug}.md`),
            path.join(blogDir, slug, 'index.mdx'),
            path.join(blogDir, slug, 'index.md'),
          ]

          let targetPath = ''
          for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
              targetPath = p
              break
            }
          }

          if (targetPath) {
            console.log(`📁 从搜索索引找到文件: ${targetPath}`)
            const fileContent = fs.readFileSync(targetPath, 'utf-8')
            const { data, content: body } = matter(fileContent)

            if (data.draft === true) {
              console.log(`⏭️ 跳过草稿: ${slug}`)
              return null
            }

            // 预编译 MDX
            let compiledMDX = ''
            try {
              compiledMDX = await compileMDX(body)
            } catch (error) {
              console.error(`MDX compilation failed for ${slug}:`, error)
              compiledMDX = body
            }

            const post: BlogPost = {
              slug: postData.slug,
              title: postData.title,
              date: postData.date,
              tags: postData.tags || [],
              lastmod: data.lastmod,
              draft: data.draft || false,
              summary: postData.summary || data.summary || '',
              images: data.images,
              author: data.author || 'default',
              authors: data.authors || ['default'],
              layout: data.layout || 'PostLayout',
              bibliography: data.bibliography,
              canonicalUrl: data.canonicalUrl,
              categories: data.categories || [],
              type: data.type || 'Blog',
              body: {
                raw: body, // 使用完整内容而不是搜索索引中的摘要
                code: compiledMDX,
              },
              readingTime: readingTime(body),
              path: `blog/${slug}`,
              filePath: path.relative(blogDir, targetPath).replace(/\\/g, '/'),
              toc: extractTocHeadings(body),
              structuredData: {
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                headline: postData.title,
                datePublished: postData.date,
                dateModified: data.lastmod || postData.date,
                description: postData.summary || data.summary,
                image: data.images?.[0] || '/static/images/twitter-card.png',
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ygqygq2.com'}/blog/${slug}`,
              },
            }

            // 缓存完整内容
            contentCache.setContent(slug, post)
            console.log(`✅ 从搜索索引成功加载文章: ${slug}`)
            return post
          }
        }
      }
    } catch (error) {
      console.log('❌ 搜索索引查找失败:', (error as Error).message)
    }
  }

  // 如果缓存没有，尝试直接查找该文章，而不重新加载所有文章
  try {
    // 先使用索引中的元数据
    const cachedPosts = contentCache.getAllPosts()
    const postMeta = cachedPosts.find(p => p.slug === slug)

    if (postMeta) {
      // 找到了元数据，直接读取文件内容
      console.log(`✅ 使用索引缓存找到文章元数据: ${slug}`)

      // 直接读取文件内容
      try {
        const blogDir = path.join(process.cwd(), 'data', 'blog')
        const possiblePaths = [
          path.join(blogDir, `${slug}.mdx`),
          path.join(blogDir, `${slug}.md`),
          path.join(blogDir, slug, 'index.mdx'),
          path.join(blogDir, slug, 'index.md'),
        ]

        let targetPath = ''
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            targetPath = p
            break
          }
        }

        if (!targetPath) {
          console.log(`❌ 文件不存在: ${slug}，尝试路径:`, possiblePaths)
          return null
        }

        console.log(`📁 找到文件: ${targetPath}`)
        const fileContent = fs.readFileSync(targetPath, 'utf-8')
        const { data, content: body } = matter(fileContent)

        if (data.draft === true) {
          console.log(`⏭️ 跳过草稿: ${slug}`)
          return null
        }

        // 预编译 MDX
        let compiledMDX = ''
        try {
          compiledMDX = await compileMDX(body)
        } catch (error) {
          console.error(`MDX compilation failed for ${slug}:`, error)
          // 使用原始内容作为后备
          compiledMDX = body
        }

        const post: BlogPost = {
          ...postMeta,
          type: postMeta.type || 'Blog',
          path: postMeta.path || slug.replace(/\\/g, '/'),
          filePath: postMeta.filePath || `${slug}.mdx`,
          body: {
            raw: body,
            code: compiledMDX,
          },
          readingTime: readingTime(body),
          toc: extractTocHeadings(body),
          structuredData: postMeta.structuredData || {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: postMeta.title,
            datePublished: postMeta.date,
            dateModified: postMeta.lastmod || postMeta.date,
            description: postMeta.summary,
            image: postMeta.images?.[0] || '/static/images/twitter-card.png',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ygqygq2.com'}/blog/${slug}`,
          },
        }

        // 缓存完整内容
        contentCache.setContent(slug, post)
        console.log(`✅ 成功加载文章: ${slug}`)

        return post
      } catch (error) {
        console.error(`❌ 读取文章失败: ${slug}`, error)
        return null
      }
    } else if (!contentCache.isIndexFresh()) {
      // 索引过期且没有找到文章，才重新加载所有文章
      console.log(`🔄 索引过期，重新加载文章索引`)
      await getAllBlogPosts()

      // 重新尝试从索引中查找
      const allCachedPosts = contentCache.getAllPosts()
      const postMeta = allCachedPosts.find(p => p.slug === slug)

      if (postMeta) {
        // 找到了元数据，直接读取文件内容
        console.log(`✅ 重新加载后找到文章元数据: ${slug}`)

        // 直接读取文件内容
        try {
          const blogDir = path.join(process.cwd(), 'data', 'blog')
          const possiblePaths = [
            path.join(blogDir, `${slug}.mdx`),
            path.join(blogDir, `${slug}.md`),
            path.join(blogDir, slug, 'index.mdx'),
            path.join(blogDir, slug, 'index.md'),
          ]

          let targetPath = ''
          for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
              targetPath = p
              break
            }
          }

          if (!targetPath) {
            console.log(`❌ 文件不存在: ${slug}，尝试路径:`, possiblePaths)
            return null
          }

          console.log(`📁 找到文件: ${targetPath}`)
          const fileContent = fs.readFileSync(targetPath, 'utf-8')
          const { data, content: body } = matter(fileContent)

          if (data.draft === true) {
            console.log(`⏭️ 跳过草稿: ${slug}`)
            return null
          }

          // 预编译 MDX
          let compiledMDX = ''
          try {
            compiledMDX = await compileMDX(body)
          } catch (error) {
            console.error(`MDX compilation failed for ${slug}:`, error)
            // 使用原始内容作为后备
            compiledMDX = body
          }

          const post: BlogPost = {
            ...postMeta,
            type: postMeta.type || 'Blog',
            path: postMeta.path || slug.replace(/\\/g, '/'),
            filePath: postMeta.filePath || `${slug}.mdx`,
            body: {
              raw: body,
              code: compiledMDX,
            },
            readingTime: readingTime(body),
            toc: extractTocHeadings(body),
            structuredData: postMeta.structuredData || {
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: postMeta.title,
              datePublished: postMeta.date,
              dateModified: postMeta.lastmod || postMeta.date,
              description: postMeta.summary,
              image: postMeta.images?.[0] || '/static/images/twitter-card.png',
              url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ygqygq2.com'}/blog/${slug}`,
            },
          }

          // 缓存完整内容
          contentCache.setContent(slug, post)
          console.log(`✅ 成功加载文章: ${slug}`)

          return post
        } catch (error) {
          console.error(`❌ 读取文章失败: ${slug}`, error)
          return null
        }
      }
    }
  } catch (error) {
    console.error('加载文章元数据失败:', error)
  }

  // 如果还是找不到，返回 null
  console.log(`❌ 文章不存在: ${slug}`)
  return null
}

// 获取所有作者
export async function getAllAuthors(): Promise<Author[]> {
  const authors: Author[] = []

  if (!fs.existsSync(authorsDir)) {
    return authors
  }

  const files = fs.readdirSync(authorsDir)

  for (const file of files) {
    if (file.endsWith('.mdx') || file.endsWith('.md')) {
      const filePath = path.join(authorsDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const { data, content: body } = matter(content)

      const author: Author = {
        slug: file.replace(/\.(mdx?|md)$/, ''),
        name: data.name || '',
        avatar: data.avatar,
        occupation: data.occupation,
        company: data.company,
        email: data.email,
        twitter: data.twitter,
        linkedin: data.linkedin,
        github: data.github,
        layout: data.layout,
        body: {
          raw: body,
          code: body,
        },
      }

      authors.push(author)
    }
  }

  return authors
}

// 获取所有标签及其统计
export async function getAllTags(): Promise<Record<string, number>> {
  const posts = await getAllBlogPosts()
  const tagCount: Record<string, number> = {}

  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1
    })
  })

  return tagCount
}

// 根据标签获取文章
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts()
  return posts.filter(post => post.tags.includes(tag))
}
