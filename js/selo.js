// 9. bölüm: SELO'nun hapse atılması (Edirne F tipi cezaevi)
// Hikâye: 2015'te "Seni başkan yaptırmayacağız!" diyen Selo içeri atılır; AİHM "serbest bırakın" der, Recep "tanımıyoruz" der.
// Oyunda: 11 polis → kapı → canavar SELO. Bağlamasıyla nota savurur, gökten AİHM kararları yağdırır (kalkanı yukarı tut!),
// "SENİ BAŞKAN YAPTIRMAYACAĞIZ!" diye bağırınca yerden şok dalgası gelir. Yenilince üstüne hücre parmaklığı iner.
// Bütün çizimler kodla yapılır (fotoğraf yok).
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- METİNLER (oyun içi) ---
const SELO_TEXT = {
    tr: { seloName: "SELO", l8Note: "FETÖ'nün işi bitti! Sıra Edirne'de: Selo içeri!", l8Btn: "9. BÖLÜME GEÇ", aihmCry: "AİHM KARARI!", aihmFree: "AİHM: DERHAL SERBEST BIRAKIN!", noRecog: "TANIMIYORUZ!", jailed: "İÇERİ!" },
    en: { seloName: "SELO", l8Note: "FETÖ is done! Next stop Edirne: Selo goes to jail!", l8Btn: "GO TO LEVEL 9", aihmCry: "ECHR RULING!", aihmFree: "ECHR: RELEASE HIM NOW!", noRecog: "WE DON'T RECOGNISE IT!", jailed: "LOCKED UP!" },
    fr: { seloName: "SELO", l8Note: "FETÖ, c'est fini ! Prochaine étape Edirne : Selo en prison !", l8Btn: "NIVEAU 9", aihmCry: "ARRÊT DE LA CEDH !", aihmFree: "CEDH : LIBÉREZ-LE !", noRecog: "ON NE RECONNAÎT PAS !", jailed: "EN PRISON !" },
    nl: { seloName: "SELO", l8Note: "FETÖ is klaar! Volgende halte Edirne: Selo de cel in!", l8Btn: "NAAR LEVEL 9", aihmCry: "EHRM-UITSPRAAK!", aihmFree: "EHRM: LAAT HEM VRIJ!", noRecog: "WIJ ERKENNEN HET NIET!", jailed: "OPGESLOTEN!" },
    de: { seloName: "SELO", l8Note: "FETÖ ist erledigt! Nächster Halt Edirne: Selo kommt in den Knast!", l8Btn: "ZU LEVEL 9", aihmCry: "EGMR-URTEIL!", aihmFree: "EGMR: SOFORT FREILASSEN!", noRecog: "ERKENNEN WIR NICHT AN!", jailed: "EINGESPERRT!" },
    ru: { seloName: "СЕЛО", l8Note: "С ФЕТÖ покончено! Следующая остановка Эдирне: Село — в тюрьму!", l8Btn: "НА УРОВЕНЬ 9", aihmCry: "РЕШЕНИЕ ЕСПЧ!", aihmFree: "ЕСПЧ: НЕМЕДЛЕННО ОСВОБОДИТЬ!", noRecog: "НЕ ПРИЗНАЁМ!", jailed: "ЗА РЕШЁТКУ!" }
};
for (const L in SELO_TEXT) if (LANGS[L]) Object.assign(LANGS[L], SELO_TEXT[L]);

// --- ARKA PLAN: Edirne. Uzakta Selimiye'nin dört minaresi, önde dikenli telli cezaevi duvarı ve gözetleme kuleleri ---
THEMES.prison = { sky: ["#1e293b", "#475569", "#94a3b8", "#fcd34d"], sun: { x: 0.8, y: 0.62, r: 46, c: "#fdba74", glow: "rgba(251,146,60,0.35)" },
                  clouds: "rgba(203,213,225,0.5)", ground: ["#57534e", "#292524"], grass: "#78716c", grassDark: "#44403c", curb: true };

function drawSelimiye(x, base, s, col) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x, base - 70 * s, 62 * s, Math.PI, 0); ctx.fill();              // ana kubbe
    ctx.fillRect(x - 3 * s, base - 150 * s, 6 * s, 20 * s);                                  // alem
    ctx.fillRect(x - 110 * s, base - 70 * s, 220 * s, 70 * s);                               // gövde
    [-1, 1].forEach(k => {
        ctx.beginPath(); ctx.arc(x + k * 82 * s, base - 70 * s, 26 * s, Math.PI, 0); ctx.fill();   // yan kubbeler
        [96, 128].forEach(dx => {                                                            // dört minare
            const mx = x + k * dx * s;
            ctx.fillRect(mx - 5 * s, base - 250 * s, 10 * s, 250 * s);
            ctx.beginPath(); ctx.moveTo(mx - 6 * s, base - 250 * s); ctx.lineTo(mx, base - 290 * s); ctx.lineTo(mx + 6 * s, base - 250 * s); ctx.fill();
            [150, 200].forEach(h => ctx.fillRect(mx - 9 * s, base - h * s, 18 * s, 4 * s));   // şerefeler
        });
    });
}
function drawPrisonBg(time) {
    // Uzak şehir ve Selimiye
    skyline(0.05, height * 0.7, 30, 90, "#475569", null, 2);
    const off = (camX * 0.05) % 2400;
    for (let k = -1; k < 2; k++) drawSelimiye(k * 2400 - off + width * 0.35, height * 0.7, 0.9, "#334155");
    // Cezaevi duvarı: beton, üstünde dikenli tel; aralarda gözetleme kuleleri
    const wb = height * 0.9, wh = 150, p = 0.35, woff = camX * p;
    ctx.fillStyle = "#a8a29e"; ctx.fillRect(0, wb - wh, width, wh);
    ctx.fillStyle = "#78716c";
    for (let x = -((woff) % 120); x < width; x += 120) ctx.fillRect(x, wb - wh, 4, wh);   // beton panel derzleri
    ctx.fillStyle = "#57534e"; ctx.fillRect(0, wb - wh - 8, width, 10);
    ctx.strokeStyle = "#1c1917"; ctx.lineWidth = 2;                                       // dikenli tel bobinleri
    for (let x = -((woff) % 34) - 34; x < width + 34; x += 34) { ctx.beginPath(); ctx.arc(x, wb - wh - 20, 14, 0, Math.PI * 2); ctx.stroke(); }
    layerProps(p, 900, 0.9, 5, (sx, i) => {
        const tb = wb - wh;
        ctx.fillStyle = "#57534e"; ctx.fillRect(sx - 14, tb - 120, 28, 120);
        ctx.fillStyle = "#44403c"; ctx.fillRect(sx - 40, tb - 170, 80, 50);
        ctx.fillStyle = "#292524"; ctx.beginPath(); ctx.moveTo(sx - 48, tb - 170); ctx.lineTo(sx, tb - 200); ctx.lineTo(sx + 48, tb - 170); ctx.fill();
        ctx.fillStyle = "#fde68a"; ctx.fillRect(sx - 30, tb - 160, 60, 18);
        // projektör ışığı
        const a = Math.sin(time * 0.7 + i * 2) * 0.6, L = 420;
        const g = ctx.createLinearGradient(sx, tb - 150, sx + Math.sin(a) * L, tb - 150 + Math.cos(a) * L);
        g.addColorStop(0, "rgba(254,240,138,0.35)"); g.addColorStop(1, "rgba(254,240,138,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx, tb - 150);
        ctx.lineTo(sx + Math.sin(a - 0.15) * L, tb - 150 + Math.cos(a - 0.15) * L); ctx.lineTo(sx + Math.sin(a + 0.15) * L, tb - 150 + Math.cos(a + 0.15) * L); ctx.fill();
        if (i % 2 === 0) {   // tabela
            ctx.fillStyle = "#1e3a8a"; ctx.fillRect(sx + 120, tb + 30, 240, 46);
            ctx.fillStyle = "#fff"; ctx.font = "bold 20px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("EDİRNE F TİPİ", sx + 240, tb + 53);
        }
    });
}

// --- CANAVAR: SELO ---
BOSS_TYPES.selo = { greet: 'selo_baskan', chantDelay: 2.2, say: "SENİ BAŞKAN YAPTIRMAYACAĞIZ!", w: 120, h: 205, scale: 1, hp: 24, arena: 900, nameKey: "seloName", stomp: 55, labelY: 40,
                    update: updateSelo, draw: drawSelo };

function updateSelo(b) {
    b.y = bossGround(b);
    const dist = (player.x + player.w / 2) - (b.x + b.w / 2);
    b.look = Math.sign(dist) || b.look;
    if (b.recover > 0) b.recover--;
    if (b.state === 'walk') {
        if (Math.abs(dist) > 260 && b.recover <= 0) { b.x += Math.sign(dist) * 1.6; b.run += 0.1; }
        if (!player.isDying && Math.abs(dist) < 1400 && ++b.timer > 80) {
            b.timer = 0; b.attacks++;
            b.next = ['saz', 'aihm', 'speech'][b.attacks % 3];
            b.state = 'crouch'; b.stateT = 30;
            if (b.next === 'speech') {   // bağırır; şok dalgası cümlenin sonunda ("...YAPTIRMAYACAĞIZ!") gelir
                const d = playSfx('selo_baskan', { vol: 1, rate: b.rage ? 1.12 : 1 });
                b.stateT = Math.max(40, Math.round((d || 0.7) * 60));
            }
            const [txt, col] = b.next === 'saz' ? ["♪ ♫ ♪", "#e879f9"] : b.next === 'aihm' ? [t("aihmCry"), "#60a5fa"] : ["SENİ BAŞKAN...", "#fde047"];
            createParticle(b.x + b.w / 2, b.y - 60, txt, col, 1.1);
        }
    } else if (b.state === 'crouch' && --b.stateT <= 0) {
        if (b.next === 'saz') noteVolley(b);
        else if (b.next === 'aihm') aihmRain();
        else {
            // "...YAPTIRMAYACAĞIZ!": iki yana çift şok dalgası
            createParticle(b.x + b.w / 2, b.y - 90, "YAPTIRMAYACAĞIZ!", "#fde047", 1.4);
            const cx = b.x + b.w / 2;
            [-1, 1].forEach(d => {
                projectiles.push({ type: 'wave', x: cx + d * 30, y: height - 60, vx: d * 8, active: true, life: 85, angle: 0 });
                projectiles.push({ type: 'wave', x: cx - d * 60, y: height - 60, vx: d * 8, active: true, life: 95, angle: 0 });
            });
            camShake = Math.max(camShake, 8);
            playSfx('hit', { rate: 0.5, vol: 0.8 });
            b.recover = 18;
        }
        b.state = 'walk';
    }
    b.x = Math.max(b.homeX - b.T.arena, Math.min(b.x, b.homeX + b.T.arena, WORLD_WIDTH - b.w));
    b.crouch += ((b.state === 'crouch' ? 1 : 0) - b.crouch) * 0.25;
}
// Bağlamadan notalar: yükselip süzülerek düşer (1 dolar gibi)
function noteVolley(b) {
    const mx = b.x + b.w / 2, my = b.y + 60, side = Math.sign(player.x + player.w / 2 - mx) || 1;
    for (let i = 0; i < 5; i++) projectiles.push({ type: 'dollar1', skin: 'note', x: mx, y: my, vx: side * (2.5 + i * 1.8), vy: -11 - Math.random() * 3,
                                                   active: true, life: 420, angle: 0, phase: Math.random() * 6, landed: false });
    for (let i = 0; i < 3; i++) playSfx('hit', { rate: 1.6 + i * 0.3, vol: 0.25, delay: i * 0.08 });
}
// Gökten AİHM kararları yağar: oyuncunun çevresine yayılır, kalkanla tepeden durdurulur
function aihmRain() {
    const cx = player.x + player.w / 2;
    for (let i = 0; i < 6; i++) projectiles.push({ type: 'dollar1', skin: 'aihm', x: cx - 330 + i * 132 + (Math.random() - 0.5) * 40, y: -40 - i % 3 * 70,
                                                   vx: 0, vy: 0, active: true, life: 520, angle: 0, phase: Math.random() * 6, landed: false });
}
function drawNote(ctx, x, y, angle) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.shadowColor = "#e879f9"; ctx.shadowBlur = 12;
    ctx.fillStyle = "#a21caf"; ctx.strokeStyle = "#a21caf"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(-8, 10, 9, 7, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(14, 6, 9, 7, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(0, -18); ctx.lineTo(22, -22); ctx.lineTo(22, 5); ctx.stroke();
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(22, -19); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();
}
function drawAihmPaper(ctx, x, y, angle) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle * 0.6);
    ctx.shadowColor = "#60a5fa"; ctx.shadowBlur = 12;
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(-20, -26, 40, 52); ctx.shadowBlur = 0;
    ctx.fillStyle = "#1d4ed8"; ctx.fillRect(-20, -26, 40, 14);
    ctx.fillStyle = "#fde047";
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.fillRect(Math.cos(a) * 5 - 1, -19 + Math.sin(a) * 5 - 1, 2, 2); }
    ctx.fillStyle = "#1e3a8a"; ctx.font = "bold 9px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("AİHM", 0, -4);
    ctx.fillStyle = "#94a3b8"; [4, 10, 16].forEach(ly => ctx.fillRect(-14, ly, ly === 16 ? 18 : 28, 2));
    ctx.restore();
}
const DOLLAR_SKINS = { lock: drawLockIcon, note: drawNote, aihm: drawAihmPaper };

// Selo'nun çizimi (orijin: ayakların ortası, sağa bakar). o: { walk, strum, talk, wave, angry }
function drawSeloFigure(ctx, o) {
    const SKIN = "#e0ac69", HAIR = "#1c1917", JACKET = "#1e293b", PANTS = "#111827";
    const walk = Math.sin(o.walk || 0);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const hipY = -88, shY = -150;
    // bacaklar
    [-1, 1].forEach(k => {
        const fx = k * 14 + walk * k * 14;
        ctx.strokeStyle = k < 0 ? "#0b1120" : PANTS; ctx.lineWidth = 20;
        ctx.beginPath(); ctx.moveTo(k * 12, hipY); ctx.lineTo(k * 10 + walk * k * 6, hipY / 2); ctx.lineTo(fx, -10); ctx.stroke();
        ctx.fillStyle = "#3f2a1d"; ctx.beginPath(); ctx.ellipse(fx + 8, -6, 18, 8, 0, 0, Math.PI * 2); ctx.fill();
    });
    // arka kol: bağlamanın sapını tutar (ya da el sallar)
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(-14, shY + 10);
    if (o.wave) { const w = Math.sin(performance.now() / 120) * 10; ctx.lineTo(-34, shY - 20); ctx.lineTo(-30 + w, shY - 56); }
    else { ctx.lineTo(10, shY + 8); ctx.lineTo(38, shY - 14); }
    ctx.stroke();
    // gövde: ceket, açık yakalı beyaz gömlek (kravatsız)
    ctx.fillStyle = JACKET;
    ctx.beginPath(); ctx.moveTo(-32, shY); ctx.quadraticCurveTo(0, shY - 10, 32, shY); ctx.lineTo(28, hipY + 6); ctx.lineTo(-28, hipY + 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.moveTo(-10, shY - 4); ctx.lineTo(10, shY - 4); ctx.lineTo(0, shY + 22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#334155";
    ctx.beginPath(); ctx.moveTo(-10, shY - 4); ctx.lineTo(-2, shY + 40); ctx.lineTo(-20, shY + 10); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10, shY - 4); ctx.lineTo(2, shY + 40); ctx.lineTo(20, shY + 10); ctx.closePath(); ctx.fill();
    // kafa
    ctx.fillStyle = SKIN; ctx.fillRect(-8, shY - 16, 16, 16);
    ctx.save(); ctx.translate(2, shY - 42);
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(0, 0, 25, 30, 0, 0, Math.PI * 2); ctx.fill();
    [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(s * 25, 2, 5, 9, 0, 0, Math.PI * 2); ctx.fill(); });
    // dalgalı siyah saç
    ctx.fillStyle = HAIR;
    ctx.beginPath(); ctx.ellipse(0, -18, 27, 16, 0, Math.PI, 0); ctx.fill();
    [-20, -10, 0, 10, 20].forEach((x, i) => { ctx.beginPath(); ctx.arc(x, -24 + (i % 2) * 3, 8, 0, Math.PI * 2); ctx.fill(); });
    [-1, 1].forEach(s => ctx.fillRect(s > 0 ? 20 : -26, -16, 6, 14));   // favoriler
    // kalın kaşlar, gözler, burun
    [-1, 1].forEach(s => {
        ctx.save(); ctx.translate(s * 10, -8); ctx.rotate(s * (o.angry ? 0.3 : -0.08));
        ctx.fillStyle = HAIR; ctx.fillRect(-7, -2, 14, 4); ctx.restore();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(s * 10, 0, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1c1917"; ctx.beginPath(); ctx.arc(s * 10 + 1.5, 0.5, 2.3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = "#a16207"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(1, 2); ctx.lineTo(4, 12); ctx.lineTo(0, 13); ctx.stroke();
    // hafif sakal gölgesi
    ctx.fillStyle = "rgba(41,37,36,0.25)"; ctx.beginPath(); ctx.ellipse(0, 18, 20, 11, 0, 0, Math.PI); ctx.fill();
    // meşhur geniş gülüş (konuşurken açılır)
    const m = o.talk || 0;
    ctx.fillStyle = "#7f1d1d"; ctx.beginPath(); ctx.ellipse(0, 18, 12, 4 + m * 6, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillRect(-9, 18, 18, 3);
    ctx.restore();
    // bağlama: gövdenin önünde çapraz
    ctx.save(); ctx.translate(4, shY + 46); ctx.rotate(-0.75);
    ctx.fillStyle = "#6b3f1d"; ctx.fillRect(18, -4, 78, 8);                               // sap
    ctx.fillStyle = "#3f2a1d"; ctx.fillRect(92, -7, 16, 14);                              // burgu kutusu
    ctx.fillStyle = "#fde68a"; [96, 102].forEach(x => { ctx.fillRect(x, -11, 3, 4); ctx.fillRect(x, 7, 3, 4); });
    const body = ctx.createRadialGradient(-6, -4, 2, 0, 0, 30);
    body.addColorStop(0, "#d97706"); body.addColorStop(1, "#7c2d12");
    ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, 0, 30, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1c1917"; ctx.beginPath(); ctx.arc(8, 0, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(254,243,199,0.8)"; ctx.lineWidth = 1;
    [-2, 0, 2].forEach(dy => { ctx.beginPath(); ctx.moveTo(-20, dy); ctx.lineTo(104, dy); ctx.stroke(); });
    ctx.restore();
    // ön kol: tellere vurur
    const st = o.strum ? Math.sin(performance.now() / 40) * 8 : 0;
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(14, shY + 10); ctx.lineTo(22, shY + 40); ctx.lineTo(-2 + st, shY + 56); ctx.stroke();
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(-2 + st, shY + 56, 7, 0, Math.PI * 2); ctx.fill();
}

let seloCell = null;   // yenilince üstüne inen hücre: bölüm bitene kadar yerinde kalır
function drawSelo(ctx, b) {
    if (b.dying) return;   // yerine hücredeki Selo çizilir (drawSeloCell)
    const talk = b.talk > 0 ? Math.abs(Math.sin(b.anim * 0.45)) : 0;
    ctx.save();
    bossBaseTransform(ctx, b);
    ctx.scale(b.look, 1);
    if (b.state === 'crouch') ctx.translate(0, Math.sin(b.anim * 0.8) * 2);
    drawSeloFigure(ctx, { walk: b.run, strum: b.next === 'saz' && b.state === 'crouch' || talk > 0, talk: Math.max(talk, b.next === 'speech' && b.state === 'crouch' ? 1 : 0),
                          wave: b.next === 'aihm' && b.state === 'crouch', angry: b.rage });
    ctx.restore();
}
// Hücre: parmaklık yukarıdan iner, Selo içeride gülümseyip bağlama çalar; AİHM "bırakın" der, Recep "tanımıyoruz" der
const CELL_W = 190, CELL_H = 260;
// Sahnenin zamanlaması oyun döngüsünde (saniyede 60 kare) ilerler
function updateSeloCell() {
    if (!seloCell && boss && boss.dying && boss.kind === 'selo') seloCell = { x: boss.x + boss.w / 2, look: boss.look, t: 0 };
    const c = seloCell;
    if (!c) return;
    c.t++;
    const gy = height - 60;
    if (c.t === 24) { camShake = Math.max(camShake, 12); playSfx('hit', { rate: 0.4, vol: 1 }); createParticle(c.x, gy - CELL_H - 20, t("jailed"), "#f87171", 1.6); }
    if (c.t === 34) c.talkEnd = 34 + Math.round((playSfx('selo_baskan', { vol: 1 }) || 1.3) * 60);   // parmaklık ardından bile bağırır
    if (c.t === 70) createParticle(c.x, gy - CELL_H - 40, t("aihmFree"), "#60a5fa", 2.2);
    if (c.t === 160) createParticle(player.x + player.w / 2, player.y - 40, t("noRecog"), "#ef4444", 2.2);
    if (c.t > 30 && c.t % 40 === 0) createParticle(c.x + 30, gy - 160, "♪", "#e879f9", 1.4);   // içeride bile çalıyor
}
function drawSeloCell(ctx) {
    const c = seloCell;
    if (!c) return;
    const gy = height - 60, drop = Math.min(1, c.t / 24), W = CELL_W, H = CELL_H;
    ctx.save(); ctx.translate(c.x, gy); ctx.scale(c.look || 1, 1);
    drawSeloFigure(ctx, { walk: 0, strum: c.t > 24, talk: c.t > 34 && c.t < (c.talkEnd || 110) ? Math.abs(Math.sin(c.t * 0.4)) : 0, wave: false });
    ctx.restore();
    const y0 = gy - H - (1 - drop) * (1 - drop) * 600;
    ctx.fillStyle = "#4b5563"; ctx.fillRect(c.x - W / 2 - 6, y0 - 14, W + 12, 18);
    ctx.fillStyle = "#6b7280";
    for (let x = -W / 2; x <= W / 2; x += 24) ctx.fillRect(c.x + x - 4, y0, 8, H);
    ctx.fillRect(c.x - W / 2, y0 + H * 0.45, W, 8);
    ctx.fillStyle = "#1e3a8a"; ctx.fillRect(c.x - 62, y0 - 44, 124, 28);
    ctx.fillStyle = "#fff"; ctx.font = "bold 16px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("TUTUKLU", c.x, y0 - 30);
}

// --- HİKÂYE ---
Object.assign(PIX_FACES, {
    selo: { pal: { h: '#1c1917', s: '#e0ac69', e: '#111827', k: '#44403c', b: '#a47148', w: '#fff', m: '#7f1d1d' },
            rows: ['.hhhhhh.', 'hhhhhhhh', 'hssssssh', 'skksskks', 'sesssess', 'ssssssss', 'bmwwwwmb', '.bsmmsb.'] }
});
Object.assign(STORY_CAST, {
    selo: { pix: 'selo', suit: '#1e293b', arm: '#1e293b', leg: '#111827', shoe: '#3f2a1d', hand: '#e0ac69', tie: '#f8fafc', saz: true }
});
Object.assign(STORY_BG, {
    // 2015 seçim gecesi mitingi: kalabalık, bayraklar, "%13" pankartı
    rally(c, time) {
        storySky(c, ['#0b1026', '#1e1b4b', '#4c1d95', '#7c3aed']);
        blockStars(c, time);
        for (let i = 0; i < 6; i++) {   // ışık huzmeleri
            c.fillStyle = `rgba(253,224,71,${0.06 + 0.04 * Math.sin(time * 2 + i)})`;
            const x = 80 + i * 160; c.beginPath(); c.moveTo(x, STORY_GROUND); c.lineTo(x - 60 + Math.sin(time + i) * 40, 0); c.lineTo(x + 60 + Math.sin(time + i) * 40, 0); c.fill();
        }
        blockRect(c, 300, 60, 360, 90, '#fbbf24');
        c.fillStyle = '#4c1d95'; c.font = 'bold 64px monospace'; c.textAlign = 'center'; c.fillText('%13', 480, 130);
        for (let i = 0; i < 24; i++) {   // zıplayan kalabalık
            const x = i * 40 + (i % 2) * 10, j = Math.abs(Math.sin(time * 5 + i)) * 10;
            c.fillStyle = ['#1f2937', '#312e81', '#374151'][i % 3]; c.fillRect(x, STORY_GROUND - 70 - j, 32, 70 + j);
            c.fillStyle = '#e0ac69'; c.fillRect(x + 6, STORY_GROUND - 92 - j, 20, 20);
            if (i % 4 === 1) { c.fillStyle = ['#16a34a', '#facc15', '#dc2626'][i % 3]; c.fillRect(x + 14, STORY_GROUND - 140 - j, 26, 18); c.fillStyle = '#9ca3af'; c.fillRect(x + 12, STORY_GROUND - 140 - j, 3, 50); }
        }
        storyGround(c, '#374151', '#1f2937');
    },
    // Edirne F tipi cezaevi
    prison(c, time) {
        storySky(c, ['#1e293b', '#334155', '#64748b', '#94a3b8']);
        c.fillStyle = '#a8a29e'; c.fillRect(0, 150, STORY_W, STORY_GROUND - 150);
        for (let x = 0; x < STORY_W; x += 64) { c.fillStyle = '#78716c'; c.fillRect(x, 150, 4, STORY_GROUND - 150); }
        c.strokeStyle = '#1c1917'; c.lineWidth = 3;
        for (let x = 0; x < STORY_W; x += 32) { c.beginPath(); c.arc(x, 134, 12, 0, Math.PI * 2); c.stroke(); }
        blockRect(c, 40, 40, 70, 110, '#57534e'); blockRect(c, 24, 20, 102, 30, '#44403c');
        c.fillStyle = Math.floor(time * 2) % 2 ? '#fde68a' : '#fbbf24'; c.fillRect(44, 30, 62, 12);
        blockRect(c, 150, 180, 240, 44, '#1e3a8a');
        c.fillStyle = '#fff'; c.font = 'bold 22px monospace'; c.textAlign = 'center'; c.fillText('EDİRNE F TİPİ', 270, 210);
        storyGround(c, '#57534e', '#44403c');
    }
});
Object.assign(STORY_PROPS, {
    aihm(c, time) {   // gökten AİHM kararları süzülür
        for (let i = 0; i < 8; i++) {
            const x = 60 + storyHash(i + 11) * 840 + Math.sin(time * 2 + i) * 20, y = ((time * 70 + storyHash(i + 5) * 500) % 520) - 40;
            c.fillStyle = '#f8fafc'; c.fillRect(x, y, 36, 46); c.fillStyle = '#1d4ed8'; c.fillRect(x, y, 36, 12);
            c.fillStyle = '#1e3a8a'; c.font = 'bold 10px monospace'; c.textAlign = 'center'; c.fillText('AİHM', x + 18, y + 26);
        }
    }
});
STORIES[9] = [
    { bg: 'rally', say: { key: 's9a' }, actors: [{ who: 'selo', x: 480, dir: 1, wave: true }] },
    { bg: 'rally', say: { who: 'selo', key: 's9b' }, actors: [{ who: 'selo', x: 480, dir: 1, talk: true, jump: true }] },
    { bg: 'palace', say: { who: 'recep', key: 's9c' }, actors: [{ who: 'recep', x: 420, dir: 1, talk: true, jump: true }] },
    { bg: 'prison', props: ['bars'], say: { who: 'selo', key: 's9d' }, actors: [{ who: 'selo', x: 690, dir: -1, talk: true, wave: true }] },
    { bg: 'prison', props: ['aihm', 'bars'], say: { who: 'recep', key: 's9e' },
      actors: [{ who: 'recep', x: -100, to: 260, dir: 1, talk: true }, { who: 'selo', x: 690, dir: -1 }] },
    { bg: 'card', card: { title: 'm9t', text: 'm9' } }
];
// Oyun sonu artık 9. bölümden sonra: ilk sahnede Selo hücresinden el sallar
STORIES.end[0] = { bg: 'prison', props: ['bars'], say: { key: 'e1' }, actors: [{ who: 'recep', x: 260, dir: 1, wave: true }, { who: 'selo', x: 690, dir: -1, wave: true }] };

const SELO_STORY = {
    tr: { selo: 'SELO',
          s9a: '7 Haziran 2015. Selo\'nun partisi %13 aldı, meclise girdi. Meydanlar bayram yeri...',
          s9b: 'SENİ BAŞKAN YAPTIRMAYACAĞIZ!',
          s9c: 'Ne dedi o?! Dokunulmazlıkları kaldırın! Hemen içeri!',
          s9d: 'Burada da kitap yazarım, resim yaparım. AİHM "derhal serbest bırakın" dedi bile!',
          s9e: 'AİHM kararı bizi bağlamaz! Tanımıyoruz!',
          m9t: 'GÖREV 9: SELO\'YU İÇERİ AT', m9: 'Edirne\'de polisleri geç, kapıdan gir, SELO\'yu yen ve hücreye tık! Gökten AİHM kararları yağıyor: kalkanı kaldır!',
          e1: 'FETÖ yenildi, Selo içeride... ama iade dosyası da AİHM kararı da hâlâ yolda.' },
    en: { selo: 'SELO',
          s9a: 'June 7, 2015. Selo\'s party won 13% and entered parliament. The squares are partying...',
          s9b: 'WE WILL NOT MAKE YOU PRESIDENT!',
          s9c: 'What did he say?! Strip their immunity! Lock him up, now!',
          s9d: 'I\'ll write books and paint in here too. The ECHR already said "release him immediately"!',
          s9e: 'ECHR rulings don\'t bind us! We don\'t recognise them!',
          m9t: 'MISSION 9: LOCK UP SELO', m9: 'Get past the police in Edirne, go through the gate, beat SELO and lock him in a cell! ECHR rulings rain from the sky: raise your shield!',
          e1: 'FETÖ is beaten, Selo is behind bars... but the extradition file and the ECHR ruling are still on their way.' },
    fr: { selo: 'SELO',
          s9a: '7 juin 2015. Le parti de Selo obtient 13 % et entre au parlement. Les places sont en fête...',
          s9b: 'NOUS NE TE LAISSERONS PAS DEVENIR PRÉSIDENT !',
          s9c: 'Qu\'est-ce qu\'il a dit ?! Levez leur immunité ! En prison, tout de suite !',
          s9d: 'Ici aussi j\'écris des livres et je peins. La CEDH a déjà dit « libérez-le immédiatement » !',
          s9e: 'Les arrêts de la CEDH ne nous engagent pas ! On ne les reconnaît pas !',
          m9t: 'MISSION 9 : ENFERME SELO', m9: 'Passe la police à Edirne, franchis la porte, bats SELO et mets-le en cellule ! Les arrêts de la CEDH tombent du ciel : lève ton bouclier !',
          e1: 'FETÖ est battu, Selo est en prison... mais l\'extradition et l\'arrêt de la CEDH sont toujours en route.' },
    nl: { selo: 'SELO',
          s9a: '7 juni 2015. Selo\'s partij haalt 13% en komt in het parlement. Feest op de pleinen...',
          s9b: 'WIJ ZULLEN JOU GEEN PRESIDENT LATEN WORDEN!',
          s9c: 'Wat zei hij?! Hef hun immuniteit op! Sluit hem op, nu!',
          s9d: 'Ook hier schrijf ik boeken en schilder ik. Het EHRM zei al "laat hem meteen vrij"!',
          s9e: 'Uitspraken van het EHRM binden ons niet! Wij erkennen ze niet!',
          m9t: 'MISSIE 9: SLUIT SELO OP', m9: 'Kom langs de politie in Edirne, ga door de poort, versla SELO en sluit hem op! EHRM-uitspraken regenen uit de lucht: schild omhoog!',
          e1: 'FETÖ is verslagen, Selo zit vast... maar het uitleveringsdossier en de EHRM-uitspraak zijn nog onderweg.' },
    de: { selo: 'SELO',
          s9a: '7. Juni 2015. Selos Partei holt 13 % und zieht ins Parlament ein. Auf den Plätzen wird gefeiert...',
          s9b: 'WIR WERDEN DICH NICHT ZUM PRÄSIDENTEN MACHEN!',
          s9c: 'Was hat er gesagt?! Hebt ihre Immunität auf! Sperrt ihn ein, sofort!',
          s9d: 'Auch hier schreibe ich Bücher und male. Der EGMR hat schon gesagt: "Sofort freilassen!"',
          s9e: 'EGMR-Urteile binden uns nicht! Wir erkennen sie nicht an!',
          m9t: 'MISSION 9: SPERR SELO EIN', m9: 'Komm an der Polizei in Edirne vorbei, geh durchs Tor, besiege SELO und sperr ihn in die Zelle! EGMR-Urteile regnen vom Himmel: Schild hoch!',
          e1: 'FETÖ ist besiegt, Selo sitzt... aber die Auslieferungsakte und das EGMR-Urteil sind noch unterwegs.' },
    ru: { selo: 'СЕЛО',
          s9a: '7 июня 2015 года. Партия Село набрала 13% и прошла в парламент. На площадях праздник...',
          s9b: 'МЫ НЕ ДАДИМ ТЕБЕ СТАТЬ ПРЕЗИДЕНТОМ!',
          s9c: 'Что он сказал?! Лишить их неприкосновенности! Посадить, немедленно!',
          s9d: 'Я и здесь пишу книги и рисую. ЕСПЧ уже сказал: «Немедленно освободить»!',
          s9e: 'Решения ЕСПЧ для нас не обязательны! Мы их не признаём!',
          m9t: 'МИССИЯ 9: ПОСАДИ СЕЛО', m9: 'Пройди полицию в Эдирне, войди в ворота, победи СЕЛО и запри его в камере! С неба сыплются решения ЕСПЧ: подними щит!',
          e1: 'ФЕТÖ побеждён, Село за решёткой... но запрос об экстрадиции и решение ЕСПЧ всё ещё в пути.' }
};
for (const L in SELO_STORY) if (STORY_TEXT[L]) Object.assign(STORY_TEXT[L], SELO_STORY[L]);
Object.assign(STORY_VOICES, { s9b: 'selo_baskan', s9d: 'selo_kitap' });   // Selo'nun replikleri seslendirildi (Türkçe)
