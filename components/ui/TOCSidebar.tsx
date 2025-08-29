'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface TOCSidebarProps {
  toc: Array<{
    value: string
    url: string
    depth: number
  }>
}

export default function TOCSidebar({ toc }: TOCSidebarProps) {
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)
  const headingsMapRef = useRef<Map<string, HTMLElement>>(new Map())
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<number | undefined>(undefined)
  const userClickedRef = useRef(false)
  const lastActiveIdRef = useRef<string>('')
  const setActiveIdTimeoutRef = useRef<number | undefined>(undefined)

  // 智能设置activeId，保证始终有高亮但减少闪烁
  const smartSetActiveId = useCallback((newId: string) => {
    // 如果新的ID和当前ID相同，不需要更新
    if (newId === lastActiveIdRef.current) {
      return
    }

    // 清除之前的稳定性检查超时
    if (setActiveIdTimeoutRef.current) {
      window.clearTimeout(setActiveIdTimeoutRef.current)
    }

    // 立即更新高亮，确保始终有高亮状态
    lastActiveIdRef.current = newId
    setActiveId(newId)

    // 如果不是用户点击，设置一个短暂的稳定性检查
    if (!userClickedRef.current) {
      setActiveIdTimeoutRef.current = window.setTimeout(() => {
        // 100ms后再次确认，增加稳定性
      }, 100)
    }
  }, []) // 过滤1-3级标题
  const filteredToc = useMemo(
    () => toc.filter(heading => heading.depth >= 1 && heading.depth <= 3),
    [toc],
  )

  // 获取header高度
  const getHeaderHeight = useCallback(() => {
    try {
      const headerEl = document.querySelector('header') || document.querySelector('nav')
      if (headerEl) {
        const rect = headerEl.getBoundingClientRect()
        return rect.height
      }
      return 80 // 默认值
    } catch (_e) {
      return 80
    }
  }, [])

  // 查找并缓存标题元素
  const findAndCacheHeadings = useCallback(() => {
    const headingsMap = new Map<string, HTMLElement>()

    for (const heading of filteredToc) {
      const id = heading.url.substring(1) // 移除#号
      let element = document.getElementById(id)

      // 如果通过ID找不到，尝试通过文本内容查找
      if (!element) {
        const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        for (const h of allHeadings) {
          if (h.textContent?.trim() === heading.value.trim()) {
            element = h as HTMLElement
            // 如果找到了元素但没有id，给它设置一个id
            if (!element.id) {
              element.id = id
            }
            break
          }
        }
      }

      if (element) {
        headingsMap.set(id, element)
      }
    }

    headingsMapRef.current = headingsMap
    return headingsMap
  }, [filteredToc])

  // 使用Intersection Observer监听标题元素
  useEffect(() => {
    if (filteredToc.length === 0) return

    // 清理之前的observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // 查找并缓存标题元素
    const headingsMap = findAndCacheHeadings()

    if (headingsMap.size === 0) {
      // 如果没有找到标题元素，延迟重试
      const retryTimer = setTimeout(() => {
        const retryMap = findAndCacheHeadings()
        if (retryMap.size > 0) {
          setupObserver(retryMap)
        }
      }, 1000)

      return () => clearTimeout(retryTimer)
    }

    const setupObserver = (headingsMap: Map<string, HTMLElement>) => {
      const headerHeight = getHeaderHeight()

      // 创建Intersection Observer
      observerRef.current = new IntersectionObserver(
        entries => {
          // 如果用户刚点击了目录项，短时间内忽略observer事件
          if (userClickedRef.current) {
            return
          }

          // 获取当前在视口中的标题
          const visibleHeadings = entries
            .filter(entry => entry.isIntersecting)
            .map(entry => ({
              id: entry.target.id,
              element: entry.target as HTMLElement,
              boundingRect: entry.boundingClientRect,
              intersectionRatio: entry.intersectionRatio,
            }))

          if (visibleHeadings.length > 0) {
            // 按照距离视口顶部的距离排序，选择最接近顶部的
            visibleHeadings.sort((a, b) => {
              const aDistance = Math.abs(a.boundingRect.top - headerHeight)
              const bDistance = Math.abs(b.boundingRect.top - headerHeight)
              return aDistance - bDistance
            })

            const closestHeading = visibleHeadings[0]
            smartSetActiveId(closestHeading.id)
          } else {
            // 如果没有标题在视口中，使用滚动位置来判断
            if (!isScrollingRef.current) {
              updateActiveIdByScroll()
            }
          }
        },
        {
          // 设置根边距，考虑header高度
          rootMargin: `-${headerHeight + 10}px 0px -40% 0px`,
          threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
        },
      )

      // 观察所有标题元素
      headingsMap.forEach(element => {
        if (observerRef.current) {
          observerRef.current.observe(element)
        }
      })
    }

    // 根据滚动位置更新activeId - 确保始终有一个标题高亮
    const updateActiveIdByScroll = () => {
      // 如果用户刚点击了目录项，不要立即更新
      if (userClickedRef.current) {
        return
      }

      const scrollY = window.scrollY
      const headerHeight = getHeaderHeight()
      const viewportTop = scrollY + headerHeight + 20

      // 检查是否滚动到底部
      if (scrollY + window.innerHeight >= document.documentElement.scrollHeight - 50) {
        const headingIds = Array.from(headingsMapRef.current.keys())
        if (headingIds.length > 0) {
          smartSetActiveId(headingIds[headingIds.length - 1])
        }
        return
      }

      // 获取所有标题的位置信息，按位置排序
      const headingPositions: Array<{ id: string; top: number; element: HTMLElement }> = []

      headingsMapRef.current.forEach((element, id) => {
        const rect = element.getBoundingClientRect()
        const elementTop = scrollY + rect.top
        headingPositions.push({
          id,
          top: elementTop,
          element,
        })
      })

      // 按位置排序
      headingPositions.sort((a, b) => a.top - b.top)

      // 找到当前应该高亮的标题
      let activeHeadingId = ''

      // 从上到下查找，找到最后一个位置在viewportTop之上的标题
      for (let i = 0; i < headingPositions.length; i++) {
        const heading = headingPositions[i]

        if (heading.top <= viewportTop) {
          activeHeadingId = heading.id
        } else {
          // 如果当前标题在viewportTop之下，停止查找
          break
        }
      }

      // 如果没有找到任何标题在viewportTop之上，默认选择第一个标题
      if (!activeHeadingId && headingPositions.length > 0) {
        activeHeadingId = headingPositions[0].id
      }

      // 更新高亮
      if (activeHeadingId) {
        smartSetActiveId(activeHeadingId)
      }
    }

    setupObserver(headingsMap)

    // 添加滚动监听作为fallback，并检测滚动状态
    let scrollTimer: number | undefined
    const handleScroll = () => {
      // 标记正在滚动
      isScrollingRef.current = true

      // 清除之前的滚动超时
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current)
      }

      // 设置滚动结束标记
      scrollTimeoutRef.current = window.setTimeout(() => {
        isScrollingRef.current = false
      }, 150)

      if (scrollTimer) {
        window.clearTimeout(scrollTimer)
      }
      // 调整到150ms，平衡性能和平滑度
      scrollTimer = window.setTimeout(updateActiveIdByScroll, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // 初始化设置
    setTimeout(updateActiveIdByScroll, 300)

    // 清理函数
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimer) {
        window.clearTimeout(scrollTimer)
      }
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current)
      }
      if (setActiveIdTimeoutRef.current) {
        window.clearTimeout(setActiveIdTimeoutRef.current)
      }
    }
  }, [filteredToc, getHeaderHeight, findAndCacheHeadings])

  // 处理点击事件
  const handleClick = useCallback(
    (_e: React.MouseEvent, heading: (typeof filteredToc)[0]) => {
      _e.preventDefault()

      // 标记用户点击了目录项
      userClickedRef.current = true

      const targetId = heading.url.substring(1)
      let targetElement = headingsMapRef.current.get(targetId)

      if (!targetElement) {
        // 重新查找元素
        const foundElement = document.getElementById(targetId)
        if (foundElement) {
          targetElement = foundElement
        } else {
          const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
          for (const h of allHeadings) {
            if (h.textContent?.trim() === heading.value.trim()) {
              targetElement = h as HTMLElement
              if (!targetElement.id) {
                targetElement.id = targetId
              }
              headingsMapRef.current.set(targetId, targetElement)
              break
            }
          }
        }
      }
      if (targetElement) {
        const headerHeight = getHeaderHeight()
        const targetRect = targetElement.getBoundingClientRect()
        const targetY = window.scrollY + targetRect.top - headerHeight - 20

        // 平滑滚动到目标位置
        window.scrollTo({
          top: Math.max(targetY, 0),
          behavior: 'smooth',
        })

        // 立即设置激活状态（点击时直接设置，不使用防抖）
        lastActiveIdRef.current = targetId
        setActiveId(targetId)

        // 在滚动完成后清除点击标记（减少到500ms，让自动高亮更快恢复）
        setTimeout(() => {
          userClickedRef.current = false
        }, 500)
      } else {
        // 如果找不到元素，立即清除点击标记
        userClickedRef.current = false
      }
    },
    [getHeaderHeight],
  )

  if (filteredToc.length === 0) return null

  return (
    <div className="hidden lg:block">
      <div className="fixed top-[7rem] right-0 max-h-[calc(100vh-9rem)] w-[20rem] overflow-y-auto bg-transparent p-6">
        <h3 className="mb-4 border-b border-gray-200 pb-2 text-base font-semibold tracking-wide text-gray-900 uppercase dark:border-gray-800 dark:text-gray-100">
          目录
        </h3>
        <nav>
          <ul className="space-y-2 text-sm">
            {filteredToc.map(heading => {
              const headingId = heading.url.substring(1)
              const isActive = activeId === headingId

              return (
                <li
                  key={heading.url}
                  className={`relative transition-all duration-300 ease-in-out ${
                    heading.depth === 2 ? 'ml-3' : heading.depth === 3 ? 'ml-6' : ''
                  }`}
                >
                  {/* 活跃状态的左侧指示线 - 添加动画 */}
                  <div
                    className={`bg-primary-600 dark:bg-primary-400 absolute top-0 -left-3 w-1 rounded-full transition-all duration-300 ease-in-out ${
                      isActive ? 'h-full scale-y-100 opacity-100' : 'h-0 scale-y-0 opacity-0'
                    }`}
                  />

                  <a
                    href={heading.url}
                    className={`block rounded-md px-3 py-2 text-sm transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 scale-105 transform font-medium'
                        : 'scale-100 transform text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                    }`}
                    onClick={_e => handleClick(_e, heading)}
                  >
                    <span className="transition-all duration-300 ease-in-out">{heading.value}</span>
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
