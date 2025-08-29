import type { CompileOptions } from '@mdx-js/mdx'
import { compile } from '@mdx-js/mdx'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypeSlug from 'rehype-slug'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { getTocConfig } from '../config'

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
    // 获取 TOC 配置
    const tocConfig = getTocConfig()

    // 根据配置处理TOC标记
    let processedSource = source

    if (tocConfig.enabled && tocConfig.showInlineMarker) {
      // 如果启用了TOC且允许显示内联标记，则替换为组件
      processedSource = source.replace(/\[([tT][oO][cC])\]/g, '<TOCInline toc={props.toc} />')
    } else {
      // 否则移除TOC标记
      processedSource = source.replace(/\[([tT][oO][cC])\]/gi, '')
    }

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
