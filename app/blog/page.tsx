import { genPageMetadata } from 'app/seo'
import type { Metadata } from 'next'

import ListLayout from '@/layouts/ListLayout'
import { getAllBlogPosts } from '@/lib/blog'

export const metadata: Metadata = genPageMetadata({ title: 'Blog' })

// 静态模式下强制静态渲染
export const dynamic = 'force-static'

const POSTS_PER_PAGE = 5

export default async function BlogPage() {
  // 总是传递所有文章，让客户端组件处理分页
  // 这样既支持静态导出，又保持分页功能
  const allBlogs = await getAllBlogPosts()

  return (
    <ListLayout
      posts={allBlogs}
      initialDisplayPosts={allBlogs.slice(0, POSTS_PER_PAGE)}
      pagination={{
        currentPage: 1,
        totalPages: Math.ceil(allBlogs.length / POSTS_PER_PAGE),
      }}
      title="所有文章"
    />
  )
}
