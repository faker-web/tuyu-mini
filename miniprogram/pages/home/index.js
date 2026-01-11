const app = getApp()
import { getUser, registerAccount } from '../../utils/auth'
import { request } from '../../utils/req';
import { getPathList } from '../../components/path-note-list/service/group';

Page({
  onShareAppMessage(res) {
    if (res.from === 'button') {
      const { id, name, trigger, img } = res.target.dataset;
      if (trigger === 'product') {
        return {
          title: name,
          path: `/pages/store-list/index?activity_id=${id}&name=${name}&from=share`,
          imageUrl: img
        }
      }
    }
    return {
      title: '拾光坊',
      path: 'pages/home/index',
      imageUrl: 'https://fuyuoss.oss-cn-shanghai.aliyuncs.com/front-end/share-mini.png'
    }
  },

  data: {
    navBarHeight: app.globalData.navBarHeight,
    menuRight: app.globalData.menuRight,
    menuBotton: app.globalData.menuBotton,
    menuHeight: app.globalData.menuHeight,
    menuTop: app.globalData.menuTop,
    stamp_count: 0,
    user_path_count: 0,
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
    pathList: [],
    latitude: 23.096994,
    longitude: 113.324520,
    selectList: [
      {
        text: "热门活动",
        index: 0,
      },
      {
        text: "热销商品",
        index: 1,
      },
    ],
    list: [],
    avatar: 'https://fuyuoss.oss-cn-shanghai.aliyuncs.com/front-end/home-icon.png',
    products: [],
    subtitleClick() {
      // app.globalData.tabBarParams = {
      //   selected: 1
      // };
      wx.switchTab({
        url: `/pages/protral/index`,
      });
    },
  },

  async onLoad() {
    this.firstRender = true
    try {
      if (!app.globalData?.user?.token) {
        await getUser()
      }
      await Promise.all([
        this.getUserInfo(),
        this.getBanners(),
        this.getUserRecentBuy(),
        // this.getProductSuggestList(),
        this.getProductSuggestPathList()
      ])
    } catch(err) {

    }
    const isLogined = app?.globalData?.user?.token
    this.setData({ isLogined: !!isLogined })
    this.setData({ showLoading: false })
    this.firstRender = false
  },

  async onShow() {
    if (!this.firstRender) {
      if (!app.globalData?.user?.token) {
        await getUser()
      }
      this.getUserInfo()
    }
    const isLogined = app?.globalData?.user?.token
    this.setData({ isLogined: !!isLogined })
    if (isLogined) {
      this.getUserRecentBuy()
    }
  },

  async getUserInfo() {
    const { data } = await request({
      method: 'GET',
      url: '/fuyu/getuserinfo',
    });

    const { user: { avatar }, user_stats: { stamp_count, user_path_count } } = data;
    avatar && this.setData({ avatar, stamp_count, user_path_count })
  },

  async getUserRecentBuy() {
    const { data } = await request({
      url: '/fuyu/product/user/recent',
      data: {
        "province": "beijing",
        "type": 3
      }
    });
    this.setData({ products: data })

    console.log('data', data)
  },

  async getProductSuggestPathList() {
    const { data } = await request({
      url: '/fuyu/path/suggest/pathlist',
      data: {
        "province": "beijing",
        "group_id": 1,
      }
    });

    this.setData({ pathList: data.map(item => ({
      ...item,
      companies: (item?.places || []).map(item => {
        if (!item.company_info) {
          return false
        }
        return {
          id: item.company_info.id,
          avatar: item.company_info.logo,
          name: item.company_info.name
        }
      }).filter(Boolean)
    })), })
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
  },

  // async getProductSuggestList() {
  //   const { data } = await request({
  //     method: 'POST',
  //     url: '/fuyu/spot/list',
  //     data: {
  //       province: "beijing",
  //       act_id: -1
  //     }
  //   });
  //   let { list = []} = data
  //   list = list.sort((a, b) => (a.sort - b.sort))
  //   this.setData({ list})
  // },

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
    wx.switchTab({
      url: `/pages/protral/index`,
    });
  },

  gotoActive() {
    wx.switchTab({
      url: `/pages/active/index`,
    });
  },

  onItemClick(e) {
    const detail = e.detail;
    const queryArr = [
      detail.user_path_id && `user_path_id=${detail.user_path_id}`,
      `path_id=${detail.path_id}`,
      `group_id=${this.data.group_id}`
    ].filter(Boolean);

    wx.navigateTo({
      url: `/pages/path-note-detail/index?${queryArr.join('&')}`,
      fail: function (e) {
        console.log(e)
      },
      events: {
        refresh: () => {
          this.refresh();
        }
      }
    });
  },

  onBookClick(e) {
    const type = e.currentTarget.dataset.type
    const bookid = e.currentTarget.dataset.bookid
    const productid = e.currentTarget.dataset.productid
    console.log('type', type, bookid, productid)
    if (type == 1) {
      wx.navigateTo({
        url: `/pages/detail/index?id=${productid}`
      });
      return
    } else if (type == 2) {
      wx.navigateTo({
        url: `/pages/signet-detail/index?book_id=${bookid}&stamp_pid=${productid}`,
      })
      return
    }

    wx.switchTab({
      url: '/pages/protral/index',
    })
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
