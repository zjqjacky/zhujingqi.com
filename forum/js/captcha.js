let captchaPassed = false;
let captchaToken = "";
let captchaAnswer = "";

// 两处状态文案分开写：
//   #captchaStatus        —— 注册表单里 captchaBtn 旁边的结果标记（通过/未通过）
//   #captchaModalStatus   —— 弹窗内部的即时提示（输入错误、加载失败等）
// 之前两处都叫 captchaStatus，getElementById 只命中第一个，
// 弹窗里的提示全写到了后面的注册表单上，弹窗内始终空白。
function setModalStatus(msg) {
	$("captchaModalStatus").textContent = msg;
}

function setRowStatus(msg) {
	$("captchaStatus").textContent = msg;
}

async function openCaptchaModal() {
	$("captchaModal").classList.remove("hidden");
	$("captchaQuestion").textContent = "…";
	$("captchaAnswer").value = "";
	setModalStatus("");
	setRowStatus("");
	captchaPassed = false;
	captchaToken = "";
	captchaAnswer = "";
	resetRegisterButton();
	try {
		const data = await apiGet("/api/auth/captcha");
		captchaToken = data && data.token ? data.token : "";
		$("captchaQuestion").textContent = data && data.question ? data.question : "加载失败";
		$("captchaAnswer").focus();
	} catch (e) {
		$("captchaQuestion").textContent = "加载失败";
		setModalStatus("无法加载验证，请重试");
	}
}

function confirmCaptcha() {
	const ans = ($("captchaAnswer").value || "").trim();
	if (!captchaToken) {
		setModalStatus("验证未就绪，请重新打开");
		return;
	}
	if (!/^\d{1,6}$/.test(ans)) {
		setModalStatus("请输入算式的结果");
		return;
	}
	captchaAnswer = ans;
	captchaPassed = true;
	setModalStatus("✅ 已通过");
	setRowStatus("✅");
	$("registerBtn").disabled = false;
	$("registerBtn").style.opacity = "1";
	$("registerBtn").style.cursor = "pointer";
	setTimeout(() => $("captchaModal").classList.add("hidden"), 400);
}

function resetRegisterButton() {
	if (!$("registerBtn")) return;
	$("registerBtn").disabled = true;
	$("registerBtn").style.opacity = ".5";
	$("registerBtn").style.cursor = "not-allowed";
}

$("captchaConfirmBtn").onclick = confirmCaptcha;
$("captchaAnswer").addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		e.preventDefault();
		confirmCaptcha();
	}
});
$("captchaCloseBtn").onclick = () => {
	$("captchaModal").classList.add("hidden");
};

function resetCaptcha() {
	captchaPassed = false;
	captchaToken = "";
	captchaAnswer = "";
	if ($("captchaStatus")) setRowStatus("");
	if ($("captchaModalStatus")) setModalStatus("");
	if ($("captchaQuestion")) $("captchaQuestion").textContent = "…";
	resetRegisterButton();
}
