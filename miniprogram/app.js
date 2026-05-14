// app.js
App({
  globalData: {
    // TODO: 替换为你的 CloudBase 环境 ID
    envId: 'your-env-id',
    userInfo: null,
    openid: null
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      env: this.globalData.envId,
      traceUser: true
    });

    // 拉取本地缓存的授权信息
    const userInfo = wx.getStorageSync('userInfo');
    const openid = wx.getStorageSync('openid');
    if (userInfo && openid) {
      this.globalData.userInfo = userInfo;
      this.globalData.openid = openid;
    }
  }
});
