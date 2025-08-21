import { compile } from '@mdx-js/mdx'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypeSlug from 'rehype-slug'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

const mdxOptions = {
  remarkPlugins: [remarkGfm, remarkMath, remarkBreaks],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'prepend',
        headingProperties: {
          className: ['content-header'],
        },
      },
    ],
    rehypeKatex,
    [rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true }],
  ],
}

export async function compileMDX(source: string): Promise<string> {
  try {
    const compiled = await compile(source, {
      outputFormat: 'function-body',
      development: process.env.NODE_ENV === 'development',
      ...mdxOptions,
    })

    return String(compiled)
  } catch (error) {
    console.error('MDX compilation error:', error)
    // 返回原始内容作为后备
    return source
  }
}
