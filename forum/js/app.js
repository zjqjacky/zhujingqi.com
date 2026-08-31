// Apply the persisted UI language to the static DOM once at startup,
// before the init IIFE below decides which page to show.
refreshUILanguage(true);

(async () => {
	const mask = document.createElement("div");
	mask.className = "loadingMask";
	mask.innerHTML = `
						<div class="loadingBox">
							<div class="loadingLogo">
								<img src="icon.svg" alt="">
								<span>` + t("login_title") + `</span>
							</div>
							<div class="loadingText">Loading<span class="dot dot1">.</span><span class="dot dot2">.</span><span class="dot dot3">.</span></div>
						</div>
					`;
	document.body.appendChild(mask);
	try {
		if (autoId && localStorage.getItem("token")) {
			let data;
			try {
				const refreshRes = await fetch(API_BASE + "/api/auth/refresh", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": "Bearer " + localStorage.getItem("token")
					}
				});
				if (refreshRes.ok) {
					const refreshed = await refreshRes.json().catch(() => null);
					if (refreshed && refreshed.token) localStorage.setItem("token", refreshed.token);
				} else {
					throw new Error("REFRESH_FAILED");
				}
				data = await apiGet("/api/users/" + autoId);
			} catch {
				data = null;
			}
			if (data) {
				currentUser = data;
				if (data.name) localStorage.setItem("forumName_" + data.id, data.name);
				if (data.avatar) localStorage.setItem("forumAvatar", data.avatar);
				$("nav").classList.remove("hidden");
				const initialPid = getUrlParam("pid");
				const initialUid = getUrlParam("uid");
				const initialQ = getUrlParam("q");
				const initialD = getUrlParam("d");
				if (initialPid) {
					openSinglePost(Number(initialPid)).catch(() => { modal(t("post_not_found")); show("main"); });
				} else if (initialUid) {
					viewUser(Number(initialUid));
				} else {
					show("main");
					if (initialQ) {
						applyQuery(initialQ);
					} else {
						renderPostFilters();
					}
					if (initialD) {
						activePostDay = initialD;
						renderPostFilters();
					}
					syncUrlFromQuery();
					syncLayoutBtn();
					syncLayoutMode();
					loadStats();
					loadOnlineUsers();
					startPresence();
					refreshNotificationBadge();
					loadPosts(1);
					loadAnnouncements();
				}
				return;
			}
		}
		const guestPid = getUrlParam("pid");
		const guestUid = getUrlParam("uid");
		const guestQ = getUrlParam("q");
		const guestD = getUrlParam("d");
		localStorage.removeItem("loginUser");
		localStorage.removeItem("token");
		hideLoggedFeatures();
		$("nav").classList.remove("hidden");
		show("main");
		renderPostFilters();
		syncLayoutMode();
		syncLayoutBtn();
		syncUrlFromQuery();
		loadPosts(1);
		if (guestPid) {
			const pid = Number(guestPid);
			if (!isNaN(pid)) openSinglePost(pid).catch(() => { modal(t("post_not_found")); show("main"); });
		} else if (guestUid) {
			const userId = Number(guestUid);
			if (!isNaN(userId)) viewUser(userId);
		}
	} finally {
		mask.classList.add("fadeOut");
		setTimeout(() => mask.remove(), 300);
	}
})();
const updateTopFade = el => {
	if (!el) return;
	const on = el.scrollTop > 8;
	const mask = on ?
		"linear-gradient(to bottom, transparent 0, #000 44px, #000 calc(100% - 44px), transparent 100%)" :
		"linear-gradient(to bottom, #000 0, #000 calc(100% - 44px), transparent 100%)";
	el.style.WebkitMaskImage = mask;
	el.style.maskImage = mask;
};
const attachTopFade = el => {
	if (!el) return;
	el.addEventListener("scroll", () => updateTopFade(el), { passive: true });
	updateTopFade(el);
};
attachTopFade($("posts"));
attachTopFade($("userPosts"));
document.addEventListener("contextmenu", e => e.preventDefault());
