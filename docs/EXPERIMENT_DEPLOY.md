---
name: 实验部署流程
description: 在 E:\myblog 进行实验部署，发现问题后在主项目修复并同步，最后更新实验文件夹
metadata:
  type: project
---

# 实验部署工作流程

## 目录结构

| 路径 | 用途 |
|------|------|
| `E:\ai-web\博客模版` | 主项目（GitHub 同步源） |
| `E:\myblog` | 实验部署文件夹 |

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
   - 访问 http://localhost:3000 检查前台
   - 访问 http://localhost:3000/admin 检查后台

5. **Cloudflare 部署测试**
   - 按照 README/DEPLOY.md 部署到 Cloudflare
   - 观察生产环境问题

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

## 当前状态

### 主项目 (E:\ai-web\博客模版)
- 分支: main
- 最新提交: `6114b5d` - 重构: 认证系统迁移至 middleware
- 已同步到 GitHub

### 实验文件夹 (E:\myblog)
- 已创建并 clone 完成
- npm install: 成功
- prisma db push + seed: 成功
- npm run dev: 成功

## 测试结果 (2026-06-19)

### 本地开发测试 ✅
- 前台首页: 正常
- 管理后台登录: 正常
- 仪表盘: 正常
- 文章管理: 正常
- 主题定制: 正常
- 控制台警告: 仅有一个 middleware 废弃警告（Next.js 16 兼容性）

### Cloudflare 构建测试 ✅
- `npm run build:cloudflare`: 成功
- 构建输出: `.open-next` 目录
- 警告: OpenNext 在 Windows 上不完全兼容，建议使用 WSL
- 预览: Windows 环境下 wrangler 命令有兼容性问题

### 已知问题
1. **middleware 废弃警告**: Next.js 16 中 middleware 文件约定已废弃，建议未来迁移到 proxy
2. **Windows 构建警告**: OpenNext 在 Windows 上不完全兼容

## Cloudflare Pages 部署指南

由于 Windows 环境预览有限，建议：
1. 连接 GitHub 到 Cloudflare Pages 实现自动部署
2. 或使用 WSL 进行本地预览

### 自动部署步骤
1. Cloudflare Dashboard → Workers & Pages → 创建应用
2. 选择 "Connect a Git repository"
3. 设置构建命令: `npm run build:cloudflare`
4. 设置输出目录: `.open-next`

## 注意事项

- **修改代码只在主项目进行**
- **实验文件夹仅用于观察和验证**
- **所有修复必须通过 GitHub 同步**
- **确认主项目无误后再更新实验文件夹**
