// cloudfunctions/getArticle/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const slug = event.slug || 'privacy';
  try {
    const res = await db.collection('articles').where({ slug }).limit(1).get();
    const data = res.data && res.data[0];
    if (!data) {
      return {
        success: true,
        data: {
          slug,
          title: '隐私协议',
          content: '<p>本隐私协议待管理员编辑</p>',
          updatedAt: null
        }
      };
    }
    return { success: true, data };
  } catch (e) {
    console.error('getArticle error', e);
    return { success: false, message: e.message };
  }
};
