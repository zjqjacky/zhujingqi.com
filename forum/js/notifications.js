async function createNotification({
	targetId,
	actorId,
	postId,
	commentId = null,
	type
}) {
	if (!targetId || !actorId || targetId === actorId) return;
	if (type !== "comment" && type !== "mention" && type !== "gift" && type !== "follow" && type !==
		"reply") return;
	try {
		const body = {
			target_id: targetId,
			actor_id: actorId,
			type,
			is_read: false,
			created_at: new Date().toISOString()
		};
		if (postId != null) body.post_id = postId;
		if (commentId != null) body.comment_id = commentId;
		await apiPost("/api/notifications", body);
	} catch (e) {
		console.error("通知插入失败", e);
	}
}

function notifLabel(n) {
	if (n.type === "chat_friend") return t("notif_friend");
	if (n.type === "follow") return t("notif_follow");
	if (n.type === "reply") return t("notif_reply");
	if (n.type === "comment") return t("notif_comment");
	if (n.type === "mention") return t("notif_mention");
	if (n.type === "gift") return t("notif_gift");
	return t("notif_new");
}

async function refreshNotificationBadge() {
	if (!currentUser) return;
	try {
		const notifRes = await apiGet("/api/notifications/count?target_id=" + currentUser.id);
		let chatCount = 0;
		try {
			const chatRes = await apiGet("/api/chat/unread?user_id=" + currentUser.id);
			chatCount = chatRes.count || 0;
		} catch {}
		const badge = $("notifBadge");
		if (!badge) return;
		const unread = (notifRes.count || 0) + chatCount;
		badge.textContent = unread;
		badge.hidden = false;
		badge.style.background = unread === 0 ? 'var(--card)' : '#ff3b30';
		badge.style.color = unread === 0 ? 'var(--sub)' : '#fff';
	} catch (e) {
		console.error(e);
	}
}
async function markNotificationRead(id) {
	if (!currentUser || !id) return false;
	try {
		await apiPut("/api/notifications/read/" + id, {
			target_id: currentUser.id
		});
		return true;
	} catch (e) {
		console.error("标记通知已读失败：", e);
		return false;
	}
}

function buildPostQuery(page, perPage) {
	let q = `?page=${page}&perPage=${perPage}`;
	if (currentUser) q += "&userId=" + currentUser.id;
	if (activePostTag && activePostTag !== "全部" && activePostTag !== "其它" && activePostTag !== "关注") q +=
		"&tag=" + encodeURIComponent(activePostTag);
	if (postSearch) q += "&search=" + encodeURIComponent(postSearch);
	if (activePostDay) q += "&day=" + activePostDay + "&tz=" + (-new Date().getTimezoneOffset());
	return q;
}
async function openNotificationPost(postId) {
	$("modal").classList.add("hidden");
	history.replaceState(null, "", "?pid=" + postId);
	try {
		await openSinglePost(postId);
	} catch {
		modal(t("post_not_found"));
	}
}
async function openSinglePost(postId) {
	show("postPage");
	const container = $("singlePost");
	container.innerHTML =
		"<p style='text-align:center;color:var(--sub);margin-top:20px;'>Loading...</p>";
	const post = await apiGet("/api/posts/single?id=" + postId + (currentUser ? "&userId=" +
		currentUser.id : ""));
	if (!post || post.error) throw new Error(t("post_not_found"));
	let likeCount = post.likes || 0;
	let dislikeCount = post.dislikes || 0;
	let liked = post.userVote == 1;
	let disliked = post.userVote == -1;
	const meta = getPostMeta(post.content);
	const avatar = getAvatar(post.users);
	const postDiv = document.createElement("div");
	postDiv.className = "post";
	postDiv.dataset.postId = post.id;
	postDiv.dataset.authorId = post.author;
	if (meta.bg) {
		postDiv.style.setProperty("--custom-bg", meta.bg);
		postDiv.classList.add("custom-bg");
	}
	postDiv.innerHTML =
		'<div class="postHeaderTop"><div class="userInfo">' +
		'<span class="userLink userLinkWithAvatar" data-user="' + post.author + '">' +
		'<img class="avatar" src="' + avatar +
		'" onerror="this.onerror=null;this.src=\'assets/img/head.svg\'">' +
		(post.users?.name || t("post_unknown")) +
		'<span class="userLevel">' + getUserLevel(post.users?.coins || 0) + '</span>' +
		'<span>' + getRoleBadge(post.users) + '</span>' +
		'</span>' +
		'<span class="time">' + new Date(post.time).toLocaleString() + '</span>' +
		(post.scope && post.scope !== "public" ? getScopeBadgeHTML(post.scope) : '') +
		(guestMode ? '' : '<div class="shareBtnWrapper"><button class="shareBtn" data-share="' + post
			.id + '">+</button><div class="sharePopover"><button data-copy="' + post.id +
			'">' + t("post_share") + '</button></div></div>') +
		'</div></div>' +
		'<div class="postTags">' +
		(post.tag ? '<span class="postTag" data-tag="' + post.tag + '">' + post.tag + '</span>' :
			"") +
		'</div>' +
		'<div class="postContent"></div>' +
		(guestMode ? '' :
			'<div class="postActions">' +
			'<div class="voteGroup">' +
			'<span class="like ' + (liked ? "liked" : "") + '" data-id="' + post.id + '">' +
			'<svg viewBox="0 0 24 24" class="voteIcon"><path d="M12 21s-6.7-4.35-9.33-8A5.4 5.4 0 0 1 12 4.2A5.4 5.4 0 0 1 21.33 13C18.7 16.65 12 21 12 21z"/></svg> ' +
			'<span class="voteNum">' + likeCount + '</span>' +
			'</span>' +
			'<span class="dislike ' + (disliked ? "disliked" : "") + '" data-dislike="' + post.id +
			'">' +
			'<svg viewBox="0 0 24 24" class="voteIcon"><path d="M12 21l-8-8h5V3h6v10h5l-8 8z"/></svg> ' +
			'<span class="voteNum">' + dislikeCount + '</span>' +
			'</span>' +
			'</div>' +
			'<div class="voteWhoRow">' +
			'<span class="voteWhoLink" data-vote-list="like" data-post="' + post.id +
			'">' + t("post_likers") + '</span>' +
			'<span class="voteWhoLink" data-vote-list="dislike" data-post="' + post.id +
			'">' + t("post_dislikers") + '</span>' +
			'</div>' +
			(currentUser && (post.author === currentUser.id || (isAdmin(currentUser) && !post.users
					?.role?.includes?.('owner'))) ? '<button data-del="' + post.id +
				'">' + t("post_delete") + '</button>' : "") +
			'</div>') +
		(guestMode ? '' : '<div class="commentRow"><input data-input="' + post.id +
			'" data-mention-input="1" placeholder="' + t("post_comment_ph") + '">' +
			'<button class="emojiBtn commentEmojiBtn" data-emoji-target="' + post.id +
			'" type="button" title="表情"><img src="emojis/happy.svg" style="width:18px;height:18px;display:block;pointer-events:none;"></button>' +
			'<button data-comment="' + post.id + '">' + t("post_send") + '</button></div>') +
		'<div class="commentList"></div>';
	container.innerHTML = "";
	container.appendChild(postDiv);
	const bodyBox = postDiv.querySelector(".postContent");
	if (meta.warn) {
		bodyBox.innerHTML = `
							<div class="postWarnGate">
								<div class="warnMsg"></div>
								<button type="button" class="revealWarnBtn">${t("post_show_content")}</button>
							</div>
						`;
		bodyBox.querySelector(".warnMsg").textContent = meta.warnText || t("warn_default");
		bodyBox.querySelector(".revealWarnBtn").onclick = () => {
			renderPostBody(bodyBox, post.content);
		};
	} else {
		renderPostBody(bodyBox, post.content);
	}
	if (!guestMode) {
		postDiv.querySelectorAll("[data-vote-list]").forEach(el => {
			el.onclick = () => openVotePeople(post.id, el.dataset.voteList);
		});
		postDiv.querySelector(".like").onclick = () => likePost(post.id, postDiv);
		postDiv.querySelector(".dislike").onclick = () => dislikePost(post.id, postDiv);
		const postTagEl = postDiv.querySelector(".postTag");
		if (postTagEl) postTagEl.onclick = e => {
			e.stopPropagation();
			activePostTag = postTagEl.dataset.tag;
			postSearch = "";
			$("postSearch").value = "";
			show("main");
			setActive("homeBtn");
			renderPostFilters();
			loadStats();
			loadPosts(1);
			loadAnnouncements();
		};
		const delBtn = postDiv.querySelector("[data-del]");
		if (delBtn) delBtn.onclick = () => deletePost(post.id);
		const shareBtn = postDiv.querySelector("[data-share]");
		if (shareBtn) {
			shareBtn.onclick = e => {
				e.stopPropagation();
				const pop = shareBtn.nextElementSibling;
				pop.classList.toggle("show");
			};
			const copyBtn = shareBtn.nextElementSibling.querySelector("[data-copy]");
			copyBtn.onclick = e => {
				e.stopPropagation();
				const url = location.href.split('?')[0] + '?pid=' + copyBtn.dataset.copy;
				navigator.clipboard.writeText(url);
				showCoinMsg(t("copied_link_msg"));
				shareBtn.nextElementSibling.classList.remove("show");
			};
		}
		const submit = () => {
			const text = postDiv.querySelector("[data-input]")?.value.trim();
			if (text) addComment(post.id, text, post.author);
		};
		postDiv.querySelector("[data-comment]").onclick = submit;
		postDiv.querySelector("[data-input]")?.addEventListener("keydown", e => e.key === "Enter" &&
			submit());
	}
	postDiv.querySelector(".userLink").onclick = () => viewUser(post.author);
	renderComments(post.id, postDiv.querySelector(".commentList"), undefined, post.author);
	container.style.paddingBottom = "60px";
}

async function openNotifications() {
	if (!currentUser) return;
	await cleanupNotifications();
	await ensureAllUsersCache();
	document.querySelector(".modalBox").style.width = "420px";
	modal(`<h3>${t("notif_title")}</h3>
						<div id="notifListWrap" style="max-height:320px;overflow:auto;text-align:left;"><p style="text-align:center;color:var(--sub);">Loading...</p></div>
						<div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">
							<button id="clearNotifBtn">${t("modal_delete_all")}</button>
							<button id="markAllReadBtn">${t("modal_mark_read")}</button>
						</div>`);
	let rows;
	let chatUnread = 0;
	try {
		rows = await apiGet("/api/notifications?target_id=" + currentUser.id);
	} catch (e) {
		modal(t("notif_load_fail", e.message));
		return;
	}
	try {
		const chatRes = await apiGet("/api/chat/unread?user_id=" + currentUser.id);
		chatUnread = chatRes.count || 0;
	} catch {}
	rows = rows || [];
	const chatHtml = chatUnread > 0 ? `
						<div class="notifItem chatNotifItem"
							style="padding:8px 10px;border-bottom:1px solid var(--bg);cursor:pointer;border-radius:14px;font-weight:700;background:rgba(0,0,0,.03);">
							<div style="display:flex;align-items:center;gap:8px;">
								<img src="https://zhujingqi.com/chat/icon.svg" style="width:32px;height:32px;border-radius:50%;flex-shrink:0;">
								<div style="min-width:0;flex:1;">
									<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
										<b>${t("notif_chat")}</b>
										<span style="color:var(--green);font-weight:700;">${t("notif_chat_msg", chatUnread)}</span>
									</div>
								</div>
							</div>
						</div>
					` : "";
	const notifHtml = rows.length ?
		chatHtml + rows.map(n => {
			const a = n.actor;
			const actorFromId = a == null && n.actor_id != null ? n.actor_id : a;
			let actorName, actorAvatar;
			if (typeof actorFromId === 'object' && actorFromId) {
				actorName = actorFromId.name || t("post_unknown");
				actorAvatar = getAvatar(actorFromId);
			} else if (actorFromId != null) {
				const uid = Number(actorFromId);
				const found = allUsersCache.find(u => u.id === uid);
				actorName = found ? found.name : t("post_unknown");
				actorAvatar = found ? getAvatar(found) : DEFAULT_AVATAR;
			} else {
				actorName = t("post_unknown");
				actorAvatar = DEFAULT_AVATAR;
			}
			const unreadClass = n.is_read ? "" : "font-weight:700;background:rgba(0,0,0,.03);";
			return `
								<div class="notifItem"
									data-nid="${n.id}"
									data-post="${n.post_id}"
									style="padding:8px 10px;border-bottom:1px solid var(--bg);cursor:pointer;border-radius:14px;${unreadClass}">
									<div style="display:flex;align-items:center;gap:8px;">
										<img class="avatar notifAvatar" src="${actorAvatar}" onerror="this.onerror=null;this.src='assets/img/head.svg'">
										<div style="min-width:0;flex:1;">
											<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
												<b>${actorName}</b>
												<span>${notifLabel(n)}</span>
											</div>
											<div class="time">${new Date(n.created_at).toLocaleString()}</div>
										</div>
									</div>
								</div>
							`;
		}).join("") :
		(chatHtml || `<div style="color:var(--sub);padding:8px 0;">${t("modal_no_notifs")}</div>`);
	const wrap = $("notifListWrap");
	if (wrap) wrap.innerHTML = notifHtml;
	$("markAllReadBtn").onclick = async () => {
		try {
			await apiPut("/api/notifications/read", {
				target_id: currentUser.id
			});
		} catch (e) {
			console.error(e);
		}
		await refreshNotificationBadge();
		openNotifications();
	};
	$("clearNotifBtn").onclick = async () => {
		try {
			await apiDelete("/api/notifications", {
				target_id: currentUser.id
			});
		} catch (e) {
			modal(t("delete_fail", e.message));
			return;
		}
		$("modal").classList.add("hidden");
		await refreshNotificationBadge();
	};
	document.querySelectorAll(".notifItem").forEach(el => {
		if (el.classList.contains("chatNotifItem")) {
			el.onclick = () => window.open("https://zhujingqi.com/chat/", "_blank");
			return;
		}
		el.onclick = async () => {
			await markNotificationRead(Number(el.dataset.nid));
			await refreshNotificationBadge();
			const post = el.dataset.post;
			const postId = Number(post);
			if (!post || post === "null" || post === "undefined") return;
			if (isNaN(postId)) {
				const gift = SHOP_ITEMS.find(i => i.id === post);
				modal(t("gift_received", gift ? gift.name : t("shop_item_generic")));
			} else {
				await openNotificationPost(postId);
			}
		};
	});
}
async function cleanupNotifications() {
	if (!currentUser) return;
	let data;
	try {
		data = await apiGet("/api/notifications?target_id=" + currentUser.id);
	} catch {
		return;
	}
	if (!data) return;
	const oldIds = data.slice(100).map(x => x.id);
	if (oldIds.length) {
		try {
			await apiDelete("/api/notifications", {
				target_id: currentUser.id
			});
		} catch {}
	}
}

function sanitizePostHtml(txt) {
	const safeTags = {
		b: [],
		i: [],
		u: [],
		br: [],
		hr: [],
		center: [],
		marquee: [],
		h1: ["style"],
		h2: ["style"],
		h3: ["style"],
		h4: ["style"],
		h5: ["style"],
		h6: ["style"],
		div: ["style"],
		span: ["style"],
		a: ["href", "style"],
		img: ["src", "style", "class"]
	};
	const safeStyles = [
		"color",
		"background",
		"background-color",
		"font-size",
		"text-align",
		"border-radius",
		"margin",
		"margin-top",
		"margin-bottom",
		"padding",
		"width",
		"height",
		"max-width",
		"display"
	];
	txt = String(txt || "");
	txt = txt
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
	txt = txt.replace(
		/&lt;(\/?)([a-z0-9]+)(.*?)&gt;/gi,
		(match, closing, tagName, attrs) => {
			tagName = tagName.toLowerCase();
			if (!safeTags[tagName]) {
				return match;
			}
			if (closing) {
				return `</${tagName}>`;
			}
			let allowedAttrs = "";
			for (const attr of safeTags[tagName]) {
				const reg = new RegExp(
					attr + `="([^"]*)"`,
					"i"
				);
				const found = attrs.match(reg);
				if (!found) continue;
				let value = found[1].trim();
				if (/^javascript:/i.test(value)) {
					continue;
				}
				if (attr === "href") {
					if (!/^https?:\/\//i.test(value)) {
						continue;
					}
				}
				if (attr === "src") {

					if (!/^https?:\/\//i.test(value)) {
						continue;
					}
				}
				if (attr === "style") {
					if (
						/expression|url\s*\(|javascript:|position\s*:\s*fixed/i.test(value)
					) {
						continue;
					}
					let finalStyle = "";
					value.split(";").forEach(rule => {
						let [key, val] = rule.split(":");
						if (!key || !val) return;
						key = key.trim().toLowerCase();
						val = val.trim();
						if (!safeStyles.includes(key)) {
							return;
						}
						finalStyle += `${key}:${val};`;
					});
					value = finalStyle;
					if (!value.trim()) {
						continue;
					}
				}
				allowedAttrs += ` ${attr}="${value}"`;
			}
			return `<${tagName}${allowedAttrs}>`;
		});
	return txt;
}
