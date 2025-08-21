'use client'

import { useState } from 'react'

export default function BlogNewsletterForm() {
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
    } catch (error) {
      setMessage('订阅失败，请稍后再试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="my-8 rounded bg-gray-100 p-6 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">订阅博客更新</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        订阅以获取最新的博客文章和更新。
      </p>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="输入您的邮箱"
            required
            className="flex-1 rounded border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? '订阅中...' : '订阅'}
          </button>
        </div>
        {message && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>}
      </form>
    </div>
  )
}
