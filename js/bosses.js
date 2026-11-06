// Bölüm sonu canavarları (ALEVİ, KURT, FETÖ), saldırıları ve başörtülü teyzeler
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

// ALEVİ'nin attığı alev: havadayken kuyruklu top, yere düşünce bir süre yanan ateş
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
const BOSS_TYPES = {
    alevi: { greet: 'greet_alevi', say: "YA ALİ!", w: 156, h: 204, dw: 260, dh: 340, scale: 0.6, hp: 12, arena: 700, nameKey: "bossName", stomp: 66, labelY: 45, update: updateAlevi, draw: drawAlevi },
    // Canavar çizimleri büyük tasarlandı (dw x dh); oyunda scale ile küçültülür ki
    // oyuncu (zıplama yüksekliği ~255 px) üzerlerinden atlayıp kafalarına basabilsin
    kurt:  { greet: 'greet_kurt', say: "KROOO!", w: 143, h: 204, dw: 210, dh: 300, scale: 0.68, hp: 16, arena: 900, nameKey: "kurtName", stomp: 60, update: updateKurt, draw: drawKurt },
    feto:  { greet: 'greet_feto', say: "*SNİF SNİF* ... TÜH!", w: 126, h: 203, dw: 180, dh: 290, scale: 0.7, hp: 20, arena: 900, nameKey: "fetoName", stomp: 55, labelY: 45, update: updateFeto, draw: drawFeto }
};
function spawnBoss(x) {
    const kind = LEVELS[currentLevel].boss;
    const T = BOSS_TYPES[kind], w = T.w, h = T.h;
    x = Math.min(x, WORLD_WIDTH - w - 100);
    boss = { kind, T, x, y: height - 60 - h, w, h, homeX: x, hp: T.hp, dir: -1, look: -1,
             timer: 0, charge: 0, attacks: 0, hurt: 0, anim: 0, dying: false, deathT: 0,
             state: 'walk', stateT: 0, vx: 0, vy: 0, run: 0, crouch: 0, recover: 0 };
    enemies = enemies.filter(en => en.dead || Math.abs(en.x - x) > 1500);   // arenada polis kalmasın
    bossCheckpoint = { score, stage: 'boss' };
    createParticle(player.x + player.w / 2, player.y - 30, t("bossIntro"), "#f97316", 2.5);
    // Canavar konuşarak karşılar: ses bitene kadar saldırmaz, ağzı oynar, balon çıkar
    const dur = playSfx(T.greet, { vol: 1, delay: 0.3 });
    boss.talk = Math.round(((dur || 1.5) + 0.3) * 60);
}

// Canavarın karşılama balonu (konuşurken)
function drawSpeech(ctx, b) {
    if (!(b.talk > 0) || !b.T.say || b.dying) return;
    const text = b.T.say, x = b.x + b.w / 2 + 30, y = b.y - (b.T.labelY || 35) - 60;
    ctx.font = "bold 22px Arial";
    const tw = ctx.measureText(text).width + 28;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#111"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(x - 10, y - 22, tw, 44, 14); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 4, y + 21); ctx.lineTo(x - 14, y + 44); ctx.lineTo(x + 22, y + 21); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 4, y + 22); ctx.lineTo(x - 14, y + 44); ctx.lineTo(x + 22, y + 22); ctx.stroke();
    ctx.fillStyle = "#111"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(text, x + 4, y + 1);
}

// --- BAŞÖRTÜLÜ TEYZELER ---
// Canavar ölünce iki yandan koşarak gelirler; terlik sallayıp zıplayarak kutlarlar.
let grannies = [];
const GRANNY_LOOKS = [
    { scarf: "#f8fafc", dots: "#60a5fa", cardigan: "#7f1d1d", skirt: "#1e3a8a" },
    { scarf: "#fde68a", dots: "#b45309", cardigan: "#14532d", skirt: "#3f3f46" },
    { scarf: "#fbcfe8", dots: "#be185d", cardigan: "#78350f", skirt: "#4c1d95" },
    { scarf: "#bbf7d0", dots: "#15803d", cardigan: "#1e3a8a", skirt: "#7f1d1d" },
    { scarf: "#e9d5ff", dots: "#7e22ce", cardigan: "#57534e", skirt: "#0f766e" },
    { scarf: "#fed7aa", dots: "#c2410c", cardigan: "#334155", skirt: "#713f12" }
];
function spawnGrannies(cx) {
    grannies = [];
    for (let i = 0; i < 6; i++) {
        const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
        grannies.push({
            x: side < 0 ? camX - 80 - row * 60 : camX + width + 80 + row * 60,
            tx: cx + side * (60 + row * 85), cx, dir: -side, phase: i * 1.3,
            state: 'run', look: GRANNY_LOOKS[i], glasses: i % 3 === 0, speed: 5.5 + row * 0.6
        });
    }
}
function updateGrannies() {
    grannies.forEach(g => {
        if (g.state === 'run') {
            const d = g.tx - g.x;
            g.dir = Math.sign(d) || g.dir;
            g.x += Math.sign(d) * Math.min(Math.abs(d), g.speed);
            g.phase += 0.35;
            if (Math.abs(d) < 2) { g.state = 'party'; g.dir = Math.sign(g.cx - g.x) || 1; }
        } else g.phase += 0.22;
    });
}
function drawGranny(ctx, g) {
    const gy = height - 60, L = g.look, party = g.state === 'party';
    const hop = party ? Math.abs(Math.sin(g.phase)) * 18 : Math.abs(Math.sin(g.phase)) * 4;
    ctx.save();
    ctx.translate(g.x, gy - hop);
    ctx.scale(g.dir, 1);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    // Bacaklar (çorap) ve terlikler
    [-1, 1].forEach(s => {
        const a = party ? s * 0.15 : Math.sin(g.phase + (s > 0 ? 0 : Math.PI)) * 0.5;
        const fx = Math.sin(a) * 26 + s * 4, fy = -Math.cos(a) * 26 + 26;
        ctx.strokeStyle = "#b08968"; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(s * 5, -26); ctx.lineTo(fx, fy - 4); ctx.stroke();
        ctx.fillStyle = "#1c1917"; ctx.beginPath(); ctx.ellipse(fx + 4, fy - 2, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
    });
    // Uzun etek (puanlı)
    ctx.fillStyle = L.skirt;
    ctx.beginPath(); ctx.moveTo(-17, -80); ctx.lineTo(19, -80); ctx.lineTo(28, -22); ctx.lineTo(-26, -22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(-18 + (i % 3) * 18 + (i > 2 ? 3 : 0), -70 + Math.floor(i / 3) * 16, 2, 0, Math.PI * 2); ctx.fill(); }
    // Arka kol
    ctx.strokeStyle = L.cardigan; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(-6, -112); ctx.lineTo(-12 + Math.sin(g.phase) * 4, -86); ctx.stroke();
    // Hırka (hafif kambur)
    ctx.fillStyle = L.cardigan;
    ctx.beginPath(); ctx.moveTo(-16, -78); ctx.lineTo(-14, -112); ctx.quadraticCurveTo(2, -122, 18, -110); ctx.lineTo(20, -78); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#e7e5e4";
    [-104, -94, -84].forEach(y => { ctx.beginPath(); ctx.arc(9, y, 1.8, 0, Math.PI * 2); ctx.fill(); });
    // Kafa: başörtüsü, yüz, çenenin altında düğüm
    const fx = 6, fy = -134;
    ctx.fillStyle = L.scarf;
    ctx.beginPath(); ctx.ellipse(fx - 2, fy - 2, 19, 21, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(fx - 18, fy + 4); ctx.quadraticCurveTo(fx - 16, fy + 26, fx - 4, fy + 24); ctx.lineTo(fx - 12, fy + 6); ctx.closePath(); ctx.fill();   // arkaya sarkan uç
    ctx.fillStyle = L.dots;
    [[-10, -12], [0, -16], [-14, 2], [-6, -4], [-16, -8]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(fx + dx, fy + dy, 1.8, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = "#f1c9a5";
    ctx.beginPath(); ctx.ellipse(fx + 4, fy + 3, 11, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = L.scarf;                                           // alın bandı ve çene düğümü
    ctx.beginPath(); ctx.ellipse(fx + 3, fy - 9, 13, 5, 0, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(fx + 2, fy + 15); ctx.lineTo(fx - 3, fy + 22); ctx.lineTo(fx + 4, fy + 20); ctx.lineTo(fx + 9, fy + 24); ctx.lineTo(fx + 7, fy + 15); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#7c5a3c"; ctx.lineWidth = 1.5;                   // gözler, kırışıklar
    [[0, 0], [9, 0]].forEach(([dx]) => { ctx.beginPath(); ctx.arc(fx + dx, fy, 2.4, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(fx + 13, fy + 2); ctx.lineTo(fx + 15, fy + 4); ctx.moveTo(fx - 4, fy + 6); ctx.lineTo(fx - 3, fy + 9); ctx.stroke();
    if (g.glasses) {
        ctx.strokeStyle = "#44403c"; ctx.lineWidth = 1.5;
        [[0], [9]].forEach(([dx]) => { ctx.beginPath(); ctx.arc(fx + dx, fy + 0.5, 4.2, 0, Math.PI * 2); ctx.stroke(); });
        ctx.beginPath(); ctx.moveTo(fx + 4, fy); ctx.lineTo(fx + 5, fy); ctx.stroke();
    }
    ctx.fillStyle = "#e0a98a"; ctx.beginPath(); ctx.arc(fx + 12, fy + 5, 2.4, 0, Math.PI * 2); ctx.fill();   // burun
    if (party) {                                                        // bağırarak kutlar
        ctx.fillStyle = "#4a1d0f"; ctx.beginPath(); ctx.ellipse(fx + 6, fy + 10, 4, 2 + Math.abs(Math.sin(g.phase * 2)) * 3, 0, 0, Math.PI * 2); ctx.fill();
    } else {
        ctx.strokeStyle = "#7c5a3c"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(fx + 6, fy + 8, 3, 0.2, Math.PI - 0.2); ctx.stroke();
    }
    // Ön kol (başın önünde çizilir): koşarken sallanır, kutlarken havada terlik sallar
    const aa = party ? 2.5 + Math.sin(g.phase * 2) * 0.5 : 0.5 + Math.sin(g.phase) * 0.6;   // kutlarken kol öne-yukarı
    const hx = 10 + Math.sin(aa) * 36, hy = -110 + Math.cos(aa) * 36;
    ctx.strokeStyle = L.cardigan; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(10, -110); ctx.lineTo(hx, hy); ctx.stroke();
    if (party) {                                                       // terlik
        ctx.save(); ctx.translate(hx, hy); ctx.rotate(aa + Math.PI);
        ctx.fillStyle = "#a16207"; ctx.beginPath(); ctx.ellipse(0, -14, 7, 15, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#f472b6"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -16, 6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
        ctx.restore();
    }
    ctx.fillStyle = "#f1c9a5"; ctx.beginPath(); ctx.arc(hx, hy, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function fireball(x, y, vx, vy) {
    projectiles.push({ type: 'fire', x, y, vx, vy, active: true, life: 400, angle: 0, grounded: false });
}

function bossAttack() {
    const b = boss;
    b.attacks++;
    const mx = b.x + b.w / 2, my = b.y + b.h * 0.3;
    if(b.attacks % 3 === 0) {
        // Her üçüncü saldırı: oyuncuya doğru üçlü alev
        const side = Math.sign(player.x + player.w / 2 - mx) || 1;
        for(let i = 0; i < 3; i++) fireball(mx, my, side * (6 + i * 2.5), -8 + i * 1.5);
    } else {
        // Etrafa alev yağmuru
        const n = 7;
        for(let i = 0; i < n; i++) {
            fireball(mx, b.y + 20, -9 + 18 * i / (n - 1) + (Math.random() - 0.5) * 2, -12 - Math.random() * 5);
        }
    }
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
    playSfx('hit', { rate: 0.8 + Math.random() * 0.2, vol: 0.7 });
    createParticle(boss.x + boss.w / 2, boss.y + 40, "-" + n, "#fde047", 0.8);
    if(boss.hp > 0) return;
    boss.dying = true;
    levelEnding = true;
    projectiles = projectiles.filter(p => p.type === 'bullet');   // canavarın saldırıları silinir
    $('score').innerText = score += 20000;
    $('sfx-explosion').currentTime = 0; $('sfx-explosion').play().catch(()=>{});
    for(let i = 0; i < 30; i++) createParticle(boss.x + Math.random() * boss.w, boss.y + Math.random() * boss.h);
    playSfx('hit', { rate: 0.6, vol: 1 });
    playSfx('cry', { rate: 0.55, vol: 1, delay: 0.08 });   // canavar: kalın, uzun çığlık
    // Başörtülü teyzeler koşarak gelip kutlar; ses bitince bölüm biter
    spawnGrannies(boss.x + boss.w / 2);
    const gd = playSfx('granny', { vol: 1, delay: 0.6 });
    setTimeout(completeLevel, Math.max(3000, (gd + 0.6) * 1000 + 1200));
}

function updateBoss() {
    const b = boss;
    if(!b) return;
    b.anim++;
    if(b.dying) { if(++b.deathT > 60) boss = null; return; }
    if(b.hurt > 0) b.hurt--;
    if(b.talk > 0) b.talk--;      // karşılama konuşması bitene kadar saldırmaz
    else b.T.update(b);

    // Temas: üstüne zıplayınca hasar, yandan değince ölüm
    if(!player.isDying && player.x + player.w - 30 > b.x + 40 && player.x + 30 < b.x + b.w - 40 &&
       player.y + player.h > b.y + 30 && player.y < b.y + b.h) {
        if(player.vy > 0 && player.y + player.h < b.y + b.T.stomp) { player.vy = -22; damageBoss(2); }
        else if(power.star > 0) damageBoss(1);   // dokunulmazken çarpmak canavara hasar verir
        else die();
    }
}

// ALEVİ: yavaşça yaklaşır, kollarını kaldırıp etrafa alev saçar
function updateAlevi(b) {
    const dist = (player.x + player.w / 2) - (b.x + b.w / 2);
    b.look = Math.sign(dist) || b.look;
    // Saldırı hazırlığında durur; değilse oyuncuya yavaşça yaklaşır (arenasından çıkmaz)
    if(b.charge <= 0 && Math.abs(dist) > 250) b.x += Math.sign(dist) * 1.3;
    b.x = Math.max(b.homeX - b.T.arena, Math.min(b.x, b.homeX + b.T.arena));

    if(!player.isDying && Math.abs(dist) < 1400 && b.charge <= 0 && ++b.timer > 110) { b.timer = 0; b.charge = 30; }
    if(b.charge > 0 && --b.charge === 0) bossAttack();
}

// KURT: koşarak yaklaşır; sırayla ATILMA (çömel → hızla koş) ve SIÇRAMA (zıpla → inişte şok dalgası)
function updateKurt(b) {
    const groundY = height - 60 - b.h;
    const dist = (player.x + player.w / 2) - (b.x + b.w / 2);
    b.look = Math.sign(dist) || b.look;
    switch(b.state) {
        case 'walk':
            b.dir = Math.sign(dist) || b.dir;
            if(Math.abs(dist) > 220) { b.x += b.dir * 2.2; b.run += 0.14; }
            if(!player.isDying && Math.abs(dist) < 1400 && ++b.timer > 80) {
                b.timer = 0;
                b.attacks++;
                b.next = b.attacks % 2 ? 'dash' : 'leap';
                b.state = 'crouch';
                b.stateT = b.next === 'dash' ? 40 : 28;   // hazırlık: oyuncuya kaçma süresi
                createParticle(b.x + b.w / 2, b.y - 50, b.next === 'dash' ? "GRRR!" : "AUUU!", "#e5e7eb", 1.0);
            }
            break;
        case 'crouch':
            if(--b.stateT <= 0) {
                b.dir = Math.sign(dist) || b.dir;
                if(b.next === 'dash') { b.state = 'dash'; b.stateT = 75; }
                else {
                    b.state = 'leap'; b.vy = -19;
                    const air = 2 * 19 / 0.9;   // havada kalma süresi (kare)
                    b.vx = Math.max(-12, Math.min(12, dist / air));
                }
            }
            break;
        case 'dash':
            b.x += b.dir * 13; b.run += 0.5;
            if(--b.stateT <= 0 || b.x <= b.homeX - b.T.arena || b.x >= b.homeX + b.T.arena) { b.state = 'walk'; b.timer = 20; }
            break;
        case 'leap':
            b.vy += 0.9; b.x += b.vx; b.y += b.vy;
            if(b.y >= groundY) {
                b.y = groundY; b.state = 'walk'; b.timer = 15;
                const cx = b.x + b.w / 2;
                [-1, 1].forEach(d => projectiles.push({ type: 'wave', x: cx + d * b.w * 0.3, y: height - 60, vx: d * 8, active: true, life: 85, angle: 0 }));
                for(let i = 0; i < 12; i++) createParticle(cx + (Math.random() - 0.5) * b.w, height - 70);
            }
            break;
    }
    if(b.state !== 'leap') b.y = groundY;
    b.x = Math.max(b.homeX - b.T.arena, Math.min(b.x, b.homeX + b.T.arena, WORLD_WIDTH - b.w));
    b.crouch += ((b.state === 'crouch' ? 1 : 0) - b.crouch) * 0.25;
}

// FETÖ: bastonlu yaşlı adam. Ağır ağır yaklaşır; avucundan 1 dolarlar savurur,
// her üçüncü saldırıda bastonunu havaya kaldırıp yere vurur ve iki yana şok dalgası gönderir.
function updateFeto(b) {
    b.y = height - 60 - b.h;
    const dist = (player.x + player.w / 2) - (b.x + b.w / 2);
    b.look = Math.sign(dist) || b.look;
    if(b.recover > 0) b.recover--;
    if(b.state === 'walk') {
        if(Math.abs(dist) > 260 && b.recover <= 0) { b.x += Math.sign(dist) * 1.4; b.run += 0.08; }
        if(!player.isDying && Math.abs(dist) < 1400 && ++b.timer > 85) {
            b.timer = 0;
            b.attacks++;
            b.next = b.attacks % 3 === 0 ? 'slam' : 'volley';
            b.state = 'crouch';
            b.stateT = b.next === 'slam' ? 34 : 30;
            createParticle(b.x + b.w / 2, b.y - 50, b.next === 'slam' ? "HOOOP!" : "AL!", "#fde047", 1.0);
        }
    } else if(b.state === 'crouch' && --b.stateT <= 0) {
        if(b.next === 'volley') dollarVolley(b);
        else {
            const cx = b.x + b.w / 2 + b.look * 70 * b.T.scale;   // bastonun yere değdiği yer
            [-1, 1].forEach(d => projectiles.push({ type: 'wave', x: cx + d * 30, y: height - 60, vx: d * 8, active: true, life: 85, angle: 0 }));
            for(let i = 0; i < 10; i++) createParticle(cx + (Math.random() - 0.5) * 80, height - 70);
            playSfx('hit', { rate: 0.5, vol: 0.8 });
            b.recover = 18;
        }
        b.state = 'walk';
    }
    b.x = Math.max(b.homeX - b.T.arena, Math.min(b.x, b.homeX + b.T.arena, WORLD_WIDTH - b.w));
    b.crouch += ((b.state === 'crouch' ? 1 : 0) - b.crouch) * 0.25;
}

function dollarVolley(b) {
    const mx = b.x + b.w / 2, my = b.y + 40;
    const side = Math.sign(player.x + player.w / 2 - mx) || 1;
    for(let i = 0; i < 6; i++) {
        projectiles.push({ type: 'dollar1', x: mx, y: my, vx: side * (2 + i * 1.6), vy: -10 - Math.random() * 3,
                           active: true, life: 420, angle: 0, phase: Math.random() * 6, landed: false });
    }
}

// 1 dolar: yükselip yaprak gibi sallanarak süzülür; yere düşünce zararsızdır
function updateOneDollar(p) {
    p.life--;
    if(!p.landed) {
        p.vy = Math.min(p.vy + 0.3, 2.2);
        p.vx *= 0.985;
        const sway = Math.sin(p.life * 0.08 + p.phase);
        p.x += sway * 1.2; p.y += p.vy; p.angle = sway * 0.6;
        if(p.y > height - 72) { p.y = height - 72; p.vx = 0; p.landed = true; p.life = Math.min(p.life, 90); }
    } else p.vx = 0;
    if(player.isDying || !p.active || p.landed) return;
    if(p.x > player.x + 15 && p.x < player.x + player.w - 15 && p.y > player.y && p.y < player.y + player.h) { if(shieldBlocks(p)) blockProjectile(p); else { p.active = false; die(); } }
}

// Şok dalgası zeminde ilerler; üstünden zıplanarak kaçılır
function updateWave(p) {
    p.x += p.vx;
    p.life--;
    if(player.isDying || !p.active) return;
    if(Math.abs(p.x - (player.x + player.w / 2)) < 40 && player.y + player.h > p.y - 45) die();
}

function drawBoss(ctx, b) {
    b.T.draw(ctx, b);
    if(!b.dying) {
        const name = t(b.T.nameKey);
        ctx.font = "bold 34px Arial";
        ctx.textAlign = "center";
        ctx.lineWidth = 5; ctx.strokeStyle = "#000";
        const ly = b.y - (b.T.labelY || 35);   // isim, canavarın başının üstünde
        ctx.strokeText(name, b.x + b.w / 2, ly);
        ctx.fillStyle = "#fde047";
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

// ALEVİ: alevden bir adam. Bacakları, kaslı gövdesi, yumrukları ve insan yüzü var; saçı alev alev yanar.
// Saldırıdan önce kollarını havaya kaldırır, yumruklarındaki alevler büyür ve ağzını açar.
function drawAlevi(ctx, b) {
    const t0 = b.anim, W = b.T.dw, H = b.T.dh;
    const talk = b.talk > 0 ? Math.abs(Math.sin(b.anim * 0.45)) : 0;               // konuşma
    const charge = Math.max(b.charge > 0 ? 1 - b.charge / 30 : 0, talk * 0.5);   // saldırı hazırlığı 0→1
    const flick = i => Math.sin(t0 * 0.25 + i * 1.7);
    const step = Math.sin(t0 * 0.09);                      // ağır adımlar
    ctx.save();
    bossBaseTransform(ctx, b);

    // Arkadaki sıcak hale
    const halo = ctx.createRadialGradient(0, -H * 0.55, 20, 0, -H * 0.55, H * 0.65);
    halo.addColorStop(0, "rgba(251,146,60,0.45)"); halo.addColorStop(1, "rgba(251,146,60,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(-H * 0.65, -H * 1.2, H * 1.3, H * 1.3);

    ctx.shadowColor = "#f97316"; ctx.shadowBlur = 30;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const hipY = -H * 0.4, shY = -H * 0.7;

    // Bacaklar: kalça → diz → ayak; ayaklarda küçük alevler
    [-1, 1].forEach(s => {
        const hx = s * W * 0.11, fx = s * W * 0.14 + s * step * 10, kx = (hx + fx) / 2 + 6, ky = hipY * 0.48 - Math.max(0, s * step) * 8;
        ctx.strokeStyle = "#c2410c"; ctx.lineWidth = 36;
        ctx.beginPath(); ctx.moveTo(hx, hipY); ctx.lineTo(kx, ky); ctx.lineTo(fx, -12); ctx.stroke();
        ctx.strokeStyle = "#fb923c"; ctx.lineWidth = 14;
        ctx.beginPath(); ctx.moveTo(hx, hipY + 8); ctx.lineTo(kx, ky); ctx.lineTo(fx, -16); ctx.stroke();
        ctx.fillStyle = "#7f1d1d";
        ctx.beginPath(); ctx.ellipse(fx + s * 4, -8, 26, 11, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fde047"; flameTongue(ctx, fx + s * 4, -10, 22, 26 + 8 * flick(s * 3), flick(s) * 6);
    });

    // Gövde: geniş omuzlar, dar bel; kas çizgileri
    const body = ctx.createLinearGradient(0, shY, 0, hipY);
    body.addColorStop(0, "#f97316"); body.addColorStop(1, "#b91c1c");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(-W * 0.3, shY);
    ctx.quadraticCurveTo(0, shY - 14, W * 0.3, shY);
    ctx.quadraticCurveTo(W * 0.26, (shY + hipY) / 2, W * 0.15, hipY);
    ctx.lineTo(-W * 0.15, hipY);
    ctx.quadraticCurveTo(-W * 0.26, (shY + hipY) / 2, -W * 0.3, shY);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    const core = ctx.createRadialGradient(0, -H * 0.6, 4, 0, -H * 0.6, W * 0.22);
    core.addColorStop(0, "rgba(254,240,138,0.9)"); core.addColorStop(1, "rgba(254,240,138,0)");
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(0, -H * 0.6, W * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(127,29,29,0.75)"; ctx.lineWidth = 4;
    ctx.beginPath();                                                   // göğüs kasları
    ctx.moveTo(-W * 0.2, shY + 22); ctx.quadraticCurveTo(-W * 0.1, shY + 52, 0, shY + 40);
    ctx.quadraticCurveTo(W * 0.1, shY + 52, W * 0.2, shY + 22);
    ctx.moveTo(0, shY + 40); ctx.lineTo(0, hipY - 8);                  // karın
    for (let r = 0; r < 3; r++) { const y = shY + 64 + r * 18; ctx.moveTo(-W * 0.08, y); ctx.lineTo(W * 0.08, y); }
    ctx.stroke();
    // Kemer
    ctx.fillStyle = "#450a0a"; ctx.fillRect(-W * 0.16, hipY - 10, W * 0.32, 14);
    ctx.fillStyle = "#fbbf24"; ctx.fillRect(-10, hipY - 9, 20, 12);

    // Kollar: omuz → dirsek → yumruk. Saldırıdan önce yukarı kalkar.
    ctx.shadowColor = "#f97316"; ctx.shadowBlur = 25;
    [-1, 1].forEach(s => {
        const sx = s * W * 0.3, sy = shY + 10;
        const a1 = 0.3 + charge * 2.3 + Math.sin(t0 * 0.06 + s) * 0.05;  // aşağıdan dışa doğru açı
        const a2 = a1 - 0.45 * (1 - charge);
        const ex = sx + s * Math.sin(a1) * 66, ey = sy + Math.cos(a1) * 66;
        const hx = ex + s * Math.sin(a2) * 60, hy = ey + Math.cos(a2) * 60;
        ctx.strokeStyle = "#ea580c"; ctx.lineWidth = 28;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.strokeStyle = "#fdba74"; ctx.lineWidth = 9;
        ctx.beginPath(); ctx.moveTo(sx, sy + 4); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.fillStyle = "#c2410c";
        ctx.beginPath(); ctx.arc(hx, hy, 17, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#f97316"; flameTongue(ctx, hx, hy, 30 + charge * 22, 40 + charge * 60 + 8 * flick(s), flick(s + 2) * 8);
        ctx.fillStyle = "#fde047"; flameTongue(ctx, hx, hy, 14 + charge * 10, 22 + charge * 36, flick(s + 4) * 5);
    });

    // Boyun + alev saçlar (yüzün arkasında)
    const fy = -H * 0.8;
    ctx.fillStyle = "#ea580c"; ctx.fillRect(-18, fy + 30, 36, shY - fy - 26);
    [["#b91c1c", 1], ["#f97316", 0.8], ["#fde047", 0.55]].forEach(([col, f], li) => {
        ctx.fillStyle = col;
        for (let i = -3; i <= 3; i++) flameTongue(ctx, i * 12, fy - 26, 26 * f, (52 + 14 * flick(i + li)) * f, flick(i * 2 + li) * 10);
    });
    ctx.shadowBlur = 0;

    // Yüz: insan yüzü, akkor gibi parlayan ten
    const skin = ctx.createRadialGradient(0, fy - 4, 6, 0, fy, 48);
    skin.addColorStop(0, "#fed7aa"); skin.addColorStop(1, "#f97316");
    ctx.fillStyle = skin;
    [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(s * 39, fy + 2, 8, 13, 0, 0, Math.PI * 2); ctx.fill(); });   // kulaklar
    ctx.beginPath(); ctx.ellipse(0, fy, 38, 46, 0, 0, Math.PI * 2); ctx.fill();
    [-1, 1].forEach(s => {
        const ex = s * 15, ey = fy - 6;
        ctx.fillStyle = "#fffbeb";
        ctx.beginPath(); ctx.ellipse(ex, ey, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1c1917";
        ctx.beginPath(); ctx.arc(ex + b.look * 4, ey + 1, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#7f1d1d"; ctx.lineWidth = 6; ctx.lineCap = "round";        // çatık kaşlar
        ctx.beginPath(); ctx.moveTo(s * 28, ey - 17); ctx.lineTo(s * 5, ey - 9); ctx.stroke();
    });
    ctx.strokeStyle = "#9a3412"; ctx.lineWidth = 3;                                    // burun
    ctx.beginPath(); ctx.moveTo(b.look * 2, fy - 4); ctx.lineTo(b.look * 7, fy + 12); ctx.lineTo(0, fy + 15); ctx.stroke();
    // Ağız: normalde somurtur, saldırırken bağırır
    const my = fy + 28;
    if (charge > 0.05) {
        const mh = 4 + charge * 14;
        ctx.fillStyle = "#450a0a";
        ctx.beginPath(); ctx.ellipse(0, my, 15, mh, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fffbeb"; ctx.fillRect(-11, my - mh + 1, 22, Math.min(5, mh * 0.5));
    } else {
        ctx.strokeStyle = "#7f1d1d"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(-14, my + 3); ctx.quadraticCurveTo(0, my - 5, 14, my + 3); ctx.stroke();
    }
    ctx.restore();
}

// KURT: iki ayağı üstünde kambur duran, kıllı bir insan (sağa bakar, sola dönünce aynalanır).
// Kurt bacakları (parmak ucunda basar, bilek yerden yüksek), yırtık kot şort, pençeli uzun kollar,
// gür saçlı, sakallı insan yüzü.
function drawKurt(ctx, b) {
    const W = b.T.dw, H = b.T.dh, c = b.crouch, air = b.state === 'leap';   // tasarım boyutu
    const talk = b.talk > 0 && Math.sin(b.anim * 0.45) > 0;   // konuşurken çene açılıp kapanır
    const angry = b.state === 'crouch' || b.state === 'dash' || talk;
    const moving = b.state === 'dash' || (b.state === 'walk' && Math.abs((player.x + player.w / 2) - (b.x + b.w / 2)) > 220);
    const run = b.run, dash = b.state === 'dash';
    const FUR = "#6b6259", FUR_D = "#4a433d", FUR_L = "#b8afa6";
    ctx.save();
    bossBaseTransform(ctx, b);
    ctx.scale(b.dir, 1);
    ctx.lineCap = "round"; ctx.lineJoin = "round";

    const lean = dash ? 46 : moving ? 24 : 12;                          // öne eğilme
    const hipX = -12, hipY = -H * 0.42 + c * 34 + (moving ? -Math.abs(Math.sin(run)) * 6 : 0);
    const S = { x: hipX + 24 + lean, y: -H * 0.76 + c * 40 };           // omuz
    const L = 70;                                                       // uyluk = baldır

    // Bacak: kalça → diz (öne kırık) → bilek (yerden yüksek) → pati
    const leg = (s, col) => {
        const p = run + (s > 0 ? 0 : Math.PI);
        let fx, fy;
        if (air) { fx = hipX + (s > 0 ? 44 : -18); fy = hipY + 110; }
        else if (moving) { fx = hipX + Math.sin(p) * (dash ? 62 : 40); fy = -Math.max(0, Math.cos(p)) * 26; }
        else { fx = hipX + s * 16; fy = 0; }
        const ax = fx - 24, ay = fy - 36;
        const dx = ax - hipX, dy = ay - hipY, d = Math.hypot(dx, dy) || 1;
        const bend = Math.sqrt(Math.max(0, L * L - (d / 2) ** 2));
        const kx = (hipX + ax) / 2 + (dy / d) * bend, ky = (hipY + ay) / 2 - (dx / d) * bend;
        ctx.strokeStyle = col;
        ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(kx, ky); ctx.stroke();
        ctx.lineWidth = 19; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(ax, ay); ctx.stroke();
        ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(fx + 12, fy - 5); ctx.stroke();
        ctx.fillStyle = "#e7e5e4";                                      // ayak pençeleri
        for (let k = 0; k < 3; k++) {
            ctx.beginPath(); ctx.moveTo(fx + 14 + k * 4, fy - 9 + k * 3); ctx.lineTo(fx + 30 + k * 2, fy - 2 + k * 2); ctx.lineTo(fx + 14 + k * 4, fy - 1 + k * 2); ctx.closePath(); ctx.fill();
        }
    };

    // Kol: omuz → dirsek → pençeli el. Yürürken bacakların tersine sallanır,
    // hazırlıkta pençeler öne kalkar, atılmada geride, sıçramada havada.
    const arm = (s, col) => {
        const p = run + (s > 0 ? Math.PI : 0);
        let a1;
        if (air) a1 = 2.6 + s * 0.15;
        else if (b.state === 'crouch') a1 = 1.7 + s * 0.2;
        else if (dash) a1 = -0.9 + Math.sin(p * 2) * 0.3;
        else if (moving) a1 = 0.3 + Math.sin(p) * 0.6;
        else a1 = 0.35 + s * 0.1 + Math.sin(b.anim * 0.05) * 0.05;
        const a2 = a1 + 0.6;
        const sx = S.x + 4, sy = S.y + 10;
        const ex = sx + Math.sin(a1) * 66, ey = sy + Math.cos(a1) * 66;
        const hx = ex + Math.sin(a2) * 60, hy = ey + Math.cos(a2) * 60;
        ctx.strokeStyle = col;
        ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(hx, hy, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#f5f5f4"; ctx.lineWidth = 3.5;
        for (let k = -1; k <= 1; k++) {
            const a = a2 + k * 0.4;
            ctx.beginPath(); ctx.moveTo(hx + Math.sin(a) * 9, hy + Math.cos(a) * 9); ctx.lineTo(hx + Math.sin(a) * 27, hy + Math.cos(a) * 27); ctx.stroke();
        }
    };

    arm(-1, FUR_D);                     // uzaktaki kol ve bacak (koyu) önce
    leg(-1, FUR_D);

    // Kuyruk: kalçanın arkasından gür, sallanan
    const tw = Math.sin(b.anim * 0.15) * 10;
    ctx.fillStyle = FUR;
    ctx.beginPath();
    ctx.moveTo(hipX - 26, hipY - 16);
    ctx.quadraticCurveTo(hipX - 80, hipY - 10 + tw, hipX - 96, hipY + 50 + tw);
    ctx.quadraticCurveTo(hipX - 60, hipY + 20 + tw, hipX - 20, hipY + 10);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = FUR_L;
    ctx.beginPath(); ctx.ellipse(hipX - 94, hipY + 46 + tw, 7, 12, 0.5, 0, Math.PI * 2); ctx.fill();

    // Gövde: kambur sırt, geniş göğüs
    ctx.fillStyle = FUR;
    ctx.beginPath();
    ctx.moveTo(hipX - 36, hipY + 8);
    ctx.quadraticCurveTo(hipX - 44, (hipY + S.y) / 2, S.x - 40, S.y - 14);
    ctx.quadraticCurveTo(S.x, S.y - 34, S.x + 40, S.y + 6);
    ctx.quadraticCurveTo(S.x + 30, (hipY + S.y) / 2 + 20, hipX + 34, hipY + 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = FUR_L;                                              // açık renk göğüs ve karın
    ctx.beginPath(); ctx.ellipse((hipX + S.x) / 2 + 18, (hipY + S.y) / 2 + 6, 24, (hipY - S.y) * 0.42, -0.25, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(74,67,61,0.7)"; ctx.lineWidth = 3;          // kas çizgileri
    ctx.beginPath();
    ctx.moveTo(S.x - 6, S.y + 26); ctx.quadraticCurveTo(S.x + 14, S.y + 40, S.x + 30, S.y + 22);
    for (let r = 0; r < 3; r++) { const y = S.y + 54 + r * 17; ctx.moveTo((hipX + S.x) / 2 + 6, y); ctx.lineTo((hipX + S.x) / 2 + 28, y - 3); }
    ctx.stroke();
    ctx.fillStyle = FUR_D;                                              // sırttaki diken tüyler
    for (let i = 0; i < 7; i++) {
        const k = i / 6, x = hipX - 38 + (S.x - 40 - hipX + 38) * k, y = hipY + (S.y - 16 - hipY) * k;
        ctx.beginPath(); ctx.moveTo(x - 4, y + 10); ctx.lineTo(x - 22, y - 8 - i); ctx.lineTo(x + 10, y + 2); ctx.closePath(); ctx.fill();
    }

    leg(1, FUR);                        // yakındaki bacak

    // Yırtık kot şort (kalan son insanlık izi)
    ctx.fillStyle = "#1d4ed8";
    ctx.beginPath();
    ctx.moveTo(hipX - 40, hipY - 20); ctx.lineTo(hipX + 38, hipY - 22); ctx.lineTo(hipX + 44, hipY + 26);
    for (let i = 0; i <= 6; i++) ctx.lineTo(hipX + 44 - i * 14, hipY + 26 + (i % 2 ? 14 : 0));
    ctx.lineTo(hipX - 44, hipY + 22);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#93c5fd"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(hipX - 6, hipY - 18); ctx.lineTo(hipX - 2, hipY + 18); ctx.moveTo(hipX + 20, hipY + 4); ctx.lineTo(hipX + 32, hipY + 12); ctx.stroke();
    ctx.fillStyle = "#422006"; ctx.fillRect(hipX - 40, hipY - 22, 80, 7);   // kemer

    // Boyun ve yele
    const hx = S.x + 40, hy = S.y - 30 + c * 10;
    ctx.fillStyle = FUR;
    ctx.beginPath(); ctx.moveTo(S.x - 30, S.y); ctx.lineTo(hx - 24, hy - 20); ctx.lineTo(hx + 10, hy + 24); ctx.lineTo(S.x + 34, S.y + 20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = FUR_D;
    for (let i = 0; i < 5; i++) {
        const x = S.x - 26 + i * 12, y = S.y - 10 - i * 6;
        ctx.beginPath(); ctx.moveTo(x - 6, y + 10); ctx.lineTo(x - 16, y - 14); ctx.lineTo(x + 8, y + 4); ctx.closePath(); ctx.fill();
    }

    // Kıllı insan kafası (sağa bakar; orijin kafanın merkezi): gür saç, favori ve sakal, insan yüzü
    ctx.save();
    ctx.translate(hx - 10, hy + 4);
    const SKIN = "#c99a6e", SKIN_D = "#9c6f4a";
    ctx.fillStyle = FUR_D;                                              // arkadaki gür, dağınık saç
    ctx.beginPath(); ctx.ellipse(-10, -6, 42, 44, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 8; i++) {
        const a = -2.6 + i * 0.42, r = 44;
        ctx.beginPath(); ctx.moveTo(-10 + Math.cos(a) * (r - 14), -6 + Math.sin(a) * (r - 14));
        ctx.lineTo(-10 + Math.cos(a + 0.12) * (r + 16), -6 + Math.sin(a + 0.12) * (r + 16));
        ctx.lineTo(-10 + Math.cos(a + 0.3) * (r - 10), -6 + Math.sin(a + 0.3) * (r - 10)); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = SKIN;                                               // yüz
    ctx.beginPath(); ctx.ellipse(10, 6, 30, 36, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-16, 4, 7, 11, 0, 0, Math.PI * 2); ctx.fill();   // kulak
    ctx.strokeStyle = SKIN_D; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(-16, 4, 4, -1.2, 1.4); ctx.stroke();
    ctx.fillStyle = FUR;                                                // favoriler + yanaklara kadar sakal
    ctx.beginPath();
    ctx.moveTo(-8, -6); ctx.lineTo(-4, 26); ctx.quadraticCurveTo(10, 50, 30, 44);
    ctx.lineTo(40, 30); ctx.lineTo(36, 26); ctx.quadraticCurveTo(22, 36, 12, 26); ctx.lineTo(6, 4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = FUR_D; ctx.lineWidth = 2;                         // sakal kılları
    for (let i = 0; i < 9; i++) { const x = -4 + i * 4.5, y = 28 + Math.sin(i) * 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 2, y + 9); ctx.stroke(); }
    ctx.fillStyle = FUR_D;                                              // alına düşen perçemler
    ctx.beginPath(); ctx.moveTo(-12, -30); ctx.lineTo(34, -32); ctx.lineTo(28, -20); ctx.lineTo(22, -26); ctx.lineTo(16, -16); ctx.lineTo(8, -24); ctx.lineTo(0, -14); ctx.lineTo(-6, -22); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#2a2522"; ctx.lineWidth = 6; ctx.lineCap = "round";   // gür, birleşik kaş
    ctx.beginPath(); ctx.moveTo(6, angry ? -14 : -12); ctx.lineTo(22, angry ? -6 : -10); ctx.lineTo(38, angry ? -13 : -11); ctx.stroke();
    ctx.fillStyle = "#fff";                                             // göz: saldırıda sarı-kırmızı parlar
    ctx.beginPath(); ctx.ellipse(27, -2, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = angry ? "#ef4444" : "#ca8a04";
    if (angry) { ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 12; }
    ctx.beginPath(); ctx.arc(29, -2, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(29.5, -2, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = SKIN; ctx.strokeStyle = SKIN_D; ctx.lineWidth = 2;  // burun
    ctx.beginPath(); ctx.moveTo(36, 0); ctx.quadraticCurveTo(48, 14, 42, 18); ctx.lineTo(34, 16); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = FUR_D;                                              // bıyık
    ctx.beginPath(); ctx.ellipse(32, 22, 11, 4, 0.15, 0, Math.PI * 2); ctx.fill();
    if (angry) {                                                        // hırlayan ağız, sivri dişler
        ctx.fillStyle = "#5b1010";
        ctx.beginPath(); ctx.ellipse(30, 30, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        [[23, 26], [35, 26]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4, y); ctx.lineTo(x + 2, y + 7); ctx.closePath(); ctx.fill(); });
    } else {
        ctx.strokeStyle = "#5b3a24"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(24, 30); ctx.lineTo(37, 29); ctx.stroke();
    }
    ctx.restore();

    arm(1, FUR);                        // yakındaki kol en önde
    ctx.restore();
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
    ctx.fillRect(x, y, w * b.hp / b.T.hp, 18);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t(b.T.nameKey) + "  " + b.hp + " / " + b.T.hp, width / 2, y + 9);
    ctx.textBaseline = "alphabetic";
}

// FETÖ'nün savurduğu 1 dolar: kırmızı parıltılı (tehlikeli olduğu belli olsun)
function drawOneDollar(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 10;
    ctx.fillStyle = "#4d7c0f"; ctx.fillRect(-22, -11, 44, 22);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#a3e635"; ctx.fillRect(-19, -8, 38, 16);
    ctx.fillStyle = "#4d7c0f";
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.font = "bold 9px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("1", -13, 0); ctx.fillText("1", 13, 0);
    ctx.fillStyle = "#a3e635"; ctx.fillText("$", 0, 0.5);
    ctx.restore();
}

// FETÖ: bastonlu, kambur yaşlı adam. Koyu palto, kravat, dazlak kafa, beyaz yan saçlar ve gür beyaz kaşlar.
// Bir elinde baston, öbür eliyle 1 dolar savurur. Oyuncuya döner (ayna).
function drawFeto(ctx, b) {
    const W = b.T.dw, H = b.T.dh;   // tasarım boyutu (bossBaseTransform küçültür)
    const slam = b.state === 'crouch' && b.next === 'slam' ? 1 - b.stateT / 34 : 0;    // baston havaya kalkar
    const toss = b.state === 'crouch' && b.next === 'volley' ? 1 - b.stateT / 30 : 0;   // el geriye gider
    const hit = b.recover > 0 ? b.recover / 18 : 0;                                    // bastonu yere vurdu
    const talk = b.talk > 0 ? Math.abs(Math.sin(b.anim * 0.45)) : 0;   // konuşma
    const angry = slam > 0 || toss > 0 || talk > 0.3;
    const walk = Math.sin(b.run);
    ctx.save();
    bossBaseTransform(ctx, b);
    ctx.scale(b.look, 1);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const hunch = 16, hipY = -H * 0.38, shY = -H * 0.66 + hit * 8;

    // Bacaklar (pantolon) ve ayakkabılar
    [-1, 1].forEach(k => {
        const fx = k * 12 + walk * k * 14, kx = k * 10 + walk * k * 8 + 8, ky = hipY * 0.5;
        ctx.strokeStyle = k < 0 ? "#1f2430" : "#2a303c"; ctx.lineWidth = 24;
        ctx.beginPath(); ctx.moveTo(k * 12, hipY); ctx.lineTo(kx, ky); ctx.lineTo(fx, -12); ctx.stroke();
        ctx.fillStyle = "#0b0b0b";
        ctx.beginPath(); ctx.ellipse(fx + 9, -7, 21, 9, 0, 0, Math.PI * 2); ctx.fill();
    });

    // Para atan kol (arkada)
    const backArm = () => {
        const sx = hunch - 22, sy = shY + 12;
        const a = 0.15 - toss * 2.4;                           // negatif: geriye/yukarı
        const ex = sx + Math.sin(a) * 52, ey = sy + Math.cos(a) * 52;
        const a2 = a + 0.4 * (1 - toss);
        const hx = ex + Math.sin(a2) * 48, hy = ey + Math.cos(a2) * 48;
        ctx.strokeStyle = "#2b2f36"; ctx.lineWidth = 22;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.fillStyle = "#e8c4a0"; ctx.beginPath(); ctx.arc(hx, hy, 10, 0, Math.PI * 2); ctx.fill();
        if (toss > 0.25) for (let i = 0; i < 3; i++) drawOneDollar(ctx, hx + i * 4, hy - 8 - i * 5, -0.4 + i * 0.3);
    };
    backArm();

    // Palto: omuzlardan dizlere, kambur
    ctx.fillStyle = "#3b3f46";
    ctx.beginPath();
    ctx.moveTo(hunch - 36, shY);
    ctx.quadraticCurveTo(hunch, shY - 16, hunch + 38, shY + 2);
    ctx.lineTo(48, hipY * 0.42);
    ctx.lineTo(-42, hipY * 0.42);
    ctx.quadraticCurveTo(-46, (shY + hipY) / 2, hunch - 36, shY);
    ctx.closePath(); ctx.fill();
    // Gömlek, kravat, yakalar, düğmeler
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath(); ctx.moveTo(hunch + 2, shY - 2); ctx.lineTo(hunch + 30, shY + 2); ctx.lineTo(hunch + 18, shY + 52); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath(); ctx.moveTo(hunch + 14, shY + 4); ctx.lineTo(hunch + 21, shY + 4); ctx.lineTo(hunch + 22, shY + 40); ctx.lineTo(hunch + 17, shY + 48); ctx.lineTo(hunch + 13, shY + 40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#4b5563";
    ctx.beginPath(); ctx.moveTo(hunch + 2, shY - 4); ctx.lineTo(hunch + 14, shY + 56); ctx.lineTo(hunch - 6, shY + 20); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hunch + 32, shY); ctx.lineTo(hunch + 20, shY + 56); ctx.lineTo(hunch + 40, shY + 22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#111827";
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(hunch + 16 - i * 6, shY + 70 + i * 22, 3.5, 0, Math.PI * 2); ctx.fill(); }

    // Boyun + kafa: önden bakan, simetrik yaşlı adam yüzü
    const hx = hunch + 22, hy = shY - 44;
    ctx.fillStyle = "#d9ae86"; ctx.fillRect(hx - 13, hy + 30, 26, 20);
    ctx.save();
    ctx.translate(hx, hy);
    const SKIN = "#e8c4a0", LINE = "#b08968";
    // Kulaklar
    [-1, 1].forEach(s => {
        ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(s * 38, 4, 8, 14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = LINE; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(s * 38, 4, 4, 8, 0, 0, Math.PI * 2); ctx.stroke();
    });
    // Kafa (dazlak) ve parlaması
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(0, 0, 36, 46, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.beginPath(); ctx.ellipse(-8, -32, 13, 6, -0.3, 0, Math.PI * 2); ctx.fill();
    // Kulakların üstünde beyaz saçlar
    ctx.fillStyle = "#e5e7eb";
    [-1, 1].forEach(s => [[34, -16, 8], [38, -5, 8], [36, 8, 6]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(s * x, y, r, 0, Math.PI * 2); ctx.fill(); }));
    // Alın kırışıkları
    ctx.strokeStyle = LINE; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-16, -30 + i * 6); ctx.quadraticCurveTo(0, -34 + i * 6, 16, -30 + i * 6); ctx.stroke(); }
    // Gür beyaz kaşlar: normalde dış uçları sarkık, kızınca iç uçları çatılır
    [-1, 1].forEach(s => {
        ctx.save(); ctx.translate(s * 15, -13); ctx.rotate(s * (angry ? 0.3 : -0.15));
        ctx.fillStyle = "#f3f4f6"; ctx.strokeStyle = "#9ca3af"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(0, 0, 12, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#d1d5db";
        for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * 4, -2); ctx.lineTo(k * 4 + s * 2, -7); ctx.stroke(); }
        ctx.restore();
    });
    // Gözler: göz kapakları sarkık, altında torbalar; bakış oyuncuya
    [-1, 1].forEach(s => {
        const x = s * 15, y = -2;
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(x, y, 6.5, 4.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1c1917"; ctx.beginPath(); ctx.arc(x + 1.5, y + 0.5, 2.7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#d9ae86"; ctx.fillRect(x - 7, y - 5, 14, angry ? 1.5 : 3.5);
        ctx.strokeStyle = LINE; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y + 4, 6, 0.35, Math.PI - 0.35); ctx.stroke();
    });
    // Burun: yüzün ortasında, iri
    ctx.fillStyle = "#e0b48f"; ctx.strokeStyle = "#a47552"; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-4, 0); ctx.quadraticCurveTo(-10, 13, -8, 17); ctx.quadraticCurveTo(0, 22, 8, 17); ctx.quadraticCurveTo(10, 13, 4, 0);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#8a5a3c";
    [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(s * 4, 17.5, 2.2, 1.4, 0, 0, Math.PI * 2); ctx.fill(); });
    // Yanak çizgileri (yaşlılık) ve ağız
    ctx.strokeStyle = LINE; ctx.lineWidth = 2;
    [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * 11, 16); ctx.quadraticCurveTo(s * 17, 28, s * 14, 40); ctx.stroke(); });
    if (angry) {
        ctx.fillStyle = "#4a1d0f";
        ctx.beginPath(); ctx.ellipse(0, 30, 9, 3 + Math.max(slam, toss, talk) * 7, 0, 0, Math.PI * 2); ctx.fill();
    } else {
        ctx.strokeStyle = "#8a5a3c"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(-10, 32); ctx.quadraticCurveTo(0, 27, 10, 32); ctx.stroke();
    }
    ctx.strokeStyle = LINE; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 44, 7, 0.4, Math.PI - 0.4); ctx.stroke();   // çene kıvrımı
    ctx.restore();

    // Bastonlu kol (önde): baston normalde yere dayalı, saldırıda havaya kalkar, sonra yere iner
    const sx = hunch + 30, sy = shY + 14;
    const a = 0.55 + slam * 2.4;
    const ex = sx + Math.sin(a) * 50, ey = sy + Math.cos(a) * 50;
    const a2 = a - 0.25;
    const hx2 = ex + Math.sin(a2) * 46, hy2 = ey + Math.cos(a2) * 46;
    ctx.strokeStyle = "#353a42"; ctx.lineWidth = 22;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx2, hy2); ctx.stroke();
    const ca = slam > 0 ? a2 * slam + 0.05 * (1 - slam) : 0.05;      // bastonun açısı (0: dik aşağı)
    const caneLen = slam > 0 ? 100 : -hy2 - 2;
    const tx = hx2 + Math.sin(ca) * caneLen, ty = hy2 + Math.cos(ca) * caneLen;
    ctx.strokeStyle = "#6b3f1d"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(hx2, hy2); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.beginPath(); ctx.arc(hx2 - 10 * Math.cos(ca), hy2 + 10 * Math.sin(ca) - 2, 10, Math.PI, 0); ctx.stroke();  // sap
    ctx.fillStyle = "#e8c4a0"; ctx.beginPath(); ctx.arc(hx2, hy2, 10, 0, Math.PI * 2); ctx.fill();
    if (hit > 0) {                                                     // yere vuruş: çatlak ve toz
        ctx.strokeStyle = `rgba(253,224,71,${hit})`; ctx.lineWidth = 3;
        for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + k * 16, ty - 10 - Math.abs(k) * 4); ctx.stroke(); }
    }
    ctx.restore();
}
