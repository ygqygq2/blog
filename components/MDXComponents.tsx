import type { MDXComponents } from 'mdx/types'

import Image from './Image'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import BlogNewsletterWrapper from './ui/BlogNewsletterWrapper'
import Code from './ui/Code'
import Pre from './ui/Pre'
import TOCInline from './ui/TOCInline'

export const components: MDXComponents = {
  Image,
  img: Image, // 映射 img 标签到我们的 Image 组件
  TOCInline,
  a: CustomLink,
  code: Code,
  pre: Pre,
  table: TableWrapper,
  BlogNewsletterForm: BlogNewsletterWrapper,
}
