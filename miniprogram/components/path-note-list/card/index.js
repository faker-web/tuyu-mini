// components/path-note-list/card/index.js
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    // status_flag 4 未开始 1 进行中 3 已完成 2 已结束
    item: {
      type: Object,
      value: {}
    },
    showProgress: {
      type: Boolean,
      value: false
    },
  },

  observers: {
    'item.companies': function(newVal) {
      const uniqueCompanies = (newVal || []).reduce((acc, item) => {
        if (acc.find(it => it.id === item.id)) {
          return acc
        }
        return [...acc, item]
      }, [])
      this.setData({
        companies: uniqueCompanies
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    companies: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClick() {
      this.triggerEvent('click', { ...this.data.item });
    }
  }
});