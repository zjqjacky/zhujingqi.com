function stripInternalCodes(txt) {
	const meta = getPostMeta(txt);
	return meta.content.replace(/\[\[.*?\]\]|\[.*?\]/g, "").trim();
}

function renderAnnouncementEmojis(snippet) {
	return snippet.replace(/:([a-zA-Z0-9_-]+):/g, (m, name) =>
		EMOJI_MAP.includes(name.toLowerCase()) ?
		`<img src="emojis/${name.toLowerCase()}.svg" class="emojiInPost" alt=":${name}:" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline;">` :
		m
	);
}
async function loadAnnouncements() {
	const bar = $("announceBar");
	if (!bar || window.innerWidth <= 800) return;
	try {
		const res = await apiGet("/api/posts?tag=公告&perPage=3");
		const posts = res?.posts || [];
		if (!posts.length) {
			bar.innerHTML = "";
			return;
		}
		bar.innerHTML =
			'<strong id="statsTitle">' + t("announcement_btn") + '</strong><br>' +
			posts.map(p => {
				const text = stripInternalCodes(p.content || "").replace(/<[^>]*>/g, "").replace(
					/\s+/g, " ").trim();
				const snippet = text.length > 50 ? text.slice(0, 50) + "…" : text;
				return '<div class="annItem" data-pid="' + p.id + '">' +
					renderAnnouncementEmojis(snippet) + '</div>';
			}).join("");
		bar.querySelectorAll(".annItem").forEach(el => {
			el.onclick = () => {
				const pid = Number(el.dataset.pid);
				if (pid) {
					history.replaceState(null, "", "?pid=" + pid);
					openSinglePost(pid).catch(() => { modal(t("post_not_found")); show("main"); });
				}
			};
		});
	} catch {
		bar.innerHTML = "";
	}
}

function renderFortuneItem(el, text) {
	const parts = FORTUNE_LINKS[text];
	el.textContent = "";
	if (!parts) {
		el.textContent = text;
		return;
	}
	let rest = text;
	for (const [label, href] of parts) {
		const i = rest.indexOf(label);
		if (i === -1) continue;
		if (i > 0) el.appendChild(document.createTextNode(rest.slice(0, i)));
		const a = document.createElement("a");
		a.href = href;
		a.textContent = label;
		a.className = "fortuneLink";
		el.appendChild(a);
		rest = rest.slice(i + label.length);
	}
	if (rest) el.appendChild(document.createTextNode(rest));
}

document.getElementById("fortuneBtn").onclick = function() {
	if (!currentUser) return;
	const username = currentUser.name;
	const f = getDailyFortune(username);
	document.getElementById("fortuneLevel").innerText = f.level;
	renderFortuneItem(document.getElementById("fortuneGood"), f.good);
	renderFortuneItem(document.getElementById("fortuneBad"), f.bad);
	document.getElementById("fortuneResult").style.display = "block";
	const colors = {
		"大吉": "gold",
		"吉": "green",
		"中平": "gray",
		"凶": "red",
		"大凶": "darkred"
	};
	const levelEl = document.getElementById("fortuneLevel");
	levelEl.innerText = f.level;
	levelEl.style.color = colors[f.level];
	this.style.display = "none";
};

