// 共享鉴权代码，云函数部署时请把这段内联到各管理云函数中（CloudBase 不支持跨目录 require）。
// 每个管理云函数（importUsers / listAuthUsers / listImportedUsers / updateImportedUser / updateArticle）
// 内部都重复了等价逻辑，保持单文件部署的简单性。
//
// async function verifyAdmin(db, token) {
//   if (!token) return null;
//   const res = await db.collection('admin_sessions').where({ token }).limit(1).get();
//   const s = res.data && res.data[0];
//   if (!s) return null;
//   if (s.expiresAt && new Date(s.expiresAt).getTime() < Date.now()) return null;
//   return s.adminId;
// }
module.exports = {};
