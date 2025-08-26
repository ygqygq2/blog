import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { MDXLayoutRenderer } from '@/components/MDXLayoutRenderer'
import { getAllBlogPosts, getBlogPost } from '@/lib/blog'

// 生成静态参数 - 条件性静态参数生成
export async function generateStaticParams() {
  // 仅在静态模式下预生成所有文章路径
  if (process.env.EXPORT === 'true') {
    const posts = await getAllBlogPosts()
    return posts.map(post => ({
      slug: post.slug.split('/'),
    }))
  }

  // 动态模式下返回空数组，按需生成
  return []
}

// 静态模式下强制静态渲染
export const dynamic = 'force-static'

// 生成元数据
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const decodedSlugParts = resolvedParams.slug.map(part => decodeURIComponent(part))
  const slug = decodedSlugParts.join('/')
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: '文章未找到',
    }
  }

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.lastmod || post.date,
      images: post.images || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: post.images || [],
    },
  }
}

// 博客文章页面
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params

  // 对每个 slug 部分进行解码
  const decodedSlugParts = resolvedParams.slug.map(part => decodeURIComponent(part))
  const slug = decodedSlugParts.join('/')
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0">
      <div className="xl:grid xl:grid-cols-4 xl:gap-x-6">
        <div className="xl:col-span-3 xl:row-span-2 xl:pb-0">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
              {post.title}
            </h1>
            <div className="mb-8 text-sm text-slate-600 dark:text-slate-400">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              {post.tags && post.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <MDXLayoutRenderer code={post.body.raw} toc={post.toc} />
          </div>
        </div>
      </div>
    </div>
  )
}
