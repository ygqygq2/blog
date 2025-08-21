import type { MDXComponents } from 'mdx/types'

import Image from '@/components/Image'
import CustomLink from '@/components/Link'
import TableWrapper from '@/components/TableWrapper'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Image,
    a: CustomLink,
    table: TableWrapper,
  }
}
