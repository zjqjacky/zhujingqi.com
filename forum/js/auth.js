$("registerBtn").onclick = async () => {
	if (!captchaPassed) return modal(t("captcha_not_done"));
	let u = $("regUser").value.trim();
	let nick = $("regNickname") ? $("regNickname").value.trim() : "";
	let p1 = $("regPass").value.trim();
	let p2 = $("regPass2").value.trim();
	if (!u || !p1 || !p2) return modal(t("enter_user_pass_reg"));
	if (p1 !== p2) return modal(t("pwd_mismatch"));
	if (!/^[A-Za-z0-9\-_áéíóúñÁÉÍÓÚÑäöüßÄÖÜ]+$/.test(u)) {
		return modal(t("name_invalid"));
	}
	if (/jacky|admin/i.test(u)) {
		return modal(t("no_impersonate"));
	}
	if (nicknameWidth(nick) > NICKNAME_MAX_WIDTH) return modal(t("nickname_too_long"));
	if (p1.length < 6) return modal(t("pass_too_short"));
	try {
		await apiPost("/api/auth/register", {
			name: u,
			nickname: nick || null,
			pass: p1,
			captcha_token: captchaToken,
			captcha_answer: captchaAnswer
		});
		resetCaptcha();
		modal(t("register_ok"));
		show("welcomePage");
	} catch (e) {
		modalText(t("register_fail", e.message));
	}
};
$("captchaBtn").onclick = openCaptchaModal;
if ($("regNickname") && typeof bindNicknameLimit === "function") bindNicknameLimit($("regNickname"));
$("loginBtn").onclick = async () => {
	let u = $("loginUser").value.trim();
	let p = $("loginPass").value.trim();
	if (!u || !p) return modal(t("enter_user_pass"));
	try {
		const data = await apiPost("/api/auth/login", {
			name: u,
			pass: p
		});
		currentUser = data;
		localStorage.setItem("loginUser", data.id);
		if (data.token) localStorage.setItem("token", data.token);
		if (data.avatar) localStorage.setItem("forumAvatar", data.avatar);
		if (data.name) localStorage.setItem("forumName_" + data.id, data.name);
		showLoggedFeatures();
		$("nav").classList.remove("hidden");
		show("main");
		renderPostFilters();
		syncLayoutMode();
		syncLayoutBtn();
		loadStats();
		loadPosts(1);
		loadOnlineUsers();
		startPresence();
		refreshNotificationBadge();
		loadAnnouncements();
		modal(t("welcome_back", escapeHtml(getDisplayName(data))));
	} catch (e) {
		const msg = e.message;
		if (msg.includes("Wrong password")) modal(t("wrong_password"));
		else if (msg.includes("not found")) modal(t("user_not_found"));
		else modalText(msg);
	}
};
$("guestBtn").onclick = () => {
	enterGuestMode();
};
document.addEventListener("click", e => {
	if (!guestMode) return;
	const target = e.target;
	if (target.closest(".userLink") || target.closest("a") || target.closest("#viewer") || target
		.closest(
			".modal") || target.closest("#welcomePage") || target.closest("#registerPage") ||
		target.closest("#loginTopBtn") ||
		target.closest(
			"#backBtn") || target.closest("#postBackBtn")) return;
	if (target.closest("button") || target.closest("input") || target.closest("textarea") ||
		target.closest(
			"select") || target.closest(".postTag") || target.closest(".postTagChip") ||
		target.closest(".shareBtnWrapper")) {
		e.preventDefault();
		e.stopPropagation();
		modal(t("guest_modal_title"));
		const box = $("modalText");
		if (!$("guestLoginRedirect")) {
			const row = document.createElement("div");
			row.style.cssText = "margin-top:14px;text-align:center;";
			row.innerHTML =
				'<button id="guestLoginRedirect" style="background:var(--green);color:#fff;">' +
				t("guest_go_login") + '</button>';
			box.appendChild(row);
			$("guestLoginRedirect").onclick = () => {
				$("modal").classList.add("hidden");
				show("welcomePage");
			};
		}
	}
}, true);
// 深夜时段（22:30–06:00）：随机抽一条作息提醒，点「确定」照常发帖。
// 判断用本地时间：toTimeString(0,2) 在个别实现里不可靠，直接用 getHours/getMinutes。
function isLateNightNow() {
	const now = new Date();
	const mins = now.getHours() * 60 + now.getMinutes();
	return mins >= 22 * 60 + 30 || mins < 6 * 60;
}

// 提示语是数组，t() 只认字符串，所以这里自己按语言取并回退 zh
function randomLateNightTip() {
	const all = TRANSLATIONS.late_night_tips || {};
	const list = all[currentLang] || all.zh || [];
	if (!list.length) return "";
	return list[Math.floor(Math.random() * list.length)];
}

async function submitNewPost() {
	let txt = $("text").value.trim();
	if (!txt) return;
	closeEmojiPicker();
	let custom = $("customTag").value.trim();
	let tag = custom || selectedTags[0] || null;
	if (tag === "公告" && !isAdmin(currentUser)) {
		return modalText(t("post_announce_forbidden"));
	}
	txt = sanitizePostHtml(txt);
	let finalContent = txt;
	if ($("isSensitive").checked) {
		const warnText = $("warnText").value.trim().replace(/\s+/g, " ") || t("warn_default");
		finalContent = `[[warn:${warnText}]]` + finalContent;
	}
	if (selectedPostBg) {
		finalContent = `[[bg:${selectedPostBg}]]` + finalContent;
	}
	let created;
	try {
		created = await apiPost("/api/posts", {
			content: finalContent,
			tag: tag,
		});
	} catch (e) {
		if (e.message === "JWT_EXPIRED") return;
		return modalText(t("post_fail", e.message));
	}
	const postId = (created && created.id) || Date.now();
	applyCoinDelta(created && created.coinsDelta);
	await notifyMentions(finalContent, postId, null);
	try {
		for (const k of Object.keys(sessionStorage)) {
			if (k.startsWith("tlDays_")) sessionStorage.removeItem(k);
		}
	} catch {}
	$("text").value = "";
	if (window.clearRichEditor) window.clearRichEditor();
	$("customTag").value = "";
	selectedTags = [];
	selectedPostBg = "";
	$("bgBuyBtn").textContent = t("editor_bg");
	$("isSensitive").checked = false;
	$("warnText").value = "";
	$("warnText").classList.remove("show");
	show("main");
	loadStats();
	loadPosts(1);
	setActive("homeBtn");
	loadAnnouncements();
}

$("sendBtn").onclick = () => {
	if (isLateNightNow()) {
		// 第3个参数 okText 传 null 走默认「确定」，第4个 hideCancel 隐藏取消按钮
		modalConfirm(randomLateNightTip(), submitNewPost, null, true);
		return;
	}
	submitNewPost();
};
