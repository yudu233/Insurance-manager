# 微信云开发接入指南

> 「微信云开发」 = 「CloudBase」，底层一致；本项目代码无需改动，只是入口和控制台不同。

## 0. 前置：拿到一个真实的 appid

游客模式（`touristappid`）**不能**开通云开发，所以第一步必须是：

- **方案 A（推荐，零成本测试）**：申请测试号
  - 浏览器访问 [小程序测试号申请](https://mp.weixin.qq.com/wxamp/sandbox)
  - 用微信扫码即可获得 `appid + appsecret`
- **方案 B**：注册正式小程序账号 [mp.weixin.qq.com](https://mp.weixin.qq.com)

## 1. 在微信开发者工具中导入项目

1. 打开「微信开发者工具」→ 顶栏切到「**小程序**」选项卡（不要选「小程序云开发」「小游戏」）
2. 点「+」→「导入项目」
3. **目录**：选择本仓库根目录 `Insurance-manager/`（**不是** `miniprogram/`）
4. **AppID**：粘贴第 0 步拿到的 appid（不要勾选游客模式）
5. **后端服务**：选择「微信云开发」
6. 点「确定」

> 如果你之前已经导入过、目前项目还停留在游客模式：
> 详情 → 基本信息 → AppID → 修改 AppID → 填入新的 appid。

## 2. 开通云开发环境

1. 顶栏点「**云开发**」按钮
2. 第一次进入会让你「开通」，按提示走一遍（免费配额完全够开发）
3. 开通完成后你会看到一个「环境 ID」，类似 `cloud1-9gxxxxxxx`
4. **复制这个环境 ID**

## 3. 替换环境 ID（共 2 处）

### 3.1 小程序端

编辑 `miniprogram/app.js`：

```js
envId: 'your-env-id'  // ← 改成你刚复制的 env id
```

### 3.2 管理后台

`admin/.env`（从 `admin/.env.example` 复制一份）：

```
VITE_CLOUDBASE_ENV=cloud1-9gxxxxxxx
```

## 4. 部署云函数

在微信开发者工具的左侧文件树里：

1. 找到 `cloudfunctions` 目录（如果没显示「云图标」，说明 `project.config.json` 没读对，回到第 1 步检查导入目录）
2. 右键每个云函数目录 → 「**上传并部署：云端安装依赖（不上传 node_modules）**」
3. 需要部署的函数：
   - `login`
   - `getPhoneNumber`
   - `getArticle`
   - `adminLogin`
   - `importUsers`（这个体积稍大，因为要装 xlsx）
   - `listAuthUsers`
   - `listImportedUsers`
   - `updateImportedUser`
   - `updateArticle`

> `_shared/` 不是云函数，跳过。

## 5. 创建数据库集合

在「云开发控制台 → 数据库」中手动创建以下集合（点「创建集合」即可，权限保持默认「仅创建者可读写」）：

- `auth_users`
- `imported_users`
- `articles`
- `admins`
- `admin_sessions`

> 第一次调用 `adminLogin` 会自动往 `admins` 写入默认账号 `admin / admin@123`。

## 6. 配置后台 Web 调云函数

管理后台是 Web 端，要让它能调用云函数，必须做两件事：

### 6.1 开启匿名登录

云开发控制台 → 「环境 → 登录授权」 → 开启「**匿名登录**」

### 6.2 配置 Web 安全域名

云开发控制台 → 「环境 → 安全配置」 → 「**Web 安全域名**」 中加入：

- 本地开发：`http://localhost:5173`
- 上线后：你部署后台的域名（见第 8 步）

## 7. 启动管理后台（本地）

```bash
cd admin
pnpm i      # 或 npm i
pnpm dev    # 浏览器打开 http://localhost:5173
```

默认账号：`admin / admin@123`

## 8. 把管理后台部署到云开发的静态网站托管

```bash
cd admin
pnpm build               # 产物在 admin/dist/
```

然后两种方式：

- **方式 A（图形）**：云开发控制台 → 「静态网站托管」→ 「文件管理」→ 上传 `admin/dist/` 里的所有文件
- **方式 B（命令行）**：
  ```bash
  npm i -g @cloudbase/cli
  tcb login
  tcb hosting deploy admin/dist -e <你的 env id>
  ```

部署成功后会得到一个域名（形如 `xxx.tcloudbaseapp.com`），把这个域名加入第 6.2 步的「Web 安全域名」即可。

## 常见问题

### Q：导入项目时只有「不使用云服务」，没有「微信云开发」选项？
A：appid 还是 `touristappid`（游客）。改成真实 appid 即可。

### Q：左侧文件树没有显示 `cloudfunctions`？
A：检查 `project.config.json` 是否在仓库**根目录**（不是 `miniprogram/` 里），并且 `cloudfunctionRoot` 字段是 `"cloudfunctions/"`。

### Q：上传云函数报 `wx-server-sdk` 找不到？
A：右键云函数目录上传时一定要选「**云端安装依赖**」那一项，不要选「上传所有文件」。

### Q：手机号获取报错？
A：测试号不一定能用 `cloud.openapi.phonenumber.getPhoneNumber`，正式号也需要在云开发控制台 → 云函数 → 该函数 → 权限里勾选 `phonenumber.getPhoneNumber`。
