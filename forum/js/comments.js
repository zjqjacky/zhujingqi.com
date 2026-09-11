function parseCommentContent(content) {
	const match = String(content || "").match(/^\[reply:(\d+)\]\s*/);
	if (match) {
		return {
			parentId: parseInt(match[1]),
			text: content.slice(match[0].length)
		};
	}
	return {
		parentId: null,
		text: content || ""
	};
}

function buildCommentTree(comments) {
	const map = {};
	for (const c of comments) {
		const parsed = parseCommentContent(c.content || "");
		c._parentId = parsed.parentId;
		c._text = parsed.text;
		c._children = [];
		map[c.id] = c;
	}
	for (const c of comments) {
		if (c._parentId && map[c._parentId]) {
			c._replyToName = getDisplayName(map[c._parentId].users) || null;
		}
	}
	const roots = [];
	for (const c of comments) {
		if (c._parentId && map[c._parentId]) {
			map[c._parentId]._children.push(c);
		} else {
			roots.push(c);
		}
	}
	roots.sort((a, b) => new Date(a.time) - new Date(b.time));
	for (const c of comments) {
		c._children.sort((a, b) => new Date(a.time) - new Date(b.time));
	}
	return roots;
}
async function renderComments(postId, container, comments, postAuthorId) {
	container.innerHTML = "";
	if (!comments) {
		try {
			comments = await apiGet("/api/comments/" + postId);
		} catch {
			comments = [];
		}
	}
	const tree = buildCommentTree(comments);
	const indent = window.innerWidth <= 800 ? 12 : 24;
	if (postAuthorId === undefined) postAuthorId = Number(container.closest(".post")?.dataset.authorId) || null;
	async function renderTree(parentEl, list, depth) {
		for (const c of list) {
			const div = document.createElement("div");
			div.className = "comment";
			div.style.paddingLeft = (Math.min(depth, 2) * indent) + "px";
			const avatar = getAvatar(c.users);
			const delBtn = currentUser && c.author === currentUser.id ?
				`<button class="commentDel" data-cdel="${c.id}">${t("post_delete")}</button>` :
				"";
			div.innerHTML =
				`<span class="userLink userLinkWithAvatar" data-user="${c.author}">
									<img class="avatar" src="${avatar}" onerror="this.onerror=null;this.src='assets/img/head.svg'">
									<b>${escapeHtml(getDisplayName(c.users))}</b>
									<span class="userLevel">${getUserLevel(c.users?.coins || 0)}</span>
								${getRoleBadge(c.users)}
								${c.author === postAuthorId ? '<span class="authorTag op">' + t("badge_op") + '</span>' : ""}
							</span>: <span class="commentContent"></span>
								<span class="commentActions">
									<span class="replyBtn" data-reply-to="${c.id}">${t("reply")}</span>
									${delBtn}
								</span>
								<div class="commentChildren" data-children-of="${c.id}" style="width:100%"></div>`;
			const contentEl = div.querySelector(".commentContent");
			contentEl.textContent = c._text || "";
			parentEl.appendChild(div);
			linkifyMentions(div);
			renderEmojis(div);
			linkifyUrls(div);
			const userLink = div.querySelector(".userLink");
			if (userLink) {
				userLink.onclick = () => viewUser(c.author);
			}
			const del = div.querySelector("[data-cdel]");
			if (del && currentUser) {
				del.onclick = async () => {
					const idsToDelete = [];
					const collect = (node) => {
						idsToDelete.push(node.id);
						for (const ch of (node._children || [])) collect(ch);
					};
					collect(c);
					for (const id of idsToDelete) {
						try {
							await apiDelete("/api/comments/" + id);
						} catch (e) {
							console.error(e);
						}
					}
					renderComments(postId, container);
					await changeCoins(currentUser.id, -3);
				};
			}
			const replyBtn = div.querySelector(".replyBtn");
			replyBtn.onclick = (e) => {
				e.stopPropagation();
				const existing = div.querySelector(".replyInputWrap");
				if (existing) {
					existing.remove();
					return;
				}
				const w = document.createElement("div");
				w.className = "replyInputWrap";
				const placeholder = c.users?.name ? t("reply_ph", escapeHtml(getDisplayName(c.users))) : t("reply");
				w.innerHTML =
					`<input data-input="reply-${c.id}" data-mention-input="1" placeholder="${placeholder}">
									<button class="emojiBtn" data-emoji-target="reply-${c.id}" type="button" title="表情">
										<img src="emojis/happy.svg" style="width:16px;height:16px;display:block;pointer-events:none;">
									</button>
									<button class="replySendBtn" data-reply-send="${c.id}">${t("post_send")}</button>`;
				const childrenContainer = div.querySelector(".commentChildren");
				div.insertBefore(w, childrenContainer);
				const inp = w.querySelector("input");
				inp.focus();
				const send = () => {
					const text = inp.value.trim();
					if (text) addReply(postId, c.id, text, postAuthorId, c.author);
				};
				w.querySelector(".replySendBtn").onclick = send;
				inp.addEventListener("keydown", e => e.key === "Enter" && send());
			};
			if (c._children.length > 0) {
				if (depth < 2) {
					const childContainer = div.querySelector(".commentChildren");
					await renderTree(childContainer, c._children, depth + 1);
				} else {
					await renderTree(parentEl, c._children, depth);
				}
			}
		}
	}
	await renderTree(container, tree, 0);
}
async function openVotePeople(postId, kind) {
	let data;
	try {
		data = await apiGet("/api/likes/" + postId);
	} catch (e) {
		modal(t("read_fail", e.message));
		return;
	}
	const rows = (data || []).filter(x => x.type === (kind === "like" ? 1 : -1));
	document.querySelector(".modalBox").style.width = "360px";
	modal(`
											<h3>${kind === "like" ? t("vote_who_like") : t("vote_who_dislike")}</h3>
											<div style="max-height:320px;overflow:auto;text-align:left;">
												${
									rows.length
										? rows.map(x => `
															<div class="onlineUser voteUser" data-user="${x.users?.id}">
																<img class="avatar onlineAvatar" src="${getAvatar(x.users)}" onerror="this.onerror=null;this.src='assets/img/head.svg'">
																<span>${escapeHtml(getDisplayName(x.users))}</span>
																<span class="userLevel">${getUserLevel(x.users?.coins || 0)}</span>
																${getRoleBadge(x.users)}
															</div>
														`).join("")
										: `<div style="color:var(--sub);padding:8px 0;">${t("vote_none")}</div>`
								}
											</div>
										`);
	setTimeout(() => {
		document.querySelectorAll(".voteUser").forEach(el => {
			el.onclick = () => {
				$("modal").classList.add("hidden");
				viewUser(Number(el.dataset.user));
			};
		});
	}, 0);
}
async function addComment(postId, content, postAuthorId) {
	const text = String(content || "").trim();
	if (!text) return;
	try {
		const result = await apiPost("/api/comments", {
			postid: postId,
			content: sanitizePostHtml(text),
			author: currentUser.id,
			time: new Date().toISOString()
		});
		const commentId = result?.id || null;
		await notifyMentions(text, postId, commentId);
		await createNotification({
			targetId: postAuthorId,
			actorId: currentUser.id,
			postId: postId,
			commentId: commentId,
			type: "comment"
		});
		const postDiv = $("singlePost")?.querySelector(`.post[data-post-id="${postId}"]`) || document
			.querySelector(`.post[data-post-id="${postId}"]`);
		if (postDiv) {
			const input = postDiv.querySelector("[data-input]");
			if (input) {
				input.value = "";
				input.blur();
			}
			const list = postDiv.querySelector(".commentList");
			if (list) await renderComments(postId, list, undefined, postAuthorId);
		}
		await changeCoins(currentUser.id, 3);
		await refreshNotificationBadge();
		await loadStats();
	} catch (e) {
		if (e.message === "JWT_EXPIRED") return;
		console.error(e);
		modal(t("comment_fail", e.message));
	}
}
async function addReply(postId, parentId, content, postAuthorId, parentAuthorId) {
	const text = String(content || "").trim();
	if (!text) return;
	const replyContent = `[reply:${parentId}] ${sanitizePostHtml(text)}`;
	try {
		const result = await apiPost("/api/comments", {
			postid: postId,
			content: replyContent,
			author: currentUser.id,
			time: new Date().toISOString()
		});
		const commentId = result?.id || null;
		await notifyMentions(text, postId, commentId);
		await createNotification({
			targetId: postAuthorId,
			actorId: currentUser.id,
			postId: postId,
			commentId: commentId,
			type: "comment"
		});
		if (parentAuthorId && parentAuthorId !== postAuthorId) {
			await createNotification({
				targetId: parentAuthorId,
				actorId: currentUser.id,
				postId: postId,
				commentId: commentId,
				type: "reply"
			});
		}
		const postDiv = $("singlePost")?.querySelector(`.post[data-post-id="${postId}"]`) || document
			.querySelector(`.post[data-post-id="${postId}"]`);
		if (postDiv) {
			const list = postDiv.querySelector(".commentList");
			if (list) await renderComments(postId, list, undefined, postAuthorId);
		}
		await changeCoins(currentUser.id, 3);
		await refreshNotificationBadge();
		await loadStats();
	} catch (e) {
		if (e.message === "JWT_EXPIRED") return;
		console.error(e);
		modal(t("comment_fail", e.message));
	}
}
async function likePost(id, postDiv) {
	const likeBtn = postDiv.querySelector(".like");
	const dislikeBtn = postDiv.querySelector(".dislike");
	const likeNumEl = likeBtn.querySelector(".voteNum");
	const dislikeNumEl = dislikeBtn.querySelector(".voteNum");
	let likeCount = parseInt(likeNumEl.textContent) || 0;
	let dislikeCount = parseInt(dislikeNumEl.textContent) || 0;
	const hasLike = likeBtn.classList.contains("liked");
	const hasDislike = dislikeBtn.classList.contains("disliked");
	const prevLikeCount = likeCount;
	const prevDislikeCount = dislikeCount;
	const prevLiked = hasLike;
	const prevDisliked = hasDislike;
	if (hasLike) {
		likeCount = Math.max(0, likeCount - 1);
		likeBtn.classList.remove("liked");
	} else {
		likeCount += 1;
		likeBtn.classList.add("liked");
		if (hasDislike) {
			dislikeCount = Math.max(0, dislikeCount - 1);
			dislikeBtn.classList.remove("disliked");
		}
	}
	likeNumEl.textContent = likeCount;
	dislikeNumEl.textContent = dislikeCount;
	try {
		await apiPost("/api/likes/toggle", {
			postid: id,
			liker: currentUser.id,
			type: hasLike ? 0 : 1
		});
		if (postDiv.dataset.authorId != currentUser.id) changeCoins(currentUser.id, hasLike ? -1 : (
			hasDislike ? 2 : 1));
	} catch (e) {
		console.error(e);
		likeNumEl.textContent = prevLikeCount;
		dislikeNumEl.textContent = prevDislikeCount;
		likeBtn.classList.toggle("liked", prevLiked);
		dislikeBtn.classList.toggle("disliked", prevDisliked);
		showCoinMsg(t("like_fail"));
	}
}
async function dislikePost(id, postDiv) {
	const likeBtn = postDiv.querySelector(".like");
	const dislikeBtn = postDiv.querySelector(".dislike");
	const likeNumEl = likeBtn.querySelector(".voteNum");
	const dislikeNumEl = dislikeBtn.querySelector(".voteNum");
	let likeCount = parseInt(likeNumEl.textContent) || 0;
	let dislikeCount = parseInt(dislikeNumEl.textContent) || 0;
	const hasLike = likeBtn.classList.contains("liked");
	const hasDislike = dislikeBtn.classList.contains("disliked");
	const prevLikeCount = likeCount;
	const prevDislikeCount = dislikeCount;
	const prevLiked = hasLike;
	const prevDisliked = hasDislike;
	if (hasDislike) {
		dislikeCount = Math.max(0, dislikeCount - 1);
		dislikeBtn.classList.remove("disliked");
	} else {
		dislikeCount += 1;
		dislikeBtn.classList.add("disliked");
		if (hasLike) {
			likeCount = Math.max(0, likeCount - 1);
			likeBtn.classList.remove("liked");
		}
	}
	likeNumEl.textContent = likeCount;
	dislikeNumEl.textContent = dislikeCount;
	try {
		await apiPost("/api/likes/toggle", {
			postid: id,
			liker: currentUser.id,
			type: hasDislike ? 0 : -1
		});
		if (postDiv.dataset.authorId != currentUser.id) changeCoins(currentUser.id, hasDislike ? 1 :
			(hasLike ? -2 : -1));
	} catch (e) {
		console.error(e);
		likeNumEl.textContent = prevLikeCount;
		dislikeNumEl.textContent = prevDislikeCount;
		likeBtn.classList.toggle("liked", prevLiked);
		dislikeBtn.classList.toggle("disliked", prevDisliked);
		showCoinMsg(t("dislike_fail"));
	}
}
async function deletePost(id) {
	modal(`
						<strong>${t("modal_confirm_delete")}</strong><br>
						<span style="font-size:14px;color:var(--sub);">${t("modal_irreversible")}</span>
						<div style="margin-top:16px;display:flex;gap:10px;justify-content:center;">
							<button id="confirmDeleteBtn" style="background:#f66;color:#fff;">${t("modal_confirm_btn")}</button>
						</div>
					`);
	$("confirmDeleteBtn").onclick = async () => {
		$("closeModal").click();
		try {
			await apiDelete("/api/posts/" + id, {
				userId: currentUser.id,
				isAdmin: isAdmin(currentUser)
			});
		} catch (e) {
			console.error(e);
		}
		loadStats();
		loadPosts(postPage);
	};
}

