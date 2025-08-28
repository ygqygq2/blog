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

  // 防抖函数
  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  useEffect(() => {
    if (filteredToc.length === 0) return

    // 滚动处理函数
    const handleScroll = () => {
      // 每次滚动时重新查找所有标题元素，确保DOM更新后能正确获取
      const headingElements: { id: string; element: HTMLElement }[] = []
      filteredToc.forEach(heading => {
        const id = heading.url.substring(1) // 移除开头的 #
        const element = document.getElementById(id)
        if (element) {
          headingElements.push({ id, element })
        }
      })

      if (headingElements.length === 0) return

      // 获取当前视口信息
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // 调试信息
      // console.log('Scroll position:', scrollY, 'Window height:', windowHeight, 'Document height:', documentHeight);
      // console.log('Heading elements:', headingElements.map(h => ({ id: h.id, top: h.element.offsetTop })));

      // 如果已经滚动到页面底部，选中最后一个标题
      if (scrollY + windowHeight >= documentHeight - 5) {
        const lastHeading = headingElements[headingElements.length - 1]
        if (lastHeading && lastHeading.id !== activeId) {
          // console.log('Setting activeId to last heading:', lastHeading.id);
          setActiveId(lastHeading.id)
        }
        return
      }

      // 查找当前应该选中的标题
      let currentId = ''

      // 从后往前遍历，找到第一个在视口上方的标题
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const { id, element } = headingElements[i]
        const elementTop = element.offsetTop
        const elementBottom = elementTop + element.offsetHeight

        // 检查元素是否在视口中
        if (elementTop <= scrollY + 150) {
          currentId = id
          // console.log('Found active heading:', id, 'at top:', elementTop);
          break
        }
      }

      // 如果没有找到在视口上方的标题，则选中第一个
      if (!currentId && headingElements.length > 0) {
        currentId = headingElements[0].id
        // console.log('Setting activeId to first heading:', currentId);
      }

      if (currentId && currentId !== activeId) {
        // console.log('Active ID changed from', activeId, 'to', currentId);
        setActiveId(currentId)
      }
    }

    // 创建防抖版本的滚动处理函数
    const debouncedHandleScroll = debounce(handleScroll, 10)

    // 添加滚动事件监听器
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true })

    // 初始化时也调用一次
    handleScroll()

    return () => {
      // 移除滚动事件监听器
      window.removeEventListener('scroll', debouncedHandleScroll)
    }
  }, [filteredToc]) // 只依赖filteredToc，避免activeId变化时重新绑定事件

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

                    // 获取目标元素ID
                    const targetId = heading.url.substring(1)

                    // 尝试不同的查找方式
                    let targetElement = document.getElementById(targetId)

                    // 如果没找到，尝试查找h1-h6标签，可能ID格式有差异
                    if (!targetElement) {
                      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
                      for (let i = 0; i < headings.length; i++) {
                        const h = headings[i]
                        // 检查标题文本是否匹配
                        if (h.textContent === heading.value) {
                          targetElement = h as HTMLElement
                          break
                        }
                      }
                    }

                    if (targetElement) {
                      targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                      // 设置激活状态
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
