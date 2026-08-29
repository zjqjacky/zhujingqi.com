const TRANSLATIONS = {
	ai_title: { zh: "Jacky AI", en: "Jacky AI", es: "Jacky AI", de: "Jacky AI", "zh-TW": "Jacky AI" },
	ai_entry: { zh: "Jacky AI", en: "Jacky AI", es: "Jacky AI", de: "Jacky AI", "zh-TW": "Jacky AI" },
	ai_placeholder: { zh: "", en: "", es: "", de: "", "zh-TW": "" },
	ai_send: { zh: "发送", en: "Send", es: "Enviar", de: "Senden", "zh-TW": "發送" },
	ai_cost: { zh: "每天前 10 次免费，之后每次消耗", en: "First 10 free daily, then costs", es: "Primeras 10 gratis al día, luego cuesta", de: "Erste 10 täglich gratis, danach kostet", "zh-TW": "每天前 10 次免費，之後每次消耗" },
	ai_generating: { zh: "AI 正在思考…", en: "AI is thinking…", es: "La IA está pensando…", de: "KI denkt nach…", "zh-TW": "AI 正在思考…" },
	ai_generated_tag: { zh: "AI 生成", en: "AI generated", es: "Generado por IA", de: "Von KI erstellt", "zh-TW": "AI 生成" },
	ai_login_required: { zh: "请先登录后再使用 AI 问答", en: "Please log in to use AI Assistant", es: "Inicia sesión para usar el asistente IA", de: "Bitte melde dich an, um den KI-Assistenten zu nutzen", "zh-TW": "請先登入後再使用 AI 問答" },
	ai_no_coins: { zh: "今日 10 次免费额度已用完，金币不足，无法提问（每次需 1 金币）", en: "Free quota used up, not enough coins (1 coin per question)", es: "Cuota gratis agotada, monedas insuficientes (1 moneda por pregunta)", de: "Gratis-Kontingent aufgebraucht, nicht genug Münzen (1 Münze pro Frage)", "zh-TW": "今日 10 次免費額度已用完，金幣不足，無法提問（每次需 1 金幣）" },
	ai_free_used: { zh: "本次提问免费（每天前 10 次不扣金币）", en: "Free question (first 10 daily are free)", es: "Pregunta gratis (las primeras 10 del día)", de: "Kostenlose Frage (erste 10 täglich)", "zh-TW": "本次提問免費（每天前 10 次不扣金幣）" },
	ai_free_left: { zh: "今天还剩余 {0} 次免费提问", en: "{0} free questions left today", es: "Quedan {0} preguntas gratis hoy", de: "Noch {0} kostenlose Fragen heute", "zh-TW": "今天還剩餘 {0} 次免費提問" },
	ai_error: { zh: "AI 服务开小差了，1 金币已退回", en: "AI service error, your coin has been refunded", es: "Error del servicio IA, tu moneda fue devuelta", de: "KI-Fehler, deine Münze wurde erstattet", "zh-TW": "AI 服務開小差了，1 金幣已退回" },
	ai_refunded: { zh: "AI 生成失败，已退回 1 金币", en: "Generation failed, 1 coin refunded", es: "Error, 1 moneda devuelta", de: "Fehler, 1 Münze erstattet", "zh-TW": "AI 生成失敗，已退回 1 金幣" },
	ai_queue: { zh: "AI 繁忙，正在排队处理，请稍后重试", en: "AI is busy and queued, please try again later", es: "La IA está ocupada, en cola. Inténtalo de nuevo más tarde", de: "KI ist beschäftigt, in der Warteschlange. Bitte später erneut versuchen", "zh-TW": "AI 繁忙，正在排隊處理，請稍後重試" },
	ai_queue_refund: { zh: "本次已退回 1 金币，稍后可重试", en: "1 coin refunded, try again later", es: "1 moneda devuelta, inténtalo más tarde", de: "1 Münze erstattet, versuche es später", "zh-TW": "本次已退回 1 金幣，稍後可重試" },
	ai_logs_title: { zh: "AI 调用记录", en: "AI Logs", es: "Registros de IA", de: "KI-Protokolle", "zh-TW": "AI 調用記錄" },
	ai_logs_admin: { zh: "AI 调用记录", en: "AI Logs", es: "Registros de IA", de: "KI-Protokolle", "zh-TW": "AI 調用記錄" },
	ai_logs_empty: { zh: "暂无调用记录", en: "No logs yet", es: "Sin registros", de: "Keine Protokolle", "zh-TW": "暫無調用記錄" },
	ai_logs_close: { zh: "关闭", en: "Close", es: "Cerrar", de: "Schließen", "zh-TW": "關閉" },
	ai_clear: { zh: "清空历史", en: "Clear history", es: "Borrar historial", de: "Verlauf löschen", "zh-TW": "清空歷史" },
	ai_copy: { zh: "复制", en: "Copy", es: "Copiar", de: "Kopieren", "zh-TW": "複製" },
	ai_delete: { zh: "删除", en: "Delete", es: "Eliminar", de: "Löschen", "zh-TW": "刪除" },
	ai_copied: { zh: "已复制", en: "Copied", es: "Copiado", de: "Kopiert", "zh-TW": "已複製" },
	ai_clear_confirm: { zh: "确定要清空所有 AI 对话历史吗？", en: "Clear all AI chat history?", es: "¿Borrar todo el historial de IA?", de: "Gesamten KI-Verlauf löschen?", "zh-TW": "確定要清空所有 AI 對話歷史嗎？" },
	ai_me: { zh: "我", en: "Me", es: "Yo", de: "Ich", "zh-TW": "我" },
	ai_remaining: { zh: "今日 AI 问答还剩余 {0} 次", en: "You have {0} AI questions left today", es: "Te quedan {0} preguntas de IA hoy", de: "Noch {0} KI-Fragen heute", "zh-TW": "今日 AI 問答還剩餘 {0} 次" },
	ai_used_up: { zh: "今日 AI 问答次数已用完，明天再来吧", en: "Daily AI questions used up, come back tomorrow", es: "Se agotaron las preguntas de IA de hoy, vuelve mañana", de: "Heutige KI-Fragen aufgebraucht, komm morgen wieder", "zh-TW": "今日 AI 問答次數已用完，明天再來吧" },
	ai_cite_open: { zh: "查看原帖", en: "View post", es: "Ver publicación", de: "Beitrag ansehen", "zh-TW": "查看原帖" },
	ai_cite_open_user: { zh: "查看用户", en: "View user", es: "Ver usuario", de: "Benutzer ansehen", "zh-TW": "查看用戶" },
	ai_cite_post: { zh: "帖子", en: "Post", es: "Publicación", de: "Beitrag", "zh-TW": "帖子" },
	ai_cite_comment: { zh: "评论", en: "Comment", es: "Comentario", de: "Kommentar", "zh-TW": "評論" },
	ai_cite_user: { zh: "用户", en: "User", es: "Usuario", de: "Benutzer", "zh-TW": "用戶" },
	ai_welcome: { zh: "你好，我是 Jacky AI！可以问我关于论坛和帖子/评论内容的问题，也可以随便聊！每天前 10 次提问免费哦！", en: "Hi, I'm Jacky AI! Ask me about the forum and posts/comments, or just chat! The first 10 questions each day are free!", es: "¡Hola! Soy Jacky AI. Pregúntame sobre el foro y las publicaciones, o simplemente charla. ¡Las primeras 10 preguntas del día son gratis!", de: "Hallo, ich bin Jacky AI! Frag mich zu Forum und Beiträgen/Kommentaren oder plauder einfach. Die ersten 10 Fragen pro Tag sind kostenlos!", "zh-TW": "你好，我是 Jacky AI！可以問我有關論壇和帖子/評論內容的問題，也可以隨便聊！每天前 10 次提問免費喔！" },
	ai_tos_btn: { zh: "协议", en: "Terms", es: "Términos", de: "Bedingungen", "zh-TW": "協議" },
	ai_tos_title: { zh: "Jacky AI 使用协议", en: "Jacky AI Terms of Use", es: "Términos de uso de Jacky AI", de: "Nutzungsbedingungen für Jacky AI", "zh-TW": "Jacky AI 使用協議" },
	ai_tos_text: { zh: "欢迎使用 Jacky AI（下称“本服务”）。使用本服务即视为你已阅读并同意以下全部条款：\n\n一、费用与次数\n1. 每个账号每天前 10 次提问免费，不消耗金币；\n2. 第 11 次起，每次提问消耗 1 金币；\n3. 每个账号每天提问上限 30 次，每分钟最多 10 次；\n4. 提问未成功生成（含排队/服务异常）不扣金币，若已扣除则自动退回；\n5. 免费次数与每日上限每天重置，重置时间为每天 UTC 零点（北京时间早上 8 点）。\n\n二、内容与引用\n1. 本服务基于大语言模型生成回答，回答可能存在偏差或错误，仅供参考；\n2. 回答可能引用论坛帖子、评论和用户信息，引用来源以带编号角标标注，可点击查看原内容；\n3. 回答内容不代表论坛运营方观点。\n\n三、对话记录\n1. 你可以随时点击“清空历史”删除本地对话记录。\n\n四、使用规范\n1. 禁止滥用本服务，包括但不限于恶意刷量、攻击他人、发布违法违规内容；\n2. 违反规定可能导致 AI 提问权限被限制、金币被冻结或封禁账号。\n\n五、其他\n1. 论坛运营方有权根据实际情况调整本协议条款，调整后将在本页面公布；\n2. 若你对本服务有任何疑问，欢迎在论坛发帖或联系管理员。", en: "Welcome to Jacky AI (the \"Service\"). By using the Service you agree to these terms:\n\n1. Fees & Quota\n1. Each account gets 10 free questions per day, no coins deducted;\n2. From the 11th question onward, each question costs 1 coin;\n3. Max 30 questions per account per day, and 10 per minute;\n4. If a question fails to generate (queued/service error), no coin is deducted; if already deducted, it is auto-refunded;\n5. Free questions and daily limits reset every day at 00:00 UTC (08:00 Beijing time).\n\n2. Content & Citations\n1. Answers are generated by an LLM and may be inaccurate — for reference only;\n2. Answers may cite forum posts, comments and users, marked with numbered superscripts that link to the original content;\n3. Answers do not represent the views of the forum operators.\n\n3. Conversation History\n1. You can delete your local chat history anytime via \"Clear history\".\n\n4. Code of Conduct\n1. No abuse of the Service: spamming, attacking others, or posting illegal/inappropriate content;\n2. Violations may restrict AI access, freeze your coins, or ban your account.\n\n5. Miscellaneous\n1. Operators may update these terms at any time; changes will be posted on this page;\n2. Questions? Post in the forum or contact an admin.", es: "Bienvenido a Jacky AI (el \"Servicio\"). Al usarlo aceptas estos términos:\n\n1. Tarifas y cuota\n1. Cada cuenta tiene 10 preguntas gratis al día, sin descontar monedas;\n2. Desde la pregunta 11, cada pregunta cuesta 1 moneda;\n3. Máx. 30 preguntas al día por cuenta y 10 por minuto;\n4. Si una pregunta falla (cola/error), no se descuenta; si ya se descontó, se reembolsa;\n5. Las preguntas gratis y los límites diarios se reinician cada día a las 00:00 UTC (08:00 hora de Pekín).\n\n2. Contenido y citas\n1. Las respuestas las genera una IA y pueden ser inexactas — solo de referencia;\n2. Pueden citar publicaciones, comentarios y usuarios con superíndices numerados enlazables;\n3. No representan la opinión de los operadores.\n\n3. Historial\n1. Puedes borrar tu historial de chat local en \"Borrar historial\".\n\n4. Normas de uso\n1. No abuses del Servicio: spam, ataques o contenido ilegal;\n2. Las infracciones pueden limitar el acceso a la IA, congelar tus monedas o prohibir tu cuenta.\n\n5. Varios\n1. Los operadores pueden actualizar estos términos; se publicarán aquí;\n2. ¿Dudas? Publica en el foro o contacta a un administrador.", de: "Willkommen bei Jacky AI (dem \"Dienst\"). Mit der Nutzung akzeptierst du diese Bedingungen:\n\n1. Gebühren & Kontingent\n1. Jedes Konto erhält 10 kostenlose Fragen pro Tag, ohne Münzabzug;\n2. Ab der 11. Frage kostet jede Frage 1 Münze;\n3. Max. 30 Fragen pro Konto pro Tag und 10 pro Minute;\n4. Schlägt eine Frage fehl (Warteschlange/Fehler), wird keine Münze abgezogen; sonst automatische Erstattung;\n5. Kostenlose Fragen und Tageskontingente werden täglich um 00:00 UTC (08:00 Pekinger Zeit) zurückgesetzt.\n\n2. Inhalt & Zitate\n1. Antworten werden von einem LLM erzeugt und können ungenau sein — nur zur Referenz;\n2. Antworten können Forumsbeiträge, Kommentare und Benutzer mit nummerierten Hochstellungen zitieren;\n3. Sie geben nicht die Meinung der Betreiber wieder.\n\n3. Verlauf\n1. Du kannst deinen lokalen Chatverlauf jederzeit unter \"Verlauf löschen\" entfernen.\n\n4. Nutzungsregeln\n1. Kein Missbrauch des Dienstes: Spam, Angriffe oder illegale Inhalte;\n2. Verstöße können den KI-Zugang einschränken, Münzen einfrieren oder dein Konto sperren.\n\n5. Sonstiges\n1. Die Betreiber können diese Bedingungen jederzeit aktualisieren; Änderungen werden hier veröffentlicht;\n2. Fragen? Poste im Forum oder kontaktiere einen Admin.", "zh-TW": "歡迎使用 Jacky AI（下稱「本服務」）。使用本服務即視為你已閱讀並同意以下全部條款：\n\n一、費用與次數\n1. 每個帳號每天前 10 次提問免費，不消耗金幣；\n2. 第 11 次起，每次提問消耗 1 金幣；\n3. 每個帳號每天提問上限 30 次，每分鐘最多 10 次；\n4. 提問未成功生成（含排隊/服務異常）不扣金幣，若已扣除則自動退回；\n5. 免費次數與每日上限每天重置，重置時間為每天 UTC 零點（北京時間早上 8 點）。\n\n二、內容與引用\n1. 本服務基於大語言模型生成回答，回答可能存在偏差或錯誤，僅供參考；\n2. 回答可能引用論壇帖子、評論和使用者資訊，引用來源以帶編號角標標注，可點擊查看原內容；\n3. 回答內容不代表論壇營運方觀點。\n\n三、對話記錄\n1. 你可以隨時點擊「清空歷史」刪除本地對話記錄。\n\n四、使用規範\n1. 禁止濫用本服務，包括但不限於惡意刷量、攻擊他人、發布違法違規內容；\n2. 違反規定可能導致 AI 提問權限被限制、金幣被凍結或封鎖帳號。\n\n五、其他\n1. 論壇營運方有權根據實際情況調整本協議條款，調整後將在本頁面公布；\n2. 若你對本服務有任何疑問，歡迎在論壇發帖或聯絡管理員。" },
	login_title: {
		zh: "Jacky 论坛",
		en: "Jacky Forum",
		es: "Foro Jacky",
		de: "Jacky Forum",
		"zh-TW": "Jacky 論壇"
	},
	login_username: {
		zh: "用户名",
		en: "Username",
		es: "Usuario",
		de: "Benutzername",
		"zh-TW": "用戶名"
	},
	login_password: {
		zh: "密码",
		en: "Password",
		es: "Contraseña",
		de: "Passwort",
		"zh-TW": "密碼"
	},
	login_btn: {
		zh: "登录",
		en: "Login",
		es: "Iniciar sesión",
		de: "Anmelden",
		"zh-TW": "登錄"
	},
	guest_btn: {
		zh: "访客模式",
		en: "Guest Mode",
		es: "Modo invitado",
		de: "Gastmodus",
		"zh-TW": "訪客模式"
	},
	go_register: {
		zh: "没有账号？点击注册",
		en: "No account? Register",
		es: "¿Sin cuenta? Regístrate",
		de: "Kein Konto? Registrieren",
		"zh-TW": "沒有帳號？點擊註冊"
	},
	go_login: {
		zh: "已有帐号？返回登录",
		en: "Already have an account? Login",
		es: "¿Ya tienes cuenta? Inicia sesión",
		de: "Bereits Konto? Anmelden",
		"zh-TW": "已有帳號？返回登錄"
	},
	reg_title: {
		zh: "注册 Jacky 账号",
		en: "Register Jacky Account",
		es: "Registrar cuenta Jacky",
		de: "Jacky-Konto registrieren",
		"zh-TW": "註冊 Jacky 帳號"
	},
	reg_username: {
		zh: "用户名",
		en: "Username",
		es: "Usuario",
		de: "Benutzername",
		"zh-TW": "用戶名"
	},
	reg_password: {
		zh: "密码",
		en: "Password",
		es: "Contraseña",
		de: "Passwort",
		"zh-TW": "密碼"
	},
	reg_password2: {
		zh: "再次输入密码",
		en: "Confirm Password",
		es: "Confirmar contraseña",
		de: "Passwort bestätigen",
		"zh-TW": "再次輸入密碼"
	},
	reg_btn: {
		zh: "注册",
		en: "Register",
		es: "Registrarse",
		de: "Registrieren",
		"zh-TW": "註冊"
	},
	reg_remember: {
		zh: "请牢记用户名和密码。如无法注册，请联系管理员。",
		en: "Please remember your username and password. Contact admin if you cannot register.",
		es: "Recuerda tu usuario y contraseña. Contacta al admin si no puedes registrarte.",
		de: "Bitte merke dir Benutzername und Passwort. Kontaktiere den Admin bei Problemen.",
		"zh-TW": "請牢記用戶名和密碼。如無法註冊，請聯繫管理員。"
	},
	terms_link: {
		zh: "用户协议",
		en: "Terms of Service",
		es: "Términos de Servicio",
		de: "Nutzungsbedingungen",
		"zh-TW": "用戶協議"
	},
	terms_content: {
		zh: '<h3>Jacky 论坛 用户协议</h3><p>注册或使用 Jacky 论坛，即表示您同意以下条款：</p><ul><li>禁止发布违法内容。</li><li>所有内容和设计归 Jacky 论坛 所有。</li><li>请妥善保管账号和密码，因账号泄露造成的损失由用户自行承担。</li><li>本论坛对内容及服务拥有最终解释权，并可随时修改协议或规则。</li><li>本论坛不保证内容绝对正确或服务持续可用。</li><li>使用本论坛即表示您接受本协议及其未来更新。</li></ul><p>如有疑问，请联系 <a href="mailto:jacky@zhujingqi.com">jacky@zhujingqi.com</a></p>',
		en: '<h3>Jacky Forum Terms of Service</h3><p>By registering or using Jacky Forum, you agree to the following terms:</p><ul><li>Do not post illegal content.</li><li>All content and design belong to Jacky Forum.</li><li>Please safeguard your account credentials. You are responsible for any losses due to account compromise.</li><li>The forum reserves final interpretation rights over content and services, and may modify these terms at any time.</li><li>The forum does not guarantee absolute correctness of content or continuous availability of service.</li><li>By using this forum, you accept this agreement and any future updates.</li></ul><p>For questions, contact <a href="mailto:jacky@zhujingqi.com">jacky@zhujingqi.com</a></p>',
		es: '<h3>Términos de Servicio del Foro Jacky</h3><p>Al registrarte o usar el Foro Jacky, aceptas los siguientes términos:</p><ul><li>No publiques contenido ilegal.</li><li>Todo el contenido y diseño pertenecen al Foro Jacky.</li><li>Protege tus credenciales. Eres responsable de las pérdidas por compromiso de cuenta.</li><li>El foro se reserva el derecho de interpretación final y puede modificar estos términos en cualquier momento.</li><li>El foro no garantiza la corrección absoluta del contenido ni la disponibilidad continua del servicio.</li><li>Al usar este foro, aceptas este acuerdo y sus futuras actualizaciones.</li></ul><p>Si tienes preguntas, contacta a <a href="mailto:jacky@zhujingqi.com">jacky@zhujingqi.com</a></p>',
		de: '<h3>Nutzungsbedingungen des Jacky Forums</h3><p>Mit der Registrierung oder Nutzung des Jacky Forums stimmst du folgenden Bedingungen zu:</p><ul><li>Keine illegalen Inhalte veröffentlichen.</li><li>Alle Inhalte und Designs gehören dem Jacky Forum.</li><li>Bewahre deine Zugangsdaten sicher auf. Du bist für Verluste durch kompromittierte Konten verantwortlich.</li><li>Das Forum behält sich das Recht der endgültigen Auslegung vor und kann diese Bedingungen jederzeit ändern.</li><li>Das Forum garantiert keine absolute Richtigkeit der Inhalte oder kontinuierliche Verfügbarkeit.</li><li>Durch die Nutzung akzeptierst du diese Vereinbarung und zukünftige Aktualisierungen.</li></ul><p>Bei Fragen kontaktiere <a href="mailto:jacky@zhujingqi.com">jacky@zhujingqi.com</a></p>',
		"zh-TW": '<h3>Jacky 論壇 用戶協議</h3><p>註冊或使用 Jacky 論壇，即表示您同意以下條款：</p><ul><li>禁止發布違法內容。</li><li>所有內容和設計歸 Jacky 論壇 所有。</li><li>請妥善保管帳號和密碼，因帳號洩露造成的損失由用戶自行承擔。</li><li>本論壇對內容及服務擁有最終解釋權，並可隨時修改協議或規則。</li><li>本論壇不保證內容絕對正確或服務持續可用。</li><li>使用本論壇即表示您接受本協議及其未來更新。</li></ul><p>如有疑問，請聯繫 <a href="mailto:jacky@zhujingqi.com">jacky@zhujingqi.com</a></p>'
	},
	reg_agree: {
		zh: "注册即代表您同意",
		en: "By registering you agree to the",
		es: "Al registrarte aceptas los",
		de: "Mit der Registrierung stimmst du den",
		"zh-TW": "註冊即代表您同意"
	},
	account_shared: {
		zh: '账号体系已与 <b><a href="https://zhujingqi.com/chat/">Jacky Chat</a></b> 互通',
		en: 'Account system is integrated with <b><a href="https://zhujingqi.com/chat/">Jacky Chat</a></b>',
		es: 'El sistema de cuentas está integrado con <b><a href="https://zhujingqi.com/chat/">Jacky Chat</a></b>',
		de: 'Das Kontosystem ist mit <b><a href="https://zhujingqi.com/chat/">Jacky Chat</a></b> integriert',
		"zh-TW": '帳號體系已與 <b><a href="https://zhujingqi.com/chat/">Jacky Chat</a></b> 互通'
	},
	home_search_ph: {
		zh: "搜索帖子内容或标签，或输入 @用户名",
		en: "Search posts or tags, or type @username",
		es: "Buscar publicaciones o etiquetas, o escribe @usuario",
		de: "Beiträge oder Tags suchen, oder @Benutzername",
		"zh-TW": "搜索帖子內容或標籤，或輸入 @用戶名"
	},
	home_search_btn: {
		zh: "搜索",
		en: "Search",
		es: "Buscar",
		de: "Suchen",
		"zh-TW": "搜索"
	},
	layout_dense: {
		zh: "信息流",
		en: "Compact",
		es: "Compacto",
		de: "Kompakt",
		"zh-TW": "信息流"
	},
	layout_normal: {
		zh: "常规",
		en: "Normal",
		es: "Normal",
		de: "Normal",
		"zh-TW": "常規"
	},
	notice_title: {
		zh: "公告",
		en: "Announcements",
		es: "Anuncios",
		de: "Ankündigungen",
		"zh-TW": "公告"
	},
	notice_welcome: {
		zh: '🎉欢迎来到 <b>Jacky 论坛</b> :)',
		en: '🎉 Welcome to <b>Jacky Forum</b> :)',
		es: '🎉 Bienvenido al <b>Foro Jacky</b> :)',
		de: '🎉 Willkommen im <b>Jacky Forum</b> :)',
		"zh-TW": '🎉歡迎來到 <b>Jacky 論壇</b> :)'
	},
	stats_title: {
		zh: "全站统计",
		en: "Site Stats",
		es: "Estadísticas",
		de: "Seiten-Statistik",
		"zh-TW": "全站統計"
	},
	stats_users: {
		zh: "用户数",
		en: "Users",
		es: "Usuarios",
		de: "Benutzer",
		"zh-TW": "用戶數"
	},
	stats_posts: {
		zh: "帖子数",
		en: "Posts",
		es: "Publicaciones",
		de: "Beiträge",
		"zh-TW": "帖子數"
	},
	stats_comments: {
		zh: "评论数",
		en: "Comments",
		es: "Comentarios",
		de: "Kommentare",
		"zh-TW": "評論數"
	},
	share_forum: {
		zh: "分享 Jacky 论坛，<br>让好友加入！",
		en: "Share Jacky Forum,<br>invite your friends!",
		es: "¡Comparte el Foro Jacky,<br>invita a tus amigos!",
		de: "Teile das Jacky Forum,<br>lade Freunde ein!",
		"zh-TW": "分享 Jacky 論壇，<br>讓好友加入！"
	},
	copy_link: {
		zh: "点击复制链接",
		en: "Click to copy link",
		es: "Clic para copiar enlace",
		de: "Klicke zum Kopieren",
		"zh-TW": "點擊複製鏈接"
	},
	copied: {
		zh: "已复制",
		en: "Copied",
		es: "Copiado",
		de: "Kopiert",
		"zh-TW": "已複製"
	},
	fortune_title: {
		zh: "今日运势",
		en: "Today's Fortune",
		es: "Fortuna de hoy",
		de: "Heutiges Glück",
		"zh-TW": "今日運勢"
	},
	fortune_btn: {
		zh: "获取运势",
		en: "Get Fortune",
		es: "Obtener fortuna",
		de: "Glück holen",
		"zh-TW": "獲取運勢"
	},
	fortune_good: {
		zh: "宜",
		en: "Good for",
		es: "Bueno para",
		de: "Gut für",
		"zh-TW": "宜"
	},
	fortune_bad: {
		zh: "忌",
		en: "Avoid",
		es: "Evitar",
		de: "Vermeiden",
		"zh-TW": "忌"
	},
	random_post_btn: {
		zh: "随机帖子",
		en: "Random Post",
		es: "Publicación aleatoria",
		de: "Zufälliger Beitrag",
		"zh-TW": "隨機帖子"
	},
	announcement_btn: {
		zh: "最新公告",
		en: "Announcement",
		es: "Anuncio",
		de: "Ankündigung",
		"zh-TW": "最新公告"
	},
	editor_custom_tag_ph: {
		zh: "自定义标签（你也可以不选择任何标签）",
		en: "Custom tag (optional)",
		es: "Etiqueta personalizada (opcional)",
		de: "Eigenes Tag (optional)",
		"zh-TW": "自定義標籤（你也可以不選擇任何標籤）"
	},
	editor_sensitive: {
		zh: "此帖子可能包含不适宜的内容",
		en: "This post may contain inappropriate content",
		es: "Esta publicación puede contener contenido inapropiado",
		de: "Dieser Beitrag könnte unangemessene Inhalte enthalten",
		"zh-TW": "此帖子可能包含不適宜的內容"
	},
	editor_warn_ph: {
		zh: "自定义遮罩显示文字（可不填）",
		en: "Custom warning text (optional)",
		es: "Texto de advertencia personalizado (opcional)",
		de: "Eigener Warntext (optional)",
		"zh-TW": "自定義遮罩顯示文字（可不填）"
	},
	editor_bg: {
		zh: "背景",
		en: "Background",
		es: "Fondo",
		de: "Hintergrund",
		"zh-TW": "背景"
	},
	editor_bg_used: {
		zh: "已使用",
		en: "Applied",
		es: "Aplicado",
		de: "Angewendet",
		"zh-TW": "已使用"
	},
	editor_send: {
		zh: "发布",
		en: "Post",
		es: "Publicar",
		de: "Posten",
		"zh-TW": "發佈"
	},
	editor_ph: {
		zh: "发布新鲜事（最多5000字符）",
		en: "Post something new (max 5000 chars)",
		es: "Publica algo nuevo (máx 5000 caracteres)",
		de: "Poste etwas Neues (max 5000 Zeichen)",
		"zh-TW": "發佈新鮮事（最多5000字符）"
	},
	editor_insert_img: {
		zh: "插图",
		en: "Insert Image",
		es: "Insertar imagen",
		de: "Bild einfügen",
		"zh-TW": "插圖"
	},
	editor_insert_music: {
		zh: "插入音乐",
		en: "Insert Music",
		es: "Insertar música",
		de: "Musik einfügen",
		"zh-TW": "插入音樂"
	},
	rankings_title: {
		zh: "排行榜",
		en: "Leaderboard",
		es: "Tabla de clasificación",
		de: "Rangliste",
		"zh-TW": "排行榜"
	},
	rankings_search_ph: {
		zh: "搜索用户名...",
		en: "Search username...",
		es: "Buscar usuario...",
		de: "Benutzername suchen...",
		"zh-TW": "搜索用戶名..."
	},
	rankings_col_name: {
		zh: "用户名",
		en: "Username",
		es: "Usuario",
		de: "Benutzername",
		"zh-TW": "用戶名"
	},
	rankings_col_coins: {
		zh: "金币数",
		en: "Coins",
		es: "Monedas",
		de: "Münzen",
		"zh-TW": "金幣數"
	},
	new_users_title: {
		zh: "欢迎新用户",
		en: "Welcome New Users",
		es: "Bienvenidos nuevos usuarios",
		de: "Willkommen neue Benutzer",
		"zh-TW": "歡迎新用戶"
	},
	post_unknown: {
		zh: "未知",
		en: "Unknown",
		es: "Desconocido",
		de: "Unbekannt",
		"zh-TW": "未知"
	},
	post_share: {
		zh: "分享",
		en: "Share",
		es: "Compartir",
		de: "Teilen",
		"zh-TW": "分享"
	},
	post_likers: {
		zh: "点赞者",
		en: "Liked by",
		es: "Gustado por",
		de: "Gefällt",
		"zh-TW": "點讚者"
	},
	post_dislikers: {
		zh: "踩帖者",
		en: "Disliked by",
		es: "No gustado por",
		de: "Gefällt nicht",
		"zh-TW": "踩帖者"
	},
	post_delete: {
		zh: "删除",
		en: "Delete",
		es: "Eliminar",
		de: "Löschen",
		"zh-TW": "刪除"
	},
	post_comment_ph: {
		zh: "评论...",
		en: "Comment...",
		es: "Comentar...",
		de: "Kommentieren...",
		"zh-TW": "評論..."
	},
	post_send: {
		zh: "发送",
		en: "Send",
		es: "Enviar",
		de: "Senden",
		"zh-TW": "發送"
	},
	reply: {
		zh: "回复",
		en: "Reply",
		es: "Responder",
		de: "Antworten",
		"zh-TW": "回覆"
	},
	reply_ph: {
		zh: "回复 {0}...",
		en: "Reply to {0}...",
		es: "Responder a {0}...",
		de: "Antworte {0}...",
		"zh-TW": "回覆 {0}..."
	},
	post_expand: {
		zh: "展开",
		en: "Expand",
		es: "Expandir",
		de: "Ausklappen",
		"zh-TW": "展開"
	},
	post_collapse: {
		zh: "收起",
		en: "Collapse",
		es: "Contraer",
		de: "Einklappen",
		"zh-TW": "收起"
	},
	post_show_content: {
		zh: "显示内容",
		en: "Show Content",
		es: "Mostrar contenido",
		de: "Inhalt anzeigen",
		"zh-TW": "顯示內容"
	},
	post_load_img: {
		zh: "点击加载图片",
		en: "Click to load image",
		es: "Clic para cargar imagen",
		de: "Zum Laden klicken",
		"zh-TW": "點擊加載圖片"
	},
	post_no_posts: {
		zh: "暂无帖子",
		en: "No posts yet",
		es: "No hay publicaciones",
		de: "Keine Beiträge",
		"zh-TW": "暫無帖子"
	},
	post_not_found: {
		zh: "帖子不存在或已删除",
		en: "Post not found or deleted",
		es: "Publicación no encontrada o eliminada",
		de: "Beitrag nicht gefunden oder gelöscht",
		"zh-TW": "帖子不存在或已刪除"
	},
	modal_close: {
		zh: "关闭",
		en: "Close",
		es: "Cerrar",
		de: "Schließen",
		"zh-TW": "關閉"
	},
	modal_loading: {
		zh: "加载中...",
		en: "Loading...",
		es: "Cargando...",
		de: "Lädt...",
		"zh-TW": "加載中..."
	},
	modal_load_fail: {
		zh: "加载失败",
		en: "Load failed",
		es: "Error al cargar",
		de: "Laden fehlgeschlagen",
		"zh-TW": "加載失敗"
	},
	modal_confirm_delete: {
		zh: "确认删除这条帖子吗？",
		en: "Confirm delete this post?",
		es: "¿Confirmar eliminar esta publicación?",
		de: "Diesen Beitrag wirklich löschen?",
		"zh-TW": "確認刪除這條帖子嗎？"
	},
	modal_irreversible: {
		zh: "此操作不可撤销",
		en: "This action is irreversible",
		es: "Esta acción es irreversible",
		de: "Diese Aktion ist unwiderruflich",
		"zh-TW": "此操作不可撤銷"
	},
	modal_confirm_btn: {
		zh: "确认删除",
		en: "Confirm Delete",
		es: "Confirmar eliminar",
		de: "Löschen bestätigen",
		"zh-TW": "確認刪除"
	},
	modal_delete_all: {
		zh: "删除全部",
		en: "Delete All",
		es: "Eliminar todo",
		de: "Alle löschen",
		"zh-TW": "刪除全部"
	},
	modal_mark_read: {
		zh: "全部已读",
		en: "Mark All Read",
		es: "Marcar todo leído",
		de: "Alle als gelesen",
		"zh-TW": "全部已讀"
	},
	modal_no_notifs: {
		zh: "暂无通知",
		en: "No notifications",
		es: "Sin notificaciones",
		de: "Keine Benachrichtigungen",
		"zh-TW": "暫無通知"
	},
	notif_comment: {
		zh: "评论了你的帖子",
		en: "commented on your post",
		es: "comentó tu publicación",
		de: "hat deinen Beitrag kommentiert",
		"zh-TW": "評論了你的帖子"
	},
	notif_mention: {
		zh: "@ 了你",
		en: "@mentioned you",
		es: "te @mencionó",
		de: "hat dich @erwähnt",
		"zh-TW": "@ 了你"
	},
	notif_gift: {
		zh: "送了你一个礼物！",
		en: "sent you a gift!",
		es: "¡te envió un regalo!",
		de: "hat dir ein Geschenk geschickt!",
		"zh-TW": "送了你一個禮物！"
	},
	notif_follow: {
		zh: "关注了你",
		en: "followed you",
		es: "te siguió",
		de: "folgt dir",
		"zh-TW": "關注了你"
	},
	notif_friend: {
		zh: "添加了你为好友",
		en: "added you as a friend",
		es: "te añadió como amigo",
		de: "hat dich als Freund hinzugefügt",
		"zh-TW": "添加了你為好友"
	},
	notif_reply: {
		zh: "回复了你的评论",
		en: "replied to your comment",
		es: "respondió a tu comentario",
		de: "hat auf deinen Kommentar geantwortet",
		"zh-TW": "回覆了你的評論"
	},
	notif_new: {
		zh: "有新通知",
		en: "New notification",
		es: "Nueva notificación",
		de: "Neue Benachrichtigung",
		"zh-TW": "有新通知"
	},
	notif_chat: {
		zh: "Jacky Chat",
		en: "Jacky Chat",
		es: "Jacky Chat",
		de: "Jacky Chat",
		"zh-TW": "Jacky Chat"
	},
	notif_chat_msg: {
		zh: "有 {0} 条未读消息",
		en: "{0} unread messages",
		es: "{0} mensajes no leídos",
		de: "{0} ungelesene Nachrichten",
		"zh-TW": "有 {0} 條未讀訊息"
	},
	notif_op_reply: {
		zh: "帖主评论了你参与的帖子",
		en: "OP commented on a post you interacted with",
		es: "El OP comentó en una publicación en la que participaste",
		de: "OP hat einen Beitrag kommentiert, an dem du beteiligt warst",
		"zh-TW": "帖主評論了你參與的帖子"
	},
	notif_title: {
		zh: "通知",
		en: "Notifications",
		es: "Notificaciones",
		de: "Benachrichtigungen",
		"zh-TW": "通知"
	},
	guest_modal_title: {
		zh: "请先登录后再使用此功能",
		en: "Please login to use this feature",
		es: "Inicia sesión para usar esta función",
		de: "Bitte melde dich an",
		"zh-TW": "請先登錄後再使用此功能"
	},
	guest_go_login: {
		zh: "去登录",
		en: "Go to Login",
		es: "Ir a iniciar sesión",
		de: "Zum Login",
		"zh-TW": "去登錄"
	},
	welcome_back: {
		zh: "欢迎 <b>{0}</b> 来到 <b>Jacky</b> 论坛！",
		en: "Welcome <b>{0}</b> to <b>Jacky</b> Forum!",
		es: "¡Bienvenido <b>{0}</b> al <b>Foro Jacky</b>!",
		de: "Willkommen <b>{0}</b> im <b>Jacky</b> Forum!",
		"zh-TW": "歡迎 <b>{0}</b> 來到 <b>Jacky</b> 論壇！"
	},
	profile_logout: {
		zh: "登出",
		en: "Logout",
		es: "Cerrar sesión",
		de: "Abmelden",
		"zh-TW": "登出"
	},
	profile_edit_avatar: {
		zh: "修改头像",
		en: "Edit Avatar",
		es: "Cambiar avatar",
		de: "Avatar ändern",
		"zh-TW": "修改頭像"
	},
	profile_edit: {
		zh: "编辑",
		en: "Edit",
		es: "Editar",
		de: "Bearbeiten",
		"zh-TW": "編輯"
	},
	profile_coins: {
		zh: "金币",
		en: "Coins",
		es: "Monedas",
		de: "Münzen",
		"zh-TW": "金幣"
	},
	profile_reg_time: {
		zh: "注册时间",
		en: "Registered",
		es: "Registrado",
		de: "Registriert",
		"zh-TW": "註冊時間"
	},
	profile_no_desc: {
		zh: "暂无简介",
		en: "No bio",
		es: "Sin biografía",
		de: "Keine Bio",
		"zh-TW": "暫無簡介"
	},
	profile_edit_desc: {
		zh: "编辑个人简介",
		en: "Edit Bio",
		es: "Editar biografía",
		de: "Bio bearbeiten",
		"zh-TW": "編輯個人簡介"
	},
	profile_save: {
		zh: "保存",
		en: "Save",
		es: "Guardar",
		de: "Speichern",
		"zh-TW": "保存"
	},
	profile_view_my_posts: {
		zh: "查看我的帖子",
		en: "View my posts",
		es: "Ver mis publicaciones",
		de: "Meine Beiträge",
		"zh-TW": "查看我的帖子"
	},
	profile_view_posts: {
		zh: "查看{0}的帖子",
		en: "View {0}'s posts",
		es: "Ver publicaciones de {0}",
		de: "{0}s Beiträge ansehen",
		"zh-TW": "查看{0}的帖子"
	},
	profile_shop: {
		zh: "商店",
		en: "Shop",
		es: "Tienda",
		de: "Shop",
		"zh-TW": "商店"
	},
	profile_about: {
		zh: "关于",
		en: "About",
		es: "Acerca de",
		de: "Über",
		"zh-TW": "關於"
	},
	profile_sponsor: {
		zh: "赞助",
		en: "Sponsor",
		es: "Patrocinar",
		de: "Sponsor",
		"zh-TW": "贊助"
	},
	profile_theme_sys: {
		zh: "跟随系统",
		en: "System",
		es: "Sistema",
		de: "System",
		"zh-TW": "跟隨系統"
	},
	profile_theme_light: {
		zh: "浅色",
		en: "Light",
		es: "Claro",
		de: "Hell",
		"zh-TW": "淺色"
	},
	profile_theme_dark: {
		zh: "深色",
		en: "Dark",
		es: "Oscuro",
		de: "Dunkel",
		"zh-TW": "深色"
	},
	level_rules_title: {
		zh: "等级规则",
		en: "Level Rules",
		es: "Reglas de nivel",
		de: "Level-Regeln",
		"zh-TW": "等級規則"
	},
	coin_rules_title: {
		zh: "金币规则",
		en: "Coin Rules",
		es: "Reglas de monedas",
		de: "Münz-Regeln",
		"zh-TW": "金幣規則"
	},
	register_fail: {
		zh: "注册失败：{0}",
		en: "Registration failed: {0}",
		es: "Registro fallido: {0}",
		de: "Registrierung fehlgeschlagen: {0}",
		"zh-TW": "註冊失敗：{0}"
	},
	register_ok: {
		zh: "注册成功！",
		en: "Registration successful!",
		es: "¡Registro exitoso!",
		de: "Registrierung erfolgreich!",
		"zh-TW": "註冊成功！"
	},
	user_not_found: {
		zh: "用户不存在",
		en: "User not found",
		es: "Usuario no encontrado",
		de: "Benutzer nicht gefunden",
		"zh-TW": "用戶不存在"
	},
	wrong_password: {
		zh: "密码错误",
		en: "Wrong password",
		es: "Contraseña incorrecta",
		de: "Falsches Passwort",
		"zh-TW": "密碼錯誤"
	},
	name_invalid: {
		zh: "用户名只允许字母、数字、- 和 _",
		en: "Username only allows letters, numbers, - and _",
		es: "El usuario solo permite letras, números, - y _",
		de: "Benutzername nur Buchstaben, Zahlen, - und _",
		"zh-TW": "用戶名只允許字母、數字、- 和 _"
	},
	no_impersonate: {
		zh: "请勿有冒充管理员的想法",
		en: "Please do not impersonate admin",
		es: "No intentes suplantar al administrador",
		de: "Bitte gib dich nicht als Admin aus",
		"zh-TW": "請勿有冒充管理員的想法"
	},
	pwd_mismatch: {
		zh: "两次密码不一致",
		en: "Passwords do not match",
		es: "Las contraseñas no coinciden",
		de: "Passwörter stimmen nicht überein",
		"zh-TW": "兩次密碼不一致"
	},
	enter_user_pass: {
		zh: "请输入账号密码",
		en: "Please enter username and password",
		es: "Ingresa usuario y contraseña",
		de: "Bitte Benutzername und Passwort eingeben",
		"zh-TW": "請輸入帳號密碼"
	},
	enter_user_pass_reg: {
		zh: "请输入用户名和密码",
		en: "Please enter username and password",
		es: "Ingresa usuario y contraseña",
		de: "Bitte Benutzername und Passwort eingeben",
		"zh-TW": "請輸入用戶名和密碼"
	},
	post_fail: {
		zh: "发帖失败：{0}",
		en: "Post failed: {0}",
		es: "Error al publicar: {0}",
		de: "Posten fehlgeschlagen: {0}",
		"zh-TW": "發帖失敗：{0}"
	},
	comment_fail: {
		zh: "评论失败：{0}",
		en: "Comment failed: {0}",
		es: "Error al comentar: {0}",
		de: "Kommentar fehlgeschlagen: {0}",
		"zh-TW": "評論失敗：{0}"
	},
	like_fail: {
		zh: "操作失败",
		en: "Operation failed",
		es: "Operación fallida",
		de: "Vorgang fehlgeschlagen",
		"zh-TW": "操作失敗"
	},
	dislike_fail: {
		zh: "操作失败",
		en: "Operation failed",
		es: "Operación fallida",
		de: "Vorgang fehlgeschlagen",
		"zh-TW": "操作失敗"
	},
	notif_load_fail: {
		zh: "通知加载失败：{0}",
		en: "Notification load failed: {0}",
		es: "Error al cargar notificaciones: {0}",
		de: "Benachrichtigungen laden fehlgeschlagen: {0}",
		"zh-TW": "通知加載失敗：{0}"
	},
	delete_fail: {
		zh: "删除失败：{0}",
		en: "Delete failed: {0}",
		es: "Error al eliminar: {0}",
		de: "Löschen fehlgeschlagen: {0}",
		"zh-TW": "刪除失敗：{0}"
	},
	save_fail: {
		zh: "保存失败：{0}",
		en: "Save failed: {0}",
		es: "Error al guardar: {0}",
		de: "Speichern fehlgeschlagen: {0}",
		"zh-TW": "保存失敗：{0}"
	},
	read_fail: {
		zh: "读取失败：{0}",
		en: "Read failed: {0}",
		es: "Error al leer: {0}",
		de: "Lesen fehlgeschlagen: {0}",
		"zh-TW": "讀取失敗：{0}"
	},
	coins_insufficient: {
		zh: "金币不足",
		en: "Insufficient coins",
		es: "Monedas insuficientes",
		de: "Nicht genug Münzen",
		"zh-TW": "金幣不足"
	},
	coin_penalty: {
		zh: "你已被禁止获得金币！",
		en: "You are banned from earning coins!",
		es: "¡Tienes prohibido ganar monedas!",
		de: "Du bist vom Münzverdienst ausgeschlossen!",
		"zh-TW": "你已被禁止獲得金幣！"
	},
	coin_add: {
		zh: "金币 +{0}！",
		en: "Coins +{0}!",
		es: "¡Monedas +{0}!",
		de: "Münzen +{0}!",
		"zh-TW": "金幣 +{0}！"
	},
	coin_sub: {
		zh: "金币 -{0}！",
		en: "Coins -{0}!",
		es: "¡Monedas -{0}!",
		de: "Münzen -{0}!",
		"zh-TW": "金幣 -{0}！"
	},
	copied_link_msg: {
		zh: "已复制链接",
		en: "Link copied",
		es: "Enlace copiado",
		de: "Link kopiert",
		"zh-TW": "已複製鏈接"
	},
	bg_applied: {
		zh: "已应用背景，金币 -15",
		en: "Background applied, coins -15",
		es: "Fondo aplicado, monedas -15",
		de: "Hintergrund angewendet, Münzen -15",
		"zh-TW": "已應用背景，金幣 -15"
	},
	vote_who_like: {
		zh: "谁赞了",
		en: "Who liked",
		es: "Quién gustó",
		de: "Wer gefällt",
		"zh-TW": "誰讚了"
	},
	vote_who_dislike: {
		zh: "谁踩了",
		en: "Who disliked",
		es: "Quién no gustó",
		de: "Wer gefällt nicht",
		"zh-TW": "誰踩了"
	},
	vote_none: {
		zh: "暂无",
		en: "None",
		es: "Ninguno",
		de: "Keine",
		"zh-TW": "暫無"
	},
	shop_title: {
		zh: "商店",
		en: "Shop",
		es: "Tienda",
		de: "Shop",
		"zh-TW": "商店"
	},
	shop_close: {
		zh: "关闭",
		en: "Close",
		es: "Cerrar",
		de: "Schließen",
		"zh-TW": "關閉"
	},
	shop_coins: {
		zh: "当前金币：{0}",
		en: "Current coins: {0}",
		es: "Monedas actuales: {0}",
		de: "Aktuelle Münzen: {0}",
		"zh-TW": "當前金幣：{0}"
	},
	shop_badges: {
		zh: "徽章",
		en: "Badges",
		es: "Insignias",
		de: "Abzeichen",
		"zh-TW": "徽章"
	},
	shop_equipped: {
		zh: "已装备",
		en: "Equipped",
		es: "Equipado",
		de: "Ausgerüstet",
		"zh-TW": "已裝備"
	},
	shop_equip: {
		zh: "装备",
		en: "Equip",
		es: "Equipar",
		de: "Ausrüsten",
		"zh-TW": "裝備"
	},
	shop_lottery: {
		zh: "金币抽奖",
		en: "Coin Lottery",
		es: "Lotería de monedas",
		de: "Münz-Lotterie",
		"zh-TW": "金幣抽獎"
	},
	shop_lottery_desc: {
		zh: "10金币抽一次，99金币十连抽",
		en: "10 coins per spin, 99 for 10 spins",
		es: "10 monedas por giro, 99 por 10 giros",
		de: "10 Münzen pro Dreh, 99 für 10 Drehs",
		"zh-TW": "10金幣抽一次，99金幣十連抽"
	},
	shop_lottery_start: {
		zh: "开始",
		en: "Start",
		es: "Comenzar",
		de: "Start",
		"zh-TW": "開始"
	},
	lottery_title: {
		zh: "金币抽奖",
		en: "Coin Lottery",
		es: "Lotería de monedas",
		de: "Münz-Lotterie",
		"zh-TW": "金幣抽獎"
	},
	lottery_spin1: {
		zh: "抽一次 (10金币)",
		en: "Spin Once (10 coins)",
		es: "Girar una vez (10 monedas)",
		de: "Einmal drehen (10 Münzen)",
		"zh-TW": "抽一次 (10金幣)"
	},
	lottery_spin10: {
		zh: "十连抽 (99金币)",
		en: "10 Spins (99 coins)",
		es: "10 giros (99 monedas)",
		de: "10 Drehs (99 Münzen)",
		"zh-TW": "十連抽 (99金幣)"
	},
	lottery_no_coins: {
		zh: "金币不足！",
		en: "Not enough coins!",
		es: "¡Monedas insuficientes!",
		de: "Nicht genug Münzen!",
		"zh-TW": "金幣不足！"
	},
	lottery_10_result: {
		zh: "十连抽结果",
		en: "10-Spin Result",
		es: "Resultado de 10 giros",
		de: "10-Dreh Ergebnis",
		"zh-TW": "十連抽結果"
	},
	lottery_badge_won: {
		zh: "获得称号：{0}！",
		en: "Got badge: {0}!",
		es: "¡Insignia obtenida: {0}!",
		de: "Abzeichen erhalten: {0}!",
		"zh-TW": "獲得稱號：{0}！"
	},
	filter_all: {
		zh: "全部",
		en: "All",
		es: "Todo",
		de: "Alle",
		"zh-TW": "全部"
	},
	filter_announce: {
		zh: "公告",
		en: "Announcements",
		es: "Anuncios",
		de: "Ankündigungen",
		"zh-TW": "公告"
	},
	filter_other: {
		zh: "其它",
		en: "Other",
		es: "Otro",
		de: "Sonstige",
		"zh-TW": "其它"
	},
	filter_following: {
		zh: "关注",
		en: "Following",
		es: "Siguiendo",
		de: "Gefolgt",
		"zh-TW": "關注"
	},
	img_insert_title: {
		zh: "插入图片",
		en: "Insert Image",
		es: "Insertar imagen",
		de: "Bild einfügen",
		"zh-TW": "插入圖片"
	},
	img_url_ph: {
		zh: "图片链接（http/https）",
		en: "Image URL (http/https)",
		es: "URL de imagen (http/https)",
		de: "Bild-URL (http/https)",
		"zh-TW": "圖片鏈接（http/https）"
	},
	img_hint: {
		zh: "提示：支持 http/https 图片链接",
		en: "Tip: supports http/https image links",
		es: "Consejo: admite enlaces http/https",
		de: "Tipp: unterstützt http/https Bildlinks",
		"zh-TW": "提示：支持 http/https 圖片鏈接"
	},
	img_apply: {
		zh: "插入",
		en: "Insert",
		es: "Insertar",
		de: "Einfügen",
		"zh-TW": "插入"
	},
	img_enter_url: {
		zh: "请输入图片链接",
		en: "Please enter image URL",
		es: "Ingresa la URL de la imagen",
		de: "Bitte Bild-URL eingeben",
		"zh-TW": "請輸入圖片鏈接"
	},
	img_invalid_url: {
		zh: "图片链接必须以 http:// 或 https:// 开头",
		en: "Image URL must start with http:// or https://",
		es: "La URL debe comenzar con http:// o https://",
		de: "Bild-URL muss mit http:// oder https:// beginnen",
		"zh-TW": "圖片鏈接必須以 http:// 或 https:// 開頭"
	},
	music_insert_title: {
		zh: "插入音乐",
		en: "Insert Music",
		es: "Insertar música",
		de: "Musik einfügen",
		"zh-TW": "插入音樂"
	},
	music_url_ph: {
		zh: "网易云/QQ音乐链接",
		en: "NetEase/QQ Music link",
		es: "Enlace de NetEase/QQ Music",
		de: "NetEase/QQ Music Link",
		"zh-TW": "網易雲/QQ音樂鏈接"
	},
	music_hint: {
		zh: "提示：支持网易云音乐和 QQ 音乐歌曲链接",
		en: "Tip: supports NetEase and QQ Music links",
		es: "Consejo: admite enlaces de NetEase y QQ Music",
		de: "Tipp: unterstützt NetEase und QQ Music Links",
		"zh-TW": "提示：支持網易雲音樂和 QQ 音樂歌曲鏈接"
	},
	music_apply: {
		zh: "插入",
		en: "Insert",
		es: "Insertar",
		de: "Einfügen",
		"zh-TW": "插入"
	},
	music_enter_url: {
		zh: "请输入音乐链接",
		en: "Please enter music link",
		es: "Ingresa el enlace de música",
		de: "Bitte Musik-Link eingeben",
		"zh-TW": "請輸入音樂鏈接"
	},
	music_invalid: {
		zh: "请填写网易云音乐或 QQ 音乐链接",
		en: "Please enter a NetEase or QQ Music link",
		es: "Ingresa un enlace de NetEase o QQ Music",
		de: "Bitte NetEase oder QQ Music Link eingeben",
		"zh-TW": "請填寫網易雲音樂或 QQ 音樂鏈接"
	},
	music_no_id: {
		zh: "没找到歌曲 id",
		en: "Song ID not found",
		es: "ID de canción no encontrado",
		de: "Song-ID nicht gefunden",
		"zh-TW": "沒找到歌曲 id"
	},
	avatar_title: {
		zh: "修改头像",
		en: "Edit Avatar",
		es: "Cambiar avatar",
		de: "Avatar ändern",
		"zh-TW": "修改頭像"
	},
	avatar_url_ph: {
		zh: "头像链接（http/https）",
		en: "Avatar URL (http/https)",
		es: "URL del avatar (http/https)",
		de: "Avatar-URL (http/https)",
		"zh-TW": "頭像鏈接（http/https）"
	},
	avatar_save: {
		zh: "保存",
		en: "Save",
		es: "Guardar",
		de: "Speichern",
		"zh-TW": "保存"
	},
	avatar_cancel: {
		zh: "取消",
		en: "Cancel",
		es: "Cancelar",
		de: "Abbrechen",
		"zh-TW": "取消"
	},
	avatar_invalid: {
		zh: "头像链接必须以 http:// 或 https:// 开头",
		en: "Avatar URL must start with http:// or https://",
		es: "La URL del avatar debe comenzar con http:// o https://",
		de: "Avatar-URL muss mit http:// oder https:// beginnen",
		"zh-TW": "頭像鏈接必須以 http:// 或 https:// 開頭"
	},
	card_bg_title: {
		zh: "修改背景图",
		en: "Edit Background",
		es: "Editar fondo",
		de: "Hintergrund bearbeiten",
		"zh-TW": "修改背景圖"
	},
	card_bg_url_ph: {
		zh: "背景图链接（http/https）",
		en: "Background URL (http/https)",
		es: "URL del fondo (http/https)",
		de: "Hintergrund-URL (http/https)",
		"zh-TW": "背景圖鏈接（http/https）"
	},
	card_bg_invalid: {
		zh: "链接必须以 http:// 或 https:// 开头",
		en: "URL must start with http:// or https://",
		es: "La URL debe comenzar con http:// o https://",
		de: "URL muss mit http:// oder https:// beginnen",
		"zh-TW": "鏈接必須以 http:// 或 https:// 開頭"
	},
	card_bg_remove: {
		zh: "移除背景",
		en: "Remove Background",
		es: "Quitar fondo",
		de: "Hintergrund entfernen",
		"zh-TW": "移除背景"
	},
	settings_change_pass: {
		zh: "修改密码",
		en: "Change Password",
		es: "Cambiar contraseña",
		de: "Passwort ändern",
		"zh-TW": "修改密碼"
	},
	pass_old: {
		zh: "旧密码",
		en: "Old password",
		es: "Contraseña actual",
		de: "Altes Passwort",
		"zh-TW": "舊密碼"
	},
	pass_new: {
		zh: "新密码（至少 6 位）",
		en: "New password (min 6 chars)",
		es: "Nueva contraseña (mín. 6 caracteres)",
		de: "Neues Passwort (mind. 6 Zeichen)",
		"zh-TW": "新密碼（至少 6 位）"
	},
	pass_confirm: {
		zh: "确认新密码",
		en: "Confirm new password",
		es: "Confirmar nueva contraseña",
		de: "Neues Passwort bestätigen",
		"zh-TW": "確認新密碼"
	},
	pass_changed_ok: {
		zh: "密码已修改",
		en: "Password changed",
		es: "Contraseña cambiada",
		de: "Passwort geändert",
		"zh-TW": "密碼已修改"
	},
	pass_too_short: {
		zh: "新密码至少 6 位",
		en: "Password must be at least 6 characters",
		es: "La contraseña debe tener al menos 6 caracteres",
		de: "Das Passwort muss mindestens 6 Zeichen lang sein",
		"zh-TW": "新密碼至少 6 位"
	},
	pass_mismatch: {
		zh: "两次输入的新密码不一致",
		en: "Passwords do not match",
		es: "Las contraseñas no coinciden",
		de: "Passwörter stimmen nicht überein",
		"zh-TW": "兩次輸入的新密碼不一致"
	},
	timeline_today: {
		zh: "今天",
		en: "Today",
		es: "Hoy",
		de: "Heute",
		"zh-TW": "今天"
	},
	settings_lang: {
		zh: "语言",
		en: "Language",
		es: "Idioma",
		de: "Sprache",
		"zh-TW": "語言"
	},
	settings_rss: {
		zh: "订阅 RSS",
		en: "Subscribe to RSS",
		es: "Suscribirse al RSS",
		de: "RSS abonnieren",
		"zh-TW": "訂閱 RSS"
	},
	timeline_posts: {
		zh: "{0} 帖",
		en: "{0} posts",
		es: "{0} publicaciones",
		de: "{0} Beiträge",
		"zh-TW": "{0} 帖"
	},
	bg_picker_title: {
		zh: "背景",
		en: "Background",
		es: "Fondo",
		de: "Hintergrund",
		"zh-TW": "背景"
	},
	bg_picker_desc: {
		zh: "花 15 金币，给这条帖子加一个彩色背景",
		en: "Spend 15 coins to add a colored background",
		es: "Gasta 15 monedas para añadir un fondo de color",
		de: "15 Münzen für einen farbigen Hintergrund",
		"zh-TW": "花 15 金幣，給這條帖子加一個彩色背景"
	},
	bg_apply: {
		zh: "确定",
		en: "Confirm",
		es: "Confirmar",
		de: "Bestätigen",
		"zh-TW": "確定"
	},
	warn_default: {
		zh: "可能包含不适宜的内容",
		en: "May contain inappropriate content",
		es: "Puede contener contenido inapropiado",
		de: "Könnte unangenehme Inhalte enthalten",
		"zh-TW": "可能包含不適宜的內容"
	},
	location_fail: {
		zh: "定位帖子失败：{0}",
		en: "Failed to locate post: {0}",
		es: "Error al localizar publicación: {0}",
		de: "Beitrag konnte nicht gefunden werden: {0}",
		"zh-TW": "定位帖子失敗：{0}"
	},
	jump_ph: {
		zh: "跳转",
		en: "Go to",
		es: "Ir a",
		de: "Gehe zu",
		"zh-TW": "跳轉"
	},
	guest_more: {
		zh: "查看更多 →",
		en: "View More →",
		es: "Ver más →",
		de: "Mehr anzeigen →",
		"zh-TW": "查看更多 →"
	},
	discover_title: {
		zh: "探索",
		en: "Discover",
		es: "Explorar",
		de: "Entdecken",
		"zh-TW": "探索"
	},
	lang_label: {
		zh: "语言",
		en: "Language",
		es: "Idioma",
		de: "Sprache",
		"zh-TW": "語言"
	},
	gift_received: {
		zh: "你收到了一个{0}已存入金币！",
		en: "You received a {0}, added to coins!",
		es: "¡Recibiste un {0}, añadido a monedas!",
		de: "Du hast ein {0} erhalten, zu Münzen hinzugefügt!",
		"zh-TW": "你收到了一個{0}已存入金幣！"
	},
	error_generic: {
		zh: "出错了：{0}",
		en: "Error: {0}",
		es: "Error: {0}",
		de: "Fehler: {0}",
		"zh-TW": "出錯了：{0}"
	},
	level_full: {
		zh: "已满级！",
		en: "Max level!",
		es: "¡Nivel máximo!",
		de: "Max Level!",
		"zh-TW": "已滿級！"
	},
	level_distance: {
		zh: "距离 {0} 还差 {1} 金币",
		en: "{1} coins away from {0}",
		es: "{1} monedas para {0}",
		de: "{1} Münzen bis {0}",
		"zh-TW": "距離 {0} 還差 {1} 金幣"
	},
	online_none: {
		zh: "当前没有在线用户",
		en: "No users online",
		es: "Sin usuarios en línea",
		de: "Keine Benutzer online",
		"zh-TW": "當前沒有在線用戶"
	},
	online_title: {
		zh: "当前在线 {0} 人",
		en: "{0} online",
		es: "{0} en línea",
		de: "{0} online",
		"zh-TW": "當前在線 {0} 人"
	},
	online_label_prefix: {
		zh: "在线 ",
		en: "Online ",
		es: "En línea ",
		de: "Online ",
		"zh-TW": "在線 "
	},
	shop_item_generic: {
		zh: "礼物",
		en: "gift",
		es: "regalo",
		de: "Geschenk",
		"zh-TW": "禮物"
	},
	level_rules_content: {
		zh: "1. 等级分为 LV0 - LV12 共 13 个等级<br>2. 不同等级会有不同颜色区分<br>3. 金币到达某数量后，自动升级<br>4. 获取金币并提升等级吧！",
		en: "1. There are 13 levels: LV0 - LV12<br>2. Different levels have different colors<br>3. Auto-level-up when reaching coin thresholds<br>4. Earn coins and level up!",
		es: "1. Hay 13 niveles: LV0 - LV12<br>2. Diferentes niveles tienen colores diferentes<br>3. Subida de nivel automática al alcanzar umbrales de monedas<br>4. ¡Gana monedas y sube de nivel!",
		de: "1. Es gibt 13 Stufen: LV0 - LV12<br>2. Verschiedene Stufen haben verschiedene Farben<br>3. Automatischer Aufstieg beim Erreichen von Münz-Schwellenwerten<br>4. Verdiene Münzen und steige auf!",
		"zh-TW": "1. 等級分為 LV0 - LV12 共 13 個等級<br>2. 不同等級會有不同顏色區分<br>3. 金幣到達某數量後，自動升級<br>4. 獲取金幣並提升等級吧！"
	},
	coin_rules_content: {
		zh: "1. 发布 +5 金币<br>2. 评论 +3 金币<br>3. 点赞 +1 金币<br>4. 踩 +(-1) 金币<br>5. 删除帖子、内容或取消点赞，减少对应数量金币<br>金币用途：提升等级；购买彩色帖子背景；商店中购买徽章、礼物；金币抽奖",
		en: "1. Post +5 coins<br>2. Comment +3 coins<br>3. Like +1 coin<br>4. Dislike -1 coin<br>5. Deleting posts/content or unliking reduces coins accordingly<br>Uses: Level up; Buy colorful post backgrounds; Buy badges & gifts in shop; Coin lottery",
		es: "1. Publicar +5 monedas<br>2. Comentar +3 monedas<br>3. Me gusta +1 moneda<br>4. No me gusta -1 moneda<br>5. Eliminar publicaciones/contenido o quitar me gusta reduce monedas<br>Usos: Subir de nivel; Comprar fondos de publicación coloridos; Comprar insignias y regalos en la tienda; Lotería de monedas",
		de: "1. Posten +5 Münzen<br>2. Kommentieren +3 Münzen<br>3. Like +1 Münze<br>4. Dislike -1 Münze<br>5. Löschen von Posts/Inhalten oder Entfernen von Likes reduziert Münzen<br>Verwendung: Level aufsteigen; Bunte Post-Hintergründe kaufen; Abzeichen & Geschenke im Shop kaufen; Münz-Lotterie",
		"zh-TW": "1. 發佈 +5 金幣<br>2. 評論 +3 金幣<br>3. 按讚 +1 金幣<br>4. 踩 -1 金幣<br>5. 刪除帖子、內容或取消按讚，減少對應數量金幣<br>金幣用途：提升等級；購買彩色帖子背景；商店中購買徽章、禮物；金幣抽獎"
	},
	about_title: {
		zh: "关于",
		en: "About",
		es: "Acerca de",
		de: "Über",
		"zh-TW": "關於"
	},
	about_content: {
		zh: "<b>Jacky 论坛</b>是一款网页论坛，前端使用 HTML、CSS 与 JavaScript 编写，数据库使用SQL。<br><br><b>【原理】</b>用户、帖子、评论、点赞数据存储在数据库，通过 API 读取和更新内容。<br><b>【功能】</b>用户登录注册系统、发帖和评论、点赞和删除、用户列表、个人主页、主题切换。<br><b>【提醒】</b>请勿发布违法内容，请勿滥用。<br><br>如遇BUG，欢迎汇报至 <a href=\"mailto:jacky@zhujingqi.com\">jacky@zhujingqi.com</a> 或 <a href=\"https://zhujingqi.com/me/contact.html\">联系</a><br>",
		en: "<b>Jacky Forum</b> is a web forum built with HTML, CSS & JavaScript, using SQL for the database.<br><br><b>[How it works]</b> User, post, comment, and like data are stored in the database, accessed via API.<br><b>[Features]</b> Login/registration, posting & commenting, likes & deletes, user list, profile pages, theme switching.<br><b>[Notice]</b> Do not post illegal content. Do not abuse.<br><br>Report bugs to <a href=\"mailto:jacky@zhujingqi.com\">jacky@zhujingqi.com</a> or <a href=\"https://zhujingqi.com/me/contact.html\">Contact</a><br>",
		es: "<b>Jacky Forum</b> es un foro web construido con HTML, CSS y JavaScript, usando SQL para la base de datos.<br><br><b>[Cómo funciona]</b> Datos de usuarios, publicaciones, comentarios y me gusta se almacenan en la base de datos, accedidos vía API.<br><b>[Funciones]</b> Inicio de sesión/registro, publicaciones y comentarios, me gusta y eliminación, lista de usuarios, perfiles, cambio de tema.<br><b>[Aviso]</b> No publiques contenido ilegal. No abuses.<br><br>Reporta errores a <a href=\"mailto:jacky@zhujingqi.com\">jacky@zhujingqi.com</a> o <a href=\"https://zhujingqi.com/me/contact.html\">Contacto</a><br>",
		de: "<b>Jacky Forum</b> ist ein Webforum, erstellt mit HTML, CSS und JavaScript, mit SQL-Datenbank.<br><br><b>[Funktionsweise]</b> Benutzer-, Post-, Kommentar- und Like-Daten werden in der Datenbank gespeichert und über API abgerufen.<br><b>[Funktionen]</b> Anmeldung/Registrierung, Posten & Kommentieren, Likes & Löschen, Benutzerliste, Profile, Themenwechsel.<br><b>[Hinweis]</b> Keine illegalen Inhalte posten. Nicht missbrauchen.<br><br>Fehler melden an <a href=\"mailto:jacky@zhujingqi.com\">jacky@zhujingqi.com</a> oder <a href=\"https://zhujingqi.com/me/contact.html\">Kontakt</a><br>",
		"zh-TW": "<b>Jacky 論壇</b>是一款網頁論壇，前端使用 HTML、CSS 與 JavaScript 編寫，資料庫使用SQL。<br><br><b>【原理】</b>用戶、帖子、評論、按讚資料儲存在資料庫，通過 API 讀取和更新內容。<br><b>【功能】</b>用戶登入註冊系統、發帖和評論、按讚和刪除、用戶列表、個人主頁、主題切換。<br><b>【提醒】</b>請勿發佈違法內容，請勿濫用。<br><br>如遇BUG，歡迎回報至 <a href=\"mailto:jacky@zhujingqi.com\">jacky@zhujingqi.com</a> 或 <a href=\"https://zhujingqi.com/me/contact.html\">聯繫</a><br>"
	},
	sponsor_title: {
		zh: "赞助",
		en: "Sponsor",
		es: "Patrocinar",
		de: "Sponsor",
		"zh-TW": "贊助"
	},
	sponsor_content: {
		zh: "<a href=\"https://zhujingqi.com/money.html\">点击此处赞助 Jacky</a>",
		en: "<a href=\"https://zhujingqi.com/money.html\">Click here to sponsor Jacky</a>",
		es: "<a href=\"https://zhujingqi.com/money.html\">Haz clic aquí para patrocinar a Jacky</a>",
		de: "<a href=\"https://zhujingqi.com/money.html\">Klicke hier um Jacky zu sponsern</a>",
		"zh-TW": "<a href=\"https://zhujingqi.com/money.html\">點擊此處贊助 Jacky</a>"
	},
	mention_click_hint: {
		zh: "点一下插入",
		en: "Click to insert",
		es: "Click para insertar",
		de: "Klicken zum Einfügen",
		"zh-TW": "點一下插入"
	},
	role_owner: {
		zh: "站长",
		en: "Owner",
		es: "Dueño",
		de: "Besitzer",
		"zh-TW": "站長"
	},
	badge_op: {
		zh: "帖主",
		en: "OP",
		es: "OP",
		de: "OP",
		"zh-TW": "帖主"
	},
	badge_self: {
		zh: "我",
		en: "Me",
		es: "Yo",
		de: "Ich",
		"zh-TW": "我"
	},
	role_official: {
		zh: "官方用户",
		en: "Official",
		es: "Oficial",
		de: "Offiziell",
		"zh-TW": "官方用戶"
	},
	role_admin: {
		zh: "联席管理员",
		en: "Co-Admin",
		es: "Coadministrador",
		de: "Co-Admin",
		"zh-TW": "聯席管理員"
	},
	role_green_v: {
		zh: "绿V徽章",
		en: "Green V Badge",
		es: "Insignia V Verde",
		de: "Grünes V-Abzeichen",
		"zh-TW": "綠V徽章"
	},
	role_purple_star: {
		zh: "紫星徽章",
		en: "Purple Star Badge",
		es: "Insignia Estrella Púrpura",
		de: "Lila Stern-Abzeichen",
		"zh-TW": "紫星徽章"
	},
	role_blue_diamond: {
		zh: "蓝钻徽章",
		en: "Blue Diamond Badge",
		es: "Insignia Diamante Azul",
		de: "Blaues Diamant-Abzeichen",
		"zh-TW": "藍鑽徽章"
	},
	shop_item_green_v: {
		zh: "绿色V标",
		en: "Green V Mark",
		es: "Marca V Verde",
		de: "Grüne V-Markierung",
		"zh-TW": "綠色V標"
	},
	shop_item_purple_star: {
		zh: "紫星徽章",
		en: "Purple Star Badge",
		es: "Insignia Estrella Púrpura",
		de: "Lila Stern-Abzeichen",
		"zh-TW": "紫星徽章"
	},
	shop_item_blue_diamond: {
		zh: "蓝钻徽章",
		en: "Blue Diamond Badge",
		es: "Insignia Diamante Azul",
		de: "Blaues Diamant-Abzeichen",
		"zh-TW": "藍鑽徽章"
	},
	shop_lottery_section: {
		zh: "抽奖",
		en: "Lottery",
		es: "Lotería",
		de: "Lotterie",
		"zh-TW": "抽獎"
	},
	discover_website: {
		zh: "网站首页",
		en: "Homepage",
		es: "Página principal",
		de: "Startseite",
		"zh-TW": "網站首頁"
	},
	discover_community: {
		zh: "社区",
		en: "Community",
		es: "Comunidad",
		de: "Community",
		"zh-TW": "社區"
	},
	discover_community_desc: {
		zh: "Zhujingqi 社区",
		en: "Zhujingqi Community",
		es: "Comunidad Zhujingqi",
		de: "Zhujingqi Community",
		"zh-TW": "Zhujingqi 社區"
	},
	discover_game: {
		zh: "游戏中心",
		en: "Game Center",
		es: "Centro de juegos",
		de: "Spielezentrum",
		"zh-TW": "遊戲中心"
	},
	discover_tool: {
		zh: "工具大全",
		en: "Tools",
		es: "Herramientas",
		de: "Werkzeuge",
		"zh-TW": "工具大全"
	},
	discover_chat_desc: {
		zh: "在线聊天网页App",
		en: "Online Chat Web App",
		es: "App web de chat en línea",
		de: "Online-Chat Web-App",
		"zh-TW": "在線聊天網頁App"
	},
	discover_wiki_desc: {
		zh: "杰基百科",
		en: "Jackypedia",
		es: "Jackypedia",
		de: "Jackypedia",
		"zh-TW": "傑基百科"
	},
	tag_study: {
		zh: "学习",
		en: "Study",
		es: "Estudio",
		de: "Lernen",
		"zh-TW": "學習"
	},
	tag_daily: {
		zh: "日常",
		en: "Daily",
		es: "Diario",
		de: "Alltag",
		"zh-TW": "日常"
	},
	tag_funny: {
		zh: "搞笑",
		en: "Funny",
		es: "Divertido",
		de: "Lustig",
		"zh-TW": "搞笑"
	},
	tag_question: {
		zh: "提问",
		en: "Question",
		es: "Pregunta",
		de: "Frage",
		"zh-TW": "提問"
	},
	follow_btn: {
		zh: "关注",
		en: "Follow",
		es: "Seguir",
		de: "Folgen",
		"zh-TW": "關注"
	},
	unfollow_btn: {
		zh: "已关注",
		en: "Following",
		es: "Siguiendo",
		de: "Folge ich",
		"zh-TW": "已關注"
	},
	unfollow_confirm: {
		zh: "确定取消关注？",
		en: "Unfollow this user?",
		es: "¿Dejar de seguir?",
		de: "Diesem Benutzer entfolgen?",
		"zh-TW": "確定取消關注？"
	},
	confirm_btn: {
		zh: "确定",
		en: "OK",
		es: "Aceptar",
		de: "OK",
		"zh-TW": "確定"
	},
	followers: {
		zh: "粉丝",
		en: "Followers",
		es: "Seguidores",
		de: "Follower",
		"zh-TW": "粉絲"
	},
	following: {
		zh: "关注中",
		en: "Following",
		es: "Siguiendo",
		de: "Gefolgt",
		"zh-TW": "關注中"
	},
	follow_list_private: {
		zh: "该用户未公开关注列表",
		en: "This user's follow list is private",
		es: "La lista de seguimiento de este usuario es privada",
		de: "Die Folgeliste dieses Benutzers ist privat",
		"zh-TW": "該用戶未公開關注列表"
	},
	follow_public_label: {
		zh: "公开关注/粉丝列表",
		en: "Public follow list",
		es: "Lista de seguimiento pública",
		de: "Öffentliche Folgeliste",
		"zh-TW": "公開關注/粉絲列表"
	},
	follow_self: {
		zh: "不能关注自己",
		en: "Cannot follow yourself",
		es: "No puedes seguirte a ti mismo",
		de: "Kann dir nicht selbst folgen",
		"zh-TW": "不能關注自己"
	},
	jwt_expired: {
		zh: "登录已过期，请重新登录",
		en: "Login expired, please log in again",
		es: "Sesión expirada, inicia sesión de nuevo",
		de: "Sitzung abgelaufen, bitte erneut anmelden",
		"zh-TW": "登錄已過期，請重新登錄"
	},
	jwt_login_btn: {
		zh: "去登录",
		en: "Go to Login",
		es: "Ir a iniciar sesión",
		de: "Zum Login",
		"zh-TW": "去登錄"
	},
	profile_settings: {
		zh: "设置",
		en: "Settings",
		es: "Ajustes",
		de: "Einstellungen",
		"zh-TW": "設置"
	},
	loading: {
		zh: "加载中…",
		en: "Loading…",
		es: "Cargando…",
		de: "Laden…",
		"zh-TW": "加載中…"
	},
	captcha_btn: {
		zh: "点击完成人机验证",
		en: "Click to complete verification",
		es: "Clic para completar la verificación",
		de: "Klicken zum Abschließen der Verifizierung",
		"zh-TW": "點擊完成人機驗證"
	},
	captcha_modal_title: {
		zh: "人机验证 — 拖到闪烁虚线框中",
		en: "Verification — drag to the dashed box",
		es: "Verificación — arrastra hasta la caja punteada",
		de: "Verifizierung — in das gestrichelte Feld ziehen",
		"zh-TW": "人機驗證 — 拖到閃爍虛線框中"
	},
	captcha_slider_hint: {
		zh: "← 拖动滑块完成拼图 →",
		en: "← Drag the slider to complete the puzzle →",
		es: "← Arrastra el control para completar el rompecabezas →",
		de: "← Schieberegler ziehen, um das Puzzle zu lösen →",
		"zh-TW": "← 拖動滑塊完成拼圖 →"
	},
	captcha_not_done: {
		zh: "请先完成人机验证",
		en: "Please complete the verification first",
		es: "Completa la verificación primero",
		de: "Bitte zuerst die Verifizierung abschließen",
		"zh-TW": "請先完成人機驗證"
	},
	scope_title: {
		zh: "谁可以看",
		en: "Who can see",
		es: "Quién puede ver",
		de: "Wer kann sehen",
		"zh-TW": "誰可以看"
	},
	scope_public: {
		zh: "公开",
		en: "Public",
		es: "Público",
		de: "Öffentlich",
		"zh-TW": "公開"
	},
	scope_followers: {
		zh: "仅粉丝",
		en: "Followers only",
		es: "Solo seguidores",
		de: "Nur Follower",
		"zh-TW": "僅粉絲"
	},
	scope_private: {
		zh: "仅自己",
		en: "Only me",
		es: "Solo yo",
		de: "Nur ich",
		"zh-TW": "僅自己"
	},
	scope_custom: {
		zh: "自定义",
		en: "Custom",
		es: "Personalizado",
		de: "Benutzerdefiniert",
		"zh-TW": "自訂"
	},
	scope_custom_hint: {
		zh: "选择特定用户或分组",
		en: "Select specific users or groups",
		es: "Seleccionar usuarios o grupos específicos",
		de: "Bestimmte Benutzer oder Gruppen auswählen",
		"zh-TW": "選擇特定用戶或分組"
	},
	scope_allow_title: {
		zh: "允许查看",
		en: "Allow to see",
		es: "Permitir ver",
		de: "Erlauben zu sehen",
		"zh-TW": "允許查看"
	},
	scope_deny_title: {
		zh: "禁止查看",
		en: "Block from seeing",
		es: "Bloquear",
		de: "Blockieren",
		"zh-TW": "禁止查看"
	},
	scope_select_groups: {
		zh: "选择分组",
		en: "Select groups",
		es: "Seleccionar grupos",
		de: "Gruppen auswählen",
		"zh-TW": "選擇分組"
	},
	scope_select_users: {
		zh: "选择用户",
		en: "Select users",
		es: "Seleccionar usuarios",
		de: "Benutzer auswählen",
		"zh-TW": "選擇用戶"
	},
	scope_badge_public: {
		zh: "",
		en: "",
		es: "",
		de: "",
		"zh-TW": ""
	},
	scope_badge_followers: {
		zh: "仅粉丝可见",
		en: "Followers only",
		es: "Solo seguidores",
		de: "Nur Follower",
		"zh-TW": "僅粉絲可見"
	},
	scope_badge_private: {
		zh: "仅自己可见",
		en: "Only me",
		es: "Solo yo",
		de: "Nur ich",
		"zh-TW": "僅自己可見"
	},
	scope_badge_custom: {
		zh: "自定义可见",
		en: "Custom visibility",
		es: "Visibilidad personalizada",
		de: "Benutzerdefinierte Sichtbarkeit",
		"zh-TW": "自訂可見"
	},
	profile_groups: {
		zh: "分组管理",
		en: "Groups",
		es: "Grupos",
		de: "Gruppen",
		"zh-TW": "分組管理"
	},
	groups_new: {
		zh: "新建分组",
		en: "New group",
		es: "Nuevo grupo",
		de: "Neue Gruppe",
		"zh-TW": "新建分組"
	},
	groups_name_ph: {
		zh: "分组名称",
		en: "Group name",
		es: "Nombre del grupo",
		de: "Gruppenname",
		"zh-TW": "分組名稱"
	},
	groups_delete_confirm: {
		zh: "确定删除此分组？",
		en: "Delete this group?",
		es: "¿Eliminar este grupo?",
		de: "Diese Gruppe löschen?",
		"zh-TW": "確定刪除此分組？"
	},
	groups_add_user: {
		zh: "添加用户",
		en: "Add user",
		es: "Agregar usuario",
	 de: "Benutzer hinzufügen",
		"zh-TW": "添加用戶"
	},
	groups_search_users_ph: {
		zh: "搜索用户名...",
		en: "Search usernames...",
		es: "Buscar usuarios...",
		de: "Benutzernamen suchen...",
		"zh-TW": "搜尋使用者名稱..."
	},
	groups_remove_user: {
		zh: "移除",
		en: "Remove",
		es: "Eliminar",
		de: "Entfernen",
		"zh-TW": "移除"
	},
	groups_empty: {
		zh: "暂无分组",
		en: "No groups yet",
		es: "Sin grupos",
		de: "Noch keine Gruppen",
		"zh-TW": "暫無分組"
	},
	groups_no_members: {
		zh: "暂无成员",
		en: "No members yet",
		es: "Sin miembros",
		de: "Noch keine Mitglieder",
		"zh-TW": "暫無成員"
	}
};
const PAGE_TITLE_TRANS = {
	zh: "Jacky 论坛 - Zhujingqi",
	en: "Jacky Forum - Zhujingqi",
	es: "Foro Jacky - Zhujingqi",
	de: "Jacky Forum - Zhujingqi",
	"zh-TW": "Jacky 論壇 - Zhujingqi"
};
// Language dropdown always shows each language's endonym (its own name),
// never a translation of the name into the currently active UI language.
const LANG_NATIVE_NAMES = {
	zh: "中文",
	en: "English",
	es: "Español",
	de: "Deutsch",
	"zh-TW": "繁體中文"
};
const LANGS = [{
	v: "zh"
}, {
	v: "en"
}, {
	v: "es"
}, {
	v: "de"
}, {
	v: "zh-TW"
}];
let currentLang = (() => {
	const s = localStorage.getItem("lang");
	if (s) return s;
	const l = (navigator.language || "zh");
	if (l === "zh-TW" || l === "zh-HK") return "zh-TW";
	const sh = l.split("-")[0];
	const sup = {
		zh: "zh",
		en: "en",
		es: "es",
		de: "de"
	};
	return sup[sh] || "zh";
})();

function t(key, ...args) {
	let tx = (TRANSLATIONS[key] && TRANSLATIONS[key][currentLang]) || (TRANSLATIONS[key] && TRANSLATIONS[key].zh) ||
		key;
	args.forEach((a, i) => {
		tx = tx.replace(new RegExp("\\{" + i + "\\}", "g"), String(a));
	});
	return tx;
}

function changeLanguage(lang) {
	currentLang = lang;
	localStorage.setItem("lang", lang);
	document.title = PAGE_TITLE_TRANS[lang] || PAGE_TITLE_TRANS.zh;
	const s = document.getElementById("langSelect");
	if (s) s.value = lang;
	const r = document.getElementById("langSelectReg");
	if (r) r.value = lang;
	if (typeof refreshUILanguage === "function") refreshUILanguage();
}

function renderLangSelect(sel) {
	sel.innerHTML = "";
	for (const l of LANGS) {
		const o = document.createElement("option");
		o.value = l.v;
		o.textContent = LANG_NATIVE_NAMES[l.v] || l.v;
		sel.appendChild(o);
	}
	sel.value = currentLang;
	sel.onchange = () => changeLanguage(sel.value);
}
const EMOJI_MAP = [
		"happy",
		"hmm",
		"sweat",
		"sad",
		"cry",
		"sob",
		
		"haha",
		"cool",
		"pirate",
		"eat",
		"love",
		"amazed",
		
		"scared",
		"eyeroll",
		"updown",
		"blank",
		"angry",
		"dead",
		
		"right",
		"wrong",
		"ok",
		"ke",
		"good",
		"bad",
		
		"alien",
		"bot",
		"ask",
		"doge",
		"chill",
		"strange",
		
		"maga",
		"jesus",
		"14",
		"saka",
	];
