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
  const decodedTag = decodeURI(tag)
  return genPageMetadata({
    title: decodedTag,
    description: `${siteMetadata.title} ${decodedTag} tagged content`,
    alternates: {
      canonical: './',
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/tags/${decodedTag}/feed.xml`,
      },
    },
  })
}

export const generateStaticParams = async () => {
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const paths = tagKeys.map((tag) => ({
    tag: encodeURI(tag),
  }))
  return paths
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const decodedTag = decodeURI(tag)

  const allBlogs = await getAllBlogPosts()
  // Capitalize first letter and convert space to dash
  const title = decodedTag[0].toUpperCase() + decodedTag.split(' ').join('-').slice(1)
  const filteredPosts = allCoreContent(
    sortPosts(
      allBlogs.filter((post) => post.tags && post.tags.map((t) => slug(t)).includes(decodedTag))
    )
  )
  if (filteredPosts.length === 0) {
    return notFound()
  }
  return <ListLayout posts={filteredPosts} title={title} />
}
