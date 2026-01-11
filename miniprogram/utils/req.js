export function request({ url, data, method }) {
	const authorization = getApp().globalData?.user?.token || '';
	// const authorization = '111eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIyIiwiZXhwIjoxNzc3MDgzMTU0fQ.OOC6hJwJe4QDnGXK12BJB_AOo4XHL4zJMoRihYEZC9M'
	console.log('authorization', authorization)
	const env = getEnv();
	const baseurl = env === 'stage' ? 'https://storyhub.cc/stage' : 'https://storyhub.cc'
	// const baseurl = 'https://storyhub.cc/stage'
	// const baseurl = 'https://storyhub.cc' //production

	return new Promise(function (resolve, reject) {
		wx.request({
			method: method || 'POST',
			url: `${baseurl}${url}`,
			data: JSON.stringify(data),
			header: {
				Authorization: authorization,
			},
			success: function (res) {
				const ret = res.data;

				if (ret.errno !== 10000) {
					reject(ret);
					return;
				}
				resolve(ret);
			},
			fail: function (e) {
				reject(e)
			}
		});
	})
}

export function getEnv() {
	// return 'stage'
	return 'production'
}

export const SUCCESS_CODE = 10000;

export function qsString(obj) {
	return Object.keys(obj).map(key => `${key}=${obj[key]}`).join('&')
}