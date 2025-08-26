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
