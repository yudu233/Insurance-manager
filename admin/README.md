# 保险管理后台（Admin）

Vue 3 + Vite + Element Plus，调用 CloudBase 云函数。

## 启动

```bash
pnpm i
cp .env.example .env
# 编辑 .env，把 VITE_CLOUDBASE_ENV 替换为你的 CloudBase 环境 ID
pnpm dev
```

## 默认账号

- 账号：admin
- 密码：admin@123

> 首次登录时，云函数 `adminLogin` 会自动创建该默认账号。

## 注意

- 后台通过 CloudBase Web SDK 匿名登录，再调用云函数；云函数内部用 `admin_token` 做身份校验。
- 上传 Excel：先 `cloud.uploadFile` 到云存储 → 拿到 fileID → 调 `importUsers` 解析入库。
