#!/usr/bin/env node

/**
 * AI搜索快速体验脚本
 * 演示如何集成AI搜索功能到博客系统
 */

import OpenAI from 'openai'
import { readFileSync, existsSync } from 'fs'

// 检查环境配置
function checkEnvironment() {
  console.log('🔍 检查AI搜索环境配置...\n')

  const checks = [
    {
      name: 'OpenAI API Key',
      check: () => process.env.OPENAI_API_KEY,
      required: true,
    },
    {
      name: '搜索索引文件',
      check: () => existsSync('public/search.json'),
      required: true,
    },
    {
      name: '增强搜索索引',
      check: () => existsSync('public/search-enhanced.json'),
      required: false,
    },
  ]

  let allPassed = true

  checks.forEach(({ name, check, required }) => {
    const result = check()
    const status = result ? '✅' : required ? '❌' : '⚠️'
    console.log(`${status} ${name}: ${result ? '已配置' : '未配置'}`)

    if (required && !result) {
      allPassed = false
    }
  })

  return allPassed
}

// AI搜索演示
async function demonstrateAISearch() {
  if (!checkEnvironment()) {
    console.log('\n❌ 环境配置不完整，请检查配置后重试')
    process.exit(1)
  }

  console.log('\n🤖 开始AI搜索演示...\n')

  // 初始化OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  // 加载搜索索引
  const searchData = JSON.parse(readFileSync('public/search.json', 'utf-8'))
  console.log(`📚 加载了 ${searchData.length} 篇文章的索引`)

  // 演示查询
  const demoQueries = ['Kubernetes部署', 'Docker容器化', '前端性能优化', 'CI/CD自动化']

  for (const query of demoQueries) {
    console.log(`\n🔍 搜索: "${query}"`)

    try {
      // 1. 生成查询向量
      const queryEmbedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
      })

      console.log(`  📊 生成查询向量 (${queryEmbedding.data[0].embedding.length}维)`)

      // 2. 模拟相似度计算（简化版）
      const mockResults = searchData
        .filter(post => {
          const content = `${post.title} ${post.summary || ''} ${post.tags?.join(' ') || ''}`
          return (
            content.toLowerCase().includes(query.toLowerCase()) ||
            query
              .toLowerCase()
              .split(' ')
              .some(word => content.toLowerCase().includes(word))
          )
        })
        .slice(0, 3)
        .map(post => ({
          ...post,
          similarity: Math.random() * 0.3 + 0.7, // 模拟相似度 0.7-1.0
        }))
        .sort((a, b) => b.similarity - a.similarity)

      // 3. 展示结果
      if (mockResults.length > 0) {
        console.log(`  ✅ 找到 ${mockResults.length} 个相关结果:`)
        mockResults.forEach((result, index) => {
          console.log(
            `    ${index + 1}. ${result.title} (相似度: ${(result.similarity * 100).toFixed(1)}%)`,
          )
        })
      } else {
        console.log(`  ❌ 未找到相关结果`)
      }

      // 避免API限流
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.log(`  ❌ 搜索失败: ${error.message}`)
    }
  }

  console.log('\n🎉 AI搜索演示完成!')
  console.log('\n💡 下一步:')
  console.log('  1. 查看 docs/05-search-system/ 了解完整实现')
  console.log('  2. 运行 node scripts/generate-content.mjs 生成增强索引')
  console.log('  3. 集成 AI搜索组件到你的应用中')
}

// 主函数
async function main() {
  console.log('🚀 AI搜索功能体验工具\n')

  // 检查是否在正确的目录
  if (!existsSync('package.json')) {
    console.log('❌ 请在博客项目根目录下运行此脚本')
    process.exit(1)
  }

  try {
    await demonstrateAISearch()
  } catch (error) {
    console.error('\n❌ 演示过程中出现错误:', error.message)
    console.log('\n🔧 故障排除:')
    console.log('  1. 确保设置了 OPENAI_API_KEY 环境变量')
    console.log('  2. 确保网络连接正常')
    console.log('  3. 检查API密钥是否有效')
  }
}

// 运行
main().catch(console.error)
