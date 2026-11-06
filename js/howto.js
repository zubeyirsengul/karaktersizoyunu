// Nasıl oynanır ekranı
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- NASIL OYNANIR ---
// Açılış ekranındaki butonla ya da oyun sırasında ❓ ile açılır; ilk oyunda kendiliğinden gösterilir.
const HOWTO = {
    tr: { title: "NASIL OYNANIR?", btn: "❓ NASIL OYNANIR?", ok: "ANLADIM",
          hControls: "Kontroller", cAction: "Hareket", cKeys: "Klavye", cTouch: "Dokunmatik",
          controls: [["Yürü", "A / D", "Joystick"], ["Zıpla", "Boşluk", "ZIPLA"], ["Para fırlat", "Enter", "FIRLAT"],
                     ["Balyoz", "F", "BALYOZ"], ["Kalkan (basılı tut)", "S / ↓", "KALKAN"], ["Duraklat", "ESC / P", "⏸"]],
          hGoal: "Amaç",
          goal: ["7 polisi alt et.", "Açılan kapıdan geç.", "Bölüm sonu canavarını yen. 3 bölümü bitir!"],
          goalNote: "Kul hakkı torbalarını toplayıp puan kazan. 3 canın var; çukura düşmek doğrudan öldürür.",
          hEnemies: "Düşmanlar",
          enemies: [["👮", "17/25 polisi", "Tabancayla ateş eder. Zıpla ya da kalkanı kaldır."],
                    ["🛡️", "Çevik kuvvet", "Önden atılan para işlemez. Kafasına zıpla, arkasından vur ya da balyozla."],
                    ["🎯", "Keskin nişancı", "Kırmızı lazer dolunca ateş eder. Yer değiştir ya da kalkanı kaldır."],
                    ["👹", "Bölüm sonu canavarı", "Kafasına zıpla, para at, balyozla vur."]],
          hPowers: "Güçler",
          powers: [["⚡", "Hız"], ["⏫", "Çift zıplama"], ["🔨", "Dev balyoz"], ["❤️", "+1 can"], ["⭐", "Dokunulmazlık"]] },
    en: { title: "HOW TO PLAY", btn: "❓ HOW TO PLAY", ok: "GOT IT",
          hControls: "Controls", cAction: "Action", cKeys: "Keyboard", cTouch: "Touch",
          controls: [["Walk", "A / D", "Joystick"], ["Jump", "Space", "JUMP"], ["Throw money", "Enter", "THROW"],
                     ["Hammer", "F", "HAMMER"], ["Shield (hold)", "S / ↓", "SHIELD"], ["Pause", "ESC / P", "⏸"]],
          hGoal: "Goal",
          goal: ["Take down 7 police officers.", "Go through the gate that opens.", "Beat the boss. Finish all 3 levels!"],
          goalNote: "Collect the people's due bags for points. You have 3 lives; falling into a pit kills you instantly.",
          hEnemies: "Enemies",
          enemies: [["👮", "17/25 police", "Shoots with a pistol. Jump or raise your shield."],
                    ["🛡️", "Riot police", "Money thrown from the front bounces off. Jump on his head, hit him from behind or use the hammer."],
                    ["🎯", "Sniper", "Fires when the red laser fills up. Move or raise your shield."],
                    ["👹", "Boss", "Jump on its head, throw money, hit it with the hammer."]],
          hPowers: "Power-ups",
          powers: [["⚡", "Speed"], ["⏫", "Double jump"], ["🔨", "Giant hammer"], ["❤️", "+1 life"], ["⭐", "Invincibility"]] },
    fr: { title: "COMMENT JOUER", btn: "❓ COMMENT JOUER", ok: "COMPRIS",
          hControls: "Commandes", cAction: "Action", cKeys: "Clavier", cTouch: "Tactile",
          controls: [["Marcher", "A / D", "Joystick"], ["Sauter", "Espace", "SAUTER"], ["Lancer de l'argent", "Entrée", "LANCER"],
                     ["Marteau", "F", "MARTEAU"], ["Bouclier (maintenir)", "S / ↓", "BOUCLIER"], ["Pause", "ÉCHAP / P", "⏸"]],
          hGoal: "Objectif",
          goal: ["Neutralise 7 policiers.", "Passe par la porte qui s'ouvre.", "Bats le boss. Termine les 3 niveaux !"],
          goalNote: "Ramasse les sacs pour gagner des points. Tu as 3 vies ; tomber dans un trou tue directement.",
          hEnemies: "Ennemis",
          enemies: [["👮", "Police 17/25", "Tire au pistolet. Saute ou lève ton bouclier."],
                    ["🛡️", "CRS", "L'argent lancé de face rebondit. Saute sur sa tête, frappe-le de dos ou au marteau."],
                    ["🎯", "Tireur d'élite", "Tire quand le laser rouge est plein. Bouge ou lève ton bouclier."],
                    ["👹", "Boss", "Saute sur sa tête, lance de l'argent, frappe-le au marteau."]],
          hPowers: "Bonus",
          powers: [["⚡", "Vitesse"], ["⏫", "Double saut"], ["🔨", "Marteau géant"], ["❤️", "+1 vie"], ["⭐", "Invincibilité"]] },
    nl: { title: "HOE TE SPELEN", btn: "❓ HOE TE SPELEN", ok: "BEGREPEN",
          hControls: "Besturing", cAction: "Actie", cKeys: "Toetsenbord", cTouch: "Aanraken",
          controls: [["Lopen", "A / D", "Joystick"], ["Springen", "Spatie", "SPRINGEN"], ["Geld gooien", "Enter", "GOOIEN"],
                     ["Moker", "F", "MOKER"], ["Schild (ingedrukt)", "S / ↓", "SCHILD"], ["Pauze", "ESC / P", "⏸"]],
          hGoal: "Doel",
          goal: ["Schakel 7 agenten uit.", "Ga door de poort die opengaat.", "Versla de eindbaas. Speel alle 3 levels uit!"],
          goalNote: "Verzamel zakken voor punten. Je hebt 3 levens; in een kuil vallen is direct dood.",
          hEnemies: "Vijanden",
          enemies: [["👮", "17/25-agent", "Schiet met een pistool. Spring of houd je schild omhoog."],
                    ["🛡️", "ME", "Geld van voren ketst af. Spring op zijn hoofd, raak hem van achteren of met de moker."],
                    ["🎯", "Sluipschutter", "Schiet als de rode laser vol is. Beweeg of houd je schild omhoog."],
                    ["👹", "Eindbaas", "Spring op zijn hoofd, gooi geld, sla met de moker."]],
          hPowers: "Power-ups",
          powers: [["⚡", "Snelheid"], ["⏫", "Dubbele sprong"], ["🔨", "Reuzenhamer"], ["❤️", "+1 leven"], ["⭐", "Onkwetsbaar"]] },
    de: { title: "SPIELANLEITUNG", btn: "❓ SPIELANLEITUNG", ok: "VERSTANDEN",
          hControls: "Steuerung", cAction: "Aktion", cKeys: "Tastatur", cTouch: "Touch",
          controls: [["Laufen", "A / D", "Joystick"], ["Springen", "Leertaste", "SPRINGEN"], ["Geld werfen", "Enter", "WERFEN"],
                     ["Hammer", "F", "HAMMER"], ["Schild (halten)", "S / ↓", "SCHILD"], ["Pause", "ESC / P", "⏸"]],
          hGoal: "Ziel",
          goal: ["Schalte 7 Polizisten aus.", "Geh durch das Tor, das sich öffnet.", "Besiege den Endgegner. Schaffe alle 3 Level!"],
          goalNote: "Sammle Säcke für Punkte. Du hast 3 Leben; ein Sturz in eine Grube ist sofort tödlich.",
          hEnemies: "Gegner",
          enemies: [["👮", "17/25-Polizist", "Schießt mit der Pistole. Spring oder heb den Schild."],
                    ["🛡️", "Bereitschaftspolizei", "Geld von vorne prallt ab. Spring auf den Kopf, triff von hinten oder mit dem Hammer."],
                    ["🎯", "Scharfschütze", "Schießt, wenn der rote Laser voll ist. Beweg dich oder heb den Schild."],
                    ["👹", "Endgegner", "Spring auf den Kopf, wirf Geld, schlag mit dem Hammer."]],
          hPowers: "Power-ups",
          powers: [["⚡", "Tempo"], ["⏫", "Doppelsprung"], ["🔨", "Riesenhammer"], ["❤️", "+1 Leben"], ["⭐", "Unverwundbar"]] },
    ru: { title: "КАК ИГРАТЬ", btn: "❓ КАК ИГРАТЬ", ok: "ПОНЯТНО",
          hControls: "Управление", cAction: "Действие", cKeys: "Клавиатура", cTouch: "Сенсор",
          controls: [["Идти", "A / D", "Джойстик"], ["Прыжок", "Пробел", "ПРЫЖОК"], ["Бросить деньги", "Enter", "БРОСОК"],
                     ["Кувалда", "F", "КУВАЛДА"], ["Щит (удерживать)", "S / ↓", "ЩИТ"], ["Пауза", "ESC / P", "⏸"]],
          hGoal: "Цель",
          goal: ["Одолей 7 полицейских.", "Пройди через открывшиеся ворота.", "Победи босса. Пройди все 3 уровня!"],
          goalNote: "Собирай мешки ради очков. У тебя 3 жизни; падение в яму убивает сразу.",
          hEnemies: "Враги",
          enemies: [["👮", "Полиция 17/25", "Стреляет из пистолета. Прыгай или подними щит."],
                    ["🛡️", "ОМОН", "Деньги спереди отскакивают. Прыгни на голову, ударь сзади или кувалдой."],
                    ["🎯", "Снайпер", "Стреляет, когда красный лазер заполнится. Двигайся или подними щит."],
                    ["👹", "Босс", "Прыгай на голову, бросай деньги, бей кувалдой."]],
          hPowers: "Бонусы",
          powers: [["⚡", "Скорость"], ["⏫", "Двойной прыжок"], ["🔨", "Гигантский молот"], ["❤️", "+1 жизнь"], ["⭐", "Неуязвимость"]] }
};
let howtoThenStart = false;   // ilk oyunda: ekran kapanınca oyun başlar
function renderHowto() {
    const H = HOWTO[lang] || HOWTO.en;
    $('howto-btn').textContent = H.btn;
    $('howto-panel').innerHTML = `
        <h2>${H.title}</h2>
        <h3>${H.hControls}</h3>
        <table><tr><th>${H.cAction}</th><th>${H.cKeys}</th><th>${H.cTouch}</th></tr>
        ${H.controls.map(([a, k, tch]) => `<tr><td>${a}</td><td><kbd>${k}</kbd></td><td>${tch}</td></tr>`).join('')}</table>
        <h3>${H.hGoal}</h3>
        <ol>${H.goal.map(g => `<li>${g}</li>`).join('')}</ol>
        <p class="howto-note">${H.goalNote}</p>
        <h3>${H.hEnemies}</h3>
        <ul class="howto-list">${H.enemies.map(([i, n, d]) => `<li><span class="howto-ico">${i}</span><b>${n}</b> — ${d}</li>`).join('')}</ul>
        <h3>${H.hPowers}</h3>
        <div class="howto-powers">${H.powers.map(([i, n]) => `<span>${i} ${n}</span>`).join('')}</div>
        <button id="howto-ok" class="primary-btn" type="button">${H.ok}</button>`;
    $('howto-ok').onclick = closeHowto;
}
function openHowto(thenStart = false) {
    howtoThenStart = thenStart;
    if (gameStarted && !levelCompleted) setUserPause(true);   // oyun sırasında açılırsa oyun durur
    renderHowto();
    $('howto').style.display = 'flex';
    $('howto-panel').scrollTop = 0;
}
function closeHowto() {
    $('howto').style.display = 'none';
    try { localStorage.setItem('omurgasizHowto', '1'); } catch (e) {}
    if (howtoThenStart) { howtoThenStart = false; startGame(); }
}
const howtoSeen = () => { try { return localStorage.getItem('omurgasizHowto') === '1'; } catch (e) { return true; } };
