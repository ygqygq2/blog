'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { EnhancedSearchEngine } from '../../lib/enhanced-search-engine'
import { SearchResult } from '../../lib/search-types'
import SearchResultItem from './SearchResultItem'

interface EnhancedSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EnhancedSearchModal({ isOpen, onClose }: EnhancedSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [initialArticles, setInitialArticles] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1) // 初始状态不选中任何项
  const [searchEngine, setSearchEngine] = useState<EnhancedSearchEngine | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchStats, setSearchStats] = useState<{
    totalPosts: number
    totalContents: number
    avgContentsPerPost: number
    isLoaded: boolean
  } | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const router = useRouter()

  // 初始化搜索引擎
  useEffect(() => {
    if (!isOpen || searchEngine) return

    const initSearchEngine = async () => {
      setIsLoading(true)
      try {
        const engine = new EnhancedSearchEngine({
          threshold: 0.3,
          maxResults: 15,
          maxMatchesPerPost: 3,
          contextLength: 120,
          enableRandomSort: true, // 启用随机排序
          randomSortWeight: 0.3, // 30%随机性，70%相关性
        })

        await engine.loadIndex()
        setSearchEngine(engine)
        setSearchStats(engine.getStats())

        // 获取初始显示的文章列表（随机排序）
        const initialList = engine.getInitialArticles(12)
        setInitialArticles(initialList)
        setError(null) // 清除之前的错误
      } catch (error) {
        console.error('搜索引擎初始化失败:', error)
        setError('搜索功能暂时不可用，请稍后再试')
        setSearchEngine(null)
      } finally {
        setIsLoading(false)
      }
    }

    initSearchEngine()
  }, [isOpen, searchEngine])

  // 执行搜索
  useEffect(() => {
    if (!searchEngine) return

    if (!query.trim()) {
      // 无搜索关键词时，显示初始文章列表
      setResults([])
      setSuggestions([])
      setSelectedIndex(-1) // 重置选中状态
      return
    }

    const performSearch = async () => {
      try {
        const searchResults = await searchEngine.search(query)
        const searchSuggestions = searchEngine.getSuggestions(query, 5)

        setResults(searchResults)
        setSuggestions(searchSuggestions)
        setSelectedIndex(-1) // 重置选中状态
      } catch (error) {
        console.error('搜索执行失败:', error)
        setResults([])
        setSuggestions([])
      }
    }

    // 防抖搜索
    const timeoutId = setTimeout(performSearch, 300)
    return () => clearTimeout(timeoutId)
  }, [query, searchEngine])

  // 每次打开搜索框时刷新初始文章列表（实现随机排序）
  useEffect(() => {
    if (isOpen && searchEngine) {
      const refreshInitialList = () => {
        const newInitialList = searchEngine.getInitialArticles(12)
        setInitialArticles(newInitialList)
      }
      refreshInitialList()
    }
  }, [isOpen, searchEngine])

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      // 获取当前显示的结果列表
      const currentResults = query.trim() ? results : initialArticles

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => {
            if (prev === -1) return 0
            return Math.min(prev + 1, currentResults.length - 1)
          })
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => {
            if (prev === -1) return currentResults.length - 1
            if (prev === 0) return -1
            return Math.max(prev - 1, 0)
          })
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && currentResults[selectedIndex]) {
            handleSelectResult(currentResults[selectedIndex])
          }
          break
        case 'Tab':
          e.preventDefault()
          setShowAdvanced(!showAdvanced)
          break
      }
    },
    [isOpen, query, results, initialArticles, selectedIndex, onClose, showAdvanced],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // 选择搜索结果
  const handleSelectResult = (result: SearchResult) => {
    // 如果有具体的内容匹配，可以跳转到锚点
    let url = `/blog/${result.post.slug}`
    if (result.matches.length > 0) {
      const firstMatch = result.matches[0]
      if (firstMatch.content.type === 'heading') {
        // 为标题生成锚点
        const anchor = firstMatch.content.plainText
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fff\s]/g, '')
          .replace(/\s+/g, '-')
        url += `#${anchor}`
      }
    }

    router.push(url)
    onClose()
  }

  // 选择建议
  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* 背景遮罩 - 完全采用KBar的样式 */}
      <div
        className="fixed inset-0 bg-gray-300/50 p-4 backdrop-blur backdrop-filter dark:bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      >
        {/* 搜索对话框容器 */}
        <div className="flex min-h-full items-start justify-center pt-16">
          <div
            className="relative w-full max-w-xl transform rounded-2xl border border-gray-100 bg-gray-50 shadow-xl transition-all dark:border-gray-800 dark:bg-gray-900"
            onClick={e => e.stopPropagation()}
          >
            {/* 错误状态 */}
            {error && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50/95 backdrop-blur dark:bg-gray-900/95">
                <div className="text-center">
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-12 w-12 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                    搜索功能暂时不可用
                  </h3>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{error}</p>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setError(null)
                        setSearchEngine(null)
                        // 重新尝试初始化
                      }}
                      className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 rounded-md px-4 py-2 text-sm text-white focus:ring-2 focus:outline-none"
                    >
                      重试
                    </button>
                    <button
                      onClick={onClose}
                      className="rounded-md bg-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                    >
                      关闭
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 加载状态 */}
            {isLoading && !error && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50/90 backdrop-blur dark:bg-gray-900/90">
                <div className="flex items-center space-x-4">
                  <div className="border-primary-600 dark:border-primary-400 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">加载搜索引擎...</span>
                </div>
              </div>
            )}

            {/* 搜索输入框 - 完全采用KBar的样式 */}
            <div className="flex items-center space-x-4 p-4">
              <span className="block w-5">
                <svg
                  className="text-gray-400 dark:text-gray-300"
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
              </span>
              <input
                type="text"
                placeholder="搜索文章内容、标题、标签..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="h-8 w-full bg-transparent text-gray-600 placeholder-gray-400 focus:outline-none dark:text-gray-200 dark:placeholder-gray-500"
                autoFocus
              />
              {searchStats && (
                <div className="hidden text-xs text-gray-400 sm:block">
                  {searchStats.totalPosts} 篇文章
                </div>
              )}
              <kbd className="inline-block rounded border border-gray-400 px-1.5 align-middle text-xs leading-4 font-medium tracking-wide whitespace-nowrap text-gray-400">
                ESC
              </kbd>
            </div>

            {/* 搜索建议 */}
            {suggestions.length > 0 && query.length > 1 && (
              <div className="border-t border-gray-100 bg-gray-100/50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    建议:
                  </span>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800 rounded px-2 py-1 text-xs"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 搜索结果 */}
            <div className="max-h-96 overflow-y-auto">
              {error ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    搜索功能遇到了问题，请稍后重试
                  </p>
                </div>
              ) : isLoading ? (
                <div className="px-4 py-8 text-center">
                  <div className="border-primary-600 dark:border-primary-400 mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    正在加载搜索引擎...
                  </p>
                </div>
              ) : query && results.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    没有找到 "{query}" 的相关结果
                  </p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    试试使用不同的关键词或者更简短的查询
                  </p>
                </div>
              ) : query && results.length > 0 ? (
                // 显示搜索结果
                <div className="py-2">
                  <div className="px-4 py-2">
                    <h3 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      搜索结果 ({results.length})
                    </h3>
                  </div>
                  {results.map((result, index) => (
                    <SearchResultItem
                      key={result.post.slug}
                      result={result}
                      index={index}
                      selectedIndex={selectedIndex}
                      onSelect={handleSelectResult}
                      showMatches={true}
                    />
                  ))}
                </div>
              ) : (
                // 显示初始文章列表（无搜索时）
                <div className="py-2">
                  <div className="px-4 py-2">
                    <h3 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      推荐文章 (随机排序)
                    </h3>
                  </div>
                  {initialArticles.map((article, index) => (
                    <SearchResultItem
                      key={article.post.slug}
                      result={article}
                      index={index}
                      selectedIndex={selectedIndex}
                      onSelect={handleSelectResult}
                      showMatches={false}
                    />
                  ))}
                  {initialArticles.length === 0 && (
                    <div className="px-4 py-8 text-center">
                      <div className="mb-4">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">输入关键词开始搜索</p>
                      {searchStats && (
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          包含 {searchStats.totalPosts} 篇文章，{searchStats.totalContents} 个内容块
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 底部提示 */}
            <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-gray-400 px-1 py-0.5">↑↓</kbd>
                    导航
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-gray-400 px-1 py-0.5">Enter</kbd>
                    打开
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-gray-400 px-1 py-0.5">Tab</kbd>
                    高级
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-gray-400 px-1 py-0.5">ESC</kbd>
                    关闭
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
