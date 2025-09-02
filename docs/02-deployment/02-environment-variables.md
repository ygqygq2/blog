# 环境变量配置指南

> 📋 **环境变量管理** - 本地开发和生产部署的环境变量配置完整指南

## 🔧 本地开发配置

### 快速开始

1. **复制模板文件**

   ```bash
   cp .env.example .env.local
   ```

2. **填入实际配置值**
   ```bash
   # 评论系统配置 - Giscus
   NEXT_PUBLIC_GISCUS_REPO=ygqygq2/blog
   NEXT_PUBLIC_GISCUS_REPOSITORY_ID=R_kgDOMq_FhQ
   NEXT_PUBLIC_GISCUS_CATEGORY=Comments
   NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDOMq_Fhc4Cu33l
   ```

## 🚀 生产环境部署

### Vercel 部署

#### 方法1: Dashboard 界面

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 → Settings → Environment Variables
3. 添加以下变量：

| 变量名                             | 值                     | 环境                             |
| ---------------------------------- | ---------------------- | -------------------------------- |
| `NEXT_PUBLIC_GISCUS_REPO`          | `ygqygq2/blog`         | Production, Preview, Development |
| `NEXT_PUBLIC_GISCUS_REPOSITORY_ID` | `R_kgDOMq_FhQ`         | Production, Preview, Development |
| `NEXT_PUBLIC_GISCUS_CATEGORY`      | `Comments`             | Production, Preview, Development |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID`   | `DIC_kwDOMq_Fhc4Cu33l` | Production, Preview, Development |

#### 方法2: CLI 命令

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录和配置
vercel login
vercel link

# 添加环境变量
vercel env add NEXT_PUBLIC_GISCUS_REPO production
vercel env add NEXT_PUBLIC_GISCUS_REPOSITORY_ID production
vercel env add NEXT_PUBLIC_GISCUS_CATEGORY production
vercel env add NEXT_PUBLIC_GISCUS_CATEGORY_ID production

# 重新部署应用更改
vercel --prod
```

### Netlify 部署

1. 登录 [Netlify Dashboard](https://app.netlify.com/)
2. 选择站点 → Site settings → Environment variables
3. 点击 "Add variable" 添加：

```bash
NEXT_PUBLIC_GISCUS_REPO=ygqygq2/blog
NEXT_PUBLIC_GISCUS_REPOSITORY_ID=R_kgDOMq_FhQ
NEXT_PUBLIC_GISCUS_CATEGORY=Comments
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDOMq_Fhc4Cu33l
```

4. 触发重新部署：Site overview → Trigger deploy

### 其他平台

#### Railway

```bash
# 使用 Railway CLI
railway login
railway link
railway variables set NEXT_PUBLIC_GISCUS_REPO=ygqygq2/blog
```

#### DigitalOcean App Platform

1. Apps → 选择应用 → Settings → App-Level Environment Variables
2. 添加环境变量并重新部署

## 📋 环境变量清单

### 必需变量 (评论系统)

| 变量名                             | 描述            | 示例值            | 获取方式                              |
| ---------------------------------- | --------------- | ----------------- | ------------------------------------- |
| `NEXT_PUBLIC_GISCUS_REPO`          | GitHub 仓库     | `owner/repo`      | GitHub 仓库地址                       |
| `NEXT_PUBLIC_GISCUS_REPOSITORY_ID` | 仓库 ID         | `R_kgDOxxxxxxx`   | [giscus.app](https://giscus.app) 配置 |
| `NEXT_PUBLIC_GISCUS_CATEGORY`      | Discussion 分类 | `Comments`        | GitHub Discussions 分类名             |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID`   | 分类 ID         | `DIC_kwDOxxxxxxx` | [giscus.app](https://giscus.app) 配置 |

### 可选变量 (Newsletter 服务)

| 变量名               | 描述                | 安全级别 |
| -------------------- | ------------------- | -------- |
| `MAILCHIMP_API_KEY`  | Mailchimp API 密钥  | 🔒 私密  |
| `BUTTONDOWN_API_KEY` | Buttondown API 密钥 | 🔒 私密  |
| `CONVERTKIT_API_KEY` | ConvertKit API 密钥 | 🔒 私密  |

## 🔒 安全最佳实践

### 公开变量 (`NEXT_PUBLIC_*`)

```bash
# ✅ 这些变量是安全公开的
NEXT_PUBLIC_GISCUS_REPO=ygqygq2/blog
NEXT_PUBLIC_GISCUS_REPOSITORY_ID=R_kgDOMq_FhQ
```

**为什么安全？**

- 仅用于只读操作（显示评论）
- 不包含敏感权限
- GitHub 仓库本身是公开的

### 私密变量

```bash
# ❌ 这些变量必须保密
MAILCHIMP_API_KEY=secret_key_here
BUTTONDOWN_API_KEY=secret_key_here
```

**保护措施：**

- 不使用 `NEXT_PUBLIC_` 前缀
- 仅在服务器端可用
- 已在 `.gitignore` 中排除

## 🛠️ 故障排除

### 检查环境变量加载

1. **开发环境检查**

   ```bash
   # 在组件中添加调试代码
   console.log('GISCUS_REPO:', process.env.NEXT_PUBLIC_GISCUS_REPO)
   ```

2. **生产环境检查**
   - 查看构建日志
   - 检查部署平台的环境变量设置
   - 验证变量名拼写正确

### 常见问题

#### 问题1: 环境变量未生效

**解决方案：**

```bash
# 重启开发服务器
pnpm dev

# 重新构建和部署
pnpm build
```

#### 问题2: Giscus 不显示

**检查清单：**

- [ ] GitHub Discussions 已启用
- [ ] 仓库是公开的
- [ ] 环境变量拼写正确
- [ ] 分类 ID 有效

#### 问题3: 部署后变量丢失

**解决方案：**

- 确认已在部署平台设置环境变量
- 检查变量作用域（生产/预览/开发）
- 重新触发部署

## 📚 相关文档

- [快速开始指南](../01-getting-started/01-quick-start-guide.md)
- [评论系统配置](./03-comments-setup.md)
- [常见问题解答](../04-troubleshooting/00-common-issues.md)

---

> 💡 **提示**: 建议使用部署平台的 CLI 工具管理环境变量，这样可以确保配置的一致性和可维护性。
