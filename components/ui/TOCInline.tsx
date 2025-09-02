'use client'

import { ReactElement, useCallback } from 'react'

import siteMetadata from '@/data/siteMetadata.cjs'
import { ensureElementId, smoothScrollToElement, textMatches } from '@/lib/utils'

import { getTocConfig } from '../../config'

interface TOCInlineProps {
  toc: Array<{
    value: string
    url: string
    depth: number
  }>
  indentDepth?: number
  fromHeading?: number
  toHeading?: number
  asDisclosure?: boolean
  exclude?: string | string[]
}

export default function TOCInline({
  toc,
  indentDepth: _indentDepth = 3,
  fromHeading = 1,
  toHeading = 6,
  asDisclosure = false,
  exclude = '',
}: TOCInlineProps): ReactElement {
  // 获取TOC配置
  const tocConfig = getTocConfig()

  // 如果TOC被禁用，返回null
  if (!tocConfig.enabled) {
    return <></>
  }

  const re = Array.isArray(exclude)
    ? new RegExp('^(' + exclude.join('|') + ')$', 'i')
    : new RegExp('^(' + exclude + ')$', 'i')

  // 使用配置的maxDepth和过滤条件
  const filteredToc = toc.filter(
    heading =>
      heading.depth >= fromHeading &&
      heading.depth <= Math.min(toHeading, tocConfig.maxDepth) &&
      !re.test(heading.value),
  )

  // 检查是否满足最小标题数量要求
  if (filteredToc.length < tocConfig.minHeadings) {
    return <></>
  }

  // 获取header高度 - 根据stickyNav配置动态计算
  const getHeaderHeight = useCallback(() => {
    try {
      // 如果stickyNav为false，直接返回0（从浏览器顶部开始）
      if (!siteMetadata.stickyNav) {
        return 0
      }

      // 如果stickyNav为true，获取导航栏高度
      const headerEl = document.querySelector('header') || document.querySelector('nav')
      if (headerEl) {
        const rect = headerEl.getBoundingClientRect()
        return rect.height
      }
      return 80 // 默认值（当找不到导航栏时）
    } catch (_e) {
      return siteMetadata.stickyNav ? 80 : 0
    }
  }, [])

  // 查找匹配的标题元素
  const findMatchingElement = useCallback(
    (tocItem: (typeof filteredToc)[0]) => {
      const targetId = tocItem.url.substring(1)

      // 首先尝试通过ID查找
      let element = document.getElementById(targetId)
      if (element) return element

      // 通过文本匹配查找
      // 根据配置选择标题级别：从h1开始到maxDepth
      const headingSelector = Array.from(
        { length: tocConfig.maxDepth },
        (_, i) => `h${i + 1}`,
      ).join(', ')
      const allHeadings = document.querySelectorAll(headingSelector)

      for (const heading of allHeadings) {
        const headingText = heading.textContent || ''

        // 使用增强的文本匹配函数
        if (textMatches(tocItem.value, headingText)) {
          element = heading as HTMLElement
          // 确保元素有ID
          ensureElementId(element, targetId)
          return element
        }
      }

      return null
    },
    [tocConfig.maxDepth],
  )

  // 点击处理事件
  const handleClick = useCallback(
    (e: React.MouseEvent, heading: (typeof filteredToc)[0]) => {
      e.preventDefault()

      // 使用查找方法
      const targetElement = findMatchingElement(heading)

      if (targetElement) {
        const headerHeight = getHeaderHeight()

        // 使用工具函数进行平滑滚动
        smoothScrollToElement(targetElement, headerHeight + 10)
      }
    },
    [getHeaderHeight, findMatchingElement],
  )

  const tocList = (
    <ul className="space-y-1 text-sm">
      {filteredToc.map(heading => {
        // 计算缩进级别 - 相对于最小depth
        const minDepth = Math.min(...filteredToc.map(h => h.depth))
        const indentLevel = heading.depth - minDepth
        const marginLeft = indentLevel * 16 // 每级缩进16px

        return (
          <li key={heading.value} style={{ marginLeft: `${marginLeft}px` }}>
            <a
              href={heading.url}
              className="block rounded-md py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              style={{ paddingLeft: indentLevel === 0 ? '0' : '12px', paddingRight: '12px' }}
              onClick={e => handleClick(e, heading)}
            >
              {heading.value}
            </a>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="toc">
      {asDisclosure ? (
        <details open>
          <summary className="cursor-pointer text-xl leading-7 font-semibold text-gray-800 dark:text-gray-200">
            Table of Contents
          </summary>
          <div className="mt-1 ml-6">{tocList}</div>
        </details>
      ) : (
        <div className="not-prose my-4 rounded-lg border border-gray-200 bg-gray-50 p-4 lg:my-6 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-800 uppercase dark:text-gray-200">
            目录
          </h3>
          {tocList}
        </div>
      )}
    </div>
  )
}
