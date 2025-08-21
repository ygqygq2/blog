import type { MDXComponents } from 'mdx/types'

import Image from './Image'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import BlogNewsletterForm from './ui/BlogNewsletterForm'
import Pre from './ui/Pre'
import TOCInline from './ui/TOCInline'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  BlogNewsletterForm,
}
