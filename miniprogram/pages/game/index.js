import loginBehavior from '../../behaviors/login/index';
import { getEnv } from '../../utils/req';

Page({
  behaviors: [loginBehavior],
  data: {
    url: '' // 替换为你需要加载的网页地址
  },
  
  onLoad: function(options) {
    this.options = options;
  },
  onLogined() {
    if (!this.data.isUserAccount) {
      return;
    }

    this.goView()
    
  },
  goView() {
    const url = 'https://oss.storyhub.cc/h5/game/v6/index.html';
    // const url = 'http://192.168.71.132:8080/index.html'
    const query = [
      getEnv() === 'stage' ? 'env=stage' : 'env=production',
      'token=' + encodeURIComponent(getApp().globalData?.user?.token),
      'id=' + (this.options.id || '1'),
    ]

    const path = (url + '?' + query.join('&'))
    this.setData({
      url: path
    });
  },
  async onRegisterAccount(e) {
    await this.onRegister(e)
    setTimeout(() => {
      this.goView()
    }, 200)
  }
});