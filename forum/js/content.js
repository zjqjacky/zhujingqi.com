let allUsersCache = [];
let mentionState = {
	el: null,
	start: 0,
	end: 0,
	items: [],
	activeIndex: 0
};
async function ensureAllUsersCache() {
	if (allUsersCache.length) return allUsersCache;
	try {
		const data = await apiGet("/api/users");
		allUsersCache = data || [];
	} catch {
		allUsersCache = [];
	}
	return allUsersCache;
}

function hideMentionBox() {
	const box = $("mentionBox");
	if (!box) return;
	box.classList.add("hidden");
	box.innerHTML = "";
	mentionState.el = null;
	mentionState.items = [];
	mentionState.activeIndex = 0;
}

function showMentionBox(el, items, start, end) {
	const box = $("mentionBox");
	if (!box) return;
	const rect = el.getBoundingClientRect();
	mentionState.el = el;
	mentionState.start = start;
	mentionState.end = end;
	mentionState.items = items;
	mentionState.activeIndex = 0;
	box.classList.remove("hidden");
	box.style.left = Math.min(rect.left, window.innerWidth - 340) + "px";
	box.style.top = (rect.bottom + 6) + "px";
	box.innerHTML = items.map((u, idx) => `
						<div class="mentionItem ${idx === 0 ? "active" : ""}" data-index="${idx}" data-uid="${u.id}" data-uname="${u.name}">
							<img class="avatar" src="${getAvatar(u)}" onerror="this.onerror=null;this.src='assets/img/head.svg'">
							<div style="min-width:0;">
								<div><b>${escapeHtml(getDisplayName(u))}</b>${u.nickname ? ` <span style="color:var(--sub);font-size:12px;">@${escapeHtml(u.name)}</span>` : ""}</div>
								<div class="time">${t("mention_click_hint")}</div>
							</div>
						</div>
					`).join("");
	box.onmousedown = e => e.preventDefault();
	box.querySelectorAll(".mentionItem").forEach(item => {
		item.onclick = () => insertMentionFromBox(Number(item.dataset.uid), item.dataset.uname);
	});
}

function getMentionContext(el) {
	if (!el) return null;

	// 富文本编辑器（contenteditable）没有 value/selectionStart，用光标前的文字判断
	if (el.isContentEditable) {
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return null;
		const node = sel.getRangeAt(0).startContainer;
		if (!el.contains(node)) return null;
		const before = (node.nodeType === 3 ? node.nodeValue : node.textContent) || "";
		const upto = before.slice(0, sel.getRangeAt(0).startOffset);
		const m = upto.match(/(^|[\s(])@([\p{L}\p{N}_-]{0,32})$/u);
		if (!m) return null;
		// contenteditable 用 Range 定位，不返回 start/end
		return { range: null, query: m[2], editable: true };
	}

	const caret = el.selectionStart ?? 0;
	const text = el.value.slice(0, caret);
	const match = text.match(/(^|[\s(])@([\p{L}\p{N}_-]{0,32})$/u);
	if (!match) return null;
	return {
		start: caret - match[2].length - 1,
		end: caret,
		query: match[2]
	};
}
async function updateMentionBox(el) {
	const ctx = getMentionContext(el);
	if (!ctx) {
		hideMentionBox();
		return;
	}
	const users = await ensureAllUsersCache();
	const q = ctx.query;
	// 账号名大小写敏感，昵称大小写不敏感（昵称库里有 lower() 唯一索引）
	const items = users
		.filter(u =>
			(u.name || "").includes(q) ||
			(u.nickname || "").toLowerCase().includes(q.toLowerCase())
		)
		.sort((a, b) => {
			// 完全匹配账号名的排最前，避免 FXDhxc / FXDHXC 互相遮挡
			const am = (a.name || "") === q ? 0 : (a.name || "").startsWith(q) ? 1 : 2;
			const bm = (b.name || "") === q ? 0 : (b.name || "").startsWith(q) ? 1 : 2;
			return am - bm;
		})
		.slice(0, 6);
	if (!items.length) {
		hideMentionBox();
		return;
	}
	showMentionBox(el, items, ctx.start, ctx.end);
}

function insertMentionFromBox(userId, userName) {
	const el = mentionState.el;
	if (!el) return;

	// 富文本编辑器：直接把光标处的 @xxx 片段换成可点击的提及节点
	if (el.isContentEditable) {
		el.focus();
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return;
		const node = sel.getRangeAt(0).startContainer;
		const upto = (node.nodeType === 3 ? node.nodeValue : node.textContent) || "";
		const m = /@([\p{L}\p{N}_-]*)$/u.exec(upto);
		if (!m) { hideMentionBox(); return; }
		const range = document.createRange();
		try {
			range.setStart(node, upto.length - m[0].length);
			range.setEnd(node, upto.length);
		} catch (e) { hideMentionBox(); return; }
		range.deleteContents();
		const span = document.createElement("span");
		span.className = "mentionLink edMention";
		span.dataset.uname = userName;
		span.textContent = "@" + userName + " ";
		range.insertNode(span);
		range.setStartAfter(span);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
		hideMentionBox();
		el.dispatchEvent(new Event("input", { bubbles: true }));
		return;
	}

	const before = el.value.slice(0, mentionState.start);
	const after = el.value.slice(mentionState.end);
	el.value = before + "@" + userName + " " + after;
	const pos = (before + "@" + userName + " ").length;
	el.focus();
	el.setSelectionRange(pos, pos);
	hideMentionBox();
	el.dispatchEvent(new Event("input", {
		bubbles: true
	}));
}

function linkifyMentions(root) {
	if (!root) return;
	const users = allUsersCache;
	if (!users.length) return;
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const nodes = [];
	while (walker.nextNode()) nodes.push(walker.currentNode);
	for (const node of nodes) {
		if (!node.parentElement) continue;
		if (node.parentElement.closest(".mentionLink,script,style")) continue;
		const text = node.nodeValue;
		if (!text || !text.includes("@")) continue;
		const frag = document.createDocumentFragment();
		let last = 0;
		const reg = /(^|[\s(])@([\p{L}\p{N}_-]{1,32})/gu;
		let m;
		while ((m = reg.exec(text))) {
			const full = m[0];
			const prefix = m[1] || "";
			const uname = m[2];
			const found = users.find(u => u.name === uname);
			const before = text.slice(last, m.index);
			if (before) frag.appendChild(document.createTextNode(before));
			if (found) {
				if (prefix) frag.appendChild(document.createTextNode(prefix));
				const span = document.createElement("span");
				span.className = "mentionLink";
				span.textContent = "@" + found.name;
				span.onclick = () => viewUser(found.id);
				frag.appendChild(span);
			} else {
				frag.appendChild(document.createTextNode(full));
			}
			last = m.index + full.length;
		}
	const tail = text.slice(last);
	if (tail) frag.appendChild(document.createTextNode(tail));
	node.parentNode.replaceChild(frag, node);
}
}
function linkifyUrls(root) {
if (!root) return;
const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
const nodes = [];
while (walker.nextNode()) nodes.push(walker.currentNode);
for (const node of nodes) {
	if (!node.parentElement) continue;
	if (node.parentElement.closest(".mentionLink,.emojiInPost,script,style,a")) continue;
	const text = node.nodeValue;
	if (!text) continue;
	const reg = /(^|[\s(])((?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d+)?(?:\/[^\s<>"']*)?)/gi;
					let m;
					let hit = false;
					while ((m = reg.exec(text))) { hit = true; }
					if (!hit) continue;
					reg.lastIndex = 0;
					const frag = document.createDocumentFragment();
					let last = 0;
					while ((m = reg.exec(text))) {
						const prefix = m[1] || "";
						const url = m[2];
						const before = text.slice(last, m.index);
						if (before) frag.appendChild(document.createTextNode(before));
						if (prefix) frag.appendChild(document.createTextNode(prefix));
						const href = /^https?:\/\//i.test(url) ? url : "https://" + url;
		const a = document.createElement("a");
		a.href = href;
		a.target = "_blank";
		a.rel = "noopener noreferrer";
		a.className = "postLink";
		a.textContent = url;
		frag.appendChild(a);
		last = m.index + m[0].length;
	}
	const tail = text.slice(last);
	if (tail) frag.appendChild(document.createTextNode(tail));
	node.parentNode.replaceChild(frag, node);
}
}

function renderEmojis(root) {
	if (!root) return;
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const nodes = [];
	while (walker.nextNode()) nodes.push(walker.currentNode);
	for (const node of nodes) {
		if (!node.parentElement) continue;
		if (node.parentElement.closest(".mentionLink,script,style,.emojiInPost")) continue;
		const text = node.nodeValue;
		if (!text || !text.includes(":")) continue;
		const frag = document.createDocumentFragment();
		let last = 0;
		const reg = /:([a-zA-Z0-9_-]+):/g;
		let m;
		while ((m = reg.exec(text))) {
			const before = text.slice(last, m.index);
			if (before) frag.appendChild(document.createTextNode(before));
			const name = m[1].toLowerCase();
			if (EMOJI_MAP.includes(name)) {
				const img = document.createElement("img");
				img.src = "emojis/" + name + ".svg";
				img.className = "emojiInPost";
				img.alt = ":" + name + ":";
				frag.appendChild(img);
			} else {
				frag.appendChild(document.createTextNode(m[0]));
			}
			last = m.index + m[0].length;
		}
		const tail = text.slice(last);
		if (tail) frag.appendChild(document.createTextNode(tail));
		node.parentNode.replaceChild(frag, node);
	}
}
async function notifyMentions(rawText, postId, commentId = null) {
	const users = await ensureAllUsersCache();
	const plain = String(rawText || "")
		.replace(/<[^>]*>/g, "");
	const matches = [...plain.matchAll(/@([\p{L}\p{N}_-]{1,32})/gu)];
	const targetIds = [];
	for (const m of matches) {
		// 账号名在库里是大小写敏感唯一（users_name_key on btree(name)），
		// 所以这里必须精确匹配：FXDhxc 和 FXDHXC 是两个不同账号。
		const uname = m[1].trim();
		const u = users.find(x => x.name && x.name === uname);
		if (u && !targetIds.includes(u.id)) {
			targetIds.push(u.id);
		}
	}
	for (const targetId of targetIds) {
		await createNotification({
			targetId,
			actorId: currentUser.id,
			postId,
			commentId,
			type: "mention"
		});
	}
}
$("homeBtn").onclick = () => {
	show("main");

	activePostTag = "全部";
	postSearch = "";
	activePostDay = "";
	const search = $("postSearch");
	if (search) search.value = "";
	renderPostFilters();
	loadStats();
	loadPosts(1);
	loadOnlineUsers();
	startPresence();
	refreshNotificationBadge();
	setActive("homeBtn");
	loadAnnouncements();
};
$("editorBtn").onclick = () => {
	show("editorPage");

	setActive("editorBtn");
	renderTagBar();
};
$("showUsersBtn").onclick = () => {
	show("userListPage");
	loadNewUsers();
	setupRankToggle();
	loadUserList();
	setActive("showUsersBtn");
};
$("notifBtn").onclick = () => openNotifications();
$("loginTopBtn").onclick = () => {
	show("welcomePage");
};
$("searchBall").onclick = () => {
	$("searchOverlay").classList.remove("hidden");
	const input = $("postSearch");
	input.value = postSearch;
	input.focus();
	input.select();
	if (typeof renderPostTimeline === "function") renderPostTimeline();
};
document.addEventListener("input", e => {
	const el = e.target;
	if (!el.matches || !el.matches("[data-mention-input]")) return;
	updateMentionBox(el);
});
document.addEventListener("keydown", e => {
	const box = $("mentionBox");
	if (box.classList.contains("hidden")) return;
	if (e.key === "Escape") {
		hideMentionBox();
		return;
	}
	if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
		e.preventDefault();
		const items = [...box.querySelectorAll(".mentionItem")];
		if (!items.length) return;
		if (e.key === "ArrowDown") mentionState.activeIndex = (mentionState.activeIndex + 1) %
			items.length;
		if (e.key === "ArrowUp") mentionState.activeIndex = (mentionState.activeIndex - 1 + items
			.length) % items.length;
		if (e.key === "Enter") {
			const item = items[mentionState.activeIndex];
			if (item) insertMentionFromBox(Number(item.dataset.uid), item.dataset.uname);
			return;
		}
		items.forEach((el, idx) => el.classList.toggle("active", idx === mentionState
			.activeIndex));
	}
});
document.addEventListener("click", e => {
	if (e.target.closest("#mentionBox")) return;
	if (e.target.matches && e.target.matches("[data-mention-input]")) return;
	hideMentionBox();
});
document.addEventListener("click", e => {
	const img = e.target.closest(".zoomable");
	if (img) {
		openViewer(img.src);
	}
});
document.addEventListener("visibilitychange", () => {
	if (document.visibilityState === "visible" && currentUser) {
		touchPresence();
		if (currentPage === "main") loadOnlineUsers();
	}
});

