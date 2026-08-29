let selectedScope = "public";
let scopeAllowUsers = [];
let scopeAllowGroups = [];
let scopeDenyUsers = [];
let scopeDenyGroups = [];
let userGroupsCache = [];
let userGroupsCacheTime = 0;
const USER_GROUPS_TTL = 60000;

function resetScopeState() {
	selectedScope = "public";
	scopeAllowUsers = [];
	scopeAllowGroups = [];
	scopeDenyUsers = [];
	scopeDenyGroups = [];
	const chips = $("scopeChips");
	if (chips) {
		chips.querySelectorAll(".scopeChip").forEach(c => c.classList.toggle("active", c.dataset.scope === "public"));
	}
	const panel = $("scopeCustomPanel");
	if (panel) panel.classList.remove("show");
}

function initScopeUI() {
	const chips = $("scopeChips");
	if (!chips) return;
	chips.querySelectorAll(".scopeChip").forEach(chip => {
		chip.onclick = () => {
			chips.querySelectorAll(".scopeChip").forEach(c => c.classList.remove("active"));
			chip.classList.add("active");
			selectedScope = chip.dataset.scope;
			const panel = $("scopeCustomPanel");
			if (panel) {
				if (selectedScope === "custom") {
					panel.classList.add("show");
					renderScopeCustomTab("allow");
				} else {
					panel.classList.remove("show");
				}
			}
		};
	});
	const allowTab = $("scopeAllowTab");
	const denyTab = $("scopeDenyTab");
	if (allowTab) allowTab.onclick = () => renderScopeCustomTab("allow");
	if (denyTab) denyTab.onclick = () => renderScopeCustomTab("deny");
}

function renderScopeCustomTab(tab) {
	const content = $("scopeCustomContent");
	if (!content) return;
	const allowTab = $("scopeAllowTab");
	const denyTab = $("scopeDenyTab");
	if (allowTab) allowTab.classList.toggle("active", tab === "allow");
	if (denyTab) denyTab.classList.toggle("active", tab === "deny");

	const selectedItems = tab === "allow" ? scopeAllowUsers : scopeDenyUsers;
	const selectedGroups = tab === "allow" ? scopeAllowGroups : scopeDenyGroups;

	content.innerHTML = `
		<div class="scopePickerSection">
			<h4>${t("scope_select_groups")}</h4>
			<div class="scopePickerChips" id="scopeGroupPicker"></div>
		</div>
		<div class="scopePickerSection">
			<h4>${t("scope_select_users")}</h4>
			<div class="scopePickerSearch">
				<input id="scopeUserSearch" placeholder="${t("groups_search_users_ph")}" autocomplete="off">
			</div>
			<div class="scopePickerList" id="scopeUserList"></div>
			<div class="scopePickerSelected" id="scopeSelectedUsers"></div>
		</div>
	`;

	renderScopeGroupPicker(tab, selectedGroups);
	renderScopeUserPicker(tab, selectedItems);

	const search = $("scopeUserSearch");
	if (search) {
		search.oninput = () => renderScopeUserPicker(tab, selectedItems, search.value.trim().toLowerCase());
	}
}

async function renderScopeGroupPicker(tab, selectedGroups) {
	const container = $("scopeGroupPicker");
	if (!container) return;
	const groups = await getUserGroups();
	if (!groups.length) {
		container.innerHTML = `<span class="scopePickerEmpty">${t("groups_empty")}</span>`;
		return;
	}
	container.innerHTML = "";
	for (const g of groups) {
		const chip = document.createElement("span");
		chip.className = "scopeGroupChip" + (selectedGroups.includes(g.id) ? " active" : "");
		chip.textContent = g.name;
		chip.onclick = () => {
			const list = tab === "allow" ? scopeAllowGroups : scopeDenyGroups;
			const idx = list.indexOf(g.id);
			if (idx >= 0) {
				list.splice(idx, 1);
				chip.classList.remove("active");
			} else {
				list.push(g.id);
				chip.classList.add("active");
			}
		};
		container.appendChild(chip);
	}
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
				if (idx >= 0) {
					list.splice(idx, 1);
				} else {
					list.push(u.id);
				}
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

async function getUserGroups() {
	const now = Date.now();
	if (userGroupsCache.length && now - userGroupsCacheTime < USER_GROUPS_TTL) return userGroupsCache;
	try {
		const data = await apiGet("/api/user-groups");
		userGroupsCache = data || [];
		userGroupsCacheTime = now;
	} catch {
		userGroupsCache = [];
	}
	return userGroupsCache;
}

function invalidateUserGroupsCache() {
	userGroupsCache = [];
	userGroupsCacheTime = 0;
}

function openGroupManager() {
	const box = document.querySelector(".modalBox");
	box.style.width = "480px";
	modal(`
		<h3>${t("profile_groups")}</h3>
		<div id="groupManagerList" class="groupManagerList">${t("loading")}</div>
		<div class="groupManagerActions">
			<button id="groupManagerNewBtn" class="scopeBtn">${t("groups_new")}</button>
		</div>
	`);
	renderGroupManagerList();
	const newBtn = $("groupManagerNewBtn");
	if (newBtn) newBtn.onclick = () => openGroupEditor(null);
}

async function renderGroupManagerList() {
	const listEl = $("groupManagerList");
	if (!listEl) return;
	try {
		const groups = await apiGet("/api/user-groups");
		if (!groups || !groups.length) {
			listEl.innerHTML = `<p style="text-align:center;color:var(--sub);">${t("groups_empty")}</p>`;
			return;
		}
		listEl.innerHTML = "";
		for (const g of groups) {
			const row = document.createElement("div");
			row.className = "groupManagerRow";
			const memberCount = g.member_count || (g.members ? g.members.length : 0);
			row.innerHTML = `
				<div class="groupManagerInfo">
					<span class="groupManagerName">${escapeHtml(g.name)}</span>
					<span class="groupManagerCount">${memberCount} ${t("followers").toLowerCase()}</span>
				</div>
				<div class="groupManagerActions">
					<button class="groupManagerEdit" data-gid="${g.id}">${t("profile_edit")}</button>
					<button class="groupManagerDel" data-gid="${g.id}">${t("post_delete")}</button>
				</div>
			`;
			row.querySelector(".groupManagerEdit").onclick = () => openGroupEditor(g);
			row.querySelector(".groupManagerDel").onclick = () => deleteGroup(g.id);
			listEl.appendChild(row);
		}
	} catch {
		listEl.innerHTML = `<p style="text-align:center;color:var(--sub);">${t("modal_load_fail")}</p>`;
	}
}

function openGroupEditor(group) {
	const isNew = !group;
	const name = group ? group.name : "";
	const members = group && group.members ? group.members.map(m => m.user_id || m.id) : [];

	const box = document.querySelector(".modalBox");
	box.style.width = "480px";
	modal(`
		<h3>${isNew ? t("groups_new") : t("profile_edit")}</h3>
		<input id="groupNameInput" value="${escapeHtml(name)}" placeholder="${t("groups_name_ph")}" style="width:100%;margin-bottom:12px;" maxlength="20">
		<div class="groupEditorMembers">
			<h4>${t("groups_add_user")}</h4>
			<div class="scopePickerSearch">
				<input id="groupMemberSearch" placeholder="${t("groups_search_users_ph")}" autocomplete="off">
			</div>
			<div class="groupMemberList" id="groupMemberList"></div>
			<div class="groupMemberSelected" id="groupMemberSelected"></div>
		</div>
		<div style="margin-top:14px;text-align:center;">
			<button id="groupEditorSave" class="scopeBtn">${t("editor_send")}</button>
		</div>
	`);

	const tempMembers = [...members];
	const searchEl = $("groupMemberSearch");
	if (searchEl) {
		searchEl.oninput = () => renderGroupEditorMembers(tempMembers, searchEl.value.trim().toLowerCase());
	}
	renderGroupEditorMembers(tempMembers, "");

	const saveBtn = $("groupEditorSave");
	if (saveBtn) {
		saveBtn.onclick = async () => {
			const newName = $("groupNameInput").value.trim();
			if (!newName) return;
			try {
				if (isNew) {
					await apiPost("/api/user-groups", { name: newName });
				} else {
					await apiPut("/api/user-groups/" + group.id, { name: newName });
				}
				const groupId = group ? group.id : null;
				if (groupId) {
					const existingMembers = group.members ? group.members.map(m => m.user_id || m.id) : [];
					const toAdd = tempMembers.filter(id => !existingMembers.includes(id));
					const toRemove = existingMembers.filter(id => !tempMembers.includes(id));
					for (const uid of toAdd) {
						await apiPost("/api/user-groups/" + groupId + "/members", { user_id: uid });
					}
					for (const uid of toRemove) {
						await apiDelete("/api/user-groups/" + groupId + "/members?user_id=" + uid);
					}
				}
				invalidateUserGroupsCache();
				$("modal").classList.add("hidden");
				renderGroupManagerList();
			} catch (e) {
				modal(t("modal_load_fail") + "：" + e.message);
			}
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
			if (idx >= 0) members.splice(idx, 1);
			else members.push(u.id);
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

async function deleteGroup(gid) {
	const box = document.querySelector(".modalBox");
	box.style.width = "320px";
	modal(`<h3>${t("groups_delete_confirm")}</h3>`);
	const confirmBtn = document.createElement("button");
	confirmBtn.className = "scopeBtn";
	confirmBtn.style.background = "#e74c3c";
	confirmBtn.style.color = "#fff";
	confirmBtn.textContent = t("confirm_btn");
	confirmBtn.onclick = async () => {
		try {
			await apiDelete("/api/user-groups/" + gid);
			invalidateUserGroupsCache();
			$("modal").classList.add("hidden");
			renderGroupManagerList();
		} catch (e) {
			modal(t("modal_load_fail") + "：" + e.message);
		}
	};
	$("modalText").appendChild(confirmBtn);
}

function getScopeBadgeHTML(scope) {
	if (!scope || scope === "public") return "";
	const badgeClass = "scopeBadge";
	switch (scope) {
		case "followers":
			return `<span class="${badgeClass} ${badgeClass}-followers">${t("scope_badge_followers")}</span>`;
		case "private":
			return `<span class="${badgeClass} ${badgeClass}-private">${t("scope_badge_private")}</span>`;
		case "custom":
			return `<span class="${badgeClass} ${badgeClass}-custom">${t("scope_badge_custom")}</span>`;
		default:
			return "";
	}
}

initScopeUI();
