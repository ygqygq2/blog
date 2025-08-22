/* eslint-disable no-undef */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { slug } from 'github-slugger'
import matter from 'gray-matter'
import path from 'path'

// 内存优化：批量处理配置
const BATCH_SIZE = 5 // 每批处理5篇文章
const MEMORY_CLEANUP_INTERVAL = 10 // 每10批强制垃圾回收

// 简化版本的内容生成脚本，批量处理以节省内存
async function getAllBlogPostsOptimized() {
  const blogDir = path.join(process.cwd(), 'data', 'blog')
  const posts = []
  let processedCount = 0
  let batchCount = 0

  function forceGarbageCollection() {
    if (global.gc) {
      global.gc()
      console.log(`🧹 强制垃圾回收 - 已处理 ${processedCount} 篇文章`)
    }
  }

  async function processFilesBatch(files, dir, basePath = '') {
    console.log(`📦 批量处理: ${files.length} 个文件 (批次 ${++batchCount})`)

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE)

      for (const file of batch) {
        const filePath = path.join(dir, file)

        try {
          const stat = statSync(filePath)

          if (stat.isDirectory()) {
            const subFiles = readdirSync(filePath)
            await processFilesBatch(subFiles, filePath, path.join(basePath, file))
          } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
            console.log(`📄 处理文章: ${path.join(basePath, file)}`)

            const content = readFileSync(filePath, 'utf-8')
            const { data, content: bodyContent } = matter(content)

            const pathParts = basePath.split(path.sep).filter(Boolean)
            let postSlug = ''
            if (pathParts.length >= 2) {
              if (file === 'index.mdx' || file === 'index.md') {
                postSlug = pathParts.join('/')
              } else {
                postSlug = pathParts.join('/') + '/' + file.replace(/\.(mdx?|md)$/, '')
              }
            } else {
              postSlug = basePath
                ? path.join(basePath, file.replace(/\.(mdx?|md)$/, ''))
                : file.replace(/\.(mdx?|md)$/, '')
            }
            const relativePath = path.relative(blogDir, filePath)

            posts.push({
              slug: postSlug.replace(/\\/g, '/'),
              path: relativePath.replace(/\.(mdx?|md)$/, '').replace(/\\/g, '/'),
              title: data.title || '',
              date: data.date || '',
              tags: data.tags || [],
              draft: data.draft || false,
              summary: data.summary || '',
              lastmod: data.lastmod,
              images: data.images,
              author: data.author || 'default',
              authors: data.authors || ['default'],
              categories: data.categories || [],
              body: {
                raw: bodyContent.substring(0, 1000), // 限制内容长度
                code: bodyContent.substring(0, 1000),
              },
              filePath: relativePath.replace(/\\/g, '/'),
            })

            processedCount++
          }
        } catch (error) {
          console.log(`❌ 处理文件失败: ${filePath} - ${error.message}`)
        }
      }

      // 批处理完成后的内存清理
      if (batchCount % MEMORY_CLEANUP_INTERVAL === 0) {
        forceGarbageCollection()
        // 短暂暂停让系统释放内存
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }

  try {
    console.log('🚀 开始扫描博客目录:', blogDir)
    const files = readdirSync(blogDir)
    await processFilesBatch(files, blogDir)

    // 最终清理
    forceGarbageCollection()
  } catch (error) {
    console.log('❌ 博客目录读取失败:', blogDir, error.message)
  }

  console.log(`✅ 总共找到 ${posts.length} 篇博客文章`)
  return posts
}

async function main() {
  console.log('🚀 开始生成内容...')

  try {
    // 顺序执行，避免并发处理导致内存爆炸
    const posts = await getAllBlogPostsOptimized()

    // 生成标签统计
    console.log('🏷️  生成标签统计...')
    const tagCount = {}
    posts.forEach(file => {
      if (file.tags && (!file.draft || process.env.NODE_ENV !== 'production')) {
        file.tags.forEach(tag => {
          const formattedTag = slug(tag)
          if (formattedTag in tagCount) {
            tagCount[formattedTag] += 1
          } else {
            tagCount[formattedTag] = 1
          }
        })
      }
    })
    writeFileSync('./app/tag-data.json', JSON.stringify(tagCount, null, 2))
    console.log('✅ 标签统计完成:', Object.keys(tagCount).length, '个标签')

    // 生成搜索索引
    console.log('🔍 生成搜索索引...')
    const searchData = posts
      .filter(post => !post.draft || process.env.NODE_ENV !== 'production')
      .map(post => ({
        slug: post.slug,
        title: post.title,
        summary: post.summary || '',
        content: post.body.raw.substring(0, 500),
        tags: post.tags,
        date: post.date,
      }))
    writeFileSync('public/search.json', JSON.stringify(searchData, null, 2))
    console.log('✅ 搜索索引完成:', searchData.length, '篇文章')

    console.log('🎉 内容生成全部完成!')
  } catch (error) {
    console.error('❌ 内容生成失败:', error)
    process.exit(1)
  }
}

// 运行主函数
main()
