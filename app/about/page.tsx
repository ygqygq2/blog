import { genPageMetadata } from 'app/seo'
import { getAllAuthors, Author } from '@/lib/blog'
import { MDXLayoutRenderer } from '@/components/MDXLayoutRenderer'
import { coreContent } from '@/lib/contentlayer'

import AuthorLayout from '@/layouts/AuthorLayout'

export const metadata = genPageMetadata({ title: 'About' })

export default async function Page() {
  const allAuthors = await getAllAuthors()
  const author = allAuthors.find((p) => p.slug === 'default') as Author
  const mainContent = coreContent(author)

  return (
    <>
      <AuthorLayout content={mainContent}>
        <MDXLayoutRenderer code={author.body.code} />
      </AuthorLayout>
    </>
  )
}
