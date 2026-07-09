document.addEventListener('DOMContentLoaded', function() {
	var switchButton = document.getElementById('switch-style');
	var a = document.getElementById('maincss');
	var b = document.getElementById('barcss');
	var dark = document.getElementById('darkcss');
	switchButton.addEventListener('click', function() {
		if (a.disabled) {
			a.disabled = false;
			b.disabled = false;
			dark.disabled = true;
		} else {
			a.disabled = true;
			b.disabled = true;
			dark.disabled = false;
		}
	});
});
const c = document.getElementById("bgt");
const s = Array.from(c.children);
for (let i = s.length - 1; i > 0; i--) {
	const j = Math.floor(Math.random() * (i + 1));
	[s[i], s[j]] = [s[j], s[i]];
}
c.innerHTML = "";
s.forEach(span => c.appendChild(span));

const pupils = document.querySelectorAll(".pupil");
document.addEventListener("mousemove", (e) => {
	pupils.forEach(pupil => {
		const eye = pupil.parentElement;
		const rect = eye.getBoundingClientRect();
		const eyeX = rect.left + rect.width / 2;
		const eyeY = rect.top + rect.height / 2;
		const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
		const max = 5;
		const pupilX = Math.cos(angle) * max;
		const pupilY = Math.sin(angle) * max;
		pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
	});
});

const dbKey = 'zhujingqicomplantwateredtimes';
const dbName = 'zhujingqicomplantwateredtimes';
const dbReadURL = 'https://textdb.online/' + dbKey;
const dbWriteURL = 'https://api.textdb.online/update/';
const plant = document.getElementById("pot");
const countDiv = document.getElementById("watered-count");

let wateredTimes = 0;

async function loadWateredTimes() {
	try {
		const res = await fetch(dbReadURL);
		const text = await res.text();
		wateredTimes = parseInt(text) || 0;
		countDiv.innerText = `已被浇水${wateredTimes}次！`;
	} catch {
		countDiv.innerText = "未被浇水。";
	}
}

async function waterPlant() {
	wateredTimes += 1;
	can();
	countDiv.innerText = `已被浇水${wateredTimes}次！`;
	const params = new URLSearchParams();
	params.append('db', dbName);
	params.append('key', dbKey);
	params.append('value', wateredTimes);
	try {
		await fetch(dbWriteURL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: params.toString()
		});
	} catch (err) {
		console.error(err);
	}
}

loadWateredTimes();
plant.addEventListener("click", waterPlant);

function can() {
	const can = document.getElementById("can");
	can.style.display = "block";
	can.style.opacity = "1";
	can.style.transform = "rotate(0deg) scale(1)";
	setTimeout(() => {
		can.style.transform = "rotate(-30deg) scale(1)";
	}, 100);
	setTimeout(() => {
		can.style.transform = "rotate(0deg) scale(1)";
	}, 600);
	setTimeout(() => {
		can.style.opacity = "0";
		can.style.transform = "rotate(0deg) scale(0.95)";
	}, 1000);
	setTimeout(() => {
		can.style.display = "none";
	}, 1200);
}
