// Canavar sonrası ara sahne (teyzelerden önce): canlı yayın çerçevesinde fotoğraf + ses + alt yazı
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// Ekranın ortasına canlı yayın çerçevesinde bir fotoğraf zıplayarak gelir, ses kaydı çalar, alt yazı harf harf düşer.
const BOSS_OUTROS = {
    2: { img: 'resimler/yalarim.png', sfx: 'yalarim', caption: 'YALARIM!' }
};
const outroImgs = {};
Object.values(BOSS_OUTROS).forEach(o => { const im = new Image(); im.src = o.img; outroImgs[o.img] = im; });
let outro = null;   // { O, t (kare), start (sesin başladığı kare), len (ses + kuyruk, kare), cx }
const OUTRO_IN = 15, OUTRO_OUT = 21;   // giriş ve çıkış animasyonu (kare)

function updateOutro() {
    if (!outro) return;
    const o = outro;
    o.t++;
    if (o.t === o.start - OUTRO_IN) camShake = Math.max(camShake, 8);
    if (o.t === o.start) {
        const d = playSfx(o.O.sfx, { vol: 1 });
        o.len = Math.round((d || 3) * 60) + OUTRO_OUT;   // ses yüklenmediyse 3 sn göster
    }
    if (o.len && o.t >= o.start + o.len) { outro = null; celebrate(o.cx, 0.2); }
}

function drawBossOutro(ctx) {
    const o = outro;
    if (!o || o.t < o.start - OUTRO_IN) return;
    const a = (o.t - o.start + OUTRO_IN) / 60;                      // girişten beri geçen süre (sn)
    const left = o.len ? (o.start + o.len - o.t) / 60 : 99;        // kalan süre (sn)
    const out = Math.max(0, Math.min(1, left / (OUTRO_OUT / 60)));  // çıkışta 1 → 0
    const vis = Math.min(1, a / 0.25) * out;
    const talking = o.len && left > OUTRO_OUT / 60 && a > OUTRO_IN / 60;
    const cx = width / 2, cy = height * 0.42;

    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${0.5 * vis})`; ctx.fillRect(0, 0, width, height);
    // arkada dönen çizgi roman ışınları
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a * 0.5); ctx.globalAlpha = 0.5 * vis;
    const R = Math.hypot(width, height);
    for (let i = 0; i < 16; i++) {
        ctx.fillStyle = i % 2 ? "#f59e0b" : "#fde047";
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, i * Math.PI / 8, (i + 1) * Math.PI / 8); ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // fotoğraf: geri yaylanarak büyür, konuşurken titrer, çıkışta küçülür
    const im = outroImgs[o.O.img];
    const s0 = Math.min(1, a / 0.45), k = s0 - 1, pop = 1 + 2.7 * k * k * k + 1.7 * k * k;
    const ph = Math.min(height * 0.5, 320), pw = ph * (im.naturalWidth ? im.naturalWidth / im.naturalHeight : 1.36);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(a * 2.2) * 0.05 + (1 - out) * 0.6);
    ctx.scale(pop * out, pop * out * (talking ? 1 + Math.abs(Math.sin(a * 14)) * 0.035 : 1));
    ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.fillRect(-pw / 2 - 4, -ph / 2 + 4, pw + 24, ph + 24);   // gölge
    ctx.fillStyle = "#fff"; ctx.fillRect(-pw / 2 - 12, -ph / 2 - 12, pw + 24, ph + 24);             // beyaz çerçeve
    if (im.complete && im.naturalWidth) ctx.drawImage(im, -pw / 2, -ph / 2, pw, ph);
    else { ctx.fillStyle = "#333"; ctx.fillRect(-pw / 2, -ph / 2, pw, ph); }
    // "CANLI" bandı (yanıp söner)
    ctx.fillStyle = "#dc2626"; ctx.fillRect(-pw / 2 + 10, -ph / 2 + 10, 104, 30);
    if (Math.floor(a * 2.5) % 2 === 0) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-pw / 2 + 25, -ph / 2 + 25, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#fff"; ctx.font = "bold 18px Arial"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(t("live"), -pw / 2 + 38, -ph / 2 + 26);
    ctx.restore();

    // alt yazı: harfler sırayla yukarıdan düşer ve sallanır
    const cap = o.O.caption, fs = Math.min(72, width / (cap.length * 0.8));
    ctx.font = `900 ${fs}px Arial`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const total = ctx.measureText(cap).width;
    let x = cx - total / 2;
    const ty = cy + ph / 2 + 30 + fs / 2;
    [...cap].forEach((ch, i) => {
        const w = ctx.measureText(ch).width, lt = a - 0.35 - i * 0.07;
        if (lt > 0) {
            const drop = Math.max(0, 1 - lt / 0.25), y = ty - drop * drop * 120 + Math.sin(a * 8 + i) * 4;
            ctx.save(); ctx.globalAlpha = out; ctx.translate(x + w / 2, y); ctx.rotate(Math.sin(a * 6 + i * 1.7) * 0.12);
            ctx.lineWidth = 8; ctx.strokeStyle = "#000"; ctx.strokeText(ch, 0, 0);
            ctx.fillStyle = i % 2 ? "#fde047" : "#f97316"; ctx.fillText(ch, 0, 0);
            ctx.restore();
        }
        x += w;
    });
    ctx.restore();
    ctx.textBaseline = "alphabetic";
}
