// components/scrolling-number/index.js
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    // 要显示的数字
    number: {
      type: [Number, String],
      value: 0,
      observer: function(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.updateNumber(newVal, oldVal);
        }
      }
    },
    // 数字位数，0表示自动计算
    digits: {
      type: Number,
      value: 0
    },
    // 滚动动画时长（毫秒）
    duration: {
      type: Number,
      value: 1000
    },
    // 数字大小
    fontSize: {
      type: Number,
      value: 12
    },
    // 数字颜色
    color: {
      type: String,
      value: '#000000'
    },
    // 数字间距
    spacing: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    digitList: [], // 数字列表
    animationData: [], // 动画数据
    isInitialized: false // 是否已初始化
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 更新数字
     */
    updateNumber(newNumber, oldNumber = null) {
      // debugger
      const numStr = String(newNumber);
      const digits = this.properties.digits || numStr.length;
      
      // 补齐位数
      let paddedNum = numStr.padStart(digits, '0');
      
      // 解析每一位数字
      const digitList = paddedNum.split('').map((digit, index) => {
        return {
          value: parseInt(digit),
          index: index
        };
      });
      
      this.setData({ digitList });
      
      // 只有在非初始化状态且数字发生变化时才执行滚动动画
      if (this.data.isInitialized && oldNumber !== null) {
        this.startScrollAnimation();
      } else {
        // 初始化时直接设置到目标位置，不执行动画
        this.setInitialPosition();
      }
    },

    /**
     * 设置初始位置（不执行动画）
     */
    setInitialPosition() {
      const { digitList } = this.data;
      
      digitList.forEach((digit, index) => {
        const animation = wx.createAnimation({
          duration: 0 // 无动画
        });
        
        // 计算滚动距离（每个数字高度为fontSize）
        const scrollDistance = digit.value * this.properties.fontSize;
        
        // 直接设置到目标位置
        animation.translateY(-scrollDistance).step();
        
        this.setData({
          [`animationData[${index}]`]: animation.export()
        });
      });
      
      // 标记为已初始化
      this.setData({ isInitialized: true });
    },

    /**
     * 开始滚动动画
     */
    startScrollAnimation() {
      const { digitList } = this.data;
      const { duration } = this.properties;
      
      digitList.forEach((digit, index) => {
        // 延迟启动每个数字的动画，创造波浪效果
        setTimeout(() => {
          this.animateDigit(digit, index, duration);
        }, index * 50);
      });
    },

    /**
     * 为单个数字位创建动画
     */
    animateDigit(digit, index, duration) {
      const animation = wx.createAnimation({
        duration: duration,
        timingFunction: 'ease-out'
      });
      
      // 计算滚动距离（每个数字高度为fontSize）
      const scrollDistance = digit.value * this.properties.fontSize;
      
      // 创建向上滚动的动画
      animation.translateY(-scrollDistance).step();
      
      // 更新动画数据
      this.setData({
        [`animationData[${index}]`]: animation.export()
      });
    },

    /**
     * 组件初始化
     */
    onReady() {
      this.updateNumber(this.properties.number);
    }
  }
})