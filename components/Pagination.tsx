'use client'

import Link from '@/components/Link'

interface PaginationProps {
  totalPages: number
  currentPage: number
  onPageChange?: (page: number) => void
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
    return (
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <nav className="flex justify-between">
          <button
            className={`${!prevPage ? 'cursor-auto opacity-50' : 'hover:text-primary-600 dark:hover:text-primary-400'}`}
            disabled={!prevPage}
            onClick={() => prevPage && onPageChange(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            {currentPage} of {totalPages}
          </span>
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
    return (
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <nav className="flex justify-between">
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
          <span>
            {currentPage} of {totalPages}
          </span>
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
