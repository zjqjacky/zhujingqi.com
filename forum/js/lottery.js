async function openLottery() {
	const sm = document.getElementById("shopModal");
	if (sm) sm.remove();
	try {
		const coinData = await apiGet("/api/users/" + currentUser.id);
		if (coinData && currentUser) currentUser.coins = coinData.coins;
	} catch {};

	const modal = document.createElement("div");
	modal.id = "lotteryModal";

	const prizes = [{
			id: "lose5",
			label: "吞5",
			color: "#e53935",
			v: -5,
			w: 10
		},
		{
			id: "lose2",
			label: "吞2",
			color: "#ef9a9a",
			v: -2,
			w: 14
		},
		{
			id: "win5",
			label: "返5",
			color: "#81c784",
			v: 5,
			w: 18
		},
		{
			id: "win8",
			label: "返8",
			color: "#66bb6a",
			v: 8,
			w: 20
		},
		{
			id: "win12",
			label: "返12",
			color: "#4caf50",
			v: 12,
			w: 18
		},
		{
			id: "win20",
			label: "返20",
			color: "#388e3c",
			v: 20,
			w: 11
		},
		{
			id: "win50",
			label: "返50",
			color: "#1b5e20",
			v: 50,
			w: 6
		},
		{
			id: "green_v",
			label: "绿V",
			color: "#d4a017",
			v: "green_v",
			w: 1
		},
		{
			id: "purple_star",
			label: "紫星",
			color: "#9c27b0",
			v: "purple_star",
			w: 1
		},
		{
			id: "blue_diamond",
			label: "蓝钻",
			color: "#2196f3",
			v: "blue_diamond",
			w: 1
		},
	];
	const pool = [];
	prizes.forEach((p, i) => {
		for (let j = 0; j < p.w; j++) pool.push(i);
	});
	const n = prizes.length;
	const sa = (2 * Math.PI) / n;

	modal.innerHTML = `
						<div class="lotteryBox">
							<div class="lotteryCloseRow"><button id="lotteryCloseBtn">${t("shop_close")}</button></div>
							<h2>${t("lottery_title")}</h2>
							<div class="wheelArea">
								<div class="wheelWrapper">
									<div class="pointer"></div>
									<canvas id="wc" width="560" height="560"></canvas>
								</div>
							</div>
							<div class="lotteryCoins">${t("shop_coins", '<b>'+(currentUser?.coins||0)+'</b>')}</div>
							<div class="lotteryBtns">
								<button id="s1" class="lotteryBtn" style="background:var(--green);color:#fff;">${t("lottery_spin1")}</button>
								<button id="s10" class="lotteryBtn" style="background:#ff8c00;color:#fff;">${t("lottery_spin10")}</button>
							</div>
							<div id="lr" class="lotteryResult"></div>
						</div>`;
	document.body.appendChild(modal);

	const cv = document.getElementById("wc");
	const cx = cv.getContext("2d");
	let ang = 0,
		sp = false;

	function setupCanvas() {
		const wa = cv.parentElement;
		const w = wa.clientWidth;
		const dpr = window.devicePixelRatio || 1;
		cv.width = w * dpr;
		cv.height = w * dpr;
		cv.style.width = w + "px";
		cv.style.height = w + "px";
		cx.setTransform(dpr, 0, 0, dpr, 0, 0);
		return {
			D: w,
			md: w / 2,
			R: w / 2 - 20,
			dpr
		};
	}

	function dr(a) {
		const {
			D,
			md,
			R
		} = setupCanvas();
		cx.clearRect(0, 0, D, D);
		cx.save();
		cx.translate(md, md);
		cx.rotate(a);
		const fs = Math.round(R * 0.1);
		for (let i = 0; i < n; i++) {
			const s = i * sa,
				e = s + sa;
			cx.beginPath();
			cx.moveTo(0, 0);
			cx.arc(0, 0, R, s, e);
			cx.closePath();
			cx.fillStyle = prizes[i].color;
			cx.fill();
			cx.strokeStyle = "rgba(255,255,255,.25)";
			cx.lineWidth = 2;
			cx.stroke();
			cx.save();
			cx.rotate(s + sa / 2);
			cx.textAlign = "center";
			cx.textBaseline = "middle";
			cx.font = `bold ${fs}px 'Microsoft YaHei',sans-serif`;
			cx.strokeStyle = "rgba(0,0,0,.6)";
			cx.lineWidth = Math.max(2, fs / 5);
			cx.strokeText(prizes[i].label, R - fs * 1.4, 0);
			cx.fillStyle = "#fff";
			cx.shadowColor = "rgba(0,0,0,.5)";
			cx.shadowBlur = fs / 4;
			cx.fillText(prizes[i].label, R - fs * 1.4, 0);
			cx.shadowBlur = 0;
			cx.restore();
		}
		const cr = Math.max(12, R * 0.12);
		cx.beginPath();
		cx.arc(0, 0, cr, 0, 2 * Math.PI);
		cx.fillStyle = document.body.classList.contains("dark") ? "#333" : "#fff";
		cx.fill();
		cx.strokeStyle = "#bbb";
		cx.lineWidth = 2;
		cx.stroke();
		cx.restore();
	}

	function pick() {
		let idx, tries = 0,
			owned = currentUser?.role;
		do {
			idx = pool[Math.random() * pool.length | 0];
			const v = prizes[idx].v;
			if (typeof v === "string" && owned?.includes(v) && tries < 20) {
				tries++;
				continue;
			}
			break;
		} while (true);
		return idx;
	}

	function prizeAtAngle(a) {
		let t = (-a - Math.PI / 2) % (2 * Math.PI);
		if (t < 0) t += 2 * Math.PI;
		return (t / sa | 0) % n;
	}

	function spinTo(ti, cb) {
		if (sp) return;
		sp = true;
		const s1 = document.getElementById("s1"),
			s10 = document.getElementById("s10");
		s1.disabled = true;
		s10.disabled = true;
		const off = (Math.random() - .5) * sa * .5;
		const landing = -Math.PI / 2 - ti * sa - sa / 2 + off;
		const minRot = 3;
		const extra = Math.ceil((ang - landing) / (2 * Math.PI) + minRot + Math.random() * 2);
		const ta = landing + extra * 2 * Math.PI;
		const st = ang,
			td = ta - st;
		const dur = 3000 + Math.random() * 1000,
			t0 = performance.now();

		function step(now) {
			const p = Math.min((now - t0) / dur, 1);
			const e = 1 - Math.pow(1 - p, 3);
			ang = st + td * e;
			dr(ang);
			if (p < 1) {
				requestAnimationFrame(step);
			} else {
				cb(prizeAtAngle(ang), () => {
					sp = false;
					s1.disabled = false;
					s10.disabled = false;
				});
			}
		}
		requestAnimationFrame(step);
	}
	dr(ang);

	const lr = document.getElementById("lr");

	function applyServerState(draw) {
		if (!currentUser) return;
		if (draw && typeof draw.coins === "number") currentUser.coins = draw.coins;
		if (draw && Array.isArray(draw.role)) currentUser.role = draw.role;
	}

	document.getElementById("s1").onclick = async () => {
		if (sp) return;
		if ((currentUser?.coins || 0) < 10) {
			showCoinMsg(t("lottery_no_coins"));
			return;
		}
		let draw;
		try {
			draw = await apiPost("/api/lottery/draw", { count: 1 });
		} catch (e) {
			showCoinMsg(e.message === "JWT_EXPIRED" ? t("coin_penalty") : t("lottery_no_coins"));
			return;
		}
		const result = draw.results[0];
		const ri = prizes.findIndex(p => p.id === result.id);
		applyServerState(draw);
		spinTo(ri >= 0 ? ri : 0, (landed, done) => {
			if (result.isBadge) {
				lr.innerHTML = `<div class="singleResult">${t("lottery_badge_won", result.label)}</div>`;
			} else {
				lr.innerHTML = `<div class="singleResult">${result.label} ${t("profile_coins")}</div>`;
			}
			updCoins();
			done();
		});
		updCoins();
	};

	document.getElementById("s10").onclick = async () => {
		if (sp) return;
		const s10b = document.getElementById("s10"),
			s1b = document.getElementById("s1");
		s10b.disabled = true;
		s1b.disabled = true;
		try {
			if ((currentUser?.coins || 0) < 99) {
				showCoinMsg(t("lottery_no_coins"));
				return;
			}
			const draw = await apiPost("/api/lottery/draw", { count: 10 });
			applyServerState(draw);
			const items = draw.results.map(r => ({
				label: r.label,
				color: r.color || (prizes.find(p => p.id === r.id) || {}).color,
				isBadge: r.isBadge
			}));
			lr.innerHTML =
				'<div class="tenResult"><div class="tenTitle">' + t("lottery_10_result") +
				'</div><div class="tenGrid"></div></div>';
			const grid = lr.querySelector(".tenGrid");
			for (let i = 0; i < items.length; i++) {
				const it = items[i];
				const el = document.createElement("div");
				el.className = "tenItem";
				el.style.background = it.color;
				if (it.isBadge) el.style.outline = "2px solid #fff";
				el.textContent = it.label;
				el.style.opacity = "0";
				el.style.transform = "scale(.5)";
				el.style.transition = "opacity .3s, transform .3s";
				grid.appendChild(el);
				requestAnimationFrame(() => {
					el.style.opacity = "1";
					el.style.transform = "scale(1)";
				});
				await new Promise(r => setTimeout(r, 120));
			}
			const tc = draw.results.reduce((a, r) => a + (typeof r.v === "number" ? r.v : 0), 0);
			const totalEl = document.createElement("div");
			totalEl.className = "tenTotal";
			totalEl.textContent = `${tc>0?'+':''}${tc} ${t("profile_coins")}`;
			totalEl.style.opacity = "0";
			totalEl.style.transition = "opacity .4s";
			lr.querySelector(".tenResult").appendChild(totalEl);
			requestAnimationFrame(() => totalEl.style.opacity = "1");
			updCoins();
		} catch (e) {
			if (e.message !== "JWT_EXPIRED") showCoinMsg(t("lottery_no_coins"));
		} finally {
			sp = false;
			s10b.disabled = false;
			s1b.disabled = false;
		}
	};

	async function addBadge(bid) {
		let r = currentUser?.role || [];
		if (Array.isArray(r) && !r.includes(bid)) {
			r = [...r, bid];
			try {
				await apiPut("/api/users/" + currentUser.id, {
					role: r
				});
			} catch {}
			if (currentUser) currentUser.role = r;
		}
	}

	function updCoins() {
		const el = document.querySelector("#lotteryModal .lotteryCoins b");
		if (el) el.textContent = currentUser?.coins || 0;
	}

	function closeLottery() {
		modal.remove();
		const sm = document.getElementById("shopModal");
		if (sm) sm.remove();
	}
	document.getElementById("lotteryCloseBtn").onclick = closeLottery;
	modal.onclick = e => {
		if (e.target === modal) closeLottery();
	};
}

