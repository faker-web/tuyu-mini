import { request } from '../../../utils/req';

export async function getTabs() {
	const { data } = await request({
		method: 'POST',
		url: '/fuyu/path/groups',
		data: {
			province: "beijing"
		}
	});

	return data;
}

function getCompaines(places) {
	return (places || []).map(it => {
		if (!it.company_info) return false;
		else {
			return {
				id: it.company_info.id,
				avatar: it.company_info.logo,
				name: it.company_info.name
			}
		}
	}).filter(Boolean)
}

export async function getPathList({ group_id }) {
	if (group_id === 'mine') {
    const app = getApp();
    if (!app.globalData.user.token) {
      return Promise.resolve([]);
    }
		const { data } = await request({
			url: '/fuyu/path/userpathlist',
			data: {
				province: "beijing"
			}
		});
		return data.map(item => {
			return {
				...item,
				companies: getCompaines(item?.places)
			}
		});
	}
	else {
		const { data } = await request({
			url: '/fuyu/path/pathlist',
			data: {
				province: "beijing",
				group_id: +group_id,
			}
		});
		return data.map(item => {
			return {
				...item,
				companies: getCompaines(item?.places)
			}
		});
	}
}