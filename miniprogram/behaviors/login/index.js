import { registerAccount } from "../../utils/auth";

export default Behavior({
  data: {
    // * 是否为注册用户
    isUserAccount: false,
    // * 是否已经登录
    isLogined: false,
  },
  attached: function () {
    const globalData = getApp().globalData;
    this.setData(
      {
        isLogined: !!globalData.user,
        isUserAccount: !!globalData.user?.token,
      }
    );
    if (globalData.user?.token) {
      setTimeout(() => {
        this.onLogined?.();
      }, 0);
      return;
    }

    getApp().globalData.event.on('login', (params) => {
      this.setData({
        isLogined: true,
        // isUserAccount: false
        isUserAccount: params.type !== 'loginFailed',
      });
      this.onLogined && this.onLogined();
    });
  },
  methods: {
    async onRegister(e) {
      const code = e.detail.code;
      await registerAccount(code);
    }
  }
})