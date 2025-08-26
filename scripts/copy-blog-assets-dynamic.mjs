#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

/**
 * 动态模式下的博客资源复制脚本
 * 将blog资源文件复制到public目录，以提高生产环境访问性能
 */

// 递归复制目录，保持相对路径结构
function copyDirWithStructure(src, dest, baseSrc = src) {
  if (!fs.existsSync(src)) {
    return []
  }

  const copiedFiles = []
  const files = fs.readdirSync(src)

  for (const file of files) {
    const srcPath = path.join(src, file)
    const stat = fs.statSync(srcPath)

    if (stat.isDirectory()) {
      // 递归处理子目录
      const subFiles = copyDirWithStructure(srcPath, dest, baseSrc)
      copiedFiles.push(...subFiles)
    } else {
      // 只复制允许的静态资源文件
      const ext = path.extname(file).toLowerCase()
      const allowedExts = [
        '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
        '.pdf', '.zip', '.tar.gz', '.mp4', '.webm', '.mp3', '.wav'
      ]

      if (allowedExts.includes(ext)) {
        // 计算相对路径
        const relativePath = path.relative(baseSrc, srcPath)
        const destPath = path.join(dest, relativePath)
        
        // 确保目标目录存在
        const destDir = path.dirname(destPath)
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true })
        }

        // 复制文件
        fs.copyFileSync(srcPath, destPath)
        copiedFiles.push({
          src: srcPath,
          dest: destPath,
          relativePath: relativePath.replace(/\\/g, '/')
        })
        
        console.log(`📸 复制资源: ${relativePath} -> public/blog-assets/${relativePath}`)
      }
    }
  }

  return copiedFiles
}

/**
 * 生成资源映射文件，用于API路由优化
 */
function generateAssetManifest(copiedFiles) {
  const manifest = {}
  
  for (const file of copiedFiles) {
    // 解析路径：YYYY/MM/article-name/images|assets|files/filename
    const pathParts = file.relativePath.split('/')
    if (pathParts.length >= 4) {
      const [year, month, articleName, resourceType, ...filenameParts] = pathParts
      const filename = filenameParts.join('/')
      
      if (/^\d{4}$/.test(year) && /^\d{2}$/.test(month) && ['images', 'assets', 'files'].includes(resourceType)) {
        const key = `${year}/${month}/${articleName}/${resourceType}/${filename}`
        manifest[key] = `/blog-assets/${file.relativePath}`
      }
    }
  }
  
  return manifest
}

/**
 * 主函数
 */
export default function copyBlogAssetsForDynamic() {
  console.log('🖼️  开始复制博客静态资源到public目录...')

  const blogDir = path.join(process.cwd(), 'data', 'blog')
  const publicBlogAssetsDir = path.join(process.cwd(), 'public', 'blog-assets')

  if (!fs.existsSync(blogDir)) {
    console.log('❌ 博客目录不存在:', blogDir)
    return
  }

  // 清理目标目录
  if (fs.existsSync(publicBlogAssetsDir)) {
    console.log('🧹 清理旧的blog-assets目录...')
    fs.rmSync(publicBlogAssetsDir, { recursive: true, force: true })
  }

  // 创建目标目录
  fs.mkdirSync(publicBlogAssetsDir, { recursive: true })

  // 复制资源文件
  const copiedFiles = copyDirWithStructure(blogDir, publicBlogAssetsDir)
  
  // 生成资源映射清单
  const manifest = generateAssetManifest(copiedFiles)
  const manifestPath = path.join(process.cwd(), 'public', 'blog-assets-manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  
  console.log(`✅ 复制完成！总共复制了 ${copiedFiles.length} 个资源文件`)
  console.log(`📋 生成资源清单: ${manifestPath}`)
  
  return { copiedFiles, manifest }
}

// 直接执行时运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  copyBlogAssetsForDynamic()
}