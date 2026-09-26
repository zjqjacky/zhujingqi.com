$("layoutBtn").onclick = () => {
	postLayout = postLayout === "list" ? "dense" : "list";
	localStorage.setItem("postLayout", postLayout);
	syncLayoutMode();
	syncLayoutBtn();
	$("posts").classList.toggle("denseLayout", postLayout === "dense");
};
$("discoverBtn").onclick = () => {
	show("discoverPage");
	setActive("discoverBtn");
};
$("profileBtn").onclick = () => {
	if (currentUser) {
		show("profilePage");
		viewUser(currentUser.id);
	}
	setActive("profileBtn");
};
$("logoutBtn").onclick = () => {
	stopPresence();
	localStorage.removeItem("loginUser");
	localStorage.removeItem("token");
	currentUser = null;
	enterGuestMode();
};
$("backBtn").onclick = () => {
	show("main");
	renderPostFilters();
	loadPosts(postPage);
	setActive("homeBtn");
	loadAnnouncements();
};
$("postBackBtn").onclick = () => {
	show("main");
	renderPostFilters();
	loadPosts(postPage);
	setActive("homeBtn");
	loadAnnouncements();
};
$("goRegister").onclick = () => {
	resetCaptcha();
	show("registerPage");
};
$("backLogin").onclick = () => show("welcomePage");
$("termsBtn").onclick = () => {
	document.querySelector(".modalBox").style.width = "800px";
	modal(t("terms_content"));
}

$("bgBuyBtn").textContent = selectedPostBg ? t("editor_bg_used") : t("editor_bg");
$("bgBuyBtn").onclick = openPostBgPicker;
const warnTextInput = $("warnText");
$("isSensitive").onchange = () => {
	if (!warnTextInput) return;
	if ($("isSensitive").checked) {
		warnTextInput.classList.add("show");
		warnTextInput.focus();
	} else {
		warnTextInput.classList.remove("show");
		warnTextInput.value = "";
	}
};

function openImagePicker() {
	document.querySelector(".modalBox").style.width = "420px";
	modal(`
		<h3>` + t("img_insert_title") + `</h3>
		<input id="imgUrlInput" placeholder="` + t("img_url_ph") + `" style="width:100%;">
		<div style="margin-top:8px;font-size:12px;color:var(--sub);text-align:left;">
			` + t("img_hint") + `
		</div>
		<div style="margin-top:14px;">
			<button id="imgApplyBtn">` + t("img_apply") + `</button>
		</div>
					`);
	$("imgApplyBtn").onclick = () => {
		const url = $("imgUrlInput").value.trim();
		if (!url) return modal(t("img_enter_url"));
		if (!/^https?:\/\//i.test(url)) return modal(t("img_invalid_url"));
		const textArea = $("text");
		textArea.value += (textArea.value ? "\n" : "") + `[img:${url}]` + "\n";
		$("modal").classList.add("hidden");
	};
}
$("insertImgBtn").onclick = openImagePicker;

function openMusicPicker() {
	document.querySelector(".modalBox").style.width = "420px";
	modal(`
		<h3>` + t("music_insert_title") + `</h3>
		<input id="musicUrlInput" placeholder="` + t("music_url_ph") + `" style="width:100%;">
		<div style="margin-top:8px;font-size:12px;color:var(--sub);text-align:left;">
			` + t("music_hint") + `
		</div>
		<div style="margin-top:14px;">
			<button id="musicApplyBtn">` + t("music_apply") + `</button>
		</div>
					`);
	$("musicApplyBtn").onclick = () => {
		const url = $("musicUrlInput").value.trim();
		if (!url) return modal(t("music_enter_url"));
		const textArea = $("text");
		let marker;
		if (/music\.163\.com/i.test(url)) {
			const idMatch = url.match(/id=(\d+)/);
			if (!idMatch) return modal(t("music_no_id"));
			marker = `[[music:netease:${idMatch[1]}]]`;
		} else if (/y\.qq\.com/i.test(url)) {
			const idMatch = url.match(/songid=(\d+)/);
			if (!idMatch) return modal(t("music_no_id"));
			marker = `[[music:qq:${idMatch[1]}]]`;
		} else {
			return modal(t("music_invalid"));
		}
		textArea.value += (textArea.value ? "\n" : "") + marker + "\n";
		$("modal").classList.add("hidden");
	};
}
$("insertMusicBtn").onclick = openMusicPicker;

function getPostMeta(content) {
	let text = String(content || "").trim();
	let bg = null,
		warn = false,
		warnText = t("warn_default"),
		music = null,
		img = null;
	const prefixMatch = text.match(/^(\[\[bg:(.+?)\]\]|\[\[warn(?::([^\]]+))?\]\])+/);
	if (prefixMatch) {
		let prefix = prefixMatch[0];
		text = text.slice(prefix.length).trim();
		if (prefix.includes("[[bg:")) bg = prefix.match(/\[\[bg:(.+?)\]\]/)[1];
		if (prefix.includes("[[warn")) {
			warn = true;
			const w = prefix.match(/\[\[warn(?::([^\]]+))?\]\]/);
			if (w && w[1]) warnText = w[1];
		}
	}
	const musicMatch = text.match(/\[\[music:(netease|qq):(\d+)\]\]/) || text.match(
		/\[\[music:(\d+)\]\]/);
	if (musicMatch) {
		music = musicMatch[1] === "netease" || musicMatch[1] === "qq" ? {
			type: musicMatch[1],
			id: musicMatch[2]
		} : {
			type: "netease",
			id: musicMatch[1]
		};
		text = text.replace(/\[\[music:(?:netease|qq):\d+\]\]|\[\[music:\d+\]\]/g, "").trim();
	}
	const imgMatch = text.match(/\[img:(.*?)\]/);
	if (imgMatch) {
		img = imgMatch[1];
		text = text.replace(/\[img:.*?\]/g, "").trim();
	}
	const polls = [];
	text = text.replace(/\[poll:(\d+)\]/g, (_, n) => {
		polls.push(parseInt(n, 10));
		return "";
	}).trim();
	return {
		bg,
		warn,
		warnText,
		music,
		img,
		polls,
		content: text
	};
}

async function renderPostBody(box, fullContent, post) {
	const meta = getPostMeta(fullContent);
	const safeContent = sanitizePostHtml(meta.content || "");
	const hasHtml = /<[^>]+>/.test(safeContent);
	const plainText = safeContent.replace(/<[^>]*>/g, "");
	const needFold = !hasHtml && plainText.length > (postLayout === "dense" ? 120 : 300);
	const foldedText = needFold ? escapeHtml(plainText.slice(0, 300)) + " ..." : "";
	let html = "";
	if (meta.music) {
		html += renderMusicCard(meta.music) + '<div style="height:12px"></div>';
	}
	if (meta.img) {
		html +=
			`<div style="margin:8px 0;"><button class="loadImgBtn" data-src="${escapeAttr(meta.img)}" style="width:100%;padding:12px;border-radius:20px;background:var(--card);color:var(--text);font-size:16px;cursor:pointer;border:1px solid var(--border);text-align:center;transition:.2s;" onmouseover="this.style.background='var(--grad)';this.style.color='#fff'" onmouseout="this.style.background='';this.style.color=''">${t("post_load_img")}</button></div>`;
	}
	html += needFold ?
		`<span class="longPostText">${foldedText}</span><button class="toggleLongPost inline">${t("post_expand")}</button>` :
		safeContent;
	box.innerHTML = html;
	if (post && Array.isArray(post.polls) && meta.polls.length) {
		const pollList = document.createElement("div");
		pollList.className = "pollList";
		for (const idx of meta.polls) {
			const poll = post.polls[idx];
			if (poll) pollList.appendChild(renderPollCard(poll, post.id, idx, post.author));
		}
		if (pollList.children.length) box.appendChild(pollList);
	}
	await ensureAllUsersCache();
	linkifyMentions(box);
	renderEmojis(box);
	linkifyUrls(box);
	const loadBtn = box.querySelector(".loadImgBtn");
	if (loadBtn) {
		loadBtn.onclick = () => {
			const src = loadBtn.dataset.src;
			loadBtn.outerHTML =
				`<img src="${src}" class="zoomable" style="max-width:60%;border-radius:12px;display:block;">`;
		};
	}
	const toggleBtn = box.querySelector(".toggleLongPost");
	if (toggleBtn) {
		let e = false;
		toggleBtn.onclick = () => {
			e = !e;
			const l = box.querySelector(".longPostText");
			if (l) l.innerHTML = e ? meta.content : foldedText;
			linkifyMentions(box);
			renderEmojis(box);
			linkifyUrls(box);
			toggleBtn.textContent = e ? t("post_collapse") : t("post_expand");
		};
	}
}

function renderMusicCard(music) {
	const id = typeof music === "string" ? music : music.id;
	if (typeof music === "object" && music.type === "qq") {
		return `<div class="musicCard"><iframe class="musicIframe" src="https://i.y.qq.com/n2/m/outchain/player/index.html?songid=${id}&songtype=0" width="100%" height="86" frameborder="0" allow="autoplay; encrypted-media" loading="lazy"></iframe></div>`;
	}
	return `<div class="musicCard"><iframe class="musicIframe" src="https://music.163.com/outchain/player?type=2&id=${id}&auto=0&height=86" width="100%" height="106" frameborder="0" allow="autoplay; encrypted-media" loading="lazy"></iframe></div>`;
}

function setActive(id) {
	["homeBtn", "editorBtn", "showUsersBtn", "profileBtn", "discoverBtn"]
	.forEach(b => $(b).classList.remove("active"));
	$(id).classList.add("active");
}
function openPostBgPicker() {
	if (!currentUser) return;
	document.querySelector(".modalBox").style.width = "420px";
	let picked = "";
	modal(`
						<h3>` + t("bg_picker_title") + `</h3>
						<div style="font-size:14px;color:var(--sub);margin-bottom:12px;">
							` + t("bg_picker_desc") + `
						</div>
						<div id="bgPickerGrid" class="bgPickerGrid"></div>
						<div style="margin-top:14px;text-align:center;">
							<button id="bgApplyBtn" disabled>` + t("bg_apply") + `</button>
						</div>
					`);
	const grid = $("bgPickerGrid");
	for (const color of POST_BG_OPTIONS) {
		const item = document.createElement("div");
		item.className = "bgOption";
		item.style.background = color;
		item.onclick = () => {
			picked = color;
			grid.querySelectorAll(".bgOption").forEach(el => el.classList.remove("active"));
			item.classList.add("active");
			$("bgApplyBtn").disabled = false;
		};
		grid.appendChild(item);
	}
	$("bgApplyBtn").onclick = async () => {
		if (!picked) return;
		if ((currentUser.coins || 0) < POST_BG_COST) {
			return modal(t("coins_insufficient"));
		}
		try {
			const res = await apiPost("/api/shop/background", {
				color: picked
			});
			if (res && typeof res.coins === "number" && currentUser) currentUser.coins = res.coins;
		} catch (e) {
			if (e.message === "JWT_EXPIRED") return;
			return modal(t("coins_insufficient"));
		}
		selectedPostBg = picked;
		$("bgBuyBtn").textContent = t("editor_bg_used");
		$("modal").classList.add("hidden");
		showCoinMsg(t("bg_applied"));
	};
}

// ===== 投票 =====

function openPollPicker() {
	if (!currentUser) return;
	document.querySelector(".modalBox").style.width = "440px";
	modal(
		'<h3>' + t("poll_modal_title") + "</h3>" +
		'<div id="pollOptionsBox"></div>' +
		'<button id="pollAddOption" class="pollAddBtn" type="button">+ ' + t("poll_add_option") + "</button>" +
		'<label class="pollSetRow"><input type="checkbox" id="pollAnon"> ' + t("poll_anonymous") + "</label>" +
		'<div class="pollSetRow" id="pollVotersRow"><span>' + t("poll_show_voters") + '</span><select id="pollVoters">' +
		'<option value="author">' + t("poll_voters_author") + "</option>" +
		'<option value="all">' + t("poll_voters_all") + "</option>" +
		'<option value="none">' + t("poll_voters_none") + "</option>" +
		"</select></div>" +
		'<div class="pollSetRow"><span>' + t("poll_deadline") + '</span><input type="datetime-local" id="pollDeadline"></div>' +
		'<div style="margin-top:14px;text-align:center;"><button id="pollCreateBtn">' + t("poll_create") + "</button></div>"
	);
	const box = $("pollOptionsBox");
	const addOption = () => {
		if (box.children.length >= 5) return;
		const row = document.createElement("div");
		row.className = "pollOptionEdit";
		row.innerHTML = '<input class="pollOptionInput" maxlength="50"><span class="pollOptionDel">×</span>';
		row.querySelector(".pollOptionInput").placeholder = t("poll_option_ph") + " " + (box.children.length + 1);
		row.querySelector(".pollOptionDel").onclick = () => row.remove();
		box.appendChild(row);
	};
	addOption();
	addOption();
	$("pollAddOption").onclick = addOption;
	const syncVotersRow = () => {
		$("pollVotersRow").style.display = $("pollAnon").checked ? "none" : "";
	};
	$("pollAnon").onchange = syncVotersRow;
	syncVotersRow();
	$("pollCreateBtn").onclick = () => {
		const options = [...box.querySelectorAll(".pollOptionInput")]
			.map(i => i.value.trim().replace(/[<>]/g, ""))
			.filter(Boolean);
		if (options.length < 2) return modal(t("poll_need_two"));
		const settings = {
			anonymous: $("pollAnon").checked,
			show_voters: $("pollVoters").value,
			deadline: $("pollDeadline").value ? new Date($("pollDeadline").value).toISOString() : null,
		};
		const poll = { options, settings, ended: false, votes: options.map(() => []) };
		const textArea = $("text");
		textArea.value += (textArea.value ? "\n" : "") + "[poll:" + JSON.stringify(poll) + "]" + "\n";
		$("modal").classList.add("hidden");
	};
}
$("insertPollBtn").onclick = openPollPicker;

function renderPollCard(poll, postId, pollIndex, authorId) {
	const showResults = Array.isArray(poll.counts);
	const total = showResults ? (poll.total || 0) : 0;
	const myVote = typeof poll.myVote === "number" ? poll.myVote : null;
	const ended = !!poll.ended;
	const canVote = !guestMode && !!currentUser && !ended && myVote === null;
	const isAuthor = !!(currentUser && authorId === currentUser.id);

	let optionsHtml = "";
	poll.options.forEach((opt, i) => {
		const count = showResults ? (poll.counts[i] || 0) : 0;
		const pct = showResults && total > 0 ? Math.round((count / total) * 100) : 0;
		const selected = myVote === i;
		optionsHtml +=
			'<div class="pollOption' + (selected ? " selected" : "") +
			(showResults ? " hasResult" : "") + (canVote ? " canVote" : "") + '" data-option="' + i + '">' +
			(showResults ? '<div class="pollFill" style="width:' + pct + '%"></div>' : "") +
			'<div class="pollRow"><span class="pollOptionText"></span>' +
			(showResults ? '<span class="pollPct">' + pct + '%</span>' : "") +
			(selected ? '<span class="pollCheck">✓</span>' : "") +
			"</div></div>";
	});

	let metaText;
	if (showResults) {
		metaText = t("poll_total", total) + (ended ? " · " + t("poll_ended") : "");
	} else if (guestMode || !currentUser) {
		metaText = t("poll_login");
	} else {
		metaText = t("poll_vote_to_see");
	}

	let actions = "";
	if (showResults && Array.isArray(poll.voters) && poll.voters.some(a => a && a.length)) {
		actions += '<span class="pollVotersLink">' + t("poll_voters_title") + "</span>";
	}
	if (isAuthor) {
		if (!ended) actions += '<span class="pollEndBtn">' + t("poll_end") + "</span>";
		actions += '<span class="pollSettingsBtn">' + t("poll_settings") + "</span>";
	}

	const card = document.createElement("div");
	card.className = "pollCard";
	card.dataset.authorId = authorId;
	card.innerHTML =
		'<div class="pollOptions">' + optionsHtml + "</div>" +
		'<div class="pollFoot"><span class="pollMeta">' + metaText + "</span>" +
		(actions ? '<span class="pollActions">' + actions + "</span>" : "") +
		"</div>";

	// 选项文字用 textContent 填充，避免 HTML 注入
	card.querySelectorAll(".pollOptionText").forEach((el, i) => {
		el.textContent = poll.options[i];
	});

	if (canVote) {
		card.querySelectorAll(".pollOption").forEach(el => {
			el.onclick = () => votePoll(card, postId, pollIndex, parseInt(el.dataset.option, 10), authorId);
		});
	}
	const votersLink = card.querySelector(".pollVotersLink");
	if (votersLink) votersLink.onclick = () => showPollVoters(poll);
	const endBtn = card.querySelector(".pollEndBtn");
	if (endBtn) endBtn.onclick = () => setPollSettings(card, postId, pollIndex, { ended: true }, authorId);
	const setBtn = card.querySelector(".pollSettingsBtn");
	if (setBtn) setBtn.onclick = () => openPollSettings(card, postId, pollIndex, poll, authorId);
	return card;
}

async function votePoll(card, postId, pollIndex, optionIndex, authorId) {
	try {
		const updated = await apiPost("/api/polls/vote", { postId, pollIndex, optionIndex });
		if (updated && !updated.error) {
			card.replaceWith(renderPollCard(updated, postId, pollIndex, authorId));
		} else {
			showCoinMsg((updated && updated.error) || t("poll_fail"));
		}
	} catch (e) {
		if (e && e.message === "JWT_EXPIRED") return;
		showCoinMsg(t("poll_fail"));
	}
}

async function setPollSettings(card, postId, pollIndex, payload, authorId) {
	try {
		const updated = await apiPut("/api/polls/settings", Object.assign({ postId, pollIndex }, payload));
		if (updated && !updated.error) {
			card.replaceWith(renderPollCard(updated, postId, pollIndex, authorId));
		} else {
			showCoinMsg((updated && updated.error) || t("poll_fail"));
		}
	} catch (e) {
		if (e && e.message === "JWT_EXPIRED") return;
		showCoinMsg(t("poll_fail"));
	}
}

function openPollSettings(card, postId, pollIndex, poll, authorId) {
	document.querySelector(".modalBox").style.width = "420px";
	const s = poll.settings || {};
	const deadlineVal = s.deadline ? new Date(s.deadline).toISOString().slice(0, 16) : "";
	modal(
		'<h3>' + t("poll_settings") + "</h3>" +
		'<label class="pollSetRow"><input type="checkbox" id="pollSetAnon"' + (s.anonymous ? " checked" : "") + "> " + t("poll_anonymous") + "</label>" +
		'<div class="pollSetRow" id="pollSetVotersRow"><span>' + t("poll_show_voters") + '</span><select id="pollSetVoters">' +
		'<option value="author"' + (s.show_voters === "author" ? " selected" : "") + ">" + t("poll_voters_author") + "</option>" +
		'<option value="all"' + (s.show_voters === "all" ? " selected" : "") + ">" + t("poll_voters_all") + "</option>" +
		'<option value="none"' + (s.show_voters === "none" ? " selected" : "") + ">" + t("poll_voters_none") + "</option>" +
		"</select></div>" +
		'<div class="pollSetRow"><span>' + t("poll_deadline") + '</span><input type="datetime-local" id="pollSetDeadline" value="' + deadlineVal + '"></div>' +
		'<div style="margin-top:14px;text-align:center;"><button id="pollSetSave">' + t("poll_apply") + "</button></div>"
	);
	$("pollSetSave").onclick = () => {
		const settings = {
			anonymous: $("pollSetAnon").checked,
			show_voters: $("pollSetVoters").value,
			deadline: $("pollSetDeadline").value ? new Date($("pollSetDeadline").value).toISOString() : null,
		};
		$("modal").classList.add("hidden");
		setPollSettings(card, postId, pollIndex, { settings }, authorId);
	};
	const syncSetVotersRow = () => {
		$("pollSetVotersRow").style.display = $("pollSetAnon").checked ? "none" : "";
	};
	$("pollSetAnon").onchange = syncSetVotersRow;
	syncSetVotersRow();
}

function showPollVoters(poll) {
	document.querySelector(".modalBox").style.width = "420px";
	const groups = [];
	(poll.voters || []).forEach((ids, i) => {
		const names = (ids || []).map(uid => {
			const u = allUsersCache.find(x => x.id === uid);
			return u ? getDisplayName(u) : String(uid);
		});
		groups.push({ option: poll.options[i] || "", names });
	});
	modal(
		'<h3>' + t("poll_voters_title") + "</h3>" +
		(groups.length
			? '<div class="pollVoterList">' + groups.map(() =>
				'<div class="pollVoterGroup"><div class="pollVoterOption"><span class="pollVoterOptionText"></span><span class="pollVoterCount"></span></div><div class="pollVoterNames"></div></div>'
			).join("") + "</div>"
			: '<div class="pollNoVotes">' + t("poll_no_votes") + "</div>")
	);
	const box = document.querySelector(".modalBox");
	const optEls = box.querySelectorAll(".pollVoterOptionText");
	const cntEls = box.querySelectorAll(".pollVoterCount");
	const nameEls = box.querySelectorAll(".pollVoterNames");
	groups.forEach((g, i) => {
		if (optEls[i]) optEls[i].textContent = g.option;
		if (cntEls[i]) cntEls[i].textContent = g.names.length;
		if (nameEls[i]) nameEls[i].textContent = g.names.length ? g.names.join("、") : t("poll_no_votes");
	});
}
