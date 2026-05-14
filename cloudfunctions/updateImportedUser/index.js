// cloudfunctions/updateImportedUser/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

async function verifyAdmin(token) {
  if (!token) return null;
  const res = await db.collection('admin_sessions').where({ token }).limit(1).get();
  const s = res.data && res.data[0];
  if (!s) return null;
  if (s.expiresAt && new Date(s.expiresAt).getTime() < Date.now()) return null;
  return s.adminId;
}

exports.main = async (event) => {
  const { token, id, patch = {} } = event;
  const adminId = await verifyAdmin(token);
  if (!adminId) return { success: false, message: '未授权' };
  if (!id) return { success: false, message: '缺少 id' };

  try {
    // 不允许覆盖系统字段
    const blacklist = ['_id', 'createdAt', 'importBatchId', '_rawRow'];
    const safe = {};
    Object.keys(patch).forEach(k => {
      if (!blacklist.includes(k)) safe[k] = patch[k];
    });
    safe.updatedAt = new Date();

    await db.collection('imported_users').doc(id).update({ data: safe });
    return { success: true };
  } catch (e) {
    console.error('updateImportedUser error', e);
    return { success: false, message: e.message };
  }
};
