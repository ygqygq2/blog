# 04 AI搜索实现指南

> 🔧 **AI搜索集成实战** - 静态模式与动态模式的AI搜索实现

## 🚀 快速开始

### 1. 环境准备

```bash
# 安装AI依赖
pnpm add openai @huggingface/inference

# 配置环境变量
echo "OPENAI_API_KEY=your-key" >> .env.local
echo "HUGGINGFACE_TOKEN=your-token" >> .env.local
```

### 2. 静态模式：构建时AI预处理

#### 创建AI索引生成脚本

```javascript
// scripts/generate-ai-index.mjs
import OpenAI from 'openai'
import { writeFileSync } from 'fs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 生成AI增强索引
export async function generateAIIndex(posts) {
  console.log('🤖 开始生成AI增强索引...')

  const aiIndex = []

  for (const post of posts) {
    try {
      // 1. 生成语义向量
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: `${post.title}\n${post.summary || ''}\n${post.body.raw.slice(0, 2000)}`,
      })

      // 2. AI概念提取
      const analysis = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '提取技术文章的核心概念、难度等级和适用人群。返回JSON格式。',
          },
          {
            role: 'user',
            content: `标题：${post.title}\n摘要：${post.summary || ''}`,
          },
        ],
        response_format: { type: 'json_object' },
      })

      const concepts = JSON.parse(analysis.choices[0].message.content)

      aiIndex.push({
        slug: post.slug,
        title: post.title,
        embedding: embedding.data[0].embedding,
        ai_concepts: concepts.concepts || [],
        difficulty: concepts.difficulty || 'intermediate',
        audience: concepts.audience || ['developers'],
      })

      // 避免API限流
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`AI处理失败: ${post.title}`, error)
    }
  }

  // 保存AI索引
  writeFileSync('public/search-ai.json', JSON.stringify(aiIndex))
  console.log(`✅ AI索引生成完成: ${aiIndex.length} 篇文章`)
}
```

#### 集成到构建脚本

```javascript
// 在 scripts/generate-content.mjs 中添加
try {
  console.log('🤖 生成AI增强索引...')
  const { generateAIIndex } = await import('./generate-ai-index.mjs')
  await generateAIIndex(posts)
  console.log('✅ AI索引生成完成')
} catch (error) {
  console.log('⚠️ AI索引生成失败，继续使用基础索引:', error.message)
}
```

### 3. 动态模式：实时AI增强

#### 创建AI搜索API

```typescript
// app/api/search/ai/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    // 1. 生成查询向量
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    })

    // 2. 加载文章向量（从数据库或缓存）
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/search-ai.json`)
    const aiIndex = await response.json()

    // 3. 计算相似度
    const results = aiIndex
      .map(item => ({
        ...item,
        similarity: cosineSimilarity(queryEmbedding.data[0].embedding, item.embedding),
      }))
      .filter(item => item.similarity > 0.7)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)

    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ error: 'AI搜索失败' }, { status: 500 })
  }
}

function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}
```

### 4. AI搜索组件

```typescript
// components/search/AISearchModal.tsx
'use client'

import { useState, useEffect } from 'react'

export default function AISearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // AI搜索
  const performAISearch = async (searchQuery) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/search/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })

      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('AI搜索失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 防抖搜索
  useEffect(() => {
    const timeoutId = setTimeout(() => performAISearch(query), 500)
    return () => clearTimeout(timeoutId)
  }, [query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="flex items-start justify-center min-h-screen p-4 pt-16">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl dark:bg-gray-800">
          {/* 搜索输入 */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <span className="text-purple-500">🤖</span>
              <input
                type="text"
                placeholder="AI智能搜索..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            </div>
          </div>

          {/* 搜索结果 */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-gray-500">AI分析中...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="p-4 space-y-4">
                {results.map((result, index) => (
                  <div
                    key={result.slug}
                    className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      window.location.href = `/blog/${result.slug}`
                      onClose()
                    }}
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {result.title}
                    </h3>
                    <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                      <span>相似度: {(result.similarity * 100).toFixed(1)}%</span>
                      <span>•</span>
                      <span>难度: {result.difficulty}</span>
                    </div>
                    {result.ai_concepts && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {result.ai_concepts.slice(0, 3).map(concept => (
                          <span
                            key={concept}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="p-8 text-center text-gray-500">
                没有找到相关结果
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                输入关键词开始AI搜索
              </div>
            )}
          </div>

          {/* 底部提示 */}
          <div className="p-4 border-t bg-gray-50 dark:bg-gray-700">
            <p className="text-xs text-gray-500 text-center">
              由AI理解搜索意图，提供语义相关的搜索结果
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 💰 成本控制策略

### 静态模式成本优化

```javascript
// 批量处理降低成本
const BATCH_SIZE = 10
const DELAY_MS = 1000

for (let i = 0; i < posts.length; i += BATCH_SIZE) {
  const batch = posts.slice(i, i + BATCH_SIZE)
  await Promise.all(batch.map(post => processPost(post)))
  if (i + BATCH_SIZE < posts.length) {
    await new Promise(resolve => setTimeout(resolve, DELAY_MS))
  }
}
```

### 动态模式成本优化

```typescript
// 缓存AI结果
const cache = new Map()

async function cachedAISearch(query: string) {
  const cacheKey = `ai:${query.toLowerCase()}`

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  const result = await performAISearch(query)
  cache.set(cacheKey, result)

  return result
}
```

## 📊 监控与分析

### AI搜索性能监控

```typescript
// 添加搜索分析
const analytics = {
  searchCount: 0,
  avgResponseTime: 0,
  successRate: 0,
  topQueries: new Map(),
}

function trackSearch(query: string, responseTime: number, success: boolean) {
  analytics.searchCount++
  analytics.avgResponseTime = (analytics.avgResponseTime + responseTime) / 2
  analytics.successRate = success ? analytics.successRate + 0.1 : analytics.successRate - 0.1

  const count = analytics.topQueries.get(query) || 0
  analytics.topQueries.set(query, count + 1)
}
```

---

## 📖 相关文档

- **[AI搜索集成方案](./03-ai-search-integration.md)** - AI集成架构设计
- **[搜索配置指南](./02-search-configuration.md)** - 配置参数说明
- **[性能优化策略](./06-performance-optimization.md)** - 性能调优指南

---

> 💡 **提示**: 建议从静态模式开始，在验证效果后再考虑动态模式的实时AI增强。
