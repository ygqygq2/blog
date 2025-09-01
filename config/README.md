# 配置系统说明

本项目采用分层配置系统，将系统配置和用户配置分离，提供清晰的配置管理方式。

## 目录结构

```
config/
├── index.ts              # 主入口文件，统一导出所有配置接口
├── types/                # 类型定义目录
│   └── index.ts          # 所有 TypeScript 类型定义
└── system/               # 系统配置目录
    ├── defaults.ts       # 系统默认配置
    └── manager.ts        # 配置管理器
```

## 配置分层

### 1. 系统配置 (System Config)

- **位置**: `config/system/defaults.ts`
- **用途**: 项目的技术默认设置，开发者维护
- **内容**: 功能开关、性能参数、布局常量等

### 2. 用户配置 (User Config)

- **位置**: `data/siteMetadata.cjs`
- **用途**: 站点个性化设置，用户可修改
- **内容**: 站点信息、社交链接、第三方服务配置等

### 3. 运行时配置 (Runtime Config)

- **位置**: `lib/mode.ts`
- **用途**: 根据环境变量和构建模式动态生成
- **内容**: 静态/动态模式、API 路由配置等

## 使用方式

### 导入配置

```typescript
// 推荐：从主入口导入
import { getAppConfig, isFeatureEnabled, getTocConfig } from '@/config'

// 导入类型
import type { AppConfig, TocConfig, SiteMetadata } from '@/config'

// 导入常量
import { SYSTEM_CONFIG } from '@/config'
```

### 获取配置

```typescript
// 获取完整应用配置（合并后的最终配置）
const appConfig = getAppConfig()

// 检查功能是否启用
const tocEnabled = isFeatureEnabled('toc')

// 获取特定配置
const tocConfig = getTocConfig()

// 获取用户站点配置
const siteMetadata = getSiteMetadata() // 仅服务器端
```

### 配置优先级

1. **运行时模式** > **用户配置** > **系统默认配置**
2. 静态模式会覆盖某些功能（如禁用邮件订阅）
3. 用户可在 `siteMetadata.cjs` 中自定义设置
4. 系统默认值作为最后的保底

## 新旧对比

### 推荐用法

```typescript
// 统一的导入
import { DEFAULT_APP_CONFIG, DEFAULT_TOC_CONFIG, getAppConfig } from '@/config'
```

## 配置示例

### 系统配置示例

```typescript
// config/system/defaults.ts
export const DEFAULT_TOC_CONFIG: TocConfig = {
  enabled: true,
  showSidebar: true,
  maxDepth: 3,
  minHeadings: 2,
}
```

### 用户配置示例

```javascript
// data/siteMetadata.cjs
module.exports = {
  title: '我的博客',
  author: '作者名',
  theme: 'dark',
  // ... 其他用户设置
}
```

### 运行时使用示例

```typescript
// 组件中使用
export function BlogPost() {
  const tocConfig = getTocConfig()

  if (!isFeatureEnabled('toc')) {
    return <PostWithoutToc />
  }

  return (
    <PostWithToc
      showSidebar={tocConfig.showSidebar}
      maxDepth={tocConfig.maxDepth}
    />
  )
}
```

## 迁移指南

项目已完成配置系统重构，所有配置均通过统一入口访问：

1. **统一导入语句**

   ```typescript
   // 推荐的导入方式
   import { getAppConfig, isFeatureEnabled, getTocConfig } from '@/config'
   ```

2. **统一函数调用**

   ```typescript
   // 获取应用配置
   const appConfig = getAppConfig()

   // 检查功能状态
   const isEnabled = isFeatureEnabled('toc')
   ```

3. **类型导入**
   ```typescript
   // 统一的类型导入
   import type { AppConfig, TocConfig, SiteMetadata } from '@/config'
   ```

## 注意事项

- `getSiteMetadata()` 目前仅支持服务器端调用
- 配置系统已完成重构，提供清晰统一的访问接口
- 所有配置均通过 `@/config` 统一入口导入
- 运行时模式配置通过 `lib/mode.ts` 处理
