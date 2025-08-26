#!/usr/bin/env node

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

/**
 * 检查构建模式配置一致性
 */
function checkModeConfiguration() {
  console.log('🔍 检查构建模式配置...')
  
  const isStaticMode = process.env.EXPORT === 'true'
  console.log(`📋 当前模式: ${isStaticMode ? '静态模式' : '动态模式'}`)
  
  const warnings = []
  const errors = []
  
  // 检查环境变量
  const requiredEnvVars = isStaticMode 
    ? ['EXPORT', 'INIT_CWD']
    : ['INIT_CWD']
    
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`❌ 缺少必需的环境变量: ${envVar}`)
    }
  }
  
  // 检查 package.json 脚本
  try {
    const packageJsonPath = join(projectRoot, 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    
    const expectedScripts = {
      'build:static': 'npm run check-mode && bash scripts/build-wsl.sh',
      'build:dynamic': 'cross-env npm run check-mode && node scripts/run-build-dynamic.mjs'
    }
    
    for (const [scriptName, expectedCommand] of Object.entries(expectedScripts)) {
      if (packageJson.scripts[scriptName] !== expectedCommand) {
        warnings.push(`⚠️  脚本 ${scriptName} 可能已过期`)
      }
    }
  } catch (error) {
    errors.push(`❌ 无法读取 package.json: ${error.message}`)
  }
  
  // 输出检查结果
  if (errors.length > 0) {
    console.log('\n❌ 发现错误:')
    errors.forEach(error => console.log(`  ${error}`))
    process.exit(1)
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  发现警告:')
    warnings.forEach(warning => console.log(`  ${warning}`))
  }
  
  // 输出模式特性
  console.log('\n📊 当前模式功能:')
  if (isStaticMode) {
    console.log('  ✅ 静态文件生成')
    console.log('  ✅ RSS 订阅生成')
    console.log('  ✅ 搜索索引生成')
    console.log('  ❌ API 路由功能')
    console.log('  ❌ 订阅功能')
    console.log('  ✅ 分析脚本加载')
  } else {
    console.log('  ✅ 服务端渲染')
    console.log('  ✅ API 路由功能')
    console.log('  ✅ 订阅功能')
    console.log('  ✅ 动态搜索')
    console.log('  ❌ RSS 生成')
    console.log('  ✅ 分析脚本加载')
  }
  
  console.log('\n✅ 模式配置检查完成')
}

// 执行检查
checkModeConfiguration()