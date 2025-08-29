import { lazy, Suspense } from 'react'

import { isFeatureEnabled } from '@/lib/mode-config'

// 使用ES6动态导入和懒加载
const NewsletterForm = lazy(() => import('./NewsletterForm'))

// 在构建时决定是否导入和渲染Newsletter组件
const NewsletterWrapper = () => {
  // 如果newsletter功能被禁用（静态模式），直接返回null
  if (!isFeatureEnabled('newsletter')) {
    return null
  }

  return (
    <div className="flex items-center justify-center pt-4">
      <Suspense fallback={<div>Loading...</div>}>
        <NewsletterForm />
      </Suspense>
    </div>
  )
}

export default NewsletterWrapper
