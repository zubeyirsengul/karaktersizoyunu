// Bölüm girişi hikâyeleri: blok (piksel) tarzı karakterlerle resimli, yazılı ara sahneler
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)
//
// Her bölümden önce bir kez oynar. Dokun / Enter / Boşluk: yazıyı tamamla, sonra sonraki sahne. GEÇ ya da ESC: atla.
// Yüzler fotoğraflardan kırpılıp küçük bir ızgaraya indirilir ve büyütülerek çizilir (kare kare blok görünüm).
// Yeni fotoğraf eklemek için: resimler/ klasörüne koy, STORY_FACES'e kaynak + kırpma kutusu (x, y, w, h) yaz.

const STORY_W = 960, STORY_H = 540, STORY_GROUND = 440, PX = 4;   // sahne birimi; PX = bir "blok pikseli"

// --- YÜZLER ---
const STORY_FACES = {
    g1: { src: 'resimler/4lucete.png', box: [24, 16, 58, 66] },
    g2: { src: 'resimler/4lucete.png', box: [149, 38, 62, 70] },
    g3: { src: 'resimler/4lucete.png', box: [235, 26, 62, 70] },
    g4: { src: 'resimler/4lucete.png', box: [409, 46, 62, 70] },
    sarraf: { src: 'resimler/sarraf.png', box: [50, 25, 190, 255] }   // saç, yüz ve sakal; omuzlar dışarıda
};
const FACE_GRID = 24;   // fotoğraf yüzleri kaç blok genişliğinde
const storyImgs = {}, storyFaceCache = {};
function storyImg(src) {
    if (!storyImgs[src]) { const im = new Image(); im.src = src; storyImgs[src] = im; }
    return storyImgs[src];
}
// Fotoğraftan 16 blok genişliğinde piksel yüz üretir (hazır değilse null)
function storyFace(key) {
    if (storyFaceCache[key]) return storyFaceCache[key];
    let src, box;
    if (key === 'recep') {
        if (!headCanvas) return null;                       // core.js'teki kırpılmış karikatür kafa
        src = headCanvas; box = [0, 0, headCanvas.width, headCanvas.height];
    } else {
        const f = STORY_FACES[key]; if (!f) return null;
        src = storyImg(f.src);
        if (!src.complete || !src.naturalWidth) return null;
        box = f.box;
    }
    const gw = FACE_GRID, gh = Math.round(FACE_GRID * box[3] / box[2]);
    const c = document.createElement('canvas'); c.width = gw; c.height = gh;
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.drawImage(src, box[0], box[1], box[2], box[3], 0, 0, gw, gh);
    // Fotoğraf yüzleri oval kesilir (arka plan atılır), biraz aydınlatılır ve çevresine koyu blok çizgi çekilir
    if (key !== 'recep') {
        const d = x.getImageData(0, 0, gw, gh), p = d.data, inside = (i, j) => {
            const u = (i + 0.5 - gw / 2) / (gw / 2), v = (j + 0.5 - gh / 2) / (gh / 2);
            return u * u + v * v <= 1;
        };
        for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
            const o = (j * gw + i) * 4;
            if (!inside(i, j)) { p[o + 3] = 0; continue; }
            for (let k = 0; k < 3; k++) p[o + k] = Math.min(255, (p[o + k] - 128) * 1.12 + 128 + 14);
            p[o + 3] = 255;
        }
        for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {   // dış çizgi: kenardaki iç bloklar koyulaşır
            const o = (j * gw + i) * 4;
            if (!p[o + 3]) continue;
            if (!inside(i - 1, j) || !inside(i + 1, j) || !inside(i, j - 1) || !inside(i, j + 1)) { p[o] *= 0.35; p[o + 1] *= 0.35; p[o + 2] *= 0.35; }
        }
        x.putImageData(d, 0, 0);
    }
    storyFaceCache[key] = c;
    return c;
}
Object.values(STORY_FACES).forEach(f => storyImg(f.src));   // önceden yükle

// Fotoğrafı olmayanlar için 8x8 elle çizilmiş yüzler (harf = renk)
const PIX_FACES = {
    police: { pal: { k: '#1e3a8a', y: '#fbbf24', s: '#e0ac69', e: '#1f2937', m: '#7c2d12', b: '#3f2a1d' },
              rows: ['kkkkkkkk', 'kkkyykkk', 'kkkkkkkk', 'ssssssss', 'sesssess', 'ssssssss', 'sbbbbbbs', 'ssmmmmss'] },
    feto:   { pal: { w: '#f3f4f6', s: '#d6a77a', e: '#111827', g: '#9ca3af', m: '#7f1d1d' },
              rows: ['wwwwwwww', 'wsssssw.', 'seessees', 'ssssssss', 'sssggsss', 'gwwwwwwg', 'wwwmmwww', '.wwwwww.'] },
    kurt:   { pal: { g: '#6b7280', d: '#374151', y: '#facc15', w: '#e5e7eb', r: '#991b1b', k: '#111827' },
              rows: ['gd....dg', 'gdgggddg', 'gggggggg', 'gygggygg', 'gggggggg', 'ggwkkwgg', 'gwrrrrwg', '.gggggg.'] }
};
const pixFaceCache = {};
function pixFace(key) {
    if (pixFaceCache[key]) return pixFaceCache[key];
    const F = PIX_FACES[key], c = document.createElement('canvas');
    c.width = 8; c.height = 8;
    const x = c.getContext('2d');
    F.rows.forEach((row, j) => [...row].forEach((ch, i) => { if (F.pal[ch]) { x.fillStyle = F.pal[ch]; x.fillRect(i, j, 1, 1); } }));
    return (pixFaceCache[key] = c);
}

// --- KARAKTERLER ---
// Kıyafet renkleri: gövde, kol, bacak, ayakkabı
const STORY_CAST = {
    recep:  { face: 'recep', suit: '#1f2a44', arm: '#1f2a44', leg: '#111827', shoe: '#000', tie: '#b91c1c', hand: '#e0ac69' },
    g1:     { face: 'g1', suit: '#111827', arm: '#111827', leg: '#1f2937', shoe: '#000', tie: '#334155', hand: '#d6a77a' },
    g2:     { face: 'g2', suit: '#1c1917', arm: '#1c1917', leg: '#292524', shoe: '#000', tie: '#7f1d1d', hand: '#d6a77a' },
    g3:     { face: 'g3', suit: '#0f172a', arm: '#0f172a', leg: '#1e293b', shoe: '#000', tie: '#1e3a8a', hand: '#d6a77a' },
    g4:     { face: 'g4', suit: '#262626', arm: '#262626', leg: '#171717', shoe: '#000', tie: '#365314', hand: '#d6a77a' },
    sarraf: { face: 'sarraf', suit: '#18181b', arm: '#18181b', leg: '#27272a', shoe: '#000', hand: '#e7c39a', gold: true },
    police: { pix: 'police', suit: '#1d4ed8', arm: '#1d4ed8', leg: '#1e3a8a', shoe: '#000', tie: '#111827', hand: '#e0ac69', badge: true },
    feto:   { pix: 'feto', suit: '#4b5563', arm: '#4b5563', leg: '#374151', shoe: '#1f2937', hand: '#d6a77a', cane: true },
    kurt:   { pix: 'kurt', suit: '#57534e', arm: '#6b7280', leg: '#44403c', shoe: '#292524', hand: '#6b7280' }
};

function blockRect(c, x, y, w, h, color, shade) {
    c.fillStyle = color; c.fillRect(x, y, w, h);
    if (shade !== false) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x + w - PX, y, PX, h); c.fillRect(x, y + h - PX, w, PX); }
}

// Ayaklar zeminde (x orta, y zemin). a: { who, dir, walk (faz), talk, wave, scale }
function drawBlockPerson(c, a, time) {
    const C = STORY_CAST[a.who], s = a.scale || 1;
    c.save();
    c.translate(a.x, a.y);
    c.scale(s * (a.dir || 1), s);
    const legH = 72, bodyH = 72, bodyW = 56, legW = 28, armW = 24, head = 64;
    const sw = a.walking ? Math.sin(a.walk) * 0.6 : 0;
    const armSw = a.wave ? -2.4 + Math.sin(time * 10) * 0.4 : -sw;
    // bacaklar (kalçadan döner)
    [[-legW, sw], [0, -sw]].forEach(([lx, ang]) => {
        c.save(); c.translate(lx + legW / 2, -legH); c.rotate(ang);
        blockRect(c, -legW / 2, 0, legW, legH - 12, C.leg);
        blockRect(c, -legW / 2, legH - 12, legW, 12, C.shoe, false);
        c.restore();
    });
    // arka kol
    c.save(); c.translate(-bodyW / 2 - armW / 2, -legH - bodyH + 8); c.rotate(sw);
    blockRect(c, -armW / 2, -4, armW, bodyH - 12, C.arm); blockRect(c, -armW / 2, bodyH - 16, armW, 14, C.hand, false);
    c.restore();
    // gövde
    blockRect(c, -bodyW / 2, -legH - bodyH, bodyW, bodyH, C.suit);
    if (C.tie) { c.fillStyle = '#f3f4f6'; c.fillRect(-8, -legH - bodyH, 16, 20); c.fillStyle = C.tie; c.fillRect(-4, -legH - bodyH + 4, 8, 36); }
    if (C.badge) { c.fillStyle = '#fbbf24'; c.fillRect(8, -legH - bodyH + 14, 12, 12); c.save(); c.scale(a.dir || 1, 1); c.fillStyle = '#fff'; c.font = 'bold 13px monospace'; c.textAlign = 'center'; c.fillText('17/25', 0, -legH - 14); c.restore(); }
    // ön kol (konuşurken/el sallarken kalkar)
    c.save(); c.translate(bodyW / 2 + armW / 2, -legH - bodyH + 8); c.rotate(armSw);
    blockRect(c, -armW / 2, -4, armW, bodyH - 12, C.arm); blockRect(c, -armW / 2, bodyH - 16, armW, 14, C.hand, false);
    if (a.who === 'recep') {   // balyoz
        c.fillStyle = '#7c4a1e'; c.fillRect(-4, bodyH - 70, 8, 74);
        blockRect(c, -18, bodyH - 90, 36, 22, '#4b5563');
        c.save(); c.translate(0, bodyH - 79); c.scale(a.dir || 1, 1);
        c.fillStyle = '#fde68a'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('YARGI', 0, 0, 34);
        c.restore();
    }
    if (C.gold) { blockRect(c, -16, bodyH - 22, 32, 16, '#facc15'); c.fillStyle = '#fef08a'; c.fillRect(-12, bodyH - 20, 12, 4); }
    if (C.cane) { c.fillStyle = '#78350f'; c.fillRect(-3, bodyH - 10, 6, 70); }
    if (C.saz) {   // bağlama: elde, sapı yukarı
        c.fillStyle = '#6b3f1d'; c.fillRect(-3, bodyH - 96, 6, 84);
        blockRect(c, -18, bodyH - 22, 36, 28, '#b45309'); c.fillStyle = '#1c1917'; c.fillRect(-4, bodyH - 12, 8, 8);
    }
    c.restore();
    if (a.carry) {
        const by = -legH - bodyH - head - 4;
        blockRect(c, -30, by - 30, 60, 30, '#ea580c'); c.fillStyle = '#9a3412'; c.fillRect(-30, by - 30, 60, 6);
        c.fillStyle = '#22c55e'; c.fillRect(-22, by - 38, 44, 8);
        blockRect(c, -18, by - 56, 36, 16, '#eab308');
    }
    // kafa: fotoğraftan piksel yüz ya da elle çizilmiş yüz
    const hy = -legH - bodyH - head + (a.talk ? Math.round(Math.sin(time * 18)) * 2 : 0);
    c.imageSmoothingEnabled = false;
    if (C.face) {
        const f = storyFace(C.face);
        if (f) {
            const hw = a.who === 'recep' ? head * 1.25 : head * 1.15, hh = hw * f.height / f.width;
            c.drawImage(f, -hw / 2, hy + head - hh, hw, hh);
        } else blockRect(c, -head / 2, hy, head, head, C.hand);
    } else {
        c.drawImage(pixFace(C.pix), -head / 2, hy, head, head);
    }
    c.restore();
}

// --- SAHNE PARÇALARI ---
const storyHash = n => { const v = Math.sin(n * 127.1) * 43758.5453; return v - Math.floor(v); };

function storyGround(c, top, side) {
    const B = 40;
    for (let i = 0; i < STORY_W / B; i++) {
        for (let j = 0; j * B + STORY_GROUND < STORY_H; j++) {
            const x = i * B, y = STORY_GROUND + j * B;
            const g = j === 0;
            c.fillStyle = g ? top : side; c.fillRect(x, y, B, B);
            for (let k = 0; k < 6; k++) {   // blok dokusu
                c.fillStyle = storyHash(i * 31 + j * 7 + k) > 0.5 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)';
                c.fillRect(x + Math.floor(storyHash(i + k * 3 + j) * 8) * 5, y + Math.floor(storyHash(i * 5 + k + j * 9) * 8) * 5, 5, 5);
            }
            if (g) { c.fillStyle = side; c.fillRect(x, y + 28, B, 12); }
            c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, B - 1, B - 1);
        }
    }
}
function storySky(c, cols) {
    const band = STORY_GROUND / cols.length;
    cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(0, Math.floor(i * band), STORY_W, Math.ceil(band) + 1); });
}
function blockStars(c, time) {
    for (let i = 0; i < 40; i++) {
        c.fillStyle = storyHash(i + Math.floor(time * 2 + i) * 0.001) > 0.1 ? '#fef9c3' : '#fff';
        c.fillRect(Math.floor(storyHash(i) * STORY_W / 4) * 4, Math.floor(storyHash(i + 9) * 260 / 4) * 4, 4, 4);
    }
}
function blockMoon(c, x, y) { c.fillStyle = '#f5f5dc'; c.fillRect(x, y, 48, 48); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x + 8, y + 12, 12, 12); c.fillRect(x + 28, y + 28, 8, 8); }

const STORY_BG = {
    jail(c, time) {
        storySky(c, ['#0b1026', '#111a3a', '#182350', '#1f2d63']);
        blockStars(c, time); blockMoon(c, 820, 40);
        // tuğla duvarlı karakol
        for (let y = 140; y < STORY_GROUND; y += 24) for (let x = 120; x < 820; x += 48) {
            const ox = (y / 24) % 2 ? 24 : 0;
            c.fillStyle = storyHash(x + y) > 0.5 ? '#6b7280' : '#57606f'; c.fillRect(x + ox - 24 > 120 ? x + ox - 24 : 120, y, 46, 22);
        }
        c.fillStyle = '#374151'; c.fillRect(110, 120, 720, 24);
        c.fillStyle = '#fbbf24'; c.font = 'bold 26px monospace'; c.textAlign = 'center'; c.fillText(storyT('station'), 470, 140);
        storyGround(c, '#4b5563', '#374151');
    },
    palace(c, time) {
        storySky(c, ['#38bdf8', '#5cc8f9', '#7dd3fc', '#a5e3fd', '#cfeffd']);
        c.fillStyle = '#fde047'; c.fillRect(800, 40, 64, 64);
        [[60, 60], [300, 90], [560, 50]].forEach(([x0, y]) => {
            const x = Math.floor(((x0 + time * 14) % (STORY_W + 160)) / PX) * PX - 140;   // bulutlar yavaşça süzülür
            c.fillStyle = '#fff'; c.fillRect(x, y, 120, 24); c.fillRect(x + 24, y - 16, 64, 16);
        });
        // blok saray
        c.fillStyle = '#efe4cc'; c.fillRect(150, 250, 660, 190);
        c.fillStyle = '#cdbb96'; c.fillRect(150, 240, 660, 16); c.fillRect(380, 180, 200, 70);
        for (let x = 170; x < 800; x += 40) { c.fillStyle = '#b8a47e'; c.fillRect(x, 270, 12, 170); }
        c.fillStyle = '#5b4636'; c.fillRect(450, 330, 60, 110);
        c.fillStyle = '#e30a17'; c.fillRect(480, 120, 44, 28); c.fillStyle = '#9ca3af'; c.fillRect(476, 120, 4, 60);
        storyGround(c, '#4caf2f', '#7a4a24');
    },
    steppe(c) {
        storySky(c, ['#1e1b4b', '#4c1d95', '#831843', '#c2410c', '#ea580c', '#fcd34d']);
        c.fillStyle = '#fdba74'; c.fillRect(220, 250, 96, 96);
        c.fillStyle = '#6b2f5f';
        for (let x = 0; x < STORY_W; x += 40) { const h = 60 + Math.floor(storyHash(x) * 5) * 20; c.fillRect(x, STORY_GROUND - h, 40, h); }
        storyGround(c, '#a3a34a', '#7c5a2c');
    },
    city(c, time) {
        storySky(c, ['#020617', '#0b1026', '#111a3a', '#1e1b4b']);
        blockStars(c, time); blockMoon(c, 100, 50);
        for (let i = 0; i < 12; i++) {
            const x = i * 80, h = 140 + Math.floor(storyHash(i * 3) * 6) * 30;
            c.fillStyle = i % 2 ? '#1f2937' : '#273449'; c.fillRect(x, STORY_GROUND - h, 76, h);
            for (let wy = STORY_GROUND - h + 16; wy < STORY_GROUND - 20; wy += 28) for (let wx = x + 10; wx < x + 66; wx += 22) {
                c.fillStyle = storyHash(wx * 3 + wy) > 0.45 ? '#fde68a' : '#111827'; c.fillRect(wx, wy, 12, 14);
            }
        }
        // projektör
        c.fillStyle = 'rgba(255,255,200,0.08)';
        const a = Math.sin(time * 0.8) * 0.4;
        c.beginPath(); c.moveTo(720, STORY_GROUND); c.lineTo(720 + Math.sin(a - 0.12) * 500, STORY_GROUND - 500); c.lineTo(720 + Math.sin(a + 0.12) * 500, STORY_GROUND - 500); c.fill();
        storyGround(c, '#4b5563', '#1f2937');
    },
    card(c, time) {
        c.fillStyle = '#0b0f19'; c.fillRect(0, 0, STORY_W, STORY_H);
        for (let i = 0; i < 30; i++) {   // uçuşan rüşvet zarfları
            const x = (storyHash(i) * STORY_W + time * 30 * (0.5 + storyHash(i + 1))) % (STORY_W + 60) - 30;
            const y = (storyHash(i + 2) * STORY_H + time * 40 * (0.5 + storyHash(i + 3))) % (STORY_H + 40) - 20;
            c.globalAlpha = 0.25; drawBribe(c, x, y, time * 2 + i); c.globalAlpha = 1;
        }
    }
};

// Sahne eşyaları: hücre parmaklığı, ayakkabı kutuları, telefon, sandık
const STORY_PROPS = {
    bars(c) {
        c.fillStyle = '#9ca3af';
        for (let x = 470; x <= 910; x += 44) c.fillRect(x, 196, 8, 244);
        c.fillRect(466, 196, 448, 12); c.fillRect(466, 300, 448, 8);
    },
    shoeboxes(c, time) {
        [[80, 0], [128, 0], [104, -32], [820, 0], [860, 0]].forEach(([x, dy], i) => {
            const y = STORY_GROUND - 32 + dy;
            blockRect(c, x, y, 44, 32, '#ea580c'); c.fillStyle = '#9a3412'; c.fillRect(x, y, 44, 6);
            c.fillStyle = '#22c55e'; c.fillRect(x + 6, y - 6 - Math.round(Math.abs(Math.sin(time * 3 + i)) * 4), 32, 8);
        });
    },
    gold(c, time) {   // altın külçesi yığını, parıltılı
        const rows = [5, 4, 3, 2, 1];
        rows.forEach((n, r) => { for (let k = 0; k < n; k++) {
            const x = 600 + r * 22 + k * 44, y = STORY_GROUND - 20 - r * 20;
            blockRect(c, x, y, 42, 20, '#eab308'); c.fillStyle = '#fde047'; c.fillRect(x + 4, y + 3, 26, 5);
        } });
        const t = Math.floor(time * 3) % 9;
        c.fillStyle = '#fff'; c.fillRect(612 + t * 24, STORY_GROUND - 108 + (t % 3) * 30, 6, 6);
    },
    ballot(c) {
        const x = 440, y = STORY_GROUND - 80;
        blockRect(c, x, y, 90, 80, '#e5e7eb'); c.fillStyle = '#1d4ed8'; c.fillRect(x, y, 90, 12);
        c.fillStyle = '#111827'; c.fillRect(x + 25, y - 2, 40, 6);
        c.fillStyle = '#1d4ed8'; c.font = 'bold 13px monospace'; c.textAlign = 'center'; c.fillText(storyT('ballot'), x + 45, y + 48);
    },
    rain(c, time) {   // gökten rüşvet zarfı yağar
        for (let i = 0; i < 10; i++) {
            const x = 60 + storyHash(i) * 840, y = ((time * 120 + storyHash(i + 4) * 500) % 520) - 40;
            drawBribe(c, x, y, time * 3 + i);
        }
    }
};

// --- HİKÂYELER ---
// Sahne: bg, props, actors [{ who, x, to, dir, talk, wave, jump }], say: { who, key } (who boşsa anlatıcı), card: true
const STORIES = {
    1: [
        { bg: 'jail', props: ['bars'], say: { key: 's1a' },
          actors: [{ who: 'g1', x: 520, dir: 1 }, { who: 'g2', x: 610, dir: 1 }, { who: 'g3', x: 700, dir: -1 }, { who: 'g4', x: 790, dir: -1 },
                   { who: 'police', x: 60, to: 300, dir: 1 }, { who: 'police', x: -120, to: 160, dir: 1 }] },
        { bg: 'jail', props: ['bars'], say: { who: 'gang', key: 's1b' },
          actors: [{ who: 'g1', x: 520, dir: 1, jump: true }, { who: 'g2', x: 610, dir: 1, talk: true, wave: true },
                   { who: 'g3', x: 700, dir: -1, jump: true }, { who: 'g4', x: 790, dir: -1, talk: true, wave: true },
                   { who: 'police', x: 300, dir: -1 }, { who: 'police', x: 160, dir: 1 }] },
        { bg: 'palace', props: ['rain'], say: { who: 'recep', key: 's1c' },
          actors: [{ who: 'recep', x: -100, to: 380, dir: 1, talk: true }] },
        { bg: 'card', card: { title: 'm1t', text: 'm1' } }
    ],
    2: [
        { bg: 'steppe', props: ['gold', 'shoeboxes'], say: { key: 's2a' },
          actors: [{ who: 'sarraf', x: 1060, to: 520, dir: -1 }] },
        { bg: 'steppe', props: ['gold', 'shoeboxes'], say: { who: 'sarraf', key: 's2b' },
          actors: [{ who: 'recep', x: 280, dir: 1 }, { who: 'sarraf', x: 520, dir: -1, talk: true, wave: true }] },
        { bg: 'steppe', props: ['gold', 'shoeboxes'], say: { who: 'recep', key: 's2c' },
          actors: [{ who: 'recep', x: 280, dir: 1, talk: true, wave: true }, { who: 'sarraf', x: 520, dir: -1 }] },
        { bg: 'steppe', props: [], say: { key: 's2d' },
          actors: [{ who: 'recep', x: 200, dir: 1, jump: true }, { who: 'sarraf', x: 380, dir: 1, jump: true },
                   { who: 'kurt', x: 640, to: 1120, dur: 5, dir: 1, carry: true }] },
        { bg: 'card', card: { title: 'm2t', text: 'm2' } }
    ],
    3: [
        { bg: 'city', props: ['ballot'], say: { key: 's3a' },
          actors: [{ who: 'police', x: 300, dir: 1 }, { who: 'police', x: 680, dir: -1 }] },
        { bg: 'city', props: ['ballot'], say: { who: 'feto', key: 's3b' },
          actors: [{ who: 'feto', x: 1060, to: 620, dir: -1, talk: true }] },
        { bg: 'city', props: ['ballot'], say: { who: 'recep', key: 's3c' },
          actors: [{ who: 'recep', x: -100, to: 300, dir: 1, talk: true, wave: true }, { who: 'feto', x: 620, dir: -1 }] },
        { bg: 'card', card: { title: 'm3t', text: 'm3' } }
    ]
};

const STORY_TEXT = {
    tr: { station: '17/25 KARAKOLU', ballot: 'SANDIK', skip: 'GEÇ ⏭', tap: 'Devam için dokun ▶', go: 'BAŞLA ▶',
          gang: '4\'LÜ ÇETE', recep: 'RECEP', phone: 'TELEFON', sarraf: 'SARRAF', feto: 'FETÖ',
          s1a: '17 Aralık sabahı... 17/25 polisleri baskın yaptı ve 4\'lü çeteyi içeri tıktı!',
          s1b: 'Reis kurtar bizi! Ayakkabı kutularını da aldılar!',
          s1c: 'Dosyayı kapatacağız! Rüşvet zarflarını hazırlayın, geliyorum!',
          m1t: 'GÖREV 1: 4\'LÜ ÇETEYİ KURTAR', m1: '11 polisi rüşvetle sustur, kapıdan geç, ALEVİ\'yi yen ve çeteyi kurtar!',
          s2a: "Bozkırın ortasında bir altın tüccarı belirdi: SARRAF! Yanında altın külçeleri, ayakkabı kutuları...",
          s2b: "Reis, ufak bir hediye... Kutular dolar dolu, altınlar ambargodan kaçak, saatler İsviçre malı!",
          s2c: "Hediye reddedilmez! Ama 17/25 polisleri her şeyi dinliyor... Kimse duymasın!",
          s2d: "O anda KURT ortaya çıktı, altınları ve ayakkabı kutularını kapıp kaçtı!",
          m2t: "GÖREV 2: ALTINLARI GERİ AL", m2: "Bozkırda polisleri rüşvetle sustur, KURT'u yen, Sarraf'ın altınlarını geri al!",
          s3a: 'Seçim gecesi. Sandıklar sayılıyor, şehir nefesini tutmuş...',
          s3b: 'Bu sandık benim olacak! Hehehe...',
          s3c: 'Sandık namusumuzdur! Ama sayımı biz yaparız!',
          m3t: 'GÖREV 3: SANDIĞI KORU', m3: 'Gece şehrinde polisleri geç, FETÖ\'yü yen, sandığı kurtar!' },
    en: { station: '17/25 POLICE STATION', ballot: 'BALLOT', skip: 'SKIP ⏭', tap: 'Tap to continue ▶', go: 'START ▶',
          gang: 'GANG OF FOUR', recep: 'RECEP', phone: 'PHONE', sarraf: 'SARRAF', feto: 'FETÖ',
          s1a: 'Morning of December 17... the 17/25 police raided and locked up the Gang of Four!',
          s1b: 'Boss, save us! They took the shoe boxes too!',
          s1c: 'We\'ll close the case! Get the bribe envelopes ready, I\'m coming!',
          m1t: 'MISSION 1: FREE THE GANG OF FOUR', m1: 'Silence 11 police with bribes, pass the gate, beat ALEVİ and free the gang!',
          s2a: "In the middle of the steppe a gold trader appeared: SARRAF! With gold bars and shoe boxes...",
          s2b: "Boss, a little gift... The boxes are full of dollars, the gold dodged the embargo, the watches are Swiss!",
          s2c: "One never refuses a gift! But the 17/25 police are listening to everything... Nobody must hear!",
          s2d: "Just then the WOLF appeared and ran off with the gold and the shoe boxes!",
          m2t: "MISSION 2: GET THE GOLD BACK", m2: "Bribe the police on the steppe, beat the WOLF and get Sarraf's gold back!",
          s3a: 'Election night. The ballots are being counted, the city holds its breath...',
          s3b: 'This ballot box will be mine! Hehehe...',
          s3c: 'The ballot box is our honour! But we do the counting!',
          m3t: 'MISSION 3: GUARD THE BALLOT BOX', m3: 'Get past the police in the night city, beat FETÖ, save the ballot box!' },
    fr: { station: 'COMMISSARIAT 17/25', ballot: 'URNE', skip: 'PASSER ⏭', tap: 'Touchez pour continuer ▶', go: 'JOUER ▶',
          gang: 'BANDE DES QUATRE', recep: 'RECEP', phone: 'TÉLÉPHONE', sarraf: 'SARRAF', feto: 'FETÖ',
          s1a: 'Le matin du 17 décembre... la police 17/25 a arrêté la Bande des Quatre !',
          s1b: 'Chef, sauve-nous ! Ils ont pris les boîtes à chaussures aussi !',
          s1c: 'On va classer l\'affaire ! Préparez les enveloppes, j\'arrive !',
          m1t: 'MISSION 1 : LIBÈRE LA BANDE DES QUATRE', m1: 'Achète le silence de 11 policiers, passe la porte, bats ALEVİ et libère la bande !',
          s2a: "Au milieu de la steppe surgit un marchand d'or : SARRAF ! Avec des lingots et des boîtes à chaussures...",
          s2b: "Chef, un petit cadeau... Les boîtes sont pleines de dollars, l'or a contourné l'embargo, les montres sont suisses !",
          s2c: "On ne refuse jamais un cadeau ! Mais la police 17/25 écoute tout... Que personne n'entende !",
          s2d: "À cet instant, le LOUP surgit et s'enfuit avec l'or et les boîtes à chaussures !",
          m2t: "MISSION 2 : RÉCUPÈRE L'OR", m2: "Soudoie la police dans la steppe, bats le LOUP et récupère l'or de Sarraf !",
          s3a: 'Soir d\'élection. On compte les urnes, la ville retient son souffle...',
          s3b: 'Cette urne sera à moi ! Héhéhé...',
          s3c: 'L\'urne, c\'est notre honneur ! Mais c\'est nous qui comptons !',
          m3t: 'MISSION 3 : PROTÈGE L\'URNE', m3: 'Traverse la ville de nuit, bats FETÖ, sauve l\'urne !' },
    nl: { station: '17/25 POLITIEBUREAU', ballot: 'STEMBUS', skip: 'OVERSLAAN ⏭', tap: 'Tik om verder te gaan ▶', go: 'START ▶',
          gang: 'BENDE VAN VIER', recep: 'RECEP', phone: 'TELEFOON', sarraf: 'SARRAF', feto: 'FETÖ',
          s1a: 'Ochtend van 17 december... de 17/25-politie heeft de Bende van Vier opgesloten!',
          s1b: 'Baas, red ons! Ze hebben de schoenendozen ook meegenomen!',
          s1c: 'We sluiten het dossier! Maak de enveloppen klaar, ik kom eraan!',
          m1t: 'MISSIE 1: BEVRIJD DE BENDE VAN VIER', m1: 'Koop 11 agenten om, ga door de poort, versla ALEVİ en bevrijd de bende!',
          s2a: "Midden in de steppe verscheen een goudhandelaar: SARRAF! Met goudstaven en schoenendozen...",
          s2b: "Baas, een klein cadeautje... De dozen zitten vol dollars, het goud ontweek het embargo, de horloges zijn Zwitsers!",
          s2c: "Een cadeau weiger je niet! Maar de 17/25-politie luistert alles af... Niemand mag het horen!",
          s2d: "Op dat moment dook de WOLF op en ging ervandoor met het goud en de schoenendozen!",
          m2t: "MISSIE 2: HAAL HET GOUD TERUG", m2: "Koop de politie in de steppe om, versla de WOLF en haal het goud van Sarraf terug!",
          s3a: 'Verkiezingsnacht. De stemmen worden geteld, de stad houdt de adem in...',
          s3b: 'Deze stembus wordt van mij! Hehehe...',
          s3c: 'De stembus is onze eer! Maar wij tellen de stemmen!',
          m3t: 'MISSIE 3: BEWAAK DE STEMBUS', m3: 'Kom langs de politie in de nachtstad, versla FETÖ, red de stembus!' },
    de: { station: 'WACHE 17/25', ballot: 'URNE', skip: 'ÜBERSPRINGEN ⏭', tap: 'Tippen zum Fortfahren ▶', go: 'START ▶',
          gang: 'VIERERBANDE', recep: 'RECEP', phone: 'TELEFON', sarraf: 'SARRAF', feto: 'FETÖ',
          s1a: 'Morgen des 17. Dezember... die 17/25-Polizei hat die Viererbande eingesperrt!',
          s1b: 'Chef, rette uns! Sie haben auch die Schuhkartons mitgenommen!',
          s1c: 'Wir schließen die Akte! Macht die Umschläge bereit, ich komme!',
          m1t: 'MISSION 1: BEFREIE DIE VIERERBANDE', m1: 'Besteche 11 Polizisten, geh durchs Tor, besiege ALEVİ und befreie die Bande!',
          s2a: "Mitten in der Steppe tauchte ein Goldhändler auf: SARRAF! Mit Goldbarren und Schuhkartons...",
          s2b: "Chef, ein kleines Geschenk... Die Kartons sind voller Dollar, das Gold hat das Embargo umgangen, die Uhren sind Schweizer!",
          s2c: "Ein Geschenk lehnt man nicht ab! Aber die 17/25-Polizei hört alles mit... Keiner darf es hören!",
          s2d: "Da tauchte der WOLF auf und rannte mit dem Gold und den Schuhkartons davon!",
          m2t: "MISSION 2: HOL DAS GOLD ZURÜCK", m2: "Besteche die Polizei in der Steppe, besiege den WOLF und hol Sarrafs Gold zurück!",
          s3a: 'Wahlnacht. Die Urnen werden ausgezählt, die Stadt hält den Atem an...',
          s3b: 'Diese Urne gehört bald mir! Hehehe...',
          s3c: 'Die Urne ist unsere Ehre! Aber zählen tun wir!',
          m3t: 'MISSION 3: BESCHÜTZE DIE URNE', m3: 'Komm an der Polizei in der Nachtstadt vorbei, besiege FETÖ, rette die Urne!' },
    ru: { station: 'УЧАСТОК 17/25', ballot: 'УРНА', skip: 'ПРОПУСТИТЬ ⏭', tap: 'Нажми, чтобы продолжить ▶', go: 'НАЧАТЬ ▶',
          gang: 'БАНДА ЧЕТЫРЁХ', recep: 'РЕДЖЕП', phone: 'ТЕЛЕФОН', sarraf: 'САРРАФ', feto: 'ФЕТÖ',
          s1a: 'Утро 17 декабря... полиция 17/25 устроила облаву и посадила Банду четырёх!',
          s1b: 'Шеф, спаси нас! Они забрали и обувные коробки!',
          s1c: 'Мы закроем дело! Готовьте конверты со взятками, я иду!',
          m1t: 'МИССИЯ 1: СПАСИ БАНДУ ЧЕТЫРЁХ', m1: 'Подкупи 11 полицейских, пройди ворота, победи АЛЕВИ и освободи банду!',
          s2a: "Посреди степи появился торговец золотом: САРРАФ! С золотыми слитками и обувными коробками...",
          s2b: "Шеф, маленький подарок... Коробки полны долларов, золото обошло эмбарго, часы швейцарские!",
          s2c: "От подарков не отказываются! Но полиция 17/25 всё прослушивает... Чтобы никто не услышал!",
          s2d: "В этот миг появился ВОЛК и утащил золото и обувные коробки!",
          m2t: "МИССИЯ 2: ВЕРНИ ЗОЛОТО", m2: "Подкупи полицию в степи, победи ВОЛКА и верни золото Саррафа!",
          s3a: 'Ночь выборов. Урны подсчитывают, город затаил дыхание...',
          s3b: 'Эта урна будет моей! Хе-хе-хе...',
          s3c: 'Урна — наша честь! Но считаем мы!',
          m3t: 'МИССИЯ 3: ЗАЩИТИ УРНУ', m3: 'Пройди полицию в ночном городе, победи ФЕТÖ, спаси урну!' }
};
const storyT = k => (STORY_TEXT[lang] && STORY_TEXT[lang][k]) || STORY_TEXT.tr[k];

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
}
function storyScene() { return STORIES[story.level][story.i]; }
function storyFullText(sc) { return sc.card ? storyT(sc.card.text) : storyT(sc.say.key); }

function storyNext() {
    if (!story) return;
    const sc = storyScene(), full = storyFullText(sc);
    if (story.shown < full.length) { story.shown = full.length; return; }   // önce yazıyı tamamla
    if (story.i < STORIES[story.level].length - 1) { story.i++; story.t0 = performance.now(); story.shown = 0; }
    else endStory();
}
function endStory() {
    if (!story) return;
    cancelAnimationFrame(story.raf);
    const cb = story.onDone;
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
