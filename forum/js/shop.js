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

	function getActiveBadge() {
		for (const r of roleArr) {
			if (r === 'admin') continue;
			if (ROLE_CONFIG[r]) return r;
		}
		return null;
	}

	function renderShop() {
		const active = getActiveBadge();
		const badges = SHOP_ITEMS.filter(i => !i.gift);
		const gifts = SHOP_ITEMS.filter(i => i.gift);
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
					`<button class="buyBtn buy" data-buy="${item.id}">${item.price} ${t("profile_coins")}</button>`;
			} else {
				btnHtml =
					`<button class="buyBtn owned" style="opacity:.5;">${t("coins_insufficient")}</button>`;
			}
			const cfg = ROLE_CONFIG[item.id];
			const previewHtml = cfg ?
				`<div class="preview"><span class="shopPreviewBadge roleBadge ${item.id}"></span></div>` :
				'';
			return `
								<div class="shopItem">
									${previewHtml}
									<div class="info"><div class="name">${t("shop_item_"+item.id)}</div><div class="desc">${item.price} ${t("profile_coins")}</div></div>
									${btnHtml}
								</div>`;
		}).join("");
		const giftsHtml = gifts.map(item => {
			const afford = coins >= item.price;
			return `
								<div class="shopItem">
									<div class="info"><div class="name">${item.name}</div><div class="desc">${item.price} ${t("profile_coins")} · 对方收到 ${item.gift} ${t("profile_coins")}</div></div>
									${afford
						? `<button class="buyBtn buy" data-buy-gift="${item.id}">${item.price} ${t("profile_coins")}</button>`
						: `<button class="buyBtn owned" style="opacity:.5;">${t("coins_insufficient")}</button>`}
								</div>`;
		}).join("");

		shopDiv.innerHTML = `
							<div class="shopBox">
								<div class="closeRow"><button id="shopCloseBtn">${t("shop_close")}</button></div>
								<h2>${t("shop_title")}</h2>
								<div style="font-size:15px;color:var(--sub);margin-bottom:16px;">${t("shop_coins", '<b style="color:var(--green);">'+coins+'</b>')}</div>
								<div class="shopSection">
									<h3>${t("shop_badges")}</h3>
									${itemsHtml}
								</div>
								<!-- <div class="shopSection">
									<h3>礼物</h3>
									${giftsHtml}
								</div> -->
								<div class="shopSection">
									<h3>${t("shop_lottery_section")}</h3>
									<div class="lotteryEntry" id="lotteryEntry">
										<div class="lotteryEntryIcon" style="font-size:22px;">&#x25cf;</div>
										<div class="lotteryEntryInfo">
											<div class="lotteryEntryTitle">${t("shop_lottery")}</div>
											<div class="lotteryEntryDesc">${t("shop_lottery_desc")}</div>
										</div>
										<button class="lotteryEntryBtn" id="lotteryEntryBtn">${t("shop_lottery_start")}</button>
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
				const item = SHOP_ITEMS.find(i => i.id === itemId);
				if (!item || coins < item.price) return;
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

		const lotteryEntry = shopDiv.querySelector("#lotteryEntry");
		if (lotteryEntry) lotteryEntry.onclick = openLottery;

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

	$("modal").classList.add("hidden");
	renderShop();
	document.body.appendChild(shopDiv);
}

// async function openGiftPicker(item) {
// 	const users = await ensureAllUsersCache();
// 	return new Promise(resolve => {
// 		const modal = document.createElement("div");
// 		modal.id = "giftPicker";
// 		modal.innerHTML = `
// 			<div class="giftBox">
// 				<h3>选择收礼人 · ${item.name}</h3>
// 				<input class="giftSearch" id="giftSearch" placeholder="搜索用户名..." autofocus>
// 				<div class="giftUserList" id="giftUserList"></div>
// 				<div class="giftActions">
// 					<button class="giftCancel" id="giftCancel">取消</button>
// 					<button class="giftConfirm" id="giftConfirm" disabled>确认赠送</button>
// 				</div>
// 			</div>`;
// 		document.body.appendChild(modal);

// 		let selectedId = null;
// 		const list = modal.querySelector("#giftUserList");
// 		const input = modal.querySelector("#giftSearch");
// 		const confirmBtn = modal.querySelector("#giftConfirm");

// 		function renderList(q) {
// 			const ql = q.toLowerCase().trim();
// 			const matches = users.filter(u => u.id !== currentUser.id && u.name && u.name
// 				.toLowerCase().includes(ql));
// 			if (!matches.length) {
// 				list.innerHTML =
// 					'<div style="color:var(--sub);padding:12px;text-align:center;">无匹配用户</div>';
// 				return;
// 			}
// 			list.innerHTML = matches.map(u => `
// 				<div class="giftUserItem${u.id === selectedId ? ' selected' : ''}" data-uid="${u.id}">
// 					<img class="avatar" src="${getAvatar(u)}" onerror="this.onerror=null;this.src='assets/img/head.svg'">
// 					<div class="name">${u.name}</div>
// 				</div>
// 			`).join("");
// 			list.querySelectorAll(".giftUserItem").forEach(el => {
// 				el.onclick = () => {
// 					selectedId = Number(el.dataset.uid);
// 					list.querySelectorAll(".giftUserItem").forEach(x => x
// 						.classList.toggle("selected", Number(x.dataset
// 							.uid) === selectedId));
// 					confirmBtn.disabled = false;
// 				};
// 			});
// 		}

// 		input.oninput = () => renderList(input.value);
// 		if (users) renderList("");

// 		modal.querySelector("#giftCancel").onclick = () => {
// 			modal.remove();
// 			resolve(false);
// 		};
// 		modal.onclick = e => {
// 			if (e.target === modal) {
// 				modal.remove();
// 				resolve(false);
// 			}
// 		};

// 		confirmBtn.onclick = async () => {
// 			if (!selectedId) return;
// 			const recipient = users.find(u => u.id === selectedId);
// 			if (!recipient) return;
// 			try {
// 				confirmBtn.disabled = true;
// 				confirmBtn.textContent = "发送中...";
// 				const {
// 					data: cur
// 				} = await supabase.from("users").select("coins").eq("id", selectedId)
// 					.single();
// 				const curCoins = (cur?.coins || 0) + item.gift;
// 				const {
// 					error: updErr
// 				} = await supabase.from("users").update({
// 					coins: curCoins
// 				}).eq("id", selectedId);
// 				if (updErr) {
// 					showCoinMsg("赠送失败：" + updErr.message);
// 					modal.remove();
// 					resolve(false);
// 					return;
// 				}
// 				await createNotification({
// 					targetId: selectedId,
// 					actorId: currentUser.id,
// 					postId: null,
// 					type: "gift"
// 				});
// 				await refreshNotificationBadge();
// 				showCoinMsg(`送了 ${recipient.name} 一个${item.name}！`);
// 				modal.remove();
// 				resolve(true);
// 			} catch (e) {
// 				console.error("赠送失败:", e);
// 				showCoinMsg("赠送失败：" + e.message);
// 				modal.remove();
// 				resolve(false);
// 			}
// 		};
// 	});
// }

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

