// pages/sign-in/prize/index.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    activityId: String,
    prizeCount: Number
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGoToCoupon() {
      wx.navigateTo({
        url: '/pages/game/index?id=' + this.properties.activityId + '&activity=member',
      })
    }
  },
  
})