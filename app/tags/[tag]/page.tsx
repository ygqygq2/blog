import { genPageMetadata } from 'app/seo'
import { slug } from 'github-slugger'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { isStaticMode } from '@/config/index'
import siteMetadata from '@/data/siteMetadata.cjs'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { getAllBlogPosts } from '@/lib/blog'
import { allCoreContent, sortPosts } from '@/lib/contentlayer'

// 动态导入tagData，如果不存在则使用空对象
async function getTagData() {
  try {
    const tagData = await import('app/tag-data.json')
    return tagData.default || {}
  } catch (_error) {
    // 在开发模式下，如果tag-data.json不存在，返回空对象
    console.warn('⚠️  tag-data.json not found, using empty object')
    return {}
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params

  // 根据模式处理标签参数
  let processedTag: string
  if (isStaticMode()) {
    // 静态模式：tag可能是原始标签或URL编码的标签
    try {
      const decoded = decodeURIComponent(tag)
      processedTag = decoded !== tag ? decoded : tag
    } catch {
      processedTag = tag
    }
  } else {
    // 动态模式：tag是URL编码的原始标签，需要解码
    processedTag = decodeURIComponent(tag)
  }

  return genPageMetadata({
    title: processedTag,
    description: `${siteMetadata.title} ${processedTag} tagged content`,
    alternates: {
      canonical: './',
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/tags/${encodeURIComponent(processedTag)}/feed.xml`,
      },
    },
  })
}

export const generateStaticParams = async () => {
  // 仅在静态模式下预生成所有标签路径
  if (isStaticMode()) {
    const tagCounts = (await getTagData()) as Record<string, number>
    const tagKeys = Object.keys(tagCounts)
    const paths: Array<{ tag: string }> = []

    tagKeys.forEach(tag => {
      // 添加原始标签路径
      paths.push({ tag: tag })

      // 如果标签包含非ASCII字符（如中文），也添加URL编码的路径
      if (/[^\u0020-\u007E]/.test(tag)) {
        const encodedTag = encodeURIComponent(tag)
        if (encodedTag !== tag) {
          paths.push({ tag: encodedTag })
        }
      }
    })

    return paths
  }

  // 动态模式下返回空数组，按需生成
  return []
}

// 在静态模式下强制静态生成
export const dynamic = 'force-static'

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params

  // 根据模式处理标签参数
  let processedTag: string
  let slugifiedTag: string

  if (isStaticMode()) {
    // 静态模式：tag可能是原始标签或URL编码的标签
    try {
      // 尝试解码，如果解码后不同则说明原来是编码的
      const decoded = decodeURIComponent(tag)
      if (decoded !== tag) {
        // tag是URL编码的，使用解码后的值
        processedTag = decoded
        slugifiedTag = slug(decoded)
      } else {
        // tag是原始标签
        processedTag = tag
        slugifiedTag = slug(tag)
      }
    } catch {
      // 解码失败，直接使用原值
      processedTag = tag
      slugifiedTag = slug(tag)
    }
  } else {
    // 动态模式：tag是URL编码的原始标签，需要解码
    processedTag = decodeURIComponent(tag)
    slugifiedTag = slug(processedTag)
  }

  const allBlogs = await getAllBlogPosts()
  // 生成显示标题
  const title = processedTag[0].toUpperCase() + processedTag.slice(1)

  const filteredPosts = allCoreContent(
    sortPosts(
      allBlogs.filter(post => post.tags && post.tags.map(t => slug(t)).includes(slugifiedTag)),
    ),
  )

  if (filteredPosts.length === 0) {
    return notFound()
  }
  return <ListLayout posts={filteredPosts} title={title} />
}
