# 快速开始指南

> 🚀 **新手入门必读** - 5分钟上手博客系统

## 📋 环境要求

- **Node.js**: 18+ 版本
- **内存**: 建议 4GB+ 
- **包管理器**: 推荐使用 `pnpm`

## ⚡ 快速部署

### 方法一：本地开发模式
```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器
pnpm dev

# 3. 访问 http://localhost:3000
```

### 方法二：GitHub Pages 静态部署（推荐新手）
```bash
# 1. 构建静态版本
pnpm run build:static

# 2. 部署到 GitHub Pages
# 构建产物在 out/ 目录，可直接上传或使用 GitHub Actions
```

### 方法三：服务器动态部署
```bash
# 1. 构建动态版本
pnpm run build:dynamic

# 2. 启动生产服务器
pnpm run serve:dynamic

# 3. 访问 http://localhost:3000
```

## 🎯 部署方式选择

| 使用场景 | 推荐方式 | 优势 | 局限 |
|---------|---------|------|------|
| **个人博客** | 静态模式 + GitHub Pages | 免费、自动化、CDN加速 | 无后端功能 |
| **企业博客** | 动态模式 + VPS | 完整功能、可扩展 | 需要服务器 |
| **快速验证** | Vercel 部署 | 零配置、自动优化 | 有使用限制 |

## 📚 下一步

- 🔧 [完整部署指南](../02-deployment/01-dynamic-production-deployment.md) - 详细的生产环境部署
- 🏗️ [系统架构](../03-architecture/01-run-mode-architecture.md) - 了解双模式设计原理
- 🛠️ [常见问题](../04-troubleshooting/01-build-dynamic-scripts.md) - 问题排查和解决

## 🆘 遇到问题？

1. 查看 [故障排除文档](../04-troubleshooting/)
2. 运行诊断命令：`npm run verify:dynamic`
3. 检查构建日志和错误信息

---

💡 **提示**：初次使用建议先尝试本地开发模式，熟悉系统后再进行生产部署。