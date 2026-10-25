// 富文本编辑器（contenteditable）
//
// 设计要点：
// 1. 用户看到的是 #textEditor（contenteditable），里面直接是渲染后的 DOM，
//    永远看不到 <b>、[[bg:]] 这类源码。
// 2. 隐藏的 #text（textarea）保存"序列化后的原始标记"，发帖流程
//    （auth.js 读 .value、服务端 sanitizeUserHtml）完全不用改。
// 3. 私有标记（[[bg:]] [[music:]] [img:] [poll:N]）以"不可编辑的小挂件"呈现，
//    用户点一下即选中，按删除整个移除，永远不需要看到源码。
//
// 安全：粘贴一律按纯文本处理；序列化只输出白名单标签，其余全部转义。

(function () {
	"use strict";

	const EMOJI_RE = /:([a-z0-9_]{1,32}):/gi;
	const MARKER_TOKEN_RE =
		/(\[\[[a-z]+:[^\]]*\]\]|\[img:[^\]]*\]|\[poll:[^\]]*\])/gi;

	const MARKER_CLS = "edMarker";
	const EMOJI_CLS = "edEmoji";
	const MENTION_CLS = "edMention";
	const KEEP_TAGS = { B: "b", I: "i", U: "u", H1: "h1", H2: "h2" };
	const MAX_LEN = 5000;
	const HISTORY_LIMIT = 120;
	const COALESCE_MS = 700;

	let editor = null;
	let mirror = null;
	let lock = false;
	let lastGoodRaw = "";

	// 撤销/重做：存序列化后的原始标记
	const history = [];
	let historyIndex = -1;
	let lastPushAt = 0;

	function $(id) { return document.getElementById(id); }

	/* ================= 基础工具 ================= */

	function escapeText(s) {
		return String(s)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	}

	function currentRange() {
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return null;
		const range = sel.getRangeAt(0);
		if (!editor.contains(range.commonAncestorContainer)) return null;
		return range;
	}

	function caretTextNode() {
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return null;
		const node = sel.getRangeAt(0).startContainer;
		if (node.nodeType === 3) return node;
		const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
		let last = null, n;
		while ((n = walker.nextNode())) last = n;
		return last;
	}

	/** 原子节点：表情 / 挂件，光标不应停在它们"内部"。 */
	function isAtomic(el) {
		if (!el || el.nodeType !== 1) return false;
		return el.classList.contains(EMOJI_CLS) ||
			el.classList.contains(MARKER_CLS) ||
			el.classList.contains(MENTION_CLS) ||
			el.contentEditable === "false";
	}

	function nearestBlock(node) {
		let el = node;
		while (el && el !== editor) {
			if (el.nodeType === 1 && /^(DIV|P|LI|BLOCKQUOTE)$/.test(el.tagName)) return el;
			el = el.parentNode;
		}
		return editor;
	}

	/* ================= 私有标记挂件 ================= */

	/** 从标记文本推出显示名与类型。 */
	function markerInfo(marker) {
		if (/^\[\[bg:/i.test(marker)) return { type: "bg", label: t("editor_chip_bg") };
		if (/^\[\[warn:/i.test(marker)) return { type: "warn", label: t("editor_chip_warn") };
		if (/^\[\[music:/i.test(marker)) return { type: "music", label: t("editor_chip_music") };
		if (/^\[img:/i.test(marker)) return { type: "img", label: t("editor_chip_img") };
		if (/^\[poll:/i.test(marker)) return { type: "poll", label: t("editor_chip_poll") };
		return { type: "other", label: t("editor_chip_other") };
	}

	function markerNode(marker) {
		const info = markerInfo(marker);
		const span = document.createElement("span");
		span.className = MARKER_CLS + " edChip edChip-" + info.type;
		span.dataset.marker = marker;
		span.contentEditable = "false";
		span.title = info.label + "（点选后按删除键移除）";

		const label = document.createElement("span");
		label.className = "edChipText";
		label.textContent = info.label;
		span.appendChild(label);
		return span;
	}

	function emojiNode(name) {
		const img = document.createElement("img");
		img.className = "emojiInPost " + EMOJI_CLS;
		img.dataset.emoji = name;
		img.src = "emojis/" + name + ".svg";
		img.alt = ":" + name + ":";
		img.draggable = false;
		img.contentEditable = "false";
		return img;
	}

	function mentionNode(name) {
		const span = document.createElement("span");
		span.className = "mentionLink " + MENTION_CLS;
		// 原子节点：光标不能停在 chip 内部，否则后续输入会被包进 chip
		span.contentEditable = "false";
		span.dataset.uname = name;
		span.textContent = "@" + name;
		return span;
	}

	/* ================= 序列化：DOM -> 原始标记 ================= */

	/**
	 * chip 后面紧跟的字符会不会被当成名字的一部分（名字字符集是 \p{L}\p{N}_-）。
	 * 会的话就必须补一个空格，否则 "…@张三你好" 发出去既不成提及、也发不出通知。
	 */
	function needsSeparatorAfter(el) {
		const next = el.nextSibling;
		if (!next) return false;
		if (next.nodeType === 3) return /^[\p{L}\p{N}_-]/u.test(next.nodeValue || "");
		if (next.nodeName === "BR" || next.nodeName === "IMG") return false;
		// 其它元素兄弟（如 <b>）：开头字符无法预判，保守补一个分隔
		return true;
	}

	function serializeNode(node, out) {
		if (node.nodeType === 3) {
			out.push(escapeText(node.nodeValue));
			return;
		}
		if (node.nodeType !== 1) return;
		const el = node;

		if (el.tagName === "IMG" && el.dataset.emoji) {
			out.push(":" + el.dataset.emoji + ":");
			return;
		}
		if (el.classList && el.classList.contains(MARKER_CLS)) {
			out.push(el.dataset.marker || "");
			return;
		}
		if (el.classList && el.classList.contains(MENTION_CLS)) {
			out.push("@" + (el.dataset.uname || el.textContent.replace(/^[@＠]/, "")));
			if (needsSeparatorAfter(el)) out.push(" ");
			return;
		}
		if (el.tagName === "BR") { out.push("\n"); return; }
		if (el.tagName === "DIV" || el.tagName === "P") {
			if (out.length && !out[out.length - 1].endsWith("\n")) out.push("\n");
			serializeChildren(el, out);
			return;
		}
		const tag = KEEP_TAGS[el.tagName];
		if (tag) {
			out.push("<" + tag + ">");
			serializeChildren(el, out);
			out.push("</" + tag + ">");
			return;
		}
		serializeChildren(el, out);
	}

	function serializeChildren(el, out) {
		for (const child of Array.from(el.childNodes)) serializeNode(child, out);
	}

	function serialize() {
		if (!editor) return "";
		const out = [];
		serializeChildren(editor, out);
		return out.join("");
	}

	/* ================= 反序列化：原始标记 -> DOM ================= */

	function rawToSafeHtml(raw) {
		if (typeof sanitizePostHtml === "function") return sanitizePostHtml(raw);
		return escapeText(raw);
	}

	/** 把一段文本塞进父节点：私有标记 / 表情转成对应可视图元。 */
	function appendSegment(parent, text) {
		let last = 0, m;
		MARKER_TOKEN_RE.lastIndex = 0;
		while ((m = MARKER_TOKEN_RE.exec(text)) !== null) {
			if (m.index > last) appendPlain(parent, text.slice(last, m.index));
			parent.appendChild(markerNode(m[0]));
			last = m.index + m[0].length;
		}
		if (last < text.length) appendPlain(parent, text.slice(last));
	}

	/** 纯文本 -> 表情图元 + 文本。 */
	function appendPlain(parent, text) {
		let rest = text;
		let buf = "";
		let mm;
		EMOJI_RE.lastIndex = 0;
		while ((mm = EMOJI_RE.exec(rest)) !== null) {
			buf += rest.slice(0, mm.index);
			parent.appendChild(document.createTextNode(buf));
			buf = "";
			parent.appendChild(emojiNode(mm[1].toLowerCase()));
		}
		buf += rest.slice(EMOJI_RE.lastIndex);
		if (buf) parent.appendChild(document.createTextNode(buf));
	}

	/** 递归转换节点：保留白名单标签，表情/提及/标记转成可视图元。 */
	function convertInto(parent, node) {
		if (node.nodeType === 3) { appendSegment(parent, node.nodeValue); return; }
		if (node.nodeType !== 1) return;
		const el = node;

		if (el.tagName === "IMG") {
			const mm = /^:([a-z0-9_]+):$/i.exec(el.getAttribute("alt") || "");
			if (mm) parent.appendChild(emojiNode(mm[1].toLowerCase()));
			return;
		}
		if (el.classList.contains(MENTION_CLS)) {
			parent.appendChild(mentionNode(el.dataset.uname || el.textContent.replace(/^[@＠]/, "")));
			return;
		}
		if (el.tagName === "BR") { parent.appendChild(document.createElement("br")); return; }
		const tag = KEEP_TAGS[el.tagName];
		if (tag) {
			const clone = document.createElement(tag);
			for (const c of Array.from(el.childNodes)) convertInto(clone, c);
			parent.appendChild(clone);
			return;
		}
		for (const c of Array.from(el.childNodes)) convertInto(parent, c);
	}

	/** 原始标记 -> 编辑器 DOM（整体重绘，仅在载入/撤销/回滚时调用）。 */
	function loadRaw(raw, keepHistory) {
		if (!editor) return;
		lock = true;
		editor.innerHTML = "";
		if (raw) {
			const tmp = document.createElement("div");
			tmp.innerHTML = rawToSafeHtml(raw);
			for (const node of Array.from(tmp.childNodes)) {
				if (node.nodeType === 1 && /^(DIV|P)$/.test(node.tagName)) {
					for (const c of Array.from(node.childNodes)) convertInto(editor, c);
					editor.appendChild(document.createElement("br"));
				} else {
					convertInto(editor, node);
				}
			}
		}
		mirror.value = raw || "";
		lastGoodRaw = raw || "";
		if (!keepHistory) {
			history.length = 0;
			history.push(raw || "");
			historyIndex = 0;
		}
		lock = false;
		updateUndoRedo();
	}

	/* ================= 撤销 / 重做 ================= */

	function pushHistory(raw, structural) {
		const now = Date.now();
		if (historyIndex >= 0 && history[historyIndex] === raw) return;
		// 只在"连续打字"时合并相邻步骤；
		// 插入挂件/表情/格式化属于结构性操作，每步都必须独立，
		// 否则撤销一次会把两个挂件一起抹掉。
		if (!structural && now - lastPushAt < COALESCE_MS && historyIndex > 0) {
			history[historyIndex] = raw;
		} else {
			history.splice(historyIndex + 1);
			history.push(raw);
			if (history.length > HISTORY_LIMIT) history.shift();
			historyIndex = history.length - 1;
		}
		lastPushAt = now;
		updateUndoRedo();
	}

	function updateUndoRedo() {
		const u = $("undoBtn"), r = $("redoBtn");
		if (u) u.disabled = historyIndex <= 0;
		if (r) r.disabled = historyIndex >= history.length - 1;
	}

	function undo() {
		if (historyIndex <= 0) return;
		historyIndex--;
		loadRaw(history[historyIndex], true);
		placeCaretEnd();
	}

	function redo() {
		if (historyIndex >= history.length - 1) return;
		historyIndex++;
		loadRaw(history[historyIndex], true);
		placeCaretEnd();
	}

	function placeCaretEnd() {
		editor.focus();
		const r = document.createRange();
		r.selectNodeContents(editor);
		r.collapse(false);
		const sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(r);
	}

	/* ================= 插入 API ================= */

	/**
	 * 聚焦编辑器但保住当前选区。
	 * 直接 focus() 可能把折叠的选区重置掉，导致后续"包裹选区"全部失效。
	 */
	function focusKeepSelection() {
		const before = currentRange();
		editor.focus();
		if (before) {
			const sel = window.getSelection();
			const clone = before.cloneRange();
			sel.removeAllRanges();
			sel.addRange(clone);
		}
		return currentRange();
	}

	function insertAtCaret(node) {
		let range = focusKeepSelection();
		if (!range) {
			range = document.createRange();
			range.selectNodeContents(editor);
			range.collapse(false);
		}
		range.deleteContents();
		range.insertNode(node);
		range.setStartAfter(node);
		range.collapse(true);
		const sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
		commit(true);
	}

	function insertMarker(marker) { insertAtCaret(markerNode(marker)); }
	function insertEmoji(name) { insertAtCaret(emojiNode(name)); }

	/** 变更提交：同步镜像 + 记历史。structural=true 表示结构性操作，独立成一步。 */
	function commit(structural) {
		const raw = serialize();
		if (raw.length > MAX_LEN) {
			loadRaw(lastGoodRaw, true);
			return;
		}
		lastGoodRaw = raw;
		lock = true;
		mirror.value = raw;
		lock = false;
		pushHistory(raw, !!structural);
	}

	/* ================= 格式化 =================
	 *
	 * 排版规则：
	 *  · H1 / H2 / B 三者互斥，同一段文字最多只能有其中一个；
	 *  · H1、H2 不能与 B/I/U 中任何一个共存 —— 点标题就把选区里
	 *    所有其它格式清干净，再套上标题；
	 *  · 纯 B/I/U 之间可以自由叠加（<b><i><u> 完全合法）。
	 */
	const STRIP_RULES = {
		h1: ["H1", "H2", "B", "I", "U"],
		h2: ["H1", "H2", "B", "I", "U"],
		b: ["H1", "H2", "B"],
		i: ["I"],
		u: ["U"],
	};

	/** 把 root 下所有指定标签拆掉（保留文字与其它标签）。 */
	function stripTags(root, names) {
		const set = {};
		names.forEach((n) => { set[n] = true; });
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
		const found = [];
		let n;
		while ((n = walker.nextNode())) {
			if (set[n.nodeName]) found.push(n);
		}
		// 按文档顺序（外层在前）逐个拆；外层被拆后内层仍挂在树上，可继续处理
		for (const el of found) {
			if (!el.parentNode) continue;
			while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
			el.parentNode.removeChild(el);
		}
	}

	/**
	 * 找"完整包住选区"且属于待清除集合的最近祖先。
	 * 这类祖先必须整块摘掉，而不是只取它的内容 ——
	 * 只取内容的话标签本身还留在文档里，会变成 <h2><h2>x</h2></h2>。
	 */
	function findStripAncestor(range, names) {
		const set = {};
		names.forEach((n) => { set[n] = true; });
		let el = range.startContainer;
		if (el && el.nodeType === 3) el = el.parentNode;
		while (el && el !== editor) {
			if (el.nodeType === 1 && set[el.tagName] && el.contains(range.endContainer)) {
				return el;
			}
			el = el.parentNode;
		}
		return null;
	}

	/** 片段里是否出现过该标签。 */
	function containsTag(root, nodeName) {
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
		let n;
		while ((n = walker.nextNode())) {
			if (n.nodeName === nodeName) return true;
		}
		return false;
	}

	function wrapFormat(tag) {
		if (!editor) return;
		// 必须用 focusKeepSelection：裸 focus() 会折叠选区，
		// 导致下面 focused.collapsed 判定失败、格式化完全没有反应。
		const focused = focusKeepSelection();
		if (!focused || focused.collapsed) return;
		const sel = window.getSelection();
		const U = tag.toUpperCase();
		// 注意：STRIP_RULES 用小写键，查表必须用小写，
		// 否则永远取不到规则、退化成"只清除自己"，互斥就失效了。
		const stripList = STRIP_RULES[tag.toLowerCase()] || [U];

		// 选区正好落在某个互斥标签内部（如 <h2> 里的文字）时，
		// 整个祖先都要参与互斥处理，用占位符把原位置记下来。
		const anc = findStripAncestor(focused, stripList);
		let frag, anchor;
		if (anc) {
			anchor = document.createElement("span");
			anc.replaceWith(anchor);
			frag = document.createDocumentFragment();
			while (anc.firstChild) frag.appendChild(anc.firstChild);
		} else {
			frag = focused.extractContents();
		}

		// 切换语义：片段里本来就有这个格式 -> 当作"取消应用"。
		// 被摘掉的祖先本身也要算 —— 它正是原格式的载体，
		// 漏掉它会让 <h2> 里再点 h2 变成"又套一层"。
		const hadTag = (!!anc && anc.nodeName === U) || containsTag(frag, U);

		// 清掉互斥/冲突的格式
		stripTags(frag, stripList);

		// 原本没有才套上新的
		let out = frag;
		if (!hadTag) {
			const wrap = document.createElement(tag.toLowerCase());
			wrap.appendChild(frag);
			out = wrap;
		}

		if (anchor) {
			anchor.replaceWith(out);
			selectNodeContentsOf(out, sel);
		} else {
			focused.insertNode(out);
			selectNodeContentsOf(out, sel);
		}
		commit(true);
	}

	function selectNodeContentsOf(node, sel) {
		const r = document.createRange();
		r.selectNodeContents(node);
		sel.removeAllRanges();
		sel.addRange(r);
	}

/* ================= 实时转换 ================= */

	function convertMentionAtCaret() {
		const node = caretTextNode();
		if (!node) return;
		// 光标已经落在某个提及 chip 内部时直接放弃：再套一层会把后续输入包进里层 chip，
		// 序列化只输出 @名字，chip 里的正文就被整段吞掉
		if (node.parentElement && node.parentElement.closest("." + MENTION_CLS)) return;
		const upto = node.nodeValue || "";
		// 与渲染/通知同一套规则：@ 前面不需要空格，全角 ＠ 与半角等价
		const m = /[@＠]([\p{L}\p{N}_-]{1,32})[\s]$/u.exec(upto);
		if (!m) return;
		const sel = window.getSelection();
		const r = document.createRange();
		try {
			r.setStart(node, m.index);
			r.setEnd(node, m.index + m[0].length);
		} catch (e) { return; }
		r.deleteContents();
		const node2 = mentionNode(m[1]);
		r.insertNode(node2);
		// 空格补在 chip 外面并落光标，避免后面输入的字黏进 chip
		const space = document.createTextNode(" ");
		node2.parentNode.insertBefore(space, node2.nextSibling);
		r.setStart(space, 1);
		r.collapse(true);
		sel.removeAllRanges();
		sel.addRange(r);
	}

	function convertEmojiAtCaret() {
		const node = caretTextNode();
		if (!node) return;
		const v = node.nodeValue || "";
		const m = /:([a-z0-9_]{1,32}):$/i.exec(v);
		if (!m) return;
		const sel = window.getSelection();
		const r = document.createRange();
		r.setStart(node, m.index);
		r.setEnd(node, m.index + m[0].length);
		r.deleteContents();
		const node2 = emojiNode(m[1].toLowerCase());
		r.insertNode(node2);
		r.setStartAfter(node2);
		sel.removeAllRanges();
		sel.addRange(r);
	}

	/* ================= 键盘 ================= */

	/**
	 * 表情/挂件是原子节点，浏览器默认把左右键当成"进到节点里再出来"，
	 * 导致要按两次才能跳过一个。这里自己接管，贴着原子节点时一步跨过。
	 */
	function handleAtomicNav(e, dir) {
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return false;
		const range = sel.getRangeAt(0);
		if (!range.collapsed) return false;   // 有选区就让默认行为处理
		const node = range.startContainer;
		const block = nearestBlock(node);

		if (node.nodeType === 3) {
			const off = range.startOffset;
			// 光标在文本节点开头，且前一个兄弟是原子 -> 跨到它前面
			if (dir < 0 && off === 0) {
				const prev = node.previousSibling;
				if (prev && isAtomic(prev)) {
					const r = document.createRange();
					r.setStartBefore(prev);
					r.collapse(true);
					sel.removeAllRanges();
					sel.addRange(r);
					e.preventDefault();
					return true;
				}
			}
			// 光标在文本节点开头，且前一个字是原子节点的尾巴 -> 跨到它前面
			if (dir < 0 && off === 0 && !node.previousSibling) {
				const prevEl = block.previousSibling;
				if (prevEl && isAtomic(prevEl)) {
					const r = document.createRange();
					r.setStartBefore(prevEl);
					r.collapse(true);
					sel.removeAllRanges();
					sel.addRange(r);
					e.preventDefault();
					return true;
				}
			}
			// 光标在结尾且后一个兄弟是原子 -> 跨到它后面
			if (dir > 0 && off === node.nodeValue.length) {
				const next = node.nextSibling;
				if (next && isAtomic(next)) {
					const r = document.createRange();
					r.setStartAfter(next);
					r.collapse(true);
					sel.removeAllRanges();
					sel.addRange(r);
					e.preventDefault();
					return true;
				}
			}
		} else if (node === block) {
			// 光标停在块级容器里，紧贴原子兄弟的情况
			const idx = Array.from(block.childNodes).indexOf(
				range.startContainer === block ? block.childNodes[range.startOffset - 1] : null);
			if (dir < 0 && idx >= 0) {
				const prev = block.childNodes[idx];
				if (isAtomic(prev)) {
					const r = document.createRange();
					r.setStart(block, Array.from(block.childNodes).indexOf(prev));
					r.collapse(true);
					sel.removeAllRanges();
					sel.addRange(r);
					e.preventDefault();
					return true;
				}
			}
			if (dir > 0) {
				const at = range.startOffset;
				const next = block.childNodes[at];
				if (next && isAtomic(next)) {
					const r = document.createRange();
					r.setStart(block, at + 1);
					r.collapse(true);
					sel.removeAllRanges();
					sel.addRange(r);
					e.preventDefault();
					return true;
				}
			}
		}
		return false;
	}

	function onKeyDown(e) {
		if ((e.ctrlKey || e.metaKey) && !e.altKey) {
			const k = e.key.toLowerCase();
			if (k === "z" && !e.shiftKey) { e.preventDefault(); undo(); return; }
			if (k === "y" || (k === "z" && e.shiftKey)) { e.preventDefault(); redo(); return; }
		}

		if (e.key === "ArrowLeft" && handleAtomicNav(e, -1)) return;
		if (e.key === "ArrowRight" && handleAtomicNav(e, 1)) return;

		if (e.key === "Enter" && !e.isComposing) {
			e.preventDefault();
			editor.focus();
			// 交给浏览器原生插入换行并管理光标，比手工算 range 稳得多
			if (!document.execCommand("insertLineBreak")) {
				const range = currentRange();
				if (range) {
					range.deleteContents();
					range.insertNode(document.createElement("br"));
				}
			}
			commit();
		}
	}

	function onInput() {
		if (lock) return;
		// 转换函数自己会摆好光标，之后不要再动选区
		convertMentionAtCaret();
		convertEmojiAtCaret();
		commit();
	}

	function onPaste(e) {
		e.preventDefault();
		const text = (e.clipboardData || window.clipboardData).getData("text/plain");
		if (!text) return;
		document.execCommand("insertText", false, text);
	}

	/** 点击挂件 -> 选中它，这样按删除键就是整个删掉。 */
	function onClick(e) {
		const chip = e.target.closest("." + MARKER_CLS);
		if (!chip) return;
		e.preventDefault();
		const sel = window.getSelection();
		const r = document.createRange();
		// 显式包住整个节点：selectNode 在部分环境表现不一致
		r.setStartBefore(chip);
		r.setEndAfter(chip);
		sel.removeAllRanges();
		sel.addRange(r);
		const prev = editor.querySelector("." + MARKER_CLS + ".edChipSelected");
		if (prev) prev.classList.remove("edChipSelected");
		chip.classList.add("edChipSelected");
	}

	function onEditorBlur(e) {
		const chip = e.target.closest("." + MARKER_CLS);
		if (chip) chip.classList.remove("edChipSelected");
	}

	/* ================= 初始化 ================= */

	function init() {
		editor = $("textEditor");
		mirror = $("text");
		if (!editor || !mirror) return;

		editor.addEventListener("input", onInput);
		editor.addEventListener("keydown", onKeyDown);
		editor.addEventListener("paste", onPaste);
		editor.addEventListener("drop", (e) => e.preventDefault());
		editor.addEventListener("click", onClick);
		editor.addEventListener("mouseup", onEditorBlur);

		window.richEditor = {
			insertMarker,
			insertEmoji,
			wrapFormat,
			serialize,
			undo,
			redo,
			loadRaw,
			clear() {
				loadRaw("");
				placeCaretEnd();
			},
			getEl: () => editor,
			getRange: currentRange
		};
		window.clearRichEditor = () => window.richEditor.clear();

		// 格式化按钮
		const bar = $("formatBar");
		if (bar) {
			bar.addEventListener("mousedown", (e) => {
				if (e.target.closest("button[data-fmt]")) e.preventDefault();
			});
			bar.addEventListener("click", (e) => {
				const btn = e.target.closest("button[data-fmt]");
				if (!btn) return;
				e.preventDefault();
				wrapFormat(btn.dataset.fmt);
			});
		}
		const ub = $("undoBtn"), rb = $("redoBtn");
		if (ub) ub.onclick = () => { undo(); };
		if (rb) rb.onclick = () => { redo(); };

		loadRaw("");
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();