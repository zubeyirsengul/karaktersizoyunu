// Nasıl oynanır ekranı
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- NASIL OYNANIR ---
// Açılış ekranındaki butonla ya da oyun sırasında ❓ ile açılır; ilk oyunda kendiliğinden gösterilir.
const HOWTO = {
    tr: { title: "NASIL OYNANIR?", btn: "❓ NASIL OYNANIR?", ok: "ANLADIM",
          hControls: "Kontroller", cAction: "Hareket", cKeys: "Klavye", cTouch: "Dokunmatik",
          controls: [["Yürü", "A / D", "Joystick"], ["Zıpla", "Boşluk", "ZIPLA"], ["Rüşvet ver", "Enter", "RÜŞVET VER"],
                     ["Balyoz", "F", "BALYOZ"], ["Kalkan (basılı tut)", "S / ↓", "KALKAN"], ["Duraklat", "ESC / P", "⏸"]],
          hGoal: "Amaç",
          goal: ["7 polisi alt et.", "Açılan kapıdan geç.", "Bölüm sonu canavarını yen. 8 bölümü bitir!"],
          goalNote: "Havadaki tuğlaları kır: alttan kafa at, balyozla vur ya da rüşvet zarfı at. İçinden güç ya da kul hakkı çıkar; kul hakkı sırtındaki çuvala gider. 3 canın var; çukura düşmek doğrudan öldürür.",
          hEnemies: "Düşmanlar",
          enemies: [["👮", "17/25 polisi", "Tabancayla ateş eder. Zıpla ya da kalkanı kaldır."],
                    ["🛡️", "Çevik kuvvet", "2 vuruşta düşer. Önden atılan rüşvet işlemez. Kafasına zıpla, arkasından vur ya da balyozla."],
                    ["🎯", "Keskin nişancı", "2 vuruşta düşer. Kırmızı lazer dolunca ateş eder. Yer değiştir ya da kalkanı kaldır."],
                    ["😷", "Gaz bombacı", "Ayağının dibine biber gazı atar. Yeşil bulutun içinde kalma, üstünden zıpla; havadaki kapsülü kalkanla sektir."],
                    ["👹", "Bölüm sonu canavarı", "Kafasına zıpla, rüşvet zarfı at, balyozla vur."]],
          hPowers: "Güçler",
          powers: [["⚡", "Hız"], ["⏫", "Çift zıplama"], ["🔨", "Dev balyoz"], ["❤️", "+1 can"], ["⭐", "Dokunulmazlık"]] },
    en: { title: "HOW TO PLAY", btn: "❓ HOW TO PLAY", ok: "GOT IT",
          hControls: "Controls", cAction: "Action", cKeys: "Keyboard", cTouch: "Touch",
          controls: [["Walk", "A / D", "Joystick"], ["Jump", "Space", "JUMP"], ["Bribe", "Enter", "BRIBE"],
                     ["Hammer", "F", "HAMMER"], ["Shield (hold)", "S / ↓", "SHIELD"], ["Pause", "ESC / P", "⏸"]],
          hGoal: "Goal",
          goal: ["Take down 7 police officers.", "Go through the gate that opens.", "Beat the boss. Finish all 8 levels!"],
          goalNote: "Break the floating bricks: headbutt them from below, hit them with the hammer or throw a bribe. Out comes a power-up or the people's due, which flies into the sack on your back. You have 3 lives; falling into a pit kills you instantly.",
          hEnemies: "Enemies",
          enemies: [["👮", "17/25 police", "Shoots with a pistol. Jump or raise your shield."],
                    ["🛡️", "Riot police", "Takes 2 hits. A bribe thrown from the front bounces off. Jump on his head, hit him from behind or use the hammer."],
                    ["🎯", "Sniper", "Takes 2 hits. Fires when the red laser fills up. Move or raise your shield."],
                    ["😷", "Gas grenadier", "Lobs pepper gas at your feet. Don't stay in the green cloud, jump over it; block the canister in the air with your shield."],
                    ["👹", "Boss", "Jump on its head, throw bribe envelopes, hit it with the hammer."]],
          hPowers: "Power-ups",
          powers: [["⚡", "Speed"], ["⏫", "Double jump"], ["🔨", "Giant hammer"], ["❤️", "+1 life"], ["⭐", "Invincibility"]] },
    fr: { title: "COMMENT JOUER", btn: "❓ COMMENT JOUER", ok: "COMPRIS",
          hControls: "Commandes", cAction: "Action", cKeys: "Clavier", cTouch: "Tactile",
          controls: [["Marcher", "A / D", "Joystick"], ["Sauter", "Espace", "SAUTER"], ["Verser un pot-de-vin", "Entrée", "POT-DE-VIN"],
                     ["Marteau", "F", "MARTEAU"], ["Bouclier (maintenir)", "S / ↓", "BOUCLIER"], ["Pause", "ÉCHAP / P", "⏸"]],
          hGoal: "Objectif",
          goal: ["Neutralise 7 policiers.", "Passe par la porte qui s'ouvre.", "Bats le boss. Termine les 8 niveaux !"],
          goalNote: "Casse les briques en l'air : coup de tête par-dessous, marteau ou pot-de-vin. Il en sort un bonus ou de l'argent qui file dans le sac sur ton dos. Tu as 3 vies ; tomber dans un trou tue directement.",
          hEnemies: "Ennemis",
          enemies: [["👮", "Police 17/25", "Tire au pistolet. Saute ou lève ton bouclier."],
                    ["🛡️", "CRS", "Tombe en 2 coups. Le pot-de-vin lancé de face rebondit. Saute sur sa tête, frappe-le de dos ou au marteau."],
                    ["🎯", "Tireur d'élite", "Tombe en 2 coups. Tire quand le laser rouge est plein. Bouge ou lève ton bouclier."],
                    ["😷", "Lanceur de gaz", "Lance du gaz poivré à tes pieds. Ne reste pas dans le nuage vert, saute par-dessus ; renvoie la grenade avec ton bouclier."],
                    ["👹", "Boss", "Saute sur sa tête, lance des pots-de-vin, frappe-le au marteau."]],
          hPowers: "Bonus",
          powers: [["⚡", "Vitesse"], ["⏫", "Double saut"], ["🔨", "Marteau géant"], ["❤️", "+1 vie"], ["⭐", "Invincibilité"]] },
    nl: { title: "HOE TE SPELEN", btn: "❓ HOE TE SPELEN", ok: "BEGREPEN",
          hControls: "Besturing", cAction: "Actie", cKeys: "Toetsenbord", cTouch: "Aanraken",
          controls: [["Lopen", "A / D", "Joystick"], ["Springen", "Spatie", "SPRINGEN"], ["Omkopen", "Enter", "OMKOPEN"],
                     ["Moker", "F", "MOKER"], ["Schild (ingedrukt)", "S / ↓", "SCHILD"], ["Pauze", "ESC / P", "⏸"]],
          hGoal: "Doel",
          goal: ["Schakel 7 agenten uit.", "Ga door de poort die opengaat.", "Versla de eindbaas. Speel alle 8 levels uit!"],
          goalNote: "Breek de zwevende stenen: kopstoot van onderen, moker of smeergeld. Er komt een kracht of geld uit, dat in de zak op je rug vliegt. Je hebt 3 levens; in een kuil vallen is direct dood.",
          hEnemies: "Vijanden",
          enemies: [["👮", "17/25-agent", "Schiet met een pistool. Spring of houd je schild omhoog."],
                    ["🛡️", "ME", "Valt na 2 klappen. Smeergeld van voren ketst af. Spring op zijn hoofd, raak hem van achteren of met de moker."],
                    ["🎯", "Sluipschutter", "Valt na 2 klappen. Schiet als de rode laser vol is. Beweeg of houd je schild omhoog."],
                    ["😷", "Gasgooier", "Gooit pepergas voor je voeten. Blijf niet in de groene wolk, spring eroverheen; weer de bus in de lucht af met je schild."],
                    ["👹", "Eindbaas", "Spring op zijn hoofd, gooi smeergeld, sla met de moker."]],
          hPowers: "Power-ups",
          powers: [["⚡", "Snelheid"], ["⏫", "Dubbele sprong"], ["🔨", "Reuzenhamer"], ["❤️", "+1 leven"], ["⭐", "Onkwetsbaar"]] },
    de: { title: "SPIELANLEITUNG", btn: "❓ SPIELANLEITUNG", ok: "VERSTANDEN",
          hControls: "Steuerung", cAction: "Aktion", cKeys: "Tastatur", cTouch: "Touch",
          controls: [["Laufen", "A / D", "Joystick"], ["Springen", "Leertaste", "SPRINGEN"], ["Bestechen", "Enter", "BESTECHEN"],
                     ["Hammer", "F", "HAMMER"], ["Schild (halten)", "S / ↓", "SCHILD"], ["Pause", "ESC / P", "⏸"]],
          hGoal: "Ziel",
          goal: ["Schalte 7 Polizisten aus.", "Geh durch das Tor, das sich öffnet.", "Besiege den Endgegner. Schaffe alle 8 Level!"],
          goalNote: "Zerbrich die schwebenden Ziegel: Kopfstoß von unten, Hammer oder Schmiergeld. Heraus kommt eine Kraft oder Geld, das in den Sack auf deinem Rücken fliegt. Du hast 3 Leben; ein Sturz in eine Grube ist sofort tödlich.",
          hEnemies: "Gegner",
          enemies: [["👮", "17/25-Polizist", "Schießt mit der Pistole. Spring oder heb den Schild."],
                    ["🛡️", "Bereitschaftspolizei", "Fällt nach 2 Treffern. Schmiergeld von vorne prallt ab. Spring auf den Kopf, triff von hinten oder mit dem Hammer."],
                    ["🎯", "Scharfschütze", "Fällt nach 2 Treffern. Schießt, wenn der rote Laser voll ist. Beweg dich oder heb den Schild."],
                    ["😷", "Gaswerfer", "Wirft Pfeffergas vor deine Füße. Bleib nicht in der grünen Wolke, spring darüber; wehr die Kartusche in der Luft mit dem Schild ab."],
                    ["👹", "Endgegner", "Spring auf den Kopf, wirf Schmiergeld, schlag mit dem Hammer."]],
          hPowers: "Power-ups",
          powers: [["⚡", "Tempo"], ["⏫", "Doppelsprung"], ["🔨", "Riesenhammer"], ["❤️", "+1 Leben"], ["⭐", "Unverwundbar"]] },
    ru: { title: "КАК ИГРАТЬ", btn: "❓ КАК ИГРАТЬ", ok: "ПОНЯТНО",
          hControls: "Управление", cAction: "Действие", cKeys: "Клавиатура", cTouch: "Сенсор",
          controls: [["Идти", "A / D", "Джойстик"], ["Прыжок", "Пробел", "ПРЫЖОК"], ["Дать взятку", "Enter", "ВЗЯТКА"],
                     ["Кувалда", "F", "КУВАЛДА"], ["Щит (удерживать)", "S / ↓", "ЩИТ"], ["Пауза", "ESC / P", "⏸"]],
          hGoal: "Цель",
          goal: ["Одолей 7 полицейских.", "Пройди через открывшиеся ворота.", "Победи босса. Пройди все 8 уровней!"],
          goalNote: "Ломай кирпичи в воздухе: удар головой снизу, кувалда или взятка. Из них выпадает усиление или деньги, которые летят в мешок у тебя за спиной. У тебя 3 жизни; падение в яму убивает сразу.",
          hEnemies: "Враги",
          enemies: [["👮", "Полиция 17/25", "Стреляет из пистолета. Прыгай или подними щит."],
                    ["🛡️", "ОМОН", "Падает с 2 ударов. Взятка спереди отскакивает. Прыгни на голову, ударь сзади или кувалдой."],
                    ["🎯", "Снайпер", "Падает с 2 ударов. Стреляет, когда красный лазер заполнится. Двигайся или подними щит."],
                    ["😷", "Газометчик", "Бросает перцовый газ тебе под ноги. Не стой в зелёном облаке, перепрыгни его; отбей баллон щитом в воздухе."],
                    ["👹", "Босс", "Прыгай на голову, бросай взятки, бей кувалдой."]],
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
