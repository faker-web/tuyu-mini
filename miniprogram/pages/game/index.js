import loginBehavior from '../../behaviors/login/index';
import { getActivityInfo } from '../../service/coupons/index';
import { getEnv } from '../../utils/req';

Page({
  behaviors: [loginBehavior],
  data: {
    bgImage: 'https://oss.storyhub.cc/h5/20250414-214818.jpeg',
    url: '', // 替换为你需要加载的网页地址
  },
  
  onLoad: function(options) {
    this.options = options;
  },
  async onLogined() {
    const data = await getActivityInfo(this.options.id)
    if (data?.data?.content?.bg_img) {
      this.setData({bgImage: data?.data?.content?.bg_img})
    }
    if (!this.data.isUserAccount) {
      return;
    }
    

    this.goView()
    
  },
  goView() {
    const url = 'https://oss.storyhub.cc/h5/game/v18/game/index.html';
    // const url = 'http://192.168.71.132:8080/index.html'
    const query = [
      getEnv() === 'stage' ? 'env=stage' : 'env=production',
      'token=' + encodeURIComponent(getApp().globalData?.user?.token),
      'id=' + (this.options.id || '1'),
      this.options.activity ? 'activity=' + this.options.activity : ''
    ].filter(Boolean)

    const path = (url + '?' + query.join('&'))
    console.log('--path', path)
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