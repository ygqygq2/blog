'use client'

import { useState } from 'react'

import siteMetadata from '@/data/siteMetadata.cjs'

// 简单的评论组件替代，你可以根据需要集成具体的评论系统
function SimpleComments({ slug: _slug }: { slug: string }) {
  return (
    <div className="comments-section mt-8 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <h3 className="mb-4 text-lg font-semibold">评论</h3>
      <p className="text-gray-600 dark:text-gray-400">
        评论功能暂时禁用。你可以在这里集成 Giscus、Disqus 或其他评论系统。
      </p>
      {/* 这里可以添加具体的评论系统代码 */}
    </div>
  )
}

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)

  if (!siteMetadata.comments?.provider) {
    return null
  }

  return (
    <>
      {loadComments ? (
        <SimpleComments slug={slug} />
      ) : (
        <button
          onClick={() => setLoadComments(true)}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          加载评论
        </button>
      )}
    </>
  )
}
