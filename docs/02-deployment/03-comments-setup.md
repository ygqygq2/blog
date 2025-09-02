# 评论系统配置指南

> 💬 **Giscus 评论集成** - 完整的评论系统配置和集成指南

## 📋 概览

本博客系统集成了 [Giscus](https://giscus.app) 评论系统，基于 GitHub Discussions 构建，提供：

- ✅ **零服务器成本** - 完全基于 GitHub
- ✅ **无广告干扰** - 纯净的评论体验
- ✅ **GitHub 登录** - 使用 GitHub 账户评论
- ✅ **主题自适应** - 支持亮色/暗色主题
- ✅ **多语言支持** - 支持中文界面
- ✅ **反应表情** - 支持 emoji 反应

## 🚀 快速配置

### 第一步：启用 GitHub Discussions

1. **打开仓库设置**
   - 访问 `https://github.com/ygqygq2/blog`
   - 点击 "Settings" 标签页

2. **启用 Discussions**
   - 滚动到 "Features" 部分
   - 勾选 "Discussions"
   - 点击 "Set up discussions"

3. **创建分类**（推荐）
   - 进入 Discussions 页面
   - 创建 "Comments" 分类用于博客评论

### 第二步：配置 Giscus

1. **访问 Giscus 配置页面**

   ```
   https://giscus.app
   ```

2. **填入仓库信息**

   ```
   Repository: ygqygq2/blog
   ```

3. **选择映射方式**

   ```
   ✅ Discussion title contains page title  (推荐)
   ◯ Discussion title contains page pathname
   ◯ Discussion title contains page URL
   ```

   **映射方式说明**：
   - **title**：使用文章标题，GitHub 中显示友好的中文标题 ✅
   - **pathname**：使用 URL 路径，中文会被编码显示
   - **url**：使用完整 URL，包含域名

4. **选择分类**

   ```
   Category: Comments (推荐)
   或: General
   ```

5. **复制生成的配置**
   页面底部会生成类似以下的配置：
   ```html
   <script
     src="https://giscus.app/client.js"
     data-repo="ygqygq2/blog"
     data-repo-id="R_kgDOMq_FhQ"
     data-category="Comments"
     data-category-id="DIC_kwDOMq_Fhc4Cu33l"
     data-mapping="title"
     data-strict="1"
     data-reactions-enabled="1"
     data-emit-metadata="0"
     data-input-position="top"
     data-theme="light"
     data-lang="zh-CN"
     data-loading="lazy"
     crossorigin="anonymous"
     async
   ></script>
   ```

### 第三步：更新环境变量

1. **编辑 `.env.local`**

   ```bash
   # 评论系统配置 - Giscus
   NEXT_PUBLIC_GISCUS_REPO=ygqygq2/blog
   NEXT_PUBLIC_GISCUS_REPOSITORY_ID=R_kgDOMq_FhQ
   NEXT_PUBLIC_GISCUS_CATEGORY=Comments
   NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDOMq_Fhc4Cu33l
   ```

2. **重启开发服务器**
   ```bash
   pnpm dev
   ```

## ⚙️ 高级配置

### 主题配置

博客系统支持自动主题切换：

```javascript
// data/siteMetadata.cjs
giscusConfig: {
  theme: 'light',              // 亮色主题
  darkTheme: 'transparent_dark', // 暗色主题
  // 其他选项: 'dark', 'dark_dimmed', 'dark_high_contrast'
}
```

### 语言配置

支持多种语言：

```javascript
giscusConfig: {
  lang: 'zh-CN',  // 中文
  // 其他选项: 'en', 'es', 'fr', 'de', 'ja', 'ko'
}
```

### 映射方式

| 映射方式   | 优点                         | 缺点               | 推荐度     |
| ---------- | ---------------------------- | ------------------ | ---------- |
| `pathname` | URL 稳定，不会因标题变化影响 | 对用户不够直观     | ⭐⭐⭐⭐⭐ |
| `title`    | 用户友好，易于管理           | 标题变化会丢失评论 | ⭐⭐⭐     |
| `url`      | 包含完整URL信息              | URL变化会影响评论  | ⭐⭐       |

**推荐使用 `pathname`** - 最稳定可靠的映射方式。

## 🎨 自定义样式

### CSS 变量覆盖

创建自定义主题：

```css
/* css/giscus-custom.css */
:root {
  --giscus-primary-color: #0969da;
  --giscus-primary-color-hover: #0860ca;
  --giscus-secondary-color: #656d76;
}
```

### 深色模式适配

```css
[data-theme='dark'] {
  --giscus-primary-color: #58a6ff;
  --giscus-primary-color-hover: #79c0ff;
}
```

## 🔧 开发者配置

### 条件加载

如果希望按需加载评论：

```typescript
// components/Comments.tsx
const [loadComments, setLoadComments] = useState(false)

return (
  <div>
    {!loadComments && (
      <button onClick={() => setLoadComments(true)}>
        加载评论
      </button>
    )}
    {loadComments && <Giscus {...config} />}
  </div>
)
```

### 预加载优化

在文章底部预加载评论：

```typescript
// 使用 Intersection Observer 在评论区域可见时加载
useEffect(() => {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      setLoadComments(true)
    }
  })

  if (commentRef.current) {
    observer.observe(commentRef.current)
  }

  return () => observer.disconnect()
}, [])
```

## 📊 监控和分析

### 评论统计

通过 GitHub API 获取评论统计：

```typescript
// 获取讨论统计
const response = await fetch(`https://api.github.com/repos/ygqygq2/blog/discussions`)
const discussions = await response.json()
```

### 性能监控

监控 Giscus 加载性能：

```typescript
// 监控评论系统加载时间
performance.mark('giscus-start')
// ... Giscus 加载
performance.mark('giscus-end')
performance.measure('giscus-load', 'giscus-start', 'giscus-end')
```

## 🛠️ 故障排除

### 常见问题

#### 1. 评论不显示

**检查清单：**

- [ ] GitHub Discussions 已启用
- [ ] 仓库是公开的
- [ ] 环境变量配置正确
- [ ] 网络连接正常

**解决步骤：**

```bash
# 1. 检查环境变量
echo $NEXT_PUBLIC_GISCUS_REPO

# 2. 检查网络
curl -I https://giscus.app

# 3. 重启开发服务器
pnpm dev
```

#### 2. 主题不切换

**原因：** 主题切换逻辑问题

**解决方案：**

```typescript
// 确保主题切换监听正确
useEffect(() => {
  const iframe = document.querySelector('iframe.giscus-frame')
  if (iframe) {
    iframe.contentWindow?.postMessage(
      {
        giscus: { setConfig: { theme: newTheme } },
      },
      'https://giscus.app',
    )
  }
}, [theme])
```

#### 3. 评论权限问题

**原因：** 仓库权限设置

**解决方案：**

1. 确保仓库是公开的
2. 检查 Discussions 权限设置
3. 验证用户登录状态

### 调试模式

启用详细日志：

```typescript
// 添加到 Comments 组件
console.log('Giscus Config:', {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
  theme: currentTheme,
})
```

## 📚 相关资源

### 官方文档

- [Giscus 官网](https://giscus.app)
- [Giscus GitHub](https://github.com/giscus/giscus)
- [@giscus/react 文档](https://github.com/giscus/giscus-component)

### 社区资源

- [GitHub Discussions 指南](https://docs.github.com/en/discussions)
- [React 组件最佳实践](https://react.dev/learn)

### 相关文档

- [环境变量配置](./02-environment-variables.md)
- [部署指南](./01-dynamic-production-deployment.md)
- [故障排除](../04-troubleshooting/00-common-issues.md)

---

> 💡 **提示**: 评论系统配置完成后，建议测试发布一条评论确保功能正常。记住评论数据存储在 GitHub Discussions 中，完全免费且可靠。
