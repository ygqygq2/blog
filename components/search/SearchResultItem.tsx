'use client'

import { formatDate } from '@/lib/formatDate'

interface SearchResultItemProps {
  title: string
  summary?: string
  date: string
  tags?: string[]
}

export default function SearchResultItem({ title, summary, date, tags }: SearchResultItemProps) {
  return (
    <div className="min-w-0 flex-1">
      <h4 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h4>
      {summary && (
        <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{summary}</p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {formatDate(date, 'zh-CN')}
        </span>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map(tag => (
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
  )
}
