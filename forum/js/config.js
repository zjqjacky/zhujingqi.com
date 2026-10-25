async function hash(text) {
	const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
	return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function isAdmin(user) {
	return user?.role?.includes?.('owner') || user?.role?.includes?.('admin');
}

const ROLE_CONFIG = {
	owner: {
		label: 'V',
		color: '#d4a017',
		title: '站长'
	},
	official: {
		label: 'V',
		color: '#00aaff',
		title: '官方用户'
	},
	admin: {
		label: 'A',
		color: '#ff3b30',
		title: '联席管理员'
	},
	green_v: {
		label: 'V',
		color: '#4caf50',
		title: '绿V徽章'
	},
	purple_star: {
		label: '★',
		color: '#9c27b0',
		title: '紫星徽章'
	},
	blue_diamond: {
		label: '◆',
		color: '#2196f3',
		title: '蓝钻徽章'
	},
};

function getRoleBadge(user) {
	if (!user?.role || !Array.isArray(user.role)) return "";
	for (const r of user.role) {
		const cfg = ROLE_CONFIG[r];
		if (cfg) return `<span class="roleBadge ${r}" title="${t('role_'+r)}"></span>`;
	}
	return "";
}

// 商品清单不写在前端：价格、种类、十连价都由服务端提供
// （GET /api/shop/items），避免前后端两份价格漂移。

