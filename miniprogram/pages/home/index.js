const app = getApp()
import { getUser, registerAccount } from '../../utils/auth'
import { request } from '../../utils/req';

Page({
  onShareAppMessage() {
    return {
      title: '福鱼文创',
      path: 'pages/home/index',
      imageUrl: 'https://fuyuoss.oss-cn-shanghai.aliyuncs.com/front-end/share-mini.png'
    }
  },

  async onLoad() {
    this.firstRender = true
    if (!app.globalData?.user?.token) {
      await getUser()
    }
    await Promise.all([this.getInitData(), this.getBanners()])
    const isLogined = app?.globalData?.user?.token
    this.setData({ isLogined: !!isLogined })
    this.setData({ showLoading: false })
    await this.getUserInfo()
    this.firstRender = false
  },

  async onShow() {
    if (!this.firstRender) {
      if (!app.globalData?.user?.token) {
        await getUser()
      }
      this.getUserInfo()
    }
  },

  async getUserInfo() {
    const { data } = await request({
      method: 'GET',
      url: '/fuyu/getuserinfo',
    });

    const { user: { avatar } } = data;
    avatar && this.setData({ avatar })
  },

  data: {
    navBarHeight: app.globalData.navBarHeight,
    menuRight: app.globalData.menuRight,
    menuBotton: app.globalData.menuBotton,
    menuHeight: app.globalData.menuHeight,
    menuTop: app.globalData.menuTop,
    position: "北京",
    isLogined: false,
    swiper: [],
    card: [],
    pageSize: 10,
    pageNo: 0,
    total: 0,
    fetchProductsInit: true,
    defaultData: {
      title: "我的主页", // 导航栏标题
    },
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    circular: true,
    interval: 5000,
    duration: 500,
    showLoading: true,
    titleBarVisible: false,
    selected: 0,
    banners: [],
    latitude: 23.096994,
    longitude: 113.324520,
    selectList: [
      {
        text: "路书",
        iconPath: "../../images/icons/icon-1.png",
        selectedIconPath: "../../images/icons/icon-1-active.png",
        index: 0,
      },
      {
        text: "文创",
        iconPath: "../../images/icons/icon-2.png",
        selectedIconPath: "../../images/icons/icon-2-active.png",
        index: 1,
      },
    ],
    list: [],
    avatar: 'https://fuyuoss.oss-cn-shanghai.aliyuncs.com/front-end/home-icon.png',
  },

  async onRegisterAccount(e) {
    const code = e.detail.code;
    if (!code) {
      wx.showToast({
        icon: 'error',
        title: '登陆失败，请重试'
      })
      return
    } 
    this.setData({ isLogined: true })
    await registerAccount(code);

    const currentTarget = e.currentTarget;
    if (currentTarget && currentTarget.dataset?.id === 'h5') {
      this.bannerClick(e)
      return
    }
    this.gotoProtral()
  },

  async getInitData() {
    const { data } = await request({
      method: 'POST',
      url: '/fuyu/spot/list',
      data: {
        province: "beijing"
      }
    });
    let { list = [], center_geo: { loc_long, loc_lat } } = data
    list = list.sort((a, b) => (a.sort - b.sort))
    this.setData({ list, latitude: loc_lat, longitude: loc_long })
  },

  async getBanners() {
    const { data } = await request({
      method: 'POST',
      url: '/fuyu/banner',
      data: {
        province: "beijing"
      }
    });
    let { list = []} = data
    list = list.map(({ banner_img, target_type }) => {
      return { url: banner_img, target_type }
    })
    this.setData({ banners: list })
  },

  onLoginSuccess() {
    this.setData({ isLogined: true })
  },

  bindscrolltoupper() {
    this.setData({ titleBarVisible: false })
  },

  bindscroll(e) {
    const { scrollTop } = e.detail
    if (scrollTop > 80) {
      this.setData({ titleBarVisible: true })
    }
    if (scrollTop < 80) {
      this.setData({ titleBarVisible: false })
    }
  },

  switchTab(event) {
    const idx = event.currentTarget.dataset.id
    this.setData({
      selected: idx
    })
  },

  onFind() {
    wx.navigateTo({
      url: `/pages/scenic-map/index?longitude=${this.data.longitude}&latitude=${this.data.latitude}`,
    });
  },

  gotoProtral() {
    wx.navigateTo({
      url: `/pages/protral/index`,
    });
  },

  bannerClick(e) {
    const index = e.currentTarget.dataset.index
    const banner = this.data.banners[index]
    if (!banner) return
    const target_type = banner.target_type;
    const id = banner.target_value;
    if (target_type === 2) {
      wx.navigateTo({
        url: `/pages/game/index?id=` + id
      })
    }
  }
});
