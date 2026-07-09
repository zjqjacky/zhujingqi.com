let eggCode = ['z', 'h', 'u', 'j', 'i', 'n', 'g', 'q', 'i'];
let inputLog = [];

window.addEventListener('keydown', function(e) {
	let key = e.key.toLowerCase();
	inputLog.push(key);

	if (inputLog.length > eggCode.length) {
		inputLog.shift();
	}

	if (inputLog.join('') === eggCode.join('')) {
		rotate180();
		inputLog = [];
	}
});

function rotate180() {
	document.body.style.transition = "transform 1s ease";
	document.body.style.transform = "rotate(180deg)";
}

let eggCode2 = ['j', 'a', 'c', 'k', 'y'];
let inputLog2 = [];

window.addEventListener('keydown', function(e) {
	let key = e.key.toLowerCase();
	inputLog2.push(key);

	if (inputLog2.length > eggCode2.length) {
		inputLog2.shift();
	}

	if (inputLog2.join('') === eggCode2.join('')) {
		shakeit();
		inputLog2 = [];
	}
});

function shakeit() {
	document.body.classList.add('shake-it');
}

const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
  0% { transform: translate(0, 0); }
  10% { transform: translate(-10px, 0); }
  20% { transform: translate(10px, 0); }
  30% { transform: translate(-10px, 0); }
  40% { transform: translate(10px, 0); }
  50% { transform: translate(-5px, 0); }
  60% { transform: translate(5px, 0); }
  70% { transform: translate(-2px, 0); }
  80% { transform: translate(2px, 0); }
  90% { transform: translate(-1px, 0); }
  100% { transform: translate(0, 0); }
}

.shake-it {
  animation: shake 0.5s infinite;
}`;

document.head.appendChild(style);




/* =====================
   2026 New Year Firework Egg
   ===================== */
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
Object.assign(canvas.style, {
	position: 'fixed',
	inset: 0,
	zIndex: 9996,
	pointerEvents: 'none'
});
function resize() {
	canvas.width = innerWidth;
	canvas.height = innerHeight;
}
resize();
addEventListener('resize', resize);
const btn = document.createElement('button');
btn.textContent = '🎆 FIREWORK';
document.body.appendChild(btn);
Object.assign(btn.style, {
	position: 'fixed',
	right: '24px',
	bottom: '24px',
	zIndex: 10001,
	padding: '16px 28px',
	fontSize: '20px',
	border: 'none',
	borderRadius: '999px',
	cursor: 'pointer',
	background: 'linear-gradient(135deg,#ff2fdc,#ffb347)',
	color: '#000',
	boxShadow: '0 0 40px rgba(255,90,200,.9)',
	fontWeight: 'bold'
});
let armed = false;
let blocker = null;
let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;
const cannon = {
	x: () => canvas.width / 2,
	y: () => canvas.height - 90,
	len: 90,
	angle: -Math.PI / 2
};
const rockets = [];
const particles = [];
btn.onclick = e => {
	e.stopPropagation();
	armed = !armed;
	btn.textContent = armed ? '❌ EXIT' : '🎆 FIREWORK';
	btn.style.boxShadow = armed
		? '0 0 50px rgba(255,80,80,1)'
		: '0 0 40px rgba(255,90,200,.9)';
	if (armed) {
		blocker = document.createElement('div');
		Object.assign(blocker.style, {
			position: 'fixed',
			inset: 0,
			zIndex: 10000,
			background: 'transparent',
			cursor: 'crosshair'
		});
		blocker.addEventListener('click', ev => {
			ev.preventDefault();
			ev.stopPropagation();
			fire();
		});
		document.body.appendChild(blocker);
	} else {
		if (blocker) {
			blocker.remove();
			blocker = null;
		}
	}
};
addEventListener('mousemove', e => {
	mouseX = e.clientX;
	mouseY = e.clientY;
});
function fire() {
	const dx = mouseX - cannon.x();
	const dy = mouseY - cannon.y();
	const angle = Math.atan2(dy, dx);
	rockets.push({
		x: cannon.x(),
		y: cannon.y(),
		vx: Math.cos(angle) * 12,
		vy: Math.sin(angle) * 12,
		life: 60 + Math.random() * 20,
		tail: []
	});
}
function explode(x, y) {
	const count = 300 + Math.random() * 500;
	for (let i = 0; i < count; i++) {
		const a = Math.random() * Math.PI * 2;
		const s = Math.random() * 15 + 4;
		particles.push({
			x, y,
			vx: Math.cos(a) * s,
			vy: Math.sin(a) * s,
			life: 70 + Math.random() * 50,
			color: `hsl(${Math.random() * 360},100%,65%)`
		});
	}
	ctx.fillStyle = 'rgba(255,255,255,.6)';
	ctx.beginPath();
	ctx.arc(x, y, 100, 0, Math.PI * 2);
	ctx.fill();
}
function update() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (armed) {
		cannon.angle = Math.atan2(
			mouseY - cannon.y(),
			mouseX - cannon.x()
		);
		ctx.save();
		ctx.translate(cannon.x(), cannon.y());
		ctx.rotate(cannon.angle);
		ctx.fillStyle = '#555';
		ctx.fillRect(0, -14, cannon.len, 28);
		ctx.beginPath();
		ctx.arc(0, 0, 32, 0, Math.PI * 2);
		ctx.fillStyle = '#222';
		ctx.fill();
		ctx.restore();
	}
	for (let i = rockets.length - 1; i >= 0; i--) {
		const r = rockets[i];
		r.tail.push({ x: r.x, y: r.y });
		if (r.tail.length > 8) r.tail.shift();
		r.x += r.vx;
		r.y += r.vy;
		r.vy += 0.06;
		r.life--;
		ctx.strokeStyle = '#fff';
		ctx.beginPath();
		for (let j = 0; j < r.tail.length; j++) {
			const p = r.tail[j];
			if (j === 0) ctx.moveTo(p.x, p.y);
			else ctx.lineTo(p.x, p.y);
		}
		ctx.stroke();
		ctx.fillStyle = '#ff5500';
		ctx.beginPath();
		ctx.arc(r.x, r.y, 5, 0, Math.PI * 2);
		ctx.fill();
		if (r.life <= 0) {
			explode(r.x, r.y);
			rockets.splice(i, 1);
		}
	}
	for (let i = particles.length - 1; i >= 0; i--) {
		const p = particles[i];
		p.x += p.vx;
		p.y += p.vy;
		p.vy += 0.05;
		p.life--;
		ctx.fillStyle = p.color;
		ctx.fillRect(p.x, p.y, 4, 4);
		if (p.life <= 0) particles.splice(i, 1);
	}
	requestAnimationFrame(update);
}
update();
