import React, { useState } from 'react'

import { SearchResult } from '../../lib/search-types'

interface SearchResultItemProps {
  result: SearchResult
  index: number
  selectedIndex: number
  onSelect: (result: SearchResult) => void
  showMatches: boolean
}

export default function SearchResultItem({
  result,
  index,
  selectedIndex,
  onSelect,
  showMatches,
}: SearchResultItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isSelected = index === selectedIndex || isHovered
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // 渲染匹配高亮
  const renderHighlight = (text: string) => {
    return { __html: text }
  }

  return (
    <button
      onClick={() => onSelect(result)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex w-full cursor-pointer justify-between px-4 py-2 text-left ${
        isSelected
          ? 'bg-primary-600 text-gray-100'
          : 'bg-transparent text-gray-700 dark:text-gray-100'
      }`}
    >
      <div className="flex w-full space-x-2">
        <div className="block w-full">
          {/* 文章标题 */}
          <div className="truncate text-sm font-medium">{result.post.title}</div>

          {/* 文章信息 */}
          <div className={`mt-1 text-xs ${isSelected ? 'text-gray-200' : 'text-gray-400'}`}>
            {formatDate(result.post.date)} • {result.post.readingTime.text}
            {showMatches && result.matches.length > 0 && <> • {result.matches.length} 个匹配</>}
          </div>

          {/* 文章摘要 */}
          {result.post.summary && (
            <div
              className={`mt-1 line-clamp-2 text-xs ${
                isSelected ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {result.post.summary}
            </div>
          )}

          {/* 标签 */}
          {result.post.tags && result.post.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {result.post.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className={`inline-block rounded px-1.5 py-0.5 text-xs ${
                    index === selectedIndex
                      ? 'bg-primary-700 text-gray-200'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
