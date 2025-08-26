# 常见问题与故障排除

> 🔧 **问题解决** - 快速定位和解决常见问题

## 🚨 紧急问题

### 网站无法访问
```bash
# 1. 检查服务状态
curl -f http://localhost:3000 || echo "服务未响应"

# 2. 检查端口占用
lsof -i :3000
netstat -tulpn | grep 3000

# 3. 重启服务
pm2 restart blog
# 或者
pnpm run serve:dynamic
```

### 构建失败
```bash
# 1. 清理缓存重试
pnpm clean
rm -rf .next node_modules
pnpm install
pnpm run build:dynamic

# 2. 检查内存
free -h
export NODE_OPTIONS="--max_old_space_size=4096"
```

## 💾 内存和性能问题

### 构建内存不足
**症状**：`JavaScript heap out of memory` 错误

**解决方案**：
```bash
# 临时增加内存限制
export NODE_OPTIONS="--max_old_space_size=4096"
pnpm run build:dynamic

# 永久设置（添加到 .bashrc）
echo 'export NODE_OPTIONS="--max_old_space_size=4096"' >> ~/.bashrc
source ~/.bashrc
```

### 构建速度慢
**症状**：构建时间超过10分钟

**优化方案**：
```bash
# 1. 清理缓存
pnpm clean

# 2. 使用并行构建
npm run build:dynamic -- --parallel

# 3. 检查系统资源
top
df -h
```

## 🔌 端口和网络问题

### 端口被占用
**症状**：`EADDRINUSE: address already in use :::3000`

**解决方案**：
```bash
# 1. 查找占用进程
lsof -ti:3000

# 2. 终止进程
kill -9 $(lsof -ti:3000)

# 3. 或使用不同端口
PORT=3001 pnpm run serve:dynamic
```

### 代理和防火墙
**症状**：外网无法访问，内网正常

**解决方案**：
```bash
# 1. 检查防火墙
sudo ufw status
sudo ufw allow 3000

# 2. 检查服务绑定
netstat -tulpn | grep 3000

# 3. 修改绑定地址
# 在启动命令中添加
HOST=0.0.0.0 PORT=3000 pnpm run serve:dynamic
```

## 📁 文件和权限问题

### 权限不足
**症状**：`EACCES: permission denied`

**解决方案**：
```bash
# 1. 检查文件权限
ls -la

# 2. 修复权限（慎用）
sudo chown -R $USER:$USER .
chmod -R 755 .

# 3. 使用正确用户运行
sudo -u $USER pnpm run build:dynamic
```

### 文件路径问题
**症状**：图片或资源404错误

**解决方案**：
```bash
# 1. 重新构建
pnpm run build:dynamic

# 2. 检查资源文件
ls -la public/blog-assets/
cat public/blog-assets-manifest.json

# 3. 手动复制资源
npm run copy:blog-assets
```

## 🔧 配置问题

### 环境变量不生效
**症状**：功能异常，如分析工具无数据

**解决方案**：
```bash
# 1. 检查环境变量文件
cat .env.local
cat .env.production

# 2. 验证变量加载
node -e "console.log(process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID)"

# 3. 重启服务加载新配置
pm2 restart blog
```

### 模式配置错误
**症状**：功能缺失或错误

**解决方案**：
```bash
# 1. 检查当前模式
npm run check-mode

# 2. 验证配置
cat lib/mode-config.ts

# 3. 重新构建正确模式
pnpm run build:dynamic
```

## 📦 依赖问题

### 依赖冲突
**症状**：安装或运行时错误

**解决方案**：
```bash
# 1. 清理依赖重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 2. 检查依赖版本
pnpm list
pnpm outdated

# 3. 修复依赖冲突
pnpm install --fix-conflicts
```

### 缺少依赖
**症状**：`Cannot find module` 错误

**解决方案**：
```bash
# 1. 安装缺失依赖
pnpm install

# 2. 检查 package.json
cat package.json | grep -A5 -B5 "missing-package"

# 3. 手动安装
pnpm add missing-package
```

## 🖥️ 平台特定问题

### Windows 问题
**路径分隔符错误**：
```bash
# 使用 Windows 专用脚本
npm run build:static:win
```

**PowerShell 权限**：
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### WSL 问题
**文件监听问题**：
```bash
# 使用 WSL 专用脚本
./scripts/build-wsl.sh

# 增加文件监听限制
echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### macOS 问题
**权限问题**：
```bash
# 避免使用 sudo 安装全局包
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

## 🔍 调试技巧

### 开启详细日志
```bash
# 详细构建日志
DEBUG=* pnpm run build:dynamic

# Next.js 调试模式
NODE_ENV=development pnpm run build:dynamic
```

### 性能分析
```bash
# 分析打包体积
pnpm analyze

# 检查内存使用
node --inspect-brk node_modules/.bin/next build
```

### 网络调试
```bash
# 检查 DNS 解析
nslookup domain.com

# 测试 HTTP 连接
curl -I http://localhost:3000
wget --spider http://localhost:3000
```

## 📞 获取帮助

### 自助诊断
1. 运行诊断脚本：`npm run verify:dynamic`
2. 查看错误日志：`pm2 logs`
3. 检查系统资源：`top`, `free -h`, `df -h`

### 问题反馈
收集以下信息：
- 操作系统和版本
- Node.js 和 pnpm 版本
- 错误信息和日志
- 重现步骤

### 社区资源
- Next.js 官方文档
- GitHub Issues
- Stack Overflow
- 开发者社区

---

## 📋 故障排除检查清单

### 基础检查
- [ ] Node.js 版本 >= 18
- [ ] 内存 >= 2GB 可用
- [ ] 磁盘空间充足
- [ ] 网络连接正常

### 环境检查
- [ ] 环境变量正确
- [ ] 端口未被占用
- [ ] 文件权限正确
- [ ] 依赖安装完整

### 服务检查
- [ ] 构建成功
- [ ] 服务启动正常
- [ ] 基础功能可用
- [ ] 监控和日志正常

💡 **提示**：大多数问题都可以通过清理缓存和重新构建解决。遇到问题时首先尝试 `pnpm clean && pnpm install && pnpm run build:dynamic`。