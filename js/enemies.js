// Düşmanlar: 17/25 polisi, çevik kuvvet, keskin nişancı, mermiler
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// Göğüsteki "17/25" isim plakası; düşman sola bakarken yazı ters görünmesin
function chestPlate(ctx, x, y, dir) {
    ctx.save(); ctx.translate(x, y); if (dir === -1) ctx.scale(-1, 1);
    ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.roundRect(-17, -7, 34, 14, 3); ctx.fill();
    ctx.fillStyle = "white"; ctx.font = "bold 10px monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("17/25", 0, 0.5);
    ctx.restore();
}

// --- 17/25 POLİSİ ---
// Lacivert üniformalı, kasketli, tabancalı polis. Koordinat: ayakların ortası, sağa bakar.
const POLICE_LEGS = {
    photoH: 1, ratio: 0.36, width: 13, swing: 0.6,
    front: "#1e3a8a", back: "#172554", shoe: "#0a0a0a"
};
function drawPolice(ctx, en) {
    const h = en.h, moving = en.lastSpeed > 0;
    ctx.save();
    ctx.translate(en.x + en.w / 2, en.y + en.h);
    ctx.save();
    if (en.dir === -1) ctx.scale(-1, 1);
    const legs = drawLegs(ctx, 0, -h, h, 1, en.walkCycle, moving, false, POLICE_LEGS);
    const bodyH = h * (1 - POLICE_LEGS.ratio);
    ctx.translate(0, -h + legs.drop);
    const s = bodyH / 128;                 // gövde 128 birimlik ızgarada çizilir
    ctx.scale(s, s);
    ctx.lineJoin = "round"; ctx.lineCap = "round";

    // Arka kol
    const swing = moving ? Math.sin(en.walkCycle) * 0.5 : 0.1;
    const arm = (ang, col) => {
        ctx.save(); ctx.translate(-12, 56); ctx.rotate(ang);
        ctx.strokeStyle = col; ctx.lineWidth = 13;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 44); ctx.stroke();
        ctx.fillStyle = "#f2c79b"; ctx.beginPath(); ctx.arc(0, 48, 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    };
    arm(-swing, "#172554");

    // Gövde (gömlek + ceket)
    ctx.fillStyle = "#1e40af"; ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(-27, 50, 54, 72, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#93c5fd";                                   // yaka
    ctx.beginPath(); ctx.moveTo(-10, 50); ctx.lineTo(0, 62); ctx.lineTo(10, 50); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 62); ctx.lineTo(0, 110); ctx.stroke();
    ctx.fillStyle = "#facc15";                                   // düğmeler
    for (let b = 0; b < 3; b++) { ctx.beginPath(); ctx.arc(4, 72 + b * 13, 2.2, 0, Math.PI * 2); ctx.fill(); }
    // Rozet (yıldız)
    ctx.save(); ctx.translate(16, 64); ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 3 : 7, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill(); ctx.restore();
    // Göğüs yazısı: isim plakası, sola bakarken de ters görünmesin
    chestPlate(ctx, 9, 84, en.dir);
    // Kemer
    ctx.fillStyle = "#111827"; ctx.fillRect(-27, 110, 54, 9);
    ctx.fillStyle = "#d4d4d8"; ctx.fillRect(-5, 111, 10, 7);

    // Kafa
    ctx.fillStyle = "#f2c79b"; ctx.strokeStyle = "#7c4a24"; ctx.lineWidth = 2;
    ctx.fillRect(-6, 40, 12, 12);                                // boyun
    ctx.beginPath(); ctx.ellipse(2, 28, 18, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#111";                                      // göz + kaş (çatık)
    ctx.beginPath(); ctx.arc(11, 26, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = "#111";
    ctx.beginPath(); ctx.moveTo(5, 19); ctx.lineTo(16, 22); ctx.stroke();
    ctx.fillStyle = "#3f2a1d";                                   // bıyık
    ctx.beginPath(); ctx.ellipse(12, 37, 9, 3.5, 0.1, 0, Math.PI * 2); ctx.fill();
    // Kasket
    ctx.fillStyle = "#1e3a8a"; ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-18, 16); ctx.lineTo(-14, 0); ctx.lineTo(18, 0); ctx.lineTo(20, 16); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#0f172a";                                   // siperlik
    ctx.beginPath(); ctx.ellipse(16, 16, 15, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#facc15"; ctx.fillRect(-16, 10, 34, 3);     // şerit
    ctx.beginPath(); ctx.arc(4, 6, 4, 0, Math.PI * 2); ctx.fill(); // kasket arması
    if (en.kind === 'gas') {   // gaz maskesi: gözlük camları ve filtre
        ctx.fillStyle = "#374151"; ctx.strokeStyle = "#111827"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(-6, 18, 26, 24, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#a5f3fc"; ctx.beginPath(); ctx.arc(12, 25, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#4b5563"; ctx.beginPath(); ctx.arc(18, 37, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#84cc16"; ctx.beginPath(); ctx.arc(18, 37, 3, 0, Math.PI * 2); ctx.fill();
    }

    // Ön kol + tabanca: oyuncu yakındaysa kol öne uzanır ve nişan alır
    const aim = en.aim || 0;
    ctx.save(); ctx.translate(-12, 56); ctx.rotate(swing * (1 - aim) - Math.PI / 2 * aim);
    ctx.strokeStyle = "#1e3a8a"; ctx.lineWidth = 13;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 44); ctx.stroke();
    if (en.kind === 'gas') {   // tabanca yerine kalın gaz atar
        ctx.restore(); ctx.save(); ctx.translate(-12, 56); ctx.rotate(-1.2 - (en.flash > 0 ? 0.3 : 0));
        ctx.strokeStyle = "#1e3a8a"; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 40); ctx.stroke();
        ctx.fillStyle = "#3f6212"; ctx.strokeStyle = "#1a2e05"; ctx.lineWidth = 2;
        ctx.fillRect(-9, 30, 18, 46); ctx.strokeRect(-9, 30, 18, 46);
        ctx.fillStyle = "#1a2e05"; ctx.fillRect(-7, 74, 14, 5);
        if (en.flash > 0) { ctx.fillStyle = "rgba(190,242,100,0.7)"; ctx.beginPath(); ctx.arc(0, 86, 12, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = "#f2c79b"; ctx.beginPath(); ctx.arc(0, 44, 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore(); ctx.restore(); ctx.restore();   // atar kolu, yön, dış
        return;
    }
    ctx.strokeStyle = "#0b0b0b"; ctx.lineWidth = 1.5;
    ctx.fillStyle = "#374151"; ctx.fillRect(-16, 42, 13, 10); ctx.strokeRect(-16, 42, 13, 10);   // kabza
    ctx.fillStyle = "#9ca3af"; ctx.fillRect(-5, 38, 11, 34); ctx.strokeRect(-5, 38, 11, 34);     // gövde ve namlu
    ctx.fillStyle = "#e5e7eb"; ctx.fillRect(3, 40, 2, 30);                                       // parlama
    ctx.fillStyle = "#0b0b0b"; ctx.fillRect(-1.5, 70, 4, 3);                                     // namlu ağzı
    if (en.flash > 0) {                                                // ateş anında namlu alevi
        ctx.fillStyle = "#fde047";
        ctx.beginPath();
        for (let i = 0; i < 10; i++) { const r = i % 2 ? 5 : 14, a = i * Math.PI / 5; ctx.lineTo(0.5 + Math.sin(a) * r * 0.7, 82 + Math.cos(a) * r); }
        ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "#f2c79b"; ctx.beginPath(); ctx.arc(0, 48, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.restore();

    ctx.restore();
}

// Ölen düşman yere yığılır ve kaybolur
const DEATH_FRAMES = 50;
function applyDeathPose(ctx, en) {
    const k = Math.min(1, en.deathT / 16);
    const px = en.x + en.w / 2, py = en.y + en.h;
    ctx.translate(px, py - en.w * 0.35 * k - Math.sin(k * Math.PI) * 18);
    ctx.rotate(en.fallDir * k * k * Math.PI / 2);
    ctx.translate(-px, -py);
    ctx.globalAlpha = Math.max(0, Math.min(1, (DEATH_FRAMES - en.deathT) / 15));
}

function killEnemy(en) {
    if(en.dead) return;
    // Çevik kuvvet ve nişancının 2 canı var: ilk vuruşta sarsılır, geri savrulur
    if(en.hp > 1) {
        if(en.hurt > 0) return;
        en.hp--; en.hurt = 24;
        hitStop = Math.max(hitStop, 2);
        if(en.kind === 'riot') en.x += (Math.sign(en.x + en.w / 2 - (player.x + player.w / 2)) || 1) * 30;
        createParticle(en.x + en.w / 2, en.y, "-1", "#fca5a5", 0.8);
        playSfx('hit', { rate: 1.2, vol: 0.6 });
        return;
    }
    if(chapterKill(en)) return;   // sivil: ihraç edilir, hedefe sayılmaz
    en.dead = true;
    killedEnemies++;
    const isPolice = true;   // düşman (1. bölümde Gezi kahramanı, sonra 17/25 polisi)
    // Devrilme animasyonu: oyuncudan uzağa doğru yere yığılır
    en.deathT = 0; en.lastSpeed = 0;
    en.fallDir = Math.sign(en.x + en.w / 2 - (player.x + player.w / 2)) || 1;
    en.kvx = en.fallDir * (en.kind === 'tank' ? 6 : 12);   // darbeyle geri savrulur
    hitStop = Math.max(hitStop, 4);
    enemyDeathSound(en);
    const [cry, cryColor] = enemyCryText(en);
    createParticle(en.x + en.w/2, en.y, isPolice ? cry : t("hit"), isPolice ? cryColor : "white", 1.0);
    $('score').innerText = score += ({ police: 3000, riot: 4000, sniper: 5000, tank: 4000, gas: 4000 })[en.kind] || 2000; $('kills').innerText = killedEnemies;
    if(killedEnemies === Math.ceil(targetKills / 2) && !bossCheckpoint) setMidCheckpoint();
    if(killedEnemies === targetKills) {
        // Hedef tamamlanınca kapı açılır; içinden geçince bölüm sonu canavarı (1: TOMA, 2: SAYGILI, ...)
        spawnGate();
    }
}

// --- ORTAK: düşmana temas ---
function enemyContact(en) {
    if (!player.isDying && player.x + 40 < en.x + en.w - 40 && player.x + player.w - 40 > en.x && player.y + player.h > en.y && player.y < en.y + en.h) {
        if (player.vy > 0 && player.y + player.h < en.y + 60) { player.vy = -18; player.jumping = false; killEnemy(en); }   // üstüne zıplayınca ezilir
        else if (power.star > 0) killEnemy(en);                                                     // dokunulmazken çarptığı ölür
        else die();
    }
}

// --- ÇEVİK KUVVET: kalkanlı, ateş etmez, oyuncunun üstüne yürür ---
// Önden gelen paraları kalkanla sektirir; kafasına zıplanarak, arkadan (yavaş döner) ya da balyozla öldürülür.
function updateRiot(en) {
    const toPlayer = (player.x + player.w / 2) - (en.x + en.w / 2);
    let speed = en.speed;
    if (!player.isDying && Math.abs(toPlayer) < 700) {
        // Ağır kalkanla yavaş döner: oyuncu arkasına geçerse ~0,7 sn arkası açık kalır
        const want = Math.sign(toPlayer) || en.dir;
        if (want !== en.dir) { speed = 0; if (++en.turnT > 40) { en.dir = want; en.turnT = 0; } }
        else en.turnT = 0;
        speed *= 1.3;
        if (Math.abs(en.x + en.dir * speed - en.homeX) > 400) speed = 0;
        if (Math.abs(toPlayer) < 20) speed = 0;
    } else {
        if (en.x - en.homeX > 250) en.dir = -1;
        else if (en.x - en.homeX < -250) en.dir = 1;
    }
    en.x += en.dir * speed;
    en.walkCycle += speed * 0.08;
    en.lastSpeed = speed;
}
function riotBlock(p) {
    p.active = false;
    for (let i = 0; i < 6; i++) {
        particles.push({ x: p.x, y: p.y, vx: -Math.sign(p.vx) * (2 + Math.random() * 4), vy: (Math.random() - 0.5) * 6,
                         life: 0.35, maxLife: 0.35, size: 3 + Math.random() * 3, text: null, color: "#e2e8f0" });
    }
    playSfx('hit', { rate: 2, vol: 0.4 });
}
const RIOT_LEGS = { photoH: 1, ratio: 0.36, width: 14, swing: 0.5, front: "#1f2937", back: "#111827", shoe: "#0a0a0a" };
function drawRiot(ctx, en) {
    const h = en.h, moving = en.lastSpeed > 0;
    ctx.save();
    ctx.translate(en.x + en.w / 2, en.y + en.h);
    ctx.save();
    if (en.dir === -1) ctx.scale(-1, 1);
    const legs = drawLegs(ctx, 0, -h, h, 1, en.walkCycle, moving, false, RIOT_LEGS);
    ctx.translate(0, -h + legs.drop);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    // Arka kol: havaya kalkık cop
    const sw = moving ? Math.sin(en.walkCycle) * 0.2 : 0;
    ctx.save(); ctx.translate(-14, 56); ctx.rotate(-2.4 + sw);
    ctx.strokeStyle = "#111827"; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 40); ctx.stroke();
    ctx.strokeStyle = "#0a0a0a"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(0, 78); ctx.stroke();
    ctx.restore();
    // Zırhlı gövde, omuz koruyucuları, kemer
    ctx.fillStyle = "#1f2937"; ctx.strokeStyle = "#0b0f19"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(-28, 48, 56, 74, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#374151";
    [-22, 22].forEach(x => { ctx.beginPath(); ctx.ellipse(x, 54, 12, 9, 0, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = "#4b5563"; for (let i = 0; i < 3; i++) ctx.fillRect(-18, 70 + i * 13, 36, 7);
    chestPlate(ctx, -4, 64, en.dir);
    ctx.fillStyle = "#0a0a0a"; ctx.fillRect(-28, 110, 56, 9);
    // Kafa ve kask (vizörlü)
    ctx.fillStyle = "#f2c79b"; ctx.beginPath(); ctx.ellipse(2, 30, 17, 19, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1e3a8a"; ctx.beginPath(); ctx.ellipse(0, 22, 22, 22, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-22, 20, 44, 6);
    ctx.fillStyle = "rgba(148,163,184,0.55)"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(2, 22, 22, 22, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(12, 30, 2.4, 0, Math.PI * 2); ctx.fill();
    // Ön kol + şeffaf kalkan
    const bob = moving ? Math.sin(en.walkCycle * 2) * 2 : 0;
    ctx.strokeStyle = "#1f2937"; ctx.lineWidth = 13;
    ctx.beginPath(); ctx.moveTo(10, 58); ctx.lineTo(26, 84); ctx.stroke();
    ctx.fillStyle = "rgba(186,230,253,0.42)"; ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(16, 22 + bob, 36, 118, 6); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(22, 30 + bob); ctx.lineTo(22, 70 + bob); ctx.stroke();
    ctx.save(); ctx.translate(34, 82 + bob); if (en.dir === -1) ctx.scale(-1, 1); ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#fff"; ctx.font = "bold 14px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("POLİS", 0, 0);
    ctx.restore();
    ctx.restore();
    ctx.restore();
}

// --- GAZ BOMBACI: gaz maskeli polis, mesafeyi korur ve oyuncunun ayağına biber gazı kapsülü fırlatır ---
// Kapsül yere düşünce 3 sn süren yeşil bir gaz bulutu olur; bulutun içinde kalan can kaybeder (üstünden zıplanabilir).
// Havadaki kapsül kalkanla sektirilir.
const GAS_G = 0.4, GAS_CLOUD = 180;
function updateGas(en) {
    const toPlayer = (player.x + player.w / 2) - (en.x + en.w / 2), dist = Math.abs(toPlayer);
    let speed = en.speed;
    if (!player.isDying && dist < 900) {
        en.dir = Math.sign(toPlayer) || en.dir;
        // 350-650 px arasında durmaya çalışır: yakınsa geri çekilir, uzaksa yaklaşır
        const move = dist < 350 ? -en.dir : dist > 650 ? en.dir : 0;
        speed = move ? speed * 1.1 : 0;
        if (move && Math.abs(en.x + move * speed - en.homeX) > 450) speed = 0;
        en.x += move * speed;
        if (++en.timer > en.interval * 1.3 && dist < 800) {
            en.timer = 0; en.flash = 10;
            const sx = en.x + en.w / 2 + en.dir * 40, sy = en.y + 70;
            const T = 40 + dist / 25, tx = player.x + player.w / 2 + player.vx * 10, ty = player.y + player.h;
            projectiles.push({ type: 'gas', x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy) / T - 0.5 * GAS_G * T,
                               active: true, life: 400, angle: 0, cloud: 0 });
            playSfx('hit', { rate: 2.2, vol: 0.35 });
        }
    } else {
        if (en.x - en.homeX > 250) en.dir = -1; else if (en.x - en.homeX < -250) en.dir = 1;
        en.x += en.dir * speed;
    }
    en.x = Math.max(0, Math.min(en.x, WORLD_WIDTH - en.w));
    en.aim = 0;
    if (en.flash > 0) en.flash--;
    en.walkCycle += speed * 0.08;
    en.lastSpeed = speed;
}
function burstGas(p) {
    p.cloud = GAS_CLOUD; p.vx = 0; p.vy = 0; p.life = GAS_CLOUD;
    playSfx('hit', { rate: 0.5, vol: 0.4 });
}
function updateGasShell(p) {
    p.life--;
    if (p.cloud > 0) {   // yerdeki bulut: içindeki oyuncu can kaybeder
        p.cloud--;
        const r = gasRadius(p), pcx = player.x + player.w / 2;
        if (!player.isDying && Math.abs(pcx - p.x) < r + 20 && player.y + player.h > p.y - r * 0.9) die();
        return;
    }
    const prevY = p.y;
    p.vy += GAS_G; p.y += p.vy; p.angle += 0.3;
    for (const pl of platforms) {
        if (p.vy > 0 && p.x > pl.x && p.x < pl.x + pl.w && prevY <= pl.y && p.y >= pl.y) { p.y = pl.y; burstGas(p); return; }
    }
    if (player.isDying) return;
    if (p.x > player.x + 15 && p.x < player.x + player.w - 15 && p.y > player.y && p.y < player.y + player.h) {
        if (shieldBlocks(p)) blockProjectile(p);
        else { p.y = player.y + player.h; burstGas(p); die(); }   // bulut ayak hizasında açılır
    }
}
// Bulut önce hızla büyür, sonunda söner
const gasRadius = p => 105 * Math.min(1, (GAS_CLOUD - p.cloud) / 20) * Math.min(1, p.cloud / 30 + 0.4);
function drawGasShell(ctx, p) {
    if (p.cloud > 0) {
        const r = gasRadius(p), t0 = performance.now() / 1000, a = Math.min(1, p.cloud / 40);
        for (let i = 0; i < 7; i++) {
            const ang = i / 7 * Math.PI * 2 + t0 * 0.6, ox = Math.cos(ang) * r * 0.55, oy = -r * 0.45 + Math.sin(ang) * r * 0.3;
            ctx.fillStyle = `rgba(${i % 2 ? '163,230,53' : '190,242,100'},${0.32 * a})`;
            ctx.beginPath(); ctx.arc(p.x + ox, p.y + oy, r * (0.45 + 0.1 * Math.sin(t0 * 3 + i)), 0, Math.PI * 2); ctx.fill();
        }
        return;
    }
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
    ctx.fillStyle = "#4d7c0f"; ctx.fillRect(-8, -13, 16, 26);
    ctx.fillStyle = "#a3e635"; ctx.fillRect(-8, -4, 16, 6);
    ctx.fillStyle = "#1f2937"; ctx.fillRect(-5, -17, 10, 5);
    ctx.restore();
    ctx.fillStyle = "rgba(190,242,100,0.35)"; ctx.beginPath(); ctx.arc(p.x - p.vx * 2, p.y - p.vy * 2, 7, 0, Math.PI * 2); ctx.fill();
}

// --- KESKİN NİŞANCI: yüksek platformda diz çökmüş, dürbünlü tüfekli polis ---
// Oyuncuyu kırmızı lazerle izler; lazer dolunca oyuncunun bulunduğu yere çapraz ateş eder.
const SNIPER_AIM = 70;
function updateSniper(en) {
    if (en.flash > 0) en.flash--;
    const px = player.x + player.w / 2, py = player.y + player.h * 0.45, cx = en.x + en.w / 2;
    en.dir = Math.sign(px - cx) || en.dir;
    const sx = cx + en.dir * 6, sy = en.y + en.h - 100;                   // omuz
    en.aimAng = Math.max(-0.7, Math.min(0.9, Math.atan2(py - sy, Math.max(20, (px - sx) * en.dir))));
    en.mx = sx + en.dir * Math.cos(en.aimAng) * 66; en.my = sy + Math.sin(en.aimAng) * 66;   // namlu ucu
    const dist = Math.abs(px - cx);
    if (en.cool > 0) { en.cool--; en.laser = 0; return; }
    if (player.isDying || dist > 1100 || dist < 60) { en.laser = 0; return; }
    if (++en.laser >= SNIPER_AIM) {
        const d = Math.hypot(px - en.mx, py - en.my) || 1;
        projectiles.push({ type: 'bullet', x: en.mx, y: en.my, vx: (px - en.mx) / d * 13, vy: (py - en.my) / d * 13, active: true, life: 120, angle: 0 });
        en.flash = 6; en.laser = 0; en.cool = LEVELS[currentLevel].fire;
        playGunshot((cx - camX - width / 2) / (width / 2), 0.55);
    }
}
function drawSniperLaser(ctx, en) {
    if (!(en.laser > 0) || en.dead) return;
    const k = en.laser / SNIPER_AIM, px = player.x + player.w / 2, py = player.y + player.h * 0.45;
    ctx.strokeStyle = `rgba(239,68,68,${0.25 + 0.55 * k})`; ctx.lineWidth = 1.5 + k;
    ctx.beginPath(); ctx.moveTo(en.mx, en.my); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = `rgba(239,68,68,${0.5 + 0.5 * k})`;
    ctx.beginPath(); ctx.arc(px, py, 4 + 3 * k, 0, Math.PI * 2); ctx.fill();
}
function drawSniper(ctx, en) {
    ctx.save();
    ctx.translate(en.x + en.w / 2, en.y + en.h);
    ctx.save();
    if (en.dir === -1) ctx.scale(-1, 1);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    // Bacaklar: arka diz yerde, ön ayak basık
    ctx.strokeStyle = "#172554"; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(-2, -50); ctx.lineTo(-8, -8); ctx.lineTo(-40, -6); ctx.stroke();
    ctx.strokeStyle = "#1e3a8a";
    ctx.beginPath(); ctx.moveTo(2, -50); ctx.lineTo(28, -40); ctx.lineTo(30, -6); ctx.stroke();
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath(); ctx.ellipse(36, -4, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-46, -4, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Gövde: lacivert gömlek, siyah yelek
    ctx.fillStyle = "#1e40af"; ctx.beginPath(); ctx.roundRect(-17, -112, 34, 66, 9); ctx.fill();
    ctx.fillStyle = "#1e293b"; ctx.beginPath(); ctx.roundRect(-15, -104, 30, 46, 6); ctx.fill();
    ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(-6, -96, 3.5, 0, Math.PI * 2); ctx.fill();
    chestPlate(ctx, 0, -78, en.dir);
    // Kafa: bıyık, bere
    ctx.fillStyle = "#f2c79b"; ctx.beginPath(); ctx.ellipse(6, -126, 14, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3f2a1d"; ctx.beginPath(); ctx.ellipse(13, -118, 7, 2.5, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(13, -128, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1e3a8a"; ctx.beginPath(); ctx.ellipse(2, -138, 17, 7, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(-6, -139, 2.5, 0, Math.PI * 2); ctx.fill();
    // Tüfek ve kollar: omuzdan oyuncuya doğru döner
    ctx.save(); ctx.translate(6, -100); ctx.rotate(en.aimAng || 0);
    ctx.fillStyle = "#3f2a1d"; ctx.fillRect(-16, -3, 18, 9);                        // dipçik
    ctx.fillStyle = "#111827"; ctx.fillRect(0, -3, 54, 6); ctx.fillRect(54, -2, 12, 3);   // gövde, namlu
    ctx.fillStyle = "#374151"; ctx.fillRect(14, -10, 22, 6);                         // dürbün
    ctx.fillStyle = "#93c5fd"; ctx.fillRect(34, -9, 2, 4);
    if (en.flash > 0) {
        ctx.fillStyle = "#fde047"; ctx.beginPath();
        for (let i = 0; i < 10; i++) { const r = i % 2 ? 4 : 12, a = i * Math.PI / 5; ctx.lineTo(72 + Math.cos(a) * r, Math.sin(a) * r * 0.7); }
        ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = "#1e40af"; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(10, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-2, 4); ctx.lineTo(34, 6); ctx.stroke();
    ctx.fillStyle = "#f2c79b"; ctx.beginPath(); ctx.arc(34, 5, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.restore();
    ctx.restore();
}

// --- POLİS MERMİSİ ---
function updateBullet(p) {
    p.life--;
    p.y += p.vy || 0;   // nişancı mermisi çapraz gider
    if (player.isDying || !p.active) return;
    if (p.x > player.x + 20 && p.x < player.x + player.w - 20 && p.y > player.y && p.y < player.y + player.h) {
        if (shieldBlocks(p)) blockProjectile(p); else { p.active = false; die(); }
    }
}
function drawBullet(ctx, p) {
    if (p.skin === 'slogan') { drawSlogan(ctx, p); return; }   // 1. bölüm: slogan balonu
    const d = Math.sign(p.vx) || 1;
    const g = ctx.createLinearGradient(p.x - d * 36, p.y, p.x, p.y);
    g.addColorStop(0, "rgba(253,224,71,0)"); g.addColorStop(1, "rgba(253,224,71,0.85)");
    ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(p.x - d * 36, p.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    ctx.fillStyle = "#facc15";
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
}
