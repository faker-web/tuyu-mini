const app = getApp()
import { getCouponList } from '../../service/coupons/index';
import { getUser } from '../../utils/auth'
import { request, SUCCESS_CODE } from '../../utils/req';

const BOOK_TYPE = 3 // 印章本
const CARD_TYPE = 1 // 冰箱贴

Page({

  onShow: function() {
    const isLogined = app?.globalData?.user?.token
    this.setData({ isLogined: !!isLogined })
    const selected = app.globalData?.tabBarParams?.selected || 0;
    this.setData({ selected })
    if (app.globalData && app.globalData.tabBarParams) {
      app.globalData.tabBarParams.selected = 0;
    }
    if (isLogined) {
      this.initData()
    }
  },

  onLoginSuccess() {
    this.setData({ isLogined: true })
    this.initData()
  },

  async initData() {
    try {
      await Promise.all([
        this.getCouponData(),
        this.getUserData(),
        this.getUserProductData(BOOK_TYPE),
        this.getUserProductData(CARD_TYPE)
      ])
      this.setData({ showLoading: false })
    } catch (error) {
      this.setData({ showLoading: false })
      wx.showToast({
        icon: 'error',
        title: '获取失败，请重试',
      })
      console.log(error)
    }
  },

  async onReady() {
    if (!app.globalData?.user?.token) {
      try {
        await getUser()
      } catch(err) {

      }
      const isLogined = app?.globalData?.user?.token
      this.setData({ isLogined: !!isLogined })
    } else {
      this.setData({ isLogined: true })
    }
    if (this.data.isLogined) {
      this.initData()
    } else {
      this.setData({ showLoading: false })
    }
  },

  data: {
    isLogined: false,
    couponCount: 0,
    showLoading: true,
    navBarHeight: app.globalData.navBarHeight,
    selected: 0,
    countList: [],
    stamp_count: 0,
    show_checked_in: false,
    member_points: 0,
    selectList: [
      {
        text: "我的印章本",
        index: 0,
      },
      {
        text: "我的文创",
        index: 1,
      },
    ],
    books: [],
    products: [],
    showProductEmpty: false,
    nickname: '小福鱼',
    avatar: 'https://fuyuoss.oss-cn-shanghai.aliyuncs.com/front-end/home-icon.png',
  },

  async getUserData() {
    const { data } = await request({
      method: 'GET',
      url: '/fuyu/getuserinfo',
    });

    const { user, user_stats } = data;
    const {
      avatar,
      nickname,
    } = user
    const { product_count, book_count, stamp_count, visit_count, show_checked_in, member_points } = user_stats

    const statusList = [{
      title: '印章本',
      value: book_count
    }, {
      title: '文创',
      value: product_count
    }, {
      title: '足迹',
      value: visit_count
    }]

    this.setData({
      avatar: avatar || 'https://fuyuoss.oss-cn-shanghai.aliyuncs.com/front-end/home-icon.png',
      nickname: nickname || '小福鱼',
      countList: statusList,
      stamp_count,
      show_checked_in,
      member_points
    })
  },

  async getUserProductData(type) {
    const { data, errno } = await request({
      method: 'POST',
      url: '/fuyu/product/user/list',
      data: {
        type,
        province: ''
      }
    });

    if (SUCCESS_CODE != errno && this.data.isLogined) {
      wx.showToast({
        icon: 'error',
        title: '获取失败，请重试',
      })
      return
    }
    
    if (type === BOOK_TYPE) {
      const books = data.map((item) => {
        const { page_num, stamp_num } = item?.all_content?.book_config || {}
        return {
          img: item.show_image,
          used: stamp_num,
          total: page_num,
          id: item.id,
          user_product_id: item.user_product_id
        }
      })
      // books.push({
      //   img: 'https://fuyuoss.oss-cn-shanghai.aliyuncs.com/front-end/add-book.png',
      //   type: 'add',
      // })
      this.setData({ books })
    } else {
      const products = data.map((item) => {
        return {
          img: item.show_image,
          name: item.name,
          id: item.id,
          user_product_id: item.user_product_id,
          ...item
        }
      })
      this.setData({
        products,
        showProductEmpty: products.length === 0
      })
    }
  },

  async getCouponData() {
    const data = await getCouponList({ status: 1, count_only: true });
    this.setData({
      couponCount: data?.count
    });
  },

  switchTab(event) {
    const idx = event.currentTarget.dataset.id
    this.setData({
      selected: idx
    })
    this.getUserProductData(idx === 0 ? BOOK_TYPE : CARD_TYPE)
  },

  onBookClick(event) {
    const id = event.currentTarget.dataset.id
    const type = event.currentTarget.dataset.type
    console.log('id,type=', id, type)
    if (type === 'add') {
      wx.navigateTo({
        url: `/pages/book-list/index`
      });
    }
    else {
      const bid = event.currentTarget.dataset.bid;
      wx.navigateTo({
        url: '/pages/signet-detail/index?book_id=' + bid,
      })
    }
  },
  onGoToCoupon() {
    wx.navigateTo({
      url: '/pages/coupon/list/index',
    });
  },

  onProductClick(event) {
    const id = event.currentTarget.dataset.id
    const item = this.data.products.find((item) => item.id = id)
    const { resource, osd } = item?.ar_config
    debugger
    wx.navigateTo({
      url: `/pages/osd-ar/index?id=${id}&videoUrl=${encodeURIComponent(resource)}&osd=${encodeURIComponent(osd)}`
    });
  },

  onGoToCheckIn() {
    wx.navigateTo({
      url: '/pages/sign-in/index',
    })
  }
});
