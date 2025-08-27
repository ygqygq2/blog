import { genPageMetadata } from 'app/seo'
import tagData from 'app/tag-data.json'
import { slug } from 'github-slugger'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import siteMetadata from '@/data/siteMetadata.cjs'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { getAllBlogPosts } from '@/lib/blog'
import { allCoreContent, sortPosts } from '@/lib/contentlayer'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  return genPageMetadata({
    title: decodedTag,
    description: `${siteMetadata.title} ${decodedTag} tagged content`,
    alternates: {
      canonical: './',
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/tags/${encodeURIComponent(decodedTag)}/feed.xml`,
      },
    },
  })
}

export const generateStaticParams = async () => {
  // 仅在静态模式下预生成所有标签路径
  if (process.env.EXPORT === 'true' || process.env.EXPORT === '1') {
    const tagCounts = tagData as Record<string, number>
    const tagKeys = Object.keys(tagCounts)
    const paths = tagKeys.map(tag => ({
      tag: encodeURIComponent(slug(tag)),
    }))
    return paths
  }

  // 动态模式下返回空数组，按需生成
  return []
}

// 在静态模式下强制静态生成
export const dynamic = 'force-static'

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)

  const allBlogs = await getAllBlogPosts()
  // Capitalize first letter and convert space to dash
  const title = decodedTag[0].toUpperCase() + decodedTag.split(' ').join('-').slice(1)
  const filteredPosts = allCoreContent(
    sortPosts(
      allBlogs.filter(post => post.tags && post.tags.map(t => slug(t)).includes(decodedTag)),
    ),
  )
  if (filteredPosts.length === 0) {
    return notFound()
  }
  return <ListLayout posts={filteredPosts} title={title} />
}
