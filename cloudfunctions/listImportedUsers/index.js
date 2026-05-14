// cloudfunctions/listImportedUsers/index.js
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
  const { token, page = 1, pageSize = 20, batchId } = event;
  const adminId = await verifyAdmin(token);
  if (!adminId) return { success: false, message: '未授权' };

  try {
    let query = db.collection('imported_users');
    if (batchId) query = query.where({ importBatchId: batchId });

    const total = (await query.count()).total;
    const data = (await query.orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()).data;

    return { success: true, total, data, page, pageSize };
  } catch (e) {
    console.error('listImportedUsers error', e);
    return { success: false, message: e.message };
  }
};
