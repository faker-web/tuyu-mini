import dayjs from "dayjs";
import {
  addToPage,
  corpStamp,
  getBookInfo,
  getStampInfo,
} from "../../service/signet/index";
import loginBehavior from "../../behaviors/login/index";
const chooseLocation = requirePlugin("chooseLocation");
Page({
  behaviors: [loginBehavior],
  /**
   * 页面的初始数据
   */
  data: {
    stamp_pid: 0,
    from_book_id: 0,
    owned: false,
    bgImage: "",
    signet: {},
    name: "",
    time: "",
    timeStr: "",
    location: {},
    isEdit: false,
    modalValue: "",
    pageError: false,
    canCorpStamp: false,
    isStampOrigin: false,
    artist: null,
    company: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.options = options;
    console.log("--options", options);
    wx.getLocation({
      success: (res) => {
        this.currentLocation = {
          latitude: res.latitude,
          longitude: res.longitude,
        };
      },
    });
    this.setData({
      from_book_id: this.options.book_id || 0,
    });
  },

  onLogined() {
    this.initValue();
  },

  async initValueCore() {
    const date = dayjs();
    // 上传图片入口
    if (this.options.book_id && this.options.image) {
      const data = await getBookInfo(this.options.book_id);
      const bookInfo = data.BookInfo;
      const bookConfig = bookInfo.content.book_config;
      const image_url = decodeURIComponent(this.options.image);
      let corpped = this.data.signet.corppedStamp;
      if (!corpped) {
        corpped = await this.getCorppedStamp(image_url);
      }
      this.setData({
        bgImage: bookConfig.page_bg_img,
        timeStr: date.format("YYYY年MM月DD日 HH:mm:ss"),
        canCorpStamp: corpped && corpped !== "FAILED" ? true : false,
        isStampOrigin: corpped === "FAILED" ? true : false,
        signet: {
          image_url,
          corppedStamp: corpped,
        },
      });
    }
    // 扫一扫入口 or nfc 入口
    else {
      const data = await getStampInfo(this.options.stamp_pid, this.options.key);
      // 如果返回的商品type 不是2，就报个错，提示无效二维码  1-正经文创  2-印章 3印章本
      if (data.product_info.type !== 2) {
        wx.showToast({
          icon: "error",
          title: "提示无效二维码",
        });

        this.setData({
          pageError: true,
        });
        return;
      }
      const bookInfo = data.product_info;
      const bookConfig = bookInfo.content.book_config;
      console.log("--bookInfo", bookInfo);
      this.setData({
        owned: data.owned,
        stamp_pid: this.options.stamp_pid,
        name: bookInfo.name,
        bgImage: bookConfig.page_bg_img,
        time: date.unix(),
        timeStr: date.format("YYYY年MM月DD日 HH:mm:ss"),
        isStampOrigin: true,
        signet: {
          image_url: bookInfo.show_image,
        },
        artist: { ...bookInfo.artist },
        company: { ...bookInfo.company },
      });
    }
  },

  async initValue() {
    try {
      wx.showLoading({
        title: "加载中...",
      });
      await this.initValueCore();
    } catch (e) {
    } finally {
      wx.hideLoading();
    }
  },

  async getCorppedStamp(imageUrl) {
    try {
      const image = decodeURIComponent(imageUrl);
      const cropped = await corpStamp(image);
      return cropped;
    } catch (e) {
      return "FAILED";
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const location = chooseLocation.getLocation();
    if (!location) return;
    const name = [location.city, location.district, location.name].filter(
      Boolean
    );
    this.setData({
      location: {
        name: name.join(","),
        loc_lat: location.latitude,
        loc_long: location.longitude,
      },
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    chooseLocation.setLocation(null);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
  onEdit() {
    this.setData({
      isEdit: true,
      modalValue: this.data.name,
    });
  },
  onNameModalClick(e) {
    const detail = e.detail;
    if (e.detail.index == 0) {
      this.setData({
        isEdit: false,
      });
    } else {
      if (this.data.modalValue.length > 8) {
        wx.showToast({
          icon: "none",
          title: "名称长度小于 8 个字符",
        });
        return;
      }
      this.setData({
        isEdit: false,
        name: this.data.modalValue,
      });
    }
  },
  onNameChange(e) {
    this.setData({
      modalValue: e.detail.value,
    });
  },
  onMapOpen() {
    // const key = 'LXABZ-P2ICT-ATAXX-VM4X3-LGHHE-ZBFHI';
    const key = "3DJBZ-M2VKZ-Z3QXQ-7HOFI-RUEL6-ELBPI";
    const referer = "fuyu";

    const location = JSON.stringify({
      latitude: this.currentLocation.latitude,
      longitude: this.currentLocation.longitude,
    });
    const category = "生活服务,娱乐休闲";

    wx.navigateTo({
      url:
        "plugin://chooseLocation/index?key=" +
        key +
        "&referer=" +
        referer +
        "&location=" +
        location +
        "&category=" +
        category,
    });
  },
  onCancel() {
    const pages = getCurrentPages();
    if (pages.length === 1) {
      wx.reLaunch({
        url: "/pages/home/index",
      });
      return;
    }
    wx.navigateBack({
      fail(e) {
        wx.redirectTo({
          url: "/pages/home/index",
        });
      },
    });
  },
  async onConfirm() {
    if (!this.data.isUserAccount) return;

    if (!this.data.location || !this.data.location.name) {
      this.onMapOpen();
      return;
    }
    const { pageNum, book_id, image, stamp_pid } = this.options;
    if (!this.data.name) {
      wx.showToast({
        icon: "none",
        title: "请填写印章名称",
      });
      return;
    }
    // nfc 入口
    if (stamp_pid && !book_id) {
      const couponId = this.options.couponId;
      wx.navigateTo({
        url:
          "/pages/signet-move/index?stamp_pid=" +
          stamp_pid +
          "&key=" +
          this.options.key +
          (couponId ? `&couponId=${couponId}` : ""),
        success: (res) => {
          res.eventChannel.emit("stampInfo", {
            location: this.data.location,
            name: this.data.name,
            time: this.data.time,
            image_url: this.data.signet.image_url,
            stamp_pid: this.options.stamp_pid,
          });
        },
      });
      return;
    }

    await addToPage({
      stamp_pid: +stamp_pid,
      book_id: +book_id,
      page_num: +pageNum,
      name: this.data.name,
      image_url: this.data.isStampOrigin
        ? this.data.signet.image_url
        : this.data.signet.corppedStamp,
      location: this.data.location.name,
      loc_lat: this.data.location.loc_lat,
      loc_long: this.data.location.loc_long,
      source: this.options.key,
    });

    const ec = this.getOpenerEventChannel();
    ec.emit("refresh");
    wx.navigateBack();
  },
  async onRegisterAndRefresh(e) {
    await this.onRegister(e);
    this.initValue();
  },
  isStampOrigin(e) {
    const { isStampOrigin } = e.detail;
    this.setData({
      isStampOrigin,
    });
  },
});
