async function openShop() {
	const shopDiv = document.createElement("div");
	shopDiv.id = "shopModal";
	const box = document.querySelector(".modalBox");
	box.style.width = "";
	modal(`<div style="text-align:center;padding:20px;">${t("loading")}</div>`);
	let userData;
	try {
		userData = await apiGet("/api/users/" + currentUser.id);
	} catch {
		userData = {
			coins: 0,
			role: []
		};
	}
	let coins = userData?.coins || 0;
	let roleArr = userData?.role || [];
	let cardCount = (userData?.inventory && userData.inventory.rename_card) || 0;

	// 商品清单来自服务端，价格只此一份
	let items = [];
	try {
		const res = await apiGet("/api/shop/items");
		items = res && Array.isArray(res.items) ? res.items : [];
	} catch {
		items = [];
	}

	function getActiveBadge() {
		for (const r of roleArr) {
			if (r === 'admin') continue;
			if (ROLE_CONFIG[r]) return r;
		}
		return null;
	}

	function renderShop() {
		const active = getActiveBadge();
		const badges = items.filter(i => i.kind === "badge");
		const cards = items.filter(i => i.kind === "card");
		const itemsHtml = badges.map(item => {
			const owned = roleArr.includes(item.id);
			const isActive = active === item.id;
			const canRemove = owned && !['owner', 'admin', 'official'].includes(item.id);
			let btnHtml;
			if (isActive && canRemove) {
				btnHtml =
					`<button class="buyBtn equipped" data-remove="${item.id}">${t("shop_equipped")}</button>`;
			} else if (isActive) {
				btnHtml = `<button class="buyBtn equipped">${t("shop_equipped")}</button>`;
			} else if (owned) {
				btnHtml =
					`<button class="buyBtn owned" data-equip="${item.id}">${t("shop_equip")}</button>`;
			} else if (coins >= item.price) {
				btnHtml =
					`<button class="buyBtn buy" data-buy="${item.id}">${t("shop_buy")}</button>`;
			} else {
				btnHtml =
					`<button class="buyBtn owned" style="opacity:.5;">${t("coins_insufficient")}</button>`;
			}
			const cfg = ROLE_CONFIG[item.id];
			const previewHtml = cfg ?
				`<div class="preview"><span class="shopPreviewBadge roleBadge ${item.id}"></span></div>` :
				'';
			return `
								<div class="shopRow${isActive ? " active" : ""}">
									<div class="shopRowIcon">${previewHtml}</div>
									<div class="shopRowText">
										<div class="shopRowName">${t("shop_item_" + item.id)}</div>
										<div class="shopRowPrice">${item.price} ${t("profile_coins")}</div>
									</div>
									<div class="shopRowActions">${btnHtml}</div>
								</div>`;
		}).join("");

		const cardsHtml = cards.map(item => {
			const bulk = item.bulk || null;
			const bulkCount = bulk ? bulk.count : 10;
			const bulkPrice = bulk ? bulk.price : item.price * bulkCount;
			const desc = [t("shop_price_each", item.price)];
			if (bulk) desc.push(t("shop_bulk_price", bulkPrice));
			desc.push(t("rename_card_owned", cardCount));
			const btn = (n, label, cost) =>
				`<button class="buyBtn ${coins >= cost ? "buy" : "owned"}" data-buy-card="${n}"${coins >= cost ? "" : ' style="opacity:.5;"'}>${label}</button>`;
			return `
								<div class="shopRow">
									<div class="shopRowIcon"><span class="shopRowGlyph">✎</span></div>
									<div class="shopRowText">
										<div class="shopRowName">${t("shop_item_" + item.id)}</div>
										<div class="shopRowPrice">${desc.join(" · ")}</div>
									</div>
									<div class="shopRowActions">
										${btn(1, t("shop_buy_one"), item.price)}
										${btn(bulkCount, t("shop_buy_ten"), bulkPrice)}
									</div>
								</div>`;
		}).join("");

		shopDiv.innerHTML = `
							<div class="shopBox">
								<div class="shopHead">
									<div>
										<h2 class="shopTitle">${t("shop_title")}</h2>
										<div class="shopBalance">${t("shop_coins", '<b style="color:var(--green);">' + coins + '</b>')}</div>
									</div>
									<button id="shopCloseBtn" class="shopClose">${t("shop_close")}</button>
								</div>
								<div class="shopSection">
									<h3>${t("shop_badges")}</h3>
									<div class="shopGrid shopGridBadge">${itemsHtml}</div>
								</div>
								<div class="shopSection">
									<h3>${t("shop_tools")}</h3>
									<div class="shopGrid shopGridTool">${cardsHtml}</div>
								</div>
								<div class="shopSection">
									<h3>${t("shop_lottery_section")}</h3>
									<div class="shopGrid shopGridPlay">
										<div class="shopRow shopPlay" id="lotteryEntry">
											<div class="shopRowIcon"><span class="shopRowGlyph">◎</span></div>
											<div class="shopRowText">
												<div class="shopRowName">${t("shop_lottery")}</div>
												<div class="shopRowPrice">${t("shop_lottery_desc")}</div>
											</div>
											<div class="shopRowActions"><button class="buyBtn buy" id="lotteryEntryBtn">${t("shop_lottery_start")}</button></div>
										</div>
										<div class="shopRow shopPlay" id="plinkoEntry">
											<div class="shopRowIcon"><span class="shopRowGlyph">◉</span></div>
											<div class="shopRowText">
												<div class="shopRowName">${t("shop_plinko")}</div>
												<div class="shopRowPrice">${t("shop_plinko_desc")}</div>
											</div>
											<div class="shopRowActions"><button class="buyBtn buy" id="plinkoEntryBtn">${t("shop_lottery_start")}</button></div>
										</div>
									</div>
								</div>
							</div>`;

		shopDiv.querySelector("#shopCloseBtn").onclick = () => shopDiv.remove();
		shopDiv.onclick = e => {
			if (e.target === shopDiv) shopDiv.remove();
		};

		shopDiv.querySelectorAll("[data-buy]").forEach(btn => {
			btn.onclick = async () => {
				const itemId = btn.dataset.buy;
				const item = items.find(i => i.id === itemId);
				if (!item) return;
				try {
					const res = await apiPost("/api/shop/buy", { itemId });
					if (res && typeof res.coins === "number") coins = res.coins;
					if (res && Array.isArray(res.role)) roleArr = res.role;
					if (currentUser) {
						currentUser.coins = coins;
						currentUser.role = roleArr;
					}
					showCoinMsg(t("coin_sub", item.price));
				} catch (e) {
					if (e.message === "JWT_EXPIRED") return;
					showCoinMsg(t("coins_insufficient"));
				}
				renderShop();
			};
		});

		shopDiv.querySelectorAll("[data-equip]").forEach(btn => {
			btn.onclick = async () => {
				const itemId = btn.dataset.equip;
				roleArr = [itemId, ...roleArr.filter(r => r !== itemId)];
				try {
					await apiPut("/api/users/" + currentUser.id, {
						role: roleArr
					});
				} catch (e) {
					console.error(e);
				}
				if (currentUser) currentUser.role = roleArr;
				renderShop();
			};
		});

		shopDiv.querySelectorAll("[data-buy-card]").forEach(btn => {
			btn.onclick = async () => {
				const count = Number(btn.dataset.buyCard) || 1;
				try {
					const res = await apiPost("/api/shop/rename-card", { count });
					if (res && typeof res.coins === "number") coins = res.coins;
					if (res && typeof res.rename_card === "number") cardCount = res.rename_card;
					if (currentUser) {
						currentUser.coins = coins;
						if (!currentUser.inventory) currentUser.inventory = {};
						currentUser.inventory.rename_card = cardCount;
					}
					showCoinMsg(t("coin_sub", (res && res.cost) || count * 30));
				} catch (e) {
					if (e.message === "JWT_EXPIRED") return;
					showCoinMsg(t("coins_insufficient"));
				}
				renderShop();
			};
		});

		const lotteryEntry = shopDiv.querySelector("#lotteryEntry");
		if (lotteryEntry) lotteryEntry.onclick = openLottery;
		const plinkoEntry = shopDiv.querySelector("#plinkoEntry");
		if (plinkoEntry && typeof openPlinko === "function") plinkoEntry.onclick = openPlinko;

		shopDiv.querySelectorAll("[data-remove]").forEach(btn => {
			btn.onclick = async () => {
				const itemId = btn.dataset.remove;
				roleArr = roleArr.filter(r => r !== itemId);
				try {
					await apiPut("/api/users/" + currentUser.id, {
						role: roleArr
					});
				} catch (e) {
					console.error(e);
				}
				if (currentUser) currentUser.role = roleArr;
				renderShop();
			};
		});
	}

	if (!items.length) {
		modalText(t("modal_load_fail"));
		return;
	}
	$("modal").classList.add("hidden");
	renderShop();
	document.body.appendChild(shopDiv);
}

function openAvatarEditor() {
	const oldUrl = currentUser?.avatar || "";
	document.querySelector(".modalBox").style.width = "420px";
	modal(`
						<h3>` + t("avatar_title") + `</h3>
						<img id="avatarPreview" class="avatar big" src="${escapeAttr(oldUrl || DEFAULT_AVATAR)}"
							style="display:block;margin:0 auto 12px auto;">
						<input id="avatarUrlInput" placeholder="` + t("avatar_url_ph") + `" value="${escapeAttr(oldUrl)}">
						<div style="display:flex;gap:8px;margin-top:14px;">
							<button id="avatarSaveBtn">` + t("avatar_save") + `</button>
							<button id="avatarCancelBtn">` + t("avatar_cancel") + `</button>
						</div>
					`);
	const input = $("avatarUrlInput");
	const preview = $("avatarPreview");
	input.oninput = () => {
		preview.src = input.value.trim() || DEFAULT_AVATAR;
	};
	$("avatarCancelBtn").onclick = () => {
		$("modal").classList.add("hidden");
	};
	$("avatarSaveBtn").onclick = async () => {
		const url = input.value.trim();
		if (url && !/^https?:\/\//i.test(url)) {
			return modal(t("avatar_invalid"));
		}
		try {
			await apiPut("/api/users/" + currentUser.id, {
				avatar: url || null
			});
		} catch (e) {
			return modalText(t("save_fail", e.message));
		}
		currentUser.avatar = url || null;
		$("modal").classList.add("hidden");
		loadPosts(postPage);
		viewUser(currentUser.id);
	};
}
function openCardBgEditor(user) {
	const oldUrl = (user && user.card_bg) ? String(user.card_bg) : (currentUser && currentUser.card_bg ? String(currentUser.card_bg) : "");
	document.querySelector(".modalBox").style.width = "440px";
	modal(`
						<h3>` + t("card_bg_title") + `</h3>
						<div id="cardBgPreview" style="height:130px;border-radius:16px;background:#e9e9e9;background-size:cover;background-position:center;margin:0 auto 12px auto;border:1px solid var(--bg);"></div>
						<input id="cardBgUrlInput" placeholder="` + t("card_bg_url_ph") + `" value="${escapeAttr(oldUrl)}">
						<div style="display:flex;gap:8px;margin-top:14px;">
							<button id="cardBgSaveBtn">` + t("avatar_save") + `</button>
							<button id="cardBgCancelBtn">` + t("avatar_cancel") + `</button>
						</div>
					`);
	const input = $("cardBgUrlInput");
	const preview = $("cardBgPreview");
	const updatePreview = () => {
		const v = input.value.trim();
		if (v && /^https?:\/\//i.test(v)) {
			preview.style.backgroundImage = 'url("' + v.replace(/["\\]/g, "") + '")';
						} else {
							preview.style.backgroundImage = "none";
							preview.style.backgroundColor = "#e9e9e9";
						}
					};
					input.oninput = updatePreview;
					updatePreview();
					$("cardBgCancelBtn").onclick = () => {
						$("modal").classList.add("hidden");
					};
					$("cardBgSaveBtn").onclick = async () => {
						const url = input.value.trim();
						if (url && !/^https?:\/\//i.test(url)) {
							return modal(t("card_bg_invalid"));
						}
						try {
							await apiPut("/api/users/" + currentUser.id, {
								card_bg: url || null
							});
						} catch (e) {
							return modalText(t("save_fail", e.message));
						}
						currentUser.card_bg = url || null;
						$("modal").classList.add("hidden");
						viewUser(currentUser.id);
					};
				}

				function showCoinMsg(text) {
					const msg = document.getElementById("coinMsg");
					msg.textContent = text;
					msg.style.opacity = 1;
					clearTimeout(msg.hideTimeout);
					msg.hideTimeout = setTimeout(() => {
						msg.style.opacity = 0;
					}, 3000);
				}

				// 金币变动统一入口：delta 由服务端返回，前端只负责更新本地余额并弹窗
				function applyCoinDelta(delta) {
					if (!currentUser || typeof delta !== "number" || delta === 0) return;
					currentUser.coins = (currentUser.coins || 0) + delta;
					showCoinDelta(delta);
				}

				// 只弹窗、不改余额：用于服务端已返回新余额（抽奖 / 买背景）的场景
				function showCoinDelta(delta) {
					if (typeof delta !== "number" || delta === 0) return;
					showCoinMsg(delta > 0 ? t("coin_add", delta) : t("coin_sub", Math.abs(delta)));
				}

