// Bölümler: ayarlar, düzen (platform, çukur), kapı, bölüm geçişleri
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- BÖLÜM DÜZENİ: platformlar, çukurlar, nişancı yerleri ---
// Her bölüm için aynı tohumla üretilir (ölünce bölüm aynı haliyle gelir).
// Oyuncu ~255 px zıplar ve zıplarken ~320 px ileri gider: basamaklar arası en fazla 110 px,
// çukurlar en fazla 190 px genişliğinde.
let pits = [];
function seededRandom(seed) {
    let s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
function buildLayout(level) {
    const r = seededRandom(level * 7919 + 13);
    const L = LEVELS[level], pitChance = L.pit, sniperChance = L.sniper;
    const plats = [], pitList = [], snipers = [], bags = [], spots = [];   // spots: nişancı konabilecek yüksek yerler
    // Polisler 1500 + i*1500'de durur; desenler ve çukurlar aralarına (c) yerleşir. Başlangıç bölgesi elle tasarlandı.
    for (let k = 1; k < 19; k++) {
        const c = 2250 + k * 1500;
        if (r() < pitChance) {
            const w = 140 + Math.floor(r() * 50);
            pitList.push({ x: c - w / 2, w, filled: false });
            if (r() < 0.4) plats.push([c - 60, 170, 120, 30]);         // çukurun üstünde basamak
        }
        const kind = Math.floor(r() * 4);
        if (kind === 0) {                                              // merdiven, tepesinde torba
            const x0 = c - 520;
            plats.push([x0, 130, 160, 40], [x0 + 210, 240, 160, 40], [x0 + 420, 350, 200, 40]);
            bags.push([x0 + 520, 430]);
            spots.push([x0 + 500, 350]);
        } else if (kind === 1) {                                       // basamakla çıkılan uzun köprü
            plats.push([c - 470, 150, 130, 40], [c - 300, 260, 600, 40]);
            bags.push([c - 120, 340], [c + 180, 340]);
            spots.push([c + 60, 260]);
        } else if (kind === 2) {                                       // iki yüzen ada
            plats.push([c - 430, 190, 180, 40], [c + 230, 240, 180, 40]);
            bags.push([c + 320, 320]);
        }                                                              // kind 3: dinlenme alanı
    }
    // Nişancılar: her yüksek yere şansla; bölüm ilerledikçe en az 2 / 3 / 4 tane olacak şekilde tamamlanır
    const rest = [];
    spots.forEach(s => (r() < sniperChance ? snipers : rest).push(s));
    const minSnipers = L.minSnipers;
    while (snipers.length < minSnipers && rest.length) snipers.push(rest.splice(Math.floor(r() * rest.length), 1)[0]);
    return { plats, pits: pitList, snipers, bags };
}
// Zemin, çukurlar dışında kalan parçalardan oluşur
function groundSegments(pitList) {
    const segs = []; let x = 0;
    [...pitList].sort((a, b) => a.x - b.x).forEach(p => { segs.push({ x, y: height - 60, w: p.x - x, h: 500 }); x = p.x + p.w; });
    segs.push({ x, y: height - 60, w: WORLD_WIDTH - x, h: 500 });
    return segs;
}
// Kapı açılınca kapının ve canavar alanının çukurları kapanır
function fillPitsNear(x0, x1) {
    pits.forEach(p => {
        if (!p.filled && p.x + p.w > x0 && p.x < x1) {
            p.filled = true;
            platforms.push({ x: p.x, y: height - 60, w: p.w, h: 500 });
        }
    });
}
function drawPits(ctx) {
    const gy = height - 60;
    pits.forEach(p => {
        if (p.filled || p.x + p.w < camX - 50 || p.x > camX + width + 50) return;
        const g = ctx.createLinearGradient(0, gy, 0, height);
        g.addColorStop(0, "rgba(0,0,0,0.55)"); g.addColorStop(1, "rgba(0,0,0,0.95)");
        ctx.fillStyle = g; ctx.fillRect(p.x, gy, p.w, height - gy);
        ctx.fillStyle = "#9ca3af";                                       // dipte sivri kazıklar
        for (let x = p.x + 4; x < p.x + p.w - 10; x += 16) {
            ctx.beginPath(); ctx.moveTo(x, height); ctx.lineTo(x + 7, height - 22); ctx.lineTo(x + 14, height); ctx.closePath(); ctx.fill();
        }
    });
}

// --- BÖLÜM SONU KAPISI ---
// 7 polis ölünce oyuncunun önünde büyük bir kapı belirir ve açılır; içinden geçen bölüm sonu canavarıyla karşılaşır.
let gate = null, screenFlash = 0;
function spawnGate() {
    const x = Math.min(player.x + 700, WORLD_WIDTH - 1200);
    gate = { x, w: 190, h: 290, open: 0, passed: false };
    fillPitsNear(x - 400, x + 2600);                 // kapı ve canavar alanı düz zemin olsun
    bossCheckpoint = { score, stage: 'gate' };      // ölünce kapıdan devam
    createParticle(player.x + player.w / 2, player.y - 30, t("doorOpen"), "#fde047", 2.5);
    playSfx('hit', { rate: 0.35, vol: 0.8 });       // ağır kapı gümbürtüsü
}
function updateGate() {
    if (screenFlash > 0) screenFlash = Math.max(0, screenFlash - 0.03);
    if (!gate) return;
    if (gate.open < 1) gate.open = Math.min(1, gate.open + 1 / 70);
    // Kapıdan geçince: beyaz parlama, canavar karşıda belirir
    if (!gate.passed && gate.open >= 1 && player.x + player.w / 2 > gate.x + gate.w / 2) {
        gate.passed = true;
        screenFlash = 1;
        spawnBoss(gate.x + gate.w + 520);
    }
}

// Kapı kemeri (yarım daire tepeli)
function archPath(ctx, l, r, bottom, top) {
    const rad = (r - l) / 2;
    ctx.beginPath();
    ctx.moveTo(l, bottom); ctx.lineTo(l, top + rad);
    ctx.arc((l + r) / 2, top + rad, rad, Math.PI, 0);
    ctx.lineTo(r, bottom); ctx.closePath();
}
function drawGate(ctx, g) {
    const gy = height - 60, x = g.x, w = g.w, h = g.h, il = x + 22, ir = x + w - 22, itop = gy - h + 26;
    // İçerisi: kapı açıldıkça parlayan ışık
    const glow = ctx.createRadialGradient(x + w / 2, gy - h / 2, 10, x + w / 2, gy - h / 2, h * 0.9);
    glow.addColorStop(0, `rgba(254,243,199,${0.5 * g.open})`); glow.addColorStop(1, "rgba(254,243,199,0)");
    ctx.fillStyle = glow; ctx.fillRect(x - h * 0.6, gy - h * 1.4, w + h * 1.2, h * 1.5);
    const inner = ctx.createLinearGradient(0, itop, 0, gy);
    inner.addColorStop(0, "#fffbeb"); inner.addColorStop(1, "#fbbf24");
    archPath(ctx, il, ir, gy, itop); ctx.fillStyle = inner; ctx.fill();
    // Kanatlar: menteşeden içe doğru açılır (genişlikleri daralır)
    ctx.save();
    archPath(ctx, il, ir, gy, itop); ctx.clip();
    const half = (ir - il) / 2, pw = half * (1 - g.open * 0.88);
    [[il, 1], [ir, -1]].forEach(([hx, s]) => {
        const l = s > 0 ? hx : hx - pw;
        const wood = ctx.createLinearGradient(l, 0, l + pw, 0);
        wood.addColorStop(0, "#7c2d12"); wood.addColorStop(1, "#451a03");
        ctx.fillStyle = wood; ctx.fillRect(l, itop, pw, gy - itop);
        ctx.fillStyle = "#fbbf24";                                     // altın çiviler
        for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) {
            const cx = l + pw * (0.2 + c * 0.3), cy = itop + 40 + r * 34;
            if (pw > 12) { ctx.beginPath(); ctx.arc(cx, cy, 2.6 * (pw / half), 0, Math.PI * 2); ctx.fill(); }
        }
        if (pw > 20) {                                                 // halka tokmak
            ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(s > 0 ? l + pw - 12 : l + 12, gy - h * 0.45, 8, 0, Math.PI * 2); ctx.stroke();
        }
    });
    ctx.restore();
    // Taş çerçeve, kilit taşı, bayrak
    ctx.fillStyle = "#efe4cc"; ctx.strokeStyle = "#a8956d"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, gy); ctx.lineTo(x, gy - h + w / 2); ctx.arc(x + w / 2, gy - h + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, gy);
    ctx.lineTo(ir, gy); ctx.lineTo(ir, itop + (ir - il) / 2); ctx.arc(x + w / 2, itop + (ir - il) / 2, (ir - il) / 2, 0, Math.PI, true); ctx.lineTo(il, gy);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#d97706";
    ctx.beginPath(); ctx.moveTo(x + w / 2 - 14, gy - h - 2); ctx.lineTo(x + w / 2 + 14, gy - h - 2); ctx.lineTo(x + w / 2 + 9, gy - h + 26); ctx.lineTo(x + w / 2 - 9, gy - h + 26); ctx.closePath(); ctx.fill();
    drawTurkishFlag(ctx, x + w / 2, gy - h - 2, 0.9, performance.now() / 1000);
}
// Kapı ekran dışındaysa sağ kenarda yönünü gösteren ok
function drawGateHint(ctx) {
    if (!gate || gate.passed) return;
    const sx = gate.x + gate.w / 2 - camX;
    if (sx < width - 30) return;
    const y = height * 0.45, bob = Math.sin(performance.now() / 150) * 6;
    ctx.fillStyle = "#fde047"; ctx.strokeStyle = "#000"; ctx.lineWidth = 4;
    ctx.font = "bold 22px Arial"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.strokeText(t("gateHint"), width - 60 + bob, y); ctx.fillText(t("gateHint"), width - 60 + bob, y);
    ctx.beginPath(); ctx.moveTo(width - 50 + bob, y - 16); ctx.lineTo(width - 20 + bob, y); ctx.lineTo(width - 50 + bob, y + 16); ctx.closePath();
    ctx.fill(); ctx.stroke();
}

function restartLevel() {
    // Kapıya ya da canavara ulaşıldıysa polisleri tekrar öldürmek gerekmez: oradan devam
    const cp = bossCheckpoint, start = levelStartScore;
    score = cp ? cp.score : start;
    $('score').innerText = score;
    createLevel();
    levelStartScore = start;
    if(cp) {
        killedEnemies = targetKills;
        $('kills').innerText = killedEnemies;
        if(isFlight()) flightSpawnBoss();
        else if(cp.stage === 'gate') spawnGate(); else spawnBoss(player.x + 420);
    }
}

function completeLevel() {
    if(levelCompleted) return;
    saveBest(); updateBestUi();
    levelCompleted = true;
    $('lang-picker').hidden = true; // Dil sadece başlangıç ekranında seçilir
    paused = true;

    if (currentLevel < MAX_LEVEL) {
        const n = currentLevel;
        $('overlay-title').innerText = t(`l${n}Title`) || t("lvlDone").replace("{n}", n);
        $('overlay-note').innerText = t(`l${n}Note`);
        $('start-button').innerText = t(`l${n}Btn`) || t("lvlNext").replace("{n}", n + 1);
        $('start-button').onclick = () => goToLevel(n + 1);
    } else {
        if (!storyDone.end) { stopGrannyChant(); playStory('end', () => { levelCompleted = false; completeLevel(); }); return; }
        $('overlay-title').innerText = t("winTitle");
        $('overlay-note').innerText = t("winNote");
        $('start-button').innerText = t("winBtn");
        $('start-button').onclick = () => location.reload();
    }
    $('overlay-screen').style.display = 'flex';
}

// --- BÖLÜMLER ---
// platforms: [x, ekranın altından yükseklik, genişlik, kalınlık] (başlangıç bölgesi; gerisi buildLayout ile üretilir)
// fire: polislerin ateş aralığı (kare); riot(i): i. düşman çevik kuvvet mi
// kinds(i): i. düşmanın türü ('police' tabancalı, 'riot' çevik kuvvet, 'tank' mini tank)
// bg: arka plan; pit/sniper: çukur ve nişancı olasılığı; minSnipers: en az nişancı sayısı
// Bölüme özel: item 'tape' (kaset), exile 'surgun'/'ihrac' (ölen bavulla gider), battery (şarj),
// mode 'flight' (uçuş), stamp (KHK damgası), civilians (zararsız siviller)
const LEVELS = {
    1: { target: 7, music: 'chiptune_level1.mp3', boss: 'alevi', speed: 1.5, fire: 170, kinds: i => i % 5 === 2 ? 'riot' : 'police',
         bg: 'hills', pit: 0.35, sniper: 0.3, minSnipers: 2,
         platforms: [[600, 180, 200, 120], [1200, 250, 300, 50], [1800, 150, 150, 100], [2300, 350, 400, 50]] },
    2: { target: 7, music: 'bozkir_dortnal.mp3', boss: 'kurt', speed: 2.5, fire: 150, kinds: i => i % 3 === 2 ? 'riot' : 'police',
         bg: 'steppe', pit: 0.5, sniper: 0.45, minSnipers: 3,
         platforms: [[400, 150, 150, 40], [800, 300, 150, 40], [1200, 450, 200, 40], [1600, 300, 300, 40]] },
    3: { target: 7, music: 'chiptune_level1.mp3', boss: 'sayac', speed: 2.8, fire: 145, kinds: i => i % 3 === 1 ? 'riot' : 'police',
         bg: 'villa', pit: 0.5, sniper: 0.45, minSnipers: 3, item: 'tape',
         platforms: [[500, 160, 180, 40], [900, 280, 160, 40], [1300, 380, 220, 40], [1800, 220, 260, 40]] },
    4: { target: 7, music: 'chiptune_level3.mp3', boss: 'feto', speed: 3.2, fire: 125, kinds: i => i % 2 === 1 ? 'riot' : 'police',
         bg: 'city', pit: 0.65, sniper: 0.6, minSnipers: 4, exile: 'surgun',
         platforms: [[500, 170, 180, 40], [850, 290, 180, 40], [1250, 400, 260, 40], [1700, 260, 200, 40], [2200, 180, 300, 40]] },
    5: { target: 7, music: 'bozkir_dortnal.mp3', boss: 'darbetank', speed: 2.2, fire: 140, kinds: i => i % 2 === 0 ? 'tank' : 'police',
         bg: 'coast', pit: 0.5, sniper: 0.4, minSnipers: 2, battery: true,
         platforms: [[600, 170, 200, 40], [1100, 290, 200, 40], [1600, 200, 240, 40]] },
    6: { target: 12, music: 'intro_title.mp3', boss: 'tanker', mode: 'flight', bg: 'sky', speed: 0, fire: 0, kinds: () => 'police',
         pit: 0, sniper: 0, minSnipers: 0, platforms: [] },
    7: { target: 7, music: 'chiptune_level3.mp3', boss: 'bylock', speed: 3, fire: 130, kinds: i => i % 3 === 2 ? 'riot' : 'police',
         bg: 'ankara', pit: 0.55, sniper: 0.5, minSnipers: 3, exile: 'ihrac', stamp: true, civilians: true,
         platforms: [[500, 170, 200, 40], [950, 300, 200, 40], [1400, 200, 260, 40]] },
    8: { target: 7, music: 'chiptune_level1.mp3', boss: 'feto2', speed: 3.4, fire: 115, kinds: i => i % 2 === 1 ? 'riot' : 'police',
         bg: 'snow', pit: 0.65, sniper: 0.65, minSnipers: 4,
         platforms: [[500, 170, 180, 40], [850, 290, 180, 40], [1250, 400, 260, 40], [1700, 260, 200, 40], [2200, 180, 300, 40]] }
};
const MAX_LEVEL = 8;

function goToLevel(n) {
    stopGrannyChant();   // teyzeler sonraki bölüme geçince susar
    if (!storyDone[n]) { $('overlay-screen').style.display = 'none'; playStory(n, () => goToLevel(n)); return; }
    currentLevel = n; targetKills = LEVELS[n].target;
    $('current-level').innerText = n; $('target-kills').innerText = targetKills;
    $('overlay-screen').style.display = 'none'; paused = false;
    const bgMusic = $('bg-music');
    bgMusic.src = LEVELS[n].music; bgMusic.play().catch(()=>{});
    createLevel();
}

function createLevel() {
    items = []; enemies = []; projectiles = []; playerProjectiles = []; particles = [];
    killedEnemies = 0; levelCompleted = false; levelEnding = false;
    boss = null; bossCheckpoint = null; gate = null; grannies = []; screenFlash = 0;
    power = { speed: 0, double: 0, hammer: 0, star: 0 }; usedDouble = false;
    levelStartScore = score;
    player.x = 100; player.y = 0; player.vx = 0; player.vy = 0; camX = 0;
    player.isDying = false; player.deathAngle = 0; player.opacity = 1; player.mouthOpen = 0; player.dir = 1;
    player.swing = 0; player.swingHit = false;
    player.hp = player.maxHp; player.invuln = 0; player.knock = 0; updateHearts();
    player.w = 100; player.h = 180; player.shield = false;
    $('game-container').classList.remove('shake');
    $('kills').innerText = "0";
    initChapter();
    if (isFlight()) { createFlight(); return; }

    const layout = buildLayout(currentLevel);
    pits = layout.pits;
    platforms = [...groundSegments(pits),
                 ...[...LEVELS[currentLevel].platforms, ...layout.plats].map(([x, up, w, h]) => ({ x, y: height - up, w, h }))];

    for(let i=0; i<40; i++) {
        items.push({ x: 800 + i * 700, y: height - 150 - (Math.random() * 250), collected: false,
                     power: i % 5 === 2 ? POWER_ORDER[Math.floor(i / 5) % POWER_ORDER.length] : null });   // her 5 torbadan biri güç küresi
    }

    layout.bags.forEach(([x, up]) => items.push({ x, y: height - up, collected: false }));   // platform üstü torbalar

    for(let i=0; i<20; i++) {
        const homeX = 1500 + i * 1500;
        // 17/25 polisleri: tabancalı polis ya da kalkanlı çevik kuvvet; bölüm ilerledikçe çevik kuvvet artar
        const kind = LEVELS[currentLevel].kinds(i), riot = kind === 'riot', tank = kind === 'tank';
        const w = tank ? 170 : 120, h = tank ? 96 : 200;
        enemies.push({
            kind, turnT: 0,
            x: homeX, y: height - 60 - h, w, h,   // alt kenar zeminde
            timer: Math.floor(Math.random() * 60), interval: LEVELS[currentLevel].fire * (tank ? 1.3 : 1), dead: false,
            aim: 0, flash: 0,
            homeX: homeX,                          // Devriye merkezi
            dir: Math.random() < 0.5 ? -1 : 1,     // Yürüme yönü
            speed: LEVELS[currentLevel].speed * (riot ? 0.7 : tank ? 0.8 : 1),   // bölüm ilerledikçe hızlanır; çevik kuvvet yavaş
            walkCycle: Math.random() * Math.PI * 2
        });
    }
    // Keskin nişancılar yüksek platformların üstünde
    layout.snipers.forEach(([x, up]) => enemies.push({
        kind: 'sniper', x: x - 45, y: height - up - 120, w: 90, h: 120, dead: false, homeX: x,
        dir: -1, laser: 0, cool: 60 + Math.floor(Math.random() * 60), flash: 0, aimAng: 0, mx: x, my: height - up - 60,
        walkCycle: 0, lastSpeed: 0
    }));
    populateChapter();
}
