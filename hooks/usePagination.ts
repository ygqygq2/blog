'use client'

import { useCallback, useState } from 'react'

export function usePagination(initialPage: number = 1) {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return {
    currentPage,
    handlePageChange,
    setCurrentPage,
  }
}
