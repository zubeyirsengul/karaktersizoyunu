// Açılış sahnesi (Kaçak Saray) ve açılış müziği
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- AÇILIŞ SAHNESİ (kodla çizilir; YouTube'a ya da video dosyasına bağlanmaz) ---
// Ankara'da alacakaranlık: tepede ışıl ışıl Kaçak Saray, kul hakkı torbaları saraya uçar, gökten dolar yağar.
// Önde balyozlu, kalkanlı Recep yürür, peşinde 17/25 polisleri; ters yönden polisler ve bastonlu FETÖ geçer.
// Tarayıcılar sesli otomatik oynatmaya izin vermez: müzik açılış ekranına ilk dokunuşta ya da SESİ AÇ ile başlar.
const introCanvas = $('intro-canvas'), ictx = introCanvas.getContext('2d');
let introW = 0, introH = 0, introRAF = null, introSky = null;
const introT0 = performance.now();

function resizeIntro() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);   // telefonda 3x yoğunluk 9 kat piksel demek: 2 ile sınırla
    introW = window.innerWidth; introH = window.innerHeight;
    introCanvas.width = Math.round(introW * dpr); introCanvas.height = Math.round(introH * dpr);
    ictx.setTransform(dpr, 0, 0, dpr, 0, 0);
    introSky = null;
}

function drawTurkishFlag(c, x, y, s, time) {
    c.strokeStyle = "#e5e7eb"; c.lineWidth = 2.5 * s;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 70 * s); c.stroke();
    const fw = 46 * s, fh = 30 * s, top = y - 70 * s, wave = i => Math.sin(time * 4 - i * 0.35) * 3 * s * (i / 10);
    c.fillStyle = "#e30a17";
    c.beginPath(); c.moveTo(x, top);
    for (let i = 0; i <= 10; i++) c.lineTo(x + fw * i / 10, top + wave(i));
    for (let i = 10; i >= 0; i--) c.lineTo(x + fw * i / 10, top + fh + wave(i));
    c.closePath(); c.fill();
    const mx = x + fw * 0.36, my = top + fh / 2 + wave(4);
    c.fillStyle = "#fff"; c.beginPath(); c.arc(mx, my, fh * 0.25, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#e30a17"; c.beginPath(); c.arc(mx + fh * 0.07, my, fh * 0.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#fff"; c.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? fh * 0.05 : fh * 0.12, a = i * Math.PI / 5; c.lineTo(mx + fh * 0.3 + Math.cos(a) * r, my + Math.sin(a) * r); }
    c.closePath(); c.fill();
}

// Kaçak Saray (Beştepe): uzun kanatlar, sütunlu bloklar, ortada sivri kemerli büyük giriş, bayraklar
function drawPalace(c, cx, by, s, time) {
    const stone = "#efe4cc", shade = "#cdbb96", gap = "#5b4636";
    const glow = c.createRadialGradient(cx, by - 90 * s, 20 * s, cx, by - 90 * s, 560 * s);
    glow.addColorStop(0, "rgba(253,186,116,0.4)"); glow.addColorStop(1, "rgba(253,186,116,0)");
    c.fillStyle = glow; c.fillRect(cx - 560 * s, by - 650 * s, 1120 * s, 760 * s);
    const lit = (i, j) => hash(i * 13.7 + j * 3.1) > 0.35 + 0.15 * Math.sin(time * 0.5 + i);

    // Yan kanatlar: iki katlı, sıra sıra pencereler
    [-1, 1].forEach(side => {
        const w = 400 * s, left = side < 0 ? cx - 130 * s - w : cx + 130 * s;
        c.fillStyle = stone; c.fillRect(left, by - 84 * s, w, 64 * s);
        c.fillStyle = shade; c.fillRect(left - 4 * s, by - 92 * s, w + 8 * s, 8 * s);
        for (let r = 0; r < 2; r++)
            for (let k = 0; k < 17; k++) {
                c.fillStyle = lit(k * side, r) ? "rgba(253,224,71,0.9)" : "#6b5a48";
                c.fillRect(left + 10 * s + k * 23 * s, by - 74 * s + r * 26 * s, 11 * s, 16 * s);
            }
    });
    // Sütunlu orta bloklar
    [-1, 1].forEach(side => {
        const w = 180 * s, left = side < 0 ? cx - 250 * s : cx + 70 * s;
        c.fillStyle = gap; c.fillRect(left, by - 160 * s, w, 140 * s);
        c.fillStyle = "rgba(253,224,71,0.45)"; c.fillRect(left, by - 150 * s, w, 128 * s);
        c.fillStyle = stone;
        for (let k = 0; k <= 9; k++) c.fillRect(left + k * 20 * s - 3 * s, by - 160 * s, 10 * s, 140 * s);
        c.fillStyle = shade; c.fillRect(left - 6 * s, by - 172 * s, w + 12 * s, 14 * s);
        c.fillStyle = stone; c.fillRect(left - 6 * s, by - 176 * s, w + 12 * s, 5 * s);
    });
    // Orta giriş bloğu: en yüksek, sivri kemerli altın giriş
    c.fillStyle = stone; c.fillRect(cx - 72 * s, by - 236 * s, 144 * s, 216 * s);
    c.fillStyle = shade; c.fillRect(cx - 80 * s, by - 248 * s, 160 * s, 14 * s);
    const arch = c.createLinearGradient(0, by - 210 * s, 0, by - 20 * s);
    arch.addColorStop(0, "#fde68a"); arch.addColorStop(0.5, "#d97706"); arch.addColorStop(1, "#78350f");
    c.fillStyle = arch;
    c.beginPath();
    c.moveTo(cx - 44 * s, by - 20 * s); c.lineTo(cx - 44 * s, by - 150 * s);
    c.quadraticCurveTo(cx - 44 * s, by - 192 * s, cx, by - 212 * s);
    c.quadraticCurveTo(cx + 44 * s, by - 192 * s, cx + 44 * s, by - 150 * s);
    c.lineTo(cx + 44 * s, by - 20 * s); c.closePath(); c.fill();
    c.strokeStyle = "rgba(120,53,15,0.6)"; c.lineWidth = 1.5 * s;      // mukarnas süslemesi
    for (let r = 0; r < 4; r++)
        for (let k = -2 + (r % 2) * 0.5; k <= 2; k++) { c.beginPath(); c.arc(cx + k * 16 * s, by - 168 * s + r * 12 * s, 7 * s, Math.PI, 0); c.stroke(); }
    c.fillStyle = "#1c1208"; c.fillRect(cx - 20 * s, by - 80 * s, 40 * s, 60 * s);   // kapı
    c.fillStyle = "rgba(253,224,71,0.8)"; c.fillRect(cx - 16 * s, by - 76 * s, 32 * s, 56 * s);
    // Teras, merdivenler, isim tabelası
    c.fillStyle = shade; c.fillRect(cx - 560 * s, by - 20 * s, 1120 * s, 10 * s);
    c.fillStyle = stone;
    for (let k = 0; k < 4; k++) c.fillRect(cx - (60 + k * 16) * s, by - 10 * s + k * 6 * s, (120 + k * 32) * s, 6 * s);
    c.font = `bold ${Math.max(10, 16 * s)}px Arial`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillStyle = "#fde68a"; c.fillText(bgT("KAÇAK SARAY"), cx, by + 30 * s);
    // Bayraklar
    drawTurkishFlag(c, cx, by - 248 * s, s, time);
    drawTurkishFlag(c, cx - 250 * s, by - 176 * s, s * 0.8, time + 1);
    drawTurkishFlag(c, cx + 250 * s, by - 176 * s, s * 0.8, time + 2);
}

function drawIntro(now) {
    const c = ictx, W = introW, H = introH, time = (now - introT0) / 1000;
    if (!introSky) {
        introSky = c.createLinearGradient(0, 0, 0, H);
        [["#0b1026", 0], ["#3b1d6e", 0.4], ["#9d1d5a", 0.62], ["#f97316", 0.8]].forEach(([col, p]) => introSky.addColorStop(p, col));
    }
    c.fillStyle = introSky; c.fillRect(0, 0, W, H);
    c.fillStyle = "#fff";                                               // yıldızlar
    for (let i = 0; i < 90; i++) {
        c.globalAlpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * (1 + hash(i) * 2) + i));
        c.fillRect(hash(i + 0.3) * W, hash(i + 0.7) * H * 0.45, 1.6, 1.6);
    }
    c.globalAlpha = 1;
    const mx = W * 0.14, my = H * 0.16, mr = Math.min(W, H) * 0.05;     // hilal
    c.fillStyle = "#fef3c7"; c.beginPath(); c.arc(mx, my, mr, 0, Math.PI * 2); c.fill();
    c.fillStyle = introSky; c.beginPath(); c.arc(mx + mr * 0.35, my - mr * 0.1, mr * 0.85, 0, Math.PI * 2); c.fill();

    // Uzak Ankara tepeleri ve şehir ışıkları
    const hillY = x => H * 0.6 - 40 * (1 + ridge(x * 1.6, 3.3));
    c.fillStyle = "#24163a"; c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W + 10; x += 10) c.lineTo(x, hillY(x));
    c.lineTo(W, H); c.closePath(); c.fill();
    for (let i = 0; i < 160; i++) {
        const x = hash(i * 2.3) * W, y = hillY(x) + 6 + hash(i * 5.1) * H * 0.12;
        c.fillStyle = hash(i) > 0.5 ? "rgba(253,224,71,0.8)" : "rgba(255,237,213,0.6)";
        c.fillRect(x, y, 2, 2);
    }
    // Beştepe ve saray
    const s = Math.min(W / 1250, H / 720), px = W * 0.5, py = H * 0.66;
    c.fillStyle = "#1a1030";
    c.beginPath(); c.moveTo(px - 700 * s, H); c.quadraticCurveTo(px - 520 * s, py - 30 * s, px, py - 24 * s); c.quadraticCurveTo(px + 520 * s, py - 30 * s, px + 700 * s, H); c.closePath(); c.fill();
    drawPalace(c, px, py, s, time);

    // Gökten dolar yağar
    c.globalAlpha = 0.85;
    for (let i = 0; i < 14; i++) {
        const sp = 35 + hash(i + 1.1) * 45, y = ((time * sp + hash(i + 2.2) * H) % (H * 0.95)) - 30;
        drawDollarBill(c, hash(i + 3.3) * W + Math.sin(time + i) * 20, y, 12 + hash(i) * 8, Math.sin(time * 2 + i));
    }
    c.globalAlpha = 1;

    // Ön plan: yol
    const gy = H * 0.94, cs = H / 950;
    c.fillStyle = "#1f1a24"; c.fillRect(0, gy, W, H - gy);
    c.fillStyle = "#3f3a46"; c.fillRect(0, gy, W, 5);

    // Kul hakkı torbaları yoldan saraya uçar
    for (let i = 0; i < 6; i++) {
        const k = ((time / 3.6 + i / 6) % 1);
        const sx = hash(i * 7.7 + Math.floor(time / 3.6 + i / 6)) * W, sy = gy - 30;
        const ex = px, ey = py - 50 * s, cx = (sx + ex) / 2, cy = py - 330 * s;
        const x = (1 - k) * (1 - k) * sx + 2 * (1 - k) * k * cx + k * k * ex;
        const y = (1 - k) * (1 - k) * sy + 2 * (1 - k) * k * cy + k * k * ey;
        c.globalAlpha = k > 0.9 ? (1 - k) * 10 : 1;
        drawKulHakkiBag(c, x, y, (46 - 32 * k) * cs * 1.3, Math.sin(time * 3 + i) * 0.4);
    }
    c.globalAlpha = 1;

    // Yürüyen karakterler (birimler: zemin y=0, ölçek cs)
    c.save(); c.translate(0, gy); c.scale(cs, cs);
    const span = W / cs + 900, pos = (sp, off) => ((time * sp + off) % span + span) % span - 450;
    const rx = pos(130, 950);   // sayfa açılınca Recep ve polisler ekranda başlasın
    c.save(); c.translate(rx, 0);
    drawRecep(c, { h: 180, phase: rx * 0.06, moving: true, airborne: false, mouthOpen: 0, hammerAngle: HAMMER_IDLE, shield: false, dir: 1 });
    c.restore();
    [[rx - 280, 1.7], [rx - 450, 0.4]].forEach(([x, ph]) =>
        drawPolice(c, { x: x - 60, y: -200, w: 120, h: 200, dir: 1, walkCycle: x * 0.05 + ph, lastSpeed: 1 }));
    [[700, 0], [1050, 2]].forEach(([off, ph]) => {
        const x = span - 900 - pos(70, off);
        drawPolice(c, { x: x - 60, y: -200, w: 120, h: 200, dir: -1, walkCycle: time * 4 + ph, lastSpeed: 1 });
    });
    const fx = span - 900 - pos(45, 1500);
    const FT = BOSS_TYPES.feto;
    drawFeto(c, { T: FT, x: fx - FT.w / 2, y: -FT.h, w: FT.w, h: FT.h, look: -1, run: fx * 0.03, state: 'walk', stateT: 0, recover: 0, hurt: 0, dying: false, deathT: 0 });
    c.restore();
}

function introLoop(now) {
    drawIntro(now);
    introRAF = requestAnimationFrame(introLoop);
}

function updateSoundBtn() {
    const b = document.getElementById('sound-btn');
    if (b) b.textContent = t(b.dataset.on ? 'soundOff' : 'soundOn');
}
function setIntroSound(on) {
    const b = $('sound-btn');
    if (!b) return;
    b.dataset.on = on ? '1' : '';
    updateSoundBtn();
    const m = $('intro-music');
    m.volume = 0.35;
    if (on) m.play().catch(() => {}); else m.pause();
}
function removeIntro() {
    if (introRAF) cancelAnimationFrame(introRAF);
    introRAF = null;
    $('intro-music').pause();
    ['intro-video', 'sound-btn'].forEach(id => { const el = $(id); if (el) el.remove(); });
}
