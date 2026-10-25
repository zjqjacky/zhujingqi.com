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
	// 服务端冷却 5 秒；动画只跑 3~4 秒，按钮必须等冷却结束再亮
	let nextSpinAt = 0;

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
		if (Date.now() < nextSpinAt) return showCoinMsg(t("lottery_cooldown"));
		if ((currentUser?.coins || 0) < 10) {
			showCoinMsg(t("lottery_no_coins"));
			return;
		}
		nextSpinAt = Date.now() + 5200;
		let draw;
		const before1 = currentUser?.coins || 0;
		try {
			draw = await apiPost("/api/lottery/draw", { count: 1 });
		} catch (e) {
			showCoinMsg(/wait|too many/i.test(e.message) ? t("lottery_cooldown")
				: e.message === "JWT_EXPIRED" ? t("coin_penalty") : t("lottery_no_coins"));
			return;
		}
		const result = draw.results[0];
		const ri = prizes.findIndex(p => p.id === result.id);
		// 扣费和结果都等转盘停稳再揭晓：先弹 -10 就没期待感了
		spinTo(ri >= 0 ? ri : 0, (landed, done) => {
			if (result.isBadge) {
				lr.innerHTML = `<div class="singleResult">${t("lottery_badge_won", result.label)}</div>`;
			} else {
				lr.innerHTML = `<div class="singleResult">${result.label} ${t("profile_coins")}</div>`;
			}
			applyServerState(draw);
			showCoinDelta((draw.coins || 0) - before1);
			updCoins();
			done();
		});
	};

	document.getElementById("s10").onclick = async () => {
		if (sp) return;
		if (Date.now() < nextSpinAt) return showCoinMsg(t("lottery_cooldown"));
		const s10b = document.getElementById("s10"),
			s1b = document.getElementById("s1");
		s10b.disabled = true;
		s1b.disabled = true;
		const before10 = currentUser?.coins || 0;
		try {
			if ((currentUser?.coins || 0) < 99) {
				showCoinMsg(t("lottery_no_coins"));
				return;
			}
			nextSpinAt = Date.now() + 5200;
			const draw = await apiPost("/api/lottery/draw", { count: 10 });
			// 同样等抽完 10 个再结算，过程中余额保持原样
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
			applyServerState(draw);
			showCoinDelta((draw.coins || 0) - before10);
			updCoins();
		} catch (e) {
			if (e.message !== "JWT_EXPIRED") {
				showCoinMsg(/wait|too many/i.test(e.message) ? t("lottery_cooldown") : t("lottery_no_coins"));
			}
		} finally {
			sp = false;
			const wait = Math.max(0, nextSpinAt - Date.now());
			setTimeout(() => {
				s10b.disabled = false;
				s1b.disabled = false;
			}, wait);
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

// ===== 弹珠机（Plinko） =====
// 落点由服务端决定，前端只负责把球"演"到那个格子，
// 和转盘一个套路：先拿到结果，再造一条看起来合理的路径。
async function openPlinko() {
	const sm = document.getElementById("shopModal");
	if (sm) sm.remove();

	let cfg = {
		cost: 8,
		rows: 8,
		payouts: [60, 30, 10, 5, 2, 5, 10, 30, 60]
	};
	try {
		const c = await apiGet("/api/lottery/plinko");
		if (c && Array.isArray(c.payouts) && c.payouts.length === (c.rows || 8) + 1) cfg = c;
	} catch {}
	// 8 连投打包价，默认 60 币
	let packCfg = { count: 8, cost: 60 };
	if (cfg.pack && cfg.pack.count > 1) packCfg = cfg.pack;

	if (!document.getElementById("plinkoStyle")) {
		const st = document.createElement("style");
		st.id = "plinkoStyle";
		st.textContent = `
#plinkoModal{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);}
#plinkoModal .plinkoBox{background:var(--card);border-radius:24px;padding:18px;width:min(94vw,560px);max-height:94vh;overflow:auto;box-sizing:border-box;}
#plinkoModal canvas{display:block;width:100%;height:auto;border-radius:16px;background:var(--bg);}
#plinkoModal .plinkoBtn{width:100%;margin-top:12px;height:46px;font-size:17px;font-weight:700;border-radius:14px;border:0;background:var(--green);color:#fff;cursor:pointer;}
#plinkoModal .plinkoBtn:disabled{opacity:.5;cursor:default;}
#plinkoModal .plinkoBtns{display:flex;gap:8px;margin-top:12px;}
#plinkoModal .plinkoBtns .plinkoBtn{margin-top:0;flex:1;min-width:0;padding:0 8px;white-space:nowrap;}
#plinkoModal .plinkoBtnPack{background:#d4a017;}
#plinkoModal .plinkoMsg{text-align:center;margin-top:8px;font-size:15px;min-height:22px;color:var(--sub);}
`;
		document.head.appendChild(st);
	}

	const modal = document.createElement("div");
	modal.id = "plinkoModal";
	modal.innerHTML = `
		<div class="plinkoBox">
			<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
				<h2 style="margin:0;font-size:20px;">${t("plinko_title")}</h2>
				<div style="display:flex;align-items:center;gap:10px;">
					<span style="font-size:14px;color:var(--sub);">${t("shop_coins", '<b id="plinkoCoins">' + (currentUser?.coins || 0) + '</b>')}</span>
					<button id="plinkoClose" style="height:32px;padding:0 12px;">${t("shop_close")}</button>
				</div>
			</div>
			<canvas id="plinkoCv"></canvas>
			<div class="plinkoBtns">
				<button id="plinkoDrop" class="plinkoBtn">${t("plinko_drop", cfg.cost)}</button>
				<button id="plinkoDropPack" class="plinkoBtn plinkoBtnPack">${t("plinko_drop_pack", packCfg.count, packCfg.cost)}</button>
			</div>
			<div class="plinkoMsg" id="plinkoMsg"></div>
		</div>`;
	document.body.appendChild(modal);

	const cv = modal.querySelector("#plinkoCv");
	const ctx = cv.getContext("2d");
	const W = 520, H = 430;
	const dpr = window.devicePixelRatio || 1;
	cv.width = W * dpr;
	cv.height = H * dpr;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	cv.style.width = "100%";
	cv.style.height = "auto";

	const css = getComputedStyle(document.body);
	const GREEN = (css.getPropertyValue("--green") || "#0a0").trim() || "#0a0";
	const SUB = (css.getPropertyValue("--sub") || "#666").trim() || "#666";
	const BORDER = (css.getPropertyValue("--border") || "#ccc").trim() || "#ccc";

	const ROWS = cfg.rows || 8;
	const PAY = cfg.payouts;
	const DX = 52, DY = 42, TOP = 44;
	const CENTER = W / 2;
	const pegX = (r, i) => CENTER + (i - r / 2) * DX;
	const pegY = r => TOP + r * DY;
	const bucketX = k => CENTER + (k - ROWS / 2) * DX;
	const bucketY = pegY(ROWS) + 30;

	function roundRect(x, y, w, h, r) {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.arcTo(x + w, y, x + w, y + h, r);
		ctx.arcTo(x + w, y + h, x, y + h, r);
		ctx.arcTo(x, y + h, x, y, r);
		ctx.arcTo(x, y, x + w, y, r);
		ctx.closePath();
	}

	let flash = null;

	function draw(balls, hits) {
		ctx.clearRect(0, 0, W, H);
		const hitList = hits || [];
		const isHit = k => hitList.indexOf(k) >= 0;

		// 底部格子
		for (let k = 0; k < PAY.length; k++) {
			const x = bucketX(k) - (DX - 8) / 2;
			const y = bucketY - 14;
			const w = DX - 8, h = 28;
			ctx.fillStyle = isHit(k) ? GREEN : "rgba(128,128,128,.16)";
			roundRect(x, y, w, h, 8);
			ctx.fill();
			ctx.strokeStyle = isHit(k) ? GREEN : BORDER;
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.fillStyle = isHit(k) ? "#fff" : SUB;
			ctx.font = "bold 13px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(String(PAY[k]), bucketX(k), y + h / 2);
		}

		// 钉子
		for (let r = 0; r < ROWS; r++) {
			for (let i = 0; i <= r; i++) {
				ctx.beginPath();
				ctx.arc(pegX(r, i), pegY(r), 4, 0, Math.PI * 2);
				ctx.fillStyle = "rgba(128,128,128,.45)";
				ctx.fill();
			}
		}

		// 撞柱光环
		if (flash) {
			const age = performance.now() - flash.t0;
			if (age < 280) {
				const k = 1 - age / 280;
				ctx.beginPath();
				ctx.arc(flash.x, flash.y, 9 + (1 - k) * 12, 0, Math.PI * 2);
				ctx.globalAlpha = k * 0.85;
				ctx.strokeStyle = GREEN;
				ctx.lineWidth = 2;
				ctx.stroke();
				ctx.globalAlpha = 1;
			} else {
				flash = null;
			}
		}

		// 球 + 各自的拖尾
		for (const b of (balls || [])) {
			for (let i = 0; i < b.trail.length; i++) {
				const p = b.trail[i];
				const k = (i + 1) / b.trail.length;
				ctx.beginPath();
				ctx.arc(p.x, p.y, 2 + k * 2.5, 0, Math.PI * 2);
				ctx.globalAlpha = k * 0.22;
				ctx.fillStyle = GREEN;
				ctx.fill();
				ctx.globalAlpha = 1;
			}
			// 撞柱瞬间压扁一下，做出「砸中」的手感
			const hitNow = performance.now() < b.squashUntil;
			ctx.beginPath();
			ctx.ellipse(b.x, b.y, hitNow ? 8.6 : 7, hitNow ? 5.2 : 7, 0, 0, Math.PI * 2);
			ctx.fillStyle = GREEN;
			ctx.fill();
			ctx.strokeStyle = "rgba(255,255,255,.75)";
			ctx.lineWidth = 2;
			ctx.stroke();
		}
	}

	// 按目标格子倒推一条路径：ROWS 步里恰好 hit 次向右
	function pathFor(hit) {
		const order = [...Array(ROWS).keys()];
		for (let i = order.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[order[i], order[j]] = [order[j], order[i]];
		}
		const rights = new Array(ROWS).fill(false);
		for (let i = 0; i < hit; i++) rights[order[i]] = true;

		const pts = [{ x: CENTER, y: TOP - 26 }];
		let count = 0;
		for (let r = 0; r < ROWS; r++) {
			if (rights[r]) count++;
			// -8：让球停在钉子顶上，看起来是「撞到」而不是「穿过」
			pts.push({ x: pegX(r + 1, count), y: pegY(r + 1) - 8 });
		}
		pts.push({ x: bucketX(hit), y: bucketY - 10 });
		return pts;
	}

	// 支持 1~8 颗球同时下落；每颗球错开 140ms 入场
	function animateBalls(buckets, done) {
		const T_FALL = 360;   // 顶部自由落体
		const T_HOP = 285;    // 每撞一次柱子
		const T_LAST = 340;   // 最后一跳落进格子
		const start = performance.now();

		flash = null;
		const balls = buckets.map((hit, idx) => ({
			pts: pathFor(hit),
			hit,
			phase: 0,
			start: start + idx * 140,
			t0: start + idx * 140,
			x: CENTER,
			y: TOP - 26,
			trail: [],
			squashUntil: 0,
			finished: false
		}));
		const hits = [];
		let landed = 0;

		function bump(ball, x, y) {
			flash = { x, y, t0: performance.now() };
			ball.squashUntil = performance.now() + 100;
		}

		function frame(now) {
			for (const b of balls) {
				if (b.finished || now < b.start) continue;
				const pts = b.pts;
				let x, y;

				if (b.phase === 0) {
					const a = pts[0], c = pts[1];
					const t = Math.min(1, (now - b.t0) / T_FALL);
					x = a.x + (c.x - a.x) * t;
					y = a.y + (c.y - a.y) * (t * t);   // 重力加速
					if (t >= 1) {
						bump(b, c.x, c.y + 8);
						b.phase = 1;
						b.t0 = now;
					}
				} else {
					const k = b.phase;
					const a = pts[k], c = pts[k + 1];
					const dur = k === ROWS ? T_LAST : T_HOP;
					const hop = k === ROWS ? 9 : 19;   // 抛物线弹起高度
					const t = Math.min(1, (now - b.t0) / dur);
					x = a.x + (c.x - a.x) * t;
					y = a.y + (c.y - a.y) * t - Math.sin(Math.PI * t) * hop;
					if (t >= 1) {
						if (k < ROWS) bump(b, c.x, c.y + 8);
						b.phase++;
						b.t0 = now;
					}
				}

				if (b.phase > ROWS) {
					b.x = pts[ROWS + 1].x;
					b.y = pts[ROWS + 1].y;
					b.finished = true;
					landed++;
					hits.push(b.hit);
				} else {
					b.x = x;
					b.y = y;
					b.trail.push({ x, y });
					if (b.trail.length > 7) b.trail.shift();
				}
			}

			draw(balls.filter(b => !b.finished), hits);

			if (landed < balls.length) {
				requestAnimationFrame(frame);
			} else {
				draw([], hits);
				done();
			}
		}
		requestAnimationFrame(frame);
	}

	const btn = modal.querySelector("#plinkoDrop");
	const packBtn = modal.querySelector("#plinkoDropPack");
	const msgEl = modal.querySelector("#plinkoMsg");
	const coinsEl = modal.querySelector("#plinkoCoins");
	let busy = false;
	let nextAllowedAt = 0;

	function setCoins() {
		if (coinsEl && currentUser) coinsEl.textContent = currentUser.coins || 0;
	}

	function setButtons(disabled) {
		if (btn) btn.disabled = disabled;
		if (packBtn) packBtn.disabled = disabled;
	}

	async function drop(count) {
		const pack = count > 1;
		const cost = pack ? packCfg.cost : cfg.cost;
		if (busy) return;
		if (Date.now() < nextAllowedAt) {
			msgEl.textContent = t("lottery_cooldown");
			return;
		}
		if ((currentUser?.coins || 0) < cost) {
			msgEl.textContent = t("lottery_no_coins");
			return;
		}
		busy = true;
		setButtons(true);
		nextAllowedAt = Date.now() + 5200;
		msgEl.textContent = "";
		const before = currentUser?.coins || 0;
		let res;
		try {
			res = await apiPost("/api/lottery/plinko", pack ? { count: count } : {});
		} catch (e) {
			busy = false;
			if (e.message !== "JWT_EXPIRED") {
				msgEl.textContent = /wait|too many/i.test(e.message)
					? t("lottery_cooldown")
					: t("lottery_no_coins");
			}
			// 按钮等冷却结束再亮，别让人点了又被拒
			setTimeout(() => setButtons(false), Math.max(0, nextAllowedAt - Date.now()));
			return;
		}
		const buckets = (res.results || [{ bucket: res.bucket }]).map(r => r.bucket);
		animateBalls(buckets, () => {
			// 落定之后才结算，和转盘一致
			if (currentUser) currentUser.coins = res.coins;
			setCoins();
			showCoinDelta(res.coins - before);
			const paid = pack ? res.total : res.payout;
			msgEl.textContent = paid >= cost
				? `🎉 +${paid} ${t("profile_coins")}`
				: `+${paid} ${t("profile_coins")}`;
			busy = false;
			setTimeout(() => setButtons(false), Math.max(0, nextAllowedAt - Date.now()));
		});
	}

	btn.onclick = () => drop(1);
	if (packBtn) packBtn.onclick = () => drop(packCfg.count);
	modal.querySelector("#plinkoClose").onclick = () => modal.remove();
	modal.onclick = e => {
		if (e.target === modal) modal.remove();
	};
	draw([], []);
	setCoins();
	window.openPlinko = openPlinko;
}

