# 博客系统文档中心

## 📚 文档导航

### 🚀 快速开始

#### 开发模式
```bash
pnpm dev  # 本地开发，支持热重载
```

#### 生产部署选择

| 场景 | 模式 | 命令 | 适用环境 |
|------|------|------|----------|
| **GitHub Pages 免费托管** | 静态模式 | `pnpm run build:static` | 个人博客，无后端需求 |
| **服务器部署** | 动态模式 | `pnpm run build:dynamic` | VPS，需要完整功能 |
| **Vercel 部署** | 动态模式 | `pnpm run build:dynamic` | 快速部署，自动化 |

### 📖 详细文档

| 文档 | 内容 | 适用场景 |
|------|------|----------|
| **[动态模式生产部署指南](./dynamic-production-deployment.md)** | 完整的服务器部署教程 | 便于快速部署 |
| [双模式架构设计](./run-mode.md) | 系统架构和技术原理 | 了解系统设计 |
| [资源处理策略](./dynamic-assets-strategy.md) | 图片和资源优化方案 | 性能优化 |
| [构建脚本说明](./build-dynamic-scripts.md) | 构建流程技术细节 | 问题排查 |

---

## 🛠️ 常用命令

### 日常开发
```bash
pnpm dev                 # 开发服务器
pnpm lint                # 代码检查
pnpm clean               # 清理缓存
```

### 生产构建
```bash
# 静态模式（GitHub Pages）
pnpm run build:static

# 动态模式（服务器部署）
pnpm run build:dynamic
pnpm run serve:dynamic
```

### 验证和测试
```bash
npm run check-mode       # 检查当前模式配置  
npm run verify:dynamic   # 验证动态构建组件
```

---

## 🆘 快速故障排除

### 常见问题

| 问题 | 解决方案 |
|------|----------|
| **构建内存不足** | `export NODE_OPTIONS="--max_old_space_size=4096"` |
| **端口被占用** | `lsof -i :3000` 查看占用进程 |
| **环境变量不生效** | 检查 `.env.production` 文件 |
| **图片资源404** | 运行 `pnpm run build:dynamic` 重新构建 |
| **RSS订阅异常** | 检查 `public/feed.xml` 是否存在 |

### 重置和清理
```bash
# 完全重置项目
pnpm run clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run build:dynamic
```

---

## 📞 获得帮助

1. **查看详细部署指南**：[dynamic-production-deployment.md](./dynamic-production-deployment.md)
2. **检查系统状态**：`npm run verify:dynamic`  
3. **查看构建日志**：观察构建过程中的输出信息
4. **环境验证**：确保 Node.js 18+ 和足够的内存

> 💡 **提示**：大多数部署问题可以通过查看 [动态模式生产部署指南](./dynamic-production-deployment.md) 解决，该文档包含了完整的步骤说明和故障排除方法。
