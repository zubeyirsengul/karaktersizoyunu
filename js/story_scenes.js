// Hikâye sahne parçaları: zemin, gökyüzü, arka planlar (STORY_BG) ve eşyalar (STORY_PROPS)
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

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
