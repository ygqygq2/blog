#!/bin/bash

# 动态模式构建脚本
# 用于Vercel、服务器等动态部署环境

set -e  # 遇到错误立即退出

echo "🚀 开始动态模式构建..."

# 获取可用内存（GB）
if command -v free >/dev/null 2>&1; then
    AVAILABLE_MEM=$(free -g | awk '/^Mem:/{print $7}')
elif command -v vm_stat >/dev/null 2>&1; then
    # macOS
    FREE_PAGES=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
    AVAILABLE_MEM=$((FREE_PAGES * 4096 / 1024 / 1024 / 1024))
else
    AVAILABLE_MEM=4  # 默认假设4GB
fi

echo "💾 检测到可用内存: ${AVAILABLE_MEM}GB"

# 根据内存情况设置Node.js选项
if (( AVAILABLE_MEM < 3 )); then
    echo "⚠️  内存不足3GB，使用保守设置"
    export NODE_OPTIONS="--max_old_space_size=1536 --max-semi-space-size=64"
elif (( AVAILABLE_MEM < 6 )); then
    echo "📊 内存适中，使用标准设置" 
    export NODE_OPTIONS="--max_old_space_size=2048 --max-semi-space-size=96"
else
    echo "✅ 内存充足，使用优化设置"
    export NODE_OPTIONS="--max_old_space_size=3072 --max-semi-space-size=128"
fi

echo "🔧 Node.js 选项: $NODE_OPTIONS"

# 设置环境变量
export INIT_CWD=$PWD

# 确保不在静态模式
unset EXPORT
unset STATIC_MODE

echo "🔍 执行模式检查..."
npm run check-mode

if [ $? -ne 0 ]; then
    echo "❌ 模式检查失败"
    exit 1
fi

echo "📝 步骤 1: 生成内容索引..."
NODE_OPTIONS="--max_old_space_size=2048 --max-semi-space-size=64 --expose-gc" node scripts/generate-content.mjs

if [ $? -ne 0 ]; then
    echo "❌ 内容生成失败"
    exit 1
fi

echo "⏱️  等待内存释放..."
sleep 2

echo "🏗️  步骤 2: Next.js 构建..."
next build

if [ $? -ne 0 ]; then
    echo "❌ Next.js 构建失败"
    exit 1
fi

echo "⏱️  等待内存释放..."
sleep 1

echo "📦 步骤 3: 执行构建后处理..."
NODE_OPTIONS="--experimental-json-modules --max_old_space_size=512" node ./scripts/postbuild.mjs

if [ $? -ne 0 ]; then
    echo "❌ 构建后处理失败"
    exit 1
fi

echo "✅ 动态模式构建完成！"
echo ""
echo "📂 构建产物位置:"
echo "  .next/          - Next.js 构建文件"
echo "  public/         - 静态资源文件"
echo "  ├── blog-assets/  - 博客资源文件"
echo "  └── blog-assets-manifest.json - 资源清单"
echo ""
echo "🚀 启动生产服务器:"
echo "  npm run serve:dynamic"
echo ""
echo "🔍 验证服务器:"
echo "  curl -I http://localhost:3000"