#!/usr/bin/env node

/**
 * 跨平台动态构建脚本包装器
 * 自动检测操作系统并运行对应的构建脚本
 */

import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import process from 'process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 检测操作系统
const isWindows = process.platform === 'win32'
const scriptName = isWindows ? 'build-dynamic.bat' : 'build-dynamic.sh'
const scriptPath = join(__dirname, scriptName)

console.log(`🖥️  检测到操作系统: ${process.platform}`)
console.log(`📜 执行构建脚本: ${scriptName}`)

// 执行对应的脚本
const command = isWindows ? scriptPath : 'bash'
const args = isWindows ? [] : [scriptPath]

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: isWindows,
  cwd: process.cwd(),
  env: {
    ...process.env,
    // 确保INIT_CWD被正确设置
    INIT_CWD: process.cwd()
  }
})

child.on('error', (error) => {
  console.error(`❌ 脚本执行错误: ${error.message}`)
  process.exit(1)
})

child.on('close', (code) => {
  console.log(`\n📊 构建脚本执行完成，退出代码: ${code}`)
  process.exit(code)
})