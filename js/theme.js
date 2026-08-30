(function () {
	var STORAGE_KEY = 'theme';
	var btn = document.getElementById('switch-theme-btn');
	var prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

	function getTheme() {
		return localStorage.getItem(STORAGE_KEY);
	}

	function setTheme(theme) {
		localStorage.setItem(STORAGE_KEY, theme);
		applyTheme(theme);
	}

	function applyTheme(theme) {
		var isDark;
		if (theme === 'dark') {
			isDark = true;
		} else if (theme === 'light') {
			isDark = false;
		} else {
			isDark = prefersDark.matches;
		}
		document.body.classList.toggle('dark-mode', isDark);
	}

	function toggleTheme() {
		var current = document.body.classList.contains('dark-mode');
		setTheme(current ? 'light' : 'dark');
	}

	applyTheme(getTheme());

	if (btn) {
		btn.addEventListener('click', toggleTheme);
	}

	prefersDark.addEventListener('change', function () {
		if (!getTheme()) {
			applyTheme();
		}
	});

	window.addEventListener('storage', function (e) {
		if (e.key === STORAGE_KEY) {
			applyTheme(e.newValue);
		}
	});
})();
