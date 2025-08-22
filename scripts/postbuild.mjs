/* eslint-disable */
import process from 'node:process'
import rss from './rss.mjs'

async function postbuild() {
  try {
    console.log('Starting post-build tasks...')
    await rss()
    console.log('Post-build tasks completed successfully')
  } catch (error) {
    console.error('Error during post-build tasks:', error)
    // 不要让构建失败，只是警告
    process.exit(0)
  }
}

postbuild()
