'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useSearch } from '@/hooks/useSearch'
import { SearchResult as EnhancedSearchResult } from '@/lib/search-types'

import SearchResultItem from './SearchResultItem'

interface BasicSearchResult {
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
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [initialData, setInitialData] = useState<BasicSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // 使用搜索hook
  const { query, results, handleSearch } = useSearch(initialData)

  // 初始化搜索索引
  useEffect(() => {
    if (!isOpen) return

    const loadSearchIndex = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/search.json')
        const searchData: BasicSearchResult[] = await response.json()
        setInitialData(searchData)
      } catch (error) {
        console.error('Failed to load search index:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSearchIndex()
  }, [isOpen])

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            router.push(`/blog/${results[selectedIndex].item.slug}`)
            onClose()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose, router])

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
                onChange={e => handleSearch(e.target.value)}
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
                  <div
                    key={result.item.slug}
                    onClick={() => {
                      router.push(`/blog/${result.item.slug}`)
                      onClose()
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      index === selectedIndex
                        ? 'border-r-2 border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900'
                        : ''
                    }`}
                  >
                    <SearchResultItem
                      result={{
                        post: {
                          slug: result.item.slug,
                          title: result.item.title,
                          summary: result.item.summary,
                          tags: result.item.tags,
                          date: result.item.date,
                          readingTime: {
                            text: '1 min read',
                            minutes: 1,
                          },
                        },
                        matches: [],
                        totalScore: 1,
                      }}
                      index={index}
                      selectedIndex={selectedIndex}
                      onSelect={() => {
                        router.push(`/blog/${result.item.slug}`)
                        onClose()
                      }}
                      showMatches={false}
                    />
                  </div>
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
