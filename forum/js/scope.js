let selectedScope = "public";
let scopeAllowUsers = [];
let scopeDenyUsers = [];

function resetScopeState() {
	selectedScope = "public";
	scopeAllowUsers = [];
	scopeDenyUsers = [];
	const chips = $("scopeChips");
	if (chips) {
		chips.querySelectorAll(".scopeChip").forEach(c => c.classList.toggle("active", c.dataset.scope === "public"));
	}
}

function computeVisibleTo() {
	if (!currentUser) return { visible_to: ["*"], visible_not: [] };
	const deny = scopeDenyUsers.length ? [...scopeDenyUsers] : [];
	switch (selectedScope) {
		case "public":    return { visible_to: ["*"], visible_not: deny };
		case "followers": return { visible_to: ["followers"], visible_not: deny };
		case "private":   return { visible_to: [currentUser.id], visible_not: [] };
		case "custom":    return { visible_to: scopeAllowUsers.length ? [...scopeAllowUsers] : ["*"], visible_not: deny };
		default:          return { visible_to: ["*"], visible_not: [] };
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
			if (selectedScope === "custom") {
				openScopeCustomModal();
			}
		};
	});
}

function getLocalGroups() {
	if (!currentUser) return [];
	try { return JSON.parse(localStorage.getItem("scope_groups_" + currentUser.id) || "[]"); } catch { return []; }
}

function saveLocalGroups(groups) {
	if (!currentUser) return;
	localStorage.setItem("scope_groups_" + currentUser.id, JSON.stringify(groups));
}

function openScopeCustomModal() {
	const box = document.querySelector(".modalBox");
	box.style.width = "420px";
	const groups = getLocalGroups();
	const groupsHTML = groups.length ? `
		<div class="scopeGroupsBar">
			<div class="scopeGroupsChips" id="scopeGroupsChips">
				${groups.map(g => `<button class="scopeGroupChip" data-gid="${g.id}">${escapeHtml(g.name)}</button>`).join("")}
				<button class="scopeGroupChip scopeGroupChipAdd" id="scopeGroupManageBtn">+</button>
			</div>
		</div>
	` : `<div style="margin-bottom:8px;text-align:right;"><button class="scopeGroupChip scopeGroupChipAdd" id="scopeGroupManageBtn" style="font-size:12px;">${t("profile_groups")} +</button></div>`;
	modal(`
		<h3>${t("scope_select_users")}</h3>
		${groupsHTML}
		<div class="scopeCustomTabs">
			<button class="scopeTab active" data-tab="allow" id="scopeAllowTab">${t("scope_allow_title")}</button>
			<button class="scopeTab" data-tab="deny" id="scopeDenyTab">${t("scope_deny_title")}</button>
		</div>
		<div id="scopeModalContent"></div>
	`);
	const manageBtn = $("scopeGroupManageBtn");
	if (manageBtn) manageBtn.onclick = () => openGroupManagerModal();
	if (groups.length) {
		$("scopeGroupsChips").querySelectorAll(".scopeGroupChip:not(.scopeGroupChipAdd)").forEach(chip => {
			chip.onclick = () => {
				const g = groups.find(gr => gr.id === chip.dataset.gid);
				if (!g || !g.members) return;
				const allIn = g.members.every(m => scopeAllowUsers.includes(m));
				if (allIn) {
					g.members.forEach(m => { const i = scopeAllowUsers.indexOf(m); if (i >= 0) scopeAllowUsers.splice(i, 1); });
				} else {
					g.members.forEach(m => { if (!scopeAllowUsers.includes(m)) scopeAllowUsers.push(m); });
				}
				chip.classList.toggle("active", !allIn);
				renderScopeModalTab("allow");
			};
		});
	}
	renderScopeModalTab("allow");
	const allowTab = $("scopeAllowTab");
	const denyTab = $("scopeDenyTab");
	if (allowTab) allowTab.onclick = () => renderScopeModalTab("allow");
	if (denyTab) denyTab.onclick = () => renderScopeModalTab("deny");
}

function openGroupManagerModal() {
	const box = document.querySelector(".modalBox");
	box.style.width = "420px";
	const groups = getLocalGroups();
	modal(`
		<h3>${t("profile_groups")}</h3>
		<div id="groupManagerList" class="groupManagerList">
			${groups.length ? groups.map(g => `
				<div class="groupManagerRow">
					<span class="groupManagerName">${escapeHtml(g.name)}</span>
					<div class="groupManagerActions">
						<button class="groupManagerEdit" data-gid="${g.id}">${t("profile_edit")}</button>
						<button class="groupManagerDel" data-gid="${g.id}">${t("post_delete")}</button>
					</div>
				</div>
			`).join("") : `<p style="text-align:center;color:var(--sub);">${t("groups_empty")}</p>`}
		</div>
		<div style="margin-top:12px;text-align:center;">
			<button id="groupManagerNewBtn" class="scopeBtn">${t("groups_new")}</button>
		</div>
	`);
	document.querySelectorAll(".groupManagerEdit").forEach(btn => {
		btn.onclick = () => {
			const g = groups.find(gr => gr.id === btn.dataset.gid);
			if (g) openGroupEditorModal(g);
		};
	});
	document.querySelectorAll(".groupManagerDel").forEach(btn => {
		btn.onclick = () => {
			const updated = groups.filter(g => g.id !== btn.dataset.gid);
			saveLocalGroups(updated);
			openGroupManagerModal();
		};
	});
	const newBtn = $("groupManagerNewBtn");
	if (newBtn) newBtn.onclick = () => openGroupEditorModal(null);
}

async function openGroupEditorModal(group) {
	await ensureAllUsersCache();
	const isNew = !group;
	const name = group ? group.name : "";
	const members = group && group.members ? [...group.members] : [];
	const box = document.querySelector(".modalBox");
	box.style.width = "420px";
	modal(`
		<h3>${isNew ? t("groups_new") : t("profile_edit")}</h3>
		<input id="groupNameInput" value="${escapeHtml(name)}" placeholder="${t("groups_name_ph")}" style="width:100%;margin-bottom:12px;box-sizing:border-box;" maxlength="20">
		<div class="scopePickerSearch">
			<input id="groupMemberSearch" placeholder="${t("groups_search_users_ph")}" autocomplete="off">
		</div>
		<div class="scopePickerList" id="groupMemberList" style="max-height:120px;"></div>
		<div class="scopePickerSelected" id="groupMemberSelected"></div>
		<div style="margin-top:14px;text-align:center;">
			<button id="groupEditorSave" class="scopeBtn">${t("editor_send")}</button>
		</div>
	`);
	const tempMembers = [...members];
	const searchEl = $("groupMemberSearch");
	if (searchEl) searchEl.oninput = () => renderGroupEditorMembers(tempMembers, searchEl.value.trim().toLowerCase());
	renderGroupEditorMembers(tempMembers, "");
	const saveBtn = $("groupEditorSave");
	if (saveBtn) {
		saveBtn.onclick = () => {
			const newName = $("groupNameInput").value.trim();
			if (!newName) return;
			const groups = getLocalGroups();
			if (isNew) {
				groups.push({ id: "g_" + Date.now(), name: newName, members: [...tempMembers] });
			} else {
				const idx = groups.findIndex(g => g.id === group.id);
				if (idx >= 0) { groups[idx].name = newName; groups[idx].members = [...tempMembers]; }
			}
			saveLocalGroups(groups);
			openGroupManagerModal();
		};
	}
}

function renderGroupEditorMembers(members, filter) {
	const listEl = $("groupMemberList");
	const selectedEl = $("groupMemberSelected");
	if (!listEl || !selectedEl) return;
	const allUsers = allUsersCache || [];
	const filtered = filter ? allUsers.filter(u => u.name && u.name.toLowerCase().includes(filter)).slice(0, 15) : [];
	listEl.innerHTML = "";
	for (const u of filtered) {
		const row = document.createElement("div");
		row.className = "scopePickerUser" + (members.includes(u.id) ? " selected" : "");
		row.innerHTML = `<img class="avatar" src="${getAvatar(u)}" onerror="this.onerror=null;this.src='assets/img/head.svg'" style="width:24px;height:24px;border-radius:50%;flex-shrink:0;"><span>${escapeHtml(u.name)}</span>`;
		row.onclick = () => {
			const idx = members.indexOf(u.id);
			if (idx >= 0) members.splice(idx, 1); else members.push(u.id);
			renderGroupEditorMembers(members, $("groupMemberSearch")?.value?.trim()?.toLowerCase() || "");
		};
		listEl.appendChild(row);
	}
	selectedEl.innerHTML = "";
	if (members.length) {
		for (const uid of members) {
			const user = allUsers.find(u => u.id === uid);
			if (!user) continue;
			const tag = document.createElement("span");
			tag.className = "scopeSelectedTag";
			tag.innerHTML = `${escapeHtml(user.name)} <button class="scopeSelectedRemove" data-uid="${uid}">&times;</button>`;
			tag.querySelector(".scopeSelectedRemove").onclick = (e) => {
				e.stopPropagation();
				const idx = members.indexOf(uid);
				if (idx >= 0) members.splice(idx, 1);
				renderGroupEditorMembers(members, $("groupMemberSearch")?.value?.trim()?.toLowerCase() || "");
			};
			selectedEl.appendChild(tag);
		}
	}
}

async function renderScopeModalTab(tab) {
	const content = $("scopeModalContent");
	if (!content) return;
	const allowTab = $("scopeAllowTab");
	const denyTab = $("scopeDenyTab");
	if (allowTab) allowTab.classList.toggle("active", tab === "allow");
	if (denyTab) denyTab.classList.toggle("active", tab === "deny");
	const selectedItems = tab === "allow" ? scopeAllowUsers : scopeDenyUsers;
	content.innerHTML = `
		<div class="scopePickerSection">
			<div class="scopePickerSearch">
				<input id="scopeUserSearch" placeholder="${t("groups_search_users_ph")}" autocomplete="off">
			</div>
			<div class="scopePickerList" id="scopeUserList"></div>
			<div class="scopePickerSelected" id="scopeSelectedUsers"></div>
		</div>
	`;
	await ensureAllUsersCache();
	renderScopeUserPicker(tab, selectedItems);
	const search = $("scopeUserSearch");
	if (search) search.oninput = () => renderScopeUserPicker(tab, selectedItems, search.value.trim().toLowerCase());
}

function renderScopeUserPicker(tab, selectedItems, filter = "") {
	const listEl = $("scopeUserList");
	const selectedEl = $("scopeSelectedUsers");
	if (!listEl || !selectedEl) return;
	const allUsers = allUsersCache || [];
	const filtered = filter ? allUsers.filter(u => u.name && u.name.toLowerCase().includes(filter)) : [];
	const displayUsers = filtered.slice(0, 20);
	listEl.innerHTML = "";
	if (displayUsers.length) {
		for (const u of displayUsers) {
			const row = document.createElement("div");
			row.className = "scopePickerUser" + (selectedItems.includes(u.id) ? " selected" : "");
			row.innerHTML = `<img class="avatar" src="${getAvatar(u)}" onerror="this.onerror=null;this.src='assets/img/head.svg'" style="width:24px;height:24px;border-radius:50%;flex-shrink:0;"><span>${escapeHtml(u.name)}</span>`;
			row.onclick = () => {
				const list = tab === "allow" ? scopeAllowUsers : scopeDenyUsers;
				const idx = list.indexOf(u.id);
				if (idx >= 0) list.splice(idx, 1); else list.push(u.id);
				renderScopeUserPicker(tab, tab === "allow" ? scopeAllowUsers : scopeDenyUsers, $("scopeUserSearch")?.value?.trim()?.toLowerCase() || "");
			};
			listEl.appendChild(row);
		}
	} else if (filter) {
		listEl.innerHTML = `<span class="scopePickerEmpty">${t("post_no_posts")}</span>`;
	}
	selectedEl.innerHTML = "";
	if (selectedItems.length) {
		const label = document.createElement("div");
		label.className = "scopePickerSelectedLabel";
		label.textContent = `${selectedItems.length} selected`;
		selectedEl.appendChild(label);
		for (const uid of selectedItems) {
			const user = allUsers.find(u => u.id === uid);
			if (!user) continue;
			const tag = document.createElement("span");
			tag.className = "scopeSelectedTag";
			tag.innerHTML = `${escapeHtml(user.name)} <button class="scopeSelectedRemove" data-uid="${uid}">&times;</button>`;
			tag.querySelector(".scopeSelectedRemove").onclick = (e) => {
				e.stopPropagation();
				const list = tab === "allow" ? scopeAllowUsers : scopeDenyUsers;
				const idx = list.indexOf(uid);
				if (idx >= 0) list.splice(idx, 1);
				renderScopeUserPicker(tab, list, $("scopeUserSearch")?.value?.trim()?.toLowerCase() || "");
			};
			selectedEl.appendChild(tag);
		}
	}
}

function getScopeBadgeHTML(visibleTo, postId, isOwner) {
	if (!visibleTo || !Array.isArray(visibleTo)) return "";
	if (visibleTo.includes("*")) return "";
	const canView = isOwner || (currentUser && currentUser.id);
	if (!canView) return "";
	const onclick = postId ? ' onclick="showVisibleToModal(' + postId + ')" style="cursor:pointer"' : '';
	if (visibleTo.includes("followers")) {
		return `<span class="scopeBadge scopeBadge-followers"${onclick}>${t("scope_badge_followers")}</span>`;
	}
	if (visibleTo.length === 1 && currentUser && visibleTo[0] === currentUser.id) {
		return `<span class="scopeBadge scopeBadge-private"${onclick}>${t("scope_badge_private")}</span>`;
	}
	return `<span class="scopeBadge scopeBadge-custom"${onclick}>${t("scope_badge_custom")}</span>`;
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
		const denyUsers = res.deny_users || [];
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
		if (denyUsers.length) {
			html += `<div style="margin-top:8px;color:var(--sub);font-size:12px;">${t("scope_deny_title")}：</div>` +
				denyUsers.map(u =>
					`<div class="visUser"><img class="avatar" src="${getAvatar(u)}" onerror="this.onerror=null;this.src='assets/img/head.svg'" style="width:24px;height:24px;border-radius:50%;flex-shrink:0;filter:grayscale(1);opacity:.7;"><span style="text-decoration:line-through;">${escapeHtml(u.name)}</span></div>`
				).join("");
		}
		list.innerHTML = html || `<div style="text-align:center;color:var(--sub);padding:8px 0;">—</div>`;
	} catch (e) {
		const list = $("visibleToList");
		if (list) list.innerHTML = `<p style="color:var(--sub);">${t("modal_load_fail")}</p>`;
	}
}

initScopeUI();
