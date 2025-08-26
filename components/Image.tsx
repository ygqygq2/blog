'use client'

import NextImage, { ImageProps } from 'next/image'
import { usePathname } from 'next/navigation'

const basePath = process.env.BASE_PATH

const Image = ({ src, width, height, ...rest }: ImageProps) => {
  const pathname = usePathname()

  // 确保src是字符串类型
  const srcString = typeof src === 'string' ? src : ''

  // 处理blog文章中的相对路径图片
  if (srcString.startsWith('./') && pathname?.startsWith('/blog/')) {
    // 从当前路径提取文章信息：/blog/YYYY/MM/article-name/
    const pathMatch = pathname.match(/^\/blog\/(\d{4}\/\d{2}\/[^/]+)\/?$/)
    if (pathMatch) {
      const articlePath = pathMatch[1]
      // 转换相对路径
      const relativePath = srcString.substring(2) // 移除 './'

      // 在生产环境的动态模式下，优先尝试使用public目录的静态文件
      if (process.env.NODE_ENV === 'production' && process.env.EXPORT !== 'true') {
        // 尝试构建public路径
        const publicPath = `/blog-assets/${articlePath}/${relativePath}`

        // 对于没有指定尺寸的MDX图片，使用普通的img标签
        if (!width && !height) {
          return (
            <img
              src={publicPath}
              {...rest}
              style={{ maxWidth: '100%', height: 'auto' }}
              onError={e => {
                // 如果public路径失败，回退到API路径
                const target = e.target as HTMLImageElement
                const apiPath = `/api/blog-assets/${articlePath}/${relativePath}`
                if (target.src !== apiPath) {
                  target.src = apiPath
                }
              }}
            />
          )
        }

        return (
          <NextImage
            src={publicPath}
            width={width}
            height={height}
            {...rest}
            onError={() => {
              // 如果public路径失败，这里可以添加回退逻辑
              console.warn(`图片加载失败，尝试API路径: ${publicPath}`)
            }}
          />
        )
      } else {
        // 开发环境或静态模式，使用API路径
        const apiPath = `/api/blog-assets/${articlePath}/${relativePath}`

        if (!width && !height) {
          return <img src={apiPath} {...rest} style={{ maxWidth: '100%', height: 'auto' }} />
        }

        return <NextImage src={apiPath} width={width} height={height} {...rest} />
      }
    }
  }

  // 处理其他路径（绝对路径、外部链接等）
  return <NextImage src={`${basePath || ''}${src}`} width={width} height={height} {...rest} />
}

export default Image
