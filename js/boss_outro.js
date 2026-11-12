// Canavar sonrası ara sahne: bir karakter sağ üst köşeden kafasını uzatır, ses kaydı çalar, sözleri konuşma balonunda yazılır
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// Her bölüm için bölüm sonu karakteri. Yeni bölüm eklemek için:
//   1) resmi resimler/ klasörüne koy (ör. resimler/bolumsonu3.png), 2) sesi sfx/ klasörüne koy ve audio.js'teki SFX_FILES'a ekle,
//   3) buraya bir satır yaz: <bölüm>: { img, sfx, bubble (balonda yazan söz), grannies (ardından teyzeler gelsin mi) }
// style: 'walk' → resim köşeden uzanmaz; karakter (draw) sağdan yürüyerek oyuncunun yanına gelir, balon başının üstünde çıkar.
// style: 'custom' → { update(o), draw(ctx, o) } bölüm kendi sahnesini oynatır, bitince completeLevel çağırır.
// fxUpdate/fxDraw: ara sahneye eklenen bölüme özel animasyon. style: 'self' → başka karakter gelmez; yalnızca HIRHIZ konuşur (pre), sonra bölüm biter.
// bubble: yazı ya da dile göre yazı veren fonksiyon. pre: { sfx, bubble } → karakter gelmeden önce HIRHIZ konuşur (balon başının üstünde).
const BOSS_OUTROS = {
    2: { img: 'resimler/yalarim.png', sfx: 'yalarim', bubble: 'YALARIM, ISTIRIRIM bi de..', grannies: false },
    3: { img: 'resimler/cengiz.png', style: 'walk', draw: drawCengiz, sfx: 'cengiz', bubble: 'Bu milletin a. koyacağız', grannies: false },
    // 4. bölüm js/temmuz.js'te
    5: { style: 'self', pre: { sfx: 'lutuf', bubble: () => t("lutufSay") } }   // DARBE TANKI yenilince HIRHIZ: "15 Temmuz Allah'ın bir lütfü!"
};
const outroImgs = {};
Object.values(BOSS_OUTROS).forEach(o => { if (!o.img) return; const im = new Image(); im.src = o.img; outroImgs[o.img] = im; });
const bubbleText = b => typeof b === 'function' ? b() : b;
let outro = null;   // { O, t (kare), start (sesin başladığı kare), len (ses + kuyruk, kare), cx }
const OUTRO_IN = 40, OUTRO_OUT = 30;   // kayarak giriş ve çıkış (kare)

function updateOutro() {
    if (!outro) return;
    const o = outro;
    o.t++;
    if (o.O.style === 'custom') { o.O.update(o); return; }   // bölüm kendi sahnesini oynatır (ör. 8. bölüm: mezar)
    if (o.O.fxUpdate) o.O.fxUpdate(o);   // bölüme özel ek animasyon (ör. 6. bölüm: haşhaşiler ve sülükler)
    if (o.O.pre && updatePreOutro(o)) return;
    if (o.O.style === 'self') { outro = null; completeLevel(); return; }   // yalnızca HIRHIZ konuşur, sonra bölüm biter
    if (o.O.style === 'walk') { updateWalkOutro(o); return; }
    if (o.t === o.start) {
        const d = playSfx(o.O.sfx, { vol: 1 });
        o.voice = Math.round((d || 2.5) * 60);
        o.len = o.voice + 60 + OUTRO_OUT;   // ses + balon biraz daha ekranda kalır + çıkış (ses yüklenmediyse 2,5 sn)
    }
    if (o.len && o.t >= o.start + o.len) {
        outro = null;
        if (o.O.grannies === false) setTimeout(completeLevel, 400);   // teyzeler gelmez, bölüm biter
        else celebrate(o.cx, 0.2);
    }
}

const easeOutBack = v => { const k = v - 1; return 1 + 2.4 * k * k * k + 1.4 * k * k; };

function drawBossOutro(ctx) {
    const o = outro;
    if (!o) return;
    if (o.O.style === 'custom') { o.O.draw(ctx, o); return; }
    if (o.O.fxDraw) o.O.fxDraw(ctx, o);
    if (o.pre) drawPreOutro(ctx, o);
    if (o.O.style === 'self') return;
    if (o.O.style === 'walk') { drawWalkOutro(ctx, o); return; }
    const enterT = o.t - (o.start - OUTRO_IN);           // girişten beri geçen kare
    if (enterT < 0) return;
    const im = outroImgs[o.O.img];
    const ph = Math.min(height * 0.42, 250), pw = ph * (im.naturalWidth ? im.naturalWidth / im.naturalHeight : 1.36);
    const inK = easeOutBack(Math.min(1, enterT / OUTRO_IN));
    const left = o.len ? o.start + o.len - o.t : 1e9;      // kalan kare
    const outK = left < OUTRO_OUT ? 1 - left / OUTRO_OUT : 0;
    const k = inK * (1 - outK * outK);                    // 0: köşenin dışında, 1: yerinde
    const talking = o.len && o.t >= o.start && o.t < o.start + o.voice;
    const sec = o.t / 60;

    // Dinlenme yeri: sağ üst köşe, resmin sağ üstü ekranın dışına taşar; kafasını eğerek bakar
    const restX = width - pw * 0.42, restY = ph * 0.42;
    const fromX = width + pw * 0.7, fromY = -ph * 0.7;
    const x = fromX + (restX - fromX) * k, y = fromY + (restY - fromY) * k;
    const tilt = -0.32 + Math.sin(sec * 2.3) * 0.04 + (talking ? Math.sin(sec * 18) * 0.025 : 0);

    ctx.save();
    ctx.translate(x, y); ctx.rotate(tilt);
    if (talking) ctx.scale(1, 1 + Math.abs(Math.sin(sec * 14)) * 0.03);
    ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(-pw / 2 - 2, -ph / 2 + 8, pw + 16, ph + 16);   // gölge
    ctx.fillStyle = "#fff"; ctx.fillRect(-pw / 2 - 8, -ph / 2 - 8, pw + 16, ph + 16);              // beyaz çerçeve
    if (im.complete && im.naturalWidth) ctx.drawImage(im, -pw / 2, -ph / 2, pw, ph);
    else { ctx.fillStyle = "#333"; ctx.fillRect(-pw / 2, -ph / 2, pw, ph); }
    ctx.restore();

    // Konuşma balonu: kafanın solunda-altında, kuyruğu kafaya bakar; sözler sesle birlikte harf harf yazılır
    const text = o.O.bubble;
    if (!text || o.t < o.start || k < 0.6) return;
    const shown = talking ? Math.max(1, Math.ceil(text.length * (o.t - o.start) / Math.max(1, o.voice * 0.85))) : text.length;
    const fs = Math.max(18, Math.min(30, width / 34));
    ctx.save();
    ctx.globalAlpha = Math.min(1, k);
    ctx.font = `900 ${fs}px Arial`;
    const lines = wrapBubble(ctx, text, Math.min(width * 0.55, 560));
    const lh = fs * 1.25, bw = Math.max(...lines.map(l => ctx.measureText(l).width)) + fs * 1.4, bh = lines.length * lh + fs * 0.9;
    const bx = Math.max(10, x - pw * 0.55 - bw), by = y + ph * 0.18;
    const pop = Math.min(1, (o.t - o.start) / 10), bounce = 1 + (1 - pop) * 0.25;
    ctx.translate(bx + bw, by); ctx.scale(pop * bounce, pop * bounce); ctx.translate(-bx - bw, -by);
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#000"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 18); ctx.fill(); ctx.stroke();
    ctx.beginPath();                                                      // kuyruk
    ctx.moveTo(bx + bw - 30, by + 4); ctx.lineTo(x - pw * 0.3, y + ph * 0.05); ctx.lineTo(bx + bw - 6, by + 22);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.fillRect(bx + bw - 34, by + 3, 32, 22);   // kuyruğun dibindeki çizgiyi kapat
    ctx.fillStyle = "#111827"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    let left2 = shown;
    lines.forEach((l, i) => {
        const part = l.slice(0, Math.max(0, left2)); left2 -= l.length + 1;
        ctx.fillText(part, bx + fs * 0.7, by + fs * 0.45 + lh * (i + 0.5));
    });
    ctx.restore();
    ctx.textBaseline = "alphabetic";
}
// --- YÜRÜYEREK GELEN KARAKTER (ör. 3. bölüm: Cengiz) ---
// Sağdan yürüyerek oyuncunun yanına gelir, durur, sesi çalar, sözleri başının üstündeki balonda yazılır; sonra bölüm biter.
function updateWalkOutro(o) {
    if (o.t < o.start) return;
    if (o.wx === undefined) {
        o.wx = camX + width + 80; o.walk = 0;
        o.tx = Math.min(player.x + player.w + 150, camX + width - 120);
    }
    if (!o.arrived) {
        o.wx = Math.max(o.tx, o.wx - 5); o.walk += 0.22;
        if (o.wx <= o.tx) {
            o.arrived = o.t;
            const d = playSfx(o.O.sfx, { vol: 1 });
            o.voice = Math.round((d || 3) * 60);
        }
    } else if (!o.done && o.t >= o.arrived + o.voice + 45) {
        o.done = true;   // karakter ekranda kalır, bölüm sonu ekranı gelir
        if (o.O.grannies === false) completeLevel(); else celebrate(o.cx, 0.2);
    }
}
function drawWalkOutro(ctx, o) {
    if (o.wx === undefined) return;
    const sx = o.wx - camX, gy = height - 60;
    const talking = o.arrived && o.t < o.arrived + o.voice;
    o.O.draw(ctx, sx, gy, o.arrived ? 0 : o.walk, talking ? o.t : 0);
    if (!o.arrived) return;
    drawHeadBubble(ctx, sx, gy - (o.O.bubbleY || 230), bubbleText(o.O.bubble), o.t - o.arrived, o.voice, talking);
}
// Başın üstünde konuşma balonu (sx: konuşanın ekran x'i, top: balonun alt kenarı); sözler sesle birlikte harf harf yazılır
function drawHeadBubble(ctx, sx, top, text, el, voice, talking) {
    const shown = talking ? Math.max(1, Math.ceil(text.length * el / Math.max(1, voice * 0.8))) : text.length;
    const fs = 26;
    ctx.save();
    ctx.font = `900 ${fs}px Arial`;
    const lines = wrapBubble(ctx, text, 340);
    const lh = fs * 1.25, bw = Math.max(...lines.map(l => ctx.measureText(l).width)) + fs * 1.4, bh = lines.length * lh + fs * 0.9;
    const bx = Math.max(10, Math.min(sx - bw * 0.7, width - bw - 10)), by = top - bh;
    const pop = Math.min(1, el / 10);
    ctx.translate(sx, by + bh); ctx.scale(pop, pop); ctx.translate(-sx, -by - bh);
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#000"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 18); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx - 18, by + bh - 2); ctx.lineTo(sx - 4, by + bh + 26); ctx.lineTo(sx + 10, by + bh - 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.fillRect(sx - 16, by + bh - 6, 24, 6);
    ctx.fillStyle = "#111827"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    let left = shown;
    lines.forEach((l, i) => { ctx.fillText(l.slice(0, Math.max(0, left)), bx + fs * 0.7, by + fs * 0.45 + lh * (i + 0.5)); left -= l.length + 1; });
    ctx.restore();
    ctx.textBaseline = "alphabetic";
}
// --- ÖNCE HIRHIZ KONUŞUR (O.pre): sesi çalar, sözleri başının üstündeki balonda; bitince asıl ara sahne başlar ---
// Dönüş: true → ön konuşma sürüyor
function updatePreOutro(o) {
    if (o.preDone) return false;
    if (o.t < o.start) return true;
    if (!o.pre) { o.pre = { at: o.t }; o.pre.voice = Math.round((playSfx(o.O.pre.sfx, { vol: 1 }) || 3) * 60); }
    const el = o.t - o.pre.at;
    if (el < o.pre.voice) player.mouthOpen = 0.35 + 0.35 * Math.abs(Math.sin(el * 0.4));   // HIRHIZ'ın ağzı oynar
    if (el >= o.pre.voice + 40) { o.preDone = true; o.pre = null; o.start = o.t + 20; }
    return true;
}
function drawPreOutro(ctx, o) {
    const el = o.t - o.pre.at;
    drawHeadBubble(ctx, player.x + player.w / 2 - camX, player.y - 20, bubbleText(o.O.pre.bubble), el, o.pre.voice, el < o.pre.voice);
}

// Cengiz: fotoğraftan oval kesilmiş kafa, koyu takım elbise, kravat, kollar göğüste kavuşturulmuş (fotoğraftaki gibi)
let cengizHead = null;
function cengizHeadCanvas() {
    if (cengizHead) return cengizHead;
    const im = outroImgs['resimler/cengiz.png'];
    if (!im || !im.complete || !im.naturalWidth) return null;
    const c = document.createElement('canvas'); c.width = 88; c.height = 112;
    const x = c.getContext('2d');
    x.beginPath(); x.ellipse(44, 53, 37, 51, 0, 0, Math.PI * 2); x.clip();
    x.drawImage(im, 50, 22, 88, 112, 0, 0, 88, 112);   // fotoğrafta kafanın kutusu
    return (cengizHead = c);
}
function drawCengiz(ctx, x, gy, walk, talkT) {
    ctx.save();
    ctx.translate(x, gy);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const bob = walk ? Math.abs(Math.sin(walk)) * 3 : 0;
    // bacaklar ve ayakkabılar
    [-1, 1].forEach(s => {
        const a = walk ? Math.sin(walk + (s > 0 ? 0 : Math.PI)) * 0.4 : 0;
        const fx = Math.sin(a) * 66 + s * 10, fy = -Math.cos(a) * 66 + 66;
        ctx.strokeStyle = "#27272a"; ctx.lineWidth = 20;
        ctx.beginPath(); ctx.moveTo(s * 10, -66 - bob); ctx.lineTo(fx, fy - 6); ctx.stroke();
        ctx.fillStyle = "#0a0a0a"; ctx.beginPath(); ctx.ellipse(fx - 6, fy - 4, 15, 6, 0, 0, Math.PI * 2); ctx.fill();
    });
    ctx.translate(0, -bob);
    // gövde: ceket, beyaz gömlek, koyu kravat
    ctx.fillStyle = "#3f3f46"; ctx.beginPath(); ctx.roundRect(-34, -150, 68, 92, 14); ctx.fill();
    ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.moveTo(-14, -150); ctx.lineTo(14, -150); ctx.lineTo(0, -112); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#1f2937"; ctx.beginPath(); ctx.moveTo(-5, -146); ctx.lineTo(5, -146); ctx.lineTo(7, -116); ctx.lineTo(0, -108); ctx.lineTo(-7, -116); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#27272a"; ctx.lineWidth = 3;   // yakalar
    ctx.beginPath(); ctx.moveTo(-15, -150); ctx.lineTo(-4, -114); ctx.moveTo(15, -150); ctx.lineTo(4, -114); ctx.stroke();
    // göğüste kavuşturulmuş kollar
    ctx.strokeStyle = "#52525b"; ctx.lineWidth = 18;
    ctx.beginPath(); ctx.moveTo(-32, -140); ctx.lineTo(-30, -100); ctx.lineTo(16, -104); ctx.stroke();
    ctx.strokeStyle = "#3f3f46";
    ctx.beginPath(); ctx.moveTo(32, -140); ctx.lineTo(30, -96); ctx.lineTo(-16, -94); ctx.stroke();
    ctx.fillStyle = "#e0a98a";
    ctx.beginPath(); ctx.arc(20, -104, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-20, -94, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#cbd5e1"; ctx.fillRect(10, -100, 8, 6);   // saat
    // kafa: fotoğraftan; konuşurken hafif sallanır
    const hc = cengizHeadCanvas();
    ctx.save();
    ctx.translate(0, -150);
    if (talkT) ctx.rotate(Math.sin(talkT * 0.35) * 0.05);
    if (hc) ctx.drawImage(hc, -40, -98, 80, 102);
    else { ctx.fillStyle = "#e0a98a"; ctx.beginPath(); ctx.ellipse(0, -48, 38, 48, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.restore();
}

// Balon metnini satırlara böl
function wrapBubble(ctx, text, maxW) {
    const words = text.split(' '), lines = [];
    let cur = '';
    words.forEach(w => {
        const next = cur ? cur + ' ' + w : w;
        if (cur && ctx.measureText(next).width > maxW) { lines.push(cur); cur = w; } else cur = next;
    });
    if (cur) lines.push(cur);
    return lines;
}
