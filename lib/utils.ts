/**
 * 通用工具函数库
 */

/**
 * 文本标准化函数 - 处理特殊字符的匹配
 * @param text 需要标准化的文本
 * @returns 标准化后的文本
 */
export function normalizeText(text: string): string {
  return (
    text
      .trim()
      .replace(/\s+/g, ' ')
      // 更严格的清理，保留中文字符和基本标点
      .replace(/[^\w\u4e00-\u9fa5\s.-_/]/g, '')
      .toLowerCase()
  )
}

/**
 * 增强的文本比较函数 - 支持多种匹配策略
 * @param text1 第一个文本
 * @param text2 第二个文本
 * @returns 是否匹配
 */
export function textMatches(text1: string, text2: string): boolean {
  // 原始文本比较
  if (text1.trim() === text2.trim()) return true

  // 标准化后比较
  const normalized1 = normalizeText(text1)
  const normalized2 = normalizeText(text2)

  // 完全匹配
  if (normalized1 === normalized2) return true

  // 特殊字符版本比较 - 移除所有非字母数字字符
  const strict1 = text1.replace(/[^\w\u4e00-\u9fa5]/g, '').toLowerCase()
  const strict2 = text2.replace(/[^\w\u4e00-\u9fa5]/g, '').toLowerCase()

  // 完全匹配（去除特殊字符后）
  if (strict1 === strict2) return true

  // 只有在文本长度差异不大的情况下才进行包含匹配，避免短词匹配长句
  const lengthRatio =
    Math.min(strict1.length, strict2.length) / Math.max(strict1.length, strict2.length)

  // 如果长度差异太大（比如一个是3个字符，一个是10个字符），则不进行包含匹配
  if (lengthRatio < 0.7) {
    return false
  }

  // 在长度相近的情况下，允许包含匹配，但需要更严格的条件
  // 只有当较短的文本是较长文本的完整词边界匹配时才允许
  const shorter = strict1.length <= strict2.length ? strict1 : strict2
  const longer = strict1.length > strict2.length ? strict1 : strict2

  // 检查较短的文本是否在较长文本的词边界上
  // 使用正则表达式确保是完整的词匹配
  const regex = new RegExp(
    `(^|[^\\w\\u4e00-\\u9fa5])${shorter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\w\\u4e00-\\u9fa5]|$)`,
    'i',
  )
  return regex.test(longer)
}

/**
 * 为元素设置唯一ID
 * @param element HTML元素
 * @param text 用于生成ID的文本
 * @returns 设置的ID
 */
export function ensureElementId(element: HTMLElement, text: string): string {
  if (!element.id) {
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    element.id = id
  }
  return element.id
}

/**
 * 获取页面滚动位置
 * @returns 滚动位置对象
 */
export function getScrollPosition() {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop,
  }
}

/**
 * 平滑滚动到指定元素
 * @param element 目标元素
 * @param offset 偏移量
 */
export function smoothScrollToElement(element: HTMLElement, offset: number = 0) {
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
  const offsetPosition = elementPosition - offset

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  })
}

/**
 * 防抖函数
 * @param func 需要防抖的函数
 * @param wait 等待时间
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 * @param func 需要节流的函数
 * @param limit 限制时间
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
