/* eslint-disable */
import process from 'node:process'
import rss from './rss.mjs'

async function postbuild() {
  try {
    console.log('Starting post-build tasks...')

    const isStaticMode = process.env.EXPORT === 'true' || process.env.EXPORT === '1'

    if (isStaticMode) {
      // 静态模式：生成RSS + 复制到out目录
      console.log('📊 静态模式：生成RSS和复制资源到out目录')

      // 先生成 RSS
      await rss()

      // 然后复制静态资源到out目录
      console.log('Copying blog assets to out directory...')
      const { default: copyAssets } = await import('./copy-assets.mjs')
      await copyAssets()
    } else {
      // 动态模式：生成RSS + 复制到public目录
      console.log('🚀 动态模式：生成RSS和复制资源到public目录')

      // 先生成 RSS
      await rss()

      // 复制blog资源到public目录以提高访问性能
      console.log('Copying blog assets to public directory...')
      const { default: copyBlogAssetsDynamic } = await import('./copy-blog-assets-dynamic.mjs')
      await copyBlogAssetsDynamic()
    }

    console.log('Post-build tasks completed successfully')
  } catch (error) {
    console.error('Error during post-build tasks:', error)
    // 不要让构建失败，只是警告
    process.exit(0)
  }
}

postbuild()
