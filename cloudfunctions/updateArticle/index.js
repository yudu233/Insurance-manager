// cloudfunctions/updateArticle/index.js
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
  const { token, slug = 'privacy', title, content } = event;
  const adminId = await verifyAdmin(token);
  if (!adminId) return { success: false, message: '未授权' };
  if (typeof content !== 'string') {
    return { success: false, message: 'content 必须为字符串' };
  }

  const now = new Date();
  try {
    const exists = await db.collection('articles').where({ slug }).limit(1).get();
    if (exists.data && exists.data.length) {
      await db.collection('articles').doc(exists.data[0]._id).update({
        data: { title: title || '隐私协议', content, updatedAt: now, updatedBy: adminId }
      });
    } else {
      await db.collection('articles').add({
        data: { slug, title: title || '隐私协议', content, createdAt: now, updatedAt: now, updatedBy: adminId }
      });
    }
    return { success: true };
  } catch (e) {
    console.error('updateArticle error', e);
    return { success: false, message: e.message };
  }
};
