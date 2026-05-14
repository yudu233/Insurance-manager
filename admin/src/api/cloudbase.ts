// admin/src/api/cloudbase.ts
// 使用 CloudBase Web SDK 调用云函数（匿名登录）
import cloudbase from '@cloudbase/js-sdk';

// TODO: 替换为你的 CloudBase 环境 ID
const ENV_ID = (import.meta as any).env?.VITE_CLOUDBASE_ENV || 'your-env-id';

const app = cloudbase.init({ env: ENV_ID });
const auth = app.auth({ persistence: 'local' });

let signInPromise: Promise<void> | null = null;

async function ensureSignedIn() {
  if (auth.hasLoginState && auth.hasLoginState()) return;
  if (!signInPromise) {
    signInPromise = (async () => {
      try {
        await auth.signInAnonymously();
      } catch (e) {
        console.error('CloudBase 匿名登录失败：', e);
        throw e;
      }
    })();
  }
  return signInPromise;
}

/**
 * 调用云函数
 *  - 自动注入管理员 token
 */
export async function callFn<T = any>(name: string, data: Record<string, any> = {}): Promise<T> {
  await ensureSignedIn();
  const token = localStorage.getItem('admin_token') || '';
  const res = await app.callFunction({
    name,
    data: { ...data, token }
  });
  return res.result as T;
}

/**
 * 上传文件到云存储
 * @param file File 对象
 * @param cloudPath 云端路径，如 imports/xxx.xlsx
 */
export async function uploadFile(file: File, cloudPath: string): Promise<string> {
  await ensureSignedIn();
  const res = await app.uploadFile({ cloudPath, filePath: file as any });
  return res.fileID;
}

export { app as cloudbaseApp };
