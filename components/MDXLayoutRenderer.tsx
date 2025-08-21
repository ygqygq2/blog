import { ReactNode } from 'react'
import { run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { components } from './MDXComponents'

interface MDXLayoutRendererProps {
  code: string
  components?: any
  toc?: Array<{
    value: string
    url: string
    depth: number
  }>
  children?: ReactNode
}

export async function MDXLayoutRenderer({ code, components: customComponents, toc, children }: MDXLayoutRendererProps) {
  const mdxComponents = { ...components, ...customComponents }
  
  if (children) {
    return (
      <div className="prose prose-slate max-w-none dark:prose-invert xl:col-span-2">
        {children}
      </div>
    )
  }

  try {
    // 运行预编译的 MDX 代码
    const { default: MDXContent } = await run(code, {
      ...runtime,
      baseUrl: import.meta.url,
    })

    return (
      <div className="prose prose-slate max-w-none dark:prose-invert xl:col-span-2">
        <MDXContent components={mdxComponents} />
      </div>
    )
  } catch (error) {
    console.error('MDX runtime error:', error)
    return (
      <div className="prose prose-slate max-w-none dark:prose-invert xl:col-span-2">
        <div className="border border-red-300 bg-red-50 p-4 rounded">
          <h3 className="text-red-800">MDX 运行错误</h3>
          <pre className="text-red-600 text-sm mt-2">{String(error)}</pre>
          <details className="mt-2">
            <summary className="cursor-pointer text-red-700">查看原始内容</summary>
            <pre className="bg-gray-100 p-2 mt-2 text-xs overflow-auto">{code}</pre>
          </details>
        </div>
      </div>
    )
  }
}
