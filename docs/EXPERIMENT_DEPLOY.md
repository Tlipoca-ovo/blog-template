---
name: 实验部署流程
description: 在 E:\myblog 进行实验部署，发现问题后在主项目修复并同步，最后更新实验文件夹
metadata:
  type: project
---

# 实验部署工作流程

## 目录结构

| 路径 | 用途 | GitHub 仓库 |
|------|------|-------------|
| `E:\ai-web\博客模版` | 博客模版（公开） | [Tlipoca-ovo/blog-template](https://github.com/Tlipoca-ovo/blog-template) |
| `E:\myblog` | 我的博客实例（私有） | **需手动创建** |

## 工作流程

### 第一阶段：实验部署

1. **Clone 项目到实验文件夹**
   ```bash
   cd E:\myblog
   git clone https://github.com/Tlipoca-ovo/blog-template.git .
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **初始化数据库**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **本地开发测试**
   ```bash
   npm run dev
   ```

5. **配置真实环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 填入真实值
   ```

6. **配置 Cloudflare**
   ```bash
   cp wrangler.toml.example wrangler.toml
   # 编辑 wrangler.toml 填入真实值
   ```

### 第二阶段：问题修复与同步

如果发现问题：

1. **切换到主项目**
   ```bash
   cd E:\ai-web\博客模版
   ```

2. **在主项目中修复问题**

3. **同步到 GitHub**
   ```bash
   git add .
   git commit -m "修复: 描述修复内容"
   git push origin main
   ```

### 第三阶段：更新实验文件夹

修复同步完成后，更新实验文件夹：

1. **拉取最新代码**
   ```bash
   cd E:\myblog
   git pull origin main
   ```

2. **重新构建/部署**
   ```bash
   npm run build:cloudflare
   npm run deploy:cloudflare
   ```

---

## 当前状态 (2026-06-19)

### ✅ 公开博客模版仓库 (blog-template)
- **地址**: https://github.com/Tlipoca-ovo/blog-template
- **分支**: main
- **最新提交**: `d1ba85a` - 安全: 从Git历史移除wrangler.toml
- **安全措施**:
  - wrangler.toml 已从 Git 历史移除
  - .gitignore 添加了 wrangler.toml 忽略规则
  - wrangler.toml.example 作为部署模板

### ⏳ 私有博客实例仓库 (myblog-private)
- **需手动创建**: https://github.com/new
  - 仓库名: `myblog-private`
  - 描述: 我的博客实例 - 包含真实配置和 Cloudflare 连接
  - **注意**: 先创建**公开**仓库，连接 Cloudflare 后再改为私有
- **待完成**:
  1. 在 GitHub 创建私有仓库
  2. 将 `E:\myblog` 与新仓库关联
  3. 推送到私有仓库
  4. 连接 Cloudflare Pages

---

## GitHub 仓库创建步骤

### 1. 创建公开仓库（用于连接 Cloudflare）

1. 访问 https://github.com/new
2. 创建新仓库：
   - Repository name: `myblog-private`
   - Description: `我的博客实例 - 包含真实配置和 Cloudflare 连接`
   - **先保持 Public**（Cloudflare Pages 需要公开仓库才能连接 Git）
   - 不要勾选 "Initialize this repository with a README"

### 2. 将 E:\myblog 推送到新仓库

```bash
cd E:\myblog
git remote set-url origin git@github.com:Tlipoca-ovo/myblog-private.git
git push -u origin main --force
```

### 3. 连接 Cloudflare Pages（详见下方）

### 4. 部署稳定后改为私有

在 GitHub 仓库设置中：
- Settings → Danger Zone → Change visibility → **Private**

---

## Cloudflare Pages 连接步骤

1. 访问 https://dash.cloudflare.com
2. Workers & Pages → 创建应用程序
3. 选择 "Connect a Git repository"
4. 选择 `myblog-private` 仓库
5. 设置：
   - 构建命令: `npm run build:cloudflare`
   - 输出目录: `.open-next`
6. 设置环境变量：
   - DATABASE_URL
   - JWT_SECRET
7. 部署！

---

## 测试结果 (2026-06-19)

### 本地开发测试 ✅
| 功能 | 状态 |
|------|------|
| 前台首页 | 正常 |
| 管理后台登录 | 正常 |
| 仪表盘 | 正常 |
| 文章管理 | 正常 |
| 主题定制 | 正常 |

### Cloudflare 构建测试 ✅
- `npm run build:cloudflare`: 成功
- 预览: Windows 环境有限制

### 已知问题
1. **middleware 废弃警告**: Next.js 16 中 middleware 文件约定已废弃，建议未来迁移到 proxy
2. **Windows 构建警告**: OpenNext 在 Windows 上不完全兼容
