# 常用命令参考

> 📋 **命令手册** - 开发和部署的所有常用命令

## 🔧 开发命令

### 基础开发
```bash
# 启动开发服务器（支持热重载）
pnpm dev

# 代码格式化和检查
pnpm lint
pnpm lint --fix

# 清理缓存和构建产物
pnpm clean
```

### 内容管理
```bash
# 生成内容索引
npm run generate:content

# 预加载内容缓存
npm run preload:content
```

## 🚀 构建命令

### 静态模式构建
```bash
# 构建静态版本（用于 GitHub Pages）
pnpm run build:static

# Windows 环境下构建
npm run build:static:win

# WSL 环境下构建
./scripts/build-wsl.sh
```

### 动态模式构建
```bash
# 构建动态版本（用于服务器部署）
pnpm run build:dynamic

# 启动生产服务器
pnpm run serve:dynamic

# 完整构建流程（包含资源复制）
npm run build:full:dynamic
```

## 📦 部署命令

### 本地服务器
```bash
# 启动生产模式服务器
pnpm serve

# 指定端口启动
PORT=8080 pnpm serve
```

### 环境检查
```bash
# 检查当前模式配置
npm run check-mode

# 验证动态构建是否正确
npm run verify:dynamic

# 测试动态模式功能
npm run test:dynamic
```

## 🔍 诊断命令

### 问题排查
```bash
# 查看端口占用
lsof -i :3000
netstat -tulpn | grep :3000

# 检查 Node.js 版本
node --version
npm --version
pnpm --version

# 内存使用情况
free -h
top -p $(pgrep node)
```

### 日志查看
```bash
# 查看构建日志
npm run build:dynamic 2>&1 | tee build.log

# PM2 日志管理
pm2 logs
pm2 logs --lines 100
```

## 🧹 维护命令

### 依赖管理
```bash
# 安装依赖
pnpm install

# 更新依赖
pnpm update

# 检查过时依赖
pnpm outdated

# 清理 node_modules
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 缓存清理
```bash
# 清理项目缓存
pnpm clean

# 清理 Next.js 缓存
rm -rf .next

# 清理构建产物
rm -rf out build
```

### 重置项目
```bash
# 完全重置（慎用）
pnpm clean
rm -rf node_modules pnpm-lock.yaml .next out
pnpm install
pnpm run build:dynamic
```

## 🛠️ 高级命令

### 性能分析
```bash
# 分析打包体积
pnpm analyze

# 性能监控
npm run monitor:performance
```

### 内容生成
```bash
# 生成 RSS 订阅
npm run generate:rss

# 复制博客资源
npm run copy:blog-assets
```

### Docker 部署
```bash
# 构建 Docker 镜像
docker build -t blog-app .

# 运行容器
docker run -p 3000:3000 blog-app

# 使用 docker-compose
docker-compose up -d
```

## 📊 监控命令

### 状态检查
```bash
# 服务状态检查
curl -f http://localhost:3000/api/health || echo "Service not responding"

# 检查构建产物
ls -la out/
ls -la .next/
```

### 系统资源
```bash
# 内存使用
NODE_OPTIONS="--max_old_space_size=4096" pnpm run build:dynamic

# 磁盘空间
df -h
du -sh node_modules .next out
```

---

## 💡 使用技巧

1. **设置别名**：将常用命令添加到 `.bashrc` 或 `.zshrc`
```bash
alias blog-dev="pnpm dev"
alias blog-build="pnpm run build:dynamic"
alias blog-serve="pnpm run serve:dynamic"
```

2. **环境变量**：创建 `.env.local` 文件管理本地配置

3. **快捷脚本**：使用 `package.json` 中的 `scripts` 字段自定义命令

4. **监控工具**：结合 `pm2` 或 `supervisor` 实现进程监控和自动重启