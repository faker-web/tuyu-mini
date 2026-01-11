// pages/path-note-detail/header/index.js
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    name: String,
    images: Array,
    fin_place_count: Number,
    place_count: Number,
    isUserPath: Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
    current: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onImageLoad(e) {
      if (this.data.current === 0) {
        const windowWidth = wx.getSystemInfoSync().windowWidth
        const height = e.detail.height * (windowWidth / e.detail.width)
        this.triggerEvent('height', height * 2)
      }
    },
    onImageClick(e) {
      const index = e.currentTarget.dataset.index;

      this.setData({
        current: index
      })
    }
  }
})