// 1. bölüm: GEZİ PARKI (Mayıs-Haziran 2013). Polis yok: karşıda Gezi'nin halk kahramanları var.
// Çarşı, Kırmızılı Kadın, gaz maskeli semazen, baretli çapulcu ve tencere tava çalan amca (kalkanlı, 2 can).
// Duran Adam hiç kıpırdamaz: ne rüşvet alır ne balyozdan etkilenir. Toplanan eşya: çınar fidanları.
// Güç: baret + gaz maskesi (3 vuruş korur, biber gazından etkilenmez). Arka planda pankartlı AKM, çadırlar, penguenler.
// Canavar: TOMA (5 can). Kavisli su atar, ara sıra gaz kapsülü atar; gaz bulutu 3 sn kalır, içindekini yavaşlatır.
// Yalnızca üstüne zıplayınca hasar alır (1 can); canı 2'ye inince iki kat hızlı ateş eder.
// Çizimler kodla (resim dosyası yok).
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- METİNLER (oyun içi) ---
const GEZI_TEXT = {
    tr: { gezCry: "ÇAPULCU!", fidan: "ÇINAR!", pwMask: "BARET + MASKE!", maskSaved: "BARET KORUDU!", duranHit: "KIPIRDAMIYOR!",
          armored: "ZIRHLI! ÜSTÜNE ZIPLA!", slowed: "BİBER GAZI!", duranName: "DURAN ADAM",
          hero_carsi: "ÇARŞI", hero_kirmizi: "KIRMIZILI KADIN", hero_sema: "SEMAZEN", hero_capulcu: "ÇAPULCU", hero_tencere: "TENCERE TAVA" },
    en: { gezCry: "ÇAPULCU!", fidan: "PLANE TREE!", pwMask: "HARD HAT + MASK!", maskSaved: "HARD HAT SAVED YOU!", duranHit: "HE WON'T MOVE!",
          armored: "ARMOURED! JUMP ON IT!", slowed: "PEPPER GAS!", duranName: "STANDING MAN",
          hero_carsi: "ÇARŞI", hero_kirmizi: "LADY IN RED", hero_sema: "WHIRLING DERVISH", hero_capulcu: "ÇAPULCU", hero_tencere: "POTS & PANS" },
    fr: { gezCry: "ÇAPULCU !", fidan: "PLATANE !", pwMask: "CASQUE + MASQUE !", maskSaved: "LE CASQUE T'A SAUVÉ !", duranHit: "IL NE BOUGE PAS !",
          armored: "BLINDÉ ! SAUTE DESSUS !", slowed: "GAZ POIVRÉ !", duranName: "L'HOMME DEBOUT",
          hero_carsi: "ÇARŞI", hero_kirmizi: "LA FEMME EN ROUGE", hero_sema: "DERVICHE", hero_capulcu: "ÇAPULCU", hero_tencere: "CASSEROLES" },
    nl: { gezCry: "ÇAPULCU!", fidan: "PLATAAN!", pwMask: "HELM + MASKER!", maskSaved: "HELM HIELP!", duranHit: "HIJ BEWEEGT NIET!",
          armored: "GEPANTSERD! SPRING EROP!", slowed: "PEPERGAS!", duranName: "STAANDE MAN",
          hero_carsi: "ÇARŞI", hero_kirmizi: "VROUW IN HET ROOD", hero_sema: "DERWISJ", hero_capulcu: "ÇAPULCU", hero_tencere: "POTTEN & PANNEN" },
    de: { gezCry: "ÇAPULCU!", fidan: "PLATANE!", pwMask: "HELM + MASKE!", maskSaved: "DER HELM HAT GESCHÜTZT!", duranHit: "ER RÜHRT SICH NICHT!",
          armored: "GEPANZERT! SPRING DRAUF!", slowed: "PFEFFERGAS!", duranName: "STEHENDER MANN",
          hero_carsi: "ÇARŞI", hero_kirmizi: "FRAU IN ROT", hero_sema: "DERWISCH", hero_capulcu: "ÇAPULCU", hero_tencere: "TÖPFE & PFANNEN" },
    ru: { gezCry: "ЧАПУЛДЖУ!", fidan: "ПЛАТАН!", pwMask: "КАСКА + МАСКА!", maskSaved: "КАСКА СПАСЛА!", duranHit: "ОН НЕ ДВИГАЕТСЯ!",
          armored: "БРОНЯ! ПРЫГАЙ СВЕРХУ!", slowed: "ПЕРЦОВЫЙ ГАЗ!", duranName: "СТОЯЩИЙ ЧЕЛОВЕК",
          hero_carsi: "ЧАРШЫ", hero_kirmizi: "ЖЕНЩИНА В КРАСНОМ", hero_sema: "ДЕРВИШ", hero_capulcu: "ЧАПУЛДЖУ", hero_tencere: "КАСТРЮЛИ" }
};
for (const L in GEZI_TEXT) if (LANGS[L]) Object.assign(LANGS[L], GEZI_TEXT[L]);

// --- BÖLÜM DÜZENİ ---
const GEZI_HEROES = ['carsi', 'kirmizi', 'sema', 'capulcu'];
const DURAN_X = [6400, 19900];                       // polislerin ve çukurların arasında kalan düz yerler
const MASK_X = [5200, 13700, 22200];
function populateGezi() {
    DURAN_X.forEach(x => enemies.push({ kind: 'duran', x, y: height - 60 - 190, w: 70, h: 190, homeX: x, dir: 1,
                                         dead: false, hp: 1, maxHp: 1, hurt: 0, walkCycle: 0, lastSpeed: 0, said: 0 }));
    for (let i = 0; i < 10; i++) items.push({ x: 2700 + i * 2700, y: height - 140, collected: false });   // çınar fidanları
    MASK_X.forEach(x => items.push({ x, y: height - 300, collected: false, power: 'mask' }));
}
// Duran Adam: rüşvete de balyoza da tepki vermez
function duranHit(en) {
    if (performance.now() - en.said < 900) return;
    en.said = performance.now();
    createParticle(en.x + en.w / 2, en.y - 30, t("duranHit"), "#e5e7eb", 1.0);
}

// --- ARKA PLAN: Taksim. Pankartlarla kaplı AKM, Gezi Parkı'nın çınarları, çadırlar, penguenler, pankartlı duvar ---
THEMES.gezi = { sky: ["#38bdf8", "#7dd3fc", "#bae6fd", "#fef3c7"], sun: { x: 0.82, y: 0.16, r: 42, c: "#fde68a", glow: "rgba(253,224,71,0.35)" },
                clouds: "rgba(255,255,255,0.9)", ground: ["#7a4a24", "#3b2412"], grass: "#4caf2f", grassDark: "#2e6b1c" };
const GEZI_BANNERS = [["ÇAPULCU", "#dc2626"], ["HER YER TAKSİM", "#111827"], ["DİREN GEZİ", "#16a34a"], ["ÇAPULCUYUZ", "#7c3aed"],
                      ["AĞAÇLARA DOKUNMA", "#0369a1"], ["ÇAPULCU", "#ea580c"]];
function geziBanner(x, y, w, h, k, wave) {
    const [txt, col] = GEZI_BANNERS[k % GEZI_BANNERS.length];
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(x, y + h - 4, w, 4);
    ctx.fillStyle = col; ctx.font = `bold ${Math.floor(h * 0.55)}px Arial`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(txt, x + w / 2, y + h / 2 + 1 + (wave || 0), w - 8);
    ctx.textBaseline = "alphabetic";
}
// Penguen (oyun ekranında; ayakların ortası x,y)
function drawPenguin(x, y, s, ph) {
    const waddle = Math.sin(ph) * 0.12;
    ctx.save(); ctx.translate(x, y); ctx.rotate(waddle); ctx.scale(s, s);
    ctx.fillStyle = "#f59e0b"; ctx.fillRect(-10, -4, 8, 4); ctx.fillRect(3, -4, 8, 4);          // ayaklar
    ctx.fillStyle = "#111827"; ctx.beginPath(); ctx.ellipse(0, -28, 15, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.ellipse(3, -24, 10, 19, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#111827"; ctx.beginPath(); ctx.ellipse(-12, -28, 4, 14, 0.3 + Math.sin(ph * 2) * 0.2, 0, Math.PI * 2); ctx.fill();   // kanat
    ctx.beginPath(); ctx.arc(2, -54, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(6, -56, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(7, -56, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.moveTo(11, -53); ctx.lineTo(19, -51); ctx.lineTo(11, -49); ctx.fill();
    ctx.restore();
}
function drawGeziBg(time) {
    skyline(0.06, height * 0.62, 30, 110, "#94a3b8", null, 31);        // uzakta İstanbul
    // AKM: cephesi pankartlarla kaplı
    layerProps(0.16, 2400, 1, 21, sx => {
        const b = height * 0.8, w = 620, h = 230, x = sx - w / 2;
        ctx.fillStyle = "#475569"; ctx.fillRect(x, b - h, w, h);
        ctx.fillStyle = "#334155"; ctx.fillRect(x - 12, b - h - 14, w + 24, 16);
        ctx.fillStyle = "#64748b";
        for (let c = 0; c < 24; c++) ctx.fillRect(x + 8 + c * 25.5, b - h + 8, 6, h - 16);           // dikey cephe çizgileri
        for (let k = 0; k < 6; k++) {                                                                 // asılı pankartlar
            const bx = x + 20 + k * 100, wave = Math.sin(time * 2 + k) * 2;
            geziBanner(bx, b - h + 26 + (k % 2) * 60, 86, 34, k, wave);
        }
        ctx.fillStyle = "#e30a17"; ctx.fillRect(x + w / 2 - 70, b - h + 140, 140, 70);               // bayrak
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x + w / 2 - 12, b - h + 175, 20, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#e30a17"; ctx.beginPath(); ctx.arc(x + w / 2 - 6, b - h + 175, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 20px Arial"; ctx.textAlign = "center"; ctx.fillText("★", x + w / 2 + 16, b - h + 182);
        ctx.fillStyle = "#1e293b"; ctx.font = "bold 18px Arial"; ctx.fillText("ATATÜRK KÜLTÜR MERKEZİ", sx, b - h - 22);
    });
    // Gezi Parkı: çınarlar ve aralarında çadırlar
    const pb = height * 0.86;
    ctx.fillStyle = "#4d7c0f"; ctx.fillRect(0, pb - 6, width, height - pb + 6);
    layerProps(0.32, 170, 0.85, 7, (sx, i) => {
        const s = 0.9 + hash(i * 4.3) * 0.5;
        ctx.fillStyle = "#6b4f2a"; ctx.fillRect(sx - 7 * s, pb - 80 * s, 14 * s, 80 * s);           // alacalı çınar gövdesi
        ctx.fillStyle = "#d6c7a1"; ctx.fillRect(sx - 3 * s, pb - 60 * s, 6 * s, 10 * s);
        ctx.fillStyle = "#166534";
        ctx.beginPath(); ctx.arc(sx, pb - 110 * s, 46 * s, 0, Math.PI * 2); ctx.arc(sx - 36 * s, pb - 86 * s, 30 * s, 0, Math.PI * 2);
        ctx.arc(sx + 36 * s, pb - 88 * s, 32 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(190,242,100,0.25)"; ctx.beginPath(); ctx.arc(sx - 12 * s, pb - 126 * s, 18 * s, 0, Math.PI * 2); ctx.fill();
        if (hash(i * 7.7) > 0.45) {                                                                  // çadır
            const tx = sx + 70, cols = ["#f97316", "#2563eb", "#facc15", "#dc2626", "#16a34a"];
            ctx.fillStyle = cols[i % cols.length];
            ctx.beginPath(); ctx.moveTo(tx - 34, pb); ctx.lineTo(tx, pb - 40); ctx.lineTo(tx + 34, pb); ctx.fill();
            ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.moveTo(tx - 6, pb); ctx.lineTo(tx, pb - 26); ctx.lineTo(tx + 6, pb); ctx.fill();
        }
    });
    // Penguenler: arada bir sıra hâlinde parkın önünden geçerler (o gece televizyonda penguen belgeseli vardı)
    const P = 2600, run = ((time * 40 - camX * 0.45) % P + P) % P - 300;
    for (let k = 0; k < 5; k++) drawPenguin(run + k * 46, pb + 2, 0.9 - (k % 2) * 0.12, time * 8 + k);
    // Pankartlı alçak duvar
    const wb = height * 0.93, wp = 0.6, off = camX * wp;
    ctx.fillStyle = "#a8a29e"; ctx.fillRect(0, wb - 46, width, 46);
    ctx.fillStyle = "#78716c"; ctx.fillRect(0, wb - 50, width, 6);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    for (let x = -(off % 60); x < width; x += 60) ctx.fillRect(x, wb - 44, 2, 44);
    for (let i = Math.floor(off / 380) - 1, x = i * 380 - off; x < width + 380; i++, x += 380) {
        if (hash(i * 2.3) > 0.55) {   // sprey yazı
            ctx.save(); ctx.translate(x + 60, wb - 20); ctx.rotate(-0.06);
            ctx.fillStyle = hash(i) > 0.5 ? "#dc2626" : "#111827"; ctx.font = "bold 24px Impact, Arial"; ctx.textAlign = "left";
            ctx.fillText(hash(i * 5.1) > 0.5 ? "ÇAPULCU" : "HER YER TAKSİM", 0, 0); ctx.restore();
        } else geziBanner(x + 40, wb - 44, 200, 34, i + 2, 0);
    }
}

// --- GEZİ KAHRAMANLARI (polislerin yerine; davranışları: 'police' slogan atar, 'riot' kalkanlı) ---
const GEZI_LOOK = {
    carsi:   { top: "#111827", leg: ["#1f2937", "#111827"], shoe: "#f8fafc", skin: "#e8b48f", hair: "#1c1917" },
    kirmizi: { top: "#dc2626", leg: ["#e8b48f", "#d9a27c"], shoe: "#111827", skin: "#f2c79b", hair: "#292524" },
    sema:    { top: "#f8fafc", leg: ["#e5e7eb", "#d1d5db"], shoe: "#111827", skin: "#e0ac69", hair: "#3f2a1d" },
    capulcu: { top: "#16a34a", leg: ["#1e40af", "#1e3a8a"], shoe: "#f8fafc", skin: "#e0ac69", hair: "#78350f" },
    tencere: { top: "#0ea5e9", leg: ["#57534e", "#44403c"], shoe: "#292524", skin: "#e8b48f", hair: "#6b7280" }
};
// Düz yazı (düşman sola bakarken ters görünmesin)
function heroText(ctx, txt, x, y, dir, size, col) {
    ctx.save(); ctx.translate(x, y); if (dir === -1) ctx.scale(-1, 1);
    ctx.fillStyle = col; ctx.font = `bold ${size}px Arial`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(txt, 0, 0.5); ctx.restore();
}
function drawGeziHero(ctx, en) {
    const C = GEZI_LOOK[en.skin], h = en.h, moving = en.lastSpeed > 0, sema = en.skin === 'sema';
    ctx.save();
    ctx.translate(en.x + en.w / 2, en.y + en.h);
    ctx.save();
    if (en.dir === -1) ctx.scale(-1, 1);
    const legs = drawLegs(ctx, 0, -h, h, 1, en.walkCycle, moving, false,
                          { photoH: 1, ratio: 0.36, width: 13, swing: 0.6, front: C.leg[0], back: C.leg[1], shoe: C.shoe });
    const bodyH = h * 0.64, s = bodyH / 128;
    ctx.translate(0, -h + legs.drop);
    ctx.scale(s, s);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    const swing = moving ? Math.sin(en.walkCycle) * 0.5 : 0.1;
    const arm = (ang, col, x = -12) => {
        ctx.save(); ctx.translate(x, 56); ctx.rotate(ang);
        ctx.strokeStyle = col; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 44); ctx.stroke();
        ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(0, 48, 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    };
    // Arka kol (tencereci: elinde kepçe, havada)
    if (en.skin === 'tencere') {
        ctx.save(); ctx.translate(-14, 56); ctx.rotate(-2.6 + Math.sin(performance.now() / 90) * 0.35);
        ctx.strokeStyle = C.top; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 40); ctx.stroke();
        ctx.strokeStyle = "#9ca3af"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(0, 80); ctx.stroke();
        ctx.fillStyle = "#d1d5db"; ctx.beginPath(); ctx.ellipse(0, 84, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    } else if (sema) {   // semazen: sağ el yukarı açık
        ctx.save(); ctx.translate(-12, 56); ctx.rotate(-2.5);
        ctx.strokeStyle = C.top; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 44); ctx.stroke();
        ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(0, 48, 6.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    } else arm(-swing, C.top);
    if (en.skin === 'kirmizi') {   // omzunda beyaz bez çanta
        ctx.fillStyle = "#f5f5f4"; ctx.strokeStyle = "#a8a29e"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(-36, 84, 26, 32, 4); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-32, 86); ctx.lineTo(-6, 52); ctx.moveTo(-14, 86); ctx.lineTo(4, 52); ctx.stroke();
    }
    // Gövde
    ctx.fillStyle = C.top; ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 2.5;
    if (sema) {   // geniş tennure: dönerken dalgalanır
        const fl = Math.sin(performance.now() / 120 + en.x) * 10;
        ctx.beginPath(); ctx.moveTo(-20, 50); ctx.lineTo(20, 50); ctx.lineTo(56 + fl, 200); ctx.lineTo(-56 + fl, 200); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "rgba(148,163,184,0.6)"; ctx.lineWidth = 2;
        for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * 6, 100); ctx.lineTo(k * 22 + fl, 198); ctx.stroke(); }
        ctx.fillStyle = "#e5e7eb"; ctx.fillRect(-20, 96, 40, 6);
    } else if (en.skin === 'kirmizi') {   // kırmızı yazlık elbise
        ctx.beginPath(); ctx.moveTo(-22, 50); ctx.lineTo(22, 50); ctx.lineTo(34, 150); ctx.lineTo(-34, 150); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
        ctx.beginPath(); ctx.roundRect(-27, 50, 54, 72, 10); ctx.fill(); ctx.stroke();
    }
    if (en.skin === 'carsi') {
        heroText(ctx, "ÇARŞI", 2, 86, en.dir, 13, "#f8fafc");
        ctx.strokeStyle = "#f8fafc"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(2, 104, 8, 0, Math.PI * 2); ctx.stroke();
        heroText(ctx, "A", 2, 104, en.dir, 12, "#f8fafc");
        for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? "#f8fafc" : "#111827"; ctx.fillRect(-20 + k * 7, 48, 7, 10); }   // atkı
        ctx.fillStyle = "#1f2937"; ctx.fillRect(-27, 110, 54, 12);
    }
    if (en.skin === 'capulcu') heroText(ctx, "ÇAPULCU", 0, 86, en.dir, 11, "#f8fafc");
    if (en.skin === 'tencere') { ctx.fillStyle = "#f8fafc"; ctx.fillRect(-27, 62, 54, 3); ctx.fillRect(-27, 82, 54, 3); }
    // Kafa
    ctx.fillStyle = C.skin; ctx.strokeStyle = "#7c4a24"; ctx.lineWidth = 2;
    ctx.fillRect(-6, 40, 12, 12);
    if (en.skin === 'kirmizi') {   // uzun saç arkada
        ctx.fillStyle = C.hair; ctx.beginPath(); ctx.roundRect(-20, 10, 30, 52, 12); ctx.fill(); ctx.fillStyle = C.skin;
    }
    ctx.beginPath(); ctx.ellipse(2, 28, 18, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(11, 26, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.hair;
    if (en.skin !== 'sema' && en.skin !== 'capulcu') { ctx.beginPath(); ctx.ellipse(0, 14, 19, 10, 0, Math.PI, 0); ctx.fill(); }
    if (en.skin === 'tencere') { ctx.fillStyle = "#57534e"; ctx.beginPath(); ctx.ellipse(12, 37, 9, 3.5, 0.1, 0, Math.PI * 2); ctx.fill(); }   // bıyık
    if (en.skin === 'carsi' || en.skin === 'capulcu') {   // yüzücü gözlüğü
        ctx.strokeStyle = "#111827"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-16, 24); ctx.lineTo(20, 24); ctx.stroke();
        ctx.fillStyle = "rgba(56,189,248,0.85)"; ctx.beginPath(); ctx.ellipse(12, 25, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (en.skin === 'capulcu') {   // beyaz maske + sarı baret
        ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.roundRect(2, 31, 18, 12, 4); ctx.fill();
        ctx.fillStyle = "#facc15"; ctx.strokeStyle = "#a16207"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(1, 14, 22, 15, 0, Math.PI, 0); ctx.fill(); ctx.stroke(); ctx.fillRect(-24, 12, 50, 5);
    }
    if (sema) {   // sikke ve gaz maskesi
        ctx.fillStyle = "#a16207"; ctx.beginPath(); ctx.moveTo(-12, 12); ctx.lineTo(-8, -34); ctx.lineTo(10, -34); ctx.lineTo(16, 12); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#374151"; ctx.strokeStyle = "#111827"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(-6, 18, 26, 24, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#a5f3fc"; ctx.beginPath(); ctx.arc(12, 25, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#4b5563"; ctx.beginPath(); ctx.arc(18, 37, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    // Ön kol: slogan atarken öne uzanır; tencereci kalkan yerine tencere kapağı tutar
    if (en.skin === 'tencere') {
        const bob = moving ? Math.sin(en.walkCycle * 2) * 2 : 0;
        ctx.strokeStyle = C.top; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(10, 58); ctx.lineTo(26, 84); ctx.stroke();
        const g = ctx.createRadialGradient(34, 76 + bob, 4, 34, 80 + bob, 50);
        g.addColorStop(0, "#f8fafc"); g.addColorStop(1, "#94a3b8");
        ctx.fillStyle = g; ctx.strokeStyle = "#475569"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(36, 80 + bob, 16, 50, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#1f2937"; ctx.fillRect(48, 74 + bob, 6, 12);   // kapak tutamağı
    } else if (sema) {
        ctx.save(); ctx.translate(-12, 56); ctx.rotate(-1.3); ctx.strokeStyle = C.top; ctx.lineWidth = 13;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 44); ctx.stroke(); ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(0, 48, 6.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    } else {
        const aim = Math.max(en.aim || 0, en.flash > 0 ? 1 : 0);
        arm(swing * (1 - aim) - Math.PI / 2 * aim, C.top);
    }
    ctx.restore();
    ctx.restore();
    if (!en.dead) heroLabel(ctx, t("hero_" + en.skin), en.x + en.w / 2, en.y - 14);
}
function heroLabel(ctx, lb, x, y) {
    ctx.font = "bold 15px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 3; ctx.strokeStyle = "#0f172a"; ctx.strokeText(lb, x, y);
    ctx.fillStyle = "#fde68a"; ctx.fillText(lb, x, y); ctx.textBaseline = "alphabetic";
}
// Kahramanların attığı slogan balonu (mermi gibi düz gider)
const GEZI_SLOGANS = ["HER YER TAKSİM!", "DİRENİŞ!", "ÇAPULCUYUZ!", "HÜKÜMET İSTİFA!"];
function drawSlogan(ctx, p) {
    if (p.txt === undefined) p.txt = GEZI_SLOGANS[Math.floor(Math.random() * GEZI_SLOGANS.length)];
    ctx.font = "bold 15px Arial";
    const w = ctx.measureText(p.txt).width + 16, d = Math.sign(p.vx) || 1;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#111"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(p.x - w / 2, p.y - 13, w, 26, 10); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p.x - d * w / 2 + d * 6, p.y + 8); ctx.lineTo(p.x - d * w / 2 - d * 8, p.y + 18); ctx.lineTo(p.x - d * w / 2 + d * 16, p.y + 12); ctx.fill();
    ctx.fillStyle = "#dc2626"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(p.txt, p.x, p.y + 1);
    ctx.textBaseline = "alphabetic";
}

// --- DURAN ADAM: Taksim'e dönmüş, elleri yanında, hiç kıpırdamaz; çantası ayağının dibinde ---
function drawDuran(ctx, en) {
    const x = en.x + en.w / 2, y = en.y + en.h;
    ctx.save(); ctx.translate(x, y); ctx.scale(en.dir, 1);
    ctx.fillStyle = "#111827"; ctx.fillRect(-14, -78, 12, 76); ctx.fillRect(2, -78, 12, 76);       // pantolon
    ctx.fillStyle = "#0a0a0a"; ctx.fillRect(-16, -6, 16, 6); ctx.fillRect(2, -6, 18, 6);
    ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2;                       // beyaz gömlek
    ctx.beginPath(); ctx.roundRect(-18, -146, 36, 72, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(-26, -142, 9, 58); ctx.fillRect(17, -142, 9, 58);       // kollar yanda
    ctx.fillStyle = "#e0ac69"; ctx.beginPath(); ctx.arc(-21, -82, 5, 0, Math.PI * 2); ctx.arc(21, -82, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-5, -156, 10, 12);
    ctx.beginPath(); ctx.ellipse(1, -170, 15, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1c1917"; ctx.beginPath(); ctx.ellipse(-1, -182, 16, 9, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(9, -171, 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#7c2d12"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(5, -160); ctx.lineTo(12, -160); ctx.stroke();   // düz ağız
    ctx.fillStyle = "#374151"; ctx.beginPath(); ctx.roundRect(-46, -30, 24, 30, 6); ctx.fill();      // yerde sırt çantası
    ctx.fillStyle = "#1f2937"; ctx.fillRect(-42, -22, 16, 4);
    ctx.restore();
    heroLabel(ctx, t("duranName"), x, en.y - 14);
}

// --- ÇINAR FİDANI (torbaların yerine) ---
function drawFidan(ctx, x, y) {
    const tm = performance.now() / 1000, bob = Math.sin(tm * 3 + x) * 5, sway = Math.sin(tm * 2 + x) * 0.08;
    ctx.save(); ctx.translate(x, y + bob);
    const g = ctx.createRadialGradient(0, -10, 4, 0, -10, 50);
    g.addColorStop(0, "rgba(134,239,172,0.55)"); g.addColorStop(1, "rgba(134,239,172,0)");
    ctx.fillStyle = g; ctx.fillRect(-50, -60, 100, 100);
    ctx.fillStyle = "#b45309"; ctx.beginPath(); ctx.moveTo(-18, 6); ctx.lineTo(18, 6); ctx.lineTo(13, 30); ctx.lineTo(-13, 30); ctx.closePath(); ctx.fill();   // saksı
    ctx.fillStyle = "#92400e"; ctx.fillRect(-20, 2, 40, 7);
    ctx.rotate(sway);
    ctx.strokeStyle = "#78350f"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, -34); ctx.stroke();
    ctx.fillStyle = "#16a34a";
    [[-12, -26, -0.6], [12, -30, 0.6], [0, -42, 0]].forEach(([lx, ly, r]) => {   // çınar yaprağı: beş uçlu
        ctx.save(); ctx.translate(lx, ly); ctx.rotate(r); ctx.beginPath();
        for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 5 : 13; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        ctx.closePath(); ctx.fill(); ctx.restore();
    });
    ctx.restore();
}

// --- CANAVAR: TOMA ---
// Çapulcuların boyadığı TOMA: üstünde "ÇAPULCU", "HER YER TAKSİM". Su topu oyuncuya kavisli su atar; her üçüncü saldırı gaz kapsülü.
BOSS_TYPES.toma = { say: "HER YER TAKSİM!", w: 330, h: 200, scale: 1, hp: 5, arena: 650, nameKey: "bossName", stomp: 80, labelY: 50,
                    stompDmg: 1, stompOnly: true, calmRage: true, update: updateToma, draw: drawToma };
const WATER_G = 0.32, TOMA_FIRE = 120;
// Kavisli atış: T karede (tx, ty)'ye varacak hız
function lobVel(sx, sy, tx, ty, T, G) { return [(tx - sx) / T, (ty - sy) / T - 0.5 * G * T]; }
function tomaNozzle(b) { return [b.x + b.w / 2 + b.look * 80, b.y + b.h - 168]; }
function updateToma(b) {
    const pcx = player.x + player.w / 2, dist = pcx - (b.x + b.w / 2), ad = Math.abs(dist);
    b.look = Math.sign(dist) || b.look;
    // Mesafeyi korur: yakınsa geri çekilir, uzaksa yaklaşır (arenadan çıkmaz)
    const move = ad < 380 ? -b.look : ad > 650 ? b.look : 0;
    const nx = Math.max(b.homeX - b.T.arena, Math.min(b.x + move * 2.2, b.homeX + b.T.arena));
    b.wheel = (b.wheel || 0) + (nx - b.x) * 0.035; b.x = nx;
    if (b.flash > 0) b.flash--;
    // Su topu oyuncuya döner
    const [sx, sy] = tomaNozzle(b), T = 42 + ad / 28;
    const [vx, vy] = lobVel(sx, sy, pcx + player.vx * 8, player.y + player.h * 0.5, T, WATER_G);
    const want = Math.atan2(vy, Math.abs(vx));
    b.aim = (b.aim === undefined ? want : b.aim + (want - b.aim) * 0.15);
    // Ateş: canı 2'ye inince iki kat hızlı
    if (player.isDying || ad > 1400) return;
    if (++b.timer >= (b.hp <= 2 ? TOMA_FIRE / 2 : TOMA_FIRE)) {
        b.timer = 0; b.attacks++; b.flash = 14;
        if (b.attacks % 3 === 0) {   // gaz kapsülü: oyuncunun ayağına
            const [gx, gy] = lobVel(sx, sy, pcx + player.vx * 10, height - 60, T + 10, GAS_G);
            projectiles.push({ type: 'tgas', x: sx, y: sy, vx: gx, vy: gy, active: true, life: 400, angle: 0, cloud: 0 });
            playSfx('hit', { rate: 2.2, vol: 0.4 });
        } else {
            projectiles.push({ type: 'water', x: sx, y: sy, vx, vy, active: true, life: 300 });
            playSfx('hit', { rate: 0.5, vol: 0.5 });
        }
    }
}
function drawToma(ctx, b) {
    ctx.save();
    bossBaseTransform(ctx, b);
    ctx.scale(b.look, 1);
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.ellipse(0, -2, 170, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.lineJoin = "round";
    // Şasi ve tekerlekler
    ctx.fillStyle = "#1f2937"; ctx.fillRect(-160, -64, 322, 22);
    [-112, -44, 106].forEach(wx => {
        ctx.fillStyle = "#111827"; ctx.beginPath(); ctx.arc(wx, -30, 30, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.translate(wx, -30); ctx.rotate(b.wheel || 0);
        ctx.fillStyle = "#9ca3af"; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#4b5563"; for (let k = 0; k < 5; k++) { ctx.rotate(Math.PI * 2 / 5); ctx.fillRect(-2, 4, 4, 8); }
        ctx.restore();
    });
    // Su tankı (arka): beyaz gövde, mavi şerit
    ctx.fillStyle = "#f1f5f9"; ctx.strokeStyle = "#475569"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(-162, -176, 200, 116, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#1d4ed8"; ctx.fillRect(-160, -104, 196, 14);
    ctx.fillStyle = "#1e3a8a"; ctx.font = "bold 30px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.save(); if (b.look === -1) { ctx.translate(-62, 0); ctx.scale(-1, 1); ctx.translate(62, 0); }
    ctx.fillText("TOMA", -62, -78);
    // Sprey yazılar
    ctx.save(); ctx.translate(-70, -140); ctx.rotate(-0.08);
    ctx.fillStyle = "#dc2626"; ctx.font = "bold 34px Impact, Arial"; ctx.fillText("ÇAPULCU", 0, 0);
    ctx.fillStyle = "rgba(220,38,38,0.8)"; [-50, -14, 30].forEach(dx => ctx.fillRect(dx, 14, 3, 10 + (dx & 7)));   // akıntılar
    ctx.restore();
    ctx.fillStyle = "#111827"; ctx.font = "bold 13px Impact, Arial"; ctx.fillText("HER YER TAKSİM", -62, -116);
    ctx.restore();
    // Kabin (ön): eğik burun, kafesli cam, tepe lambası
    ctx.fillStyle = "#e2e8f0"; ctx.strokeStyle = "#475569"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(40, -162); ctx.lineTo(126, -162); ctx.lineTo(164, -112); ctx.lineTo(164, -60); ctx.lineTo(40, -60); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#1e3a5f"; ctx.beginPath(); ctx.moveTo(78, -152); ctx.lineTo(122, -152); ctx.lineTo(152, -114); ctx.lineTo(78, -114); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(84 + k * 12, -152); ctx.lineTo(84 + k * 12 + (k > 2 ? 10 : 0), -114); ctx.stroke(); }
    ctx.fillStyle = "#1d4ed8"; ctx.fillRect(40, -104, 124, 12);
    ctx.fillStyle = "#fde68a"; ctx.fillRect(156, -84, 8, 12);                                       // far
    const blink = Math.floor(performance.now() / 180) % 2;
    ctx.fillStyle = blink ? "#3b82f6" : "#1e3a8a"; ctx.fillRect(50, -172, 22, 10);
    ctx.fillStyle = blink ? "#7f1d1d" : "#ef4444"; ctx.fillRect(100, -172, 22, 10);
    // Gaz kapsülü rampası (tank üstünde)
    ctx.save(); ctx.translate(-120, -176); ctx.rotate(-0.6);
    ctx.fillStyle = "#3f6212"; ctx.fillRect(0, -8, 34, 16); ctx.fillStyle = "#1a2e05"; ctx.fillRect(30, -8, 6, 16);
    ctx.restore();
    // Su topu: kabinin üstünde, oyuncuya döner
    ctx.save(); ctx.translate(80, -168);
    ctx.fillStyle = "#64748b"; ctx.beginPath(); ctx.arc(0, 0, 18, Math.PI, 0); ctx.fill();
    ctx.rotate(b.aim || -0.4);
    ctx.fillStyle = "#475569"; ctx.fillRect(0, -7, 76, 14); ctx.fillStyle = "#1f2937"; ctx.fillRect(70, -9, 10, 18);
    if (b.flash > 0) {   // fışkıran su
        ctx.fillStyle = `rgba(147,197,253,${b.flash / 14})`;
        for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(86 + k * 9, (k % 2 ? 4 : -4) * (b.flash / 14), 8 - k, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
    ctx.restore();
}

// Su: kavisli gider; oyuncuya çarparsa can götürür (kalkan durdurur), yere düşünce sıçrar
function waterSplash(x, y) {
    for (let i = 0; i < 8; i++) particles.push({ x, y, vx: (Math.random() - 0.5) * 7, vy: -2 - Math.random() * 4,
                                                 life: 0.4, maxLife: 0.4, size: 3 + Math.random() * 4, text: null });
}
function updateWater(p) {
    p.life--;
    const prevY = p.y;
    p.vy += WATER_G; p.y += p.vy;
    if (!player.isDying && p.x > player.x + 15 && p.x < player.x + player.w - 15 && p.y > player.y && p.y < player.y + player.h) {
        p.active = false;
        if (shieldBlocks(p)) blockProjectile(p); else { waterSplash(p.x, p.y); die(); }
        return;
    }
    for (const pl of platforms) {
        if (p.vy > 0 && p.x > pl.x && p.x < pl.x + pl.w && prevY <= pl.y && p.y >= pl.y) { p.active = false; waterSplash(p.x, pl.y); return; }
    }
}
function drawWater(ctx, p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx));
    const g = ctx.createLinearGradient(-60, 0, 14, 0);
    g.addColorStop(0, "rgba(147,197,253,0)"); g.addColorStop(1, "rgba(96,165,250,0.85)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(-22, 0, 40, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3b82f6"; ctx.beginPath(); ctx.ellipse(4, 0, 15, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.beginPath(); ctx.arc(8, -4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// Gaz kapsülü: yere düşünce 3 sn kalan bulut; bulutun içindeki oyuncu yarı hızda yürür (baret + maske korur)
const TGAS_CLOUD = 180;
function updateTomaGas(p) {
    p.life--;
    if (p.cloud > 0) {
        p.cloud--; p.life = p.cloud + 1;
        const r = gasRadius(p), pcx = player.x + player.w / 2;
        if (!player.isDying && !(power.mask > 0) && Math.abs(pcx - p.x) < r + 20 && player.y + player.h > p.y - r * 0.9) {
            if (!(player.slow > 0)) createParticle(pcx, player.y - 20, t("slowed"), "#e5e7eb", 1.0);
            player.slow = 8;
        }
        return;
    }
    const prevY = p.y;
    p.vy += GAS_G; p.y += p.vy; p.angle += 0.3;
    const burst = y => { p.y = y; p.cloud = TGAS_CLOUD; p.vx = 0; p.vy = 0; playSfx('hit', { rate: 0.5, vol: 0.4 }); };
    for (const pl of platforms) {
        if (p.vy > 0 && p.x > pl.x && p.x < pl.x + pl.w && prevY <= pl.y && p.y >= pl.y) { burst(pl.y); return; }
    }
    if (!player.isDying && p.x > player.x + 15 && p.x < player.x + player.w - 15 && p.y > player.y && p.y < player.y + player.h) {
        if (shieldBlocks(p)) blockProjectile(p); else burst(player.y + player.h);
    }
}
function drawTomaGas(ctx, p) {
    if (p.cloud > 0) {   // beyaz-gri biber gazı bulutu
        const r = gasRadius(p), t0 = performance.now() / 1000, a = Math.min(1, p.cloud / 40);
        for (let i = 0; i < 8; i++) {
            const ang = i / 8 * Math.PI * 2 + t0 * 0.5, ox = Math.cos(ang) * r * 0.55, oy = -r * 0.45 + Math.sin(ang) * r * 0.3;
            ctx.fillStyle = `rgba(${i % 2 ? '226,232,240' : '203,213,225'},${0.45 * a})`;
            ctx.beginPath(); ctx.arc(p.x + ox, p.y + oy, r * (0.45 + 0.1 * Math.sin(t0 * 3 + i)), 0, Math.PI * 2); ctx.fill();
        }
        return;
    }
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
    ctx.fillStyle = "#475569"; ctx.fillRect(-8, -13, 16, 26);
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(-8, -4, 16, 6);
    ctx.fillStyle = "#1f2937"; ctx.fillRect(-5, -17, 10, 5);
    ctx.restore();
    ctx.fillStyle = "rgba(226,232,240,0.5)"; ctx.beginPath(); ctx.arc(p.x - p.vx * 2, p.y - p.vy * 2, 8, 0, Math.PI * 2); ctx.fill();
}
Object.assign(PROJECTILES, { water: [updateWater, drawWater], tgas: [updateTomaGas, drawTomaGas] });

// --- HİKÂYE ---
Object.assign(PIX_FACES, {
    capulcu: { pal: { h: '#3f2a1d', s: '#e0ac69', g: '#38bdf8', k: '#111827', r: '#dc2626', w: '#fff' },
               rows: ['.hhhhhh.', 'hhhhhhhh', 'kggkkggk', 'sggssggs', 'ssssssss', 'rrrrrrrr', 'rwrrrwrr', '.rrrrrr.'] },
    duran:   { pal: { h: '#1c1917', s: '#e0ac69', e: '#111827', m: '#7c2d12' },
               rows: ['.hhhhhh.', 'hhhhhhhh', 'hssssssh', 'sesssess', 'ssssssss', 'ssssssss', 'ssmmmmss', '.ssssss.'] }
});
Object.assign(STORY_CAST, {
    capulcu: { pix: 'capulcu', suit: '#111827', arm: '#111827', leg: '#1e40af', shoe: '#f8fafc', hand: '#e0ac69' },
    duran:   { pix: 'duran', suit: '#f8fafc', arm: '#f8fafc', leg: '#111827', shoe: '#000', hand: '#e0ac69' }
});
Object.assign(STORY_BG, {
    // Taksim: pankartlı AKM, çınarlar, çadırlar
    gezi(c, time) {
        storySky(c, ['#38bdf8', '#5cc8f9', '#7dd3fc', '#a5e3fd', '#fef3c7']);
        c.fillStyle = '#fde047'; c.fillRect(820, 36, 56, 56);
        blockRect(c, 60, 150, 470, 290, '#64748b');
        for (let x = 76; x < 520; x += 24) { c.fillStyle = '#475569'; c.fillRect(x, 166, 8, 260); }
        const ban = [['ÇAPULCU', '#dc2626'], ['HER YER TAKSİM', '#111827'], ['DİREN GEZİ', '#16a34a']];
        ban.forEach(([txt, col], k) => {
            const y = 180 + k * 70 + Math.round(Math.sin(time * 3 + k)) * PX;
            blockRect(c, 96 + (k % 2) * 40, y, 340, 48, '#f8fafc');
            c.fillStyle = col; c.font = 'bold 28px monospace'; c.textAlign = 'center'; c.fillText(txt, 266 + (k % 2) * 40, y + 34);
        });
        [[600, 1], [760, 1.2], [900, 0.9]].forEach(([x, s]) => {   // çınarlar
            blockRect(c, x - 10 * s, STORY_GROUND - 120 * s, 20 * s, 120 * s, '#6b4f2a');
            blockRect(c, x - 70 * s, STORY_GROUND - 230 * s, 140 * s, 120 * s, '#166534');
            blockRect(c, x - 44 * s, STORY_GROUND - 270 * s, 88 * s, 50 * s, '#15803d');
        });
        [['#f97316', 560], ['#2563eb', 690], ['#facc15', 830]].forEach(([col, x]) => {   // çadırlar
            c.fillStyle = col;
            for (let r = 0; r < 8; r++) c.fillRect(x - r * 6, STORY_GROUND - 48 + r * 6, 12 + r * 12, 6);
        });
        storyGround(c, '#4caf2f', '#7a4a24');
    }
});
Object.assign(STORY_PROPS, {
    penguins(c, time) {   // televizyonda penguen belgeseli, önünden geçen penguenler
        blockRect(c, 330, 150, 300, 190, '#111827');
        c.fillStyle = '#bae6fd'; c.fillRect(346, 166, 268, 158);
        c.fillStyle = '#f8fafc'; c.fillRect(346, 284, 268, 40);
        for (let k = 0; k < 3; k++) storyPenguin(c, 400 + k * 80, 300, 0.8, time * 6 + k);
        c.fillStyle = '#dc2626'; c.fillRect(346, 166, 110, 24);
        c.fillStyle = '#fff'; c.font = 'bold 16px monospace'; c.textAlign = 'left'; c.fillText('BELGESEL', 354, 184);
        const x0 = ((time * 70) % (STORY_W + 300)) - 200;
        for (let k = 0; k < 4; k++) storyPenguin(c, x0 + k * 60, STORY_GROUND, 1.3, time * 8 + k);
    },
    toma(c, time) {   // boyanmış TOMA
        const x = 520;
        blockRect(c, x - 200, STORY_GROUND - 180, 240, 130, '#f1f5f9');
        blockRect(c, x + 40, STORY_GROUND - 170, 120, 120, '#e2e8f0');
        c.fillStyle = '#1e3a5f'; c.fillRect(x + 80, STORY_GROUND - 160, 64, 44);
        c.fillStyle = '#1d4ed8'; c.fillRect(x - 200, STORY_GROUND - 110, 360, 12);
        c.fillStyle = '#dc2626'; c.font = 'bold 34px monospace'; c.textAlign = 'center'; c.fillText('ÇAPULCU', x - 80, STORY_GROUND - 132);
        c.fillStyle = '#111827'; c.font = 'bold 18px monospace'; c.fillText('HER YER TAKSİM', x - 80, STORY_GROUND - 70);
        [x - 150, x - 60, x + 110].forEach(wx => { blockRect(c, wx - 24, STORY_GROUND - 48, 48, 48, '#111827', false); c.fillStyle = '#9ca3af'; c.fillRect(wx - 8, STORY_GROUND - 32, 16, 16); });
        blockRect(c, x + 60, STORY_GROUND - 196, 40, 26, '#64748b');
        c.fillStyle = '#475569'; c.fillRect(x + 96, STORY_GROUND - 192, 70, 12);
        c.fillStyle = Math.floor(time * 5) % 2 ? '#3b82f6' : '#ef4444'; c.fillRect(x + 40, STORY_GROUND - 184, 24, 12);
    }
});
function storyPenguin(c, x, y, s, ph) {
    const b = Math.round(Math.abs(Math.sin(ph)) * 2) * PX;
    c.fillStyle = '#f59e0b'; c.fillRect(x - 12 * s, y - 4 * s, 10 * s, 4 * s); c.fillRect(x + 4 * s, y - 4 * s, 10 * s, 4 * s);
    c.fillStyle = '#111827'; c.fillRect(x - 16 * s, y - 60 * s - b, 32 * s, 56 * s);
    c.fillStyle = '#f8fafc'; c.fillRect(x - 6 * s, y - 52 * s - b, 18 * s, 44 * s);
    c.fillStyle = '#111827'; c.fillRect(x - 12 * s, y - 80 * s - b, 24 * s, 22 * s);
    c.fillStyle = '#fff'; c.fillRect(x + 2 * s, y - 74 * s - b, 6 * s, 6 * s);
    c.fillStyle = '#f59e0b'; c.fillRect(x + 12 * s, y - 68 * s - b, 10 * s, 4 * s);
}
STORIES[1] = [
    { bg: 'gezi', say: { key: 's1a' },
      actors: [{ who: 'capulcu', x: 560, dir: 1 }, { who: 'capulcu', x: 700, dir: -1 }, { who: 'duran', x: 860, dir: -1 }] },
    { bg: 'gezi', say: { who: 'capulcu', key: 's1b' },
      actors: [{ who: 'capulcu', x: 560, dir: 1, talk: true, wave: true, jump: true }, { who: 'capulcu', x: 700, dir: -1, jump: true }, { who: 'duran', x: 860, dir: -1 }] },
    { bg: 'palace', say: { who: 'recep', key: 's1c' },
      actors: [{ who: 'recep', x: -100, to: 380, dir: 1, talk: true }] },
    { bg: 'gezi', props: ['penguins'], say: { key: 's1d' }, actors: [] },
    { bg: 'gezi', props: ['toma'], say: { key: 's1e' }, actors: [{ who: 'duran', x: 860, dir: -1 }] },
    { bg: 'card', card: { title: 'm1t', text: 'm1' } }
];
const GEZI_STORY = {
    tr: { capulcu: 'ÇAPULCU', duran: 'DURAN ADAM',
          s1a: 'Mayıs 2013, Taksim. Gezi Parkı\'nın çınarları kesilecek, yerine kışla görünümlü AVM yapılacaktı...',
          s1b: 'Ağaçlara dokunma! Her yer Taksim, her yer direniş!',
          s1c: 'Birkaç çapulcu! Ne yaparlarsa yapsınlar, kararımızı verdik!',
          s1d: 'Ülke sokaktaydı... ama o gece bazı kanallar penguen belgeseli yayınladı.',
          s1e: 'Çapulcular TOMA\'yı bile boyamış: üstünde kocaman "HER YER TAKSİM" yazıyor!',
          m1t: 'GÖREV 1: GEZİ PARKI', m1: '11 çapulcuyu rüşvetle sustur, çınar fidanlarını topla, kapıdan geç ve TOMA\'nın üstüne zıplayarak onu durdur! Gaz bulutuna girme: yavaşlatır. Baret 3 vuruş korur.' },
    en: { capulcu: 'ÇAPULCU', duran: 'STANDING MAN',
          s1a: 'May 2013, Taksim. Gezi Park\'s plane trees were to be cut down for a mall dressed up as old barracks...',
          s1b: 'Hands off the trees! Everywhere is Taksim, everywhere is resistance!',
          s1c: 'A few looters! Let them do what they like, our decision is made!',
          s1d: 'The whole country was in the streets... but that night some channels aired a penguin documentary.',
          s1e: 'The protesters even painted the TOMA: it now reads "EVERYWHERE IS TAKSIM" in huge letters!',
          m1t: 'MISSION 1: GEZİ PARK', m1: 'Bribe 11 protesters into silence, collect the plane saplings, pass the gate and stop the TOMA by jumping on it! Avoid the gas cloud: it slows you down. The hard hat blocks 3 hits.' },
    fr: { capulcu: 'ÇAPULCU', duran: 'L\'HOMME DEBOUT',
          s1a: 'Mai 2013, Taksim. Les platanes du parc Gezi devaient être abattus pour un centre commercial déguisé en caserne...',
          s1b: 'Ne touchez pas aux arbres ! Partout c\'est Taksim, partout c\'est la résistance !',
          s1c: 'Quelques pillards ! Qu\'ils fassent ce qu\'ils veulent, notre décision est prise !',
          s1d: 'Tout le pays était dans la rue... mais ce soir-là, certaines chaînes diffusaient un documentaire sur les pingouins.',
          s1e: 'Les manifestants ont même tagué le TOMA : on y lit en grand « PARTOUT C\'EST TAKSIM » !',
          m1t: 'MISSION 1 : LE PARC GEZI', m1: 'Achète le silence de 11 manifestants, ramasse les jeunes platanes, passe la porte et arrête le TOMA en sautant dessus ! Évite le nuage de gaz : il te ralentit. Le casque bloque 3 coups.' },
    nl: { capulcu: 'ÇAPULCU', duran: 'STAANDE MAN',
          s1a: 'Mei 2013, Taksim. De platanen van het Gezipark zouden gekapt worden voor een winkelcentrum vermomd als kazerne...',
          s1b: 'Blijf van de bomen af! Overal is Taksim, overal is verzet!',
          s1c: 'Een paar plunderaars! Laat ze maar doen, ons besluit staat vast!',
          s1d: 'Het hele land stond op straat... maar die avond zonden sommige zenders een pinguïndocumentaire uit.',
          s1e: 'De demonstranten hebben zelfs de TOMA beklad: er staat nu in koeienletters "OVERAL IS TAKSIM"!',
          m1t: 'MISSIE 1: GEZIPARK', m1: 'Koop 11 demonstranten om, verzamel de jonge platanen, ga door de poort en stop de TOMA door erop te springen! Vermijd de gaswolk: die vertraagt je. De helm houdt 3 klappen tegen.' },
    de: { capulcu: 'ÇAPULCU', duran: 'STEHENDER MANN',
          s1a: 'Mai 2013, Taksim. Die Platanen im Gezi-Park sollten für ein Einkaufszentrum im Kasernen-Look gefällt werden...',
          s1b: 'Finger weg von den Bäumen! Überall ist Taksim, überall ist Widerstand!',
          s1c: 'Ein paar Plünderer! Sollen sie machen, was sie wollen, wir haben entschieden!',
          s1d: 'Das ganze Land war auf der Straße... doch an jenem Abend zeigten manche Sender eine Pinguin-Doku.',
          s1e: 'Die Demonstranten haben sogar den TOMA besprüht: Darauf steht riesig „ÜBERALL IST TAKSIM"!',
          m1t: 'MISSION 1: GEZI-PARK', m1: 'Besteche 11 Demonstranten, sammle die Platanen-Setzlinge, geh durchs Tor und stoppe den TOMA, indem du draufspringst! Meide die Gaswolke: Sie bremst dich. Der Helm hält 3 Treffer ab.' },
    ru: { capulcu: 'ЧАПУЛДЖУ', duran: 'СТОЯЩИЙ ЧЕЛОВЕК',
          s1a: 'Май 2013 года, Таксим. Платаны парка Гези собирались вырубить ради торгового центра в виде старой казармы...',
          s1b: 'Не трогайте деревья! Везде Таксим, везде сопротивление!',
          s1c: 'Кучка мародёров! Пусть делают что хотят, мы всё решили!',
          s1d: 'Вся страна вышла на улицы... а некоторые каналы в ту ночь показывали фильм про пингвинов.',
          s1e: 'Протестующие даже разрисовали ТОМА: теперь на ней огромными буквами «ВЕЗДЕ ТАКСИМ»!',
          m1t: 'МИССИЯ 1: ПАРК ГЕЗИ', m1: 'Подкупи 11 протестующих, собери саженцы платанов, пройди ворота и останови ТОМА, прыгнув на неё! Избегай газового облака: оно замедляет. Каска выдерживает 3 удара.' }
};
for (const L in GEZI_STORY) if (STORY_TEXT[L]) Object.assign(STORY_TEXT[L], GEZI_STORY[L]);

// --- HABERLER (arka plan TV'leri ve gazeteleri, js/newsbg.js) ---
Object.assign(NEWS_SCENES, {
    penguin(x, y, w, h, t) {   // buzul ve penguenler
        ctx.fillStyle = "#bae6fd"; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#f8fafc"; ctx.fillRect(x, y + h * 0.7, w, h * 0.3);
        ctx.fillStyle = "#e0f2fe"; ctx.beginPath(); ctx.moveTo(x, y + h * 0.7); ctx.lineTo(x + w * 0.3, y + h * 0.35); ctx.lineTo(x + w * 0.55, y + h * 0.7); ctx.fill();
        for (let k = 0; k < 4; k++) drawPenguin(x + w * (0.2 + k * 0.2), y + h * 0.9, h / 140, t * 6 + k);
    },
    tents(x, y, w, h, t) {   // parkta çadırlar, dumanlar
        ctx.fillStyle = "#86efac"; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#166534"; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(x + w * (0.15 + k * 0.25), y + h * 0.35, h * 0.2, 0, Math.PI * 2); ctx.fill(); }
        ["#f97316", "#2563eb", "#facc15"].forEach((col, k) => { ctx.fillStyle = col; const tx = x + w * (0.2 + k * 0.3); ctx.beginPath(); ctx.moveTo(tx - 24, y + h * 0.9); ctx.lineTo(tx, y + h * 0.6); ctx.lineTo(tx + 24, y + h * 0.9); ctx.fill(); });
        for (let k = 0; k < 6; k++) { ctx.fillStyle = `rgba(100,116,139,${0.5 - k * 0.07})`; ctx.beginPath(); ctx.arc(x + w * 0.5 + Math.sin(t + k) * 10, y + h * (0.6 - k * 0.09), 10 + k * 4, 0, Math.PI * 2); ctx.fill(); }
    },
    crowd(x, y, w, h, t) {   // meydanda kalabalık ve pankartlar
        ctx.fillStyle = "#fde68a"; ctx.fillRect(x, y, w, h);
        for (let i = 0; i < 14; i++) person(x + 10 + i * (w - 20) / 13, y + h * (0.85 + (i % 2) * 0.08), 0.75, i % 3 ? "#1f2937" : "#7f1d1d");
        ctx.fillStyle = "#fff"; ctx.fillRect(x + w * 0.2, y + h * 0.2 + Math.sin(t * 3) * 2, w * 0.6, h * 0.2);
        ctx.fillStyle = "#dc2626"; ctx.font = `bold ${Math.floor(h * 0.13)}px Arial`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("ÇAPULCUYUZ", x + w / 2, y + h * 0.3 + Math.sin(t * 3) * 2); ctx.textBaseline = "alphabetic";
    },
    duran(x, y, w, h) {   // tek başına duran adam, karşısında AKM
        ctx.fillStyle = "#cbd5e1"; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#64748b"; ctx.fillRect(x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.5);
        ctx.fillStyle = "#e30a17"; ctx.fillRect(x + w * 0.4, y + h * 0.2, w * 0.2, h * 0.2);
        ctx.fillStyle = "#a8a29e"; ctx.fillRect(x, y + h * 0.75, w, h * 0.25);
        person(x + w * 0.5, y + h * 0.95, 0.9, "#f8fafc");
    },
    toma(x, y, w, h, t) {   // su sıkan TOMA
        ctx.fillStyle = "#475569"; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#f1f5f9"; ctx.fillRect(x + w * 0.15, y + h * 0.45, w * 0.5, h * 0.35); ctx.fillRect(x + w * 0.65, y + h * 0.5, w * 0.17, h * 0.3);
        ctx.fillStyle = "#1d4ed8"; ctx.fillRect(x + w * 0.15, y + h * 0.62, w * 0.67, h * 0.05);
        ctx.fillStyle = "#111827"; [0.25, 0.45, 0.75].forEach(f => { ctx.beginPath(); ctx.arc(x + w * f, y + h * 0.82, h * 0.08, 0, Math.PI * 2); ctx.fill(); });
        ctx.strokeStyle = "rgba(147,197,253,0.85)"; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(x + w * 0.7, y + h * 0.45); ctx.quadraticCurveTo(x + w * 0.2, y + h * (0.05 + Math.sin(t * 4) * 0.03), x + w * 0.05, y + h * 0.5); ctx.stroke();
    }
});
NEWS[1] = [
    { type: 'tv', head: "O GECE CNN TÜRK'TE: PENGUEN BELGESELİ", scene: 'penguin' },
    { type: 'paper', date: "31 MAYIS 2013", head: "GEZİ PARKI'NDA ŞAFAK BASKINI: ÇADIRLAR YAKILDI", scene: 'tents' },
    { type: 'tv', head: "'BİRKAÇ ÇAPULCU' DEDİ, MEYDANLAR DOLDU", scene: 'crowd' },
    { type: 'paper', date: "18 HAZİRAN 2013", head: "DURAN ADAM TAKSİM'DE SAATLERCE KIPIRDAMADI", scene: 'duran' },
    { type: 'tv', head: "TAKSİM'DE TOMA'LAR VE BİBER GAZI", scene: 'toma' }
];
