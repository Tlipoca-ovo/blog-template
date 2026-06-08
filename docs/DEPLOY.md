# 从零开始部署博客（完整教程）

> 本教程面向零基础用户，每一步都有详细说明。即使你从没接触过 Git、Node.js、Cloudflare，也能跟着完成部署。

---

## 目录

1. [准备工作](#准备工作)
2. [第一章：本地运行（必做）](#第一章本地运行必做)
3. [第二章：部署到 Cloudflare](#第二章部署到-cloudflare)
4. [第三章：日常维护](#第三章日常维护)

---

## 准备工作

### 需要安装的软件

| 软件 | 作用 | 下载地址 |
|------|------|----------|
| Git | 把代码下载到本地 | [git-scm.com](https://git-scm.com/download/win) |
| Node.js | 运行博客程序 | [nodejs.org](https://nodejs.org)（选 LTS 版本） |

> 💡 安装时请勾选 **"Add to PATH"**，安装程序会自动帮你配置好环境变量。

### 验证安装

打开一个新的命令行窗口（按 `Win+R`，输入 `cmd`，回车），依次输入以下命令检查是否安装成功：

```bash
git --version
node --version
npm --version
```

如果看到类似 `git version 2.x.x`、`node v20.x.x`、`npm 10.x.x` 的版本号，说明安装成功。

---

## 第一章：本地运行（必做）

> 这一步一定要先做！不能跳过！本地跑通后再部署，否则出了问题都不知道哪里出错了。

### 1.1 克隆代码

打开命令行，进入你想存放项目的目录（比如桌面），然后执行：

```bash
# 替换下面的链接为你的仓库地址
git clone https://github.com/Tlipoca-ovo/blog-template.git
```

命令执行后，你的当前目录会多出一个 `blog-template` 文件夹。

### 1.2 进入项目目录

```bash
cd blog-template
```

### 1.3 安装依赖

这一步会下载所有需要的代码库，需要等待1-3分钟。

```bash
npm install
```

### 1.4 初始化数据库

这一步会在本地创建一个 SQLite 数据库，用来存储文章、设置等数据。

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

如果看到类似 `Database synchronized successfully` 的提示，说明数据库创建成功。

### 1.5 启动网站

```bash
npm run dev
```

等待几秒后，命令行会显示类似这样的信息：

```
Ready - started server on http://localhost:3000
```

### 1.6 打开浏览器查看

打开浏览器，访问 [http://localhost:3000](http://localhost:3000)

你应该能看到博客首页了！

### 1.7 访问管理后台

浏览器访问 [http://localhost:3000/admin](http://localhost:3000/admin)

- 用户名：`admin`
- 密码：`admin123`

登录后你可以开始写文章、修改设置。

> ⚠️ **本地开发完成后，先不要关闭命令行窗口！** 保持运行状态，继续下面的部署步骤。

---

## 第二章：部署到 Cloudflare

> Cloudflare 提供免费托管服务，个人博客完全够用。

### 2.1 注册 Cloudflare 账号

1. 打开浏览器访问 [dash.cloudflare.com](https://dash.cloudflare.com)
2. 点击 **Sign up** 注册（用邮箱注册即可）
3. 注册完成后自动跳转到 Dashboard

### 2.2 安装 Wrangler CLI

Wrangler 是 Cloudflare 的命令行工具，用来部署网站。回到你的命令行窗口：

```bash
npm install -g wrangler
```

验证安装：

```bash
npx wrangler --version
```

如果看到 `wrangler x.x.x`，说明安装成功。

### 2.3 登录 Cloudflare

```bash
npx wrangler login
```

执行后浏览器会自动打开 Cloudflare 授权页面，点击 **Authorize** 授权即可。授权完成后命令行会显示 `Successfully logged in`。

### 2.4 创建 D1 数据库

D1 是 Cloudflare 的免费 SQLite 数据库，用来存储你的博客数据。

1. 在 Cloudflare Dashboard 左侧菜单点击 **Workers & Pages**
2. 点击 **D1 Databases**
3. 点击 **Create Database**
4. 给数据库起个名字，比如 `blog-db`
5. 点击 **Create**

创建完成后，你会看到数据库信息页面，**复制一下 Database ID**（类似 `abc123def-456...` 这样的字符串）。

> 💡 Database ID 后面要用，先记着。

### 2.5 复制并修改配置文件

回到命令行（**另开一个新窗口，不要关掉运行中的 `npm run dev`**）：

```bash
# 进入项目目录
cd blog-template

# 复制配置文件
copy wrangler.toml.example wrangler.toml
```

用记事本打开 `wrangler.toml` 文件，找到这两行：

```toml
database_name = "你的数据库名称"
database_id = "你的数据库ID"
```

修改为你在 2.4 步创建的数据库名称和 ID：

```toml
database_name = "blog-db"
database_id = "abc123def-456..."  # 替换成你复制的 ID
```

保存文件。

### 2.6 推送数据库结构

让 Cloudflare 知道你的数据库有哪些表、哪些字段：

```bash
npx wrangler d1 migrations apply blog-db --remote
```

> ⚠️ 把命令里的 `blog-db` 替换成你创建的数据库名称。

### 2.7 设置密钥

部署前必须设置两个密钥（JWT_SECRET 和 ADMIN_PASSWORD），否则网站无法登录。

```bash
npx wrangler secret put JWT_SECRET
```

提示时输入任意随机字符串，比如：`blog-secret-key-2024`

> 💡 可以用在线工具生成：[LastPass密码生成器](https://www.lastpass.com/features/password-generator)，或用命令 `openssl rand -hex 32` 生成一个。

同样设置后台密码：

```bash
npx wrangler secret put ADMIN_PASSWORD
```

提示时输入你想要的密码，比如：`MySecureBlog2024`

### 2.8 构建网站

这一步把代码编译成 Cloudflare 可以运行的格式：

```bash
npm run build:cloudflare
```

等待1-3分钟，看到类似 `✓ Compiled successfully` 的提示说明成功。

### 2.9 部署上线

```bash
npm run deploy:cloudflare
```

等待约30秒，部署成功后会显示你的网站地址，类似：

```
Published blog-template-abc123.pages.dev
```

### 2.10 验证部署

在浏览器打开显示的地址，确认博客可以正常访问。

首次访问时数据库是空的，需要去管理后台写文章。访问：

```
https://你的域名/admin
```

用你在 2.7 步设置的 ADMIN_PASSWORD 登录。

---

## 第三章：日常维护

### 3.1 更新代码后重新部署

如果修改了代码，只需要：

```bash
cd blog-template
git pull                    # 拉取最新代码
npm run build:cloudflare    # 重新构建
npm run deploy:cloudflare    # 重新部署
```

### 3.2 常用命令速查

| 场景 | 命令 |
|------|------|
| 本地开发 | `npm run dev` |
| 查看本地网站 | 浏览器访问 localhost:3000 |
| 修改代码后重新构建 | `npm run build:cloudflare` |
| 重新部署 | `npm run deploy:cloudflare` |
| 推送数据库结构 | `npx wrangler d1 migrations apply 数据库名 --remote` |
| 修改后台密码 | `npx wrangler secret put ADMIN_PASSWORD` |

### 3.3 遇到问题怎么办

**Q: 部署后打开网站显示空白或报错**

- 先确认本地 `npm run dev` 是否正常运行
- 检查 2.7 步的密钥是否设置正确
- 检查 2.5 步的数据库 ID 是否填对

**Q: 数据库 ID 忘记了**

- 去 Cloudflare Dashboard → Workers & Pages → D1 Databases → 找到你的数据库 → 复制 ID

**Q: 想换域名**

- 在 Cloudflare Dashboard → Workers & Pages → 你的项目 → Settings → Custom Domains
- 添加你自己的域名即可

---

## 附录：项目结构说明

```
blog-template/
├── wrangler.toml.example    # 配置文件模板（参考 2.5 步）
├── prisma/                  # 数据库相关
│   ├── schema.prisma        # 数据库结构定义
│   └── seed.ts              # 初始数据
├── src/
│   ├── app/                 # 页面
│   │   ├── admin/           # 管理后台
│   │   ├── api/             # 接口
│   │   └── posts/           # 文章详情
│   └── components/           # 页面组件
└── docs/
    └── image-spec.md        # 图片使用规范
```

> 如果你对代码不熟悉，**不要修改 `prisma/` 目录下的任何文件**，改坏了会导致数据库出错。

---

*有问题欢迎提交 Issue：https://github.com/Tlipoca-ovo/blog-template/issues*
