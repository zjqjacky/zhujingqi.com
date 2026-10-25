let presenceTimer = null;
let lastPresenceTouch = 0;
async function touchPresence() {
	if (!currentUser) return;
	// 4 分钟内不重复上报（刷新页面、切页都会触发，没必要每次都打接口）
	if (Date.now() - lastPresenceTouch < 4 * 60 * 1000) return;
	lastPresenceTouch = Date.now();
	try {
		await apiPut("/api/users/" + currentUser.id + "/presence");
	} catch {}
}
let onlineUsersCache = [];
let onlineUsersCacheTime = 0;
const ONLINE_TTL = 5 * 60 * 1000;
async function loadOnlineUsers() {
	const mini = $("onlineMini");
	if (!mini) return;
	// 点击事件每次都挂上：缓存命中（feed 预填）时也要能点开名单
	mini.onclick = showOnlineUserList;
	const now = Date.now();
	if (now - onlineUsersCacheTime < ONLINE_TTL && onlineUsersCache.length) {
		mini.textContent = t("online_label_prefix") + onlineUsersCache.length;
		return;
	}
	let data;
	try {
		data = await apiGet("/api/users/online");
	} catch {
		return;
	}
	onlineUsersCache = data || [];
	onlineUsersCacheTime = Date.now();
	mini.textContent = t("online_label_prefix") + onlineUsersCache.length;
}

function showOnlineUserList() {
	if (!onlineUsersCache.length) {
		modal(t("online_none"));
		return;
	}
	document.querySelector(".modalBox").style.width = "320px";
	modal(`
							<h3>${t("online_title", onlineUsersCache.length)}</h3>
							<div id="onlineUserList"
								 style="text-align:left;max-height:320px;overflow:auto;padding-right:4px;">
								${onlineUsersCache.map(u => `
									<div class="onlineUser" data-user="${u.id}">
										<img
											class="avatar onlineAvatar"
											src="${getAvatar(u)}"
											onerror="this.onerror=null;this.src='assets/img/head.svg'"
										>
										<span>${escapeHtml(getDisplayName(u))}</span>
										<span class="userLevel">
											${getUserLevel(userLevelCoins(u))}
										</span>
										${getRoleBadge(u)}
									</div>
								`).join("")}
							</div>
						`);
	setTimeout(() => {
		document.querySelectorAll(".onlineUser").forEach(el => {
			el.onclick = () => {
				$("modal").classList.add("hidden");
				viewUser(Number(el.dataset.user));
			};
		});
	}, 0);
}

function startPresence() {
	stopPresence();
	touchPresence();
	loadOnlineUsers();
	presenceTimer = setInterval(() => {
		if (document.visibilityState === "visible" && currentUser) {
			touchPresence();
			if (currentPage === "main") loadOnlineUsers();
		}
	}, 5 * 60 * 1000);
}

function stopPresence() {
	if (presenceTimer) clearInterval(presenceTimer);
	presenceTimer = null;
}

