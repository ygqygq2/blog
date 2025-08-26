import ListLayout from '@/layouts/ListLayoutWithTags'
import { getAllBlogPosts } from '@/lib/blog'
import { allCoreContent, sortPosts } from '@/lib/contentlayer'

const POSTS_PER_PAGE = 10

export const generateStaticParams = async () => {
  // 仅在静态模式下预生成所有分页路径
  if (process.env.EXPORT === 'true') {
    const allBlogs = await getAllBlogPosts()
    const totalPages = Math.ceil(allBlogs.length / POSTS_PER_PAGE)
    const paths = Array.from({ length: totalPages }, (_, i) => ({ page: (i + 1).toString() }))
    return paths
  }

  // 动态模式下返回空数组，按需生成
  return []
}

// 静态模式下强制静态渲染
export const dynamic = 'force-static'

export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params
  const allBlogs = await getAllBlogPosts()
  const posts = allCoreContent(sortPosts(allBlogs))
  const pageNumber = parseInt(page as string)
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber,
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
      title="All Posts"
    />
  )
}
