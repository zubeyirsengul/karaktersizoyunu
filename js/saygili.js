// 2. bölüm: 4'LÜ ÇETEYİ KURTAR (17-25 Aralık 2013). 17/25 polisleri baskında; bakan oğulları gözaltında,
// ayakkabı kutularından dolar çıktı, 25 Aralık'ta sıra Bilal'e geldi.
// Oyunda: 11 polis → kapı → canavar SAYGILI (dev polis: 260 boy, polisler 200; 7 can; kafasına zıplanabilsin diye daha uzun değil). Yakına gelince copunu kaldırıp vurur (önden kalkan durdurur),
// uzaktayken kavisli kelepçe atar. Torbaların yerine ayakkabı kutuları toplanır.
// Arka plan: İstanbul Emniyet Müdürlüğü, çakarlı polis araçları, muhabirler, ayakkabı kutusu yığınları.
// Çizimler kodla (resim dosyası yok).
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- METİNLER (oyun içi) ---
const SAYGILI_TEXT = {
    tr: { sniperName: "KÖPRÜNÜN ÜSTÜNDEKİ SINAYPIRCI", saygiliName: "SAYGILI", boxPick: "AYAKKABI KUTUSU!", copBlocked: "COP KALKANA ÇARPTI!",
          l2Note: "4'lü çete ve Bilal kurtuldu, dosya kapandı! Sıra 25 Aralık kasetlerinde." },
    en: { sniperName: "SINAYPIRCI ON THE BRIDGE", saygiliName: "SAYGILI", boxPick: "SHOE BOX!", copBlocked: "BATON BLOCKED!",
          l2Note: "The Gang of Four and Bilal are free, case closed! Next up: the December 25 tapes." },
    fr: { sniperName: "LE SINAYPIRCI DU PONT", saygiliName: "SAYGILI", boxPick: "BOÎTE À CHAUSSURES !", copBlocked: "MATRAQUE BLOQUÉE !",
          l2Note: "La bande des quatre et Bilal sont libres, affaire classée ! Place aux cassettes du 25 décembre." },
    nl: { sniperName: "SINAYPIRCI OP DE BRUG", saygiliName: "SAYGILI", boxPick: "SCHOENENDOOS!", copBlocked: "KNUPPEL GEBLOKKEERD!",
          l2Note: "De bende van vier en Bilal zijn vrij, dossier gesloten! Nu de banden van 25 december." },
    de: { sniperName: "SINAYPIRCI AUF DER BRÜCKE", saygiliName: "SAYGILI", boxPick: "SCHUHKARTON!", copBlocked: "KNÜPPEL ABGEWEHRT!",
          l2Note: "Die Viererbande und Bilal sind frei, Akte geschlossen! Jetzt die Bänder vom 25. Dezember." },
    ru: { sniperName: "СЫНАЙПЫРДЖЫ НА МОСТУ", saygiliName: "САЙГЫЛЫ", boxPick: "ОБУВНАЯ КОРОБКА!", copBlocked: "ДУБИНКА ОТБИТА!",
          l2Note: "Банда четырёх и Билал на свободе, дело закрыто! Теперь записи 25 декабря." }
};
for (const L in SAYGILI_TEXT) if (LANGS[L]) Object.assign(LANGS[L], SAYGILI_TEXT[L]);

// --- KÖPRÜ VE SINAYPIRCI ---
// Her köprünün ortasında diz çökmüş "Köprünün Üstündeki SINAYPIRCI" durur (2 can; lazerle nişan alır, çapraz ateş eder).
// Köprü bir alt raf (T1) yüksekliğinde: yerden zıplanarak çıkılır, altından yürünür.
function populateSaygili() {
    platforms.filter(p => p.kind === 'bridge').forEach(p => {
        const x = p.x + p.w / 2;
        enemies.push({ kind: 'sniper', nameKey: 'sniperName', x: x - 45, y: p.y - 120, w: 90, h: 120, dead: false, homeX: x,
                       dir: -1, laser: 0, cool: 60 + Math.floor(Math.random() * 60), flash: 0, aimAng: 0, mx: x, my: p.y - 60,
                       walkCycle: 0, lastSpeed: 0, hp: 2, maxHp: 2, hurt: 0 });
    });
}
// Asma köprü: iki kule, sarkan halatlar, askılar, korkuluklu tabliye; kuleler yere iner
function drawBridge(ctx, p) {
    const gy = height - 60, x0 = p.x, x1 = p.x + p.w, top = p.y, TW = 26, TH = 170;
    ctx.save();
    [x0 - 6, x1 - TW + 6].forEach(tx => {                                   // kuleler
        ctx.fillStyle = "#94a3b8"; ctx.fillRect(tx, top - TH, TW, gy - top + TH);
        ctx.fillStyle = "#64748b"; ctx.fillRect(tx + TW - 7, top - TH, 7, gy - top + TH);
        ctx.fillStyle = "#cbd5e1"; ctx.fillRect(tx - 4, top - TH - 10, TW + 8, 12);
        ctx.fillStyle = "#475569"; ctx.fillRect(tx + 6, top - TH + 30, TW - 12, 26); ctx.fillRect(tx + 6, top - TH + 80, TW - 12, 26);
        ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(tx + TW / 2, top - TH - 14, 4, 0, Math.PI * 2); ctx.fill();   // uçak ikaz lambası
    });
    const ax = x0 - 6 + TW / 2, bx = x1 + 6 - TW / 2, ay = top - TH + 4, sag = top - 26;
    const cable = u => { const xx = ax + (bx - ax) * u; return [xx, ay + (sag - ay) * (1 - Math.pow(2 * u - 1, 2))]; };
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1.5;                       // askılar
    for (let u = 0.08; u < 0.95; u += 0.07) { const [xx, yy] = cable(u); ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx, top); ctx.stroke(); }
    ctx.strokeStyle = "#f8fafc"; ctx.lineWidth = 4;                         // ana halat
    ctx.beginPath(); for (let u = 0; u <= 1.001; u += 0.05) { const [xx, yy] = cable(u); u ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
    ctx.fillStyle = "#475569"; ctx.fillRect(x0, top, p.w, p.h);             // tabliye
    ctx.fillStyle = "#1f2937"; ctx.fillRect(x0, top, p.w, 6);
    ctx.fillStyle = "#facc15"; for (let x = x0 + 10; x < x1 - 20; x += 40) ctx.fillRect(x, top + 2, 18, 2);   // yol çizgisi
    ctx.fillStyle = "#334155"; ctx.fillRect(x0, top + p.h - 8, p.w, 8);
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2;                         // korkuluk
    ctx.beginPath(); ctx.moveTo(x0, top - 18); ctx.lineTo(x1, top - 18); ctx.stroke();
    for (let x = x0 + 4; x <= x1 - 4; x += 16) { ctx.beginPath(); ctx.moveTo(x, top - 18); ctx.lineTo(x, top); ctx.stroke(); }
    ctx.restore();
}

// --- AYAKKABI KUTUSU (torbaların yerine): kapağı aralık, içinden dolar destesi görünür ---
function drawShoebox(ctx, x, y) {
    const tm = performance.now() / 1000, bob = Math.sin(tm * 3 + x) * 5;
    ctx.save(); ctx.translate(x, y + bob); ctx.rotate(Math.sin(tm * 2 + x) * 0.06);
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 52);
    g.addColorStop(0, "rgba(74,222,128,0.45)"); g.addColorStop(1, "rgba(74,222,128,0)");
    ctx.fillStyle = g; ctx.fillRect(-52, -52, 104, 104);
    ctx.fillStyle = "#ea580c"; ctx.strokeStyle = "#7c2d12"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(-36, -10, 72, 34, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#16a34a"; ctx.fillRect(-28, -16, 56, 8);                      // dolar desteleri
    ctx.fillStyle = "#22c55e"; ctx.fillRect(-24, -21, 22, 6); ctx.fillRect(2, -20, 22, 6);
    ctx.fillStyle = "#dcfce7"; ctx.font = "bold 9px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("$", -13, -18); ctx.fillText("$", 13, -17);
    ctx.save(); ctx.translate(-38, -12); ctx.rotate(-0.35);                         // aralık kapak
    ctx.fillStyle = "#f97316"; ctx.strokeStyle = "#7c2d12"; ctx.beginPath(); ctx.roundRect(0, -8, 78, 10, 2); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#fff7ed"; ctx.font = "bold 10px Arial"; ctx.fillText("SHOES", 0, 8);
    ctx.restore();
}

// --- ARKA PLAN: Aralık 2013, İstanbul. Kapalı kış göğü, Emniyet Müdürlüğü, çakarlı araçlar, muhabirler ---
THEMES.emniyet = { sky: ["#475569", "#64748b", "#94a3b8", "#cbd5e1"], sun: { x: 0.76, y: 0.15, r: 30, c: "#e2e8f0", glow: "rgba(226,232,240,0.25)" },
                   clouds: "rgba(203,213,225,0.85)", ground: ["#57534e", "#292524"], grass: "#a8a29e", grassDark: "#57534e", curb: true };
function drawPoliceCar(x, y, s, time, k) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.roundRect(-70, -40, 140, 28, 8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-38, -40); ctx.lineTo(-24, -62); ctx.lineTo(30, -62); ctx.lineTo(44, -40); ctx.fill();
    ctx.fillStyle = "#1e3a5f"; ctx.fillRect(-26, -58, 24, 16); ctx.fillRect(4, -58, 26, 16);
    ctx.fillStyle = "#1d4ed8"; ctx.fillRect(-70, -30, 140, 7);
    ctx.fillStyle = "#1d4ed8"; ctx.font = "bold 11px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("POLİS", 0, -18);
    const on = Math.floor(time * 6 + k) % 2;
    ctx.fillStyle = on ? "#3b82f6" : "#1e3a8a"; ctx.fillRect(-14, -70, 14, 8);
    ctx.fillStyle = on ? "#7f1d1d" : "#ef4444"; ctx.fillRect(0, -70, 14, 8);
    const glow = ctx.createRadialGradient(on ? -7 : 7, -66, 2, on ? -7 : 7, -66, 60);
    glow.addColorStop(0, on ? "rgba(59,130,246,0.45)" : "rgba(239,68,68,0.45)"); glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow; ctx.fillRect(-70, -130, 140, 130);
    ctx.fillStyle = "#111827"; [-42, 42].forEach(wx => { ctx.beginPath(); ctx.arc(wx, -10, 12, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
}
function drawEmniyetBg(time) {
    skyline(0.06, height * 0.62, 40, 140, "#7c8aa0", null, 17);
    // İstanbul Emniyet Müdürlüğü
    layerProps(0.16, 2300, 1, 23, sx => {
        const b = height * 0.82, w = 560, h = 250, x = sx - w / 2;
        ctx.fillStyle = "#cbd5e1"; ctx.fillRect(x, b - h, w, h);
        ctx.fillStyle = "#94a3b8"; ctx.fillRect(x - 10, b - h - 12, w + 20, 14);
        for (let r = 0; r < 6; r++) for (let c = 0; c < 14; c++) {
            ctx.fillStyle = hash(sx * 0.01 + r * 13 + c) > 0.3 ? "#334155" : "#fde68a";
            ctx.fillRect(x + 16 + c * 38, b - h + 20 + r * 34, 24, 20);
        }
        ctx.fillStyle = "#1e3a8a"; ctx.fillRect(x + w / 2 - 190, b - h - 52, 380, 34);
        ctx.fillStyle = "#fff"; ctx.font = "bold 17px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("İSTANBUL EMNİYET MÜDÜRLÜĞÜ", sx, b - h - 34);
        ctx.fillStyle = "#e5e7eb"; ctx.fillRect(x + w - 30, b - h - 150, 4, 150);          // bayrak direği
        ctx.fillStyle = "#e30a17"; ctx.fillRect(x + w - 26, b - h - 148, 70, 46);
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x + w + 2, b - h - 125, 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#e30a17"; ctx.beginPath(); ctx.arc(x + w + 6, b - h - 125, 10.5, 0, Math.PI * 2); ctx.fill();
        ctx.textBaseline = "alphabetic";
    });
    // Orta: çakarlı polis araçları, ayakkabı kutusu yığınları, muhabirler
    const mb = height * 0.88;
    ctx.fillStyle = "#78716c"; ctx.fillRect(0, mb - 4, width, height - mb + 4);
    layerProps(0.35, 420, 0.9, 5, (sx, i) => {
        const kind = i % 3;
        if (kind === 0) drawPoliceCar(sx, mb, 1, time, i);
        else if (kind === 1) {   // dolu ayakkabı kutuları yığını
            for (let r = 0; r < 3; r++) for (let c = 0; c < 3 - r; c++) {
                const bx = sx - 60 + c * 40 + r * 20, by = mb - 26 - r * 26;
                ctx.fillStyle = "#ea580c"; ctx.fillRect(bx, by, 38, 24); ctx.fillStyle = "#9a3412"; ctx.fillRect(bx, by, 38, 5);
                ctx.fillStyle = "#22c55e"; ctx.fillRect(bx + 8, by - 3, 22, 4);
            }
        } else {                 // kameralı muhabirler, flaşlar
            for (let k = 0; k < 4; k++) {
                const px = sx - 50 + k * 32;
                person(px, mb, 1.2, k % 2 ? "#1f2937" : "#334155");
                ctx.fillStyle = "#111827"; ctx.fillRect(px + 4, mb - 72, 16, 11);
                if (Math.sin(time * 7 + k * 2.3 + i) > 0.93) {
                    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.beginPath(); ctx.arc(px + 20, mb - 67, 12, 0, Math.PI * 2); ctx.fill();
                }
            }
        }
    });
    // Ön: sarı-siyah polis şeridi
    const tb = height * 0.92, off = camX * 0.6;
    ctx.fillStyle = "#57534e";
    for (let x = -(off % 300); x < width; x += 300) ctx.fillRect(x, tb - 50, 6, 50);
    ctx.save(); ctx.beginPath(); ctx.rect(0, tb - 46, width, 16); ctx.clip();
    for (let x = -(off % 40) - 40; x < width + 40; x += 40) {
        ctx.fillStyle = "#facc15"; ctx.fillRect(x, tb - 46, 20, 16); ctx.fillStyle = "#111827"; ctx.fillRect(x + 20, tb - 46, 20, 16);
    }
    ctx.fillStyle = "#111827"; ctx.font = "bold 12px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let x = -(off % 300) + 150; x < width; x += 300) { ctx.fillStyle = "#facc15"; ctx.fillRect(x - 50, tb - 46, 100, 16); ctx.fillStyle = "#111827"; ctx.fillText("POLİS - GİRİLMEZ", x, tb - 38); }
    ctx.restore(); ctx.textBaseline = "alphabetic";
}

// --- CANAVAR: SAYGILI ---
// Dev 17/25 polisi: güneş gözlüklü, kalın bıyıklı, apoletli. Karşılarken "Biz bu ülkenin namusunu kurtardık!" der.
// Oyuncunun peşinden yürür ve sırayla saldırır:
//   COP     (yakın): copu omzunun arkasına kaldırır (kırmızı "!") → başının üstünden öne indirir. Ona dönük kalkan durdurur.
//   HÜCUM   (orta/uzak): çömelir ("!") → copu önde, hızla koşar; çarpan can kaybeder (üstünden zıplanır).
//   SIÇRAMA (orta): oyuncunun üstüne zıplar, yere inince iki yana şok dalgası; inişten sonra kısa süre sersemler.
//   KELEPÇE (uzak): kavisli kelepçe atar (öfkeliyken iki tane).
// Öfkelenince (can yarıya inince) her şeyi 1,5 kat hızlı yapar.
BOSS_TYPES.saygili = { greet: 'saygili_namus', say: "BİZ BU ÜLKENİN NAMUSUNU KURTARDIK!", w: 140, h: 260, scale: 1, hp: 7, arena: 900,
                       nameKey: "saygiliName", stomp: 80, labelY: 40, update: updateSaygili, draw: drawSaygili };
const COP_REACH = 250, CUFF_G = 0.35, LEAP_G = 0.8;
function sgState(b, s) { b.state = s; b.stateT = 0; }
function updateSaygili(b) {
    const pcx = player.x + player.w / 2, cx = b.x + b.w / 2, dist = pcx - cx, ad = Math.abs(dist), ground = height - 60 - b.h;
    const clampX = x => Math.max(b.homeX - b.T.arena, Math.min(x, b.homeX + b.T.arena));
    b.stateT++;
    switch (b.state) {
        case 'wind':   if (b.stateT >= 28) sgState(b, 'swing'); return;
        case 'swing':  if (b.stateT === 5) copHit(b); if (b.stateT >= 18) { sgState(b, 'walk'); b.cool = 35; } return;
        case 'throw':
            if (b.stateT === 12) { throwCuffs(b, 0); if (b.rage) throwCuffs(b, 14); }
            if (b.stateT >= 26) { sgState(b, 'walk'); b.cool = 30; }
            return;
        case 'crouch': if (b.stateT >= 24) { sgState(b, 'dash'); playSfx('hit', { rate: 0.5, vol: 0.6 }); } return;
        case 'dash': {   // copu önde, hızla koşar; arena kenarında ya da oyuncuyu epey geçince durur
            const nx = clampX(b.x + b.look * 10);
            const passed = (pcx - (nx + b.w / 2)) * b.look < -220;
            b.walk = (b.walk || 0) + 0.5; b.moving = true;
            if (nx === b.x || passed || b.stateT > 70) { sgState(b, 'walk'); b.cool = 45; b.moving = false; }
            b.x = nx;
            if (b.stateT % 6 === 0) createParticle(b.x + b.w / 2 - b.look * 40, height - 70);   // toz
            return;
        }
        case 'leap':
            b.vy += LEAP_G; b.y += b.vy; b.x = clampX(b.x + b.vx);
            if (b.y >= ground) {   // iniş: şok dalgası
                b.y = ground; b.vy = 0; sgState(b, 'land');
                camShake = Math.max(camShake, 14); playSfx('hit', { rate: 0.45, vol: 1 });
                [-1, 1].forEach(d => projectiles.push({ type: 'wave', x: b.x + b.w / 2 + d * 40, y: height - 60, vx: d * 8, active: true, life: 85, angle: 0 }));
            }
            return;
        case 'land':   if (b.stateT >= 26) { sgState(b, 'walk'); b.cool = 30; } return;   // sersemler: kafasına basma fırsatı
    }
    // Yürüyüş: oyuncunun peşinden gider, sıradaki saldırıyı seçer
    b.look = Math.sign(dist) || b.look;
    if (b.cool > 0) b.cool--;
    if (!player.isDying && !(b.cool > 0) && ad < 1300) {   // cool başta tanımsız: "<= 0" yanlış verir
        const r = Math.random();
        if (ad < COP_REACH - 20) { sgState(b, 'wind'); return; }
        if (ad < 650) {
            if (r < 0.4) { sgState(b, 'crouch'); return; }
            if (r < 0.7) {
                sgState(b, 'leap');
                const T = 2 * 17 / LEAP_G;   // havada kalma süresi (kare)
                b.vy = -17; b.vx = Math.max(-9, Math.min(9, dist / T));
                return;
            }
            sgState(b, 'throw'); return;
        }
        sgState(b, r < 0.6 ? 'throw' : 'crouch'); return;
    }
    const sp = ad > 170 ? 2.8 : 0;
    b.x = clampX(b.x + b.look * sp);
    b.walk = (b.walk || 0) + sp * 0.05; b.moving = sp > 0;
}
// Cop iner: önündeki oyuncu can kaybeder; ona dönük kalkan copu durdurur
function copHit(b) {
    camShake = Math.max(camShake, 8);
    playSfx('hit', { rate: 0.7, vol: 0.9 });
    const cx = b.x + b.w / 2, x0 = Math.min(cx, cx + b.look * COP_REACH), x1 = Math.max(cx, cx + b.look * COP_REACH);
    if (player.isDying || player.x + player.w - 20 < x0 || player.x + 20 > x1 || player.y + player.h < b.y + 40) return;
    if (player.shield && player.dir === -b.look) {
        player.vx = b.look * 12; player.knock = 10;
        createParticle(player.x + player.w / 2, player.y - 10, t("copBlocked"), "#fde047", 1.0);
        return;
    }
    die();
}
function throwCuffs(b, extra) {
    const sx = b.x + b.w / 2 + b.look * 50, sy = b.y + 90, pcx = player.x + player.w / 2;
    const T = 40 + Math.abs(pcx - sx) / 30 + extra, tx = pcx + player.vx * 8, ty = player.y + player.h * 0.5;
    projectiles.push({ type: 'cuffs', x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy) / T - 0.5 * CUFF_G * T, active: true, life: 300, angle: 0 });
    playSfx('hit', { rate: 2.6, vol: 0.35 });
}
function updateCuffs(p) {
    p.life--;
    const prevY = p.y;
    p.vy += CUFF_G; p.y += p.vy; p.angle += 0.35;
    if (!player.isDying && p.x > player.x + 15 && p.x < player.x + player.w - 15 && p.y > player.y && p.y < player.y + player.h) {
        p.active = false;
        if (shieldBlocks(p)) blockProjectile(p); else die();
        return;
    }
    for (const pl of platforms) {
        if (p.vy > 0 && p.x > pl.x && p.x < pl.x + pl.w && prevY <= pl.y && p.y >= pl.y) {
            p.active = false; playSfx('hit', { rate: 3, vol: 0.25 });
            for (let i = 0; i < 5; i++) particles.push({ x: p.x, y: pl.y, vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 4, life: 0.3, maxLife: 0.3, size: 2.5, text: null });
            return;
        }
    }
}
function drawCuffs(ctx, p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
    ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(-14, 0, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(14, 0, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#9ca3af"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(-14, 0, 10, -2.4, -1.2); ctx.stroke();
    ctx.restore();
}
Object.assign(PROJECTILES, { cuffs: [updateCuffs, drawCuffs] });

const SAYGILI_LEGS = { photoH: 1, ratio: 0.36, width: 13, swing: 0.6, front: "#1e3a8a", back: "#172554", shoe: "#0a0a0a" };
function drawSaygili(ctx, b) {
    const H = b.h, wind = b.state === 'wind' ? Math.min(1, b.stateT / 20) : 0, swing = b.state === 'swing' ? Math.min(1, b.stateT / 5) : 0;
    const throwing = b.state === 'throw' ? Math.sin(Math.min(1, b.stateT / 14) * Math.PI) : 0;
    const talk = b.talk > 0 ? Math.abs(Math.sin(b.anim * 0.45)) : 0;
    const crouch = b.state === 'crouch' ? Math.min(1, b.stateT / 10) : b.state === 'land' ? Math.max(0, 1 - b.stateT / 14) : 0;
    const air = b.state === 'leap', dash = b.state === 'dash';
    ctx.save();
    if (air) {   // gölge yerde kalır
        ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.beginPath(); ctx.ellipse(b.x + b.w / 2, height - 62, 50, 9, 0, 0, Math.PI * 2); ctx.fill();
    }
    bossBaseTransform(ctx, b);
    ctx.scale(b.look, 1);
    if (!air) { ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.ellipse(0, -2, 60, 10, 0, 0, Math.PI * 2); ctx.fill(); }
    if (crouch) ctx.scale(1 + crouch * 0.08, 1 - crouch * 0.16);   // çömelir / inişte ezilir
    if (dash) ctx.rotate(0.18);                                     // hücumda öne eğilir
    const legs = drawLegs(ctx, 0, -H, H, 1, b.walk || 0, !!b.moving, air, SAYGILI_LEGS);
    ctx.translate(0, -H + legs.drop);
    const s = H * 0.64 / 128; ctx.scale(s, s);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    const sw = b.moving ? Math.sin((b.walk || 0)) * 0.4 : 0.1;
    // Arka kol: kelepçe fırlatırken yukarı savrulur
    ctx.save(); ctx.translate(-14, 56); ctx.rotate(-sw - throwing * 2.6);
    ctx.strokeStyle = "#172554"; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 44); ctx.stroke();
    ctx.fillStyle = "#e8b48f"; ctx.beginPath(); ctx.arc(0, 48, 7.5, 0, Math.PI * 2); ctx.fill();
    if (throwing > 0.2) { ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-6, 56, 6, 0, Math.PI * 2); ctx.arc(6, 56, 6, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    // Gövde: geniş, apoletli üniforma
    ctx.fillStyle = "#1e40af"; ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(-32, 48, 64, 76, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#facc15"; ctx.fillRect(-34, 48, 16, 6); ctx.fillRect(18, 48, 16, 6);             // apoletler
    ctx.fillStyle = "#fde68a"; [-30, -22, 22, 30].forEach(x => { ctx.beginPath(); ctx.arc(x, 51, 1.8, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = "#93c5fd"; ctx.beginPath(); ctx.moveTo(-10, 48); ctx.lineTo(0, 60); ctx.lineTo(10, 48); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#1e3a8a"; ctx.fillRect(-2, 58, 4, 34);                                              // kravat
    ctx.save(); ctx.translate(18, 66); ctx.fillStyle = "#fbbf24"; ctx.beginPath();                    // rozet
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 3.5 : 8, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill(); ctx.restore();
    chestPlate(ctx, 12, 88, b.look);
    ctx.fillStyle = "#111827"; ctx.fillRect(-32, 110, 64, 10);                                         // kemer + kelepçe
    ctx.fillStyle = "#d4d4d8"; ctx.fillRect(-6, 111, 12, 8);
    ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(-20, 124, 5, 0, Math.PI * 2); ctx.arc(-10, 124, 5, 0, Math.PI * 2); ctx.stroke();
    // Kafa: güneş gözlüğü, kalın bıyık, kasket
    ctx.fillStyle = "#e8b48f"; ctx.strokeStyle = "#7c4a24"; ctx.lineWidth = 2;
    ctx.fillRect(-8, 38, 16, 12);
    ctx.beginPath(); ctx.ellipse(2, 26, 20, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.roundRect(-2, 18, 24, 9, 3); ctx.fill();            // gözlük
    ctx.fillStyle = "rgba(148,163,184,0.7)"; ctx.fillRect(12, 19, 6, 2);
    ctx.fillStyle = "#292524"; ctx.beginPath(); ctx.ellipse(13, 36, 12, 4.5, 0.05, 0, Math.PI * 2); ctx.fill();   // bıyık
    const mouth = Math.max(talk, wind, swing);
    if (mouth > 0.1) { ctx.fillStyle = "#450a0a"; ctx.beginPath(); ctx.ellipse(13, 43, 6, 2 + mouth * 4, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#1e3a8a"; ctx.strokeStyle = "#0f172a";
    ctx.beginPath(); ctx.moveTo(-21, 12); ctx.lineTo(-16, -6); ctx.lineTo(20, -6); ctx.lineTo(23, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.ellipse(18, 12, 17, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#facc15"; ctx.fillRect(-18, 5, 39, 3.5); ctx.beginPath(); ctx.arc(4, 0, 4.5, 0, Math.PI * 2); ctx.fill();
    // Ön kol + cop: kalkar (uyarı) → iner
    // Kol açısı: 0 = aşağı, π = yukarı, 3π/2 = ileri. Cop omzun arkasına kalkar, başının üstünden öne iner.
    const ang = b.state === 'wind' ? 0.2 + wind * 2.3 : b.state === 'swing' ? 2.5 + swing * 2.9
              : dash || b.state === 'crouch' ? 4.5 : air ? 3.3 : sw * 0.4 - 0.25;
    ctx.save(); ctx.translate(-10, 56); ctx.rotate(ang);
    ctx.strokeStyle = "#1e3a8a"; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 44); ctx.stroke();
    ctx.fillStyle = "#111827"; ctx.beginPath(); ctx.roundRect(-4, 34, 9, 64, 4); ctx.fill();             // cop
    ctx.fillStyle = "#374151"; ctx.fillRect(-6, 46, 13, 4);
    ctx.fillStyle = "#e8b48f"; ctx.beginPath(); ctx.arc(0, 48, 7.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (b.state === 'swing' && b.stateT < 10) {   // cop izi
        ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - b.stateT / 10)})`; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(-10, 56, 95, 2.5 + Math.PI / 2, 2.5 + Math.PI / 2 + 2.9 * swing); ctx.stroke();
    }
    ctx.restore();
    if ((b.state === 'wind' || b.state === 'crouch') && !b.dying) {   // uyarı işareti
        ctx.fillStyle = "#ef4444"; ctx.font = "bold 46px Arial"; ctx.textAlign = "center"; ctx.lineWidth = 5; ctx.strokeStyle = "#000";
        ctx.strokeText("!", b.x + b.w / 2, b.y - 92); ctx.fillText("!", b.x + b.w / 2, b.y - 92);
    }
}

// --- HİKÂYE ---
Object.assign(PIX_FACES, {
    bilal:   { pal: { h: '#1c1917', s: '#eac39f', e: '#1f2937', b: '#44403c', m: '#7f1d1d' },
               rows: ['.hhhhhh.', 'hhhhhhhh', 'hssssssh', 'sesssess', 'ssssssss', 'sbssssbs', 'sbbmmbbs', '.bbbbbb.'] },
    saygili: { pal: { k: '#1e3a8a', y: '#fbbf24', s: '#e8b48f', g: '#0f172a', b: '#292524', m: '#7c2d12' },
               rows: ['kkkkkkkk', 'kkkyykkk', 'kkkkkkkk', 'ssssssss', 'sgggsggg', 'ssssssss', 'sbbbbbbs', 'ssmmmmss'] }
});
// Makaralı teyp: iki makara döner, bant akar, ses dalgaları çıkar; üstünde "4'LÜ ÇETE" etiketi
Object.assign(STORY_PROPS, {
    reel(c, time) {
        const cx = 480, top = 200;
        blockRect(c, cx - 150, STORY_GROUND - 40, 300, 40, '#78350f');                 // masa
        blockRect(c, cx - 130, top, 260, 200, '#1f2937');                                // teyp gövdesi
        c.fillStyle = '#374151'; c.fillRect(cx - 118, top + 150, 236, 38);
        [-1, 1].forEach((s, k) => {                                                       // makaralar
            const rx = cx + s * 62, ry = top + 70, R = 48;
            c.fillStyle = '#9ca3af'; c.beginPath(); c.arc(rx, ry, R, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#7c2d12'; c.beginPath(); c.arc(rx, ry, R - 8 - k * 10, 0, Math.PI * 2); c.fill();   // sarılı bant
            c.fillStyle = '#e5e7eb'; c.beginPath(); c.arc(rx, ry, 12, 0, Math.PI * 2); c.fill();
            c.strokeStyle = '#e5e7eb'; c.lineWidth = 6;
            for (let i = 0; i < 3; i++) {                                                 // dönen kollar
                const a = time * 4 + i * Math.PI * 2 / 3;
                c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx + Math.cos(a) * (R - 10), ry + Math.sin(a) * (R - 10)); c.stroke();
            }
        });
        c.strokeStyle = '#7c2d12'; c.lineWidth = 3;                                       // bant
        c.beginPath(); c.moveTo(cx - 62, top + 118); c.lineTo(cx - 20, top + 140); c.lineTo(cx + 20, top + 140); c.lineTo(cx + 62, top + 118); c.stroke();
        blockRect(c, cx - 26, top + 132, 52, 16, '#d1d5db');                             // kafa
        [cx - 96, cx - 70, cx + 70, cx + 96].forEach((bx, i) => { c.fillStyle = i === 2 ? '#dc2626' : '#e5e7eb'; c.fillRect(bx - 9, top + 160, 18, 18); });
        c.fillStyle = Math.floor(time * 3) % 2 ? '#ef4444' : '#7f1d1d'; c.fillRect(cx - 6, top + 162, 12, 12);   // KAYIT lambası
        const lab = storyT('gang');                                                        // etiket
        c.font = 'bold 20px monospace'; const lw = c.measureText(lab).width + 24;
        blockRect(c, cx - lw / 2, top - 34, lw, 30, '#fde047');
        c.fillStyle = '#111827'; c.textAlign = 'center'; c.fillText(lab, cx, top - 12);
        for (let i = 0; i < 3; i++) {                                                     // ses dalgaları
            const r = 30 + ((time * 60 + i * 30) % 90), a = 1 - r / 120;
            c.strokeStyle = `rgba(253,224,71,${a})`; c.lineWidth = 4;
            [-1, 1].forEach(s => { c.beginPath(); c.arc(cx + s * 140, top + 90, r, s > 0 ? -0.6 : Math.PI - 0.6, s > 0 ? 0.6 : Math.PI + 0.6); c.stroke(); });
        }
    }
});
Object.assign(STORY_CAST, {
    bilal:   { pix: 'bilal', suit: '#334155', arm: '#334155', leg: '#1e293b', shoe: '#000', tie: '#0ea5e9', hand: '#eac39f' },
    saygili: { pix: 'saygili', suit: '#1e40af', arm: '#1e40af', leg: '#1e3a8a', shoe: '#000', tie: '#111827', hand: '#e8b48f', badge: true, scale: 1.25 }
});
STORIES[2] = [
    { bg: 'jail', props: ['reel'], say: { key: 's2t' },
      actors: [{ who: 'g1', x: 90, dir: 1 }, { who: 'g2', x: 190, dir: 1 }, { who: 'g3', x: 770, dir: -1 }, { who: 'g4', x: 870, dir: -1 }] },
    { bg: 'jail', props: ['shoeboxes'], say: { key: 's2a' },
      actors: [{ who: 'police', x: 60, to: 260, dir: 1 }, { who: 'police', x: -120, to: 120, dir: 1 }] },
    { bg: 'jail', props: ['shoeboxes'], say: { who: 'saygili', key: 's2b' },
      actors: [{ who: 'police', x: 260, dir: 1 }, { who: 'police', x: 120, dir: 1 }, { who: 'saygili', x: 1060, to: 760, dir: -1, talk: true, scale: 1.25 }] },
    { bg: 'palace', say: { who: 'bilal', key: 's2c' }, actors: [{ who: 'bilal', x: 620, dir: -1, talk: true, wave: true }] },
    { bg: 'palace', props: ['rain'], say: { who: 'recep', key: 's2d' },
      actors: [{ who: 'recep', x: -100, to: 360, dir: 1, talk: true }, { who: 'bilal', x: 640, dir: -1 }] },
    { bg: 'card', card: { title: 'm2t', text: 'm2' } }
];
const SAYGILI_STORY = {
    tr: { bilal: 'BILAL', s2t: "17 Aralık 2013. Makara dönüyor, kayıt çalıyor: 4'lü çetenin telefon konuşmaları dinleniyor!", saygili: 'SAYGILI',
          s2a: '17 Aralık 2013. 17/25 polisleri sabah baskınlarına çıktı: bakan oğulları gözaltında, ayakkabı kutuları dolar dolu!',
          s2b: 'Talimat savcıdan! 25 Aralık\'ta sıra Bilal\'de!',
          s2c: 'Babacığım, polisler kapıda! Ne yapayım?',
          s2d: 'Oğlum, kimseye bir şey söyleme! Ayakkabı kutularını topla, geliyorum!',
          m2t: 'GÖREV 2: 4\'LÜ ÇETEYİ KURTAR', m2: '17/25 polislerini rüşvetle sustur, ayakkabı kutularını topla, kapıdan geç ve SAYGILI\'yı yen! Yakına gelince copla vurur, uzaktan kelepçe atar: kalkanı kaldır!' },
    en: { bilal: 'BILAL', s2t: "December 17, 2013. The reels are spinning, the tape is playing: the Gang of Four's phone calls were wiretapped!", saygili: 'SAYGILI',
          s2a: 'December 17, 2013. The 17/25 police launched dawn raids: ministers\' sons detained, shoe boxes stuffed with dollars!',
          s2b: 'Orders from the prosecutor! On December 25 it\'s Bilal\'s turn!',
          s2c: 'Daddy, the police are at the door! What do I do?',
          s2d: 'Son, don\'t tell anyone anything! Collect the shoe boxes, I\'m coming!',
          m2t: 'MISSION 2: SAVE THE GANG OF FOUR', m2: 'Bribe the 17/25 police, collect the shoe boxes, pass the gate and beat SAYGILI! Up close he swings his baton, from afar he throws handcuffs: raise your shield!' },
    fr: { bilal: 'BILAL', s2t: "17 décembre 2013. Les bobines tournent, la bande défile : les appels de la bande des quatre étaient sur écoute !", saygili: 'SAYGILI',
          s2a: '17 décembre 2013. La police 17/25 lance ses descentes à l\'aube : fils de ministres arrêtés, boîtes à chaussures pleines de dollars !',
          s2b: 'Ordre du procureur ! Le 25 décembre, c\'est le tour de Bilal !',
          s2c: 'Papa, la police est à la porte ! Qu\'est-ce que je fais ?',
          s2d: 'Mon fils, ne dis rien à personne ! Ramasse les boîtes à chaussures, j\'arrive !',
          m2t: 'MISSION 2 : SAUVE LA BANDE DES QUATRE', m2: 'Achète la police 17/25, ramasse les boîtes à chaussures, passe la porte et bats SAYGILI ! De près il frappe à la matraque, de loin il lance des menottes : lève ton bouclier !' },
    nl: { bilal: 'BILAL', s2t: "17 december 2013. De spoelen draaien, de band speelt: de telefoontjes van de bende van vier werden afgeluisterd!", saygili: 'SAYGILI',
          s2a: '17 december 2013. De 17/25-politie doet invallen bij dageraad: ministerszonen opgepakt, schoenendozen vol dollars!',
          s2b: 'Bevel van de officier! Op 25 december is Bilal aan de beurt!',
          s2c: 'Papa, de politie staat voor de deur! Wat moet ik doen?',
          s2d: 'Jongen, zeg niemand iets! Pak de schoenendozen, ik kom eraan!',
          m2t: 'MISSIE 2: RED DE BENDE VAN VIER', m2: 'Koop de 17/25-politie om, verzamel de schoenendozen, ga door de poort en versla SAYGILI! Dichtbij slaat hij met zijn knuppel, van ver gooit hij handboeien: schild omhoog!' },
    de: { bilal: 'BILAL', s2t: "17. Dezember 2013. Die Spulen drehen sich, das Band läuft: Die Telefonate der Viererbande wurden abgehört!", saygili: 'SAYGILI',
          s2a: '17. Dezember 2013. Die 17/25-Polizei startet Razzien im Morgengrauen: Ministersöhne festgenommen, Schuhkartons voller Dollar!',
          s2b: 'Anordnung vom Staatsanwalt! Am 25. Dezember ist Bilal dran!',
          s2c: 'Papa, die Polizei steht vor der Tür! Was soll ich tun?',
          s2d: 'Sohn, sag niemandem etwas! Sammle die Schuhkartons ein, ich komme!',
          m2t: 'MISSION 2: RETTE DIE VIERERBANDE', m2: 'Besteche die 17/25-Polizei, sammle die Schuhkartons, geh durchs Tor und besiege SAYGILI! Aus der Nähe schlägt er mit dem Knüppel, aus der Ferne wirft er Handschellen: Schild hoch!' },
    ru: { bilal: 'БИЛАЛ', s2t: "17 декабря 2013 года. Бобины крутятся, плёнка играет: телефоны банды четырёх прослушивались!", saygili: 'САЙГЫЛЫ',
          s2a: '17 декабря 2013 года. Полиция 17/25 провела утренние облавы: сыновья министров задержаны, обувные коробки набиты долларами!',
          s2b: 'Приказ прокурора! 25 декабря очередь Билала!',
          s2c: 'Папочка, полиция у дверей! Что мне делать?',
          s2d: 'Сынок, никому ничего не говори! Собери обувные коробки, я иду!',
          m2t: 'МИССИЯ 2: СПАСИ БАНДУ ЧЕТЫРЁХ', m2: 'Подкупи полицию 17/25, собери обувные коробки, пройди ворота и победи САЙГЫЛЫ! Вблизи он бьёт дубинкой, издалека бросает наручники: подними щит!' }
};
for (const L in SAYGILI_STORY) if (STORY_TEXT[L]) Object.assign(STORY_TEXT[L], SAYGILI_STORY[L]);

// --- HABERLER (arka plan TV'leri ve gazeteleri, js/newsbg.js) ---
Object.assign(NEWS_SCENES, {
    cuffs(x, y, w, h, t) {   // adliye önünde kelepçe
        ctx.fillStyle = "#334155"; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#94a3b8"; for (let i = 0; i < 5; i++) ctx.fillRect(x + w * (0.1 + i * 0.18), y + h * 0.15, w * 0.08, h * 0.6);
        ctx.fillStyle = "#cbd5e1"; ctx.fillRect(x + w * 0.05, y + h * 0.08, w * 0.9, h * 0.1);
        drawCuffs(ctx, { x: x + w / 2, y: y + h * 0.6, angle: Math.sin(t * 2) * 0.3 });
        flashes(x, y, w, h, t);
    }
});
NEWS[2] = [
    { type: 'tv', head: "17 ARALIK OPERASYONU: 3 BAKANIN OĞLU GÖZALTINDA", scene: 'raid' },
    { type: 'paper', date: "18 ARALIK 2013", head: "AYAKKABI KUTULARINDA 4,5 MİLYON DOLAR", scene: 'shoeboxes' },
    { type: 'tv', head: "BAKAN OĞLUNUN EVİNDE PARA SAYMA MAKİNELERİ", scene: 'counter' },
    { type: 'paper', date: "26 ARALIK 2013", head: "SAVCI AKKAŞ: 'POLİS TALİMATIMI UYGULAMADI'", scene: 'cuffs' },
    { type: 'tv', head: "25 ARALIK: İKİNCİ DALGA ENGELLENDİ", scene: 'raid' }
];
