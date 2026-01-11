// components/point/index.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    size: {
      type: Number,
      value: 22
    }
  },

  observers: {
    'size': function(size) {
      this.setData({
        imageSize: size * 2
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    imageSize: 22 * 2
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})