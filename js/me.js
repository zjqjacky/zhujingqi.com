(function () {
	'use strict';

	/* ============================================================
	 * 折叠区域（联系方式 / 链接）
	 * ============================================================ */
	function initCollapsible(toggleId, extraId, showText, hideText) {
		var toggle = document.getElementById(toggleId);
		var extra = document.getElementById(extraId);
		if (!toggle || !extra) return;

		var label = toggle.querySelector('.toggle-text');
		var expanded = false;

		if ('inert' in extra) extra.inert = true;
		extra.setAttribute('aria-hidden', 'true');

		toggle.addEventListener('click', function () {
			expanded = !expanded;
			extra.classList.toggle('open', expanded);
			toggle.classList.toggle('open', expanded);
			toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
			extra.setAttribute('aria-hidden', expanded ? 'false' : 'true');
			if ('inert' in extra) extra.inert = !expanded;
			if (label) label.textContent = expanded ? hideText : showText;
		});
	}

	function initContact() {
		initCollapsible('contact-toggle', 'contact-extra', '显示其他联系方式', '收起其他联系方式');
	}

	function initLinks() {
		initCollapsible('links-toggle', 'links-extra', '显示链接', '收起链接');
	}

	/* ============================================================
	 * 项目 3D 轮播
	 * ============================================================ */
	function initProjects() {
		var carousel = document.getElementById('project-carousel');
		if (!carousel) return;

		var stage = carousel.querySelector('.project-stage');
		var cards = Array.prototype.slice.call(carousel.querySelectorAll('.project-card'));
		var dots = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-dot'));
		var prev = carousel.querySelector('.carousel-btn.prev');
		var next = carousel.querySelector('.carousel-btn.next');
		var status = document.getElementById('project-status');

		if (!stage || cards.length === 0) return;

		var count = cards.length;
		var current = 0;
		var position = 0;
		var dragging = false;
		var dragMoved = false;
		var axis = null;
		var startX = 0;
		var startY = 0;
		var startPosition = 0;
		var pointerId = null;
		var captured = false;

		function clamp(value, min, max) {
			return Math.min(Math.max(value, min), max);
		}

		function cardStep() {
			return Math.max(120, cards[0].offsetWidth * 0.58);
		}

		function render() {
			cards.forEach(function (card, index) {
				var offset = index - position;
				var distance = Math.abs(offset);
				var translate = offset * 58;
				var depth = Math.min(distance, 3) * -140;
				var rotate = clamp(offset * -20, -40, 40);
				var scale = Math.max(0.7, 1 - distance * 0.09);

				card.style.transform = 'translate(-50%, -50%) translateX(' + translate +
					'%) translateZ(' + depth + 'px) rotateY(' + rotate + 'deg) scale(' + scale + ')';
				var hidden = distance > 1.55;
				card.style.opacity = hidden ? '0' : String(Math.max(0.9, 1 - distance * 0.06));
				card.style.pointerEvents = hidden ? 'none' : '';
				card.style.zIndex = String(100 - Math.round(distance * 10));

				var active = distance < 0.5;
				card.classList.toggle('is-active', active);
				card.setAttribute('aria-hidden', active ? 'false' : 'true');
				if (active) {
					card.removeAttribute('tabindex');
				} else {
					card.setAttribute('tabindex', '-1');
				}
			});

			var nearest = Math.round(position);
			dots.forEach(function (dot, index) {
				dot.setAttribute('aria-current', index === nearest ? 'true' : 'false');
			});

			if (prev) prev.disabled = position <= 0.001;
			if (next) next.disabled = position >= count - 1.001;
		}

		function goTo(index, announce) {
			var target = clamp(Math.round(index), 0, count - 1);
			position = target;
			render();

			if (target !== current) {
				current = target;
				if (status) {
					var title = cards[target].getAttribute('data-title') || '';
					status.textContent = '第 ' + (target + 1) + ' 个，共 ' + count + ' 个：' + title;
				}
			}
		}

		function endDrag(snap) {
			if (!dragging) return;
			dragging = false;
			axis = null;
			carousel.classList.remove('is-dragging');

			if (captured && pointerId !== null) {
				try {
					carousel.releasePointerCapture(pointerId);
				} catch (err) {
					/* 指针已经释放时忽略 */
				}
			}
			captured = false;
			pointerId = null;

			if (snap) goTo(position);

			if (dragMoved) {
				/* 让随后的 click 事件被忽略，避免拖动后误打开链接 */
				setTimeout(function () {
					dragMoved = false;
				}, 0);
			}
		}

		function onPointerDown(event) {
			if (event.pointerType === 'mouse' && event.button !== 0) return;
			if (event.target.closest('button')) return;

			dragging = true;
			dragMoved = false;
			axis = null;
			startX = event.clientX;
			startY = event.clientY;
			startPosition = position;
			pointerId = event.pointerId;
			captured = false;
			carousel.classList.add('is-dragging');
		}

		function onPointerMove(event) {
			if (!dragging || event.pointerId !== pointerId) return;

			var dx = event.clientX - startX;
			var dy = event.clientY - startY;

			if (!axis) {
				if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
				axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
				if (axis === 'y') {
					endDrag(false);
					return;
				}
			}

			if (axis !== 'x') return;
			if (Math.abs(dx) > 6) dragMoved = true;

			if (!captured && pointerId !== null) {
				try {
					carousel.setPointerCapture(pointerId);
					captured = true;
				} catch (err) {
					/* 某些浏览器在特定情况下不允许捕获指针 */
				}
			}

			position = clamp(startPosition - dx / cardStep(), 0, count - 1);
			render();
		}

		function onPointerUp() {
			endDrag(true);
		}

		cards.forEach(function (card) {
			card.addEventListener('click', function (event) {
				if (dragMoved) {
					event.preventDefault();
				}
			});
		});

		if (prev) {
			prev.addEventListener('click', function () {
				goTo(current - 1);
			});
		}

		if (next) {
			next.addEventListener('click', function () {
				goTo(current + 1);
			});
		}

		dots.forEach(function (dot, index) {
			dot.addEventListener('click', function () {
				goTo(index);
			});
		});

		carousel.addEventListener('keydown', function (event) {
			if (event.key === 'ArrowLeft') {
				event.preventDefault();
				goTo(current - 1);
			} else if (event.key === 'ArrowRight') {
				event.preventDefault();
				goTo(current + 1);
			}
		});

		carousel.addEventListener('pointerdown', onPointerDown);
		carousel.addEventListener('pointermove', onPointerMove);
		carousel.addEventListener('pointerup', onPointerUp);
		carousel.addEventListener('pointercancel', onPointerUp);
		carousel.addEventListener('dragstart', function (event) {
			event.preventDefault();
		});

		render();

		if (status) {
			var firstTitle = cards[0].getAttribute('data-title') || '';
			status.textContent = '第 1 个，共 ' + count + ' 个：' + firstTitle;
		}
	}

	function init() {
		initContact();
		initLinks();
		initProjects();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
