'use client'

import { formatDate } from '@/lib/formatDate'
import { SearchResult } from '@/lib/search-types'

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
  const { post } = result
  const isSelected = index === selectedIndex

  return (
    <div
      className={`cursor-pointer px-4 py-2 ${isSelected ? 'bg-primary-600 hover:bg-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      onClick={() => onSelect(result)}
    >
      <div className="min-w-0 flex-1">
        <h4
          className={`truncate text-sm font-medium ${isSelected ? 'text-gray-100' : 'text-gray-900 dark:text-gray-100'}`}
        >
          {post.title}
        </h4>
        {post.summary && (
          <p
            className={`mt-1 line-clamp-2 text-xs ${isSelected ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {post.summary}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`text-xs ${isSelected ? 'text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}
          >
            {formatDate(post.date, 'zh-CN')}
          </span>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className={`inline-block rounded px-2 py-0.5 text-xs ${isSelected ? 'bg-primary-500 text-gray-100' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
