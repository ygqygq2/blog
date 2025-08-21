const { writeFileSync, readFileSync, readdirSync, statSync } = require('fs')
const path = require('path')
const matter = require('gray-matter')
const { slug } = require('github-slugger')

// 简化版本的内容生成脚本，直接读取文件而不依赖 TypeScript 模块

function getAllBlogPosts() {
  const blogDir = path.join(process.cwd(), 'data', 'blog')
  const posts = []

  function readDir(dir, basePath = '') {
    try {
      const files = readdirSync(dir)

      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = statSync(filePath)

        if (stat.isDirectory()) {
          readDir(filePath, path.join(basePath, file))
        } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
          const content = readFileSync(filePath, 'utf-8')
          const { data } = matter(content)

          const postSlug = path.join(basePath, file.replace(/\.(mdx?|md)$/, ''))

          posts.push({
            slug: postSlug.replace(/\\/g, '/'),
            title: data.title || '',
            date: data.date || '',
            tags: data.tags || [],
            draft: data.draft || false,
          })
        }
      }
    } catch (error) {
      console.log('Error reading directory:', dir, error.message)
    }
  }

  readDir(blogDir)
  return posts
}

function createTagCount() {
  const allBlogs = getAllBlogPosts()
  const tagCount = {}

  allBlogs.forEach((file) => {
    if (file.tags && (!file.draft || process.env.NODE_ENV !== 'production')) {
      file.tags.forEach((tag) => {
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
  console.log('Tag count generated...')
}

console.log('Generating content...')
createTagCount()
console.log('Content generation complete!')
