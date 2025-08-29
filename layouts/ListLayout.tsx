'use client'

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

export default function ListLayout(props: ListLayoutProps) {
  return <BaseListLayout {...props} showTags={false} />
}
