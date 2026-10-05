function getLevelInfo(coins) {
	const levels = [{
			min: 0,
			name: "LV0",
			color: "#888"
		},
		{
			min: 1,
			name: "LV1",
			color: "#77bb00"
		},
		{
			min: 20,
			name: "LV2",
			color: "#00aaff"
		},
		{
			min: 40,
			name: "LV3",
			color: "#ffcc00"
		},
		{
			min: 80,
			name: "LV4",
			color: "#ff9900"
		},
		{
			min: 160,
			name: "LV5",
			color: "#ff5500"
		},
		{
			min: 320,
			name: "LV6",
			color: "#d93131"
		},
		{
			min: 640,
			name: "LV7",
			color: "#ff55ff"
		},
		{
			min: 1280,
			name: "LV8",
			color: "#9900ff"
		},
		{
			min: 2560,
			name: "LV9",
			color: "#55007f"
		},
		{
			min: 5120,
			name: "LV10",
			color: "#d4a017",
			cssClass: "lv10"
		},
		{
			min: 10240,
			name: "LV11",
			color: "#ff4500",
			cssClass: "lv11"
		},
		{
			min: 20480,
			name: "LV12",
			color: "#ffd700",
			cssClass: "lv12"
		},
		{
			min: 40960,
			name: "MAX",
			color: "#000000"
		}
	];
	let current = levels[0];
	let next = null;
	for (let i = levels.length - 1; i >= 0; i--) {
		if (coins >= levels[i].min) {
			current = levels[i];
			next = levels[i + 1] || null;
			break;
		}
	}
	return {
		current,
		next,
		coins
	};
}

function renderLevelProgress(coins) {
	const container = $("levelProgress");
	if (!container) return;
	const info = getLevelInfo(coins);
	const {
		current,
		next
	} = info;
	if (!next) {
		container.innerHTML = `
							<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
								<span style="font-weight:bold;color:${current.color};">${current.name}</span>
								<span style="color:var(--sub);font-size:14px;">${t("level_full")}</span>
							</div>
						`;
		return;
	}
	const progress = Math.min(1, (coins - current.min) / (next.min - current.min));
	const barColor = current.color;
	container.innerHTML = `
						<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
							<span style="font-weight:bold;color:${current.color};">${current.name}</span>
							<div style="flex:1;min-width:100px;height:10px;border-radius:10px;background:var(--bg);overflow:hidden;">
								<div style="height:100%;width:${(progress * 100).toFixed(1)}%;border-radius:10px;background:linear-gradient(90deg,${barColor},${next.color});transition:width .4s;"></div>
							</div>
							<span style="font-weight:bold;color:${next.color};">${next.name}</span>
						</div>
						<div style="color:var(--sub);font-size:13px;margin-top:4px;text-align:center;">
							${t("level_distance", '<b style="color:'+next.color+';">'+next.name+'</b>', '<b>'+(next.min - coins)+'</b>')}
						</div>
					`;
}

function getUserLevel(coins) {
	const info = getLevelInfo(coins);
	const cls = info.current.cssClass ? ` ${info.current.cssClass}` : "";
	return `<span class="userLevel${cls}" style="color:${info.current.color}">${info.current.name}</span>`;
}
const levels = ["大吉", "吉", "中平", "凶", "大凶"];
const things = [
	"找 BUG",
	"早睡",
	"熬夜",
	"赞助杰基",
	"装呆",
	"装酷",
	"玩 Minecraft",
	"与管理员聊天",
	"万事皆宜",
	"万事不宜",
	"数自己的脚趾",
	"原地发癫",
	"给TA发信息",
	"绷不住了",
	"帮杰基修 Bug",
	"把耳机线打成死结",
	"已读不回",
	"烧香",
	"打Phigros",
	"假装自己是 NPC",
	"打扰管理员",
	"装嘉豪",
	"尺规作图时尺子坏了",
	"完形填空全选 C",
	"玩一个游戏",
	"?",
	"打开一个多年未使用的文件夹",
	"删一个文件",
	"危险！现在立刻回头！",
	"忘记这条运势"
];

// 运势条目中需要可点击的部分：键为条目纯文本，值为 [链接文字, 站内路径]。
// 渲染时用 DOM API 拼装，不走 innerHTML。
const FORTUNE_LINKS = {
	"玩一个游戏": [
		["游戏", "/game/"]
	]
};

function stringToSeed(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return Math.abs(hash);
}

function seededRandom(seed) {
	seed = (seed * 9301 + 49297) % 233280;
	return seed / 233280;
}

function getDailyFortune(username) {
	const now = new Date();
	const dayIndex = Math.floor(
		now.getTime() / 86400000
	);
	const baseSeed = (stringToSeed(username) + dayIndex * 9973) % 2147483647;
	const r1 = seededRandom(baseSeed);
	let levelIndex =
		Math.floor(r1 * levels.length);
	const yesterdaySeed =
		stringToSeed(username) ^
		((dayIndex - 1) * 1145141);
	const yesterdayRandom =
		seededRandom(yesterdaySeed);
	const yesterdayIndex =
		Math.floor(yesterdayRandom * levels.length);
	if (levelIndex === yesterdayIndex) {
		levelIndex =
			(levelIndex + 1) % levels.length;
	}
	const level = levels[levelIndex] || "中平";
	const r2 = seededRandom(baseSeed + 1);
	let goodIndex =
		Math.floor(r2 * things.length);
	const r3 = seededRandom(baseSeed + 2);
	let badIndex =
		Math.floor(r3 * things.length);
	if (goodIndex === badIndex) {
		badIndex =
			(badIndex + 1) % things.length;
	}
	return {
		level,
		good: things[goodIndex],
		bad: things[badIndex]
	};
}
$("randomPostBtn").onclick = async () => {
	try {
		const randomPost = await apiGet("/api/posts/random");
		if (randomPost && randomPost.id) {
			history.replaceState(null, "", "?pid=" + randomPost.id);
			openSinglePost(randomPost.id).catch(() => { modal(t("post_not_found")); show("main"); });
		}
	} catch {
		modal(t("post_no_posts"));
	}
};

