// 替代 pliny/utils/formatDate 的日期格式化函数

export const formatDate = (date: string, locale: string = 'zh-CN') => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  const now = new Date(date).toLocaleDateString(locale, options)

  return now
}
