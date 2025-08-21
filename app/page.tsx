import { getAllBlogPosts } from '@/lib/blog'
import { allCoreContent, sortPosts } from '@/lib/contentlayer'

import Main from './Main'

export default async function Page() {
  const allBlogs = await getAllBlogPosts()
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  return <Main posts={posts} />
}
