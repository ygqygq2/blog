/* eslint-disable */
import process from 'node:process'
import rss from './rss.mjs'

async function postbuild() {
  try {
    console.log('Starting post-build tasks...')

    // 先生成 RSS
    await rss()

    // 然后复制静态资源
    console.log('Copying blog assets...')
    const { default: copyAssets } = await import('./copy-assets.mjs')

    console.log('Post-build tasks completed successfully')
  } catch (error) {
    console.error('Error during post-build tasks:', error)
    // 不要让构建失败，只是警告
    process.exit(0)
  }
}

postbuild()
