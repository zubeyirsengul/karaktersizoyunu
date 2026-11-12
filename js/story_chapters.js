// 3-8. bölümlerin ve oyun sonunun hikâyeleri (motor: story.js; 9. bölüm js/selo.js)
// Bütün yeni karakterler elle çizilmiş 8x8 piksel yüzlerdir: fotoğraf ya da lisans gerekmez.
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

Object.assign(PIX_FACES, {
    anchor:     { pal: { h: '#78350f', s: '#f1c27d', e: '#1f2937', m: '#be123c', b: '#fbbf24' },
                  rows: ['.hhhhhh.', 'hhhhhhhh', 'hssssssh', 'hesssesh', 'hssssssh', 'hssmmssh', 'hhssssh.', 'h.bbbb..'] },
    teacher:    { pal: { h: '#9ca3af', s: '#e0ac69', e: '#1f2937', g: '#111827', m: '#7c2d12' },
                  rows: ['hhhhhhhh', 'hssssssh', 'sgggsggs', 'sgesgegs', 'ssssssss', 'ssssssss', 'ssmmmmss', '.ssssss.'] },
    journalist: { pal: { h: '#1c1917', s: '#c68642', e: '#111827', m: '#7c2d12', b: '#292524' },
                  rows: ['hhhhhhhh', 'hhhhhhhh', 'ssssssss', 'sesssess', 'ssssssss', 'sbbbbbbs', 'sbmmmmbs', '.bbbbbb.'] }
});
Object.assign(STORY_CAST, {
    anchor:     { pix: 'anchor', suit: '#be123c', arm: '#be123c', leg: '#1f2937', shoe: '#000', hand: '#f1c27d' },
    teacher:    { pix: 'teacher', suit: '#9a3412', arm: '#9a3412', leg: '#44403c', shoe: '#000', hand: '#e0ac69', tie: '#1e3a8a' },
    journalist: { pix: 'journalist', suit: '#1d4ed8', arm: '#1d4ed8', leg: '#1f2937', shoe: '#000', hand: '#c68642' }
});

Object.assign(STORY_BG, {
    villa(c, time) {
        c.fillStyle = '#3b0764'; c.fillRect(0, 0, STORY_W, STORY_GROUND);
        for (let x = 0; x < STORY_W; x += 40) { c.fillStyle = (x / 40) % 2 ? '#4c1d95' : '#3b0764'; c.fillRect(x, 0, 40, STORY_GROUND); }
        // pencere: gece Boğazı
        c.fillStyle = '#facc15'; c.fillRect(96, 96, 248, 188);
        c.fillStyle = '#0b1026'; c.fillRect(104, 104, 232, 172);
        c.fillStyle = '#1e3a8a'; c.fillRect(104, 216, 232, 60);
        c.fillStyle = '#fde68a'; for (let i = 0; i < 12; i++) c.fillRect(110 + i * 19, 200 + (i % 3) * 4, 6, 6);
        c.fillStyle = '#facc15'; c.fillRect(216, 104, 8, 172); c.fillRect(104, 186, 232, 8);
        // altın çerçeveli tablo ve avize
        c.fillStyle = '#ca8a04'; c.fillRect(620, 100, 180, 130); c.fillStyle = '#166534'; c.fillRect(632, 112, 156, 106);
        c.fillStyle = '#fde047'; c.font = 'bold 48px monospace'; c.textAlign = 'center'; c.fillText('€', 710, 184);
        c.fillStyle = '#fde68a'; c.fillRect(470, 0, 8, 40); c.fillRect(430, 40, 88, 16);
        for (let i = 0; i < 5; i++) { c.fillStyle = Math.floor(time * 3 + i) % 2 ? '#fef9c3' : '#fde047'; c.fillRect(430 + i * 20, 56, 8, 12); }
        storyGround(c, '#92400e', '#78350f');
    },
    tv(c, time) {
        c.fillStyle = '#0c1445'; c.fillRect(0, 0, STORY_W, STORY_GROUND);
        for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#1e3a8a' : '#172554'; c.fillRect(i * 160, 40, 150, 90); c.fillStyle = 'rgba(96,165,250,0.4)'; c.fillRect(i * 160 + 10, 50, 130, 70); }
        c.fillStyle = '#dc2626'; c.fillRect(40, 150, 140, 40); c.fillStyle = '#fff'; c.font = 'bold 26px monospace'; c.textAlign = 'center';
        if (Math.floor(time * 2) % 2) c.fillText('● ' + storyT('live'), 110, 180);
        c.fillStyle = '#e5e7eb'; c.fillRect(0, 340, STORY_W, 30); c.fillStyle = '#b91c1c'; c.fillRect(0, 340, 260, 30);
        c.fillStyle = '#fff'; c.font = 'bold 18px monospace'; c.textAlign = 'left'; c.fillText(storyT('breaking'), 10, 362);
        c.save(); c.beginPath(); c.rect(262, 340, STORY_W - 262, 30); c.clip();
        c.fillStyle = '#111827'; c.fillText(storyT('ticker'), STORY_W - (time * 80) % (STORY_W + 300), 362);
        c.restore();
        storyGround(c, '#1f2937', '#111827');
    },
    coast(c, time) {
        storySky(c, ['#020617', '#0b1026', '#111a3a', '#1e2a5a']);
        blockStars(c, time); blockMoon(c, 140, 50);
        c.fillStyle = '#0b1a3d'; c.fillRect(0, 300, STORY_W, STORY_GROUND - 300);
        for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(226,232,240,0.4)'; c.fillRect(140 + Math.round(Math.sin(time * 2 + i) * 3) * 4, 308 + i * 16, 48 - i * 4, 4); }
        // otel
        c.fillStyle = '#1f2937'; c.fillRect(620, 140, 260, 160);
        for (let y = 156; y < 290; y += 28) for (let x = 636; x < 870; x += 32) { c.fillStyle = storyHash(x + y) > 0.4 ? '#fde68a' : '#111827'; c.fillRect(x, y, 16, 14); }
        // palmiye
        c.fillStyle = '#78350f'; for (let y = 260; y < STORY_GROUND; y += 20) c.fillRect(470 + Math.round((STORY_GROUND - y) / 60) * 4, y, 16, 20);
        c.fillStyle = '#166534'; [[-60, 0], [-30, -16], [0, -24], [30, -16], [60, 0]].forEach(([dx, dy]) => c.fillRect(486 + dx - 20, 252 + dy, 40, 12));
        storyGround(c, '#e7d7a7', '#c9b27a');
    },
    sky(c, time) {
        storySky(c, ['#0b1026', '#1e1b4b', '#312e81', '#4c1d95', '#701a75']);
        blockStars(c, time); blockMoon(c, 800, 40);
        for (let i = 0; i < 8; i++) {
            const x = ((storyHash(i) * 1200 - time * (60 + i * 20)) % 1200 + 1200) % 1200 - 120, y = 140 + storyHash(i + 3) * 340;
            c.fillStyle = 'rgba(203,213,225,0.35)'; c.fillRect(Math.floor(x / 8) * 8, Math.floor(y / 8) * 8, 120, 24); c.fillRect(Math.floor(x / 8) * 8 + 24, Math.floor(y / 8) * 8 - 16, 64, 16);
        }
        c.fillStyle = '#0b1222'; c.fillRect(0, STORY_GROUND + 40, STORY_W, STORY_H);
        for (let x = 0; x < STORY_W; x += 16) if (storyHash(x) > 0.5) { c.fillStyle = '#fde68a'; c.fillRect(x, STORY_GROUND + 50 + (x % 3) * 8, 4, 4); }
    },
    ankara(c, time) {
        storySky(c, ['#94a3b8', '#a8b5c7', '#cbd5e1', '#e2e8f0']);
        for (let i = 0; i < 4; i++) {
            const x = 20 + i * 240;
            c.fillStyle = '#94a3b8'; c.fillRect(x, 150, 210, STORY_GROUND - 150);
            c.fillStyle = '#cbd5e1'; c.fillRect(x - 8, 136, 226, 16);
            c.fillStyle = '#64748b'; for (let k = 0; k < 6; k++) c.fillRect(x + 14 + k * 34, 170, 12, STORY_GROUND - 170);
            c.fillStyle = '#b91c1c'; c.fillRect(x + 40, 190, 130, 36);
            c.fillStyle = '#fff'; c.font = 'bold 22px monospace'; c.textAlign = 'center'; c.fillText(i % 2 ? 'OHAL' : 'KHK', x + 105, 216);
        }
        for (let i = 0; i < 10; i++) {   // uçuşan kararnameler
            const x = (storyHash(i) * STORY_W + time * 30) % STORY_W, y = (storyHash(i + 7) * 300 + time * 40) % 360;
            c.fillStyle = '#fff'; c.fillRect(Math.floor(x / 4) * 4, Math.floor(y / 4) * 4, 16, 20);
            c.fillStyle = '#b91c1c'; c.fillRect(Math.floor(x / 4) * 4 + 4, Math.floor(y / 4) * 4 + 12, 8, 4);
        }
        storyGround(c, '#9ca3af', '#4b5563');
    },
    snow(c, time) {
        storySky(c, ['#475569', '#64748b', '#94a3b8', '#cbd5e1']);
        for (let i = 0; i < 9; i++) {   // çamlar
            const x = 20 + i * 110, h = 3 + (i % 3);
            for (let k = 0; k < h; k++) { c.fillStyle = '#14532d'; c.fillRect(x + k * 8, 300 + k * -28 + (h * 28 - 84), 64 - k * 16, 28); }
            c.fillStyle = '#f8fafc'; c.fillRect(x + (h - 1) * 8, 300 - (h - 1) * 28 + (h * 28 - 84), 64 - (h - 1) * 16, 6);
        }
        // kırmızı ahır
        c.fillStyle = '#991b1b'; c.fillRect(640, 260, 220, 180);
        for (let k = 0; k < 6; k++) { c.fillStyle = k === 5 ? '#f8fafc' : '#7f1d1d'; c.fillRect(640 + k * 18, 260 - k * 16, 220 - k * 36, 16); }
        c.fillStyle = '#fef2f2'; c.fillRect(712, 340, 76, 100); c.fillStyle = '#991b1b'; c.fillRect(720, 348, 60, 92);
        c.fillStyle = '#1e3a8a'; c.fillRect(560, 380, 36, 24); c.fillStyle = '#475569'; c.fillRect(574, 404, 8, 36);
        c.fillStyle = '#fff'; c.font = 'bold 12px monospace'; c.textAlign = 'center'; c.fillText('USA', 578, 397);
        for (let i = 0; i < 60; i++) {   // kar
            const x = (storyHash(i) * STORY_W + Math.sin(time + i) * 10) % STORY_W, y = (storyHash(i + 5) * STORY_H + time * (30 + storyHash(i) * 40)) % STORY_GROUND;
            c.fillStyle = '#fff'; c.fillRect(Math.floor(x / 4) * 4, Math.floor(y / 4) * 4, 4, 4);
        }
        storyGround(c, '#f8fafc', '#cbd5e1');
    }
});

Object.assign(STORY_PROPS, {
    money(c) {
        for (let i = 0; i < 9; i++) { const x = 640 + (i % 3) * 52, y = STORY_GROUND - 28 - Math.floor(i / 3) * 28; blockRect(c, x, y, 48, 26, '#16a34a'); c.fillStyle = '#bbf7d0'; c.font = 'bold 16px monospace'; c.textAlign = 'center'; c.fillText('€', x + 24, y + 19); }
    },
    phone(c, time) {
        const x = 610, y = 170 + Math.round(Math.sin(time * 20)) * 2;
        blockRect(c, x, y, 40, 70, '#111827'); c.fillStyle = '#60a5fa'; c.fillRect(x + 6, y + 8, 28, 44);
        c.fillStyle = '#fbbf24'; c.font = 'bold 22px monospace'; c.textAlign = 'center';
        if (Math.floor(time * 4) % 2) c.fillText('☎', x + 20, y - 10);
    },
    counter(c, time) {
        const x = 420, y = STORY_GROUND - 120;
        blockRect(c, x, y, 150, 120, '#9ca3af');
        c.fillStyle = '#052e16'; c.fillRect(x + 16, y + 40, 118, 32);
        c.fillStyle = '#4ade80'; c.font = 'bold 22px monospace'; c.textAlign = 'center';
        c.fillText(String(Math.floor(time * 4321) % 1000000).padStart(6, '0'), x + 75, y + 64);
        for (let i = 0; i < 4; i++) { c.fillStyle = '#22c55e'; c.fillRect(x + 20 + i * 30, y - 20 - Math.abs(Math.sin(time * 8 + i)) * 16, 22, 24); }
    },
    tapes(c, time) {
        for (let i = 0; i < 7; i++) {
            const x = 80 + i * 130 + Math.sin(time * 2 + i) * 20, y = 180 + Math.sin(time * 3 + i * 2) * 60 + (i % 2) * 60;
            drawCassette(c, x, y);
        }
    },
    facetime(c, time) {
        const x = 540, y = 166, w = 190, h = 262;
        blockRect(c, x - 12, y - 12, w + 24, h + 24, '#111827', false);
        c.fillStyle = '#1e293b'; c.fillRect(x, y, w, h);
        const f = storyFace('recep');
        c.imageSmoothingEnabled = false;
        if (f) { const fw = w - 20, fh = fw * f.height / f.width; c.drawImage(f, x + 10, y + 30 + Math.sin(time * 6) * 3, fw, fh); }
        c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(x, y, w, 28);
        c.fillStyle = '#4ade80'; c.font = 'bold 16px monospace'; c.textAlign = 'left'; c.fillText('FaceTime', x + 8, y + 20);
        c.fillStyle = Math.floor(time * 3) % 2 ? '#ef4444' : '#7f1d1d'; c.fillRect(x + w - 44, y + 8, 36, 14);
        c.fillStyle = '#fff'; c.font = 'bold 11px monospace'; c.textAlign = 'center'; c.fillText('%3', x + w - 26, y + 19);
    },
    plane(c, time) {
        const x = 330 + Math.sin(time) * 30, y = 260 + Math.sin(time * 1.7) * 20;
        c.fillStyle = '#f8fafc'; c.fillRect(x, y, 260, 44);
        c.fillStyle = '#cbd5e1'; c.fillRect(x + 80, y + 40, 90, 16); c.fillRect(x + 90, y - 20, 70, 20);
        c.fillStyle = '#e30a17'; c.fillRect(x - 10, y - 40, 40, 44); c.fillStyle = '#fff'; c.fillRect(x + 4, y - 26, 12, 12);
        c.fillStyle = '#b91c1c'; c.fillRect(x, y + 22, 260, 6);
        c.fillStyle = '#1e3a8a'; for (let i = 0; i < 8; i++) c.fillRect(x + 60 + i * 20, y + 8, 10, 10);
        c.fillStyle = '#60a5fa'; c.fillRect(x + 224, y + 4, 28, 16);
        c.fillStyle = '#f97316'; c.fillRect(x - 24 - Math.floor(Math.random() * 3) * 8, y + 14, 24, 14);
    },
    jets(c, time) {
        for (let i = 0; i < 3; i++) {
            const x = 760 + i * 50 + Math.sin(time * 2 + i) * 20, y = 140 + i * 110 + Math.sin(time * 3 + i) * 16;
            c.fillStyle = '#64748b'; c.fillRect(x, y, 90, 16); c.fillRect(x + 30, y - 24, 30, 24); c.fillRect(x + 30, y + 16, 30, 20); c.fillRect(x + 76, y - 18, 14, 18);
            c.fillStyle = '#0ea5e9'; c.fillRect(x + 8, y + 2, 18, 8);
            c.fillStyle = '#fb923c'; c.fillRect(x + 90, y + 4, 12 + Math.floor(Math.random() * 2) * 8, 8);
        }
    },
    files(c) {
        [[60, 6], [120, 9], [800, 7], [860, 11]].forEach(([x, n]) => {
            for (let k = 0; k < n; k++) { c.fillStyle = k % 2 ? '#f8fafc' : '#e5e7eb'; c.fillRect(x, STORY_GROUND - 10 - k * 10, 52, 10); }
            c.fillStyle = '#b91c1c'; c.fillRect(x + 10, STORY_GROUND - n * 10 - 6, 32, 10);
        });
    },
    stampBig(c, time) {
        const p = (time * 1.2) % 1, drop = p < 0.3 ? p / 0.3 : 1, x = 480, y = 120 + drop * 150;
        c.fillStyle = '#7c4a1e'; c.fillRect(x - 10, y - 120, 20, 110); c.fillStyle = '#5c3a1a'; c.fillRect(x - 24, y - 140, 48, 24);
        c.fillStyle = '#1f2937'; c.fillRect(x - 70, y - 12, 140, 36); c.fillStyle = '#dc2626'; c.fillRect(x - 74, y + 22, 148, 14);
        if (p > 0.3) {
            c.fillStyle = `rgba(220,38,38,${1 - (p - 0.3)})`; c.font = 'bold 54px monospace'; c.textAlign = 'center';
            c.fillText('KHK', x, y + 96);
        }
    }
});

// --- HİKÂYELER ---
Object.assign(STORIES, {
    3: [
        { bg: 'villa', props: ['counter', 'money'], say: { key: 's3a' }, actors: [] },
        { bg: 'villa', props: ['phone', 'counter'], say: { who: 'recep', key: 's3b' },
          actors: [{ who: 'recep', x: 260, dir: 1, talk: true, wave: true }] },
        { bg: 'villa', props: ['phone', 'counter', 'money'], say: { who: 'phone', key: 's3c' },
          actors: [{ who: 'recep', x: 260, dir: 1, jump: true }] },
        { bg: 'city', props: ['tapes'], say: { key: 's3d' },
          actors: [{ who: 'recep', x: -100, to: 300, dir: 1 }, { who: 'police', x: 1060, to: 700, dir: -1 }] },
        { bg: 'card', card: { title: 'm3t', text: 'm3' } }
    ],
    4: [
        { bg: 'palace', sepia: true, say: { key: 's4a' },
          actors: [{ who: 'recep', x: 360, dir: 1, wave: true }, { who: 'feto', x: 560, dir: -1, wave: true }] },
        { bg: 'palace', sepia: true, say: { who: 'recep', key: 's4b' },
          actors: [{ who: 'recep', x: 360, dir: 1, talk: true }, { who: 'feto', x: 560, dir: -1, jump: true }] },
        { bg: 'city', props: ['ballot'], say: { who: 'feto', key: 's4c' },
          actors: [{ who: 'feto', x: 1060, to: 620, dir: -1, talk: true }] },
        { bg: 'city', props: ['ballot'], say: { who: 'recep', key: 's4d' },
          actors: [{ who: 'recep', x: -100, to: 300, dir: 1, talk: true, wave: true }, { who: 'feto', x: 620, dir: -1 }] },
        { bg: 'card', card: { title: 'm4t', text: 'm4' } }
    ],
    5: [
        { bg: 'coast', say: { key: 's5a' }, actors: [{ who: 'recep', x: 300, dir: 1 }] },
        { bg: 'coast', props: ['phone'], say: { who: 'recep', key: 's5b' }, actors: [{ who: 'recep', x: 300, dir: 1, jump: true, talk: true }] },
        { bg: 'tv', props: ['facetime'], say: { who: 'anchor', key: 's5c' }, actors: [{ who: 'anchor', x: 300, dir: 1, talk: true, wave: true }] },
        { bg: 'tv', props: ['facetime'], say: { who: 'recep', key: 's5d' }, actors: [{ who: 'anchor', x: 300, dir: 1, jump: true }] },
        { bg: 'card', card: { title: 'm5t', text: 'm5' } }
    ],
    6: [
        { bg: 'sky', props: ['plane'], say: { key: 's6a' } },
        { bg: 'sky', props: ['plane', 'jets'], say: { who: 'pilot', key: 's6b' } },
        { bg: 'sky', props: ['plane', 'jets'], say: { who: 'recep', key: 's6c' } },
        { bg: 'card', card: { title: 'm6t', text: 'm6' } }
    ],
    7: [
        { bg: 'ankara', props: ['files'], say: { who: 'recep', key: 's7a' }, actors: [{ who: 'recep', x: 440, dir: 1, talk: true, wave: true }] },
        { bg: 'ankara', props: ['files', 'stampBig'], say: { key: 's7b' }, actors: [] },
        { bg: 'ankara', props: ['files'], say: { who: 'civils', key: 's7c' },
          actors: [{ who: 'teacher', x: 380, dir: 1, jump: true }, { who: 'journalist', x: 560, dir: -1, talk: true, wave: true }] },
        { bg: 'ankara', props: ['files', 'stampBig'], say: { who: 'recep', key: 's7d' },
          actors: [{ who: 'recep', x: 200, dir: 1, talk: true }, { who: 'teacher', x: 640, to: 1100, dir: 1 }, { who: 'journalist', x: 760, to: 1150, dir: 1 }] },
        { bg: 'card', card: { title: 'm7t', text: 'm7' } }
    ],
    8: [
        { bg: 'snow', say: { key: 's8a' }, actors: [{ who: 'feto', x: 520, dir: -1 }] },
        { bg: 'snow', say: { who: 'feto', key: 's8b' }, actors: [{ who: 'feto', x: 520, dir: -1, talk: true, wave: true }] },
        { bg: 'snow', props: ['rain'], say: { who: 'recep', key: 's8c' },
          actors: [{ who: 'recep', x: -100, to: 260, dir: 1, talk: true }, { who: 'feto', x: 520, dir: -1, jump: true }] },
        { bg: 'card', card: { title: 'm8t', text: 'm8' } }
    ],
    end: [
        { bg: 'snow', say: { key: 'e1' }, actors: [{ who: 'recep', x: 300, dir: 1, wave: true }] },
        { bg: 'palace', props: ['rain'], say: { who: 'recep', key: 'e2' },
          actors: [{ who: 'g1', x: 120, dir: 1, jump: true }, { who: 'g2', x: 230, dir: 1 }, { who: 'recep', x: 400, dir: 1, talk: true, wave: true },
                   { who: 'sarraf', x: 560, dir: -1, wave: true }, { who: 'g3', x: 690, dir: -1 }, { who: 'g4', x: 810, dir: -1, jump: true }] },
        { bg: 'palace', props: ['rain'], say: { who: 'gang', key: 'e3' },
          actors: [{ who: 'g1', x: 120, dir: 1, jump: true }, { who: 'g2', x: 230, dir: 1, jump: true, talk: true }, { who: 'recep', x: 400, dir: 1, wave: true },
                   { who: 'sarraf', x: 560, dir: -1, jump: true }, { who: 'g3', x: 690, dir: -1, jump: true, talk: true }, { who: 'g4', x: 810, dir: -1, jump: true }] },
        { bg: 'card', card: { title: 'eT', text: 'e4', go: 'endGo' } }
    ]
});

const STORY_TEXT2 = {
    tr: { flashback: 'YILLAR ÖNCE...', live: 'CANLI', breaking: 'SON DAKİKA', ticker: 'Köprüde tanklar... Cumhurbaşkanı canlı yayında...',
          anchor: 'SPİKER', pilot: 'PİLOT', civils: 'SİVİLLER', endGo: 'BİTİR ▶',
          s3a: '25 Aralık gecesi. Villada para sayma makineleri hiç susmuyor...',
          s3b: 'Alo oğlum! Evdeki bütün paraları sıfırla!',
          s3c: 'Babacığım... hâlâ 30 milyon avro kaldı!',
          s3d: 'Ama bütün konuşmalar kasetlere kaydedilmiş ve şehre saçılmış!',
          m3t: 'GÖREV 3: PARALARI SIFIRLA', m3: 'Kasetleri topla (hepsi montaj!), polisleri rüşvetle sustur, DEV ÇELİK KASA\'yı patlat: kapağı açılınca vur!',
          s4a: 'HIRHIZ ile FETÖ bir zamanlar can ciğer kuzu sarmasıydı...',
          s4b: 'Ne istediler de vermedik? Okul, dershane, polis, hâkim...',
          s4c: 'Şimdi sandık da benim olacak! Hehehe...',
          s4d: 'Sandık namusumuzdur! Ama sayımı biz yaparız!',
          m4t: 'GÖREV 4: SANDIĞI KORU', m4: 'Rüşvet verdiğin polisler bavullarını alıp sürgüne gider! FETÖ\'yü yen, sandığı kurtar!',
          s5a: '15 Temmuz 2016 gecesi, Marmaris. Reis tatilde...',
          s5b: 'Ne?! Tanklar köprüde mi? Çabuk bir televizyon bulun!',
          s5c: 'Sayın seyirciler... Cumhurbaşkanı bize FaceTime ile bağlandı!',
          s5d: 'Herkes sokağa! ...Bir de şarj aleti getirin, %3 kaldı!',
          m5t: 'GÖREV 5: ŞARJ BİTMESİN!', m5: 'Telefonun şarjı azalıyor! Şarj aletlerini topla, tankları rüşvetle teslim al, DARBE TANKI\'nı durdur!',
          s6a: 'Gece yarısı. Reis\'in uçağı İstanbul\'a doğru havalandı...',
          s6b: 'Reis, darbeci jetler peşimizde!',
          s6c: 'Rüşvet zarflarını pencereden atın!',
          m6t: 'GÖREV 6: İSTANBUL\'A UÇ', m6: 'Joystick ile her yöne uç, ZIPLA ile yüksel, zarf at, 12 jeti geri çevir, TANKER UÇAK\'ı indir!',
          s7a: 'Bu darbe bize Allah\'ın lütfu!',
          s7b: 'OHAL ilan edildi. Balyozun yerini KHK damgası aldı...',
          s7c: 'Ama biz öğretmeniz! Gazeteciyiz! Akademisyeniz!',
          s7d: 'Damga herkese yeter!',
          m7t: 'GÖREV 7: BYLOCK\'U KIR', m7: 'Damga hazır ama liste yok! BYLOCK\'un şifresini kır, liste çıksın: herkes ihraç!',
          s8a: 'Pensilvanya, Saylorsburg. FETÖ karlı bir çiftlikte saklanıyor...',
          s8b: 'Burası Amerika! Beni kimse iade edemez! Hehehe...',
          s8c: 'İade dosyasını getirdim! ...Pardon, bu rüşvet zarfıymış.',
          m8t: 'GÖREV 8: PENSİLVANYA', m8: 'Karlı çiftlikte polisleri geç, FETÖ\'yle son kez karşılaş!',
          e1: 'FETÖ yenildi... ama iade dosyası hâlâ yolda.',
          e2: 'Dosyalar kapandı, kasetler montaj, sandık bizde!',
          e3: 'Yaşasın Reis! Ayakkabı kutularımız geri geldi!',
          eT: 'DEVAM EDECEK...', e4: 'Ve hepsi kul hakkıyla mutlu mesut yaşadılar... ya da öyle sandılar. Ama hikâye bitmedi: yeni bölümler yolda!' },
    en: { flashback: 'YEARS AGO...', live: 'LIVE', breaking: 'BREAKING', ticker: 'Tanks on the bridge... The president is live on air...',
          anchor: 'ANCHOR', pilot: 'PILOT', civils: 'CIVILIANS', endGo: 'FINISH ▶',
          s3a: 'The night of December 25. The money counters in the villa never stop...',
          s3b: 'Hello son! Zero out all the money in the house!',
          s3c: 'Daddy... there\'s still 30 million euros left!',
          s3d: 'But every call was taped, and the tapes are all over the city!',
          m3t: 'MISSION 3: ZERO THE MONEY', m3: 'Collect the tapes (they\'re all fake!), bribe the police, crack the GIANT STEEL SAFE: hit it when its door opens!',
          s4a: 'HIRHIZ and FETÖ were once the best of friends...',
          s4b: 'What did they ever ask for that we didn\'t give? Schools, police, judges...',
          s4c: 'Now the ballot box will be mine too! Hehehe...',
          s4d: 'The ballot box is our honour! But we do the counting!',
          m4t: 'MISSION 4: GUARD THE BALLOT BOX', m4: 'Bribed police pack their suitcases and go into exile! Beat FETÖ, save the ballot box!',
          s5a: 'Night of July 15, 2016, Marmaris. The boss is on holiday...',
          s5b: 'What?! Tanks on the bridge? Quick, find a TV!',
          s5c: 'Dear viewers... the president has joined us via FaceTime!',
          s5d: 'Everyone to the streets! ...And bring a charger, I\'m at 3%!',
          m5t: 'MISSION 5: DON\'T LET IT DIE!', m5: 'The phone battery is draining! Grab chargers, bribe the tanks into surrender, stop the COUP TANK!',
          s6a: 'Midnight. The boss\'s plane takes off for Istanbul...',
          s6b: 'Boss, coup jets are on our tail!',
          s6c: 'Throw the bribe envelopes out the window!',
          m6t: 'MISSION 6: FLY TO ISTANBUL', m6: 'Fly in any direction with the joystick, JUMP to climb, throw envelopes, turn back 12 jets, down the TANKER PLANE!',
          s7a: 'This coup is a gift from God!',
          s7b: 'A state of emergency is declared. The hammer is replaced by the decree stamp...',
          s7c: 'But we\'re teachers! Journalists! Academics!',
          s7d: 'There\'s enough stamp for everyone!',
          m7t: 'MISSION 7: CRACK BYLOCK', m7: 'The stamp is ready but there\'s no list! Crack the BYLOCK code, get the list: purge everyone!',
          s8a: 'Saylorsburg, Pennsylvania. FETÖ hides on a snowy farm...',
          s8b: 'This is America! Nobody can extradite me! Hehehe...',
          s8c: 'I brought the extradition file! ...Oops, that\'s a bribe envelope.',
          m8t: 'MISSION 8: PENNSYLVANIA', m8: 'Get past the police on the snowy farm and face FETÖ one last time!',
          e1: 'FETÖ is beaten... but the extradition file is still on its way.',
          e2: 'Cases closed, tapes fake, ballot box ours!',
          e3: 'Long live the boss! Our shoe boxes are back!',
          eT: 'TO BE CONTINUED...', e4: 'And they all lived happily ever after on the people\'s due... or so they thought. But the story isn\'t over: new levels are on the way!' },
    fr: { flashback: 'IL Y A DES ANNÉES...', live: 'DIRECT', breaking: 'FLASH INFO', ticker: 'Des chars sur le pont... Le président en direct...',
          anchor: 'PRÉSENTATRICE', pilot: 'PILOTE', civils: 'CIVILS', endGo: 'TERMINER ▶',
          s3a: 'La nuit du 25 décembre. Les compteuses de la villa ne s\'arrêtent jamais...',
          s3b: 'Allô fiston ! Fais disparaître tout l\'argent de la maison !',
          s3c: 'Papa... il reste encore 30 millions d\'euros !',
          s3d: 'Mais tous les appels ont été enregistrés et les cassettes inondent la ville !',
          m3t: 'MISSION 3 : REMETS L\'ARGENT À ZÉRO', m3: 'Ramasse les cassettes (toutes des montages !), soudoie la police, fais sauter le COFFRE-FORT GÉANT : frappe quand sa porte s\'ouvre !',
          s4a: 'HIRHIZ et FETÖ étaient autrefois les meilleurs amis du monde...',
          s4b: 'Qu\'ont-ils demandé qu\'on ne leur ait pas donné ? Écoles, police, juges...',
          s4c: 'Maintenant l\'urne sera à moi aussi ! Héhéhé...',
          s4d: 'L\'urne, c\'est notre honneur ! Mais c\'est nous qui comptons !',
          m4t: 'MISSION 4 : PROTÈGE L\'URNE', m4: 'Les policiers soudoyés font leur valise et partent en exil ! Bats FETÖ, sauve l\'urne !',
          s5a: 'Nuit du 15 juillet 2016, Marmaris. Le chef est en vacances...',
          s5b: 'Quoi ?! Des chars sur le pont ? Vite, trouvez une télé !',
          s5c: 'Chers téléspectateurs... le président nous rejoint par FaceTime !',
          s5d: 'Tous dans la rue ! ...Et apportez un chargeur, il me reste 3 % !',
          m5t: 'MISSION 5 : GARDE LA BATTERIE !', m5: 'La batterie baisse ! Ramasse des chargeurs, achète la reddition des chars, arrête le TANK DU PUTSCH !',
          s6a: 'Minuit. L\'avion du chef décolle vers Istanbul...',
          s6b: 'Chef, des jets putschistes nous poursuivent !',
          s6c: 'Jetez les enveloppes par la fenêtre !',
          m6t: 'MISSION 6 : VOLE VERS ISTANBUL', m6: 'Vole dans tous les sens au joystick, SAUTE pour monter, lance des enveloppes, repousse 12 jets, abats le RAVITAILLEUR !',
          s7a: 'Ce putsch est un don de Dieu !',
          s7b: 'L\'état d\'urgence est déclaré. Le marteau est remplacé par le tampon des décrets...',
          s7c: 'Mais nous sommes profs ! Journalistes ! Universitaires !',
          s7d: 'Il y a du tampon pour tout le monde !',
          m7t: 'MISSION 7 : CASSE BYLOCK', m7: 'Le tampon est prêt mais pas de liste ! Casse le code BYLOCK, sors la liste : tout le monde radié !',
          s8a: 'Saylorsburg, Pennsylvanie. FETÖ se cache dans une ferme enneigée...',
          s8b: 'Ici c\'est l\'Amérique ! Personne ne peut m\'extrader ! Héhéhé...',
          s8c: 'J\'apporte le dossier d\'extradition ! ...Oups, c\'est une enveloppe.',
          m8t: 'MISSION 8 : PENNSYLVANIE', m8: 'Passe la police dans la ferme enneigée et affronte FETÖ une dernière fois !',
          e1: 'FETÖ est vaincu... mais le dossier d\'extradition est toujours en route.',
          e2: 'Affaires classées, cassettes truquées, l\'urne est à nous !',
          e3: 'Vive le chef ! Nos boîtes à chaussures sont de retour !',
          eT: 'À SUIVRE...', e4: 'Et ils vécurent heureux grâce au bien d\'autrui... du moins le croyaient-ils. Mais l\'histoire n\'est pas finie : de nouveaux niveaux arrivent !' },
    nl: { flashback: 'JAREN GELEDEN...', live: 'LIVE', breaking: 'BREAKING', ticker: 'Tanks op de brug... De president live in beeld...',
          anchor: 'PRESENTATRICE', pilot: 'PILOOT', civils: 'BURGERS', endGo: 'AFSLUITEN ▶',
          s3a: 'De nacht van 25 december. De geldtelmachines in de villa staan nooit stil...',
          s3b: 'Hallo zoon! Laat al het geld in huis verdwijnen!',
          s3c: 'Papa... er is nog 30 miljoen euro over!',
          s3d: 'Maar alle gesprekken zijn opgenomen en de banden liggen door de hele stad!',
          m3t: 'MISSIE 3: ZET HET GELD OP NUL', m3: 'Verzamel de banden (allemaal montage!), koop de politie om, kraak de REUZENKLUIS: sla toe als de deur opengaat!',
          s4a: 'HIRHIZ en FETÖ waren ooit de beste vrienden...',
          s4b: 'Wat vroegen ze dat we niet gaven? Scholen, politie, rechters...',
          s4c: 'Nu wordt de stembus ook van mij! Hehehe...',
          s4d: 'De stembus is onze eer! Maar wij tellen de stemmen!',
          m4t: 'MISSIE 4: BEWAAK DE STEMBUS', m4: 'Omgekochte agenten pakken hun koffer en gaan in ballingschap! Versla FETÖ, red de stembus!',
          s5a: 'Nacht van 15 juli 2016, Marmaris. De baas is op vakantie...',
          s5b: 'Wat?! Tanks op de brug? Snel, zoek een tv!',
          s5c: 'Beste kijkers... de president is via FaceTime verbonden!',
          s5d: 'Iedereen de straat op! ...En breng een oplader, ik zit op 3%!',
          m5t: 'MISSIE 5: HOU DE BATTERIJ VOL!', m5: 'De batterij loopt leeg! Pak opladers, koop de tanks om, stop de COUPTANK!',
          s6a: 'Middernacht. Het vliegtuig van de baas vertrekt naar Istanbul...',
          s6b: 'Baas, couppiloten zitten achter ons aan!',
          s6c: 'Gooi de enveloppen uit het raam!',
          m6t: 'MISSIE 6: VLIEG NAAR ISTANBUL', m6: 'Vlieg alle kanten op met de joystick, SPRING om te stijgen, gooi enveloppen, stuur 12 jets terug, haal het TANKVLIEGTUIG neer!',
          s7a: 'Deze coup is een geschenk van God!',
          s7b: 'De noodtoestand is uitgeroepen. De moker is vervangen door het decreetstempel...',
          s7c: 'Maar wij zijn leraren! Journalisten! Academici!',
          s7d: 'Er is stempel genoeg voor iedereen!',
          m7t: 'MISSIE 7: KRAAK BYLOCK', m7: 'De stempel is klaar, maar er is geen lijst! Kraak de BYLOCK-code, krijg de lijst: iedereen ontslagen!',
          s8a: 'Saylorsburg, Pennsylvania. FETÖ verstopt zich op een besneeuwde boerderij...',
          s8b: 'Dit is Amerika! Niemand kan mij uitleveren! Hehehe...',
          s8c: 'Ik heb het uitleveringsdossier! ...Oeps, dat is een envelop.',
          m8t: 'MISSIE 8: PENNSYLVANIA', m8: 'Kom langs de politie op de besneeuwde boerderij en versla FETÖ voor de laatste keer!',
          e1: 'FETÖ is verslagen... maar het uitleveringsdossier is nog onderweg.',
          e2: 'Dossiers gesloten, banden vals, de stembus is van ons!',
          e3: 'Leve de baas! Onze schoenendozen zijn terug!',
          eT: 'WORDT VERVOLGD...', e4: 'En ze leefden nog lang en gelukkig van andermans geld... dachten ze. Maar het verhaal is nog niet voorbij: er komen nieuwe levels aan!' },
    de: { flashback: 'VOR JAHREN...', live: 'LIVE', breaking: 'EILMELDUNG', ticker: 'Panzer auf der Brücke... Der Präsident live auf Sendung...',
          anchor: 'MODERATORIN', pilot: 'PILOT', civils: 'ZIVILISTEN', endGo: 'BEENDEN ▶',
          s3a: 'Die Nacht des 25. Dezember. Die Geldzählmaschinen in der Villa stehen nie still...',
          s3b: 'Hallo Sohn! Lass alles Geld im Haus verschwinden!',
          s3c: 'Papa... es sind immer noch 30 Millionen Euro übrig!',
          s3d: 'Aber alle Gespräche wurden aufgenommen, und die Bänder liegen in der ganzen Stadt!',
          m3t: 'MISSION 3: SETZ DAS GELD AUF NULL', m3: 'Sammle die Bänder (alles Montage!), besteche die Polizei, knack den RIESEN-TRESOR: schlag zu, wenn die Tür aufgeht!',
          s4a: 'HIRHIZ und FETÖ waren einst die besten Freunde...',
          s4b: 'Was wollten sie, das wir nicht gegeben haben? Schulen, Polizei, Richter...',
          s4c: 'Jetzt gehört auch die Urne mir! Hehehe...',
          s4d: 'Die Urne ist unsere Ehre! Aber zählen tun wir!',
          m4t: 'MISSION 4: BESCHÜTZE DIE URNE', m4: 'Bestochene Polizisten packen ihre Koffer und gehen ins Exil! Besiege FETÖ, rette die Urne!',
          s5a: 'Nacht des 15. Juli 2016, Marmaris. Der Chef ist im Urlaub...',
          s5b: 'Was?! Panzer auf der Brücke? Schnell, sucht einen Fernseher!',
          s5c: 'Liebe Zuschauer... der Präsident ist per FaceTime zugeschaltet!',
          s5d: 'Alle auf die Straße! ...Und bringt ein Ladegerät, ich hab 3%!',
          m5t: 'MISSION 5: AKKU NICHT LEER!', m5: 'Der Akku wird leer! Sammle Ladegeräte, besteche die Panzer zur Kapitulation, stopp den PUTSCH-PANZER!',
          s6a: 'Mitternacht. Das Flugzeug des Chefs hebt Richtung Istanbul ab...',
          s6b: 'Chef, Putsch-Jets sind hinter uns her!',
          s6c: 'Werft die Umschläge aus dem Fenster!',
          m6t: 'MISSION 6: FLIEG NACH ISTANBUL', m6: 'Flieg mit dem Joystick in jede Richtung, SPRINGEN zum Steigen, wirf Umschläge, schick 12 Jets zurück, hol das TANKFLUGZEUG runter!',
          s7a: 'Dieser Putsch ist ein Geschenk Gottes!',
          s7b: 'Der Ausnahmezustand ist ausgerufen. Der Hammer wurde durch den Dekretstempel ersetzt...',
          s7c: 'Aber wir sind Lehrer! Journalisten! Akademiker!',
          s7d: 'Der Stempel reicht für alle!',
          m7t: 'MISSION 7: KNACK BYLOCK', m7: 'Der Stempel ist bereit, aber es gibt keine Liste! Knack den BYLOCK-Code, hol die Liste: alle entlassen!',
          s8a: 'Saylorsburg, Pennsylvania. FETÖ versteckt sich auf einer verschneiten Farm...',
          s8b: 'Das ist Amerika! Niemand kann mich ausliefern! Hehehe...',
          s8c: 'Ich bringe die Auslieferungsakte! ...Ups, das ist ein Umschlag.',
          m8t: 'MISSION 8: PENNSYLVANIA', m8: 'Komm an der Polizei auf der verschneiten Farm vorbei und stell dich FETÖ ein letztes Mal!',
          e1: 'FETÖ ist besiegt... aber die Auslieferungsakte ist immer noch unterwegs.',
          e2: 'Akten geschlossen, Bänder gefälscht, die Urne gehört uns!',
          e3: 'Es lebe der Chef! Unsere Schuhkartons sind zurück!',
          eT: 'FORTSETZUNG FOLGT...', e4: 'Und sie lebten glücklich bis ans Ende ihrer Tage vom Geld anderer... dachten sie. Aber die Geschichte ist nicht vorbei: Neue Level sind unterwegs!' },
    ru: { flashback: 'МНОГО ЛЕТ НАЗАД...', live: 'ЭФИР', breaking: 'СРОЧНО', ticker: 'Танки на мосту... Президент в прямом эфире...',
          anchor: 'ВЕДУЩАЯ', pilot: 'ПИЛОТ', civils: 'ГРАЖДАНЕ', endGo: 'ЗАВЕРШИТЬ ▶',
          s3a: 'Ночь 25 декабря. Счётные машинки на вилле не умолкают...',
          s3b: 'Алло, сынок! Обнули все деньги в доме!',
          s3c: 'Папочка... осталось ещё 30 миллионов евро!',
          s3d: 'Но все разговоры записаны, и кассеты разлетелись по городу!',
          m3t: 'МИССИЯ 3: ОБНУЛИ ДЕНЬГИ', m3: 'Собери кассеты (всё монтаж!), подкупи полицию, взломай ГИГАНТСКИЙ СЕЙФ: бей, когда откроется дверца!',
          s4a: 'Когда-то HIRHIZ и ФЕТÖ были лучшими друзьями...',
          s4b: 'Чего они просили, а мы не дали? Школы, полицию, судей...',
          s4c: 'Теперь и урна будет моей! Хе-хе-хе...',
          s4d: 'Урна — наша честь! Но считаем мы!',
          m4t: 'МИССИЯ 4: ЗАЩИТИ УРНУ', m4: 'Подкупленные полицейские пакуют чемоданы и едут в ссылку! Победи ФЕТÖ, спаси урну!',
          s5a: 'Ночь 15 июля 2016 года, Мармарис. Шеф в отпуске...',
          s5b: 'Что?! Танки на мосту? Быстро найдите телевизор!',
          s5c: 'Дорогие зрители... президент на связи по FaceTime!',
          s5d: 'Все на улицы! ...И принесите зарядку, у меня 3%!',
          m5t: 'МИССИЯ 5: НЕ ДАЙ СЕСТЬ БАТАРЕЕ!', m5: 'Батарея садится! Собирай зарядки, подкупи танки, останови ТАНК ПУТЧА!',
          s6a: 'Полночь. Самолёт шефа взлетает в сторону Стамбула...',
          s6b: 'Шеф, за нами гонятся путчистские истребители!',
          s6c: 'Бросайте конверты со взятками в окно!',
          m6t: 'МИССИЯ 6: ЛЕТИ В СТАМБУЛ', m6: 'Лети в любую сторону джойстиком, ПРЫЖОК — вверх, бросай конверты, разверни 12 истребителей, сбей ЗАПРАВЩИК!',
          s7a: 'Этот путч — дар Божий!',
          s7b: 'Объявлено чрезвычайное положение. Кувалду сменила печать указов...',
          s7c: 'Но мы учителя! Журналисты! Учёные!',
          s7d: 'Печати хватит на всех!',
          m7t: 'МИССИЯ 7: ВЗЛОМАЙ BYLOCK', m7: 'Штамп готов, но списка нет! Взломай код BYLOCK, получи список: уволить всех!',
          s8a: 'Сейлорсберг, Пенсильвания. ФЕТÖ прячется на заснеженной ферме...',
          s8b: 'Это Америка! Меня никто не выдаст! Хе-хе-хе...',
          s8c: 'Я привёз запрос об экстрадиции! ...Ой, это конверт со взяткой.',
          m8t: 'МИССИЯ 8: ПЕНСИЛЬВАНИЯ', m8: 'Пройди полицию на заснеженной ферме и сразись с ФЕТÖ в последний раз!',
          e1: 'ФЕТÖ побеждён... но запрос об экстрадиции всё ещё в пути.',
          e2: 'Дела закрыты, записи — монтаж, урна наша!',
          e3: 'Да здравствует шеф! Наши обувные коробки вернулись!',
          eT: 'ПРОДОЛЖЕНИЕ СЛЕДУЕТ...', e4: 'И жили они долго и счастливо за чужой счёт... по крайней мере, так им казалось. Но история не окончена: новые уровни уже в пути!' }
};
for (const L in STORY_TEXT2) Object.assign(STORY_TEXT[L], STORY_TEXT2[L]);
