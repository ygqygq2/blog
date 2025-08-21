import { genPageMetadata } from 'app/seo'
import { getAllBlogPosts } from '@/lib/blog'
import { allCoreContent, sortPosts } from '@/lib/contentlayer'

import ListLayout from '@/layouts/ListLayout'
import { POSTS_PER_PAGE } from '@/lib/constants'

export const metadata = genPageMetadata({ title: 'Blog' })

export default async function BlogPage() {
  const allBlogs = await getAllBlogPosts()
  const posts = allCoreContent(sortPosts(allBlogs))
  const pageNumber = 1
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
