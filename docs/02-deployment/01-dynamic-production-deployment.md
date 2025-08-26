# 动态模式生产部署完整指南

## 目录

1. [概述](#概述)
2. [环境要求](#环境要求)
3. [本地开发与生产对比](#本地开发与生产对比)
4. [生产构建流程](#生产构建流程)
5. [服务器部署方案](#服务器部署方案)
6. [部署验证与监控](#部署验证与监控)
7. [常见问题与故障排除](#常见问题与故障排除)
8. [性能优化建议](#性能优化建议)

---

## 概述

动态模式是博客系统的服务端渲染（SSR）部署方案，适用于需要完整服务端功能的环境，如Vercel、自托管服务器等。与静态模式相比，动态模式支持：

- ✅ **完整API功能** - 订阅、联系表单等
- ✅ **服务端渲染** - 更好的SEO和首屏性能
- ✅ **实时内容更新** - 无需重新构建即可更新内容
- ✅ **动态路由处理** - 支持按需生成页面
- ✅ **后端集成** - 可集成数据库、外部API等

---

## 环境要求

### 最小系统要求

| 组件 | 要求 | 推荐 | 说明 |
|------|------|------|------|
| **Node.js** | ≥ 18.17.0 | 20.x LTS | 支持ES2022语法 |
| **内存** | ≥ 2GB | ≥ 4GB | 构建时需要更多内存 |
| **存储空间** | ≥ 1GB | ≥ 2GB | 包含node_modules和构建产物 |
| **网络带宽** | ≥ 10Mbps | ≥ 100Mbps | 影响首次部署速度 |

### 软件环境

```bash
# 检查Node.js版本（必须）
node --version  # 应显示 v18.17.0+

# 安装pnpm包管理器（推荐）
npm install -g pnpm@latest

# 检查可用内存
free -h  # Linux
vm_stat  # macOS

# 检查磁盘空间
df -h
```

---

## 本地开发与生产对比

### 模式差异

| 方面 | 开发模式 (`pnpm dev`) | 生产模式 (`pnpm run build:dynamic`) |
|------|---------------------|----------------------------------|
| **运行方式** | Next.js 开发服务器 | 构建 + 生产服务器 |
| **性能** | 较慢，支持热重载 | 优化后的高性能版本 |
| **环境变量** | 支持 `.env.local` | 需要系统环境变量 |
| **错误处理** | 详细的错误页面 | 简洁的生产错误页面 |
| **资源优化** | 未优化 | 压缩、分块、优化 |
| **缓存策略** | 开发缓存 | 生产缓存策略 |

### 命令对比

```bash
# 🔥 开发模式（您当前使用的）
pnpm dev
# - 启动开发服务器
# - 支持热重载
# - 详细错误信息
# - 访问: http://localhost:3000

# 🚀 生产模式（部署到服务器用的）
pnpm run build:dynamic  # 构建
pnpm run serve:dynamic  # 启动生产服务器
# - 优化后的高性能版本
# - 压缩后的资源文件
# - 生产缓存策略
# - 访问: http://localhost:3000
```

---

## 生产构建流程

### 步骤1：准备环境

```bash
# 1. 克隆或更新代码
git clone <你的仓库地址>
cd blog

# 2. 确保使用正确的Node.js版本
node --version

# 3. 清理旧的依赖和构建文件
pnpm run clean

# 4. 安装依赖
pnpm install
```

### 步骤2：环境变量配置

创建生产环境配置文件：

```bash
# 创建生产环境变量文件
cat > .env.production << EOF
# 动态模式配置（EXPORT变量不设置或设为false）
# EXPORT=false

# 站点配置
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_PATH=

# 分析工具（可选）
NEXT_UMAMI_ID=your-umami-id
NEXT_PUBLIC_GISCUS_REPO=your-username/your-repo
NEXT_PUBLIC_GISCUS_REPO_ID=your-repo-id

# 其他API密钥（根据需要）
# DATABASE_URL=
# EMAIL_API_KEY=
EOF
```

### 步骤3：构建应用

```bash
# 🔍 验证构建环境
pnpm run verify:dynamic

# ✅ 如果验证通过，开始构建
pnpm run build:dynamic
```

构建过程详解：

```bash
# 构建流程包含以下步骤：

# 1. 模式检查
🔍 检查构建模式配置...
📋 当前模式: 动态模式

# 2. 内容生成（约1-2分钟）
📝 步骤 1: 生成内容索引...
✅ 总共找到 X 篇博客文章
🏷️  生成标签统计...
🔍 生成搜索索引...

# 3. Next.js构建（约30秒-1分钟）
🏗️  步骤 2: Next.js 构建...
✓ Compiled successfully

# 4. 后处理（约10-30秒）
📦 步骤 3: 执行构建后处理...
🖼️  动态模式：生成RSS和复制资源到public目录
```

### 构建成功标志

```bash
✅ 动态模式构建完成！

📂 构建产物位置:
  .next/          - Next.js 构建文件
  public/         - 静态资源文件
  ├── blog-assets/  - 博客资源文件
  └── blog-assets-manifest.json - 资源清单
```

---

## 服务器部署方案

### 方案1：Vercel部署（推荐）

**优势**：零配置、自动CI/CD、全球CDN、免费额度

```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署
vercel

# 4. 设置环境变量（在Vercel控制台）
# - NEXT_PUBLIC_SITE_URL
# - NEXT_UMAMI_ID (如果使用)
```

### 方案2：自托管服务器（VPS/云服务器）

#### 2.1 传统Node.js部署

```bash
# 1. 在服务器上准备环境
sudo apt update
sudo apt install -y nodejs npm nginx

# 2. 安装pnpm
npm install -g pnpm

# 3. 上传代码并构建
git clone <你的仓库>
cd blog
pnpm install
pnpm run build:dynamic

# 4. 使用PM2启动（推荐）
npm install -g pm2

# 创建PM2配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'blog',
    script: 'node_modules/.bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

#### 2.2 Docker部署

创建Dockerfile：

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm run build:dynamic

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# 自动利用output traces减小镜像大小
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Docker构建和运行：

```bash
# 构建Docker镜像
docker build -t blog:latest .

# 运行容器
docker run -d \
  --name blog \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=https://yourdomain.com \
  blog:latest

# 使用docker-compose（推荐）
cat > docker-compose.yml << EOF
version: '3.8'
services:
  blog:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SITE_URL=https://yourdomain.com
      - NODE_ENV=production
    restart: unless-stopped
EOF

# 启动
docker-compose up -d
```

#### 2.3 Nginx反向代理配置

```nginx
# /etc/nginx/sites-available/blog
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # 反向代理到Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态资源缓存
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /blog-assets/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

---

## 部署验证与监控

### 部署后验证清单

```bash
# 1. 基础连通性测试
curl -I http://localhost:3000
# 期望：HTTP/1.1 200 OK

# 2. 首页内容检查
curl http://localhost:3000 | grep -i "blog\|title"
# 期望：能看到页面标题和内容

# 3. API功能测试
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
# 期望：返回JSON响应

# 4. 静态资源测试
curl -I http://localhost:3000/blog-assets/2024/01/some-article/images/test.png
# 期望：能正确返回图片

# 5. RSS订阅测试
curl -I http://localhost:3000/feed.xml
# 期望：Content-Type: application/xml
```

### 性能监控

```bash
# 1. 进程监控（如果使用PM2）
pm2 status
pm2 logs blog --lines 50

# 2. 资源使用监控
htop
# 或
docker stats  # 如果使用Docker

# 3. 应用性能测试
npm install -g lighthouse
lighthouse http://yourdomain.com --only-categories=performance

# 4. 负载测试
npm install -g autocannon
autocannon -c 100 -d 30 http://localhost:3000
```

### 日志监控

```bash
# PM2日志
pm2 logs blog --lines 100 --timestamp

# Docker日志
docker logs blog -f

# 系统日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 常见问题与故障排除

### Q1: 构建时内存不足

```bash
# 症状：构建过程中出现 "JavaScript heap out of memory"
# 解决方案：
export NODE_OPTIONS="--max_old_space_size=4096"
pnpm run build:dynamic

# 或者修改package.json
{
  "scripts": {
    "build:dynamic:large": "cross-env NODE_OPTIONS='--max_old_space_size=4096' npm run build:dynamic"
  }
}
```

### Q2: 端口占用问题

```bash
# 症状：启动时提示端口3000被占用
# 查看占用进程：
lsof -i :3000
# 或
netstat -tlnp | grep :3000

# 解决方案1：杀掉占用进程
kill -9 <PID>

# 解决方案2：使用其他端口
PORT=3001 pnpm run serve:dynamic
```

### Q3: 环境变量不生效

```bash
# 症状：配置的环境变量在应用中读取不到
# 检查环境变量：
printenv | grep NEXT_

# 解决方案：确保环境变量正确设置
# 1. 检查.env.production文件
cat .env.production

# 2. 重启应用
pm2 restart blog

# 3. 验证变量加载
node -e "console.log(process.env.NEXT_PUBLIC_SITE_URL)"
```

### Q4: 静态资源404

```bash
# 症状：博客图片或资源文件无法访问
# 检查资源复制是否成功：
ls -la public/blog-assets/

# 检查资源清单：
head public/blog-assets-manifest.json

# 重新构建（清理缓存）：
pnpm run clean
pnpm run build:dynamic
```

### Q5: RSS或搜索功能异常

```bash
# 症状：RSS订阅或搜索功能不工作
# 检查生成的文件：
ls -la public/feed.xml
ls -la public/search.json

# 检查文件内容：
head public/feed.xml
head public/search.json

# 重新生成（如果文件缺失）：
node scripts/generate-content.mjs
```

---

## 性能优化建议

### 服务器级优化

```bash
# 1. 启用Gzip压缩（Nginx）
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# 2. 设置合适的缓存策略
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 3. 启用HTTP/2
listen 443 ssl http2;
```

### 应用级优化

```javascript
// next.config.mjs 优化配置
const nextConfig = {
  // 启用实验性功能
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  
  // 压缩配置
  compress: true,
  
  // 图片优化
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
  },
  
  // 构建优化
  swcMinify: true,
}
```

### 监控和告警

```bash
# 1. 设置Uptime监控
# 使用UptimeRobot、Pingdom等服务

# 2. 性能监控
# 集成Google Analytics、Umami等

# 3. 错误监控
# 使用Sentry、LogRocket等服务

# 4. 服务器监控
# 使用Prometheus + Grafana
```

---

## 总结

动态模式生产部署的关键要点：

1. **环境准备** - 确保Node.js 18+和足够的内存
2. **构建流程** - 使用 `pnpm run build:dynamic` 进行生产构建
3. **部署选择** - Vercel（简单）或自托管（灵活）
4. **监控验证** - 部署后进行全面的功能和性能测试
5. **持续维护** - 定期更新、监控和优化

通过本指南，您应该能够成功将博客系统部署到生产环境，并获得最佳的性能和稳定性。