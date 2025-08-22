#!/bin/bash

# WSL 环境下的安全构建脚本
echo "🖥️  WSL 环境下的博客构建脚本"

# 检查可用内存
AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.1f", $7/1024}')
echo "💾 可用内存: ${AVAILABLE_MEM}GB"

if (( $(echo "$AVAILABLE_MEM < 2.0" | bc -l) )); then
    echo "⚠️  警告: 可用内存不足 2GB，使用超保守设置"
    export NODE_OPTIONS="--max_old_space_size=512 --max-semi-space-size=32 --expose-gc"
    export BATCH_SIZE=2
elif (( $(echo "$AVAILABLE_MEM < 4.0" | bc -l) )); then
    echo "📉 可用内存 < 4GB，使用保守设置"
    export NODE_OPTIONS="--max_old_space_size=1024 --max-semi-space-size=64 --expose-gc"
    export BATCH_SIZE=3
else
    echo "✅ 内存充足，使用标准设置"
    export NODE_OPTIONS="--max_old_space_size=1536 --max-semi-space-size=96 --expose-gc"
    export BATCH_SIZE=5
fi

echo "🔧 Node.js 选项: $NODE_OPTIONS"

# 清理缓存
echo "🧹 清理构建缓存..."
rm -rf .next
rm -rf out
rm -rf public/search.json
rm -rf app/tag-data.json

# 设置环境变量
export INIT_CWD=$PWD
export EXPORT=true

# 分步骤构建
echo "📝 步骤 1: 生成内容索引..."
node scripts/generate-content.mjs

if [ $? -ne 0 ]; then
    echo "❌ 内容生成失败"
    exit 1
fi

echo "⏱️  等待内存释放..."
sleep 3

echo "🏗️  步骤 2: Next.js 构建..."
NODE_OPTIONS="--max_old_space_size=1024 --max-semi-space-size=64" next build

if [ $? -ne 0 ]; then
    echo "❌ Next.js 构建失败"
    exit 1
fi

echo "⏱️  等待内存释放..."
sleep 2

echo "📰 步骤 3: 生成 RSS..."
NODE_OPTIONS="--experimental-json-modules --max_old_space_size=512" node ./scripts/postbuild.mjs

if [ $? -ne 0 ]; then
    echo "❌ RSS 生成失败"
    exit 1
fi

echo "🎉 构建完成！"
echo "📊 构建统计:"
echo "  - 输出目录: $(du -sh out 2>/dev/null || echo '未知')"
echo "  - 搜索索引: $(wc -l public/search.json 2>/dev/null | awk '{print $1}' || echo '0') 条记录"
echo "  - 标签数量: $(jq '. | length' app/tag-data.json 2>/dev/null || echo '0') 个"
