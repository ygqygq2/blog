import { getAllBlogPosts } from '@/lib/blog'
import { allCoreContent, sortPosts } from '@/lib/contentlayer'

import Main from './Main'

// 静态模式下强制静态渲染
export const dynamic = 'force-static'

export default async function Page() {
  const allBlogs = await getAllBlogPosts()
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  return <Main posts={posts} />
}
