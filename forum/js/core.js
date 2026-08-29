const $ = id => document.getElementById(id);
let currentUser = null;
let guestMode = false;
function hideLoggedFeatures() {
	guestMode = true;
	if ($("loginTopBtn")) $("loginTopBtn").style.display = "";
	const lr = $("logoRow");
	if (lr) {
		const sb = lr.querySelector("#searchBall");
		if (sb) sb.style.display = "none";
		const om = lr.querySelector("#onlineMini");
		if (om) om.style.display = "none";
		const nb = lr.querySelector("#notifBtn");
		if (nb) nb.style.display = "none";
	}
	if ($("notice")) $("notice").style.display = "none";
	if ($("announceBar")) $("announceBar").style.display = "none";
	if ($("fortuneBox")) $("fortuneBox").style.display = "none";
	if ($("mobileSideBtn")) $("mobileSideBtn").style.display = "none";
}
function showLoggedFeatures() {
	guestMode = false;
	if ($("loginTopBtn")) $("loginTopBtn").style.display = "none";
	const lr = $("logoRow");
	if (lr) {
		const sb = lr.querySelector("#searchBall");
		if (sb) sb.style.display = "";
		const om = lr.querySelector("#onlineMini");
		if (om) om.style.display = "";
		const nb = lr.querySelector("#notifBtn");
		if (nb) nb.style.display = "";
	}
	if ($("notice")) $("notice").style.display = "";
	if ($("announceBar")) $("announceBar").style.display = "";
	if ($("fortuneBox")) $("fortuneBox").style.display = "";
	if (typeof syncMobilePanels === "function") syncMobilePanels();
}
function enterGuestMode() {
	hideLoggedFeatures();
	$("nav").classList.remove("hidden");
	show("main");
	renderPostFilters();
	syncLayoutMode();
	syncLayoutBtn();
	syncUrlFromQuery();
	loadPosts(1);
}
let currentPage = "main";
const defaultTags = ["学习", "日常", "搞笑", "提问"];
const defaultTagKeys = {
	"学习": "tag_study",
	"日常": "tag_daily",
	"搞笑": "tag_funny",
	"提问": "tag_question"
};
let selectedTags = [];
let postLayout = localStorage.getItem("postLayout") || "list";

function getThemePref() {
	const v = localStorage.getItem("theme");
	return v === "dark" || v === "light" ? v : "sys";
}
function applyTheme(pref) {
	const p = pref || getThemePref();
	const dark = p === "dark" || (p === "sys" && window.matchMedia && matchMedia(
		"(prefers-color-scheme: dark)").matches);
	document.body.classList.toggle("dark", dark);
}
if (window.matchMedia) {
	matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
		if (getThemePref() === "sys") document.body.classList.toggle("dark", e.matches);
	});
}

function syncLayoutBtn() {
	const btn = $("layoutBtn");
	if (!btn) return;
	btn.textContent = postLayout === "dense" ? t("layout_normal") : t("layout_dense");
}
renderLangSelect(document.getElementById("langSelect"));
renderLangSelect(document.getElementById("langSelectReg"));
document.title = PAGE_TITLE_TRANS[currentLang] || PAGE_TITLE_TRANS.zh;

function getPostsPerPage() {
	return postLayout === "dense" ? 8 : 4;
}
let postPage = 1;
let postTotalPages = 1;
let postPages = [];
let totalPostCount = 0;
let currentLoadToken = 0;
let statsCache = {
	data: null,
	time: 0
};
const STATS_TTL = 10 * 60 * 1000;
const POST_BG_COST = 15;
const POST_BG_OPTIONS = [
	"#ffeaea",
	"#fff0ea",
	"#fff5ea",
	"#fffbea",
	"#f9ffe9",
	"#eefeea",
	"#eafef3",
	"#eafcff",
	"#eaf4ff",
	"#eef0ff",
	"#f3eaff",
	"#f9eaff"
];
let selectedPostBg = "";
let postSearch = "";
let activePostTag = "全部";
let activePostDay = "";
const filterTags = [
	"全部",
	"关注",
	"公告",
	...defaultTags,
	"其它"
];
let searchTimer = null;

function renderTagBar() {
	const bar = $("tagBar");
	bar.innerHTML = "";
	selectedTags = [];
	for (let tag of defaultTags) {
		const display = t(defaultTagKeys[tag] || tag);
		let span = document.createElement("span");
		span.className = "tag";
		span.innerText = display;
		span.onclick = () => {
			selectedTags = [tag];
			bar.querySelectorAll(".tag").forEach(tagEl => {
				tagEl.classList.toggle("active", tagEl.textContent === display);
			});
		};
		bar.appendChild(span);
	}
}

function syncLayoutMode() {
	$("posts").classList.toggle("denseLayout", postLayout === "dense");
}
async function loadStats(force = false) {
	const now = Date.now();
	if (!force && statsCache.data && now - statsCache.time < STATS_TTL) {
		const d = statsCache.data;
		if ($("totalUsers")) $("totalUsers").textContent = d.userCount || 0;
		if ($("totalPosts")) $("totalPosts").textContent = d.postCount || 0;
		if ($("statsBox")) {
			$("statsBox").innerHTML = `
								<strong>` + t("stats_title") + `</strong><br>
								` + t("stats_users") + `：${d.userCount || 0}<br>
								` + t("stats_posts") + `：${d.postCount || 0}<br>
								` + t("stats_comments") + `：${d.commentCount || 0}<br>
							`;
		}
		totalPostCount = d.postCount || 0;
		renderPager();
		return;
	}
	try {
		const stats = await apiGet("/api/stats");
		statsCache = {
			data: stats,
			time: Date.now()
		};
		const {
			userCount,
			postCount,
			commentCount
		} = stats;
		if ($("totalUsers")) $("totalUsers").textContent = userCount || 0;
		if ($("totalPosts")) $("totalPosts").textContent = postCount || 0;
		if ($("statsBox")) {
			$("statsBox").innerHTML = `
								<strong>` + t("stats_title") + `</strong><br>
								` + t("stats_users") + `：${userCount || 0}<br>
								` + t("stats_posts") + `：${postCount || 0}<br>
								` + t("stats_comments") + `：${commentCount || 0}<br>
							`;
		}
		totalPostCount = postCount || 0;
		renderPager();
	} catch (e) {
		if ($("totalUsers")) $("totalUsers").textContent = "—";
		if ($("totalPosts")) $("totalPosts").textContent = "—";
		console.error(e);
	}
}

const PAGE_ORDER = ["welcomePage", "registerPage", "main", "editorPage", "userListPage", "discoverPage",
	"profilePage", "postPage"
];

function show(p) {
	const prev = currentPage;
	currentPage = p;
	let slide = "";
	if (prev && prev !== p) {
		const pi = PAGE_ORDER.indexOf(prev);
		const ci = PAGE_ORDER.indexOf(p);
		if (pi !== -1 && ci !== -1) slide = ci > pi ? "page-slide-right" : "page-slide-left";
	}
	PAGE_ORDER.forEach(id => {
		const el = $(id);
		if (id === p) {
			el.classList.remove("hidden");
			if (slide) {
				el.classList.remove("page-slide-right", "page-slide-left");
				void el.offsetWidth;
				el.classList.add(slide);
				setTimeout(() => el.classList.remove("page-slide-right", "page-slide-left"),
					300);
			}
		} else if (id === prev && slide) {
			el.classList.remove("page-fade-out");
			void el.offsetWidth;
			el.classList.add("page-fade-out");
		} else {
			el.classList.add("hidden");
		}
	});
	if (slide && prev) {
		setTimeout(() => {
			$(prev).classList.add("hidden");
			$(prev).classList.remove("page-fade-out");
		}, 280);
	}
	if (p !== "profilePage" && p !== "postPage") {
	history.replaceState(null, "", location.pathname);
}
}
window.show = show;

function refreshUILanguage(skipReload = false) {
	document.title = PAGE_TITLE_TRANS[currentLang] || PAGE_TITLE_TRANS.zh;
	const setT = (id, val) => {
		const el = document.getElementById(id);
		if (el) el.textContent = val;
	};
	const setPH = (id, val) => {
		const el = document.getElementById(id);
		if (el) el.placeholder = val;
	};
	const setH = (id, val) => {
		const el = document.getElementById(id);
		if (el) el.innerHTML = val;
	};
setT("welcomeTitle", t("login_title"));
	setPH("loginUser", t("login_username"));
	setPH("loginPass", t("login_password"));
	setT("loginBtn", t("login_btn"));
	setT("guestBtn", t("guest_btn"));
	setT("goRegister", t("go_register"));
	setT("backLogin", t("go_login"));
	setT("regTitle", t("reg_title"));
	setPH("regUser", t("reg_username"));
	setPH("regPass", t("reg_password"));
	setPH("regPass2", t("reg_password2"));
	setT("registerBtn", t("reg_btn"));
	setT("regAgreePrefix", t("reg_agree"));
	setT("termsBtn", t("terms_link"));
	setT("regRemember", t("reg_remember"));
	setH("accountShared", t("account_shared"));
	setT("footerForumName", t("login_title"));
	setT("mainLogoText", t("login_title"));
	setT("editorLogoText", t("editor_send"));
	setPH("postSearch", t("home_search_ph"));
	const sb = $("searchBtn");
	if (sb) sb.title = t("home_search_btn");
	const sball = $("searchBall");
	if (sball) sball.title = t("home_search_btn");
	syncLayoutBtn();
	setPH("text", t("editor_ph"));
	setT("insertImgBtn", t("editor_insert_img"));
	setT("insertMusicBtn", t("editor_insert_music"));
	setPH("customTag", t("editor_custom_tag_ph"));
	setT("sendBtn", t("editor_send"));
	setT("randomPostBtn", t("random_post_btn"));
	setT("fortuneBtn", t("fortune_btn"));
	setT("fortuneTitle", t("fortune_title"));
	setT("fortuneGoodLabel", t("fortune_good") + "：");
	setT("fortuneBadLabel", t("fortune_bad") + "：");
	setPH("rankSearch", t("rankings_search_ph"));
	setT("rankingsLogoText", t("rankings_title"));
	setT("rankColName", t("rankings_col_name"));
	const colVal = $("rankColValue");
	if (colVal) colVal.textContent = rankMode === "followers" ? t("followers") : t("rankings_col_coins");
	setT("discoverLogoText", t("discover_title"));
	setT("noticeTitle", t("notice_title"));
	setH("noticeWelcome", t("notice_welcome"));
	setT("statsTitle", t("stats_title"));
	const ss = document.getElementById("statsBox");
	if (ss) {
		const d = statsCache.data;
		if (d) {
			ss.innerHTML = "<strong>" + t("stats_title") + "</strong><br>" + t("stats_users") + "：" + (d
				.userCount || 0) + "<br>" + t("stats_posts") + "：" + (d.postCount || 0) + "<br>" + t(
				"stats_comments") + "：" + (d.commentCount || 0);
		}
	}
	const sn = document.getElementById("shareNotice");
	if (sn) sn.innerHTML = t("share_forum") +
		'<br><a onclick="navigator.clipboard.writeText(location.href).then(()=>this.innerText=\'' + t(
			"copied") + '\')" style="cursor:pointer;" id="copyLinkBtn">' + t("copy_link") + '</a>';
	const sl = document.getElementById("sensitiveLabel");
	if (sl) sl.textContent = t("editor_sensitive");
	setPH("warnText", t("editor_warn_ph"));
	const bgBtn = document.getElementById("bgBuyBtn");
	if (bgBtn) bgBtn.textContent = selectedPostBg ? t("editor_bg_used") : t("editor_bg");
	if (!skipReload) {
		if (typeof renderPostFilters === "function" && currentPage === "main") renderPostFilters();
		if (typeof loadPosts === "function" && currentPage === "main") loadPosts(postPage);
		if (typeof loadUserList === "function" && currentPage === "userListPage") loadUserList();
		if (typeof loadNewUsers === "function" && currentPage === "userListPage") loadNewUsers();
		if (typeof loadOnlineUsers === "function" && currentPage === "main") loadOnlineUsers();
		if (typeof refreshNotificationBadge === "function" && currentUser) refreshNotificationBadge();
	}
	renderLangSelect(document.getElementById("langSelect"));
renderLangSelect(document.getElementById("langSelectReg"));
	setT("closeModal", t("modal_close"));
	setT("captchaBtn", t("captcha_btn"));
	setT("captchaTitle", t("captcha_modal_title"));
	setT("captchaHint", t("captcha_slider_hint"));
	setT("captchaCloseBtn", t("modal_close"));
	setT("rankToggleCoins", t("profile_coins"));
	setT("rankToggleFollowers", t("followers"));
	const scopeTitle = $("scopeTitleLabel");
	if (scopeTitle) scopeTitle.textContent = t("scope_title");
	const scopeChipsEl = $("scopeChips");
	if (scopeChipsEl) {
		scopeChipsEl.querySelectorAll(".scopeChip").forEach(c => {
			const key = "scope_" + c.dataset.scope;
			c.textContent = t(key);
		});
	}
	const allowTabEl = $("scopeAllowTab");
	if (allowTabEl) allowTabEl.textContent = t("scope_allow_title");
	const denyTabEl = $("scopeDenyTab");
	if (denyTabEl) denyTabEl.textContent = t("scope_deny_title");
	const nb = document.getElementById("notifBtn");
	if (nb) {
		const nl = nb.querySelector("#notifLabel");
		if (nl) nl.textContent = t("notif_title");
	}
	setT("discWebsiteDesc", t("discover_website"));
	setT("discCommunityTitle", t("discover_community"));
	const dcd = document.getElementById("discCommunityDesc");
	if (dcd) dcd.textContent = t("discover_community_desc");
	setT("discGameTitle", t("discover_game"));
	setT("discToolTitle", t("discover_tool"));
	setT("discChatDesc", t("discover_chat_desc"));
	setT("discWikiDesc", t("discover_wiki_desc"));
	setT("discRssDesc", t("settings_rss"));
	const om = document.getElementById("onlineMini");
	if (om && onlineUsersCache && onlineUsersCache.length >= 0) om.textContent = t(
		"online_label_prefix") + onlineUsersCache.length;
}
window.refreshUILanguage = refreshUILanguage;

function modal(t) {
	$("modalText").innerHTML = t;
	$("modal").classList.remove("hidden");
}
$("closeModal").onclick = () => {
	$("modal").classList.add("hidden");
	document.querySelector(".modalBox").style.width = "300px";
}
function escapeHtml(str) {
	return String(str ?? "").replace(/[&<>"']/g, c => ({
						"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
					}[c]));
				}
				const autoId = localStorage.getItem("loginUser");
function getUrlParam(name) {
	const params = new URLSearchParams(window.location.search);
	return params.get(name);
}
