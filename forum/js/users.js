async function loadNewUsers(limit = 10) {
	const container = $("newUsers");
	container.innerHTML = "<p style='color:var(--sub);text-align:center;'>Loading...</p>";
	let data;
	try {
		data = await apiGet("/api/users?limit=" + limit + "&sort=time");
	} catch {
		container.innerHTML = '<p style="color:red;text-align:center;">' + t("modal_load_fail") +
			'</p>';
		return;
	}
	container.innerHTML = '<h3>' + t("new_users_title") + '</h3>';
	for (let u of data) {
		let div = document.createElement("div");
		div.className = "newUserItem";
		div.innerHTML =
			`<span>${u.name}${getRoleBadge(u)}</span>`;
		div.onclick = () => viewUser(u.id);
		container.appendChild(div);
	}
}

const DEFAULT_AVATAR = "assets/img/head.svg";

function getAvatar(user) {
	return user?.avatar?.trim() || DEFAULT_AVATAR;
}

function escapeAttr(s) {
	return String(s ?? "")
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
						.replace(/</g, "&lt;")
						.replace(/>/g, "&gt;");
				}
				let rankMode = "coins";

				function setupRankToggle() {
					const coinsBtn = $("rankToggleCoins");
					const followersBtn = $("rankToggleFollowers");
					if (!coinsBtn || coinsBtn._setup) return;
					coinsBtn._setup = true;
					coinsBtn.onclick = () => {
						if (rankMode === "coins") return;
						rankMode = "coins";
						coinsBtn.classList.add("active");
						followersBtn.classList.remove("active");
						const colVal = $("rankColValue");
						if (colVal) colVal.textContent = t("rankings_col_coins");
						loadUserList();
					};
					followersBtn.onclick = () => {
						if (rankMode === "followers") return;
						rankMode = "followers";
						followersBtn.classList.add("active");
						coinsBtn.classList.remove("active");
						const colVal = $("rankColValue");
						if (colVal) colVal.textContent = t("followers");
						loadUserList();
					};
				}
				async function loadUserList() {
					let box = $("userItems");
					box.innerHTML = "<p style='text-align:center;color:var(--sub);margin-top:20px;'>Loading...</p>";
					let data = [];
					try {
						data = await apiGet("/api/users" + (rankMode === "followers" ? "?includeFollowers=true" :
							""));
					} catch {
						data = [];
					}
					if (rankMode === "followers") {
						data.sort((a, b) => {
							let fa = a.follower_count || 0;
							let fb = b.follower_count || 0;
							if (fb !== fa) return fb - fa;
							return a.name.localeCompare(b.name);
						});
					} else {
						data.sort((a, b) => {
							let coinsA = a.coins || 0;
							let coinsB = b.coins || 0;
							if (coinsB !== coinsA) return coinsB - coinsA;
							return a.name.localeCompare(b.name);
						});
					}
					box.innerHTML = "";
					const items = [];
					data.forEach((u, i) => {
						let rank = i + 1;
						let div = document.createElement("div");
						div.className = "userItem";
						let rankDisplay;
						if (rank === 1) rankDisplay = ` <span style="color: #ffaa00;">1</span>`;
						else if (rank === 2) rankDisplay = `<span style="color: #a3a3a3">2</span>`;
						else if (rank === 3) rankDisplay = `<span style="color: #c68326">3</span>`;
						else rankDisplay = `<span class="rank-num">${rank}</span>`;
						const avatar = getAvatar(u);
						div.innerHTML = `
							<div style="width: 40px; font-weight: bold; text-align: center;">${rankDisplay}</div>
							<div style="flex:1; display:flex; align-items:center; gap:8px; min-width:0;">
								<img class="avatar rankAvatar" src="${avatar}" onerror="this.onerror=null;this.src='assets/img/head.svg'">
								<div style="min-width:0;">
									<div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
										<span>${u.name}</span>
										<span class="userLevel">${getUserLevel(u.coins || 0)}${getRoleBadge(u)}</span>
									</div>
								</div>
							</div>
							<div style="width:100px; text-align:right;">${rankMode === "followers" ? (u.follower_count || 0) : (u.coins || 0)}</div>
						`;
						div.onclick = () => viewUser(u.id);
						items.push({
							div,
							name: u.name.toLowerCase()
						});
						box.appendChild(div);
					});
					const input = $("rankSearch");
					if (input) {
						input.value = "";
						input.oninput = () => {
							const q = input.value.trim().toLowerCase();
							box.querySelectorAll(".userItem.highlight").forEach(el => el.classList.remove(
								"highlight"));
							if (!q) return;
							const found = items.find(it => it.name === q);
							if (!found) return;
							setTimeout(() => {
								found.div.classList.add("highlight");
								found.div.scrollIntoView({
									behavior: "smooth",
									block: "center"
								});
								setTimeout(() => found.div.classList.remove("highlight"), 2000);
							}, 50);
						};
					}
				}

				function openProfileSettings(user) {
					const box = document.querySelector(".modalBox");
					box.style.width = "440px";
					const themeClass = getThemePref();
					modal(`
						<div style="text-align:left;">
							<h3 style="margin:0 0 10px 0;text-align:center;">${t("profile_settings")}</h3>
							<div class="settingsCard">
								<div class="settingsLabel">主题</div>
								<div style="display:flex;gap:6px;">
									<button class="settingsThemeBtn" data-theme="sys">${t("profile_theme_sys")}</button>
									<button class="settingsThemeBtn" data-theme="light">${t("profile_theme_light")}</button>
									<button class="settingsThemeBtn" data-theme="dark">${t("profile_theme_dark")}</button>
								</div>
							</div>
							<div class="settingsCard">
								<div class="settingsLabel">${t("settings_lang")}</div>
								<select id="settingsLangSelect" class="langSelect" style="width:100%;margin-top:6px;"></select>
							</div>
							<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;">
								<button class="settingsLinkBtn" id="setAvatarBtn">${t("profile_edit_avatar")}</button>
								<button class="settingsLinkBtn" id="setBioBtn">${t("profile_edit_desc")}</button>
							</div>
							<button class="settingsLinkBtn" id="setPassBtn" style="margin-top:6px;">${t("settings_change_pass")}</button>
							<div class="settingsCard" style="margin-top:6px;">
								<div style="display:flex;align-items:center;justify-content:space-between;">
									<span class="settingsLabel" style="margin:0;">${t("follow_public_label")}</span>
									<input type="checkbox" id="settingsFollowPublic" ${user.follow_public ? "checked" : ""} style="width:18px;height:18px;cursor:pointer;accent-color:var(--green);">
								</div>
							</div>
							<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;">
								<button class="settingsLinkBtn" id="setCardBgBtn">${t("card_bg_title")}</button>
								<button class="settingsLinkBtn" id="setCardBgClearBtn">${t("card_bg_remove")}</button>
							</div>
							<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;">
								<button class="settingsLinkBtn" id="setAboutBtn">${t("profile_about")}</button>
								<button class="settingsLinkBtn" id="setSponsorBtn">${t("profile_sponsor")}</button>
							</div>
							${isAdmin(user) ? `<button class="settingsLinkBtn" id="setAILogsBtn" style="margin-top:6px;">${t("ai_logs_admin")}</button>` : ""}
							<a class="settingsLinkBtn" id="setRssBtn" href="rss.xml" target="_blank" rel="noopener" style="margin-top:6px;text-decoration:none;box-sizing:border-box;">${t("settings_rss")}</a>
						</div>
					`);
					const langSel = box.querySelector("#settingsLangSelect");
					if (langSel) renderLangSelect(langSel);
					box.querySelectorAll(".settingsThemeBtn").forEach(btn => {
						btn.classList.toggle("active", btn.dataset.theme === themeClass);
						btn.onclick = () => {
							const t = btn.dataset.theme;
							localStorage.setItem("theme", t);
							applyTheme(t);
							box.querySelectorAll(".settingsThemeBtn").forEach(b => b.classList.remove(
								"active"));
							btn.classList.add("active");
						};
					});
					$("setAvatarBtn").onclick = () => {
						$("modal").classList.add("hidden");
						openAvatarEditor();
					};
					$("setBioBtn").onclick = () => {
						$("modal").classList.add("hidden");
						box.style.width = "400px";
						$("modalText").innerHTML = `
							<h3>${t("profile_edit_desc")}</h3>
							<textarea id="descTextarea" maxlength="500" style="height:120px;">${user.description || ""}</textarea>
							<div style="margin-top:10px;"><button id="saveDescBtn">${t("profile_save")}</button></div>
						`;
						$("modal").classList.remove("hidden");
						$("saveDescBtn").onclick = async () => {
							const newDesc = $("descTextarea").value.trim();
							try {
								await apiPut("/api/users/" + currentUser.id, {
									description: newDesc
								});
							} catch (e) {
								return modal(t("save_fail", e.message));
							}
							currentUser.description = newDesc;
							const bio = document.getElementById("profileBio");
							if (bio) bio.innerHTML = (newDesc || t("profile_no_desc")) +
								'<button class="bioEditBtn">' + t("profile_edit") + '</button>';
							$("modal").classList.add("hidden");
						};
					};
					$("settingsFollowPublic").onchange = async () => {
						try {
							await apiPut("/api/users/" + currentUser.id, {
								follow_public: $("settingsFollowPublic").checked
							});
						} catch {
							$("settingsFollowPublic").checked = !$("settingsFollowPublic").checked;
						}
					};
					$("setPassBtn").onclick = () => {
						$("modal").classList.add("hidden");
						box.style.width = "400px";
						$("modalText").innerHTML = `
							<h3>${t("settings_change_pass")}</h3>
							<input type="password" id="passOldInput" placeholder="${t("pass_old")}" autocomplete="current-password">
							<input type="password" id="passNewInput" placeholder="${t("pass_new")}" autocomplete="new-password" style="margin-top:8px;">
							<input type="password" id="passConfirmInput" placeholder="${t("pass_confirm")}" autocomplete="new-password" style="margin-top:8px;">
							<div style="margin-top:14px;">
								<button id="passSaveBtn">${t("profile_save")}</button>
							</div>
						`;
						$("modal").classList.remove("hidden");
						$("passSaveBtn").onclick = async () => {
							const oldP = $("passOldInput").value;
							const newP = $("passNewInput").value;
							const confirmP = $("passConfirmInput").value;
							if (!oldP || !newP || !confirmP) return;
							if (newP.length < 6) return modal(t("pass_too_short"));
							if (newP !== confirmP) return modal(t("pass_mismatch"));
							try {
								await apiPut("/api/auth/password", {
									old_pass: await hash(oldP),
									new_pass: await hash(newP)
								});
							} catch (e) {
								return modal(t("save_fail", e.message));
							}
							$("modal").classList.add("hidden");
							showCoinMsg(t("pass_changed_ok"));
						};
					};
					$("setCardBgBtn").onclick = () => {
						$("modal").classList.add("hidden");
						openCardBgEditor(user);
					};
					$("setCardBgClearBtn").onclick = async () => {
						try {
							await apiPut("/api/users/" + currentUser.id, {
								card_bg: null
							});
						} catch (e) {
							return modal(t("save_fail", e.message));
						}
						currentUser.card_bg = null;
						if (user) user.card_bg = null;
						const card = $("profileCard");
						card.classList.remove("has-card-bg");
						card.style.removeProperty("--card-bg-img");
						$("modal").classList.add("hidden");
					};
					$("setAboutBtn").onclick = () => {
						box.style.width = "800px";
						modal(
							`<h2>${t("about_title")}</h2><div style="text-align:left;">${t("about_content")}</div><h6><a href="#">${t("login_title")}</a> · <a href="https://zhujingqi.com">Zhujingqi</a></h6><h6>© Jacky Forum. All rights reserved.</h6>`
		);
	};
	$("setSponsorBtn").onclick = () => {
		modal(`<h2>${t("sponsor_title")}</h2>${t("sponsor_content")}`);
	};
	const aiLogsBtn = box.querySelector("#setAILogsBtn");
	if (aiLogsBtn) {
		aiLogsBtn.onclick = () => {
			$("modal").classList.add("hidden");
			openAILogs();
		};
	}
}

async function viewUser(uid) {
	show("profilePage");
	$("profileAvatar").src = "assets/img/head.svg";
	$("pname").textContent = t("loading");
	$("profileMeta").innerHTML = "";
	renderLevelProgress(0);
	document.getElementById("profileBio").innerHTML = `<em>${t("loading")}</em>`;
	$("profileStats").innerHTML = "";
	document.getElementById("profileActions").innerHTML = "";
	$("logoutBtn").style.display = "none";
	const profileCardEl = $("profileCard");
	profileCardEl.classList.remove("has-card-bg");
	profileCardEl.style.removeProperty("--card-bg-img");
	document.querySelectorAll("#profileLeft .avatar-edit-overlay, .card-bg-edit-btn").forEach(el => el.remove());
	let user;
	try {
		user = await apiGet("/api/users/" + uid + (currentUser ? "?userId=" + currentUser.id : ""));
	} catch {
		user = {
			id: uid,
			name: "?",
			coins: 0,
			avatar: null,
			description: "",
			time: "",
			role: []
		};
	}
	const avatarUrl = getAvatar(user);
	$("profileAvatar").src = avatarUrl;
	$("profileAvatar").onclick = () => openViewer(avatarUrl);
	const cardBg = user.card_bg ? String(user.card_bg).trim() : "";
	if (cardBg && /^https?:\/\//i.test(cardBg)) {
		const probe = new Image();
		probe.onload = () => {
			profileCardEl.style.setProperty("--card-bg-img", 'url("' + cardBg.replace(/["\\]/g, "") + '")');
							profileCardEl.classList.add("has-card-bg");
						};
						probe.onerror = () => {
							profileCardEl.classList.remove("has-card-bg");
							profileCardEl.style.removeProperty("--card-bg-img");
						};
						probe.src = cardBg;
					} else {
						profileCardEl.classList.remove("has-card-bg");
						profileCardEl.style.removeProperty("--card-bg-img");
					}
					history.pushState(null, "", "?uid=" + uid);
					const isSelf = currentUser && uid === currentUser.id;
					if (isSelf) {
						const avOverlay = document.createElement("button");
						avOverlay.className = "avatar-edit-overlay";
						avOverlay.textContent = t("profile_edit_avatar");
						avOverlay.onclick = () => {
							$("modal").classList.add("hidden");
							openAvatarEditor();
						};
						document.getElementById("profileLeft").appendChild(avOverlay);
						const bgBtn = document.createElement("button");
						bgBtn.className = "card-bg-edit-btn";
						bgBtn.textContent = t("card_bg_title");
						bgBtn.onclick = () => openCardBgEditor(user);
						profileCardEl.appendChild(bgBtn);
					}
					$("pname").innerHTML = user.name + `<span class="userLevel">${getUserLevel(user.coins)}</span>` +
						getRoleBadge(user);
					$("profileMeta").innerHTML = `
						<div class="metaRow">${t("profile_reg_time")}：${new Date(user.time).toLocaleString()}</div>
						<div class="metaRow">${t("profile_coins")}：${user.coins || 0}</div>
					`;
					renderLevelProgress(user.coins || 0);
					const bio = document.getElementById("profileBio");
					bio.innerHTML = (user.description || t("profile_no_desc"));
					if (isSelf) {
						const editBio = document.createElement("button");
						editBio.className = "bioEditBtn";
						editBio.textContent = t("profile_edit");
						editBio.onclick = () => {
							const box = document.querySelector(".modalBox");
							box.style.width = "400px";
							$("modalText").innerHTML = `
								<h3>${t("profile_edit_desc")}</h3>
								<textarea id="descTextarea" maxlength="500" style="height:120px;">${user.description || ""}</textarea>
								<div style="margin-top:10px;"><button id="saveDescBtn">${t("profile_save")}</button></div>
							`;
							$("modal").classList.remove("hidden");
							$("saveDescBtn").onclick = async () => {
								const newDesc = $("descTextarea").value.trim();
								try {
									await apiPut("/api/users/" + currentUser.id, {
										description: newDesc
									});
								} catch (e) {
									return modal(t("save_fail", e.message));
								}
								currentUser.description = newDesc;
								bio.innerHTML = (newDesc || t("profile_no_desc")) +
									'<button class="bioEditBtn">' + t("profile_edit") + '</button>';
								bio.querySelector(".bioEditBtn").onclick = editBio.onclick;
								$("modal").classList.add("hidden");
							};
						};
						bio.appendChild(editBio);
					}
					$("profileStats").innerHTML = `
						<a id="followersLink">${t("followers")} <b class="followerCount">${user.follower_count || 0}</b></a>
						<a id="followingLink">${t("following")} <b>${user.following_count || 0}</b></a>
					`;
					$("followersLink").onclick = () => openFollowList(uid, "followers");
					$("followingLink").onclick = () => openFollowList(uid, "following");
					const actions = document.getElementById("profileActions");
					actions.innerHTML = "";
					const viewPostsBtn = document.createElement("button");
					viewPostsBtn.className = "profileBtn";
					viewPostsBtn.textContent = isSelf ? t("profile_view_my_posts") : t("profile_view_posts", user
						.name);
					viewPostsBtn.onclick = () => {
						show("main");
						$("postSearch").value = "@" + user.name;
						postSearch = "@" + user.name;
						activePostDay = "";
						loadAnnouncements();
						activePostTag = "全部";
						renderPostFilters();
						loadPosts(1);
						setActive("homeBtn");
					};
					actions.appendChild(viewPostsBtn);
					if (isSelf) {
						const shopBtn = document.createElement("button");
						shopBtn.className = "profileBtn half";
						shopBtn.textContent = t("profile_shop");
						shopBtn.onclick = () => openShop();
						actions.appendChild(shopBtn);
						const groupsBtn = document.createElement("button");
						groupsBtn.className = "profileBtn half";
						groupsBtn.textContent = t("profile_groups");
						groupsBtn.onclick = openGroupManager;
						actions.appendChild(groupsBtn);
						const settingsBtn = document.createElement("button");
						settingsBtn.className = "profileBtn half";
						settingsBtn.innerHTML = '<svg class="pbIcon" viewBox="0 0 46.21739 46.21739" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g transform="translate(-216.8913,-156.8913)"><g fill="none" fill-rule="nonzero" stroke="currentColor" stroke-linejoin="miter" stroke-miterlimit="10"><path d="M229.30778,180c0,-5.90515 4.78707,-10.69222 10.69222,-10.69222c5.90515,0 10.69222,4.78707 10.69222,10.69222c0,5.90515 -4.78707,10.69222 -10.69222,10.69222c-5.90515,0 -10.69222,-4.78707 -10.69222,-10.69222z" stroke-width="7" stroke-linecap="butt"/><path d="M240,159.8913v8.31417" stroke-width="6" stroke-linecap="round"/><path d="M240,191.79453v8.31417" stroke-width="6" stroke-linecap="round"/><path d="M219.89131,180h8.31417" stroke-width="6" stroke-linecap="round"/><path d="M251.79453,180h8.31417" stroke-width="6" stroke-linecap="round"/><path d="M225.78101,165.78101l5.87901,5.87901" stroke-width="6" stroke-linecap="round"/><path d="M248.52518,188.33999l5.87901,5.87901" stroke-width="6" stroke-linecap="round"/><path d="M225.78101,194.219l5.87901,-5.87901" stroke-width="6" stroke-linecap="round"/><path d="M248.33999,171.66001l5.87901,-5.87901" stroke-width="6" stroke-linecap="round"/></g></g></svg>' + t("profile_settings");
						settingsBtn.onclick = () => openProfileSettings(user);
						actions.appendChild(settingsBtn);
					}
					if (!isSelf && currentUser) {
						const followBtn = document.createElement("button");
						followBtn.className = "profileBtn" + (user.is_following ? " following" : "");
						followBtn.id = "followBtn";
						followBtn.textContent = user.is_following ? t("unfollow_btn") : t("follow_btn");
						followBtn.onclick = () => toggleFollow(uid, followBtn);
						actions.appendChild(followBtn);
					}
					$("logoutBtn").style.display = isSelf ? "" : "none";
				}

				async function toggleFollow(followeeId, btn) {
					const wasFollowing = btn.classList.contains("following");
					if (wasFollowing) {
						const confirmed = await new Promise(resolve => {
							const box = document.querySelector(".modalBox");
							const origW = box.style.width;
							box.style.width = "320px";
							modal(
								'<h3 style="margin:0 0 16px;text-align:center;">' + t(
									"unfollow_confirm") + '</h3>' +
								'<div style="text-align:center">' +
								'<button id="unfConfirm" style="background:#e74c3c;color:#fff;padding:10px 40px;border-radius:20px;border:none;font-size:16px;cursor:pointer">' +
								t("confirm_btn") + '</button>' +
								'</div>'
							);
							const prevCloseHandler = $("closeModal").onclick;
							const restoreCloseHandler = () => {
								$("closeModal").onclick = prevCloseHandler;
							};
							const closeModalHandler = () => {
								$("modal").classList.add("hidden");
								box.style.width = origW;
								restoreCloseHandler();
								resolve(false);
							};
							$("unfConfirm").onclick = () => {
								$("modal").classList.add("hidden");
								box.style.width = origW;
								restoreCloseHandler();
								resolve(true);
							};
							$("closeModal").onclick = closeModalHandler;
							$("modal").onclick = e => {
								if (e.target === $("modal")) closeModalHandler();
							};
						});
						if (!confirmed) return;
					}
					btn.classList.toggle("following", !wasFollowing);
					btn.textContent = wasFollowing ? t("follow_btn") : t("unfollow_btn");
					try {
						const res = await apiPost("/api/follows/toggle", {
							follower_id: currentUser.id,
							followee_id: followeeId,
						});
						const fc = document.querySelector(".followerCount");
						if (fc) {
							fc.textContent = Math.max(0, parseInt(fc.textContent) + (res.action === "followed" ? 1 :
								-1));
						}
						if (res.action === "followed") {
							await createNotification({
								targetId: followeeId,
								actorId: currentUser.id,
								postId: null,
								type: "follow"
							});
							await refreshNotificationBadge();
						}
					} catch {
						btn.classList.toggle("following", wasFollowing);
						btn.textContent = wasFollowing ? t("unfollow_btn") : t("follow_btn");
					}
				}

				async function openFollowList(userId, type) {
					document.querySelector(".modalBox").style.width = "360px";
					modal(
						`<h3>${type === "followers" ? t("followers") : t("following")}</h3>
						<div id="followListBox" style="max-height:320px;overflow:auto;text-align:left;"><p style="text-align:center;color:var(--sub);">Loading...</p></div>`
					);
					let data;
					try {
						data = await apiGet("/api/follows/list?user_id=" + userId + "&type=" + type + (currentUser ?
							"&requester_id=" + currentUser.id : ""));
					} catch {
						modal(t("read_fail", ""));
						return;
					}
					if (data === null) {
						modal(t("follow_list_private"));
						return;
					}
					const rows = data || [];
					const content = rows.length ?
						rows.map(x => {
							const u = x.users;
							return `<div class="onlineUser voteUser" data-user="${u?.id}" style="display:flex;align-items:center;gap:8px;">
								<img class="avatar onlineAvatar" src="${getAvatar(u)}" onerror="this.onerror=null;this.src='assets/img/head.svg'">
								<span>${u?.name || t("post_unknown")}</span>
								<span class="userLevel">${getUserLevel(u?.coins || 0)}</span>
								${getRoleBadge(u)}
							</div>`;
						}).join("") :
						`<div style="color:var(--sub);padding:8px 0;">${t("vote_none")}</div>`;
					const listDiv = document.getElementById("followListBox");
					if (listDiv) {
						listDiv.innerHTML = content;
						setTimeout(() => {
							listDiv.querySelectorAll(".voteUser").forEach(el => {
								el.onclick = () => {
									$("modal").classList.add("hidden");
									viewUser(Number(el.dataset.user));
								};
							});
						}, 0);
					}
				}

