'use client'

import { useState } from 'react'

import { isFeatureEnabled } from '@/lib/mode-config'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 在静态模式下不显示订阅表单
  if (!isFeatureEnabled('newsletter')) {
    return (
      <div className="newsletter-form">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">联系我们</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          在静态模式下，请通过邮箱 ygqygq2@qq.com 联系我们获取最新更新
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('🎉 订阅成功！感谢您的关注')
        setEmail('')
      } else {
        setMessage(`❌ ${data.error || '订阅失败'}`)
      }
    } catch (error) {
      console.error('订阅错误:', error)
      setMessage('❌ 网络错误，请稍后再试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="newsletter-form">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Subscribe to the newsletter
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">获取最新文章和技术分享的通知</p>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-pink-500 px-6 py-2 text-sm font-medium text-white hover:bg-pink-600 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
          >
            {isSubmitting ? '订阅中...' : 'Sign up'}
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{message}</p>}
      </form>
    </div>
  )
}
