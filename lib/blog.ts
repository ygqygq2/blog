import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import readingTime from 'reading-time'
import { extractTocHeadings } from './toc'
import { compileMDX } from './compile-mdx'

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
  structuredData: any
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

// 获取所有博客文章
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = []

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

          // 创建正确的 slug，保持年份/月份/文章名的格式
          const pathParts = basePath.split(path.sep).filter(Boolean)
          let slug = ''
          if (pathParts.length >= 2) {
            // 如果路径是 2024/03/article-name 这种格式，保持完整路径
            // 但如果文件名是 index.mdx，则不包含文件名部分
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
          const urlPath = basePath
            ? path.join(basePath, file.replace(/\.(mdx?|md)$/, ''))
            : file.replace(/\.(mdx?|md)$/, '')

          // 预编译 MDX 内容
          const compiledMDX = await compileMDX(body)

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
              code: compiledMDX, // 现在是预编译的 MDX 代码
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
        }
      }
    } catch (error) {
      console.error('Error reading directory:', dir, (error as Error).message)
    }
  }

  if (fs.existsSync(blogDir)) {
    await readDir(blogDir)
  }

  return posts
} // 获取所有作者
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

// 简单的TOC提取函数
function extractTocHeadings(content: string) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: Array<{ value: string; url: string; depth: number }> = []

  let match
  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length
    const value = match[2].trim()
    const url = `#${value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')}`

    headings.push({
      value,
      url,
      depth,
    })
  }

  return headings
}
