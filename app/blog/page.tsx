import { genPageMetadata } from 'app/seo'

import ListLayout from '@/layouts/ListLayout'
import { getAllBlogPosts } from '@/lib/blog'

const POSTS_PER_PAGE = 5

export const metadata = genPageMetadata({ title: 'Blog' })

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1

  const allBlogs = await getAllBlogPosts()
  // 文章已经在getBlogPosts中排序了
  const posts = allBlogs
  const pageNumber = page
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="所有文章"
    />
  )
}
