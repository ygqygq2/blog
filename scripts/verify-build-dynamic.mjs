#!/usr/bin/env node

/**
 * 验证动态构建脚本及相关组件
 */

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync, statSync } from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

console.log('🔍 验证动态构建脚本组件...')

const checks = [
  {
    name: '跨平台脚本包装器',
    path: join(projectRoot, 'scripts', 'run-build-dynamic.mjs'),
    test: (path) => existsSync(path) && statSync(path).isFile()
  },
  {
    name: 'Linux/Mac构建脚本',
    path: join(projectRoot, 'scripts', 'build-dynamic.sh'),
    test: (path) => existsSync(path) && statSync(path).isFile()
  },
  {
    name: 'Windows构建脚本',
    path: join(projectRoot, 'scripts', 'build-dynamic.bat'),
    test: (path) => existsSync(path) && statSync(path).isFile()
  },
  {
    name: '动态资源复制脚本',
    path: join(projectRoot, 'scripts', 'copy-blog-assets-dynamic.mjs'),
    test: (path) => existsSync(path) && statSync(path).isFile()
  },
  {
    name: '构建后处理脚本',
    path: join(projectRoot, 'scripts', 'postbuild.mjs'),
    test: (path) => existsSync(path) && statSync(path).isFile()
  },
  {
    name: '优化的Image组件',
    path: join(projectRoot, 'components', 'Image.tsx'),
    test: (path) => existsSync(path) && statSync(path).isFile()
  },
  {
    name: '优化的API路由',
    path: join(projectRoot, 'app', 'api', 'blog-assets', '[...path]', 'route.ts'),
    test: (path) => existsSync(path) && statSync(path).isFile()
  }
]

let passed = 0
let failed = 0

for (const check of checks) {
  try {
    if (check.test(check.path)) {
      console.log(`✅ ${check.name}`)
      passed++
    } else {
      console.log(`❌ ${check.name}`)
      failed++
    }
  } catch (error) {
    console.log(`❌ ${check.name} - 错误: ${error.message}`)
    failed++
  }
}

console.log('')
console.log(`📊 验证结果: ${passed} 通过, ${failed} 失败`)

if (failed === 0) {
  console.log('')
  console.log('🎉 所有组件验证通过！')
  console.log('')
  console.log('📋 使用指南:')
  console.log('1. 动态模式构建: npm run build:dynamic')
  console.log('2. 启动生产服务器: npm run serve:dynamic')
  console.log('3. 测试组件: node scripts/test-dynamic-mode.mjs')
  console.log('4. 验证构建: npm run check-mode')
  console.log('')
  console.log('💡 提示:')
  console.log('- 构建脚本会自动检测操作系统并选择正确的脚本')
  console.log('- 生产环境会优先使用public目录的静态文件')
  console.log('- 失败时会自动降级到API路由')
  
  process.exit(0)
} else {
  console.log('')
  console.log('⚠️  部分组件验证失败，请检查上述错误')
  process.exit(1)
}