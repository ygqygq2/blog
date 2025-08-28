'use client'

import { useEffect, useMemo, useState } from 'react'

interface TOCSidebarProps {
  toc: Array<{
    value: string
    url: string
    depth: number
  }>
}

export default function TOCSidebar({ toc }: TOCSidebarProps) {
  const [activeId, setActiveId] = useState<string>('')

  // 只过滤1-3级标题，并使用useMemo避免不必要的重新计算
  const filteredToc = useMemo(
    () => toc.filter(heading => heading.depth >= 1 && heading.depth <= 3),
    [toc],
  )

  useEffect(() => {
    if (filteredToc.length === 0) return

    // helper: compute header height (px) from CSS var --site-header-height
    const getHeaderHeightPx = () => {
      try {
        const val =
          getComputedStyle(document.documentElement).getPropertyValue('--site-header-height') ||
          '0px'
        const el = document.createElement('div')
        el.style.height = val
        el.style.position = 'absolute'
        el.style.visibility = 'hidden'
        document.body.appendChild(el)
        const h = el.getBoundingClientRect().height
        document.body.removeChild(el)
        return Math.round(h)
      } catch (e) {
        return 0
      }
    }

    // 改为使用防抖的 scroll/resize 监听来更新 activeId — 更兼容
    const getHeadingElements = () =>
      filteredToc
        .map(h => document.getElementById(h.url.substring(1)))
        .filter(Boolean) as HTMLElement[]

    const debounce = (fn: (...args: any[]) => void, wait = 100) => {
      let t: number | undefined
      return (...args: any[]) => {
        if (t) window.clearTimeout(t)
        t = window.setTimeout(() => fn(...args), wait)
      }
    }

    const updateActive = () => {
      const headingEls = getHeadingElements()
      if (headingEls.length === 0) return

      // 底部特殊处理
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 5) {
        const last = headingEls[headingEls.length - 1]
        if (last) setActiveId(last.id)
        return
      }

      const headerHeight = getHeaderHeightPx()

      // 从底部向上寻找第一个顶部位置小于等于 headerHeight + 8 的标题
      for (let i = headingEls.length - 1; i >= 0; i--) {
        const el = headingEls[i]
        const rect = el.getBoundingClientRect()
        if (rect.top <= headerHeight + 8) {
          if (el.id !== activeId) setActiveId(el.id)
          return
        }
      }

      // fallback 为第一个标题
      const first = headingEls[0]
      if (first && first.id !== activeId) setActiveId(first.id)
    }

    const debouncedUpdate = debounce(updateActive, 80)
    window.addEventListener('scroll', debouncedUpdate, { passive: true })
    window.addEventListener('resize', debouncedUpdate)

    // 初始化一次，确保初始高亮
    updateActive()

    return () => {
      window.removeEventListener('scroll', debouncedUpdate)
      window.removeEventListener('resize', debouncedUpdate)
    }
  }, [filteredToc])

  if (filteredToc.length === 0) return null

  return (
    <div className="hidden lg:block">
      <div className="fixed top-[7rem] right-0 max-h-[calc(100vh-9rem)] w-[20rem] overflow-y-auto bg-transparent p-6">
        <h3 className="mb-4 border-b border-gray-200 pb-2 text-base font-semibold tracking-wide text-gray-900 uppercase dark:border-gray-800 dark:text-gray-100">
          目录
        </h3>
        <nav>
          <ul className="space-y-3 text-base">
            {filteredToc.map(heading => (
              <li
                key={heading.url}
                className={`${heading.depth === 2 ? 'ml-3' : heading.depth === 3 ? 'ml-6' : ''} ${
                  activeId === heading.url.substring(1)
                    ? 'text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                }`}
              >
                <a
                  href={heading.url}
                  className={`block py-1 transition-colors duration-150 hover:underline`}
                  onClick={e => {
                    e.preventDefault()

                    const targetId = heading.url.substring(1)
                    let targetElement = document.getElementById(targetId)

                    if (!targetElement) {
                      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
                      for (let i = 0; i < headings.length; i++) {
                        const h = headings[i]
                        if (h.textContent === heading.value) {
                          targetElement = h as HTMLElement
                          break
                        }
                      }
                    }

                    if (targetElement) {
                      // 先计算目标滚动位置，扣除 header 高度，保证标题可见
                      const getHeaderHeightPx = () => {
                        try {
                          const val =
                            getComputedStyle(document.documentElement).getPropertyValue(
                              '--site-header-height',
                            ) || '0px'
                          const el = document.createElement('div')
                          el.style.height = val
                          el.style.position = 'absolute'
                          el.style.visibility = 'hidden'
                          document.body.appendChild(el)
                          const h = el.getBoundingClientRect().height
                          document.body.removeChild(el)
                          return Math.round(h)
                        } catch (e) {
                          return 0
                        }
                      }

                      const headerHeight = getHeaderHeightPx() + 8
                      const targetRect = targetElement.getBoundingClientRect()
                      const targetY = window.scrollY + targetRect.top - headerHeight

                      window.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' })

                      // 立刻设置激活状态，避免 smooth scroll 期间高亮延迟
                      setActiveId(targetId)
                    }
                  }}
                >
                  {heading.value}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
