$("registerBtn").onclick = async () => {
	if (!captchaPassed) return modal(t("captcha_not_done"));
	let u = $("regUser").value.trim();
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
	const passHash = await hash(p1);
	try {
		await apiPost("/api/auth/register", {
			name: u,
			pass: passHash,
			time: new Date().toISOString()
		});
		modal(t("register_ok"));
		show("welcomePage");
	} catch (e) {
		modal(t("register_fail", e.message));
	}
};
$("captchaBtn").onclick = openCaptchaModal;
$("loginBtn").onclick = async () => {
	let u = $("loginUser").value.trim();
	let p = $("loginPass").value.trim();
	if (!u || !p) return modal(t("enter_user_pass"));
	const passHash = await hash(p);
	try {
		const data = await apiPost("/api/auth/login", {
			name: u,
			pass: passHash
		});
		currentUser = data;
		localStorage.setItem("loginUser", data.id);
		if (data.token) localStorage.setItem("token", data.token);
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
		modal(t("welcome_back", data.name));
	} catch (e) {
		const msg = e.message;
		if (msg.includes("Wrong password")) modal(t("wrong_password"));
		else if (msg.includes("not found")) modal(t("user_not_found"));
		else modal(msg);
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
$("sendBtn").onclick = async () => {
	let txt = $("text").value.trim();
	if (!txt) return;
	let custom = $("customTag").value.trim();
	let tag = custom || selectedTags[0] || null;
	txt = sanitizePostHtml(txt);
	let finalContent = txt;
	if ($("isSensitive").checked) {
		const warnText = $("warnText").value.trim().replace(/\s+/g, " ") || t("warn_default");
		finalContent = `[[warn:${warnText}]]` + finalContent;
	}
	if (selectedPostBg) {
		finalContent = `[[bg:${selectedPostBg}]]` + finalContent;
	}
	const postId = Date.now();
	try {
		await apiPost("/api/posts", {
			id: postId,
			content: finalContent,
			time: new Date().toISOString(),
			author: currentUser.id,
			tag: tag,
			scope: selectedScope,
			allow_user_ids: scopeAllowUsers,
			allow_tag_ids: scopeAllowGroups,
			deny_user_ids: scopeDenyUsers,
			deny_tag_ids: scopeDenyGroups
		});
	} catch (e) {
		if (e.message === "JWT_EXPIRED") return;
		return modal(t("post_fail", e.message));
	}
	await notifyMentions(finalContent, postId, null);
	try {
		for (const k of Object.keys(sessionStorage)) {
			if (k.startsWith("tlDays_")) sessionStorage.removeItem(k);
		}
	} catch {}
	$("text").value = "";
	$("customTag").value = "";
	selectedTags = [];
	selectedPostBg = "";
	$("bgBuyBtn").textContent = t("editor_bg");
	$("isSensitive").checked = false;
	$("warnText").value = "";
	$("warnText").classList.remove("show");
	resetScopeState();
	show("main");
	loadStats();
	loadPosts(1);
	setActive("homeBtn");
	loadAnnouncements();
	await changeCoins(currentUser.id, 5);
};
