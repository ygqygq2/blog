'use client'

import { useCallback, useState } from 'react'

export function usePagination(initialPage: number = 1) {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // 不再强制滚动到顶部，由调用者决定是否滚动
  }, [])

  return {
    currentPage,
    handlePageChange,
    setCurrentPage,
  }
}
