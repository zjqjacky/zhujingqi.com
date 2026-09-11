let aiHistory = [];
let aiTurnSources = [];

function aiSaveHistory() {
	try {
		localStorage.setItem("jackyAiHistory", JSON.stringify(aiHistory));
		localStorage.setItem("jackyAiTurnSources", JSON.stringify(aiTurnSources));
	} catch {}
}
function aiLoadHistory() {
	try {
		const h = JSON.parse(localStorage.getItem("jackyAiHistory") || "[]");
		const s = JSON.parse(localStorage.getItem("jackyAiTurnSources") || "[]");
		aiHistory = Array.isArray(h) ? h : [];
		aiTurnSources = Array.isArray(s) ? s : [];
	} catch {
		aiHistory = [];
		aiTurnSources = [];
	}
}

let aiModalEl = null;
let openAiTos = null;

function openAIModal() {
	if (!currentUser) {
		showCoinMsg(t("ai_login_required"));
		return;
	}
	if (!aiModalEl) {
		aiModalEl = document.createElement("div");
		aiModalEl.className = "aiModal";
		aiModalEl.id = "aiModal";
		aiModalEl.innerHTML = `
						<div class="aiBox">
							<div class="aiHead">
								<div>
									<h2><img class="aiModalIcon" src="icon/jackyai.svg" alt="AI" onerror="this.style.display='none'">${t("ai_title")}</h2>
								</div>
								<div class="aiHeadBtns">
									<button class="aiTosBtn" id="aiTosBtn">${t("ai_tos_btn")}</button>
									<button class="aiClearBtn" id="aiClearBtn">${t("ai_clear")}</button>
									<button class="aiCloseBtn" id="aiCloseBtn">${t("ai_logs_close")}</button>
								</div>
							</div>
							<div class="aiChat" id="aiChat"></div>
							<div class="aiInputRow">
								<input id="aiInput" maxlength="500">
								<button id="aiSendBtn" aria-label="${t("ai_send")}" title="${t("ai_send")}"><span class="aiSendIcon"></span></button>
							</div>
						</div>`;
		document.body.appendChild(aiModalEl);

	const chat = aiModalEl.querySelector("#aiChat");
	const input = aiModalEl.querySelector("#aiInput");
	const sendBtn = aiModalEl.querySelector("#aiSendBtn");

	function addMsg(role, plainText, tag, opts) {
		opts = opts || {};
		const row = document.createElement("div");
		row.className = "aiMsg " + role;
		if (opts.welcome) row.dataset.welcome = "1";
		if (typeof plainText === "string" && plainText) row.dataset.text = plainText;
		const tagHtml = tag ? `<div class="aiTag">${tag}</div>` : "";
		const avatarHtml = role === "user"
			? `<img class="aiAvatar aiAvatarUser" src="${escapeAttr(getAvatar(currentUser))}" alt="" onerror="this.onerror=null;this.src='assets/img/head.svg'">`
			: `<img class="aiAvatar aiAvatarBot" src="icon/jackyai.svg" alt="AI" onerror="this.style.visibility='hidden'">`;
		row.innerHTML =
			`${avatarHtml}<div class="aiMsgMain">
								<div class="aiBubble">${tagHtml}${escapeHtml(plainText)}</div>
								<div class="aiMsgActions">
									<button class="aiActionBtn aiCopyBtn" title="${t("ai_copy")}">⧉</button>
									<button class="aiActionBtn aiDelBtn" title="${t("ai_delete")}">✕</button>
								</div>
							</div>`;
		chat.appendChild(row);
		chat.scrollTop = chat.scrollHeight;
		return row.querySelector(".aiBubble");
	}

	function createBotRow(plainText, bubbleHtml, sourcesMap) {
		const row = document.createElement("div");
		row.className = "aiMsg bot";
		if (typeof plainText === "string" && plainText) row.dataset.text = plainText;
		if (sourcesMap) {
			try { row.dataset.sources = JSON.stringify(sourcesMap); } catch {}
		}
		row.innerHTML =
			`<img class="aiAvatar aiAvatarBot" src="icon/jackyai.svg" alt="AI" onerror="this.style.visibility='hidden'">
							<div class="aiMsgMain">
								<div class="aiBubble">${bubbleHtml}</div>
								<div class="aiMsgActions">
									<button class="aiActionBtn aiCopyBtn" title="${t("ai_copy")}">⧉</button>
									<button class="aiActionBtn aiDelBtn" title="${t("ai_delete")}">✕</button>
								</div>
							</div>`;
		chat.appendChild(row);
		chat.scrollTop = chat.scrollHeight;
		return row;
	}

	function addThinking() {
		return createBotRow("", '<span class="aiThinking"><i></i><i></i><i></i></span>', null);
	}

	function aiRebuildHistory() {
		aiHistory = [];
		aiTurnSources = [];
		chat.querySelectorAll(".aiMsg").forEach(row => {
			if (row.dataset.welcome) return;
			const text = row.dataset.text || "";
			if (row.classList.contains("bot")) {
				aiHistory.push({ role: "assistant", content: text });
				let m = {};
				try { m = JSON.parse(row.dataset.sources || "{}"); } catch {}
				aiTurnSources.push(m);
			} else {
				aiHistory.push({ role: "user", content: text });
				aiTurnSources.push(null);
			}
		});
		aiSaveHistory();
	}

	function addHint(text) {
		const hint = document.createElement("div");
		hint.className = "aiHint";
		hint.textContent = text;
		chat.appendChild(hint);
		chat.scrollTop = chat.scrollHeight;
	}

	let currentSources = {};
	function renderAnswer(text, map) {
		const src = map || currentSources;
		const esc = escapeHtml(text);
		return esc.replace(/\[n?(\d{1,3})\]/g, (m, n) => {
			return src[n]
				? `<sup class="aiCite" data-cite="${n}" title="${t("ai_cite_open")}"><span class="aiCiteIcon"></span></sup>`
				: m;
		}).replace(/\n/g, "<br>");
	}
	function openCitation(el, idx, map) {
		const src = map || currentSources;
		const srcItem = src[idx];
		if (!srcItem) return;
		const citeEl = (el && el.closest && el.closest(".aiCite")) || document.querySelector(`.aiCite[data-cite="${idx}"]`);
		let left = 0, top = 0;
		if (citeEl) {
			const r = citeEl.getBoundingClientRect();
			const pw = Math.min(320, window.innerWidth * 0.88);
			left = Math.max(8, Math.min(r.left, window.innerWidth - pw - 8));
			top = r.bottom + 8;
			if (top + 200 > window.innerHeight) top = Math.max(8, r.top - 180);
		} else {
			left = 16; top = 60;
		}
		document.querySelectorAll(".aiCitePanel").forEach(p => p.remove());
		const kind = srcItem.kind === "post" ? t("ai_cite_post")
			: srcItem.kind === "comment" ? t("ai_cite_comment")
			: t("ai_cite_user");
		const author = escapeHtml(srcItem.author || "匿名");
		const snippet = escapeHtml(srcItem.snippet || "");
		let link = "";
		if (srcItem.kind === "user") {
			link = `<a class="aiCitePanelLink" href="?uid=${srcItem.userId}" target="_blank"><span class="aiCiteLinkIcon"></span>${t("ai_cite_open_user")}</a>`;
		} else {
			link = `<a class="aiCitePanelLink" href="?pid=${srcItem.postId}" target="_blank"><span class="aiCiteLinkIcon"></span>${t("ai_cite_open")}</a>`;
		}
		const panel = document.createElement("div");
		panel.className = "aiCitePanel";
		panel.style.left = left + "px";
		panel.style.top = top + "px";
		panel.innerHTML = `
							<div class="aiCitePanelHead">
								<span class="aiCitePanelKind">${kind}</span>
								<span class="aiCitePanelAuthor">${author}</span>
							</div>
							<div class="aiCitePanelBody">${snippet}</div>
							${link}`;
		document.body.appendChild(panel);
		setTimeout(() => {
			const close = (e) => {
				if (!panel.contains(e.target)) {
					panel.remove();
					document.removeEventListener("click", close);
					document.removeEventListener("scroll", close, true);
				}
			};
			document.addEventListener("click", close);
			document.addEventListener("scroll", close, true);
		}, 0);
	}
	chat.addEventListener("click", (e) => {
		const cite = e.target.closest(".aiCite");
		if (cite) {
			e.preventDefault();
			let map = currentSources;
			const row = cite.closest(".aiMsg");
			if (row && row.dataset.sources) {
				try { map = JSON.parse(row.dataset.sources); } catch {}
			}
			openCitation(cite, cite.dataset.cite, map);
			return;
		}
		const copyBtn = e.target.closest(".aiCopyBtn");
		if (copyBtn) {
			const row = copyBtn.closest(".aiMsg");
			const txt = row ? (row.dataset.text || "") : "";
			if (txt) {
				const done = () => showCoinMsg(t("ai_copied"));
				if (navigator.clipboard && navigator.clipboard.writeText) {
					navigator.clipboard.writeText(txt).then(done).catch(() => {});
				} else {
					const ta = document.createElement("textarea");
					ta.value = txt;
					document.body.appendChild(ta);
					ta.select();
					try { document.execCommand("copy"); } catch {}
					document.body.removeChild(ta);
					done();
				}
			}
			return;
		}
		const delBtn = e.target.closest(".aiDelBtn");
		if (delBtn) {
			const row = delBtn.closest(".aiMsg");
			if (row) {
				row.remove();
				aiRebuildHistory();
			}
		}
	});

	aiLoadHistory();
	if (aiHistory.length) {
		for (let i = 0; i < aiHistory.length; i++) {
			const item = aiHistory[i];
			if (item.role === "user") {
				addMsg("user", item.content, null);
			} else if (item.role === "assistant") {
				const map = aiTurnSources[i] || {};
				createBotRow(item.content, renderAnswer(item.content, map), map);
			}
		}
	} else {
		addMsg("bot", t("ai_welcome"), null, { welcome: true });
	}

	async function ask() {
		const q = input.value.trim();
		if (!q || sendBtn.disabled) return;
		input.value = "";
		sendBtn.disabled = true;
		addMsg("user", q, null);
		const thinking = addThinking();

		let fullAnswer = "";
		let errored = false;
		try {
			const history = aiHistory.slice(-5);
			const token = localStorage.getItem("token");
			const res = await fetch(API_BASE + "/api/ai/ask", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: "Bearer " + token } : {})
				},
				body: JSON.stringify({ question: q, history })
			});
			const ctype = res.headers.get("content-type") || "";
			if (!res.ok || !ctype.includes("event-stream")) {
				const text = await res.text();
				let errObj = null;
				try { errObj = JSON.parse(text); } catch {}
				const msg = (errObj && errObj.error) || text;
				const e = new Error(msg);
				e.code = errObj ? errObj.code : null;
				throw e;
			}
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const parts = buffer.split("\n\n");
				buffer = parts.pop() || "";
				for (const part of parts) {
					for (const line of part.split("\n")) {
						if (!line.startsWith("data:")) continue;
						const payload = line.slice(5).trim();
						let ev;
						try { ev = JSON.parse(payload); } catch { continue; }
						if (ev.type === "sources" && Array.isArray(ev.sources)) {
							currentSources = {};
							ev.sources.forEach(s => { currentSources[s.index] = s; });
							try { thinking.dataset.sources = JSON.stringify(currentSources); } catch {}
						} else if (ev.type === "delta") {
							fullAnswer += ev.content;
							thinking.querySelector(".aiBubble").innerHTML = renderAnswer(fullAnswer);
							chat.scrollTop = chat.scrollHeight;
						} else if (ev.type === "done") {
							if (currentUser && typeof ev.coins === "number") currentUser.coins = ev.coins;
							if (ev.free) {
								showCoinMsg(t("ai_free_used"));
							} else {
								showCoinMsg(t("coin_sub", 1));
							}
							if (typeof ev.remaining === "number" && ev.remaining < 5) {
								addHint(ev.remaining === 0 ? t("ai_used_up") : t("ai_remaining", ev.remaining));
							}
						} else if (ev.type === "error") {
							errored = true;
							showCoinMsg(t("ai_error"));
						}
					}
				}
			}
			if (!fullAnswer) {
				thinking.querySelector(".aiBubble").innerHTML = t("ai_error");
			} else {
				thinking.dataset.text = fullAnswer;
			}
			if (fullAnswer && !errored) {
				aiHistory.push({ role: "user", content: q });
				aiHistory.push({ role: "assistant", content: fullAnswer });
				aiTurnSources.push(null);
				aiTurnSources.push(currentSources);
				if (aiHistory.length > 20) {
					aiHistory = aiHistory.slice(-20);
					aiTurnSources = aiTurnSources.slice(-20);
				}
				aiSaveHistory();
			}
		} catch (e) {
			if (e && e.code === "concurrency") {
				thinking.querySelector(".aiBubble").innerHTML = t("ai_queue");
				showCoinMsg(t("ai_queue_refund"));
			} else {
				thinking.querySelector(".aiBubble").innerHTML = t("ai_error");
				showCoinMsg(t("ai_error"));
			}
		} finally {
			sendBtn.disabled = false;
			input.focus();
		}
	}

	sendBtn.onclick = ask;
	input.onkeydown = e => {
		if (e.key === "Enter") ask();
	};
	aiModalEl.querySelector("#aiCloseBtn").onclick = closeAIModal;
	openAiTos = () => {
		document.querySelector(".modalBox").style.width = "360px";
		modal(
			'<div style="margin:0 0 14px;text-align:center;font-size:16px;font-weight:700;color:var(--text);">' + t("ai_tos_title") + '</div>' +
			'<div style="margin:0;text-align:left;font-size:13px;color:var(--text);line-height:1.8;white-space:pre-wrap;max-height:60vh;overflow-y:auto;">' + escapeHtml(t("ai_tos_text")) + '</div>'
		);
	};
	aiModalEl.querySelector("#aiTosBtn").onclick = openAiTos;
	aiModalEl.querySelector("#aiClearBtn").onclick = () => {
		const box = document.querySelector(".modalBox");
		const origW = box.style.width;
		box.style.width = "320px";
		modal(
			'<div style="margin:0 0 16px;text-align:center;font-size:15px;color:var(--text);line-height:1.5;">' + t("ai_clear_confirm") + '</div>' +
			'<div style="text-align:center">' +
			'<button id="aiClearConfirm" style="background:#e74c3c;color:#fff;padding:10px 40px;border-radius:20px;border:none;font-size:16px;cursor:pointer">' +
			t("confirm_btn") + '</button>' +
			'</div>'
		);
		const prevCloseHandler = $("closeModal").onclick;
		const restoreCloseHandler = () => { $("closeModal").onclick = prevCloseHandler; };
		const closeModalHandler = () => {
			$("modal").classList.add("hidden");
			box.style.width = origW;
			restoreCloseHandler();
		};
		$("aiClearConfirm").onclick = () => {
			$("modal").classList.add("hidden");
			box.style.width = origW;
			restoreCloseHandler();
			aiHistory = [];
			aiTurnSources = [];
			aiSaveHistory();
			chat.innerHTML = "";
			addMsg("bot", t("ai_welcome"), null, { welcome: true });
		};
		$("closeModal").onclick = closeModalHandler;
		$("modal").onclick = e => { if (e.target === $("modal")) closeModalHandler(); };
	};
	aiModalEl.onclick = e => {
		if (e.target === aiModalEl) closeAIModal();
	};
	}
	aiModalEl.classList.add("show");
	aiModalEl.querySelector("#aiInput").focus();
	if (openAiTos && !localStorage.getItem("aiTosShown")) {
		localStorage.setItem("aiTosShown", "1");
		setTimeout(openAiTos, 300);
	}
}

function closeAIModal() {
	if (!aiModalEl) return;
	aiModalEl.classList.remove("show");
	document.querySelectorAll(".aiCitePanel").forEach(p => p.remove());
}

async function openAILogs() {
	if (!currentUser || !isAdmin(currentUser)) return;
	const wrap = document.createElement("div");
	wrap.className = "aiModal";
	wrap.id = "aiLogsModal";
	wrap.innerHTML = `
						<div class="aiBox" style="max-width:720px;">
							<div class="aiHead">
								<h2>${t("ai_logs_title")}</h2>
								<button class="aiCloseBtn" id="aiLogsCloseBtn">${t("ai_logs_close")}</button>
							</div>
							<div class="aiChat" id="aiLogsList" style="max-height:60vh;"></div>
						</div>`;
	document.body.appendChild(wrap);
	wrap.classList.add("show");
	const list = wrap.querySelector("#aiLogsList");
	list.innerHTML = t("ai_generating");
	try {
		const data = await apiGet("/api/ai/logs");
		const logs = data.logs || [];
		if (!logs.length) {
			list.innerHTML = '<div style="color:var(--sub);text-align:center;padding:20px;">' + t("ai_logs_empty") + '</div>';
		} else {
			list.innerHTML = logs.map(l => {
				const name = getDisplayName(l.users) || ("#" + l.user_id);
				const time = l.created_at ? new Date(l.created_at).toLocaleString() : "";
				return `<div class="aiLogItem">
									<div style="display:flex;justify-content:space-between;gap:10px;font-size:12px;color:var(--sub);">
										<b style="color:var(--text);">${escapeHtml(name)}</b><span>${time}</span>
									</div>
									<div style="margin-top:4px;font-size:14px;color:var(--text);"><b>Q:</b> ${escapeHtml(l.question)}</div>
									<div style="margin-top:2px;font-size:13px;color:var(--sub);">${escapeHtml((l.answer||"").slice(0,300))}</div>
								</div>`;
			}).join("");
		}
	} catch (e) {
		list.innerHTML = '<div style="color:var(--sub);text-align:center;padding:20px;">' + t("ai_error") + '</div>';
	}
	wrap.querySelector("#aiLogsCloseBtn").onclick = () => wrap.remove();
	wrap.onclick = e => {
		if (e.target === wrap) wrap.remove();
	};
}
