# 博客系统文档中心

> 📚 **文档导航中心** - 快速找到您需要的文档和指南

## 🚀 新手入门

### 第一次使用？从这里开始

1. **[📖 快速开始指南](./01-getting-started/01-quick-start-guide.md)**
   - 5分钟快速上手
   - 环境要求和安装
   - 三种部署方式选择

2. **[📋 常用命令参考](./01-getting-started/02-commands-reference.md)**
   - 开发、构建、部署命令
   - 故障排除命令
   - 维护和优化命令

## 🚀 部署指南

### 选择合适的部署方式

1. **[📊 部署方式概览](./02-deployment/00-deployment-overview.md)**
   - 部署方式对比
   - 选择建议和清单
   - 快速部署脚本

2. **[🔧 动态模式生产部署](./02-deployment/01-dynamic-production-deployment.md)**
   - 完整的服务器部署教程
   - Vercel、VPS、Docker部署
   - 监控和维护指南

## 🏗️ 系统架构

### 深入了解系统设计

1. **[🎯 系统架构概览](./03-architecture/00-architecture-overview.md)**
   - 双模式架构设计
   - 技术栈和数据流
   - 性能优化策略

2. **[⚙️ 双模式架构详解](./03-architecture/01-run-mode-architecture.md)**
   - 静态vs动态模式
   - 技术实现原理
   - 配置和使用方法

3. **[🖼️ 动态资源处理策略](./03-architecture/02-dynamic-assets-strategy.md)**
   - 图片和资源优化
   - 缓存策略
   - 性能监控

## 🛠️ 故障排除

### 遇到问题？这里有解决方案

1. **[🚨 常见问题与解决方案](./04-troubleshooting/00-common-issues.md)**
   - 紧急问题快速解决
   - 内存、网络、权限问题
   - 平台特定问题

2. **[🔧 构建脚本详解](./04-troubleshooting/01-build-dynamic-scripts.md)**
   - 构建流程技术细节
   - 脚本调试方法
   - 高级故障排除

3. **[🔄 构建脚本优化说明](./04-troubleshooting/02-build-script-improvements.md)** 🆕
   - API路由管理机制优化
   - 构建流程简化和改进
   - 快速修复指南

## 🔍 搜索系统

### 从基础搜索到AI增强的完整方案

1. **[📖 搜索系统概览](./05-search-system/00-search-overview.md)**
   - 搜索架构设计
   - 技术选型对比
   - 性能指标分析

2. **[⚙️ 增强搜索实现](./05-search-system/01-enhanced-search-implementation.md)** 🆕
   - 中文分词优化
   - 随机排序机制
   - 结构化内容索引

3. **[🧠 AI搜索集成方案](./05-search-system/03-ai-search-integration.md)** 🆕
   - 静态模式AI预处理
   - 动态模式实时AI增强
   - 语义搜索实现

4. **[🔧 AI搜索实现指南](./05-search-system/04-ai-search-implementation.md)** 🆕
   - 代码实现示例
   - 成本控制策略
   - 性能监控方案

---

## ⚡ 快速导航

### 按使用场景导航

| 我想要...        | 查看文档                                                            |
| ---------------- | ------------------------------------------------------------------- |
| **快速搭建博客** | [快速开始指南](./01-getting-started/01-quick-start-guide.md)        |
| **部署到服务器** | [动态模式部署](./02-deployment/01-dynamic-production-deployment.md) |
| **了解系统架构** | [架构概览](./03-architecture/00-architecture-overview.md)           |
| **解决构建问题** | [常见问题](./04-troubleshooting/00-common-issues.md)                |
| **优化搜索功能** | [搜索系统概览](./05-search-system/00-search-overview.md)            |
| **集成AI搜索**   | [AI搜索集成](./05-search-system/03-ai-search-integration.md)        |
| **查找命令**     | [命令参考](./01-getting-started/02-commands-reference.md)           |
| **选择部署方式** | [部署概览](./02-deployment/00-deployment-overview.md)               |

### 按经验水平导航

| 用户类型     | 推荐阅读路径                     |
| ------------ | -------------------------------- |
| **初学者**   | 快速开始 → 部署概览 → 常见问题   |
| **开发者**   | 架构概览 → 双模式详解 → 构建脚本 |
| **运维人员** | 部署指南 → 故障排除 → 命令参考   |

---

## 🔥 常用操作

### 开发环境

```bash
# 启动开发服务器
pnpm dev

# 代码检查和格式化
pnpm lint
```

### 快速部署

```bash
# GitHub Pages (静态)
bash scripts/manage-api.sh unlink  # 移除API路由
pnpm run build:static

# 服务器部署 (动态)
bash scripts/manage-api.sh link    # 启用API路由
pnpm run build:dynamic
pnpm run serve:dynamic
```

### 故障诊断

```bash
# 检查API路由状态
bash scripts/manage-api.sh status

# 检查系统状态
npm run verify:dynamic

# 清理重建
pnpm clean && pnpm install
```

---

## 📞 获得帮助

### 自助解决

1. 🔍 **搜索文档**: 使用 Ctrl+F 搜索关键词
2. 📋 **检查清单**: 按照文档中的检查清单逐项排查
3. 🔧 **运行诊断**: 使用 `npm run verify:dynamic` 自动检查

### 问题反馈

- 📝 收集错误信息和日志
- 💻 提供系统环境信息
- 🔄 描述重现步骤

### 社区资源

- 📖 [Next.js 官方文档](https://nextjs.org/docs)
- 💬 开发者社区和论坛
- 🐛 GitHub Issues

---

> 💡 **提示**: 建议先阅读 [快速开始指南](./01-getting-started/01-quick-start-guide.md) 来快速上手，然后根据具体需求查看相应的专题文档。
