// pages/sign-in-detail/index.js
import dayjs from 'dayjs';
import { getPointHistory } from '../../service/point/index';

Page({
  data: {
    pointList: [],
    page: 1,
    size: 10,
    hasMore: true,
    loading: false
  },
  onLoad() {
    this.loadPointList();
  },
  // 加载积分明细
  loadPointList() {
    if (this.data.loading || !this.data.hasMore) return;
    this.setData({ loading: true });
    getPointHistory({ page: this.data.page, size: this.data.size }).then(res => {
      const list = (res?.list || []).map(item => {
        return {
          title: item.description,
          value: item.change_points,
          time: dayjs(item.create_time * 1000).format('YYYY-MM-DD HH:mm:ss')
        }
      });
      const hasMore = list.length === this.data.size;
      this.setData({
        pointList: this.data.pointList.concat(list),
        page: this.data.page + 1,
        hasMore,
        loading: false
      });
    }).catch(() => {
      this.setData({ loading: false });
    });
  },
  // 触底加载更多
  onReachBottom() {
    this.loadPointList();
  }
});