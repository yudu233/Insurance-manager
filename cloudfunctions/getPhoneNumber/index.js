// cloudfunctions/getPhoneNumber/index.js
// 通过 wx.login 之后 button getphonenumber 返回的 code，调云开发能力解析手机号
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  const { code } = event;

  if (!OPENID) return { success: false, message: '未获取到 openid' };
  if (!code) return { success: false, message: 'code 不能为空' };

  try {
    // openapi 方式：cloud.openapi.phonenumber.getPhoneNumber
    // 测试号也可以使用，正式号需要在云开发控制台先开通对应权限
    const res = await cloud.openapi.phonenumber.getPhoneNumber({ code });
    const phoneInfo = res && res.phoneInfo;
    if (!phoneInfo || !phoneInfo.phoneNumber) {
      return { success: false, message: '解析手机号失败' };
    }

    await db.collection('auth_users').where({ openid: OPENID }).update({
      data: {
        phoneNumber: phoneInfo.phoneNumber,
        purePhoneNumber: phoneInfo.purePhoneNumber,
        countryCode: phoneInfo.countryCode,
        updatedAt: new Date()
      }
    });

    return { success: true };
  } catch (e) {
    console.error('getPhoneNumber error', e);
    return { success: false, message: e.message };
  }
};
