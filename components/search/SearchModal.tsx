'use client'

import type { FuseResult } from 'fuse.js'
import Fuse from 'fuse.js'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface SearchResult {
  slug: string
  title: string
  summary: string
  tags: string[]
  date: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FuseResult<SearchResult>[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [fuse, setFuse] = useState<Fuse<SearchResult> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // 初始化搜索索引
  useEffect(() => {
    if (!isOpen) return

    const loadSearchIndex = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/search.json')
        const searchData: SearchResult[] = await response.json()

        const fuseInstance = new Fuse(searchData, {
          keys: [
            { name: 'title', weight: 3 },
            { name: 'summary', weight: 2 },
            { name: 'tags', weight: 1 },
          ],
          threshold: 0.3,
          includeScore: true,
          minMatchCharLength: 2,
        })

        setFuse(fuseInstance)
      } catch (error) {
        console.error('Failed to load search index:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSearchIndex()
  }, [isOpen])

  // 执行搜索
  useEffect(() => {
    if (!fuse || !query.trim()) {
      setResults([])
      setSelectedIndex(0)
      return
    }

    const searchResults = fuse.search(query).slice(0, 10)
    setResults(searchResults)
    setSelectedIndex(0)
  }, [query, fuse])

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex].item)
          }
          break
      }
    },
    [isOpen, results, selectedIndex, onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // 选择搜索结果
  const handleSelectResult = (result: SearchResult) => {
    router.push(`/blog/${result.slug}`)
    onClose()
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div className="bg-opacity-50 fixed inset-0 bg-black transition-opacity" onClick={onClose} />

      {/* 搜索对话框 */}
      <div className="flex min-h-full items-start justify-center p-4 pt-16">
        <div className="w-full max-w-xl transform rounded-lg bg-white shadow-xl transition-all dark:bg-gray-800">
          {/* 搜索输入框 */}
          <div className="border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center px-4">
              <svg
                className="h-5 w-5 text-gray-400"
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
              <input
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border-0 bg-transparent py-4 pr-4 pl-3 text-gray-900 placeholder-gray-500 focus:outline-none dark:text-gray-100 dark:placeholder-gray-400"
                autoFocus
              />
              <kbd className="hidden rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 sm:block dark:border-gray-600 dark:text-gray-400">
                ESC
              </kbd>
            </div>
          </div>

          {/* 搜索结果 */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">加载中...</p>
              </div>
            ) : query && results.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  没有找到 "{query}" 的相关结果
                </p>
              </div>
            ) : query && results.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    CONTENT
                  </h3>
                </div>
                {results.map((result, index) => (
                  <button
                    key={result.item.slug}
                    onClick={() => handleSelectResult(result.item)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      index === selectedIndex
                        ? 'border-r-2 border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {result.item.title}
                        </h4>
                        {result.item.summary && (
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                            {result.item.summary}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDate(result.item.date)}
                          </span>
                          {result.item.tags && result.item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {result.item.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">开始输入以搜索文章...</p>
              </div>
            )}
          </div>

          {/* 底部提示 */}
          <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-600">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border px-1 py-0.5">↑↓</kbd>
                  导航
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border px-1 py-0.5">Enter</kbd>
                  选择
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="rounded border px-1 py-0.5">ESC</kbd>
                关闭
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
