# 构建脚本优化说明

> 🔧 **重要更新** - 构建脚本和API路由管理的最新改进

## 📋 更新概述

### 主要变化

1. **API路由管理分离** - 从构建脚本中移除API目录的临时处理逻辑
2. **专用管理脚本** - 使用 `scripts/manage-api.sh` 统一管理API路由
3. **构建脚本简化** - `build-wsl.sh` 专注于构建流程，不再处理API目录
4. **错误处理优化** - 更清晰的错误提示和状态检查
5. **自动API路由管理** - 构建脚本现在会自动处理API路由的链接和取消链接

## 🔄 API路由管理机制

### 设计原理

项目采用**分离式API路由管理**，解决动静模式兼容问题：

- **源目录**: `api/` (项目根目录)
- **目标目录**: `app/api/` (Next.js App Router要求)
- **管理方式**: 软链接 (推荐) 或目录复制

### 管理命令

```bash
# 检查API路由状态
bash scripts/manage-api.sh status

# 启用动态模式 (创建软链接)
bash scripts/manage-api.sh link

# 禁用动态模式 (移除链接)
bash scripts/manage-api.sh unlink

# 初始化API开发环境
bash scripts/manage-api.sh init
```

### 状态说明

| 状态                | 描述                 | 适用模式 | 操作建议       |
| ------------------- | -------------------- | -------- | -------------- |
| 🔗 已链接（软链接） | `app/api` -> `api/`  | 动态模式 | 可以开发API    |
| 📁 已复制（目录）   | `app/api` 是独立目录 | 动态模式 | 建议改为软链接 |
| 📦 未链接           | `app/api` 不存在     | 静态模式 | 可以静态构建   |

## 🏗️ 构建流程优化

### 旧版本构建流程 (已过时)

```bash
# 旧版 build-wsl.sh (有问题的逻辑)
if [ "$EXPORT" = "true" ]; then
    mv app/api /tmp/blog-api-backup    # 临时移除
fi

# ... 构建过程 ...

# 清理函数中恢复API目录
if [ -d "/tmp/blog-api-backup" ]; then
    mv /tmp/blog-api-backup app/api    # 恢复API目录
fi
```

**问题**:

- 构建失败时可能无法恢复API目录
- 逻辑复杂，容易出错
- 与API管理脚本职责重叠

### 新版本构建流程 (推荐)

```bash
# 新版 build-wsl.sh (简化逻辑)
if [ "$EXPORT" = "true" ]; then
    echo "📦 静态构建模式：确保没有API路由"
    bash scripts/manage-api.sh unlink
else
    echo "🔗 动态构建模式：链接API路由"
    bash scripts/manage-api.sh link
fi
```

**优势**:

- 职责单一，只负责构建
- 自动处理API路由链接/取消链接
- 错误处理简单明确
- 依赖外部API管理脚本
- 更安全可靠

## ⚡ 快速修复指南

### 静态构建失败

```bash
# 问题: 静态构建时检测到API目录
# 错误信息: "检测到app/api目录，请先运行..."

# 解决方案 (现在自动处理)
pnpm run build:static
```

### 动态模式API不可用

```bash
# 问题: 动态模式下API路由404
# 症状: /api/health 返回404错误

# 解决方案 (现在自动处理)
pnpm run build:dynamic
pnpm run serve:dynamic
```

### API目录状态检查

```bash
# 检查当前状态
bash scripts/manage-api.sh status

# 输出示例:
# 📊 API 路由状态检查:
#   源目录: api ✅ 存在
#   目标目录: app/api ✅ 存在
#   类型: 软链接 -> ../../api
#   状态: 🔗 已链接（开发模式）
#   API数量: 2 个路由文件
```

## 🔧 开发工作流程

### 静态模式开发

```bash
# 1. 开发和测试
pnpm dev

# 2. 构建部署 (自动处理API路由)
pnpm run build:static
```

### 动态模式开发

```bash
# 1. 开发和测试
pnpm dev

# 2. 构建部署 (自动处理API路由)
pnpm run build:dynamic
pnpm run serve:dynamic
```

### 模式切换

```bash
# 手动切换模式
bash scripts/manage-api.sh unlink  # 切换到静态模式
bash scripts/manage-api.sh link    # 切换到动态模式
```

## 🚨 常见问题

### Q: 为什么不能直接删除API目录？

**A**: API源码在 `api/` 目录中，`app/api/` 只是软链接。删除 `app/api/` 不会丢失源码，但直接删除 `api/` 会导致源码丢失。

### Q: 软链接和目录复制有什么区别？

**A**:

- **软链接**: 实时同步，修改源文件立即生效，推荐用于开发
- **目录复制**: 独立副本，需要手动同步，占用额外存储空间

### Q: 构建失败后如何恢复？

**A**:

```bash
# 1. 检查API状态
bash scripts/manage-api.sh status

# 2. 根据需要的模式调整 (通常不需要手动操作)
bash scripts/manage-api.sh unlink  # 静态模式
# 或
bash scripts/manage-api.sh link    # 动态模式

# 3. 清理重建
pnpm clean
pnpm run build:static  # 或 build:dynamic
```

## 📚 相关文档

- [命令参考手册](../01-getting-started/02-commands-reference.md)
- [双模式架构设计](../03-architecture/01-run-mode-architecture.md)
- [部署方式概览](../02-deployment/00-deployment-overview.md)

---

💡 **建议**: 在开发过程中，建议使用 `bash scripts/manage-api.sh status` 命令定期检查API路由状态，确保当前模式配置正确。新的构建脚本会自动处理API路由的链接和取消链接，无需手动干预。
