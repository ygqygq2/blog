#!/bin/bash

# 博客项目深度清理脚本
# 用于清理所有缓存层级，避免内容错乱问题

set -e  # 遇到错误立即退出

echo "🧹 开始深度清理博客项目缓存..."

# 颜色定义
COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_NC='\033[0m' # No Color

# 打印带颜色的消息
Print_Status() {
    echo -e "${COLOR_BLUE}[INFO]${COLOR_NC} $1"
}

Print_Success() {
    echo -e "${COLOR_GREEN}[SUCCESS]${COLOR_NC} $1"
}

Print_Warning() {
    echo -e "${COLOR_YELLOW}[WARNING]${COLOR_NC} $1"
}

Print_Error() {
    echo -e "${COLOR_RED}[ERROR]${COLOR_NC} $1"
}

# 检查当前目录是否为博客项目根目录
Check_Project_Root() {
    if [[ ! -f "package.json" ]] || [[ ! -d "data/blog" ]]; then
        Print_Error "请在博客项目根目录下运行此脚本"
        exit 1
    fi
}

# 停止相关进程
Stop_Processes() {
    Print_Status "停止相关进程..."
    pkill -f "next\|node\|serve" || true
    sleep 2
}

# 清理Next.js缓存
Clean_Next_Cache() {
    Print_Status "清理Next.js缓存..."
    rm -rf .next
    rm -rf .swc
    rm -rf .tsbuildinfo
    # 注意：next-env.d.ts 是自动生成的文件，删除后Next.js会重新生成
    # 如果遇到TypeScript错误，请运行 'npx next dev' 或 'pnpm build' 重新生成
    rm -rf next-env.d.ts
}

# 清理输出目录
Clean_Output() {
    Print_Status "清理输出目录..."
    rm -rf out
    rm -rf _next
}

# 清理依赖缓存
Clean_Dependency_Cache() {
    Print_Status "清理依赖缓存..."
    rm -rf node_modules/.cache
    rm -rf node_modules/.pnpm-debug.log*
    rm -rf node_modules/.vite
}

# 清理生成的文件
Clean_Generated_Files() {
    Print_Status "清理生成的文件..."
    rm -f public/search.json
    rm -f public/search-enhanced.json
    rm -f public/search-meta.json
    rm -f public/search-metadata.json
    rm -f app/tag-data.json
    rm -f db.json
    rm -f sitemap.xml
    rm -f feed.xml
}

# 清理临时文件
Clean_Temp_Files() {
    Print_Status "清理临时文件..."
    find . -name "*.tmp" -delete 2>/dev/null || true
    find . -name "*.log" -delete 2>/dev/null || true
    find . -name ".DS_Store" -delete 2>/dev/null || true
    find . -name "Thumbs.db" -delete 2>/dev/null || true
    find . -name "*.swp" -delete 2>/dev/null || true
    find . -name "*.swo" -delete 2>/dev/null || true
    find . -name "*.bak" -delete 2>/dev/null || true
}

# 清理构建产物
Clean_Build_Artifacts() {
    Print_Status "清理构建产物..."
    rm -rf dist
    rm -rf build
    rm -rf .output
    rm -rf .vercel
    rm -rf .netlify
}

# 验证清理结果
Verify_Cleanup() {
    Print_Status "验证清理结果..."

    local issues_found=0

    # 检查主要缓存目录
    if [[ -d ".next" ]]; then
        Print_Warning ".next 目录仍存在"
        ((issues_found++))
    fi

    if [[ -d "out" ]]; then
        Print_Warning "out 目录仍存在"
        ((issues_found++))
    fi

    if [[ -d "node_modules/.cache" ]]; then
        Print_Warning "node_modules/.cache 目录仍存在"
        ((issues_found++))
    fi

    if [[ -f "public/search.json" ]]; then
        Print_Warning "public/search.json 仍存在"
        ((issues_found++))
    fi

    if [[ -f "app/tag-data.json" ]]; then
        Print_Warning "app/tag-data.json 仍存在"
        ((issues_found++))
    fi

    if [[ $issues_found -eq 0 ]]; then
        Print_Success "清理验证通过！"
    else
        Print_Warning "发现 $issues_found 个清理不完整的项目"
    fi
}

# 显示清理统计
Show_Stats() {
    Print_Status "清理统计:"

    # 计算清理的空间（估算）
    local cache_size=$(du -sh .next 2>/dev/null | cut -f1 || echo "0")
    local out_size=$(du -sh out 2>/dev/null | cut -f1 || echo "0")
    local node_cache_size=$(du -sh node_modules/.cache 2>/dev/null | cut -f1 || echo "0")

    echo "  - Next.js缓存: $cache_size"
    echo "  - 输出目录: $out_size"
    echo "  - 依赖缓存: $node_cache_size"
    echo "  - 生成文件: 已清理"
    echo "  - 临时文件: 已清理"
}

# 主函数
Main() {
    echo "🚀 博客项目深度清理工具 v1.0"
    echo "================================="

    Check_Project_Root

    # 显示清理前的状态
    echo ""
    Print_Status "清理前状态检查:"
    echo "  - Next.js缓存: $(du -sh .next 2>/dev/null | cut -f1 || echo '不存在')"
    echo "  - 输出目录: $(du -sh out 2>/dev/null | cut -f1 || echo '不存在')"
    echo "  - 依赖缓存: $(du -sh node_modules/.cache 2>/dev/null | cut -f1 || echo '不存在')"
    echo "  - 搜索索引: $(ls -la public/search.json 2>/dev/null | awk '{print $5}' || echo '不存在')"
    echo "  - 标签数据: $(ls -la app/tag-data.json 2>/dev/null | awk '{print $5}' || echo '不存在')"

    echo ""

    # 按顺序执行清理步骤
    Stop_Processes
    Clean_Next_Cache
    Clean_Output
    Clean_Dependency_Cache
    Clean_Generated_Files
    Clean_Temp_Files
    Clean_Build_Artifacts

    echo ""

    # 验证清理结果
    Verify_Cleanup

    echo ""

    # 显示统计信息
    Show_Stats

    echo ""
    Print_Success "深度清理完成！"
    Print_Status "建议：现在可以运行 'pnpm install && pnpm build' 重新构建项目"
    echo ""
}

# 运行主函数
Main "$@"
