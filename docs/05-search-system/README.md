# 05 搜索系统

> 🔍 **博客搜索系统完整指南** - 从基础搜索到AI增强的全方位解决方案

## 章节导航

### 📚 基础指南

1. **[📖 00-搜索系统概览](./00-search-overview.md)**
   - 搜索系统架构
   - 预生成索引 vs 实时搜索
   - 技术选型对比

2. **[⚙️ 01-增强搜索实现](./01-enhanced-search-implementation.md)**
   - 增强索引结构设计
   - 中文分词优化
   - 随机排序机制

3. **[🎯 02-搜索配置指南](./02-search-configuration.md)**
   - 搜索引擎配置
   - 索引生成配置
   - 性能调优参数

### 🤖 AI集成方案

4. **[🧠 03-AI搜索集成方案](./03-ai-search-integration.md)**
   - 静态模式AI预处理
   - 动态模式实时AI增强
   - 语义搜索实现

5. **[🔧 04-AI搜索实现指南](./04-ai-search-implementation.md)**
   - OpenAI集成示例
   - 本地AI模型部署
   - 混合搜索策略

### 🛠️ 高级功能

6. **[📈 05-搜索分析统计](./05-search-analytics.md)**
   - 搜索行为分析
   - 热词统计
   - 用户体验优化

7. **[🚀 06-性能优化策略](./06-performance-optimization.md)**
   - 索引大小优化
   - 搜索速度提升
   - 内存使用优化

---

## 快速开始

### 启用增强搜索

```bash
# 1. 生成增强搜索索引
node scripts/generate-content.mjs

# 2. 检查生成的索引文件
ls -la public/search*.json

# 3. 在组件中使用
import EnhancedSearchModal from './components/search/EnhancedSearchModal'
```

### AI搜索快速集成

```bash
# 1. 安装AI相关依赖
pnpm add openai @huggingface/inference

# 2. 配置环境变量
echo "OPENAI_API_KEY=your-key" >> .env.local

# 3. 启用AI增强搜索
# 参见 03-AI搜索集成方案
```

---

## 常用操作

| 操作                 | 命令/方法                                      |
| -------------------- | ---------------------------------------------- |
| **重新生成搜索索引** | `node scripts/generate-content.mjs`            |
| **检查索引状态**     | `ls -la public/search*.json`                   |
| **启用随机排序**     | `enableRandomSort: true`                       |
| **配置AI搜索**       | 见 [AI集成方案](./03-ai-search-integration.md) |

---

> 💡 **提示**: 建议从 [搜索系统概览](./00-search-overview.md) 开始，了解整体架构，然后根据需求选择具体的实现方案。
