let viewerScale = 1;

function openViewer(src) {
	const viewer = $("viewer");
	const viewerImg = $("viewerImg");
	viewerImg.src = src;
	viewer.style.display = "flex";
	viewerScale = 1;
	viewerImg.style.transform = "scale(1)";
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
		viewerImg.style.transform =
			`scale(${viewerScale})`;
	};
	viewerImg.ondblclick = () => {
		viewerScale =
			viewerScale === 1 ? 2 : 1;
		viewerImg.style.transform =
			`scale(${viewerScale})`;
	};
}
window.closeViewer = function() {
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
			emojiTargetInput = $("text");
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
	const text = `:${name}:`;
	const input = emojiTargetInput;
	const start = input.selectionStart;
	const end = input.selectionEnd;
	const before = input.value.substring(0, start);
	const after = input.value.substring(end);
	input.value = before + text + after;
	const pos = start + text.length;
	input.selectionStart = input.selectionEnd = pos;
	input.focus();
	input.dispatchEvent(new Event("input", {
		bubbles: true
	}));
	// 选中表情后不再自动关闭，便于连续插入。
});
