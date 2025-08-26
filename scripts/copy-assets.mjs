/* eslint-disable */
import process from 'node:process'

import fs from 'fs'
import path from 'path'

// 递归复制目录
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    return
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const files = fs.readdirSync(src)

  for (const file of files) {
    const srcPath = path.join(src, file)
    const destPath = path.join(dest, file)

    const stat = fs.statSync(srcPath)

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      // 只复制图片和其他静态资源文件
      const ext = path.extname(file).toLowerCase()
      const allowedExts = [
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.svg',
        '.webp',
        '.ico',
        '.pdf',
        '.zip',
        '.tar.gz',
      ]

      if (allowedExts.includes(ext)) {
        fs.copyFileSync(srcPath, destPath)
        console.log(`📸 复制资源: ${srcPath} -> ${destPath}`)
      }
    }
  }
}

// 扫描博客目录并复制资源到blog-assets目录
export default function copyBlogAssets() {
  console.log('🖼️  开始复制博客静态资源...')

  const blogDir = path.join(process.cwd(), 'data', 'blog')
  const outBlogAssetsDir = path.join(process.cwd(), 'out', 'blog-assets')

  if (!fs.existsSync(blogDir)) {
    console.log('❌ 博客目录不存在:', blogDir)
    return
  }

  // 确保输出目录存在
  if (!fs.existsSync(outBlogAssetsDir)) {
    fs.mkdirSync(outBlogAssetsDir, { recursive: true })
  }

  let copiedCount = 0

  // 遍历博客目录结构，复制资源到集中的blog-assets目录
  function traverseBlogDir(currentPath, relativePath = '') {
    const files = fs.readdirSync(currentPath)

    for (const file of files) {
      const fullPath = path.join(currentPath, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        const newRelativePath = path.join(relativePath, file)

        // 如果是年份/月份/文章 结构，则复制资源
        if (file.match(/^\d{4}$/) || file.match(/^\d{2}$/) || file.startsWith('20')) {
          traverseBlogDir(fullPath, newRelativePath)
        } else if (file === 'images' || file === 'assets' || file === 'files') {
          // 找到资源目录，复制到集中的blog-assets目录
          const outPath = path.join(outBlogAssetsDir, relativePath, file)
          copyDir(fullPath, outPath)
          copiedCount++
        }
      }
    }
  }

  traverseBlogDir(blogDir)
  console.log(`✅ 静态资源复制完成，共复制 ${copiedCount} 个资源目录`)
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  copyBlogAssets()
}
