#!/usr/bin/env node

/**
 * 开发模式下自动生成tag-data.json的脚本
 * 在开发服务器启动时运行，确保tag-data.json文件存在
 */

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function generateTagDataForDev() {
  console.log('🏷️  开发模式：检查tag-data.json文件...')

  try {
    // 创建一个空的tag-data.json文件（在开发模式下标签数据会动态加载）
    const emptyTagData = {}
    const tagDataPath = join(__dirname, '../app/tag-data.json')
    writeFileSync(tagDataPath, JSON.stringify(emptyTagData, null, 2))
    console.log('✅ 已创建空的tag-data.json文件')
  } catch (error) {
    console.warn('⚠️  tag-data.json创建失败:', error.message)
  }
}

// 直接运行时执行生成函数
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTagDataForDev().catch(error => {
    console.error('❌ 创建tag-data.json时出错:', error)
    process.exit(1)
  })
}

export default generateTagDataForDev
