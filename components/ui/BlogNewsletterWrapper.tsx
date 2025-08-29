import { lazy, Suspense } from 'react'

import { isFeatureEnabled } from '@/lib/mode-config'

// 使用ES6动态导入和懒加载
const BlogNewsletterForm = lazy(() => import('./BlogNewsletterForm'))

// 在构建时决定是否导入和渲染BlogNewsletter组件
const BlogNewsletterWrapper = () => {
  // 如果newsletter功能被禁用（静态模式），直接返回null
  if (!isFeatureEnabled('newsletter')) {
    return null
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogNewsletterForm />
    </Suspense>
  )
}

export default BlogNewsletterWrapper
