// Bölüm sonu canavarlarının ortak motoru: doğma, öfke, saldırı mermileri, hasar, çizim ve can barı
// Canavarların kendileri boss_*.js dosyalarında (feto, kasa, darbetank, bylock), gezi.js (TOMA), saygili.js (SAYGILI), selo.js, ekrem.js, flight.js
// Teyzeler: grannies.js, canavar sonrası ara sahne: boss_outro.js
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// Alttan yuvarlak, ucu yukarı sivrilen tek alev dili (taban: cx, baseY)
function flameTongue(ctx, cx, baseY, w, h, lean = 0) {
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, baseY);
    ctx.bezierCurveTo(cx - w / 2, baseY - h * 0.5, cx + lean - w * 0.15, baseY - h * 0.7, cx + lean, baseY - h);
    ctx.bezierCurveTo(cx + lean + w * 0.15, baseY - h * 0.7, cx + w / 2, baseY - h * 0.5, cx + w / 2, baseY);
    ctx.quadraticCurveTo(cx, baseY + w * 0.35, cx - w / 2, baseY);
    ctx.fill();
}

const FIRE_COLORS = ["#dc2626", "#f97316", "#fde047"];

// Alev (DARBE TANKI ve uçuş bölümü atar): havadayken kuyruklu top, yere düşünce bir süre yanan ateş
function drawFire(ctx, p) {
    ctx.save();
    if (p.grounded) {
        ctx.globalAlpha = Math.min(1, p.life / 30);   // sönerken solar
        FIRE_COLORS.forEach((col, i) => {
            const sc = 1 - i * 0.3;
            ctx.fillStyle = col;
            for (let j = -1; j <= 1; j++) {
                flameTongue(ctx, p.x + j * 16 * sc, p.y, 26 * sc,
                    (34 + 10 * Math.sin(p.life * 0.4 + j * 2 + i)) * sc, Math.sin(p.life * 0.2 + j) * 4);
            }
        });
    } else {
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.atan2(p.vy, p.vx) - Math.PI / 2);   // kuyruk hareketin tersine uzar
        const flick = Math.sin(p.life * 0.6) * 6;
        FIRE_COLORS.forEach((col, i) => {
            const sc = 1 - i * 0.3;
            ctx.fillStyle = col;
            flameTongue(ctx, 0, 8 * sc, 30 * sc, (55 + flick) * sc);
        });
    }
    ctx.restore();
}

// --- BÖLÜM SONU CANAVARLARI ---
// Her canavar: boyut, can, arena genişliği, isim, üstüne basılabilen derinlik, hareket ve çizim
const BOSS_TYPES = {};   // her canavar kendi dosyasında eklenir: BOSS_TYPES.<ad> = { ... }
function spawnBoss(x) {
    const kind = LEVELS[currentLevel].boss;
    const T = BOSS_TYPES[kind], w = T.w, h = T.h;
    x = Math.min(x, WORLD_WIDTH - w - 100);
    boss = { kind, T, x, y: height - 60 - h, w, h, homeX: x, hp: bossMaxHp({ T }), dir: -1, look: -1,
             timer: 0, charge: 0, attacks: 0, hurt: 0, anim: 0, dying: false, deathT: 0,
             state: 'walk', stateT: 0, vx: 0, vy: 0, run: 0, crouch: 0, recover: 0 };
    enemies = enemies.filter(en => en.dead || Math.abs(en.x - x) > 1500);   // arenada polis kalmasın
    bossCheckpoint = { score, stage: 'boss' };
    createParticle(player.x + player.w / 2, player.y - 30, t("bossIntro"), "#f97316", 2.5);
    // Canavar konuşarak karşılar: ses bitene kadar saldırmaz, ağzı oynar, balon çıkar
    const dur = playSfx(T.greet, { vol: 1, delay: 0.3 });
    boss.talk = Math.round(((dur || 1.5) + 0.3) * 60);
}

// Öfke: canı yarıya inince kızarır, buharlar çıkar, daha hızlı saldırır
function enrageBoss(b) {
    b.rage = true;
    camShake = Math.max(camShake, 14);
    createParticle(b.x + b.w / 2, b.y - 70, t("rage"), "#ef4444", 2.0);
    if (b.T.greet) playSfx(b.T.greet, { vol: 1, rate: 1.25 });
}
function drawRageAura(ctx, b) {
    if (!b.rage || b.dying) return;
    const t0 = performance.now() / 1000, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, b.h * 0.9);
    g.addColorStop(0, `rgba(239,68,68,${0.35 + 0.15 * Math.sin(t0 * 10)})`); g.addColorStop(1, "rgba(239,68,68,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, b.h * 0.9, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 4; i++) {   // kafadan yükselen buhar
        const ph = (t0 * 1.2 + i / 4) % 1, x = cx + (i - 1.5) * 22 + Math.sin(t0 * 4 + i) * 6, y = b.y - ph * 70;
        ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - ph)})`;
        ctx.beginPath(); ctx.arc(x, y, 8 + ph * 14, 0, Math.PI * 2); ctx.fill();
    }
}

// Canavarın karşılama balonu (konuşurken)
function drawSpeech(ctx, b) {
    if (!(b.talk > 0) || !b.T.say || b.dying) return;
    const text = b.T.say, x = b.x + b.w / 2 + 30, y = b.y - (b.T.labelY || 35) - 60;
    ctx.font = "bold 22px Arial";
    const tw = ctx.measureText(text).width + 28;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#111"; ctx.lineWidth = 3;
    const bx = Math.max(camX + 10, Math.min(x - 10, camX + width - tw - 10));   // uzun cümle ekrandan taşmasın
    ctx.beginPath(); ctx.roundRect(bx, y - 22, tw, 44, 14); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 4, y + 21); ctx.lineTo(x - 14, y + 44); ctx.lineTo(x + 22, y + 21); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 4, y + 22); ctx.lineTo(x - 14, y + 44); ctx.lineTo(x + 22, y + 22); ctx.stroke();
    ctx.fillStyle = "#111"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(text, bx + 14, y + 1);
}

function fireball(x, y, vx, vy) {
    projectiles.push({ type: 'fire', x, y, vx, vy, active: true, life: 400, angle: 0, grounded: false });
}

// Bölüme özel mermiler: PROJECTILES.<tür> = [güncelle(p), çiz(ctx, p)] (ör. gezi.js: su, gaz kapsülü)
const PROJECTILES = {};

// Zırhlı canavar (T.stompOnly): rüşvet ve balyoz seker, yalnızca üstüne zıplanınca hasar alır.
// T.armored(b): o an tamamen zırhlı mı (ör. 3. bölüm kasası kapağı kapalıyken); T.armorKey: ekranda çıkan uyarı
const bossShielded = b => b.T.stompOnly || !!(b.T.armored && b.T.armored(b));
function bossArmor(x, y) {
    playSfx('hit', { rate: 2.4, vol: 0.4 });
    if (boss.armorMsg > 0) return;
    boss.armorMsg = 90;
    createParticle(x, y - 30, t(boss.T.armorKey || "armored"), "#e5e7eb", 1.2);
}

function updateFire(p) {
    p.life--;
    if(!p.grounded) {
        p.vy += 0.35;
        const prevY = p.y;
        p.x += p.vx; p.y += p.vy;
        // Zemine/platforma düşünce orada yanmaya devam et
        for(const pl of platforms) {
            if(p.vy > 0 && p.x > pl.x && p.x < pl.x + pl.w && prevY <= pl.y && p.y >= pl.y) {
                p.grounded = true; p.y = pl.y; p.vx = p.vy = 0; p.life = 150;
                break;
            }
        }
    }
    if(player.isDying || !p.active) return;
    const hit = p.grounded
        // Yerdeki ateş: üstünden zıplanarak geçilebilir
        ? p.x > player.x - 5 && p.x < player.x + player.w + 5 && player.y + player.h > p.y - 30
        : p.x > player.x + 10 && p.x < player.x + player.w - 10 && p.y > player.y && p.y < player.y + player.h;
    if(hit) { if(!p.grounded && shieldBlocks(p)) blockProjectile(p); else die(); }
}

function damageBoss(n) {
    if(!boss || boss.dying || boss.hurt > 0) return;
    boss.hp = Math.max(0, boss.hp - n);
    boss.hurt = 30;   // kısa dokunulmazlık (yanıp söner)
    if(!isFlight()) { hitStop = Math.max(hitStop, 3); camShake = Math.max(camShake, 6); }
    playSfx('hit', { rate: 0.8 + Math.random() * 0.2, vol: 0.7 });
    createParticle(boss.x + boss.w / 2, boss.y + 40, "-" + n, "#fde047", 0.8);
    if(boss.hp > 0) return;
    if(boss.T.onDefeat && boss.T.onDefeat(boss)) return;   // ör. 10. bölüm: "seçim iptal", canavar yeniden gelir
    boss.dying = true;
    levelEnding = true;
    projectiles = projectiles.filter(p => p.type === 'bullet');   // canavarın saldırıları silinir
    $('score').innerText = addScore(20000);
    $('sfx-explosion').currentTime = 0; $('sfx-explosion').play().catch(()=>{});
    for(let i = 0; i < 30; i++) createParticle(boss.x + Math.random() * boss.w, boss.y + Math.random() * boss.h);
    playSfx('hit', { rate: 0.6, vol: 1 });
    playSfx('cry', { rate: 0.55, vol: 1, delay: 0.08 });   // canavar: kalın, uzun çığlık
    // Başörtülü teyzeler koşarak gelip kutlar ve sonraki bölüme geçilene kadar tezahürat eder
    const cx = boss.x + boss.w / 2, after = boss.T.chantDelay || 0.7;   // Selo hücreden konuşurken teyzeler bekler
    const O = BOSS_OUTROS[currentLevel];
    if (O) { outro = { O, t: 0, start: Math.round(after * 60), len: 0, cx }; return; }   // önce ara sahne, sonra teyzeler
    celebrate(cx, after);
}
// Teyzeler koşarak gelir, tezahürat eder; ardından bölüm biter
// Teyzeler yalnızca bu bölümlerin sonunda gelir; diğer bölümlerin sonuna kendi karakterleri gelecek (boss_outro.js)
const GRANNY_LEVELS = [1];
function celebrate(cx, chantAt) {
    if (!GRANNY_LEVELS.includes(currentLevel)) { setTimeout(completeLevel, Math.max(2500, chantAt * 1000 + 1800)); return; }
    spawnGrannies(cx);
    startGrannyChant(chantAt);
    setTimeout(completeLevel, Math.max(3000, (chantAt + sfxDuration('granny')) * 1000 + 1000));
}


function updateBoss() {
    const b = boss;
    if(!b) return;
    b.anim++;
    if(b.dying) { if(++b.deathT > 60) boss = null; return; }
    if(b.hurt > 0) b.hurt--;
    if(b.armorMsg > 0) b.armorMsg--;
    if(b.talk > 0) b.talk--;      // karşılama konuşması bitene kadar saldırmaz
    else {
        b.T.update(b);
        if(b.rage && !b.T.calmRage && b.anim % 2 === 0) b.T.update(b);   // öfkeliyken 1,5 kat hızlı (calmRage: canavar kendisi ayarlar)
    }
    if(!b.rage && b.hp <= bossMaxHp(b) / 2) enrageBoss(b);

    // Temas: üstüne zıplayınca hasar, yandan değince ölüm
    if(!player.isDying && player.x + player.w - 30 > b.x + 40 && player.x + 30 < b.x + b.w - 40 &&
       player.y + player.h > b.y + 30 && player.y < b.y + b.h) {
        if(player.vy > 0 && player.y + player.h < b.y + b.T.stomp) {
            player.vy = -22;
            if(b.T.armored && b.T.armored(b)) bossArmor(player.x + player.w / 2, b.y); else damageBoss(b.T.stompDmg || 2);
        }
        else if(power.star > 0) damageBoss(1);   // dokunulmazken çarpmak canavara hasar verir
        else die();
    }
}

// Şok dalgası zeminde ilerler; üstünden zıplanarak kaçılır
function updateWave(p) {
    p.x += p.vx;
    p.life--;
    if(player.isDying || !p.active) return;
    if(Math.abs(p.x - (player.x + player.w / 2)) < 40 && player.y + player.h > p.y - 45) die();
}

function drawBoss(ctx, b) {
    drawRageAura(ctx, b);
    b.T.draw(ctx, b);
    if(!b.dying) {
        const name = t(b.T.nameKey);
        ctx.font = "bold 34px Arial";
        ctx.textAlign = "center";
        ctx.lineWidth = 5; ctx.strokeStyle = "#000";
        const ly = b.y - (b.T.labelY || 35);   // isim, canavarın başının üstünde
        ctx.strokeText(name, b.x + b.w / 2, ly);
        ctx.fillStyle = b.rage ? "#ef4444" : "#fde047";
        ctx.fillText(name, b.x + b.w / 2, ly);
    }
    drawSpeech(ctx, b);
}

// Canavar ölürken küçülür, vurulunca yanıp söner (orijin: ayakların ortası)
function bossBaseTransform(ctx, b, lift = 0) {
    ctx.translate(b.x + b.w / 2, b.y + b.h - lift);
    const shrink = (b.dying ? Math.max(0, 1 - b.deathT / 60) : 1) * ((b.T && b.T.scale) || 1);
    ctx.scale(shrink, shrink);
    if(b.hurt > 0 && Math.floor(b.hurt / 4) % 2 === 0) ctx.globalAlpha = 0.45;
}

// Şok dalgası: zeminde ilerleyen toz ve taş kabarması
function drawWave(ctx, p) {
    const fade = Math.min(1, p.life / 20);
    ctx.save();
    ctx.globalAlpha = 0.85 * fade;
    ctx.fillStyle = "#a16207";
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 34, 40 * fade, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#d6d3d1";
    for(let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.arc(p.x + i * 14 - Math.sign(p.vx) * 4, p.y - 22 * fade - Math.abs(i) * -8, 6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

// Ekranın üstünde canavarın can barı
function drawBossBar(ctx, b) {
    const w = Math.min(500, width - 40), x = (width - w) / 2, y = 95;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x - 4, y - 4, w + 8, 26);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(x, y, w * b.hp / bossMaxHp(b), 18);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t(b.T.nameKey) + "  " + b.hp + " / " + bossMaxHp(b), width / 2, y + 9);
    ctx.textBaseline = "alphabetic";
}

// Canavarın zemine bastığı y
function bossGround(b) { return height - 60 - b.h; }
