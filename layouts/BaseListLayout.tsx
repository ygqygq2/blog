'use client'

import { useCallback, useMemo, useState } from 'react'

import Link from '@/components/Link'
import Pagination from '@/components/Pagination'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata.cjs'
import { usePagination } from '@/hooks/usePagination'
import type { BlogPost } from '@/lib/blog'
import { CoreContent } from '@/lib/contentlayer'
import { formatDate } from '@/lib/formatDate'

interface BaseListLayoutProps {
  posts: CoreContent<BlogPost>[]
  title: string
  initialDisplayPosts?: CoreContent<BlogPost>[]
  pagination?: {
    currentPage: number
    totalPages: number
  }
  showTags?: boolean
  showSearch?: boolean
}

const POSTS_PER_PAGE = 10

export default function BaseListLayout({
  posts,
  title,
  initialDisplayPosts: _initialDisplayPosts = [],
  pagination: _pagination,
  showTags = false,
  showSearch = true,
}: BaseListLayoutProps) {
  const [searchValue, setSearchValue] = useState('')
  const { currentPage, handlePageChange } = usePagination(1)

  // 客户端分页逻辑
  const filteredBlogPosts = useMemo(() => {
    // 先过滤搜索结果
    const filtered = posts.filter(post => {
      const searchContent = post.title + post.summary + post.tags?.join(' ')
      return searchContent.toLowerCase().includes(searchValue.toLowerCase())
    })
    // 按日期排序，从新到旧
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [posts, searchValue])

  const totalPages = Math.ceil(filteredBlogPosts.length / POSTS_PER_PAGE)

  const displayPosts = useMemo(() => {
    // 分页显示
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE
    const endIndex = startIndex + POSTS_PER_PAGE
    return filteredBlogPosts.slice(startIndex, endIndex)
  }, [filteredBlogPosts, currentPage])

  // 当搜索时重置到第一页
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value)
      handlePageChange(1)
    },
    [handlePageChange],
  )

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-2 pb-2 sm:pt-6 sm:pb-8 md:space-y-5">
          <h1 className="hidden text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:block sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {title}
          </h1>
          {showSearch && (
            <div className="relative max-w-lg">
              <label>
                <span className="sr-only">Search articles</span>
                <input
                  aria-label="Search articles"
                  type="text"
                  onChange={handleSearchChange}
                  placeholder="Search articles"
                  className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>
              <svg
                className="absolute top-3 right-3 h-5 w-5 text-gray-400 dark:text-gray-300"
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
            </div>
          )}
        </div>
        <ul>
          {!displayPosts.length && 'No posts found.'}
          {displayPosts.map(post => {
            const { path, date, title, summary, tags } = post
            return (
              <li key={path} className="py-4">
                <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                  <dl>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                      <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                    </dd>
                  </dl>
                  <div className="space-y-3 xl:col-span-3">
                    <div>
                      <h3 className="text-2xl leading-8 font-bold tracking-tight">
                        <Link href={`/${path}`} className="text-gray-900 dark:text-gray-100">
                          {title}
                        </Link>
                      </h3>
                      {showTags && tags && (
                        <div className="flex flex-wrap">
                          {tags.map(tag => (
                            <Tag key={tag} text={tag} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                      {summary}
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  )
}
