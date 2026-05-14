// pages/auth/auth.js
const app = getApp();

Page({
  data: {
    loading: false
  },

  onLoad() {
    // 已经授权过的直接跳转
    if (app.globalData.userInfo && app.globalData.openid) {
      wx.redirectTo({ url: '/pages/article/article?slug=privacy' });
    }
  },

  /**
   * 用户主动点击触发；wx.getUserProfile 必须在用户点击的事件回调里直接调用
   */
  onGetUserProfile() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: async (res) => {
        const userInfo = res.userInfo; // { nickName, avatarUrl, ... }
        try {
          const { result } = await wx.cloud.callFunction({
            name: 'login',
            data: { userInfo }
          });

          if (!result || !result.success) {
            throw new Error(result && result.message || '登录失败');
          }

          app.globalData.userInfo = userInfo;
          app.globalData.openid = result.openid;
          wx.setStorageSync('userInfo', userInfo);
          wx.setStorageSync('openid', result.openid);

          wx.redirectTo({ url: '/pages/article/article?slug=privacy' });
        } catch (e) {
          console.error(e);
          wx.showToast({ title: '登录失败', icon: 'none' });
        } finally {
          this.setData({ loading: false });
        }
      },
      fail: () => {
        this.setData({ loading: false });
        wx.showToast({ title: '已取消授权', icon: 'none' });
      }
    });
  }
});
