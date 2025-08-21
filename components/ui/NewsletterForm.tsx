'use client'

import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 这里添加你的订阅逻辑
    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMessage('谢谢您的订阅！')
      setEmail('')
    } catch {
      setMessage('订阅失败，请稍后再试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="newsletter-form rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">订阅我的博客</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">获取最新文章和技术分享的通知</p>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="您的邮箱地址"
            required
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isSubmitting ? '订阅中...' : '订阅'}
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{message}</p>}
      </form>
    </div>
  )
}
