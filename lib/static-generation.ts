import { getAllBlogPosts } from '@/lib/blog'

export async function generateStaticParams() {
  const posts = await getAllBlogPosts()

  // 生成所有文章的静态参数
  const staticParams = posts.map(post => ({
    slug: post.slug.split('/'),
  }))

  // 限制构建时预生成的文章数量（最新的50篇）
  return staticParams.slice(0, 50)
}

export const dynamic = 'force-static'
export const revalidate = 3600 // 1小时重新验证
