// cloudfunctions/importUsers/index.js
// 入参：{ token, fileID }   fileID 由前端上传到云存储后得到
// 解析 Excel 写入 imported_users，列名作为 key（动态字段，等真实字段确认后再加 schema 校验）
const cloud = require('wx-server-sdk');
const xlsx = require('xlsx');
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
  const { token, fileID } = event;
  const adminId = await verifyAdmin(token);
  if (!adminId) return { success: false, message: '未授权' };
  if (!fileID) return { success: false, message: '缺少 fileID' };

  try {
    const downloaded = await cloud.downloadFile({ fileID });
    const wb = xlsx.read(downloaded.fileContent, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows.length) return { success: false, message: 'Excel 为空' };

    const importBatchId = 'batch_' + Date.now();
    const now = new Date();

    // 批量写入（云数据库单次 add 最多 20 条，分批）
    const CHUNK = 20;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const slice = rows.slice(i, i + CHUNK);
      await Promise.all(slice.map(row =>
        db.collection('imported_users').add({
          data: {
            ...row,
            _rawRow: row,
            importBatchId,
            createdAt: now,
            updatedAt: now
          }
        })
      ));
      inserted += slice.length;
    }

    return {
      success: true,
      inserted,
      batchId: importBatchId,
      headers: Object.keys(rows[0])
    };
  } catch (e) {
    console.error('importUsers error', e);
    return { success: false, message: e.message };
  }
};
