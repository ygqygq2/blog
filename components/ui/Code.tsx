'use client'

import { ReactNode } from 'react'

interface CodeProps {
  children: ReactNode
  className?: string
}

export default function Code({ children, className, ...props }: CodeProps) {
  // 如果有 className 且包含 language-，说明是代码块，交给 pre 处理
  if (className && className.includes('language-')) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }

  // 行间代码的样式
  return (
    <code
      className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      {...props}
    >
      {children}
    </code>
  )
}
