function renderPager() {
	const pager = $("postPager");
	if (!pager) return;
	if (guestMode) {
		pager.innerHTML = "";
		return;
	}
	pager.innerHTML = "";
	const maxPage = Math.max(1, Math.ceil(totalPostCount / getPostsPerPage()));
	const makeBtn = (text, page, cls = "pageBtn", disabled = false, active = false) => {
		const b = document.createElement("button");
		b.className = cls + (active ? " active" : "");
		b.textContent = text;
		b.disabled = disabled;
		if (!disabled && page) {
			b.onclick = () => loadPosts(page);
		}
		return b;
	};
	if (isWatchMode()) {
		pager.appendChild(makeBtn("‹", postPage - 1, "navBtn", postPage <= 1));
		pager.appendChild(makeBtn("›", postPage + 1, "navBtn", postPage >= maxPage));
		return;
	}
	const addEllipsis = () => {
		const s = document.createElement("span");
		s.className = "ellipsis";
		s.textContent = "...";
		pager.appendChild(s);
	};
	pager.appendChild(makeBtn("‹", postPage - 1, "navBtn", postPage <= 1));
	const pages = [];
	if (maxPage <= 7) {
		for (let i = 1; i <= maxPage; i++) pages.push(i);
	} else {
		pages.push(1);
		let start = Math.max(2, postPage - 2);
		let end = Math.min(maxPage - 1, postPage + 2);
		if (start > 2) pages.push("...");
		for (let i = start; i <= end; i++) pages.push(i);
		if (end < maxPage - 1) pages.push("...");
		pages.push(maxPage);
	}
	for (let item of pages) {
		if (item === "...") {
			addEllipsis();
		} else {
			pager.appendChild(
				makeBtn(String(item), item, "pageBtn", false, item === postPage)
			);
		}
	}
	pager.appendChild(makeBtn("›", postPage + 1, "navBtn", postPage >= maxPage));
	pager.appendChild(makeBtn("»", maxPage, "navBtn", postPage >= maxPage));
	const jumpInput = document.createElement("input");
	jumpInput.type = "text";
	jumpInput.className = "jumpInput";
	jumpInput.placeholder = t("jump_ph");
	jumpInput.inputMode = "numeric";
	const jumpGo = document.createElement("button");
	jumpGo.className = "jumpGo";
	jumpGo.textContent = "GO";
	const doJump = () => {
		const val = parseInt(jumpInput.value, 10);
		if (!isNaN(val) && val >= 1 && val <= maxPage) {
			loadPosts(val);
		}
	};
	jumpInput.onkeydown = (e) => {
		if (e.key === "Enter") doJump();
	};
	jumpGo.onclick = doJump;
	pager.appendChild(jumpInput);
	pager.appendChild(jumpGo);
}
function renderPostFilters() {
	const search = $("postSearch");
	const tagBar = $("postTagBar");
	if (!search || !tagBar) return;
	const isMobile = window.innerWidth <= 800;
	const tagDisplayMap = {
		"全部": t("filter_all"),
		"关注": t("filter_following"),
		"公告": t("filter_announce"),
		"其它": t("filter_other")
	};
	for (const d of defaultTags) tagDisplayMap[d] = t(defaultTagKeys[d]) || d;
	search.value = postSearch;
	tagBar.innerHTML = "";
	const mobileOnlyTags = ["全部", "关注", "公告"];
	for (const tag of filterTags) {
		if (isMobile && !mobileOnlyTags.includes(tag)) continue;
		const chip = document.createElement("span");
		chip.className = "postTagChip" + (tag === activePostTag ? " active" : "");
		chip.textContent = tagDisplayMap[tag] || tag;
		chip.onclick = () => {
			activePostTag = tag;
			postSearch = "";
			activePostDay = "";
			$("postSearch").value = "";
			renderPostFilters();
			loadStats();
			loadPosts(1);
		};
		tagBar.appendChild(chip);
	}
	const aiChip = document.createElement("span");
	aiChip.className = "aiAskChip";
	aiChip.innerHTML = '<img class="aiAskIcon" src="icon/jackyai.svg" alt="AI" onerror="this.style.display=\'none\'">' + t("ai_entry");
	aiChip.onclick = openAIModal;
	tagBar.appendChild(aiChip);
	$("searchBtn").onclick = () => {
		applyQuery(search.value);
		syncUrlFromQuery();
		loadStats();
		loadPosts(1);
		closeSearchSheet();
	};
	search.onkeydown = e => {
		if (e.key === "Enter") {
			applyQuery(search.value);
			syncUrlFromQuery();
			loadStats();
			loadPosts(1);
			closeSearchSheet();
		}
	};
	if (typeof renderPostTimeline === "function") renderPostTimeline();
}
function applyQuery(raw) {
	postSearch = (raw || "").trim();
	activePostDay = "";
	const matchedTag = ["关注", ...defaultTags, "公告"].find(t => t === postSearch);
	if (matchedTag) {
		activePostTag = matchedTag;
		postSearch = "";
	}
	renderPostFilters();
}
function syncUrlFromQuery() {
	const params = new URLSearchParams();
	if (postSearch) params.set("q", postSearch);
	if (activePostDay) params.set("d", activePostDay);
	const qs = params.toString();
	history.pushState(null, "", qs ? ("?" + qs) : window.location.pathname);
}
async function renderPostTimeline() {
	const el = $("postTimeline");
	if (!el) return;
	try {
		const tz = -new Date().getTimezoneOffset();
		const cacheKey = "tlDays_" + tz;
		let cached = null;
		try {
			const raw = sessionStorage.getItem(cacheKey);
			if (raw) {
				cached = JSON.parse(raw);
				if (Date.now() - cached.ts > 5 * 60 * 1000) cached = null;
			}
		} catch {}
		let days = cached ? cached.data : null;
		if (!days) {
			days = await apiGet("/api/posts/days?days=7&tz=" + tz);
			try {
				sessionStorage.setItem(cacheKey, JSON.stringify({
					ts: Date.now(),
					data: days
				}));
			} catch {}
		}
		if (!Array.isArray(days) || !days.length) {
			el.classList.remove("show");
			return;
		}
		const todayLocal = new Date(Date.now() + tz * 60000).toISOString().slice(0, 10);
		el.innerHTML = "";
		el.classList.add("show");
		const allBtn = document.createElement("button");
		allBtn.type = "button";
		allBtn.className = "timelineAll" + (activePostDay ? "" : " active");
		allBtn.textContent = t("filter_all");
		allBtn.onclick = () => {
			if (!activePostDay) return;
			activePostDay = "";
			renderPostFilters();
			syncUrlFromQuery();
			loadStats();
			loadPosts(1);
			closeSearchSheet();
		};
		el.appendChild(allBtn);
		const line = document.createElement("div");
		line.className = "timelineLine";
		for (const d of days) {
			const isActive = activePostDay === d.day;
			const node = document.createElement("button");
			node.type = "button";
			node.className = "timelineNode" + (d.count ? "" : " empty") + (isActive ? " active" : "");
			const label = d.day === todayLocal ? t("timeline_today") : d.day.slice(5).replace("-", "/");
			node.title = t("timeline_posts", d.count) + " · " + d.day;
			node.innerHTML = `<span class="tl-dot"></span><span class="tl-label">${label}</span>`;
			node.onclick = () => {
				if (activePostDay === d.day) {
					activePostDay = "";
				} else {
					activePostDay = d.day;
					activePostTag = "全部";
					postSearch = "";
					const s = $("postSearch");
					if (s) s.value = "";
				}
			renderPostFilters();
			syncUrlFromQuery();
			loadStats();
			loadPosts(1);
			closeSearchSheet();
		};
		line.appendChild(node);
		}
		el.appendChild(line);
	} catch {
		el.classList.remove("show");
	}
}
async function fetchPostPage(page = 1, perPage = getPostsPerPage()) {
	let authorsParam = "";
	if (activePostTag === "关注" && currentUser) {
		const followedIds = await getFollowedIds();
		if (followedIds.size) {
			authorsParam = "&authors=" + [...followedIds].join(",");
		} else {
			return {
				posts: [],
				count: 0
			};
		}
	}
	const q = buildPostQuery(page, perPage);
	let result;
	if (postSearch && postSearch.startsWith("@")) {
		const uname = postSearch.slice(1).trim();
		if (!uname) return {
			posts: [],
			count: 0
		};
		try {
			result = await apiGet("/api/posts?search=" + encodeURIComponent(postSearch) + "&page=" +
				page + "&perPage=" + perPage + (activePostTag && activePostTag !== "全部" &&
					activePostTag !== "其它" && activePostTag !== "关注" ?
					"&tag=" + encodeURIComponent(activePostTag) : "") + (currentUser ?
					"&userId=" + currentUser.id : "") + authorsParam);
		} catch {
			return {
				posts: [],
				count: 0
			};
		}
	} else {
		result = await apiGet("/api/posts" + q + authorsParam);
	}
	return {
		posts: result.posts || [],
		count: result.count || 0
	};
}
let followedIdsCache = null;
let followedIdsCacheTime = 0;
const FOLLOWED_IDS_TTL = 30000;
async function getFollowedIds() {
	const now = Date.now();
	if (followedIdsCache && now - followedIdsCacheTime < FOLLOWED_IDS_TTL) return followedIdsCache;
	try {
		const data = await apiGet("/api/follows/list?user_id=" + currentUser.id +
			"&type=following&requester_id=" + currentUser.id);
		followedIdsCache = new Set((data || []).map(f => f.followee_id).filter(id => id));
		followedIdsCacheTime = now;
	} catch {
		followedIdsCache = new Set();
	}
	return followedIdsCache;
}
const notice = $("notice");
const toggleBtn = $("toggleNoticeBtn");
const mobileSideBtn = $("mobileSideBtn");
const sidePanels = $("sidePanels");
const sideBackdrop = $("sideBackdrop");

function syncMobilePanels() {
	const isMobile = window.innerWidth <= 800;
	const dense = postLayout === "dense";
	if (isMobile && !guestMode) {
		if (mobileSideBtn) mobileSideBtn.style.display = "flex";
	} else {
		if (mobileSideBtn) mobileSideBtn.style.display = "none";
	}
	sidePanels?.classList.remove("mobile-open");
	sideBackdrop?.classList.remove("show");
	document.body.classList.toggle("denseFeed", dense);
	const tagBar = $("postTagBar");
	if (tagBar) tagBar.style.display = dense ? "none" : "";
}
if (mobileSideBtn) {
	mobileSideBtn.onclick = () => {
		const open = sidePanels?.classList.toggle("mobile-open");
		sideBackdrop?.classList.toggle("show", !!open);
	};
}
if (sideBackdrop) {
	sideBackdrop.onclick = () => {
		sidePanels?.classList.remove("mobile-open");
		sideBackdrop.classList.remove("show");
	};
}
window.addEventListener("resize", syncMobilePanels);
syncMobilePanels();
if (toggleBtn) {
	toggleBtn.onclick = () => {
		notice.classList.toggle("collapsed");
		notice.classList.toggle("open");
		if (notice.classList.contains("collapsed")) {
			toggleBtn.innerHTML = "<b>></b>";
		} else {
			toggleBtn.innerHTML = "<b><</b>";
		}
		toggleBtn.style.right = "8px";
	};
}
async function loadPosts(page = 1, container = $("posts")) {
	if (guestMode) page = 1;
	const token = ++currentLoadToken;
	const perPage = guestMode ? 4 : getPostsPerPage();
	container.innerHTML =
		"<p style='text-align:center;color:var(--sub);margin-top:20px;'>Loading...</p>";
	try {
		postPage = page;
		renderPager();
		const pageData = await fetchPostPage(page, perPage);
		totalPostCount = pageData.count || 0;
		renderPager();
		if (token !== currentLoadToken) return;
		let posts = pageData.posts || [];
		if (activePostTag === "其它") {
			posts = posts.filter(p => !p.tag || ![...defaultTags, "公告"].includes(p.tag));
		}
		container.innerHTML = "";
		if (!posts.length) {
			container.innerHTML =
				"<p style='text-align:center;color:var(--sub);margin-top:20px;'>" + t(
					"post_no_posts") + "</p>";
			return;
		}
		const postIds = posts.map(p => p.id);
		if (token !== currentLoadToken) return;
		const likeCounts = {
			likes: {},
			dislikes: {}
		};
		const userVoteMap = {};
		for (const p of posts) {
			likeCounts.likes[p.id] = p.likes || 0;
			likeCounts.dislikes[p.id] = p.dislikes || 0;
			if (p.userVote) userVoteMap[p.id] = p.userVote;
		}
		for (let i = 0; i < posts.length; i++) {
			let p = posts[i];
			if (token !== currentLoadToken) return;
			const postDiv = document.createElement("div");
			postDiv.className = "post";
			postDiv.dataset.postId = p.id;
			postDiv.dataset.authorId = p.author;
			const likeCount = likeCounts.likes[p.id] || 0;
			const dislikeCount = likeCounts.dislikes[p.id] || 0;
			const userVote = userVoteMap[p.id];
			const liked = userVote == 1;
			const disliked = userVote == -1;
			const meta = getPostMeta(p.content);
			if (meta.bg) {
				postDiv.style.setProperty("--custom-bg", meta.bg);
				postDiv.classList.add("custom-bg");
			}
			const avatar = getAvatar(p.users);
			postDiv.innerHTML =
				'<div class="postHeaderTop"><div class="userInfo">' +
				'<span class="userLink userLinkWithAvatar" data-user="' + p.author + '">' +
				'<img class="avatar" src="' + avatar +
				'" onerror="this.onerror=null;this.src=\'assets/img/head.svg\'">' +
				(p.users?.name || t("post_unknown")) +
				'<span class="userLevel">' + getUserLevel(p.users?.coins || 0) + '</span>' +
				'<span>' + getRoleBadge(p.users) + '</span>' +
				'</span>' +
				'<span class="time">' + new Date(p.time).toLocaleString() + '</span>' +
				(p.scope && p.scope !== "public" ? getScopeBadgeHTML(p.scope) : '') +
				(guestMode ? '' :
					'<div class="shareBtnWrapper"><button class="shareBtn" data-share="' + p.id +
					'">+</button><div class="sharePopover"><button data-copy="' + p.id +
					'">' + t("post_share") + '</button></div></div>') +
				'</div></div>' +
				'<div class="postTags">' +
				(p.tag ? `<span class="postTag" data-tag="${p.tag}">${p.tag}</span>` : "") +
				'</div>' +
				'<div class="postContent"></div>' +
				(guestMode ? '' :
					'<div class="postActions">' +
					'<div class="voteGroup">' +
					'<span class="like ' + (liked ? "liked" : "") + '" data-id="' + p.id + '">' +
					'<svg viewBox="0 0 24 24" class="voteIcon"><path d="M12 21s-6.7-4.35-9.33-8A5.4 5.4 0 0 1 12 4.2A5.4 5.4 0 0 1 21.33 13C18.7 16.65 12 21 12 21z"/></svg> ' +
					'<span class="voteNum">' + likeCount + '</span>' +
					'</span>' +
					'<span class="dislike ' + (disliked ? "disliked" : "") + '" data-dislike="' + p
					.id +
					'">' +
					'<svg viewBox="0 0 24 24" class="voteIcon"><path d="M12 21l-8-8h5V3h6v10h5l-8 8z"/></svg> ' +
					'<span class="voteNum">' + dislikeCount + '</span>' +
					'</span>' +
					'</div>' +
					'<div class="voteWhoRow">' +
					'<span class="voteWhoLink" data-vote-list="like" data-post="' + p.id +
					'">' + t("post_likers") + '</span>' +
					'<span class="voteWhoLink" data-vote-list="dislike" data-post="' + p.id +
					'">' + t("post_dislikers") + '</span>' +
					'</div>' +
					(currentUser && (p.author === currentUser.id || (isAdmin(currentUser) && !p.users
							?.role?.includes?.('owner'))) ? '<button data-del="' + p.id +
						'">' + t("post_delete") + '</button>' : "") +
					'</div>') +
				(guestMode ? '' : '<div class="commentRow"><input data-input="' + p.id +
					'" data-mention-input="1" placeholder="' + t("post_comment_ph") + '">' +
					'<button class="emojiBtn commentEmojiBtn" data-emoji-target="' + p.id +
					'" type="button" title="表情"><img src="emojis/happy.svg" style="width:18px;height:18px;display:block;pointer-events:none;"></button>' +
					'<button data-comment="' + p.id + '">' + t("post_send") + '</button></div>') +
				'<div class="commentList"></div>';
			container.appendChild(postDiv);
			postDiv.style.opacity = "0";
			postDiv.classList.add("postEnter");
			postDiv.style.animationDelay = `${i*45}ms`;
			requestAnimationFrame(() => postDiv.style.opacity = "1");
			const bodyBox = postDiv.querySelector(".postContent");
			if (meta.warn) {
				bodyBox.innerHTML =
					'<div class="postWarnGate">' +
					'<div class="warnMsg"></div>' +
					'<button type="button" class="revealWarnBtn">' + t("post_show_content") +
					'</button>' +
					'</div>';
				bodyBox.querySelector(".warnMsg").textContent = meta.warnText || t("warn_default");
				bodyBox.querySelector(".revealWarnBtn").onclick = () => {
					renderPostBody(bodyBox, p.content);
				};
			} else {
				renderPostBody(bodyBox, p.content);
			}
			if (!guestMode) {
				postDiv.querySelectorAll("[data-vote-list]").forEach(el => {
					el.onclick = () => openVotePeople(p.id, el.dataset.voteList);
				});
				postDiv.querySelector(".like").onclick = () => likePost(p.id, postDiv);
				postDiv.querySelector(".dislike").onclick = () => dislikePost(p.id, postDiv);
				const postTagEl = postDiv.querySelector(".postTag");
				if (postTagEl) postTagEl.onclick = e => {
					e.stopPropagation();
					activePostTag = postTagEl.dataset.tag;
					postSearch = "";
					$("postSearch").value = "";
					renderPostFilters();
					loadStats();
					loadPosts(1);
				};
				const delBtn = postDiv.querySelector("[data-del]");
				if (delBtn) delBtn.onclick = () => deletePost(p.id);
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
					if (text) addComment(p.id, text, p.author);
				};
				postDiv.querySelector("[data-comment]").onclick = submit;
				postDiv.querySelector("[data-input]")?.addEventListener("keydown", e => e.key ===
					"Enter" && submit());
			}
			postDiv.querySelector(".userLink").onclick = () => viewUser(p.author);
		}
		if (token !== currentLoadToken) return;
		let allComments = [];
		try {
			allComments = await apiPost("/api/comments/batch", {
				postIds
			}) || [];
		} catch {
			allComments = [];
		}
		if (token !== currentLoadToken) return;
		const commentsByPost = {};
		for (const c of (allComments || [])) {
			if (!commentsByPost[c.postid]) commentsByPost[c.postid] = [];
			commentsByPost[c.postid].push(c);
		}
		for (const p of posts) {
			const commentList = document.querySelector(`[data-post-id="${p.id}"] .commentList`);
			if (commentList) renderComments(p.id, commentList, commentsByPost[p.id] || [], p.author);
		}
	} catch (e) {
		console.error(e);
		modal(t("modal_load_fail") + "：" + e.message);
	}
}

