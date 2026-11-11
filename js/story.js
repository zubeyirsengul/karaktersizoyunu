// Bölüm girişi hikâyeleri: blok (piksel) tarzı karakterlerle resimli, yazılı ara sahneler
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)
//
// Her bölümden önce bir kez oynar. Dokun / Enter / Boşluk: yazıyı tamamla, sonra sonraki sahne. GEÇ ya da ESC: atla.
// Yüzler fotoğraflardan kırpılıp küçük bir ızgaraya indirilir ve büyütülerek çizilir (kare kare blok görünüm).
// Karakterler: story_faces.js, sahneler: story_scenes.js, metinler: story_text.js

// --- OYNATICI ---
let story = null;   // { level, i, t0, chars, done }
const storyEl = $('story'), storyCanvas = $('story-canvas'), sctx = storyCanvas.getContext('2d');
let storyDone = {};

function playStory(level, onDone) {
    if (storyDone[level] || !STORIES[level]) { onDone(); return; }
    storyDone[level] = true;
    story = { level, i: 0, t0: performance.now(), shown: 0, onDone, raf: 0 };
    storyEl.style.display = 'block';
    resizeStory();
    story.raf = requestAnimationFrame(storyLoop);
    storyVoice();
}
function storyScene() { return STORIES[story.level][story.i]; }
// Seslendirilmiş replikler: say.key → ses kaydı (bölüm dosyaları ekler, ör. js/selo.js)
const STORY_VOICES = {};
function storyVoice() {
    stopVoice();
    const sc = storyScene(), v = sc.say && STORY_VOICES[sc.say.key];
    if (v) playVoice(v);
}
function storyFullText(sc) { return sc.card ? storyT(sc.card.text) : storyT(sc.say.key); }

function storyNext() {
    if (!story) return;
    const sc = storyScene(), full = storyFullText(sc);
    if (story.shown < full.length) { story.shown = full.length; return; }   // önce yazıyı tamamla
    if (story.i < STORIES[story.level].length - 1) { story.i++; story.t0 = performance.now(); story.shown = 0; storyVoice(); }
    else endStory();
}
function endStory() {
    if (!story) return;
    cancelAnimationFrame(story.raf);
    const cb = story.onDone;
    stopVoice();
    story = null;
    storyEl.style.display = 'none';
    cb();
}
function storyKey(e) {
    if (e.key === 'Escape') endStory();
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); storyNext(); }
}

let storyView = { s: 1, ox: 0, oy: 0, w: 0, h: 0 };
function resizeStory() {
    const dpr = window.devicePixelRatio || 1, w = window.innerWidth, h = window.innerHeight;
    storyCanvas.width = Math.round(w * dpr); storyCanvas.height = Math.round(h * dpr);
    const s = Math.min(w / STORY_W, h / STORY_H);
    storyView = { s, ox: (w - STORY_W * s) / 2, oy: (h - STORY_H * s) / 2, w, h, dpr };
}

function storyLoop(now) {
    if (!story) return;
    story.raf = requestAnimationFrame(storyLoop);
    const sc = storyScene(), el = (now - story.t0) / 1000, time = now / 1000;
    const full = storyFullText(sc);
    if (el > 0.4) story.shown = Math.min(full.length, Math.max(story.shown, Math.floor((el - 0.4) * 38)));

    const { s, ox, oy, w, h, dpr } = storyView, c = sctx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
    c.save();
    c.translate(ox, oy); c.scale(s, s);
    c.beginPath(); c.rect(0, 0, STORY_W, STORY_H); c.clip();

    // Kamera: sahne boyunca çok yavaş yakınlaşır (kart sahnelerinde sabit)
    if (!sc.card) {
        const z = 1 + Math.min(1, el / 7) * 0.035;
        c.translate(STORY_W / 2, STORY_GROUND - 120); c.scale(z, z); c.translate(-STORY_W / 2, -(STORY_GROUND - 120));
    }
    STORY_BG[sc.bg](c, time);
    (sc.props || []).forEach(p => { if (p !== 'bars') STORY_PROPS[p](c, time); });
    // oyuncular: 'to' varsa 2 saniyede yürüyerek gelir
    const speaking = story.shown < full.length;
    (sc.actors || []).forEach((a, k) => {
        const walkT = a.to !== undefined ? Math.min(1, el / (a.dur || 2)) : 1;
        const x = a.to !== undefined ? a.x + (a.to - a.x) * walkT : a.x;
        const walking = a.to !== undefined && walkT < 1;
        const lift = a.jump ? Math.abs(Math.sin(time * 6 + k)) * 40 : 0;
        // yürürken adım adım sekme, dururken blok blok nefes alma
        const bob = walking ? Math.round(Math.abs(Math.sin(el * 10)) * 1.5) * PX : (Math.floor(time * 1.6 + k * 0.7) % 2) * 2;
        const y = STORY_GROUND - lift - bob;
        storyShadow(c, x, a.scale || 1, lift);
        if (walking) storyDust(c, x, a.dir || 1, el, k);
        drawBlockPerson(c, { ...a, x, y, walking, walk: el * 10, talk: a.talk && !walking && speaking }, time);
        if (!walking && isSpeaker(sc, a)) storySpeakerArrow(c, x, y, a.scale || 1, time);
    });
    if ((sc.props || []).includes('bars')) STORY_PROPS.bars(c, time);   // parmaklık karakterlerin önünde

    if (sc.sepia) {   // geçmişe dönüş: eski fotoğraf rengi
        c.globalCompositeOperation = 'color'; c.fillStyle = '#a0784a'; c.fillRect(0, 0, STORY_W, STORY_H);
        c.globalCompositeOperation = 'source-over';
        c.fillStyle = '#fde68a'; c.font = 'bold 22px monospace'; c.textAlign = 'right'; c.textBaseline = 'alphabetic';
        c.fillText(storyT('flashback'), STORY_W - 20, STORY_H - 16);
    }
    c.restore(); c.save();
    c.translate(ox, oy); c.scale(s, s);
    c.beginPath(); c.rect(0, 0, STORY_W, STORY_H); c.clip();
    if (sc.card) drawStoryCard(c, sc, el);
    else drawStoryBox(c, sc, full, el);
    storyWipe(c, el);
    c.restore();

    // sahne sırası noktaları
    const n = STORIES[story.level].length;
    for (let i = 0; i < n; i++) { c.fillStyle = i === story.i ? '#fbbf24' : 'rgba(255,255,255,0.35)'; c.fillRect(ox + 16 + i * 16, oy + STORY_H * s - 22, 10, 10); }
}

const speakingNow = full => story && story.shown < full.length;
function wrapLines(c, text, maxW) {
    const words = text.split(' '), lines = [];
    let line = '';
    words.forEach(wd => { const tst = line ? line + ' ' + wd : wd; if (c.measureText(tst).width > maxW && line) { lines.push(line); line = wd; } else line = tst; });
    if (line) lines.push(line);
    return lines;
}

// --- SAHNE SÜSLERİ ---
// Sahne açılışı: ekran blok blok, rastgele sırayla açılır
function storyWipe(c, el) {
    const D = 0.45; if (el >= D) return;
    const B = 60; c.fillStyle = '#000';
    for (let j = 0; j < STORY_H / B; j++) for (let i = 0; i < STORY_W / B; i++) {
        const h = storyHash(i * 13 + j * 71 + story.i * 7);
        if (el < D * (0.25 + 0.75 * h)) c.fillRect(i * B, j * B, B, B);
    }
}
// Ayak altında blok gölge (zıplayınca küçülür)
function storyShadow(c, x, s, lift) {
    const w = Math.round((76 - lift * 0.6) * s / PX) * PX;
    c.fillStyle = 'rgba(0,0,0,0.28)';
    c.fillRect(Math.round((x - w / 2) / PX) * PX, STORY_GROUND - PX, w, PX * 2);
}
// Yürürken ayak arkasında kalkan toz blokları
function storyDust(c, x, dir, el, k) {
    for (let n = 0; n < 3; n++) {
        const ph = (el * 2.2 + n / 3 + k * 0.13) % 1;
        const sz = Math.round((1 - ph) * 3) * PX;
        if (!sz) continue;
        c.fillStyle = `rgba(230,220,200,${0.55 * (1 - ph)})`;
        c.fillRect(Math.round((x - dir * (34 + ph * 46)) / PX) * PX, STORY_GROUND - PX - Math.round(ph * 6) * PX, sz, sz);
    }
}
// Konuşan: say.who ile aynı kişi; 'gang' ise dört çete üyesi
function isSpeaker(sc, a) {
    const w = sc.say && sc.say.who;
    if (!w) return false;
    return a.who === w || (w === 'gang' && /^g[1-4]$/.test(a.who));
}
function storySpeakerArrow(c, x, y, s, time) {
    const top = y - (72 + 72 + 104 + 20) * s - Math.round(Math.abs(Math.sin(time * 5)) * 3) * PX;
    c.fillStyle = '#fbbf24';
    [[-3, 0, 6], [-2, 1, 4], [-1, 2, 2]].forEach(([dx, dy, n]) => c.fillRect(x + dx * PX, top + dy * PX, n * PX, PX));
    c.fillStyle = '#7c2d12'; c.fillRect(x - 3 * PX, top - PX, 6 * PX, PX);
}
// Konuşma kutusundaki portre (fotoğraf ya da piksel yüz)
function speakerPortrait(who) {
    const C = STORY_CAST[who === 'gang' ? 'g2' : who];
    if (!C) return null;
    return C.face ? storyFace(C.face) : pixFace(C.pix);
}

function drawStoryBox(c, sc, full, el) {
    const slide = Math.min(1, el / 0.3), ease = 1 - (1 - slide) * (1 - slide);
    const x = 40, y = 16 - (1 - ease) * 170, w = STORY_W - 80, hgt = 132;
    c.fillStyle = 'rgba(0,0,0,0.78)'; c.fillRect(x, y, w, hgt);
    c.strokeStyle = '#fbbf24'; c.lineWidth = 4; c.strokeRect(x, y, w, hgt);
    let ty = y + 40, tx = x + 20;
    const pf = sc.say.who && speakerPortrait(sc.say.who);
    if (pf) {   // sol başta konuşanın portresi
        const ph = 104, pw = Math.min(104, ph * pf.width / pf.height);
        c.fillStyle = '#1f2937'; c.fillRect(x + 12, y + 14, 104, 104);
        c.imageSmoothingEnabled = false;
        c.drawImage(pf, x + 12 + (104 - pw) / 2, y + 14 + (104 - ph) / 2 + (speakingNow(full) ? Math.round(Math.sin(performance.now() / 55)) * 2 : 0), pw, ph);
        c.strokeStyle = '#fbbf24'; c.lineWidth = 3; c.strokeRect(x + 12, y + 14, 104, 104);
        tx = x + 132;
    }
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    if (sc.say.who) {
        c.fillStyle = '#fbbf24'; c.font = 'bold 22px monospace';
        c.fillText(storyT(sc.say.who) + ':', tx, ty); ty += 32;
    }
    c.fillStyle = '#fff'; c.font = 'bold 24px monospace';
    wrapLines(c, full.slice(0, story.shown), x + w - 20 - tx).forEach((ln, i) => c.fillText(ln, tx, ty + i * 30));
    if (story.shown >= full.length && Math.floor(performance.now() / 400) % 2) {
        c.fillStyle = '#fbbf24'; c.font = 'bold 18px monospace'; c.textAlign = 'right';
        c.fillText(storyT('tap'), x + w - 16, y + hgt - 14);
    }
}

function drawStoryCard(c, sc, el) {
    const zoom = Math.min(1, el * 2.5);
    c.save();
    c.translate(STORY_W / 2, 200); c.scale(zoom, zoom);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = 'bold 40px monospace';
    c.lineWidth = 8; c.strokeStyle = '#7c2d12'; c.fillStyle = '#fbbf24';
    const title = storyT(sc.card.title);
    let fs = 40; while (c.measureText(title).width > STORY_W - 60 && fs > 20) { fs -= 2; c.font = `bold ${fs}px monospace`; }
    c.strokeText(title, 0, 0); c.fillText(title, 0, 0);
    c.restore();
    c.fillStyle = '#fff'; c.font = 'bold 26px monospace'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    wrapLines(c, storyFullText(sc).slice(0, story.shown), STORY_W - 160).forEach((ln, i) => c.fillText(ln, STORY_W / 2, 300 + i * 36));
    if (story.shown >= storyFullText(sc).length) {
        const pulse = 1 + Math.sin(performance.now() / 200) * 0.04;
        c.save(); c.translate(STORY_W / 2, 460); c.scale(pulse, pulse);
        blockRect(c, -120, -30, 240, 60, '#fbbf24');
        c.fillStyle = '#000'; c.font = 'bold 28px monospace'; c.textBaseline = 'middle'; c.fillText(storyT(sc.card.go || 'go'), 0, 2);
        c.restore();
    }
}
