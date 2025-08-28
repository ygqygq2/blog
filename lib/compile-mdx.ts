import type { CompileOptions } from '@mdx-js/mdx'
import { compile } from '@mdx-js/mdx'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypeSlug from 'rehype-slug'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

const mdxOptions: Pick<CompileOptions, 'remarkPlugins' | 'rehypePlugins'> = {
  remarkPlugins: [remarkGfm, remarkMath, remarkBreaks],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'prepend' as const,
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
    // 处理[TOC]或[toc]标记，替换为TOCInline组件
    const processedSource = source.replace(/\[([tT][oO][cC])\]/g, '<TOCInline toc={props.toc} />')

    const compiled = await compile(processedSource, {
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
