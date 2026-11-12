// 6. bölüm: uçuş modu. Recep'in uçağı Marmaris'ten İstanbul'a uçar; ekran kendiliğinden ilerler.
// Joystick / A-D-W-S (ok tuşları) ile her yöne uçulur, ZIPLA yukarı fırlatır, rüşvet zarfı düz gider.
// Darbeci jetler sağdan gelir ve füze atar; hedef sayısı kadar jet geri dönünce TANKER UÇAK gelir.
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

const FLIGHT_SPEED = 4, PLANE_W = 190, PLANE_H = 80;
let flight = null;
const isFlight = () => curLevel().mode === 'flight';

function createFlight() {
    flight = { jets: [], spawnT: 90 };
    platforms = []; pits = [];
    player.w = PLANE_W; player.h = PLANE_H;
    player.x = 160; player.y = height * 0.4; camX = 0;
    for (let i = 0; i < 40; i++) items.push({ x: 1100 + i * 850, y: 110 + Math.random() * (height - 300), collected: false });
}

function flightSpawnBoss() {
    const T = BOSS_TYPES.tanker;
    boss = { kind: 'tanker', T, x: camX + width + 60, y: height * 0.25, w: T.w, h: T.h, hp: bossMaxHp({ T }), dir: -1, look: -1,
             timer: 0, attacks: 0, hurt: 0, anim: 0, dying: false, deathT: 0, state: 'enter', run: 0, crouch: 0, recover: 0, vx: 0, vy: 0 };
    flight.jets = [];
    bossCheckpoint = { score, stage: 'boss' };
    createParticle(player.x + player.w / 2, player.y - 30, t("bossIntro"), "#f97316", 2.5);
    boss.talk = 110;
}

function flightKillJet(j) {
    if (j.dead) return;
    j.dead = true; j.deathT = 0;
    killedEnemies++;
    $('kills').innerText = killedEnemies;
    $('score').innerText = addScore(3000);
    createParticle(j.x, j.y - 20, t("surrender"), "#f8fafc", 1.0);
    playSfx('hit', { rate: 0.9, vol: 0.6 });
    if (killedEnemies === targetKills && !boss) flightSpawnBoss();
}

const rectHit = (ax, ay, aw, ah, bx, by, bw, bh) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
// Uçağın vurulabilir gövdesi (kanat uçları sayılmaz)
const planeBox = () => [player.x + 20, player.y + 18, player.w - 50, player.h - 34];

function updateFlight() {
    if (!player.isDying) {
        const ax = keys.a ? -1 : keys.d ? 1 : joyDir;
        const ay = keys.w ? -1 : keys.s ? 1 : joyDirY;
        player.shield = shieldHeld;
        if (player.invuln > 0) player.invuln--;
        if (player.knock > 0) player.knock--;
        player.vx += (ax * 7 - player.vx) * 0.18;
        player.vy += (ay * 6.5 - player.vy) * 0.18;
        player.x += FLIGHT_SPEED + player.vx;
        player.y += player.vy;
        player.x = Math.max(camX + 20, Math.min(player.x, camX + width - player.w - (boss ? 420 : 120)));
        player.y = Math.max(64, Math.min(player.y, height - player.h - 24));
        player.dir = 1;
        if (player.mouthOpen > 0) player.mouthOpen -= 0.05;
    } else {
        player.x += FLIGHT_SPEED; player.y += 5; player.deathAngle += 0.03; player.opacity -= 0.008;
    }
    camX += FLIGHT_SPEED;

    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 1 / 60; });
    particles = particles.filter(p => p.life > 0);

    const [px, py, pw, ph] = planeBox();
    items.forEach(it => {
        if (!it.collected && Math.hypot(player.x + player.w / 2 - it.x, player.y + player.h / 2 - it.y) < 90) {
            it.collected = true;
            $('score').innerText = addScore(5000);
            $('sfx-pickup').currentTime = 0; $('sfx-pickup').play().catch(() => {});
            createParticle(it.x, it.y, t("pickup"), "#22c55e", 0.8);
        }
    });

    // Darbeci jetler
    if (!boss && !levelEnding && --flight.spawnT <= 0) {
        flight.spawnT = 55 + Math.random() * 45;
        const y = 80 + Math.random() * (height - 260);
        flight.jets.push({ x: camX + width + 80, y, baseY: y, ph: Math.random() * 6, vx: -2.5 - Math.random() * 2, cool: 50 + Math.random() * 60, dead: false, deathT: 0, t: 0 });
    }
    flight.jets.forEach(j => {
        j.t++;
        if (j.dead) { j.deathT++; j.y += 4 + j.deathT * 0.1; j.x += FLIGHT_SPEED + 1; return; }
        j.x += j.vx;
        j.y = j.baseY + Math.sin(j.t * 0.04 + j.ph) * 40;
        if (--j.cool <= 0 && j.x - camX < width - 40 && j.x > player.x + 160 && !player.isDying) {
            j.cool = 100 + Math.random() * 40;
            const vy = Math.max(-3, Math.min(3, (player.y + player.h / 2 - j.y) / 60));
            projectiles.push({ type: 'missile', x: j.x - 30, y: j.y + 6, vx: -9, vy, active: true, life: 220, angle: 0 });
        }
        if (!player.isDying && rectHit(px, py, pw, ph, j.x - 55, j.y - 16, 110, 32)) { flightKillJet(j); die(); }
    });
    flight.jets = flight.jets.filter(j => j.x > camX - 250 && j.deathT < 120);

    // Rüşvet zarfları düz gider
    playerProjectiles.forEach(p => {
        p.x += p.vx; p.angle += 0.2; p.life--;
        flight.jets.forEach(j => { if (!j.dead && p.active && Math.abs(p.x - j.x) < 60 && Math.abs(p.y - j.y) < 30) { p.active = false; flightKillJet(j); } });
        if (boss && !boss.dying && p.active && rectHit(p.x - 10, p.y - 10, 20, 20, boss.x + 20, boss.y + 20, boss.w - 40, boss.h - 40)) { p.active = false; damageBoss(1); }
    });
    playerProjectiles = playerProjectiles.filter(p => p.active && p.life > 0 && p.x < camX + width + 100);

    projectiles.forEach(p => {
        if (p.type === 'fire') { p.x += p.vx; updateFire(p); return; }
        p.x += p.vx; p.y += p.vy; p.life--; p.angle = Math.atan2(p.vy, p.vx);
        if (player.isDying || !p.active) return;
        if (rectHit(px, py, pw, ph, p.x - 14, p.y - 5, 28, 10)) {
            if (player.shield && p.vx < 0) blockProjectile(p); else { p.active = false; die(); }
        }
    });
    projectiles = projectiles.filter(p => p.active && p.life > 0);

    if (boss) updateTanker(boss);
    updatePowers();
    checkBest();
}

// --- TANKER UÇAK (6. bölüm sonu canavarı) ---
BOSS_TYPES.tanker = { say: "İNİŞ İZNİ YOK!", w: 360, h: 140, scale: 1, hp: 20, nameKey: "tankerName", labelY: 20, update: () => {}, draw: drawTanker };

function updateTanker(b) {
    b.anim++;
    if (b.dying) { b.deathT++; b.y += 3; b.x += FLIGHT_SPEED - 1; if (b.deathT > 90) boss = null; return; }
    if (b.hurt > 0) b.hurt--;
    const tx = camX + width - b.w - 30;
    if (b.state === 'enter') { b.x += (tx - b.x) * 0.04 + FLIGHT_SPEED; if (Math.abs(b.x - tx) < 8) b.state = 'fight'; }
    else b.x = tx + Math.sin(b.anim * 0.03) * 24;
    b.y = height * 0.22 + (Math.sin(b.anim * 0.015) * 0.5 + 0.5) * (height * 0.5 - b.h * 0.3);
    if (b.talk > 0) { b.talk--; return; }
    if (!player.isDying && ++b.timer > 70) {
        b.timer = 0; b.attacks++;
        const mx = b.x + 20, my = b.y + b.h * 0.55;
        if (b.attacks % 2) {
            for (let i = -2; i <= 2; i++) projectiles.push({ type: 'missile', x: mx, y: my, vx: -8, vy: i * 1.6, active: true, life: 220, angle: 0 });
            createParticle(mx, b.y - 10, "FÜZE!", "#fca5a5", 0.9);
        } else {
            const d = Math.hypot(player.x - mx, player.y + player.h / 2 - my) || 1;
            [0, 10, 20].forEach(k => setTimeout(() => {
                if (boss && !boss.dying) projectiles.push({ type: 'missile', x: boss.x + 20, y: boss.y + boss.h * 0.55, vx: (player.x - mx) / d * 10, vy: (player.y + player.h / 2 - my) / d * 10, active: true, life: 220, angle: 0 });
            }, k * 16));
        }
    }
    const [px, py, pw, ph] = planeBox();
    if (!player.isDying && rectHit(px, py, pw, ph, b.x + 30, b.y + 30, b.w - 60, b.h - 50)) die();
}

// --- ÇİZİMLER ---
function drawRecepPlane(ctx) {
    const tm = performance.now() / 1000;
    ctx.save();
    ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
    ctx.globalAlpha = player.opacity * (player.invuln > 0 && Math.floor(player.invuln / 5) % 2 ? 0.3 : 1);
    ctx.rotate(player.isDying ? player.deathAngle : Math.max(-0.2, Math.min(0.2, player.vy * 0.03)));
    // motor alevi
    ctx.fillStyle = "#f97316"; ctx.beginPath(); ctx.moveTo(-92, -6); ctx.lineTo(-120 - Math.random() * 18, 0); ctx.lineTo(-92, 6); ctx.fill();
    // kanatlar ve kuyruk
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath(); ctx.moveTo(-10, 6); ctx.lineTo(-50, 40); ctx.lineTo(-22, 40); ctx.lineTo(30, 8); ctx.fill();
    ctx.fillStyle = "#e30a17"; ctx.beginPath(); ctx.moveTo(-70, -6); ctx.lineTo(-92, -40); ctx.lineTo(-74, -40); ctx.lineTo(-50, -6); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-76, -24, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e30a17"; ctx.beginPath(); ctx.arc(-74.5, -24, 5, 0, Math.PI * 2); ctx.fill();
    // gövde
    const g = ctx.createLinearGradient(0, -18, 0, 18);
    g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#cbd5e1");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 95, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#b91c1c"; ctx.fillRect(-80, 2, 150, 5);
    ctx.fillStyle = "#1e3a8a"; for (let i = 0; i < 7; i++) ctx.fillRect(-50 + i * 14, -6, 7, 6);
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath(); ctx.moveTo(-10, 2); ctx.lineTo(-40, -30); ctx.lineTo(-18, -30); ctx.lineTo(28, 0); ctx.fill();
    // kokpit: camın ardında Recep
    ctx.fillStyle = "rgba(147,197,253,0.6)"; ctx.beginPath(); ctx.ellipse(62, -12, 24, 14, 0, Math.PI, 0); ctx.fill();
    if (headCanvas) { ctx.save(); ctx.beginPath(); ctx.ellipse(62, -12, 24, 14, 0, Math.PI, 0); ctx.clip(); ctx.drawImage(headCanvas, 46, -36, 34, 34 * headCanvas.height / headCanvas.width); ctx.restore(); }
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(62, -12, 24, 14, 0, Math.PI, 0); ctx.stroke();
    ctx.restore();
    if (player.shield) drawShield(ctx, player.x + player.w + 20, player.y + player.h / 2, 1.1, 1);
    if (power.star > 0) {
        ctx.strokeStyle = `rgba(253,224,71,${0.5 + 0.3 * Math.sin(tm * 10)})`; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.ellipse(player.x + player.w / 2, player.y + player.h / 2, 120, 50, 0, 0, Math.PI * 2); ctx.stroke();
    }
}
function drawJet(ctx, j) {
    ctx.save();
    ctx.translate(j.x, j.y);
    if (j.dead) { ctx.rotate(-0.5 - j.deathT * 0.02); ctx.globalAlpha = Math.max(0, 1 - j.deathT / 120); }
    ctx.fillStyle = "#64748b";
    ctx.beginPath(); ctx.moveTo(-58, 0); ctx.lineTo(30, -10); ctx.lineTo(54, -4); ctx.lineTo(54, 6); ctx.lineTo(30, 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#475569";
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(30, -30); ctx.lineTo(40, -30); ctx.lineTo(24, 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-6, 4); ctx.lineTo(30, 30); ctx.lineTo(40, 30); ctx.lineTo(24, 4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(36, -4); ctx.lineTo(54, -24); ctx.lineTo(60, -24); ctx.lineTo(54, 0); ctx.fill();
    ctx.fillStyle = "#0ea5e9"; ctx.beginPath(); ctx.ellipse(-26, -6, 12, 5, -0.1, 0, Math.PI * 2); ctx.fill();
    if (!j.dead) { ctx.fillStyle = "#fb923c"; ctx.beginPath(); ctx.moveTo(54, -3); ctx.lineTo(68 + Math.random() * 10, 1); ctx.lineTo(54, 5); ctx.fill(); }
    else {   // paraşütle atlayan pilot: rüşveti kaptı
        ctx.restore(); ctx.save();
        const py = j.y - 40 - j.deathT * 0.6;
        ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.arc(j.x + 20, py, 22, Math.PI, 0); ctx.fill();
        ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(j.x - 2, py); ctx.lineTo(j.x + 20, py + 30); ctx.lineTo(j.x + 42, py); ctx.stroke();
        drawBribe(ctx, j.x + 20, py + 36, 0);
    }
    ctx.restore();
    if (!j.dead) for (let k = 1; k < 5; k++) { ctx.fillStyle = `rgba(226,232,240,${0.25 - k * 0.05})`; ctx.beginPath(); ctx.arc(j.x + 60 + k * 16, j.y + 1, 4 + k * 2, 0, Math.PI * 2); ctx.fill(); }
}
function drawMissile(ctx, p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
    ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 8;
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(-12, -3.5, 24, 7);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#dc2626"; ctx.beginPath(); ctx.moveTo(12, -3.5); ctx.lineTo(19, 0); ctx.lineTo(12, 3.5); ctx.fill();
    ctx.fillStyle = "#f97316"; ctx.beginPath(); ctx.moveTo(-12, -3); ctx.lineTo(-22 - Math.random() * 8, 0); ctx.lineTo(-12, 3); ctx.fill();
    ctx.restore();
}
function drawTanker(ctx, b) {
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    if (b.dying) { ctx.rotate(-0.3 * Math.min(1, b.deathT / 40)); ctx.globalAlpha = Math.max(0, 1 - b.deathT / 90); }
    if (b.hurt > 0 && Math.floor(b.hurt / 4) % 2 === 0) ctx.globalAlpha = 0.45;
    const W = b.w, H = b.h;
    ctx.fillStyle = "#475569";
    ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(60, -H * 0.62); ctx.lineTo(100, -H * 0.62); ctx.lineTo(70, 4); ctx.fill();   // üst kanat
    ctx.fillStyle = "#94a3b8"; ctx.beginPath(); ctx.ellipse(0, 0, W / 2, H * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#64748b"; ctx.beginPath(); ctx.moveTo(W / 2 - 50, -10); ctx.lineTo(W / 2 + 6, -H * 0.55); ctx.lineTo(W / 2 + 20, -H * 0.55); ctx.lineTo(W / 2, -4); ctx.fill();   // kuyruk
    ctx.fillStyle = "#475569"; ctx.beginPath(); ctx.moveTo(-40, 6); ctx.lineTo(60, H * 0.55); ctx.lineTo(100, H * 0.55); ctx.lineTo(70, 6); ctx.fill();   // alt kanat
    [[20, -H * 0.3], [50, -H * 0.45], [20, H * 0.32], [50, H * 0.46]].forEach(([x, y]) => {   // motorlar
        ctx.fillStyle = "#334155"; ctx.beginPath(); ctx.ellipse(x, y, 24, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fb923c"; ctx.beginPath(); ctx.moveTo(x + 24, y - 4); ctx.lineTo(x + 40 + Math.random() * 10, y); ctx.lineTo(x + 24, y + 4); ctx.fill();
    });
    ctx.fillStyle = "#334155"; ctx.fillRect(W / 2 - 120, 18, 90, 6);   // yakıt borusu
    // burunda kızgın gözler
    const angry = b.timer > 50 || b.talk > 0;
    [-W / 2 + 40, -W / 2 + 70].forEach(x => { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(x, -8, 11, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(x - 3, -6, 4, 0, Math.PI * 2); ctx.fill(); });
    ctx.strokeStyle = "#111"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-W / 2 + 28, -20 + (angry ? -2 : 4)); ctx.lineTo(-W / 2 + 50, -16); ctx.moveTo(-W / 2 + 60, -16); ctx.lineTo(-W / 2 + 82, -20 + (angry ? -2 : 4)); ctx.stroke();
    ctx.fillStyle = "#1f2937"; ctx.beginPath(); ctx.arc(-W / 2 + 54, 10, 8, 0, Math.PI); ctx.fill();
    ctx.restore();
}

function drawFlightBackground(time) {
    const th = THEMES.sky;
    const g = ctx.createLinearGradient(0, 0, 0, height);
    th.sky.forEach((c, i) => g.addColorStop(i / (th.sky.length - 1), c));
    ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 120; i++) {
        const x = ((hash(i) * 3000 - camX * 0.02) % 3000 + 3000) % 3000;
        if (x > width) continue;
        ctx.globalAlpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 2 + i));
        ctx.fillRect(x, hash(i + 0.5) * height * 0.6, 2, 2);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#f1f5f9"; ctx.beginPath(); ctx.arc(width * 0.8, height * 0.15, 28, 0, Math.PI * 2); ctx.fill();
    // aşağıda şehir ışıkları ve deniz
    ctx.fillStyle = "#0b1222"; ctx.fillRect(0, height * 0.9, width, height * 0.1);
    skyline(0.15, height * 0.95, 10, 50, "#0b1222", "rgba(253,224,71,0.7)", 11);
    // bulut katmanları
    [[0.25, "rgba(148,163,184,0.25)", 0.7, 3], [0.6, "rgba(203,213,225,0.35)", 1.1, 7]].forEach(([par, col, s, seed]) => {
        ctx.fillStyle = col;
        const P = width + 900;
        for (let i = 0; i < 7; i++) {
            const x = ((hash(i * 3.1 + seed) * P - camX * par) % P + P) % P - 300;
            cloud(x, height * (0.1 + hash(i * 7.7 + seed) * 0.7), s + hash(i) * 0.6);
        }
    });
}

function drawFlight() {
    const time = performance.now() / 1000;
    drawFlightBackground(time);
    drawFlightBanners(time);   // pankart çeken uçaklar (js/newsbg.js)
    ctx.save();
    ctx.translate(-camX, 0);
    items.forEach(it => { if (!it.collected) drawKulHakkiBag(ctx, it.x, it.y + Math.sin(time * 3 + it.x) * 6, 70); });
    flight.jets.forEach(j => drawJet(ctx, j));
    if (boss) drawBoss(ctx, boss);
    drawRecepPlane(ctx);
    playerProjectiles.forEach(p => drawBribe(ctx, p.x, p.y, p.angle));
    projectiles.forEach(p => p.type === 'fire' ? drawFire(ctx, p) : drawMissile(ctx, p));
    drawParticles(ctx);
    ctx.restore();
    ctx.globalAlpha = 1;
    if (boss && !boss.dying) drawBossBar(ctx, boss);
    drawPowerHud(ctx);
    drawScreenOverlays(ctx);
}
