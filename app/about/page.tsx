import { genPageMetadata } from 'app/seo'

import { MDXLayoutRenderer } from '@/components/MDXLayoutRenderer'
import AuthorLayout from '@/layouts/AuthorLayout'
import { Author, getAllAuthors } from '@/lib/blog'
import { coreContent } from '@/lib/contentlayer'
import { getModeConfig } from '@/lib/mode-config'

export const metadata = genPageMetadata({ title: 'About' })

// 根据模式配置动态渲染策略
export const dynamic = 'force-static'

export default async function Page() {
  const allAuthors = await getAllAuthors()
  const author = allAuthors.find(p => p.slug === 'default') as Author
  const mainContent = coreContent(author)

  return (
    <>
      <AuthorLayout content={mainContent}>
        <MDXLayoutRenderer code={author.body.code} />
      </AuthorLayout>
    </>
  )
}
