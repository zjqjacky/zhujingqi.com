const TRANSLATIONS = {
	page_title: { zh: "首页 - Zhujingqi", en: "Home - Zhujingqi", es: "Inicio - Zhujingqi" },
	nav_me: { zh: "介绍", en: "Me", es: "Sobre mí" },
	nav_game: { zh: "游戏", en: "Game", es: "Juegos" },
	nav_tool: { zh: "工具", en: "Tool", es: "Herramientas" },
	msg_update: { zh: "🔔 zhujingqi.com 首页更新", en: "🔔 zhujingqi.com updated", es: "🔔 zhujingqi.com actualizado" },
	hero_intro: {
		zh: 'Hello，我是Jacky！我热爱学习，喜欢出游，开朗乐观，擅长做手工，十分有创意。（更多详见 <a href="/me/">个人介绍</a>、<a href="/about">关于</a> ）',
		en: 'Hello, I\'m Jacky! I love studying and traveling, and I\'m an optimistic, outgoing person full of crazy ideas. (See more at <a href="/me/">Me</a>, <a href="/about">About</a>)',
		es: '¡Hola! Soy Jacky. Me encanta estudiar y viajar, y soy una persona optimista y extrovertida llena de ideas locas. (Ver más en <a href="/me/">Sobre mí</a>, <a href="/about">Acerca de</a>)'
	},
	hero_title: { zh: "HELLO, I'M JACKY", en: "HELLO, I'M JACKY", es: "HOLA, SOY JACKY" },
	card_me: { zh: "个人介绍", en: "Me", es: "Sobre mí" },
	card_game: { zh: "游戏中心", en: "Game Center", es: "Centro de Juegos" },
	card_tool: { zh: "工具大全", en: "Tool Collection", es: "Colección de Herramientas" },
	card_forum: { zh: "Jacky 论坛", en: "Jacky Forum", es: "Foro Jacky" },
	visitors: { zh: "网站访问量：", en: "Total visitors: ", es: "Visitantes totales: " },
	visitors_since: { zh: "（2025.3.14至今）", en: "(Since 2025.3.14)", es: "(Desde el 14/3/2025)" },
	wise_saying: {
		zh: "<b>至理名言：</b>有时按下某些特殊组合的按键，会有好事发生。",
		en: "<b>A wise saying: </b>If you press a specific series of keys on the keyboard, good things will happen.",
		es: "<b>Una frase sabia: </b>Si presionas una serie específica de teclas en el teclado, sucederán cosas buenas."
	},
	featured: { zh: "我的大作：", en: "Featured projects: ", es: "Proyectos destacados: " },
	other_works: { zh: "其它作品：", en: "Other works: ", es: "Otros proyectos: " },
	jackianity_zh: { zh: "杰基教（Jackianity）", en: "Jackianity", es: "Jackianidad" },
	watered_count: { zh: "浇水次数: ", en: "Total watered times: ", es: "Veces regadas: " },
	email_label: { zh: "我的邮箱：", en: "My Email: ", es: "Mi correo electrónico: " },
	contact_link: { zh: "联系方式", en: "Contact", es: "Contacto" },
	contact_hint: { zh: "（更多详见 ", en: " (See more at ", es: " (Ver más en " },
	footer_about: { zh: "关于", en: "About", es: "Acerca de" },
	footer_donate: { zh: "赞助", en: "Donate", es: "Donar" },
	footer_links: { zh: "链接", en: "Links", es: "Sitios amigos" },
	footer_lqh: { zh: "LQH-2011的网站", en: "LQH-2011's Website", es: "Sitio web de LQH-2011" }
};

const PAGE_TITLES = {
	zh: "首页 - Zhujingqi",
	en: "Home - Zhujingqi",
	es: "Inicio - Zhujingqi"
};

let currentLang = (function () {
	var s = localStorage.getItem("lang");
	if (s) return s;
	var l = navigator.language || "zh";
	if (l.startsWith("zh")) return "zh";
	if (l.startsWith("es")) return "es";
	return "en";
})();

function t(key) {
	return (TRANSLATIONS[key] && TRANSLATIONS[key][currentLang]) ||
		(TRANSLATIONS[key] && TRANSLATIONS[key].zh) || key;
}

function changeLanguage(lang) {
	currentLang = lang;
	localStorage.setItem("lang", lang);
	applyTranslations();
	updateLangSwitcher();
}

function applyTranslations() {
	document.title = PAGE_TITLES[currentLang] || PAGE_TITLES.zh;
	document.querySelectorAll("[data-i18n]").forEach(function (el) {
		var key = el.getAttribute("data-i18n");
		var translated = t(key);
		if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
			el.placeholder = translated;
		} else if (el.hasAttribute("data-i18n-html")) {
			el.innerHTML = translated;
		} else {
			el.textContent = translated;
		}
	});
}

function updateLangSwitcher() {
	var sel = document.getElementById("lang-select");
	if (sel) sel.value = currentLang;
}

document.addEventListener("DOMContentLoaded", function () {
	applyTranslations();
	updateLangSwitcher();
});
