# 动态构建脚本说明

## 概述

将 `build:dynamic` 命令从内联脚本改为独立的脚本文件，提供更好的维护性和跨平台兼容性。

## 新增文件

### 核心脚本
- `scripts/run-build-dynamic.mjs` - 跨平台包装器，自动选择对应系统的脚本
- `scripts/build-dynamic.sh` - Linux/Mac 构建脚本
- `scripts/build-dynamic.bat` - Windows 构建脚本

### 支持脚本
- `scripts/copy-blog-assets-dynamic.mjs` - 动态模式下的资源复制脚本
- `scripts/verify-build-dynamic.mjs` - 构建组件验证脚本

## 修改文件

### package.json
```json
{
  "scripts": {
    "build:dynamic": "cross-env npm run check-mode && node scripts/run-build-dynamic.mjs",
    "verify:dynamic": "node scripts/verify-build-dynamic.mjs"
  }
}
```

### 其他优化
- 修复了 `components/Image.tsx` 中的 TypeScript 类型错误
- 更新 `scripts/check-mode.mjs` 以验证新的脚本格式
- 优化 `scripts/postbuild.mjs` 支持动态模式下的资源复制
- 更新 ESLint 配置排除 scripts 目录

## 使用方法

### 构建命令
```bash
# 动态模式构建
npm run build:dynamic

# 验证构建组件
npm run verify:dynamic

# 启动生产服务器
npm run serve:dynamic
```

### 功能特性

1. **跨平台兼容** - 自动检测操作系统并运行对应脚本
2. **内存优化** - 根据可用内存动态调整 Node.js 参数
3. **错误处理** - 每个步骤都有错误检查和退出处理
4. **详细日志** - 提供构建过程的详细反馈

### 构建流程

1. **模式检查** - 验证当前环境配置
2. **内容生成** - 生成博客内容索引和搜索数据
3. **Next.js 构建** - 执行 Next.js 生产构建
4. **后处理** - RSS 生成和资源复制

### 资源优化

在动态模式生产环境中：
- 构建时将 blog 资源复制到 `public/blog-assets/`
- 生产环境优先使用静态文件（更快）
- 失败时自动降级到 API 路由（保障）

## 验证

运行验证脚本确保所有组件正常：
```bash
npm run verify:dynamic
```

该脚本会检查：
- ✅ 跨平台脚本包装器
- ✅ Linux/Mac 构建脚本  
- ✅ Windows 构建脚本
- ✅ 动态资源复制脚本
- ✅ 构建后处理脚本
- ✅ 优化的 Image 组件
- ✅ 优化的 API 路由

## 兼容性

- ✅ **Linux/macOS** - 使用 bash 脚本
- ✅ **Windows** - 使用 batch 脚本  
- ✅ **开发环境** - 保持 API 路由支持热更新
- ✅ **生产环境** - 静态文件优先，API 路由备用
- ✅ **容器部署** - 构建时预处理所有资源