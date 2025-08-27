import { promises as fs } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 处理博客文章路由
  if (pathname.startsWith('/blog/') && !pathname.endsWith('/') && !pathname.includes('.')) {
    // 如果是博客文章路径且没有尾随斜杠，添加斜杠
    const url = request.nextUrl.clone()
    url.pathname = pathname + '/'
    return NextResponse.redirect(url)
  }

  // 处理静态导出模式下的 .html 文件访问
  if (
    process.env.NODE_ENV === 'production' &&
    (process.env.EXPORT === 'true' || process.env.EXPORT === '1') &&
    pathname.startsWith('/blog/')
  ) {
    // 检查是否需要重写到 .html 文件
    if (pathname.endsWith('/')) {
      // 如果以斜杠结尾，检查对应的 .html 文件是否存在
      const htmlPath = pathname.slice(0, -1) + '.html'
      const url = request.nextUrl.clone()
      url.pathname = htmlPath
      return NextResponse.rewrite(url)
    }
  }

  // 动态模式下的blog资源优化：直接提供public目录的静态文件
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.EXPORT !== 'true' &&
    process.env.EXPORT !== '1'
  ) {
    // 处理blog-assets路径，直接从public目录提供
    if (pathname.startsWith('/blog-assets/')) {
      // 这个路径会由Next.js自动从public目录提供，无需特殊处理
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // 匹配所有路径除了 API 路由和 Next.js 系统文件，但包括 blog 目录下的静态资源
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
