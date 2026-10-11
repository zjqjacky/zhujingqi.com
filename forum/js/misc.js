let viewerScale = 1;
// 平移偏移（屏幕像素）。transform 里 translate 在 scale 之前，
// 所以位移不会被缩放放大，拖动手感与缩放倍数无关。
let viewerX = 0;
let viewerY = 0;
// 本次按下->抬起之间是否真的拖动过：用来区分"点击关闭"和"拖完别关"
let viewerDidDrag = false;
let viewerDragging = false;

function viewerApply() {
	$("viewerImg").style.transform =
		`translate(${viewerX}px, ${viewerY}px) scale(${viewerScale})`;
}

/** 别让图片被拖到完全找不回来的地方：按当前缩放后的尺寸夹一次。 */
function viewerClamp() {
	const viewer = $("viewer");
	const img = $("viewerImg");
	// offsetWidth/Height 是布局尺寸，不受 transform 影响，可以直接拿来算
	const limX = Math.max(0, (img.offsetWidth * viewerScale - viewer.clientWidth) / 2);
	const limY = Math.max(0, (img.offsetHeight * viewerScale - viewer.clientHeight) / 2);
	viewerX = Math.max(-limX, Math.min(limX, viewerX));
	viewerY = Math.max(-limY, Math.min(limY, viewerY));
}

function openViewer(src) {
	const viewer = $("viewer");
	const viewerImg = $("viewerImg");
	viewerImg.src = src;
	viewer.style.display = "flex";
	viewerScale = 1;
	viewerX = 0;
	viewerY = 0;
	viewerDidDrag = false;
	// 禁掉原生拖拽，否则浏览器会拖出一个半透明幽灵图、pointermove 直接断掉
	viewerImg.draggable = false;
	viewerApply();

	viewerImg.onwheel = e => {
		e.preventDefault();
		if (e.deltaY < 0) {
			viewerScale *= 1.1;
		} else {
			viewerScale /= 1.1;
		}
		viewerScale = Math.max(
			0.2,
			Math.min(8, viewerScale)
		);
		viewerClamp();
		viewerApply();
	};
	viewerImg.ondblclick = () => {
		viewerScale = viewerScale === 1 ? 2 : 1;
		// 缩回 1 倍时顺手归位，避免留在偏移位置
		if (viewerScale === 1) {
			viewerX = 0;
			viewerY = 0;
		}
		viewerApply();
	};

	// ---- 拖动平移 ----
	let startX = 0;
	let startY = 0;
	let baseX = 0;
	let baseY = 0;

	viewerImg.onpointerdown = e => {
		// 只响应主键；右键/中键交给浏览器
		if (e.button !== 0) return;
		viewerDragging = true;
		viewerDidDrag = false;
		startX = e.clientX;
		startY = e.clientY;
		baseX = viewerX;
		baseY = viewerY;
		viewerImg.classList.add("dragging");
		try {
			viewerImg.setPointerCapture(e.pointerId);
		} catch (err) {
			// 某些环境不支持指针捕获，忽略即可，move 仍绑在元素上
		}
		e.preventDefault();
	};

	viewerImg.onpointermove = e => {
		if (!viewerDragging) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		// 阈值内当作"点击"，否则手指轻微抖动会把灯箱拖歪又不算拖动
		if (!viewerDidDrag && Math.abs(dx) + Math.abs(dy) < 4) return;
		viewerDidDrag = true;
		viewerX = baseX + dx;
		viewerY = baseY + dy;
		viewerClamp();
		viewerApply();
	};

	const endDrag = e => {
		if (!viewerDragging) return;
		viewerDragging = false;
		viewerImg.classList.remove("dragging");
		try {
			viewerImg.releasePointerCapture(e.pointerId);
		} catch (err) {
			// 同上
		}
	};
	viewerImg.onpointerup = endDrag;
	viewerImg.onpointercancel = endDrag;
}
window.closeViewer = function() {
	// 刚拖完松手时浏览器还会补一个 click，不能让它把灯箱关掉
	if (viewerDidDrag) {
		viewerDidDrag = false;
		return;
	}
	document.getElementById("viewer").style.display = "none";
};
document.addEventListener("click", e => {
	if (!e.target.closest(".shareBtnWrapper")) {
		document.querySelectorAll(".sharePopover.show").forEach(p => p.classList.remove("show"));
	}
});

const emojiPicker = $("emojiPicker");
emojiPicker.innerHTML = EMOJI_MAP.map(name =>
	`<img src="emojis/${name}.svg" data-emoji="${name}" alt=":${name}:" title=":${name}:">`
).join("");
let emojiTargetInput = null;

function closeEmojiPicker() {
	if (emojiPicker) emojiPicker.classList.remove("show");
}

function positionEmojiPicker(btn) {
	const rect = btn.getBoundingClientRect();
	let top = rect.bottom + 4;
	let left = rect.left;
	if (top + 230 > window.innerHeight) {
		top = rect.top - 230;
	}
	emojiPicker.style.left = Math.min(left, window.innerWidth - 290) + "px";
	emojiPicker.style.top = top + "px";
}
document.addEventListener("click", e => {
	const btn = e.target.closest(".emojiBtn, #editorEmojiBtn");
	if (btn) {
		e.preventDefault();
		e.stopPropagation();
		if (btn.id === "editorEmojiBtn") {
			emojiTargetInput = $("textEditor");
		} else {
			const pid = btn.dataset.emojiTarget;
			emojiTargetInput = document.querySelector(`[data-input="${pid}"]`);
		}
		if (!emojiTargetInput) return;
		const showing = emojiPicker.classList.contains("show") && emojiPicker._targetBtn === btn;
		emojiPicker.classList.remove("show");
		if (!showing) {
			positionEmojiPicker(btn);
			emojiPicker.classList.add("show");
			emojiPicker._targetBtn = btn;
		}
		return;
	}
	if (!e.target.closest("#emojiPicker")) {
		emojiPicker.classList.remove("show");
	}
});
emojiPicker.addEventListener("click", e => {
	const img = e.target.closest("img");
	if (!img || !emojiTargetInput) return;
	const name = img.dataset.emoji;
	if (!name) return;

	// 发帖编辑器是富文本（contenteditable），插入的是表情图元而不是 :name: 源码
	if (emojiTargetInput === $("textEditor")) {
		window.richEditor.insertEmoji(name);
		return;
	}

	const input = emojiTargetInput;
	const start = input.selectionStart;
	const end = input.selectionEnd;
	const before = input.value.substring(0, start);
	const after = input.value.substring(end);
	input.value = before + `:${name}:` + after;
	const pos = start + name.length + 2;
	input.selectionStart = input.selectionEnd = pos;
	input.focus();
	input.dispatchEvent(new Event("input", {
		bubbles: true
	}));
	// 选中表情后不再自动关闭，便于连续插入。
});
