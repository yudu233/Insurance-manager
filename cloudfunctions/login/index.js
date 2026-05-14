// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const { OPENID, UNIONID } = wxContext;
  const { userInfo = {} } = event;

  if (!OPENID) {
    return { success: false, message: '获取 openid 失败' };
  }

  const now = new Date();
  const data = {
    openid: OPENID,
    unionid: UNIONID || null,
    nickName: userInfo.nickName || '',
    avatarUrl: userInfo.avatarUrl || '',
    updatedAt: now
  };

  try {
    const existed = await db.collection('auth_users').where({ openid: OPENID }).get();
    if (existed.data && existed.data.length) {
      await db.collection('auth_users').doc(existed.data[0]._id).update({ data });
    } else {
      await db.collection('auth_users').add({
        data: { ...data, createdAt: now }
      });
    }
    return { success: true, openid: OPENID };
  } catch (e) {
    console.error('login error', e);
    return { success: false, message: e.message };
  }
};
