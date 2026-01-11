// components/path-note-list/spot/index.js
import { checkPath } from '../../../service/path-note/path-detail';
import loginBehavior from '../../../behaviors/login/index';
import { getEnv } from '../../../utils/req';

function validatePos(source, target) {
  if (getEnv() === 'stage') {
    return true;
  }
  return getDistance(source.latitude, source.longitude, target.latitude, target.longitude) < 5;
}

const EARTH_RADIUS = 6378.137;// 地球半径,单位千米
//将角度换算成弧度
function rad(d) {
	return d * Math.PI / 180.0;
}
/**
* 用来比较是否在规定考勤范围
* @param lat1第一个纬度
* @param lng1第一个经度
* @param lat2第二个纬度
* @param lng2第二个经度
* @return 两个经纬度的距离（km）
*/
function getDistance(lat1, lng1, lat2, lng2) {
    const radLat1 = rad(lat1);
    const radLat2 = rad(lat2);
    const a = radLat1 - radLat2;
    const b = rad(lng1) - rad(lng2);
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * EARTH_RADIUS;
    //此处加上double类型转换是因为对于在几百的距离差值之前计算为0，无法达到预期效果
    s = Math.round(s * 10000) / 10000;
    s = s * 10000/ 10000;
    return s;
}

Component({
  options: {
    addGlobalClass: true
  },
  behaviors: [loginBehavior],

  /**
   * 组件的属性列表
   */
  properties: {
    place_id: String,
    path_id: String,
    user_path_id: String,
    image: String,
    name: String,
    checked: Boolean,
    c_visited: String,
    content_info: Object,
    plain_text: String,
    product_ids: Array,
    open_time_str: String,
    close_time_str: String,
    product_map: Object,
    location: String,
    isUserPath: Boolean,
    loc_lat: Number,
    loc_long: Number,
    showOrderBtn: Boolean,
    orderStatus: Number, // 0 未预约
    hint: String,
    company_info: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    isChecked: false,
    productModal: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onPrivilege(info) {
      this.triggerEvent('onPrivilege', info.detail);
    },
    onImageClick(e) {
      const index = e.detail.index;
      this.triggerEvent('onImageClick', { index, images: this.data.content_info.image_points });
    },
    async onChecked(e) {
      const location = await wx.getLocation();
 
      const { longitude, latitude } = location;
      const target = { longitude: this.data.loc_long, latitude: this.data.loc_lat };
      if (!validatePos({ longitude, latitude }, target)) {
        wx.showToast({
          icon: 'none',
          title: '打卡失败，检测到不在附近'
        });
        return;
      }

      if (this.pending) return;
      this.pending = true;
      try {
        await checkPath({ place_id: this.data.place_id, path_id: this.data.path_id });
        this.triggerEvent('spotChecked');
        this.setData({
          isChecked: true
        });
      }
      catch (e) {
        this.pending = false;
      }
    },
    async onLoginChecked(e) {
      await this.onRegister(e)
      this.onChecked(e)
    },
    onClickProduct(e) {
      const id = e.currentTarget.dataset.info;
      const item = this.data.product_map[id];
      const type = item.type;
      if (type === 1) {
        wx.navigateTo({
          url: '/pages/detail/index?id=' + id,
        });
      }
      else {
        this.setData({
          productModal: {
            item
          }
        });
      }
    },
    onClose() {
      this.setData({
        productModal: false,
      })
    },
    onSpotGoTo() {
      const mp = wx.createMapContext('myPageMap');
      mp.openMapApp({
        longitude: this.data.loc_long,
        latitude: this.data.loc_lat,
        destination: this.data.location,
        success: function (res) {
          console.log('-- success',)
        },
        fail: function () {
          console.log('error');
          wx.showToast({
            icon: 'none',
            title: '调起地图应用失败'
          });
        },
        complete(res) {
          console.log(res)
        }
      })
    },

    onOrder() {
      wx.navigateTo({
        url: `/pages/order/index?place_id=${this.properties.place_id}&user_path_id=${this.properties.user_path_id}&orderStatus=${this.properties.orderStatus}&hint=${this.properties.hint}`,
      })
    }
  }
})