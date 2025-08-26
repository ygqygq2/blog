import fs from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: pathSegments } = await params

    // 重构路径：预期格式为 [...path] = ['YYYY', 'MM', 'article-name', 'resource-type', 'filename']
    if (pathSegments.length < 5) {
      return new NextResponse('Invalid path format', { status: 400 })
    }

    const [year, month, articleName, resourceType, ...filenameSegments] = pathSegments
    const filename = filenameSegments.join('/')

    // 验证路径格式
    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
      return new NextResponse('Invalid date format', { status: 400 })
    }

    if (!['images', 'assets', 'files'].includes(resourceType)) {
      return new NextResponse('Invalid resource type', { status: 400 })
    }

    // 在动态模式的生产环境中，优先检查public目录中的静态文件
    if (process.env.NODE_ENV === 'production' && process.env.EXPORT !== 'true') {
      const publicPath = path.join(
        process.cwd(),
        'public',
        'blog-assets',
        year,
        month,
        articleName,
        resourceType,
        filename,
      )

      if (fs.existsSync(publicPath)) {
        console.log(`📁 从public目录提供文件: ${publicPath}`)
        const fileBuffer = fs.readFileSync(publicPath)
        const ext = path.extname(filename).toLowerCase()

        let contentType = 'application/octet-stream'
        switch (ext) {
          case '.png':
            contentType = 'image/png'
            break
          case '.jpg':
          case '.jpeg':
            contentType = 'image/jpeg'
            break
          case '.gif':
            contentType = 'image/gif'
            break
          case '.svg':
            contentType = 'image/svg+xml'
            break
          case '.webp':
            contentType = 'image/webp'
            break
          case '.ico':
            contentType = 'image/x-icon'
            break
          case '.pdf':
            contentType = 'application/pdf'
            break
          case '.zip':
            contentType = 'application/zip'
            break
          case '.tar.gz':
            contentType = 'application/gzip'
            break
        }

        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Length': fileBuffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      }
    }

    // 构建原始文件路径（fallback或开发模式）
    const filePath = path.join(
      process.cwd(),
      'data',
      'blog',
      year,
      month,
      articleName,
      resourceType,
      filename,
    )

    // 安全检查：确保文件路径在允许的目录内
    const blogDir = path.join(process.cwd(), 'data', 'blog')
    const resolvedPath = path.resolve(filePath)
    const resolvedBlogDir = path.resolve(blogDir)

    if (!resolvedPath.startsWith(resolvedBlogDir)) {
      return new NextResponse('Access denied', { status: 403 })
    }

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(filePath)
    const ext = path.extname(filename).toLowerCase()

    // 设置适当的Content-Type
    let contentType = 'application/octet-stream'
    switch (ext) {
      case '.png':
        contentType = 'image/png'
        break
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.gif':
        contentType = 'image/gif'
        break
      case '.svg':
        contentType = 'image/svg+xml'
        break
      case '.webp':
        contentType = 'image/webp'
        break
      case '.ico':
        contentType = 'image/x-icon'
        break
      case '.pdf':
        contentType = 'application/pdf'
        break
      case '.zip':
        contentType = 'application/zip'
        break
      case '.tar.gz':
        contentType = 'application/gzip'
        break
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control':
          process.env.NODE_ENV === 'development'
            ? 'no-cache'
            : 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving blog asset:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
