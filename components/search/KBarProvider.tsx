import type { Action } from 'kbar'
import { KBarProvider } from 'kbar'
import { useRouter } from 'next/navigation'
import { FC, ReactNode, useEffect, useState } from 'react'

import { formatDate } from '@/lib/formatDate'

import { KBarModal } from './KBarModal'

export interface KBarSearchProps {
  searchDocumentsPath: string | false
  defaultActions?: Action[]
  onSearchDocumentsLoad?: (json: BlogPost[]) => Action[]
}

export interface KBarConfig {
  provider: 'kbar'
  kbarConfig: KBarSearchProps
}

interface BlogPost {
  slug: string
  title: string
  summary?: string
  date: string
  tags?: string[]
}

/**
 * Command palette like search component with kbar - `ctrl-k` to open the palette.
 *
 * Default actions can be overridden by passing in an array of actions to `defaultActions`.
 * To load actions dynamically, pass in a `searchDocumentsPath` to a JSON file.
 * `onSearchDocumentsLoad` can be used to transform the JSON into actions.
 *
 * To toggle the modal or search from child components, use the search context:
 * ```
 * import { useKBar } from 'kbar'
 * const { query } = useKBar()
 * ```
 */
export const KBarSearchProvider: FC<{
  children: ReactNode
  kbarConfig: KBarSearchProps
}> = ({ kbarConfig, children }) => {
  const router = useRouter()
  const { searchDocumentsPath, defaultActions, onSearchDocumentsLoad } = kbarConfig

  const [searchActions, setSearchActions] = useState<Action[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    const mapPosts = (posts: BlogPost[]) => {
      const actions: Action[] = []
      for (const post of posts) {
        actions.push({
          id: post.slug,
          name: post.title,
          keywords: post?.summary || '',
          section: 'Content',
          subtitle: formatDate(post.date, 'en-US'),
          perform: () => router.push('/blog/' + post.slug),
        })
      }
      return actions
    }

    async function fetchData() {
      if (searchDocumentsPath) {
        const url =
          searchDocumentsPath.indexOf('://') > 0 || searchDocumentsPath.indexOf('//') === 0
            ? searchDocumentsPath
            : new URL(searchDocumentsPath, window.location.origin)
        const res = await fetch(url)
        const json = await res.json()
        const actions = onSearchDocumentsLoad ? onSearchDocumentsLoad(json) : mapPosts(json)
        setSearchActions(actions)
        setDataLoaded(true)
      }
    }

    if (!dataLoaded && searchDocumentsPath) {
      fetchData()
    } else {
      setDataLoaded(true)
    }
  }, [defaultActions, dataLoaded, router, searchDocumentsPath, onSearchDocumentsLoad])

  return (
    <KBarProvider actions={defaultActions}>
      <KBarModal actions={searchActions} isLoading={!dataLoaded} />
      {children}
    </KBarProvider>
  )
}
