# 博客模版

基于 Next.js + Prisma + Cloudflare D1 的高度可自定义博客系统。

## 功能特性

- **前台展示**：首页、文章详情、分类、标签、页面、关于、友链
- **管理后台**：完整的博客管理后台（需管理员登录）
- **高度可自定义**：通过后台可自定义主题色彩、模块开关、导航菜单、SEO 等
- **富文本编辑**：使用 Tiptap 编辑器撰写文章
- **轻量部署**：使用 SQLite/D1 数据库，无需额外部署数据库服务

## 环境要求

- Node.js 20+
- npm 10+

---

## 快速开始（本地运行）

### 第一步：安装依赖

```bash
npm install
```

### 第二步：初始化数据库

```bash
npx prisma generate      # 生成数据库工具
npx prisma db push       # 创建本地数据库
npx prisma db seed       # 添加初始数据
```

### 第三步：启动网站

```bash
npm run dev
```

然后打开浏览器访问 [http://localhost:3000](http://localhost:3000)

- 博客前台首页
- 管理后台 `/admin`，账号 `admin`，密码 `admin123`

---

## 部署到 Cloudflare（免费托管）

### 第一步：注册 Cloudflare

登录 [dash.cloudflare.com](https://dash.cloudflare.com)，免费注册账号。

### 第二步：创建 D1 数据库

1. 进入 Cloudflare Dashboard
2. 左侧菜单找到 **Workers & Pages** → **D1 Databases**
3. 点击 **Create Database**，起个名字，比如 `blog-db`
4. 创建完成后，复制显示的 **Database ID**

### 第三步：修改配置文件

编辑项目根目录的 `wrangler.toml`，把 `<你的数据库 ID>` 换成刚才复制的 ID：

```toml
[[d1_databases]]
binding = "D1"
database_name = "blog-db"
database_id = "这里填你的数据库ID"
```

### 第四步：推送数据库结构

```bash
npx wrangler d1 migrations apply blog-template-db --remote
```

### 第五步：设置密钥

在项目目录执行：

```bash
npx wrangler secret put JWT_SECRET
```

提示时输入任意随机字符串（可以用 `openssl rand -hex 32` 生成）。

### 第六步：部署上线

```bash
npm run build:cloudflare
npm run deploy:cloudflare
```

部署成功后，会显示一个 `.workers.dev` 的域名，访问即可看到你的博客。

### 更简单的方式：连接 GitHub 自动部署

1. 把代码推送到 GitHub
2. 在 Cloudflare Dashboard 新建 **Workers & Pages** 项目
3. 选择 **Connect a Git repository**
4. 授权你的 GitHub 仓库
5. 设置构建命令为 `npm run build:cloudflare`
6. 部署命令为 `npm run deploy:cloudflare`

这样每次推送到 GitHub，Cloudflare 会自动帮你构建和部署。

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发 |
| `npm run build` | 构建生产版本 |
| `npm run build:cloudflare` | 构建 Cloudflare 版本 |
| `npm run deploy:cloudflare` | 部署到 Cloudflare |
| `npx prisma db push` | 同步数据库结构 |
| `npx prisma db seed` | 添加初始数据 |

---

## 项目结构

```
src/
├── app/
│   ├── admin/        # 管理后台页面
│   ├── api/           # API 接口
│   └── posts/         # 文章详情页
├── components/        # 页面组件
└── lib/              # 工具函数

prisma/
├── schema.prisma     # 数据库结构定义
└── seed.ts           # 初始数据
```

---

## 许可证

MIT