'use client'

import { useState } from 'react'

import { isFeatureEnabled } from '@/config/index'

// 在构建时就确定是否启用newsletter功能
const isNewsletterFeatureEnabled = isFeatureEnabled('newsletter')

export default function BlogNewsletterForm() {
  // 如果newsletter功能被禁用，直接返回null，不渲染任何内容
  if (!isNewsletterFeatureEnabled) {
    return null
  }

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 这里添加你的订阅逻辑
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('谢谢您的订阅！')
      setEmail('')
    } catch {
      setMessage('订阅失败，请稍后再试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="my-8">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">订阅我的博客</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">获取最新文章和技术分享</p>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="您的邮箱地址"
            required
            className="flex-1 rounded border border-gray-300 px-4 py-2 text-gray-900 focus:border-pink-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-pink-500 px-6 py-2 font-medium text-white hover:bg-pink-600 disabled:opacity-50"
          >
            {isSubmitting ? '订阅中...' : '订阅'}
          </button>
        </div>
        {message && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>}
      </form>
    </div>
  )
}
