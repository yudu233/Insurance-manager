// cloudfunctions/adminLogin/index.js
const cloud = require('wx-server-sdk');
const crypto = require('crypto');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 天

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function genToken() {
  return crypto.randomBytes(24).toString('hex');
}

exports.main = async (event) => {
  const { username, password } = event;
  if (!username || !password) {
    return { success: false, message: '账号密码必填' };
  }

  try {
    // 自举：如果库里没有任何管理员，自动创建默认账号
    const total = await db.collection('admins').count();
    if (!total.total) {
      await db.collection('admins').add({
        data: {
          username: 'admin',
          passwordHash: sha256('admin@123'),
          phoneNumber: '13800000000',
          createdAt: new Date()
        }
      });
    }

    const res = await db.collection('admins').where({ username }).limit(1).get();
    const admin = res.data && res.data[0];
    if (!admin || admin.passwordHash !== sha256(password)) {
      return { success: false, message: '账号或密码错误' };
    }

    const token = genToken();
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    await db.collection('admin_sessions').add({
      data: { token, adminId: admin._id, expiresAt, createdAt: new Date() }
    });

    return {
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        phoneNumber: admin.phoneNumber
      }
    };
  } catch (e) {
    console.error('adminLogin error', e);
    return { success: false, message: e.message };
  }
};
