// Kırılabilir tuğlalar (gökyüzündeki kul hakkı torbalarının yerine) ve Recep'in sırtındaki çuval
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)
//
// Tuğlalar havada asılı bloklardır. Alttan kafa atınca, rüşvet zarfıyla ya da balyozla vurulur; her vuruş yalnızca
// TEK bir tuğlanın 1 canını götürür (yan yana tuğlalar birlikte çatlamaz), 3 vuruşta kırılır (Minecraft gibi). Üstüne basılabilir.
// LEVELS[n].bricks: tuğla sıklığı çarpanı (ör. 8. bölümde 2 kat).
// İçinden rastgele bir güç küresi ya da kul hakkı çıkar; kul hakkı uçup Recep'in çuvalına girer, çuval şişer.

const BRICK = 60, BRICK_HP = 3;
let bricks = [], debris = [], flyers = [], sackFill = 0;

function clearBricks() { bricks = []; debris = []; flyers = []; sackFill = 0; }

function buildBricks(level) {
    clearBricks();
    const r = seededRandom(level * 104729 + 7), gy = height - 60;
    const clash = (x, y, w, h) => platforms.some(p => p.y < gy - 1 && x < p.x + p.w + 30 && x + w > p.x - 30 && y < p.y + p.h + 30 && y + h > p.y - 200);
    const dens = LEVELS[level].bricks || 1, step = 1000 / dens;
    for (let i = 0; i < 36 * dens; i++) {
        let x = 700 + i * step + Math.floor(r() * step * 0.4);
        const n = 1 + Math.floor(r() * 3);                 // 1-3 tuğla yan yana
        const up = 250 + Math.floor(r() * 3) * 30;         // alt kenarı zeminden 250-310: ayaktayken kafaya değmez, zıplayınca değer
        const y = gy - up - BRICK;
        if (dens > 1 && clash(x, y, n * BRICK, BRICK)) x = [x + 250, x - 250, x + 120].find(nx => !clash(nx, y, n * BRICK, BRICK)) || x;   // sık tuğlalı bölümde boş yer ara
        if (clash(x, y, n * BRICK, BRICK) || bricks.some(b => Math.abs(b.y - y) < BRICK && b.x < x + n * BRICK + 20 && b.x + BRICK > x - 20)) continue;   // platformların ve başka tuğlaların içine girmesin
        for (let k = 0; k < n; k++) bricks.push({ x: x + k * BRICK, y, hp: BRICK_HP, shake: 0, cd: 0, seed: r() * 100 });
    }
}

// --- GİZLİ HAZİNE BLOKLARI ---
// Görünmez bloklar: yalnızca alttan kafa atınca ortaya çıkar, içinden 4 kul hakkı ve bonus puan fışkırır.
// Ara sıra hafifçe parıldar (ipucu). Açıldıktan sonra altın blok olarak kalır, üstüne basılabilir.
function buildSecrets(level) {
    const r = seededRandom(level * 31337 + 5), gy = height - 60, y = gy - 260 - BRICK;
    const free = x => !platforms.some(p => p.y < gy - 1 && x < p.x + p.w + 60 && x + BRICK > p.x - 60)
                   && !bricks.some(b => Math.abs(b.x - x) < 180);
    let n = 0;
    for (let k = 1; k < 19 && n < 3; k++) {
        if (r() > 0.3) continue;
        const x = 2250 + k * 1500 + 690 + Math.floor(r() * 120);   // iki desen arasındaki boşluk
        if (free(x)) { bricks.push({ x, y, hp: BRICK_HP, shake: 0, cd: 0, seed: r() * 100, secret: true, hidden: true }); n++; }
    }
}
function revealSecret(b) {
    b.hidden = false; b.used = true; b.shake = 14; b.cd = 8;
    const cx = b.x + BRICK / 2;
    for (let i = 0; i < 4; i++) flyers.push({ x: cx, y: b.y, vx: (i - 1.5) * 2.5, vy: -10 - Math.random() * 3, t: 0 });
    for (let i = 0; i < 16; i++) debris.push({ x: cx, y: b.y + BRICK / 2, vx: (Math.random() - 0.5) * 10, vy: -3 - Math.random() * 6, size: 5 + Math.random() * 5, life: 45, color: Math.random() < 0.5 ? "#fde047" : "#fff7ae" });
    $('score').innerText = addScore(10000);
    createParticle(cx, b.y - 40, t("secret"), "#fde047", 2.0);
    playSfx('hit', { rate: 1.9, vol: 0.6 });
    camShake = Math.max(camShake, 6);
}

// Kırılınca ne çıkar: %55 güç, %45 kul hakkı (3. bölümde kaset)
const BRICK_POWERS = [['speed', 29], ['double', 28], ['hammer', 25], ['heart', 15], ['star', 3]];   // yıldız (dokunulmazlık) nadir
function pickBrickPower() {
    let roll = Math.random() * 100;
    for (const [k, w] of BRICK_POWERS) { if ((roll -= w) < 0) return k; }
    return 'speed';
}

function hitBrick(b, dmg) {
    if (b.cd > 0 || b.hp <= 0 || b.used) return;   // açılmış hazine bloğu kırılmaz
    b.hp -= dmg; b.shake = 10; b.cd = 8;
    for (let i = 0; i < 4; i++) debris.push(brickChip(b, 0.5));
    playSfx('hit', { rate: 1.5 + Math.random() * 0.3, vol: 0.45 });
    if (b.hp <= 0) breakBrick(b);
}
function brickChip(b, s) {
    return { x: b.x + Math.random() * BRICK, y: b.y + Math.random() * BRICK, vx: (Math.random() - 0.5) * 8 * s, vy: -2 - Math.random() * 6 * s,
             size: 6 + Math.random() * 8 * s, life: 50, color: Math.random() < 0.7 ? "#9a3412" : "#d6d3d1" };
}
function breakBrick(b) {
    bricks = bricks.filter(o => o !== b);
    for (let i = 0; i < 14; i++) debris.push(brickChip(b, 1.2));
    playSfx('hit', { rate: 0.8, vol: 0.7 });
    const cx = b.x + BRICK / 2, cy = b.y + BRICK / 2;
    if (Math.random() < 0.55) {
        items.push({ x: cx, y: cy, collected: false, power: pickBrickPower(), rise: 26, targetY: b.y - 60 });
    } else {
        flyers.push({ x: cx, y: cy, vx: (Math.random() - 0.5) * 4, vy: -9, t: 0 });
    }
    $('score').innerText = addScore(500);
}

// Oyuncu tuğlaya alttan kafa atar ya da üstüne basar (platform döngüsünden hemen sonra çağrılır)
function collideBricks() {
    const pl = player.x + 25, pr = player.x + player.w - 25, cx = player.x + player.w / 2;
    let head = null;   // kafa birden çok tuğlaya değerse yalnızca başın tam üstündeki vurulur
    for (const b of bricks) {
        if (pr < b.x || pl > b.x + BRICK) continue;
        const bottom = b.y + BRICK;
        if (player.vy < 0 && player.y < bottom && player.y > bottom + player.vy - 2) {   // kafa attı
            if (!head || Math.abs(b.x + BRICK / 2 - cx) < Math.abs(head.x + BRICK / 2 - cx)) head = b;
        } else if (!b.hidden && player.vy >= 0 && player.y + player.h > b.y && player.y + player.h < b.y + player.vy + 10) {   // üstüne bastı
            player.y = b.y - player.h; player.vy = 0; player.grounded = true;
        }
    }
    if (head) {
        player.y = head.y + BRICK; player.vy = 2; player.jumping = false;
        if (head.hidden) revealSecret(head); else hitBrick(head, 1);
    }
}
// Balyoz: menzildeki tuğlalardan yalnızca en yakını 1 can kaybeder
function hammerBricks(minX, maxX) {
    const cx = player.x + player.w / 2, cy = player.y + player.h * 0.3;
    const near = bricks.filter(b => !b.secret && b.x < maxX && b.x + BRICK > minX && b.y < player.y + player.h && b.y + BRICK > player.y - 140)
        .sort((a, b) => Math.hypot(a.x + BRICK / 2 - cx, a.y + BRICK / 2 - cy) - Math.hypot(b.x + BRICK / 2 - cx, b.y + BRICK / 2 - cy));
    if (near.length) hitBrick(near[0], 1);
}
// Rüşvet zarfı tuğlaya çarparsa: true
function bribeHitsBrick(p) {
    const b = bricks.find(b => !b.hidden && p.x > b.x && p.x < b.x + BRICK && p.y > b.y && p.y < b.y + BRICK);
    if (!b) return false;
    p.active = false; hitBrick(b, 1);
    return true;
}

function updateBricks() {
    bricks.forEach(b => { if (b.shake > 0) b.shake--; if (b.cd > 0) b.cd--; });
    debris.forEach(d => { d.x += d.vx; d.vy += 0.5; d.y += d.vy; d.life--; });
    debris = debris.filter(d => d.life > 0);
    items.forEach(it => { if (it.rise > 0) { it.rise--; it.y += (it.targetY - it.y) * 0.2; } });
    // Kul hakkı önce havaya fırlar, sonra Recep'in sırtındaki çuvala uçar
    flyers.forEach(f => {
        f.t++;
        const tx = player.x + player.w / 2 - player.dir * 30, ty = player.y + 70;
        if (f.t < 18) { f.vy += 0.6; f.x += f.vx; f.y += f.vy; return; }
        const k = Math.min(0.35, 0.08 + f.t * 0.006);
        f.x += (tx - f.x) * k; f.y += (ty - f.y) * k;
        if (Math.hypot(tx - f.x, ty - f.y) < 26) {
            f.done = true;
            sackFill++;
            $('score').innerText = addScore(5000);
            $('sfx-pickup').currentTime = 0; $('sfx-pickup').play().catch(() => {});
            player.mouthOpen = 1.0;
            createParticle(tx, player.y - 10, pickupText(), "#22c55e", 0.8);
        }
    });
    flyers = flyers.filter(f => !f.done);
}

// --- ÇİZİM ---
function drawBricks(ctx) {
    const time = performance.now() / 1000;
    bricks.forEach(b => {
        if (b.x + BRICK < camX - 20 || b.x > camX + width + 20) return;
        const sx = b.shake > 0 ? (Math.random() - 0.5) * 5 : 0, sy = b.shake > 0 ? -b.shake * 0.6 : 0;
        const x = b.x + sx, y = b.y + sy, P = BRICK / 4;   // 4x4 "piksel" ızgara
        if (b.secret) { drawSecretBlock(ctx, b, x, y, time); return; }
        ctx.fillStyle = "#d6d3d1"; ctx.fillRect(x, y, BRICK, BRICK);   // harç
        for (let row = 0; row < 4; row++) {
            const off = row % 2 ? P : 0;
            for (let c = -1; c < 2; c++) {
                const bx = x + off + c * 2 * P + 2, bw = 2 * P - 4;
                const l = Math.max(x + 2, bx), rr = Math.min(x + BRICK - 2, bx + bw);
                if (rr <= l) continue;
                const shade = hash(b.seed + row * 3 + c) ;
                ctx.fillStyle = shade > 0.66 ? "#b45309" : shade > 0.33 ? "#9a3412" : "#7c2d12";
                ctx.fillRect(l, y + row * P + 2, rr - l, P - 4);
                ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(l, y + row * P + 2, rr - l, 3);
            }
        }
        ctx.strokeStyle = "rgba(0,0,0,0.45)"; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, BRICK - 2, BRICK - 2);
        // çatlaklar: vuruldukça artar
        const dmg = BRICK_HP - b.hp;
        if (dmg > 0) {
            ctx.strokeStyle = "#111"; ctx.lineWidth = 3; ctx.lineCap = "square";
            const lines = [[[30, 0], [26, 14], [34, 24], [28, 36]], [[0, 40], [14, 36], [22, 44]], [[60, 18], [46, 26], [50, 40], [40, 52]], [[10, 8], [20, 20]], [[36, 60], [42, 48], [56, 54]]];
            lines.slice(0, dmg === 1 ? 2 : 5).forEach(ln => {
                ctx.beginPath(); ln.forEach(([px, py], i) => i ? ctx.lineTo(x + px, y + py) : ctx.moveTo(x + px, y + py)); ctx.stroke();
            });
        }
        // ara sıra parıltı: içinde bir şey var
        if ((time * 0.7 + b.seed) % 3 < 0.25) {
            ctx.fillStyle = "#fef9c3"; const k = ((time * 0.7 + b.seed) % 3) / 0.25;
            ctx.fillRect(x + 8 + k * 40, y + 8, 4, 4); ctx.fillRect(x + 6 + k * 40, y + 10, 8, 1); ctx.fillRect(x + 10 + k * 40, y + 6, 1, 8);
        }
    });
}
function drawSecretBlock(ctx, b, x, y, time) {
    if (b.hidden) {   // görünmez: birkaç saniyede bir silik parıltı
        const k = (time * 0.5 + b.seed) % 4;
        if (k < 0.5) {
            ctx.strokeStyle = `rgba(253,224,71,${0.35 * Math.sin(k / 0.5 * Math.PI)})`; ctx.lineWidth = 2;
            ctx.strokeRect(x + 4, y + 4, BRICK - 8, BRICK - 8);
        }
        return;
    }
    ctx.fillStyle = "#a16207"; ctx.fillRect(x, y, BRICK, BRICK);
    ctx.fillStyle = "#ca8a04"; ctx.fillRect(x + 4, y + 4, BRICK - 8, BRICK - 8);
    ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(x + 4, y + 4, BRICK - 8, 6);
    ctx.fillStyle = "#713f12"; [[8, 8], [BRICK - 12, 8], [8, BRICK - 12], [BRICK - 12, BRICK - 12]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 4, 4));
    ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, BRICK - 2, BRICK - 2);
}
function drawBrickFx(ctx) {
    debris.forEach(d => {
        ctx.globalAlpha = Math.min(1, d.life / 15);
        ctx.fillStyle = d.color; ctx.fillRect(d.x - d.size / 2, d.y - d.size / 2, d.size, d.size);
    });
    ctx.globalAlpha = 1;
    flyers.forEach(f => {
        if (curLevel().item === 'tape') drawCassette(ctx, f.x, f.y);
        else drawKulHakkiBag(ctx, f.x, f.y, 44, Math.sin(f.t * 0.3) * 0.3);
    });
}

// Recep'in sırtındaki çuval (drawRecep içinden; gövdenin arkasında). fill: bölümde toplanan kul hakkı
function drawSack(ctx, shY, hipY, fill, dir) {
    const f = Math.min(1, fill / 12), rx = 18 + f * 10, ry = 24 + f * 12;
    const cx = -34 - f * 8, cy = shY + 12 - f * 6;   // omzun arkasında, kalkanın üstünde kalsın
    ctx.save();
    ctx.fillStyle = "#c8a165"; ctx.strokeStyle = "#7c5a2b"; ctx.lineWidth = 2;
    // boğumlu ağız, omzun üstünden öne bağlı
    ctx.beginPath(); ctx.moveTo(cx - 7, cy - ry + 6); ctx.quadraticCurveTo(cx - 2, cy - ry - 16, cx + 12, cy - ry - 10); ctx.lineTo(cx + 8, cy - ry + 8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, -0.12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // yamalar ve dikişler
    ctx.fillStyle = "#a47c45"; ctx.fillRect(cx - rx * 0.6, cy + ry * 0.2, 12, 10);
    ctx.strokeStyle = "#7c5a2b"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx + rx * 0.3, cy - ry * 0.6); ctx.lineTo(cx + rx * 0.5, cy - ry * 0.2); ctx.stroke();
    // ip
    ctx.strokeStyle = "#7c2d12"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 8, cy - ry + 4); ctx.lineTo(cx + 9, cy - ry - 1); ctx.stroke();
    // yazı (aynalanmaz) ve ağzından taşan para
    ctx.save(); ctx.translate(cx, cy + 2); if (dir === -1) ctx.scale(-1, 1);
    ctx.fillStyle = "#4a2c00"; ctx.font = "bold 8px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(t("bag")[0], 0, -5, rx * 1.6); ctx.fillText(t("bag")[1], 0, 5, rx * 1.6);
    ctx.restore();
    if (f > 0.15) { ctx.fillStyle = "#22c55e"; ctx.fillRect(cx - 4, cy - ry - 4, 10, 6); ctx.fillStyle = "#15803d"; ctx.fillRect(cx + 2, cy - ry - 8, 8, 5); }
    ctx.restore();
}
// Çuvalın askısı: göğüsten çapraz geçen ip (gövdeden sonra çizilir)
function drawSackStrap(ctx, shY, hipY) {
    ctx.strokeStyle = "#7c5a2b"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-16, shY + 2); ctx.lineTo(18, hipY - 6); ctx.stroke();
}
