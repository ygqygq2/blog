# 部署方式概览

> 🚀 **部署指南** - 选择最适合您的部署方式

## 📊 部署方式对比

| 部署方式 | 难度 | 成本 | 性能 | 功能完整性 | 维护成本 |
|---------|------|------|------|-----------|----------|
| **GitHub Pages** | ⭐ | 免费 | ⭐⭐⭐⭐ | 基础功能 | 极低 |
| **Vercel** | ⭐⭐ | 免费额度 | ⭐⭐⭐⭐⭐ | 完整功能 | 低 |
| **自托管VPS** | ⭐⭐⭐ | 月费制 | ⭐⭐⭐⭐ | 完整功能 | 中等 |
| **Docker容器** | ⭐⭐⭐⭐ | 灵活 | ⭐⭐⭐⭐ | 完整功能 | 中高 |

## 🎯 选择建议

### 个人博客（推荐 GitHub Pages）
- ✅ **适用场景**：技术博客、作品集、文档站点
- ✅ **优势**：完全免费、自动部署、CDN加速
- ❌ **局限**：无订阅功能、无后端API
- 📋 **要求**：GitHub账号、基础Git操作

```bash
# 快速部署到 GitHub Pages
pnpm run build:static
```

### 小型项目（推荐 Vercel）
- ✅ **适用场景**：个人项目、MVP验证、快速原型
- ✅ **优势**：零配置、自动优化、全球CDN
- ❌ **局限**：免费额度限制、vendor lock-in
- 📋 **要求**：GitHub/GitLab账号

```bash
# Vercel 部署
pnpm run build:dynamic
vercel --prod
```

### 企业应用（推荐自托管）
- ✅ **适用场景**：企业博客、内容管理、商业应用
- ✅ **优势**：完全控制、数据私有、可定制
- ❌ **局限**：需要运维、成本较高
- 📋 **要求**：VPS服务器、Linux基础

```bash
# 服务器部署
pnpm run build:dynamic
pm2 start ecosystem.config.js
```

### 高级部署（推荐 Docker）
- ✅ **适用场景**：微服务架构、容器化环境、集群部署
- ✅ **优势**：环境一致、易扩展、便于CI/CD
- ❌ **局限**：学习成本高、复杂性增加
- 📋 **要求**：Docker知识、容器编排经验

```bash
# Docker 部署
docker build -t blog .
docker run -p 3000:3000 blog
```

## 🔄 部署流程

### 第一次部署
1. **环境准备** → 安装 Node.js 18+、pnpm
2. **代码获取** → Clone 仓库、安装依赖
3. **配置调整** → 修改 `siteMetadata.cjs`
4. **构建部署** → 选择合适的构建命令
5. **验证测试** → 检查功能是否正常

### 日常更新
1. **内容更新** → 添加新文章或修改配置
2. **本地验证** → `pnpm dev` 预览效果
3. **构建部署** → 重新构建并部署
4. **监控检查** → 确认线上效果

## 📋 部署清单

### 部署前检查
- [ ] Node.js 版本 18+
- [ ] 内存 2GB+ 可用
- [ ] 网络连接正常
- [ ] 依赖安装完成
- [ ] 配置文件已修改

### 静态部署检查
- [ ] `pnpm run build:static` 成功
- [ ] `out/` 目录生成
- [ ] 静态文件完整
- [ ] 路径配置正确

### 动态部署检查
- [ ] `pnpm run build:dynamic` 成功
- [ ] `.next/` 目录生成
- [ ] 环境变量配置
- [ ] 端口未被占用
- [ ] 进程管理配置

## 🛠️ 快速部署脚本

### GitHub Pages 自动部署
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm run build:static
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

### PM2 生产部署
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'blog',
    script: 'npm',
    args: 'run serve:dynamic',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log'
  }]
}
```

## 🔗 下一步

- 📖 **详细部署指南**：[动态生产部署完整教程](./01-dynamic-production-deployment.md)
- 🏗️ **架构了解**：[系统架构设计](../03-architecture/01-run-mode-architecture.md)
- 🛠️ **问题排查**：[故障排除指南](../04-troubleshooting/)

---

💡 **建议**：首次部署建议先选择 GitHub Pages 方式熟悉流程，后续根据需求升级到动态部署。