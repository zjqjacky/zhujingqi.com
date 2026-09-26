let captchaPassed = false;
let captchaToken = "";
let captchaAnswer = "";

async function openCaptchaModal() {
	$("captchaModal").classList.remove("hidden");
	$("captchaQuestion").textContent = "…";
	$("captchaAnswer").value = "";
	$("captchaStatus").textContent = "";
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
		$("captchaStatus").textContent = "无法加载验证，请重试";
	}
}

function confirmCaptcha() {
	const ans = ($("captchaAnswer").value || "").trim();
	if (!captchaToken) {
		$("captchaStatus").textContent = "验证未就绪，请重新打开";
		return;
	}
	if (!/^\d{1,6}$/.test(ans)) {
		$("captchaStatus").textContent = "请输入数字结果";
		return;
	}
	captchaAnswer = ans;
	captchaPassed = true;
	$("captchaStatus").textContent = "✅ 已通过";
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
	if ($("captchaStatus")) $("captchaStatus").textContent = "";
	if ($("captchaQuestion")) $("captchaQuestion").textContent = "…";
	resetRegisterButton();
}
