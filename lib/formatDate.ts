export const formatDate = (date: string | Date, locale: string = 'zh-CN') => {
  if (!date) {
    console.warn('formatDate: 空日期')
    return ''
  }

  try {
    // 处理字符串日期
    let dateObj: Date
    if (typeof date === 'string') {
      // 处理各种日期格式
      if (date.includes('T') || date.includes('Z')) {
        // ISO 格式
        dateObj = new Date(date)
      } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD 格式
        dateObj = new Date(date + 'T00:00:00')
      } else {
        // 其他格式
        dateObj = new Date(date)
      }
    } else {
      dateObj = date
    }

    // 检查日期是否有效
    if (isNaN(dateObj.getTime())) {
      console.warn('formatDate: 无效日期', date)
      return String(date)
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }

    return dateObj.toLocaleDateString(locale, options)
  } catch (error) {
    console.error('formatDate 错误:', error, '日期:', date)
    return String(date)
  }
}
