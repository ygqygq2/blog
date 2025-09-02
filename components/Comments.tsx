'use client'

import Giscus from '@giscus/react'
import { useTheme } from 'next-themes'

import siteMetadata from '@/data/siteMetadata.cjs'

export default function Comments({ slug, title }: { slug: string; title?: string }) {
  const { theme, resolvedTheme } = useTheme()

  if (!siteMetadata.comments?.provider || siteMetadata.comments.provider !== 'giscus') {
    return null
  }

  const giscusConfig = siteMetadata.comments.giscusConfig

  // 检查必需的环境变量
  if (
    !process.env.NEXT_PUBLIC_GISCUS_REPO ||
    !process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID ||
    !process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID
  ) {
    return (
      <div className="comments-section mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <p className="text-yellow-800 dark:text-yellow-200">⚠️ 评论系统配置不完整</p>
      </div>
    )
  }

  const giscusTheme =
    theme === 'dark' || resolvedTheme === 'dark' ? giscusConfig.darkTheme : giscusConfig.theme

  return (
    <div className="comments-section mt-8">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">评论</h3>
      <Giscus
        id="comments"
        repo={process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}`}
        repoId={process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID!}
        category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY!}
        categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!}
        mapping={giscusConfig.mapping as 'title'}
        term={title || slug}
        strict="1"
        reactionsEnabled={giscusConfig.reactions === '1' ? '1' : '0'}
        emitMetadata={giscusConfig.metadata === '1' ? '1' : '0'}
        inputPosition="top"
        theme={giscusTheme}
        lang={giscusConfig.lang}
        loading="lazy"
      />
    </div>
  )
}
