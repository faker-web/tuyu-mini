import { request } from '../../utils/req';

export async function getCouponList({status, count_only}) {
  const { data } = await request({
		url: '/fuyu/user/coupons',
		data: {
			status: +status,
			count_only: count_only || false
		}
  });

  return data;
}


export async function getCouponsByUserPath(user_path_id, path_id) {
	const { data } = await request({
		url: '/fuyu/userpath/coupons',
		data: {
			user_path_id,
			path_id
		}
	});
	return data;
}

export async function getCouponsByPath(path_id) {
	const { data } = await request({
		url: '/fuyu/path/coupons',
		data: {
			path_id: +path_id
		}
	});
	return (data || []).map(item => {
		return {
			...item,
			user_coupon_id: item.type === 4 ? -1 : item.user_coupon_id,
			should_send: item.type === 4 ? false : item.should_send
		}
	});
}

export async function getCoupon(coupon_id) {
	await request({
		url: '/fuyu/user/sendcoupon',
		data: {
			coupon_id
		}
	})
}

export async function useCoupon(data) {
	await request({
		url: '/fuyu/user/usecoupon',
		data
	});
}

export async function couponInfo(path_id) {
	const { data } = await request({
		url: '/fuyu/config/info',
		data: {
      key: 'path_coupon',
      from: '' + path_id
    }
  });
  return { data: data.data };
}

export async function getActivityInfo(id) {
	try {
		const data = await request({
			method: 'GET',
			url: '/fuyu/activity/detail?id=' + id,
		});
		return data
	}
	catch (e) {
		return {}
	}
}

export async function finshedPath(path_id) {
	try {
		const { data } = await request({
			method: 'POST',
			url: '/fuyu/path/userpathcheck/finishedcheck',
			data: {
				path_id: +path_id
			}
		})

		return {
			is_finished: data.is_finished,
			coupon_list: data.coupon_list
		}
	}
	catch (e) {
		throw e
	}
}