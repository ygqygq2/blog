/**
 * 增强搜索功能集成示例
 * 展示如何在现有的搜索按钮中使用增强搜索模态框
 */

'use client'

import { useEffect, useState } from 'react'

import EnhancedSearchModal from './EnhancedSearchModal'

export default function SearchButtonExample() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <div className="flex items-center space-x-4">
      {/* 原有的搜索按钮样式 */}
      <button
        onClick={() => setIsSearchOpen(true)}
        className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label="搜索文章"
      >
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="hidden sm:inline">搜索</span>
        <kbd className="hidden rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-500 sm:inline dark:border-gray-600 dark:text-gray-400">
          ⌘K
        </kbd>
      </button>

      {/* 增强搜索模态框 */}
      <EnhancedSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* 可选：显示搜索功能特性 */}
      <div className="hidden items-center text-xs text-gray-500 lg:flex dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-400"></span>
          随机排序
        </span>
        <span className="mx-2">•</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-400"></span>
          智能匹配
        </span>
        <span className="mx-2">•</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-purple-400"></span>
          内容定位
        </span>
      </div>
    </div>
  )
}

// 快捷键支持
export function useSearchHotkey(onOpenSearch: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K 或 Ctrl+K 打开搜索
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenSearch()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onOpenSearch])
}

// 在Header组件中的使用示例
export function HeaderWithEnhancedSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // 注册快捷键
  useSearchHotkey(() => setIsSearchOpen(true))

  return (
    <header className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold">我的博客</h1>
      </div>

      <div className="flex items-center space-x-4">
        <SearchButtonExample />

        {/* 其他头部元素 */}
        <nav className="hidden space-x-4 md:flex">
          <a
            href="/"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            首页
          </a>
          <a
            href="/blog"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            博客
          </a>
          <a
            href="/about"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            关于
          </a>
        </nav>
      </div>

      {/* 搜索模态框 */}
      <EnhancedSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}
