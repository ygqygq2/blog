import { evaluate } from '@mdx-js/mdx'
import crypto from 'crypto'
import { ReactNode, Suspense } from 'react'
import * as runtime from 'react/jsx-runtime'
import rehypeKatex from 'rehype-katex'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { getTocConfig } from '../config'
import { components } from './MDXComponents'
import TOCInline from './ui/TOCInline'

interface MDXLayoutRendererProps {
  code: string
  components?: Record<string, React.ComponentType>
  toc?: Array<{
    value: string
    url: string
    depth: number
  }>
  children?: ReactNode
}

// MDX编译缓存
const mdxCache = new Map<string, React.ComponentType>()

async function compileMDX(source: string) {
  // 使用 SHA-256 对内容生成 hash，避免只取前缀导致的冲突
  const hash = crypto.createHash('sha256').update(source, 'utf8').digest('hex')

  if (mdxCache.has(hash)) {
    return mdxCache.get(hash)
  }

  try {
    const { default: MDXContent } = await evaluate(source, {
      ...runtime,
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [
        rehypeSlug,
        rehypeKatex,
        [rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true }],
      ],
      development: process.env.NODE_ENV === 'development',
    })

    mdxCache.set(hash, MDXContent)
    return MDXContent
  } catch (error) {
    console.error('MDX compilation error:', error)
    return null
  }
}

async function MDXContent({
  source,
  components: customComponents,
  toc,
}: {
  source: string
  components?: Record<string, React.ComponentType>
  toc?: Array<{
    value: string
    url: string
    depth: number
  }>
}) {
  const MDXComponent = await compileMDX(source)
  const mdxComponents = { ...components, ...customComponents }

  if (!MDXComponent) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4">
        <h3 className="text-red-800">MDX 编译错误</h3>
        <p className="mt-2 text-sm text-red-600">无法编译 MDX 内容</p>
      </div>
    )
  }

  return <MDXComponent components={mdxComponents} toc={toc} />
}

export function MDXLayoutRenderer({
  code,
  components: customComponents,
  toc,
  children,
}: MDXLayoutRendererProps) {
  if (children) {
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none xl:col-span-2">{children}</div>
    )
  }

  // 获取 TOC 配置
  const tocConfig = getTocConfig()

  // 检查内容中是否包含[TOC]或[toc]标记
  const hasTocMarker = code && (/\[toc\]/i.test(code) || /\[TOC\]/i.test(code))

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none xl:col-span-2">
      {/* 如果启用了移动端目录显示，且满足显示条件 */}
      {tocConfig.enabled &&
        tocConfig.showMobileToc &&
        toc &&
        toc.length >= tocConfig.minHeadings &&
        !hasTocMarker && (
          <div className="mt-4 mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4 lg:hidden dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-800 uppercase dark:text-gray-200">
              目录
            </h3>
            <TOCInline toc={toc} asDisclosure={false} toHeading={tocConfig.maxDepth} />
          </div>
        )}
      <Suspense
        fallback={
          <div className="animate-pulse">
            <div className="mb-4 h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="mb-4 h-4 w-1/2 rounded bg-gray-200"></div>
            <div className="mb-4 h-4 w-5/6 rounded bg-gray-200"></div>
          </div>
        }
      >
        <MDXContent source={code} components={customComponents} toc={toc} />
      </Suspense>
    </div>
  )
}
