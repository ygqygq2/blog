'use client'

import dynamicImport from 'next/dynamic'

// 动态导入TOC组件，避免SSR问题
const TOCSidebar = dynamicImport(() => import('./TOCSidebar'), {
  ssr: false,
})

interface TOCSidebarClientProps {
  toc: Array<{
    value: string
    url: string
    depth: number
  }>
}

export default function TOCSidebarClient({ toc }: TOCSidebarClientProps) {
  return <TOCSidebar toc={toc} />
}
