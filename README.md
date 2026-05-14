# Insurance Manager

保险/隐私协议管理系统：微信小程序（用户端） + CloudBase 云函数 + Vue3 PC 管理后台。

## 目录结构

```
Insurance-manager/
├── miniprogram/        # 微信小程序（用户端）
├── cloudfunctions/     # CloudBase 云函数
├── admin/              # PC 管理后台（Vue3 + Vite + Element Plus）
└── README.md
```

## 模块说明

### miniprogram/ —— 用户端
- 首次进入弹框微信授权（昵称 + 头像 + openid，手机号可选）
- 授权成功后可查看文章（隐私协议）

### cloudfunctions/ —— 云函数
| 函数 | 用途 |
|---|---|
| `login` | 小程序登录，写/更新 `auth_users` |
| `getPhoneNumber` | 解码并保存用户手机号 |
| `getArticle` | 获取文章内容（如隐私协议） |
| `adminLogin` | 管理员账号密码登录，签发 token |
| `adminMiddleware` | 后台云函数通用 token 校验（被复用） |
| `importUsers` | 解析 Excel 写入 `imported_users` |
| `listAuthUsers` | 列表：授权用户 |
| `listImportedUsers` | 列表：导入用户 |
| `updateImportedUser` | 编辑导入用户字段 |
| `updateArticle` | 管理员更新文章 |

### admin/ —— 管理后台
- 账号密码登录（绑定手机号）
- 用户列表双 Tab：授权用户 / 导入用户
- 上传 Excel 导入用户资料
- 富文本编辑隐私协议

## 数据库集合

```
auth_users        小程序授权用户
imported_users    Excel 导入用户
articles          文章（含隐私协议）
admins            管理员账号
admin_sessions    管理员登录 token
```

## 默认账号（开发用）

- 用户名：`admin`
- 密码：`admin@123`
- 手机号：`13800000000`

> 上线前请通过 `admins` 集合直接修改 / 增加管理员。

## 开发流程

1. 在 [微信公众平台](https://mp.weixin.qq.com/) 申请测试号或正式小程序
2. 在 [CloudBase 控制台](https://console.cloud.tencent.com/tcb) 开通环境，得到 envId
3. 把 envId 替换到：
   - `miniprogram/app.js` 的 `env`
   - `cloudfunctions/*/config.json` （如有）
   - `admin/src/api/cloudbase.ts` 的 `env`
4. 部署云函数：微信开发者工具或 `tcb fn deploy`
5. 启动管理后台：`cd admin && pnpm i && pnpm dev`

## 状态

当前为最小骨架，主要流程跑通。后续待办：
- [ ] 拿到真实 Excel 字段后，完善 `imported_users` schema 与表单校验
- [ ] 后期按手机号关联授权用户与导入用户
- [ ] 管理后台部署方案
