# 老杨的博客

> 保持对技术的热爱

个人技术博客，基于 Next.js 15 构建，支持静态部署和动态部署两种模式。

🌐 **在线访问**: https://blog.ygqygq2.com

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm (推荐)

### 安装依赖

```bash
pnpm install
```

## 🔧 开发模式

### 动态模式开发 (推荐本地开发)

```bash
pnpm dev
```

**特性**:

- 🔄 热重载
- 🌐 服务端渲染 (SSR)
- 📧 订阅功能可用
- 🔍 动态搜索
- 📊 分析功能完整

访问: http://localhost:3000

## 📦 构建部署

### 静态模式构建 (GitHub Pages)

```bash
pnpm run build:static
```

**特性**:

- 📁 静态文件输出到 `out/` 目录
- 🚫 订阅功能自动禁用
- 📖 客户端分页
- 📄 RSS 订阅生成
- 🔍 静态搜索

**部署方式**:

- GitHub Pages
- Vercel
- Netlify
- 任何静态文件托管服务

### 动态模式构建 (服务器部署)

```bash
pnpm run build:dynamic
pnpm serve
```

**特性**:

- 🌐 完整的 Next.js 功能
- 📧 API 路由可用
- 🔍 服务端搜索
- 📊 实时分析

**部署方式**:

- Vercel (推荐)
- 自建服务器 + PM2
- Docker

## 📝 内容管理

### 文章结构

```
data/blog/
├── 2025/
│   ├── 08/
│   │   └── 2025-08-20-文章标题.mdx
└── ...
```

### 文章格式

```mdx
---
title: '文章标题'
date: '2025-08-20'
tags: ['标签1', '标签2']
draft: false
summary: '文章摘要'
---

文章内容...
```

### 添加新文章

1. 在 `data/blog/年份/月份/` 目录下创建 MDX 文件
2. 文件名格式: `YYYY-MM-DD-文章标题.mdx`
3. 添加 frontmatter 元数据
4. 编写文章内容

## 🎨 自定义配置

### 站点配置

编辑 `data/siteMetadata.cjs`:

```javascript
const siteMetadata = {
  title: '网站标题',
  author: '作者姓名',
  description: '网站描述',
  siteUrl: 'https://your-domain.com',
  // 更多配置...
}
```

### 导航配置

编辑 `data/headerNavLinks.ts`:

```typescript
const headerNavLinks = [
  { href: '/', title: '首页' },
  { href: '/blog', title: '博客' },
  { href: '/tags', title: '标签' },
  { href: '/projects', title: '项目' },
  { href: '/about', title: '关于' },
]
```

## 🔍 功能特性

### 双模式支持

| 功能        | 动态模式 | 静态模式 |
| ----------- | -------- | -------- |
| 🔄 热重载   | ✅       | ❌       |
| 📧 订阅功能 | ✅       | ❌       |
| 🔍 搜索功能 | ✅       | ✅       |
| 📖 分页功能 | ✅       | ✅       |
| 📄 RSS 订阅 | ✅       | ✅       |
| 📊 分析统计 | ✅       | ✅       |
| 🚀 部署方式 | 服务器   | 静态托管 |

### 技术栈

- **框架**: Next.js 15
- **样式**: Tailwind CSS
- **内容**: MDX
- **搜索**: KBar
- **分析**: Umami, Plausible, Google Analytics
- **部署**: GitHub Actions + GitHub Pages

## 🛠 开发工具

### 代码检查

```bash
pnpm lint
```

### 清理缓存

```bash
pnpm clean
```

### 分析构建

```bash
pnpm analyze
```

## 📊 性能优化

- 🎯 MDX 内容缓存
- 🖼️ 图片优化
- 📦 代码分割
- 🗜️ 压缩优化
- 💾 内存管理 (4GB 限制)

## 🚢 CI/CD

GitHub Actions 自动部署:

1. **触发**: 推送到 `main` 分支
2. **构建**: 使用静态模式构建
3. **部署**: 自动部署到 GitHub Pages

查看配置: `.github/workflows/deploy.yml`

## 📄 许可证

MIT License
