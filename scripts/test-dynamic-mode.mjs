#!/usr/bin/env node

/**
 * 动态模式构建流程测试脚本
 */

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync, statSync } from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

function testDynamicModeAssets() {
  console.log('🧪 测试动态模式资源处理...')
  
  const tests = [
    {
      name: 'public/blog-assets 目录存在',
      path: join(projectRoot, 'public', 'blog-assets'),
      test: (path) => existsSync(path) && statSync(path).isDirectory()
    },
    {
      name: 'blog-assets-manifest.json 存在',
      path: join(projectRoot, 'public', 'blog-assets-manifest.json'),
      test: (path) => existsSync(path) && statSync(path).isFile()
    },
    {
      name: 'API路由文件存在',
      path: join(projectRoot, 'app', 'api', 'blog-assets', '[...path]', 'route.ts'),
      test: (path) => existsSync(path) && statSync(path).isFile()
    },
    {
      name: 'Image组件存在',
      path: join(projectRoot, 'components', 'Image.tsx'),
      test: (path) => existsSync(path) && statSync(path).isFile()
    },
    {
      name: '动态资源复制脚本存在',
      path: join(projectRoot, 'scripts', 'copy-blog-assets-dynamic.mjs'),
      test: (path) => existsSync(path) && statSync(path).isFile()
    }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      if (test.test(test.path)) {
        console.log(`✅ ${test.name}`)
        passed++
      } else {
        console.log(`❌ ${test.name}`)
        failed++
      }
    } catch (error) {
      console.log(`❌ ${test.name} - 错误: ${error.message}`)
      failed++
    }
  }
  
  console.log(`\n📊 测试结果: ${passed} 通过, ${failed} 失败`)
  
  if (failed === 0) {
    console.log('🎉 所有测试通过！动态模式资源处理已正确配置。')
  } else {
    console.log('⚠️  存在问题，请检查失败的项目。')
  }
  
  return failed === 0
}

function showUsageInstructions() {
  console.log('\n📝 动态模式使用说明:')
  console.log('')
  console.log('1. 开发环境:')
  console.log('   npm run dev  # 使用API路由提供blog资源')
  console.log('')
  console.log('2. 构建生产版本:')
  console.log('   npm run build:dynamic  # 自动复制资源到public目录')
  console.log('')
  console.log('3. 启动生产服务器:')
  console.log('   npm run serve:dynamic  # 优先使用public静态文件')
  console.log('')
  console.log('4. 清理缓存:')
  console.log('   npm run clean  # 清理构建文件和缓存')
  console.log('')
  console.log('✨ 生产环境会自动优先使用static文件，失败时降级到API路由')
}

// 执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = testDynamicModeAssets()
  showUsageInstructions()
  
  process.exit(success ? 0 : 1)
}

export { testDynamicModeAssets }