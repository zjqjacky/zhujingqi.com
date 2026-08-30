let selectedScope = "public";
let scopeDenyUsers = [];

function resetScopeState() {
	selectedScope = "public";
	scopeDenyUsers = [];
	const chips = $("scopeChips");
	if (chips) {
		chips.querySelectorAll(".scopeChip").forEach(c => c.classList.toggle("active", c.dataset.scope === "public"));
	}
}

// 可见性由后端归一化；前端传 scope："public" / "followers" / "private"
function computeVisibleTo() {
	if (!currentUser) return { scope: "public", visible_to: ["*"], visible_not: [] };
	const deny = scopeDenyUsers.length ? [...scopeDenyUsers] : [];
	switch (selectedScope) {
		case "public":    return { scope: "public", visible_to: ["*"], visible_not: deny };
		case "followers": return { scope: "followers", visible_to: ["followers"], visible_not: deny };
		case "private":   return { scope: "private", visible_to: [currentUser.id], visible_not: [] };
		default:          return { scope: "public", visible_to: ["*"], visible_not: [] };
	}
}

function initScopeUI() {
	const chips = $("scopeChips");
	if (!chips) return;
	chips.querySelectorAll(".scopeChip").forEach(chip => {
		chip.onclick = () => {
			chips.querySelectorAll(".scopeChip").forEach(c => c.classList.remove("active"));
			chip.classList.add("active");
			selectedScope = chip.dataset.scope;
		};
	});
}

async function showVisibleToModal(postId) {
	const box = document.querySelector(".modalBox");
	box.style.width = "360px";
	modal(`<h3>${t("scope_select_users")}</h3><div id="visibleToList" style="text-align:left;">${t("loading")}</div>`);
	try {
		const res = await apiGet("/api/posts/visible-to?id=" + postId);
		const list = $("visibleToList");
		if (!list) return;
		const vis = res.visible_to || [];
		const users = res.users || [];
		let html = "";
		if (vis.includes("*")) {
			html = `<div style="text-align:center;color:var(--sub);padding:8px 0;">${t("scope_badge_public")}</div>`;
		} else if (vis.includes("followers")) {
			html = `<div style="text-align:center;color:var(--sub);padding:8px 0;">${t("scope_badge_followers")}</div>`;
		} else if (vis.length === 1 && currentUser && vis[0] == currentUser.id) {
			html = `<div style="text-align:center;color:var(--sub);padding:8px 0;">${t("scope_badge_private")}</div>`;
		}
		if (users.length) {
			html += users.map(u =>
				`<div class="visUser"><img class="avatar" src="${getAvatar(u)}" onerror="this.onerror=null;this.src='assets/img/head.svg'" style="width:24px;height:24px;border-radius:50%;flex-shrink:0;"><span>${escapeHtml(u.name)}</span></div>`
			).join("");
		}
		list.innerHTML = html || `<div style="text-align:center;color:var(--sub);padding:8px 0;">—</div>`;
	} catch (e) {
		const list = $("visibleToList");
		if (list) list.innerHTML = `<p style="color:var(--sub);">${t("modal_load_fail")}</p>`;
	}
}

initScopeUI();
