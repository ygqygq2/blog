import { genPageMetadata } from 'app/seo'
import { slug } from 'github-slugger'
import { Metadata } from 'next'

import Link from '@/components/Link'
import Tag from '@/components/Tag'

export const metadata: Metadata = genPageMetadata({
  title: 'Tags',
  description: 'Things I blog about',
})

// 在静态模式下强制静态生成
export const dynamic = 'force-static'

// 动态导入tagData，如果不存在则使用空对象
async function getTagData() {
  try {
    const tagData = await import('app/tag-data.json')
    return tagData.default || {}
  } catch (error) {
    // 在开发模式下，如果tag-data.json不存在，返回空对象
    console.warn('⚠️  tag-data.json not found, using empty object')
    return {}
  }
}

export default async function Page() {
  const tagCounts = await getTagData()
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
  return (
    <>
      <div className="flex flex-col items-start justify-start divide-y divide-gray-200 md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0 dark:divide-gray-700">
        <div className="space-x-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:border-r-2 md:px-6 md:text-6xl md:leading-14 dark:text-gray-100">
            Tags
          </h1>
        </div>
        <div className="flex max-w-lg flex-wrap">
          {tagKeys.length === 0 && 'No tags found.'}
          {sortedTags.map(t => {
            return (
              <div key={t} className="mt-2 mr-5 mb-2">
                <Tag text={t} />
                <Link
                  href={`/tags/${encodeURIComponent(slug(t))}`}
                  className="-ml-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300"
                  aria-label={`View posts tagged ${t}`}
                >
                  {` (${tagCounts[t]})`}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
