// Çizim: arka planlar, zemin, torbalar, ana çizim döngüsü (draw)
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// Oyuncu sesleri dil dosyasından geliyor: t("voices")

// --- ÇİZİM ---

function drawKulHakkiBag(ctx, x, y, size, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = "#d4b483";
    ctx.beginPath();
    ctx.moveTo(-size/2, size/2);
    ctx.quadraticCurveTo(-size/1.5, -size/2, 0, -size/1.8);
    ctx.quadraticCurveTo(size/1.5, -size/2, size/2, size/2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#c2a373";
    ctx.fillRect(-size/6, -size/1.6, size/3, size/10);
    ctx.fillStyle = "#4a2c00";
    ctx.font = `bold ${size/6}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(t("bag")[0], 0, -5, size * 0.8);
    ctx.fillText(t("bag")[1], 0, 10, size * 0.8);
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function drawDollarBill(ctx, x, y, size, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(-size, -size/2, size*2, size);
    ctx.strokeStyle = "#14532d";
    ctx.lineWidth = 1;
    ctx.strokeRect(-size, -size/2, size*2, size);
    ctx.fillStyle = "#f0fdf4";
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#166534";
    ctx.font = `bold ${size}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", 0, 0);
    ctx.restore();
}

// Rüşvet zarfı: kahverengi zarf, ağzından dolar destesi taşar, üstünde "RÜŞVET" damgası (dile göre)
function drawBribe(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(angle) * 0.5);           // tam dönmez, sallanarak uçar
    const w = 46, h = 30;
    // zarftan taşan banknotlar
    ctx.fillStyle = "#16a34a"; ctx.fillRect(-w / 2 + 5, -h / 2 - 9, w - 14, 12);
    ctx.fillStyle = "#22c55e"; ctx.fillRect(-w / 2 + 9, -h / 2 - 13, w - 16, 12);
    ctx.fillStyle = "#14532d"; ctx.font = "bold 10px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("$$", 0, -h / 2 - 7);
    // zarf gövdesi ve kapak
    ctx.fillStyle = "#c08a4a"; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = "#7c4f1f"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(0, 2); ctx.lineTo(w / 2, -h / 2); ctx.stroke();
    // damga
    ctx.fillStyle = "#b91c1c"; ctx.font = "bold 9px Arial";
    ctx.fillText(t("bribe"), 0, h / 2 - 7, w - 6);
    ctx.restore();
}

// --- ARKA PLAN: bölüme göre paralaks katmanlar ---
// 1: gündüz, yeşil tepeler ve ağaçlar · 2: bozkırda gün batımı, yurtlar · 3: gece şehri, projektörler
const THEMES = {
    hills: { sky: ["#38bdf8", "#7dd3fc", "#e0f2fe", "#fef9c3"], sun: { x: 0.8, y: 0.17, r: 44, c: "#fde68a", glow: "rgba(253,224,71,0.35)" },
         clouds: "rgba(255,255,255,0.92)",
         ground: ["#7a4a24", "#3b2412"], grass: "#4caf2f", grassDark: "#2e6b1c" },
    steppe: { sky: ["#1e1b4b", "#831843", "#ea580c", "#fcd34d"], sun: { x: 0.3, y: 0.6, r: 70, c: "#fdba74", glow: "rgba(251,146,60,0.45)" },
         clouds: "rgba(253,186,116,0.5)",
         ground: ["#8a5a2b", "#4a2f15"], grass: "#b5a642", grassDark: "#7c6f2a" },
    city: { sky: ["#020617", "#0f172a", "#1e3a8a"], moon: { x: 0.82, y: 0.15, r: 32 }, stars: true,
         ground: ["#3f3f46", "#18181b"], grass: "#9ca3af", grassDark: "#4b5563", curb: true }
};
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// Yumuşak tepe profili (-1..1): farklı frekanslı sinüslerin toplamı
const ridge = (x, seed) => 0.5 * Math.sin(x * 0.0021 + seed) + 0.3 * Math.sin(x * 0.0053 + seed * 2.3) + 0.2 * Math.sin(x * 0.013 + seed * 4.1);
const hillY = (sx, par, base, amp, seed) => base - amp * (1 + ridge(sx + camX * par, seed));
let skyCache = null;

function hillLayer(par, base, amp, seed, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let sx = 0; sx <= width + 12; sx += 12) ctx.lineTo(sx, hillY(sx, par, base, amp, seed));
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
}

// Katman üzerinde aralıklı nesneler (ağaç, yurt): her biri dünyada sabit yerde durur
function layerProps(par, spacing, chance, seed, fn) {
    const off = camX * par;
    for (let i = Math.floor(off / spacing) - 1; i <= Math.ceil((off + width) / spacing) + 1; i++) {
        if (hash(i * 1.31 + seed) > chance) continue;
        fn(i * spacing + hash(i * 2.7 + seed) * spacing * 0.6 - off, i);
    }
}

function cloud(x, y, s) {
    ctx.beginPath();
    [[0, 0, 30], [35, -16, 38], [76, 0, 30], [38, 8, 32]].forEach(([dx, dy, r]) => {
        ctx.moveTo(x + dx * s + r * s, y + dy * s);
        ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
    });
    ctx.fill();
}

function skyline(par, base, minH, maxH, color, windowColor, seed) {
    const step = 70, off = camX * par;
    for (let i = Math.floor(off / step) - 2; i <= Math.ceil((off + width) / step) + 1; i++) {
        const bw = 50 + hash(i * 2.11 + seed) * 60, bh = minH + hash(i * 1.37 + seed) * (maxH - minH);
        const sx = i * step - off + (hash(i * 3.3 + seed) - 0.5) * 20, top = base - bh;
        ctx.fillStyle = color;
        ctx.fillRect(sx, top, bw, height - top);
        if (hash(i * 4.1 + seed) > 0.7) ctx.fillRect(sx + bw / 2 - 1, top - 18, 2, 18);   // anten
        if (!windowColor) continue;
        ctx.fillStyle = windowColor;
        const cols = Math.floor((bw - 14) / 13), rows = Math.floor((bh - 16) / 16);
        for (let r = 0; r < rows; r++)
            for (let c = 0; c < cols; c++)
                if (hash(i * 91.7 + r * 7.3 + c * 3.1 + seed) > 0.62) ctx.fillRect(sx + 8 + c * 13, top + 10 + r * 16, 6, 9);
    }
}

function drawBackground() {
    const bg = LEVELS[currentLevel].bg, th = THEMES[bg], time = performance.now() / 1000;
    if (!skyCache || skyCache.h !== height || skyCache.lvl !== currentLevel) {
        const g = ctx.createLinearGradient(0, 0, 0, height);
        th.sky.forEach((c, i) => g.addColorStop(i / (th.sky.length - 1), c));
        skyCache = { g, h: height, lvl: currentLevel };
    }
    ctx.fillStyle = skyCache.g;
    ctx.fillRect(0, 0, width, height);

    // Yıldızlar (yanıp söner)
    if (th.stars) {
        ctx.fillStyle = "#fff";
        for (let i = 0; i < 160; i++) {
            const x = ((hash(i) * 3000 - camX * 0.02) % 3000 + 3000) % 3000;
            if (x > width) continue;
            ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * (1 + hash(i + 0.2) * 3) + i));
            const s = hash(i + 0.9) > 0.85 ? 2.5 : 1.5;
            ctx.fillRect(x, hash(i + 0.5) * height * 0.6, s, s);
        }
        ctx.globalAlpha = 1;
    }

    // Güneş / ay, etrafında hale
    const orb = th.sun || th.moon;
    const ox = width * orb.x, oy = height * orb.y;
    const glow = ctx.createRadialGradient(ox, oy, orb.r * 0.5, ox, oy, orb.r * 4);
    glow.addColorStop(0, th.sun ? orb.glow : "rgba(226,232,240,0.25)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(ox - orb.r * 4, oy - orb.r * 4, orb.r * 8, orb.r * 8);
    ctx.fillStyle = th.sun ? orb.c : "#f1f5f9";
    ctx.beginPath(); ctx.arc(ox, oy, orb.r, 0, Math.PI * 2); ctx.fill();
    if (th.moon) {
        ctx.fillStyle = "rgba(148,163,184,0.45)";
        [[-10, -6, 7], [9, 8, 5], [6, -12, 4]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(ox + dx, oy + dy, r, 0, Math.PI * 2); ctx.fill(); });
    }

    // Bulutlar: rüzgârla yavaşça kayar
    if (th.clouds) {
        ctx.fillStyle = th.clouds;
        const P = Math.max(4200, width + 800);
        for (let i = 0; i < 9; i++) {
            const x = (((hash(i * 3.1) * P + time * (6 + hash(i) * 8) - camX * 0.12) % P) + P) % P - 300;
            if (x > width + 50) continue;
            cloud(x, height * (0.08 + hash(i * 7.7) * 0.28), 0.7 + hash(i * 5.3) * 0.8);
        }
    }

    if (bg === 'hills') {
        hillLayer(0.08, height * 0.6, 80, 1.3, "#93a8c8");          // uzak dağlar (soluk mavi)
        hillLayer(0.22, height * 0.74, 42, 4.2, "#6a9a4c");         // orta tepeler
        const nb = height * 0.85;
        hillLayer(0.45, nb, 24, 7.9, "#3f7a33");                    // yakın tepeler + ağaçlar
        layerProps(0.45, 150, 0.55, 2, (sx, i) => {
            const y = hillY(sx, 0.45, nb, 24, 7.9) + 4, s = 0.8 + hash(i * 9.1) * 0.6;
            ctx.fillStyle = "#4a2e16"; ctx.fillRect(sx - 3 * s, y - 22 * s, 6 * s, 22 * s);
            ctx.fillStyle = "#2f6b2a";
            ctx.beginPath(); ctx.arc(sx, y - 34 * s, 18 * s, 0, Math.PI * 2); ctx.arc(sx - 12 * s, y - 24 * s, 12 * s, 0, Math.PI * 2); ctx.arc(sx + 12 * s, y - 24 * s, 12 * s, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.12)";
            ctx.beginPath(); ctx.arc(sx - 5 * s, y - 40 * s, 8 * s, 0, Math.PI * 2); ctx.fill();
        });
    } else if (bg === 'steppe') {
        hillLayer(0.08, height * 0.62, 85, 2.1, "#6b2f5f");         // güneşin battığı mor dağlar
        const mb = height * 0.76;
        hillLayer(0.22, mb, 28, 5.5, "#8a4a2a");                    // bozkır
        layerProps(0.22, 650, 0.5, 5, sx => {                       // yurtlar
            const y = hillY(sx, 0.22, mb, 28, 5.5) + 6;
            ctx.fillStyle = "#f3e3c3"; ctx.fillRect(sx - 30, y - 26, 60, 26);
            ctx.beginPath(); ctx.ellipse(sx, y - 26, 32, 18, 0, Math.PI, 0); ctx.fill();
            ctx.fillStyle = "#b91c1c"; ctx.fillRect(sx - 30, y - 22, 60, 5);
            ctx.fillStyle = "#3f1d0b"; ctx.fillRect(sx - 7, y - 16, 14, 16);
            ctx.fillStyle = "#7c2d12"; ctx.fillRect(sx - 2, y - 48, 4, 6);
        });
        hillLayer(0.45, height * 0.87, 16, 8.4, "#5a3317");
        // Kartallar süzülür
        ctx.strokeStyle = "#1e1b4b"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
        for (let i = 0; i < 4; i++) {
            const x = (((time * (30 + i * 7) + i * 420 - camX * 0.05) % (width + 300)) + width + 300) % (width + 300) - 150;
            const y = height * (0.2 + 0.08 * i) + Math.sin(time * 0.8 + i) * 12, f = Math.sin(time * 4 + i) * 6;
            ctx.beginPath(); ctx.moveTo(x - 14, y - 4 - f); ctx.quadraticCurveTo(x - 6, y - 8, x, y); ctx.quadraticCurveTo(x + 6, y - 8, x + 14, y - 4 - f); ctx.stroke();
        }
    } else if (bg !== 'city') {
        drawChapterBackground(bg, time);
    } else {
        // Projektörler gökyüzünü tarar (mavi ve kırmızı: 17/25 gecesi)
        [[0.25, "rgba(147,197,253,0.16)", 0], [0.7, "rgba(252,165,165,0.12)", 2]].forEach(([fx, col, ph]) => {
            const x = width * fx, y = height * 0.85, a = Math.sin(time * 0.6 + ph) * 0.5, L = height * 1.3;
            const g = ctx.createLinearGradient(x, y, x + Math.sin(a) * L, y - Math.cos(a) * L);
            g.addColorStop(0, col); g.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(x - 6, y);
            ctx.lineTo(x + Math.sin(a - 0.07) * L, y - Math.cos(a - 0.07) * L);
            ctx.lineTo(x + Math.sin(a + 0.07) * L, y - Math.cos(a + 0.07) * L);
            ctx.lineTo(x + 6, y); ctx.closePath(); ctx.fill();
        });
        skyline(0.15, height * 0.74, 60, 210, "#1e293b", "rgba(253,230,138,0.35)", 1);
        skyline(0.35, height * 0.88, 80, 260, "#0b1222", "rgba(253,224,71,0.8)", 7);
    }
    drawNewsBoards(time);   // bölümün olayını anlatan TV ekranları ve gazeteler (js/newsbg.js)
}

// Zemin ve platformlar: toprak katmanı + çimen (3. bölümde kaldırım)
// Havadaki raf: kırılabilir tuğlalarla aynı tuğla dokusu (15 px sıra, 30 px tuğla, şaşırtmalı dizilim)
function drawBrickLedge(ctx, p) {
    const C = 15, B = 30;
    ctx.fillStyle = "#d6d3d1"; ctx.fillRect(p.x, p.y, p.w, p.h);   // harç
    for (let row = 0; row * C < p.h; row++) {
        const y = p.y + row * C, off = row % 2 ? B / 2 : 0;
        for (let bx = p.x - off; bx < p.x + p.w; bx += B) {
            const l = Math.max(p.x + 1, bx + 1), r = Math.min(p.x + p.w - 1, bx + B - 1);
            if (r <= l) continue;
            const shade = hash(bx * 0.13 + row * 7.1);
            ctx.fillStyle = shade > 0.66 ? "#b45309" : shade > 0.33 ? "#9a3412" : "#7c2d12";
            ctx.fillRect(l, y + 1, r - l, C - 2);
            ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(l, y + 1, r - l, 3);
        }
    }
    ctx.fillStyle = "#e7e5e4"; ctx.fillRect(p.x - 4, p.y - 4, p.w + 8, 6);          // üstte taş kapak
    ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(p.x - 4, p.y + 2, p.w + 8, 2);
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(p.x, p.y + p.h, p.w, 6);        // altında gölge
    ctx.strokeStyle = "rgba(0,0,0,0.45)"; ctx.lineWidth = 2; ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
}

function drawPlatform(ctx, p) {
    const th = THEMES[LEVELS[currentLevel].bg];
    const x0 = Math.max(p.x, camX - 40), x1 = Math.min(p.x + p.w, camX + width + 40);
    if (x1 <= x0) return;
    if (p.kind === 'bridge') { drawBridge(ctx, p); return; }   // 2. bölüm: SINAYPIRCI'nın köprüsü (saygili.js)
    if (p.h < 100) { drawBrickLedge(ctx, p); return; }   // zemin değil: tuğla raf
    const g = ctx.createLinearGradient(0, p.y, 0, p.y + Math.min(p.h, 220));
    g.addColorStop(0, th.ground[0]); g.addColorStop(1, th.ground[1]);
    ctx.fillStyle = g;
    ctx.fillRect(x0, p.y, x1 - x0, p.h);
    // Toprakta taşlar
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    const depth = Math.min(p.h, 140);
    for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40)
        for (let r = 0; r < 3; r++) {
            const hh = hash(x * 0.37 + r * 11 + p.y * 0.01);
            const sy = p.y + 24 + r * (depth - 30) / 3 + hh * 8;
            if (hh > 0.5 && sy < p.y + p.h - 6) ctx.fillRect(x + hh * 30, sy, 7, 4);
        }
    ctx.fillStyle = th.grass; ctx.fillRect(x0, p.y, x1 - x0, 14);
    ctx.fillStyle = th.grassDark; ctx.fillRect(x0, p.y + 14, x1 - x0, 4);
    if (th.curb) {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        for (let x = Math.ceil(x0 / 60) * 60; x < x1; x += 60) ctx.fillRect(x, p.y, 3, 14);
    } else {
        ctx.fillStyle = th.grass;
        for (let x = Math.ceil(x0 / 18) * 18; x < x1; x += 18) {
            const hh = hash(x * 0.11);
            ctx.beginPath(); ctx.moveTo(x - 4, p.y + 1); ctx.lineTo(x + (hh - 0.5) * 6, p.y - 5 - hh * 9); ctx.lineTo(x + 4, p.y + 1); ctx.fill();
        }
    }
}


function draw() {
    ctx.clearRect(0,0,width,height);
    if (isFlight()) { drawFlight(); return; }
    if (isPuzzle()) return;   // bulmaca ekranı canvas'ın üstünde
    drawBackground();
    ctx.save();
    const [shx, shy] = shakeOffset();
    ctx.translate(-camX + shx, shy);

    drawPits(ctx);
    drawCheckpointFlag(ctx);
    platforms.forEach(p => drawPlatform(ctx, p));
    drawBricks(ctx);
    if(gate) drawGate(ctx, gate);

    items.forEach(it => { if(it.collected) return; if(it.power) drawPowerOrb(ctx, it); else if(!drawChapterItem(ctx, it)) drawKulHakkiBag(ctx, it.x, it.y, 80); });
    enemies.forEach(en => {
        if(en.dead && en.deathT >= DEATH_FRAMES) return;
        ctx.save();
        const leaves = en.dead && enemyLeaves(en) && en.kind !== 'tank';   // 4. bölümde tutuklanan asker kelepçeli yürüyüp gider
        if(en.dead) (leaves ? applyExilePose : applyDeathPose)(ctx, en);
        else if(en.hurt > 0 && Math.floor(en.hurt / 4) % 2) ctx.globalAlpha = 0.4;   // vurulunca yanıp söner
        if(LEVELS[currentLevel].army && drawArmy(ctx, en)) {}   // 4. bölüm: darbeci askerler (js/temmuz.js)
        else if(en.skin) drawGeziHero(ctx, en);   // 1. bölüm: Gezi kahramanları
        else if(en.kind === 'duran') drawDuran(ctx, en);
        else if(en.kind === 'riot') drawRiot(ctx, en);
        else if(en.kind === 'sniper') { drawSniper(ctx, en); if(en.nameKey && !en.dead) drawEnemyName(ctx, en); }
        else if(en.kind === 'tank') drawTank(ctx, en);
        else if(en.kind === 'civil') drawCivil(ctx, en);
        else drawPolice(ctx, en);
        if(leaves) drawSuitcase(ctx, en);
        ctx.restore();
    });
    enemies.forEach(en => { if(en.kind === 'sniper') drawSniperLaser(ctx, en); });
    drawSeloCell(ctx);   // 9. bölüm: hücredeki Selo
    if(boss) drawBoss(ctx, boss);
    grannies.forEach(g => drawGranny(ctx, g));

    drawStarAura(ctx);
    ctx.save();
    ctx.translate(player.x + player.w/2, player.y + player.h/2);
    ctx.globalAlpha = player.opacity * (player.invuln > 0 && Math.floor(player.invuln / 5) % 2 ? 0.3 : 1);
    if(player.isDying) ctx.rotate(player.deathAngle);
    if(player.dir === -1 && !player.isDying) ctx.scale(-1, 1);

    const playerMoving = player.grounded && Math.abs(player.vx) > 1;
    ctx.translate(0, player.h / 2);   // çizim orijini: ayakların ortası
    if(player.squash && !player.isDying) ctx.scale(1 + player.squash, 1 - player.squash);   // inişte ezilir, kalkışta uzar (ayaklar yerinde kalır)
    drawRecep(ctx, { h: player.h, phase: player.legCycle, moving: playerMoving, airborne: !player.grounded,
                     mouthOpen: player.mouthOpen, hammerAngle: hammerAngle(), sack: sackFill, shield: player.shield, bigHammer: power.hammer > 0,
                     dir: player.dir === -1 && !player.isDying ? -1 : 1 });
    ctx.restore();

    playerProjectiles.forEach(p => {
        drawBribe(ctx, p.x, p.y, p.angle);
    });

    projectiles.forEach(p => {
        if(PROJECTILES[p.type]) PROJECTILES[p.type][1](ctx, p);
        else if(p.type === 'fire') drawFire(ctx, p);
        else if(p.type === 'wave') drawWave(ctx, p);
        else if(p.type === 'dollar1') (DOLLAR_SKINS[p.skin] || drawOneDollar)(ctx, p.x, p.y, p.angle);
        else if(p.type === 'bullet') drawBullet(ctx, p);
        else if(p.type === 'gas') drawGasShell(ctx, p);
    });

    drawBrickFx(ctx);
    drawParticles(ctx);

    ctx.restore();
    ctx.globalAlpha = 1;
    if(boss && !boss.dying) drawBossBar(ctx, boss);
    drawGateHint(ctx);
    drawPowerHud(ctx);
    drawChapterHud(ctx);
    drawBossOutro(ctx);
    drawScreenOverlays(ctx);
}

function drawParticles(ctx) {
    particles.forEach(p => {
        ctx.globalAlpha = p.life / (p.maxLife || 1);
        if(p.text) {
            ctx.fillStyle = p.color;
            ctx.font = "bold 40px Arial";
            ctx.textAlign = "center";
            ctx.lineWidth = 5; ctx.strokeStyle = "rgba(0,0,0,0.6)";   // açık gökyüzünde de okunsun
            ctx.strokeText(p.text, p.x, p.y);
            ctx.fillText(p.text, p.x, p.y);
        } else {
            ctx.fillStyle = p.color || "white";
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        }
    });

}

// Duraklatma ekranı ve beyaz parlama
function drawScreenOverlays(ctx) {
    if(userPaused) {
        ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, width, height);
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "#fbbf24"; ctx.font = "bold 56px Arial"; ctx.fillText(t("pausedTitle"), width / 2, height / 2 - 20);
        ctx.fillStyle = "#fff"; ctx.font = "20px Arial"; ctx.fillText(t("pausedHint"), width / 2, height / 2 + 30);
        ctx.textBaseline = "alphabetic";
    }
    if(screenFlash > 0) { ctx.fillStyle = `rgba(255,255,255,${screenFlash})`; ctx.fillRect(0, 0, width, height); }
}
