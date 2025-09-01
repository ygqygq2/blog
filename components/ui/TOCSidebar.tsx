'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import siteMetadata from '@/data/siteMetadata.cjs'
import { ensureElementId, normalizeText, smoothScrollToElement, textMatches } from '@/lib/utils'

import { getTocConfig } from '../../config'

interface TOCSidebarProps {
  toc: Array<{
    value: string
    url: string
    depth: number
  }>
}

export default function TOCSidebar({ toc }: TOCSidebarProps) {
  const [activeId, setActiveId] = useState<string>('')
  const headingElementsRef = useRef<Record<string, IntersectionObserverEntry>>({})
  const userClickedRef = useRef(false)
  const clickProtectEndRef = useRef<number>(0)

  // 获取TOC配置
  const tocConfig = getTocConfig()

  // 根据配置过滤标题级别
  const filteredToc = useMemo(
    () => toc.filter(heading => heading.depth >= 1 && heading.depth <= tocConfig.maxDepth),
    [toc, tocConfig.maxDepth],
  )

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
    [normalizeText],
  )

  // Intersection Observer
  useEffect(() => {
    if (!filteredToc.length) return

    const headerHeight = getHeaderHeight()

    const callback = (headings: IntersectionObserverEntry[]) => {
      // 点击保护期内直接返回
      if (userClickedRef.current && Date.now() < clickProtectEndRef.current) return

      // 存储所有标题的状态
      headingElementsRef.current = headings.reduce((map, headingElement) => {
        map[headingElement.target.id] = headingElement
        return map
      }, headingElementsRef.current)

      // 找到所有可见的标题
      const visibleHeadings: IntersectionObserverEntry[] = []
      Object.keys(headingElementsRef.current).forEach(key => {
        const headingElement = headingElementsRef.current[key]
        if (headingElement.isIntersecting) {
          visibleHeadings.push(headingElement)
        }
      })

      // 获取所有标题元素用于排序 - 根据配置选择标题级别
      const headingSelector = Array.from(
        { length: tocConfig.maxDepth },
        (_, i) => `h${i + 1}`,
      ).join(', ')
      const headingElements = Array.from(document.querySelectorAll(headingSelector))
      const getIndexFromId = (id: string) => headingElements.findIndex(heading => heading.id === id)

      if (visibleHeadings.length === 1) {
        setActiveId(visibleHeadings[0].target.id)
      } else if (visibleHeadings.length > 1) {
        // 多个可见标题时，选择最接近顶部的（索引最小的）
        const sortedVisibleHeadings = visibleHeadings.sort(
          (a, b) => getIndexFromId(a.target.id) - getIndexFromId(b.target.id),
        )
        setActiveId(sortedVisibleHeadings[0].target.id)
      } else {
        // 处理滚动回退：没有可见标题时的逻辑
        const activeElement = headingElements.find(el => el.id === activeId)
        const activeIndex = headingElements.findIndex(el => el.id === activeId)
        const activeIdYcoord = activeElement?.getBoundingClientRect().y

        if (activeIdYcoord && activeIdYcoord > headerHeight + 50 && activeIndex !== 0) {
          const prevHeading = headingElements[activeIndex - 1]
          if (prevHeading?.id) {
            setActiveId(prevHeading.id)
          }
        }
      }
    }

    const observer = new IntersectionObserver(callback, {
      // 根据stickyNav配置动态调整rootMargin
      rootMargin: `-${headerHeight + 10}px 0px -40% 0px`,
    })

    // 改进的元素查找和观察逻辑
    const headingElements: HTMLElement[] = []

    filteredToc.forEach(item => {
      const element = findMatchingElement(item)
      if (element && !headingElements.includes(element)) {
        headingElements.push(element)
        console.log(`找到匹配元素: ${item.value} -> ${element.textContent}`) // 调试信息
      } else {
        console.warn(`未找到匹配元素: ${item.value}`) // 调试信息
      }
    })

    headingElements.forEach(element => observer.observe(element))

    // 初始设置第一个标题为激活状态
    if (headingElements.length > 0 && !activeId) {
      setActiveId(headingElements[0].id)
    }

    return () => observer.disconnect()
  }, [filteredToc, getHeaderHeight, activeId, findMatchingElement])

  // 改进的点击处理事件
  const handleClick = useCallback(
    (e: React.MouseEvent, heading: (typeof filteredToc)[0]) => {
      e.preventDefault()

      console.log(`点击标题: ${heading.value}`) // 调试信息

      // 设置点击保护
      userClickedRef.current = true
      clickProtectEndRef.current = Date.now() + 1000

      // 使用改进的查找方法
      const targetElement = findMatchingElement(heading)

      if (targetElement) {
        const headerHeight = getHeaderHeight()

        // 立即设置激活状态
        setActiveId(targetElement.id)

        // 使用工具函数进行平滑滚动
        smoothScrollToElement(targetElement, headerHeight + 10)

        console.log(`滚动到: ${targetElement.textContent}`) // 调试信息

        // 滚动完成后清除保护
        setTimeout(() => {
          userClickedRef.current = false
        }, 1000)
      } else {
        console.error(`未找到目标元素: ${heading.value}`) // 调试信息
        userClickedRef.current = false
      }
    },
    [getHeaderHeight, findMatchingElement],
  )

  if (filteredToc.length === 0 || filteredToc.length < tocConfig.minHeadings) return null

  return (
    <div className="hidden lg:block">
      <div className="fixed top-[7rem] right-0 max-h-[calc(100vh-9rem)] w-[20rem] overflow-y-auto bg-transparent p-6">
        <h3 className="mb-4 border-b border-gray-200 pb-2 text-base font-semibold tracking-wide text-gray-900 uppercase dark:border-gray-800 dark:text-gray-100">
          目录
        </h3>
        <nav>
          <ul className="space-y-1 text-sm">
            {filteredToc.map(heading => {
              const headingId = heading.url.substring(1)
              // 查找对应的元素，获取实际的ID
              const element = findMatchingElement(heading)
              const actualId = element?.id || headingId
              const isActive = activeId === actualId

              console.log(
                `渲染检查: ${heading.value} - URL ID: ${headingId}, 实际ID: ${actualId}, 活跃ID: ${activeId}, 是否活跃: ${isActive}`,
              ) // 调试信息

              // 计算正确的缩进级别 - 相对于最小depth
              const minDepth = Math.min(...filteredToc.map(h => h.depth))
              const indentLevel = heading.depth - minDepth
              const marginLeft = indentLevel * 16 // 每级缩进16px

              return (
                <li
                  key={heading.url}
                  className="relative"
                  style={{ marginLeft: `${marginLeft}px` }}
                >
                  {/* 活跃状态的左侧指示线 */}
                  <div
                    className={`absolute top-0 -left-3 w-1 rounded-full transition-all duration-200 ease-in-out ${
                      isActive
                        ? 'bg-primary-600 dark:bg-primary-400 h-full opacity-100'
                        : 'bg-primary-600 dark:bg-primary-400 h-0 opacity-0'
                    }`}
                  />

                  <a
                    href={heading.url}
                    className={`block rounded-md px-3 py-2 text-sm transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-medium'
                        : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                    }`}
                    onClick={e => handleClick(e, heading)}
                  >
                    <span>{heading.value}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
