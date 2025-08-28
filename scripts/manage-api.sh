#!/bin/bash

# API 路由管理脚本
# 用于在动态模式下管理 API 路由开发

API_SOURCE_DIR="api"
API_TARGET_DIR="app/api"

Show_Usage() {
    echo "用法: $0 {link|unlink|status|init}"
    echo ""
    echo "命令说明:"
    echo "  link   - 链接 API 路由到 app 目录（用于动态模式开发）"
    echo "  unlink - 移除 app 目录下的 API 路由（用于静态模式）"
    echo "  status - 检查 API 路由状态"
    echo "  init   - 初始化 API 开发环境"
    echo ""
    echo "示例:"
    echo "  $0 link     # 开始 API 开发"
    echo "  $0 unlink   # 切换到静态模式"
    echo "  $0 status   # 查看当前状态"
    echo "  $0 init     # 创建基础 API 结构"
}

Init_Api_Structure() {
    echo "🚀 初始化 API 开发环境..."
    
    if [ ! -d "$API_SOURCE_DIR" ]; then
        mkdir -p "$API_SOURCE_DIR"
        echo "✅ 创建 API 源目录: $API_SOURCE_DIR"
    fi
    
    # 创建示例 API 路由
    if [ ! -f "$API_SOURCE_DIR/health/route.ts" ]; then
        mkdir -p "$API_SOURCE_DIR/health"
        cat > "$API_SOURCE_DIR/health/route.ts" << 'EOF'
import { NextResponse } from 'next/server'

// 健康检查API - 用于验证动态模式服务状态
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: 'dynamic',
    version: '1.0.0'
  })
}
EOF
        echo "✅ 创建示例健康检查API: $API_SOURCE_DIR/health/route.ts"
    fi
    
    # 创建 API 开发说明
    if [ ! -f "$API_SOURCE_DIR/README.md" ]; then
        cat > "$API_SOURCE_DIR/README.md" << 'EOF'
# API 开发目录

这个目录包含所有动态模式下的API路由。

## 目录结构
```
api/
├── health/           # 健康检查API
│   └── route.ts
├── auth/            # 认证相关API (示例)
├── newsletter/      # 邮件订阅API (示例)
└── README.md        # 本文件
```

## 开发流程

1. **开始开发**: `bash scripts/manage-api.sh link`
2. **开发API**: 在 `api/` 目录下创建新的路由
3. **测试**: 使用 `pnpm dev` 启动开发服务器
4. **停止开发**: `bash scripts/manage-api.sh unlink`

## API 路由示例

### 基础路由
```typescript
// api/hello/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello from API!' })
}
```

### 动态路由
```typescript
// api/posts/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  return NextResponse.json({ postId: id })
}
```

## 注意事项

- 只在动态模式下使用API路由
- 静态构建时会自动排除这些路由
- 开发完成后记得运行 `unlink` 命令
EOF
        echo "✅ 创建API开发说明: $API_SOURCE_DIR/README.md"
    fi
    
    echo "🎉 API 开发环境初始化完成！"
    echo ""
    echo "下一步操作："
    echo "  1. 运行 'bash scripts/manage-api.sh link' 开始开发"
    echo "  2. 运行 'pnpm dev' 启动开发服务器"
    echo "  3. 访问 http://localhost:3000/api/health 测试API"
}

Link_Api() {
    echo "🔗 链接 API 路由到 app 目录..."
    
    if [ ! -d "$API_SOURCE_DIR" ]; then
        echo "❌ API 源目录不存在: $API_SOURCE_DIR"
        echo "💡 提示: 运行 '$0 init' 初始化API开发环境"
        exit 1
    fi
    
    if [ -e "$API_TARGET_DIR" ]; then
        echo "⚠️  目标位置已存在，先清理..."
        rm -rf "$API_TARGET_DIR"
    fi
    
    # 使用软链接（推荐）或复制
    if command -v ln &> /dev/null; then
        ln -s "../../$API_SOURCE_DIR" "$API_TARGET_DIR"
        echo "✅ API 路由已软链接到 $API_TARGET_DIR"
    else
        cp -r "$API_SOURCE_DIR" "$API_TARGET_DIR"
        echo "✅ API 路由已复制到 $API_TARGET_DIR"
    fi
    
    echo "🚀 现在可以开始 API 开发了！"
    echo "   运行 'pnpm dev' 启动开发服务器"
}

Unlink_Api() {
    echo "🗑️  移除 app 目录下的 API 路由..."
    
    if [ -e "$API_TARGET_DIR" ]; then
        rm -rf "$API_TARGET_DIR"
        echo "✅ API 路由已从 app 目录移除"
        echo "📦 现在可以进行静态构建了"
    else
        echo "ℹ️  app 目录下没有 API 路由"
    fi
}

Check_Status() {
    echo "📊 API 路由状态检查:"
    echo "  源目录: $API_SOURCE_DIR $([ -d "$API_SOURCE_DIR" ] && echo "✅ 存在" || echo "❌ 不存在")"
    echo "  目标目录: $API_TARGET_DIR $([ -L "$API_TARGET_DIR" ] || [ -d "$API_TARGET_DIR" ] && echo "✅ 存在" || echo "❌ 不存在")"
    
    if [ -L "$API_TARGET_DIR" ]; then
        echo "  类型: 软链接 -> $(readlink "$API_TARGET_DIR")"
        echo "  状态: 🔗 已链接（开发模式）"
    elif [ -d "$API_TARGET_DIR" ]; then
        echo "  类型: 目录"
        echo "  状态: 📁 已复制（开发模式）"
    else
        echo "  状态: 📦 未链接（静态模式）"
    fi
    
    # 检查是否有API文件
    if [ -d "$API_SOURCE_DIR" ]; then
        local api_count=$(find "$API_SOURCE_DIR" -name "route.ts" -o -name "route.js" | wc -l)
        echo "  API数量: $api_count 个路由文件"
    fi
}

case "$1" in
    "link")
        Link_Api
        ;;
        
    "unlink")
        Unlink_Api
        ;;
        
    "status")
        Check_Status
        ;;
        
    "init")
        Init_Api_Structure
        ;;
        
    *)
        Show_Usage
        exit 1
        ;;
esac
