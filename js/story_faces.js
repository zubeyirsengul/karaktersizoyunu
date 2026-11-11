// Hikâye karakterleri: fotoğraftan blok yüzler, elle çizilmiş piksel yüzler, kıyafetler ve blok insan çizimi
// Yeni fotoğraf eklemek için: resimler/ klasörüne koy, STORY_FACES'e kaynak + kırpma kutusu (x, y, w, h) yaz.
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

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
