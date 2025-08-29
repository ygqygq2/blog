'use client'

import type { FuseResult } from 'fuse.js'
import Fuse from 'fuse.js'
import { useCallback, useEffect, useState } from 'react'

interface SearchableItem {
  slug: string
  title: string
  summary?: string
  tags?: string[]
  date: string
  [key: string]: any
}

export function useSearch<T extends SearchableItem>(initialData: T[] = []) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FuseResult<T>[]>([])
  const [fuse, setFuse] = useState<Fuse<T> | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 初始化Fuse实例
  useEffect(() => {
    if (initialData.length > 0) {
      setIsLoading(true)
      try {
        const fuseInstance = new Fuse(initialData, {
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
        console.error('Failed to initialize search:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }, [initialData])

  // 执行搜索
  useEffect(() => {
    if (!fuse || !query.trim()) {
      setResults([])
      return
    }

    const searchResults = fuse.search(query).slice(0, 10)
    setResults(searchResults)
  }, [query, fuse])

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
  }, [])

  return {
    query,
    results,
    isLoading,
    handleSearch,
  }
}
