// pages/article/article.js
const app = getApp();

Page({
  data: {
    loading: true,
    article: { title: '', content: '', updatedAtText: '' },
    hasPhone: false
  },

  onLoad(options) {
    // 未授权拦截
    if (!app.globalData.openid) {
      wx.redirectTo({ url: '/pages/auth/auth' });
      return;
    }
    const slug = options.slug || 'privacy';
    this.loadArticle(slug);

    // 检查是否已经绑定手机号（本地缓存简单标记）
    this.setData({ hasPhone: !!wx.getStorageSync('hasPhone') });
  },

  async loadArticle(slug) {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getArticle',
        data: { slug }
      });
      if (!result || !result.success) throw new Error('获取文章失败');
      const a = result.data || {};
      const updatedAtText = a.updatedAt
        ? new Date(a.updatedAt).toLocaleString()
        : '';
      this.setData({
        loading: false,
        article: {
          title: a.title || '隐私协议',
          content: a.content || '<p>本隐私协议待管理员编辑</p>',
          updatedAtText
        }
      });
    } catch (e) {
      console.error(e);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /**
   * 获取手机号（仅授权 = 可选）
   * 新版接口需要传 code，由云函数解码
   */
  async onGetPhoneNumber(e) {
    if (!e.detail || !e.detail.code) {
      wx.showToast({ title: '已取消', icon: 'none' });
      return;
    }
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getPhoneNumber',
        data: { code: e.detail.code }
      });
      if (!result || !result.success) throw new Error('解析失败');
      wx.setStorageSync('hasPhone', true);
      this.setData({ hasPhone: true });
      wx.showToast({ title: '已绑定', icon: 'success' });
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '绑定失败', icon: 'none' });
    }
  }
});
