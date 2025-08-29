'use client'

import { slug } from 'github-slugger'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import Link from '@/components/Link'
import type { BlogPost } from '@/lib/blog'
import { CoreContent } from '@/lib/contentlayer'

import BaseListLayout from './BaseListLayout'

interface ListLayoutProps {
  posts: CoreContent<BlogPost>[]
  title: string
  initialDisplayPosts?: CoreContent<BlogPost>[]
  pagination?: {
    currentPage: number
    totalPages: number
  }
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname()
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({})
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  // 动态加载tag-data.json
  useEffect(() => {
    const loadTagData = async () => {
      try {
        const tagData = await import('app/tag-data.json')
        setTagCounts(tagData.default || {})
      } catch (_error) {
        console.warn('⚠️  tag-data.json not found, using empty object')
        setTagCounts({})
      }
    }

    loadTagData()
  }, [])

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <>
      <div>
        <div className="pt-6 pb-6">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:hidden sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {title}
          </h1>
        </div>
        <div className="flex sm:space-x-24">
          <div className="hidden h-full max-h-screen max-w-[280px] min-w-[280px] flex-wrap overflow-auto rounded bg-gray-50 pt-5 shadow-md sm:flex dark:bg-gray-900/70 dark:shadow-gray-800/40">
            <div className="px-6 py-4">
              {pathname.startsWith('/blog') ? (
                <h3 className="text-primary-500 font-bold uppercase">All Posts</h3>
              ) : (
                <Link
                  href={`/blog`}
                  className="hover:text-primary-500 dark:hover:text-primary-500 font-bold text-gray-700 uppercase dark:text-gray-300"
                >
                  All Posts
                </Link>
              )}
              <ul>
                {sortedTags.map(t => {
                  return (
                    <li key={t} className="my-3">
                      {pathname.split('/tags/')[1] === slug(t) ? (
                        <h3 className="text-primary-500 inline px-3 py-2 text-sm font-bold uppercase">
                          {`${t} (${tagCounts[t]})`}
                        </h3>
                      ) : (
                        <Link
                          href={`/tags/${slug(t)}`}
                          className="hover:text-primary-500 dark:hover:text-primary-500 px-3 py-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-300"
                          aria-label={`View posts tagged ${t}`}
                        >
                          {`${t} (${tagCounts[t]})`}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
          <div>
            <BaseListLayout
              posts={displayPosts}
              title={title}
              pagination={pagination}
              showTags={true}
              showSearch={false}
            />
          </div>
        </div>
      </div>
    </>
  )
}
