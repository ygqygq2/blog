'use client'

import NextImage, { ImageProps } from 'next/image'
import { usePathname } from 'next/navigation'

const basePath = process.env.BASE_PATH

/**
 * 检测是否为相对图片路径
 * @param src 图片路径
 * @param pathname 当前页面路径
 * @returns 是否为相对图片路径
 */
function isRelativeImagePath(src: string, pathname: string | null): boolean {
  if (!src || !pathname) return false

  // 排除绝对路径和外部链接
  if (src.startsWith('http') || src.startsWith('//') || src.startsWith('/')) {
    return false
  }

  // 检查是否为图片文件扩展名
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
  const hasImageExtension = imageExtensions.some(ext =>
    src.toLowerCase().includes(ext.toLowerCase()),
  )

  // 如果有图片扩展名，并且在博客路径下，认为是相对图片路径
  return hasImageExtension && pathname.startsWith('/blog/')
}

const Image = ({ src, width, height, ...rest }: ImageProps) => {
  const pathname = usePathname()

  // 确保src是字符串类型
  const srcString = typeof src === 'string' ? src : ''

  // 处理blog文章中的相对路径图片
  if (
    (srcString.startsWith('./') || isRelativeImagePath(srcString, pathname)) &&
    pathname?.startsWith('/blog/')
  ) {
    // 从当前路径提取文章信息：/blog/YYYY/MM/article-name/
    const pathMatch = pathname.match(/^\/blog\/(\d{4}\/\d{2}\/[^/]+)\/?$/)
    if (pathMatch) {
      const articlePath = pathMatch[1]
      // 转换相对路径
      const relativePath = srcString.startsWith('./') ? srcString.substring(2) : srcString // 移除 './' 或直接使用

      // 所有模式下都使用统一的 /blog-assets 路径
      // 开发模式下通过 rewrites 重写到 API 路由
      // 静态模式下直接使用复制到 out/blog-assets 的静态资源
      const imagePath = `/blog-assets/${articlePath}/${relativePath}`

      if (!width && !height) {
        return <img src={imagePath} {...rest} style={{ maxWidth: '100%', height: 'auto' }} />
      }

      return <NextImage src={imagePath} width={width} height={height} {...rest} />
    }
  }

  // 处理其他路径（绝对路径、外部链接等）
  return <NextImage src={`${basePath || ''}${src}`} width={width} height={height} {...rest} />
}

export default Image
