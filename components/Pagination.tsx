'use client'

import { useState } from 'react'

import Link from '@/components/Link'

interface PaginationProps {
  totalPages: number
  currentPage: number
  onPageChange?: (page: number, shouldScroll?: boolean) => void
  basePath?: string
}

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  basePath = '',
}: PaginationProps) {
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  if (onPageChange) {
    // 客户端分页
    const [inputPage, setInputPage] = useState('')

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputPage(e.target.value)
    }

    const handleGoToPage = () => {
      const pageNum = parseInt(inputPage)
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        // 设置页码前先保存当前滚动位置
        const currentScrollPosition = window.scrollY

        // 更改页码
        onPageChange(pageNum)
        setInputPage('')

        // 尝试保持当前滚动位置，防止页面跳到顶部
        setTimeout(() => {
          window.scrollTo({
            top: currentScrollPosition,
            behavior: 'auto',
          })
        }, 0)
      } else {
        alert(`请输入 1 到 ${totalPages} 之间的页码`)
      }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleGoToPage()
      }
    }

    return (
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <nav className="flex items-center justify-between">
          <button
            className={`${!prevPage ? 'cursor-auto opacity-50' : 'hover:text-primary-600 dark:hover:text-primary-400'}`}
            disabled={!prevPage}
            onClick={() => prevPage && onPageChange(currentPage - 1)}
          >
            Previous
          </button>
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline">
              {currentPage} of {totalPages}
            </span>
            <div className="flex items-center">
              <input
                type="text"
                className="focus:border-primary-500 focus:ring-primary-500 h-8 w-16 rounded-md border border-gray-300 text-center dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                value={inputPage}
                onChange={handlePageInputChange}
                onKeyPress={handleKeyPress}
                placeholder="页码"
                aria-label="跳转到页码"
              />
              <button
                className="ml-2 rounded-md bg-gray-200 px-3 py-1 text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={handleGoToPage}
              >
                跳转
              </button>
            </div>
          </div>
          <button
            className={`${!nextPage ? 'cursor-auto opacity-50' : 'hover:text-primary-600 dark:hover:text-primary-400'}`}
            disabled={!nextPage}
            onClick={() => nextPage && onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </nav>
      </div>
    )
  } else {
    // 服务端分页
    const [inputPage, setInputPage] = useState('')

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputPage(e.target.value)
    }

    const handleGoToPage = () => {
      const pageNum = parseInt(inputPage)
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        // 服务端跳转，无法保持滚动位置
        window.location.href = pageNum === 1 ? `/${basePath}/` : `/${basePath}/page/${pageNum}`
      } else {
        alert(`请输入 1 到 ${totalPages} 之间的页码`)
      }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleGoToPage()
      }
    }

    return (
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <nav className="flex items-center justify-between">
          {!prevPage && (
            <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
              Previous
            </button>
          )}
          {prevPage && (
            <Link
              href={
                currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`
              }
              rel="prev"
            >
              Previous
            </Link>
          )}
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline">
              {currentPage} of {totalPages}
            </span>
            <div className="flex items-center">
              <input
                type="text"
                className="focus:border-primary-500 focus:ring-primary-500 h-8 w-16 rounded-md border border-gray-300 text-center dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                value={inputPage}
                onChange={handlePageInputChange}
                onKeyPress={handleKeyPress}
                placeholder="页码"
                aria-label="跳转到页码"
              />
              <button
                className="ml-2 rounded-md bg-gray-200 px-3 py-1 text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={handleGoToPage}
              >
                跳转
              </button>
            </div>
          </div>
          {!nextPage && (
            <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
              Next
            </button>
          )}
          {nextPage && (
            <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
              Next
            </Link>
          )}
        </nav>
      </div>
    )
  }
}
