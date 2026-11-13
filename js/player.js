// Recep: hareket, balyoz, kalkan, can sistemi, çizim ve bacak animasyonu
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

function jump() {
    if(player.isDying || paused || userPaused || levelCompleted) return;
    if(isFlight()) { player.vy -= 9; return; }   // uçakta: yukarı fırla
    if(player.grounded || player.coyote > 0) doJump();   // kenardan düştükten hemen sonra da zıplanır
    else if(!tryDoubleJump()) player.jumpBuffer = JUMP_BUFFER;   // yere inmeden az önce basıldıysa inince zıplar
}
// Zıplama hissi: kenar toleransı ve erken basma tamponu (kare cinsinden)
const COYOTE_FRAMES = 7, JUMP_BUFFER = 8, JUMP_CUT_VY = -9;
let jumpHeld = false;
function doJump() {
    player.vy = player.jumpPower; player.grounded = false;
    player.coyote = 0; player.jumpBuffer = 0; player.jumping = true;
    player.squash = -0.12;   // kalkışta incelip uzar
}
// Zıplama tuşu erken bırakılırsa alçak zıplar (basılı tutunca tam yükseklik)
function releaseJump() {
    jumpHeld = false;
    if(isFlight() || !player.jumping) return;
    if(player.vy < JUMP_CUT_VY) player.vy = JUMP_CUT_VY;
    player.jumping = false;
}
// Yere iniş: hızına göre toz, gövde ezilir, çok sert inişte hafif sarsıntı
function onLand(v) {
    const k = Math.min(1, (v - 6) / 18), fx = player.x + player.w / 2, fy = player.y + player.h;
    player.squash = Math.max(player.squash || 0, 0.08 + 0.14 * k);
    for (let i = 0, n = 3 + Math.round(5 * k); i < n; i++) {
        const d = i % 2 ? 1 : -1;
        particles.push({ x: fx + d * 20, y: fy - 4, vx: d * (1 + Math.random() * 3), vy: -Math.random() * 1.5,
                         life: 0.35, maxLife: 0.35, size: 3 + Math.random() * 4 * (0.5 + k), text: null, color: "rgba(214,211,209,0.85)" });
    }
    if (v > 20) camShake = Math.max(camShake, 3);
}
// Her karede, platform çarpışmasından sonra çağrılır
function updateJumpAssist() {
    if(player.grounded) {
        player.coyote = COYOTE_FRAMES; player.jumping = false;
        if(player.jumpBuffer > 0) { doJump(); if(!jumpHeld) releaseJump(); }
    } else if(player.coyote > 0) player.coyote--;
    if(player.jumpBuffer > 0) player.jumpBuffer--;
}

function shoot() {
    if(!gameStarted || player.isDying || paused || userPaused || levelCompleted || player.shield) return;
    if(isFlight()) { playerProjectiles.push({ x: player.x + player.w, y: player.y + player.h * 0.6, vx: 16, vy: 0, angle: 0, life: 120, active: true }); return; }
    playerProjectiles.push({
        x: player.x + (player.dir === 1 ? player.w : 0),
        y: player.y + player.h / 2,
        vx: player.dir * 14,
        vy: -5, angle: 0, life: 150, active: true
    });
}

// --- BALYOZ ---
const SWING_FRAMES = 24, HAMMER_REACH = 190;
function hammer() {
    if(!gameStarted || player.isDying || paused || userPaused || levelCompleted || player.swing > 0 || player.shield || isFlight()) return;
    player.swing = SWING_FRAMES;
    player.swingHit = false;
}

// Animasyon ilerlemesine (0→1) göre balyozun açısı: geri kaldır → öne indir → toparlan
const HAMMER_IDLE = 0.45, HAMMER_BACK = -1.4, HAMMER_DOWN = 1.9;
function hammerAngle() {
    if(player.swing <= 0) return HAMMER_IDLE;
    const p = 1 - player.swing / SWING_FRAMES;
    const ease = v => v * v * (3 - 2 * v);
    if(p < 0.3) return HAMMER_IDLE + (HAMMER_BACK - HAMMER_IDLE) * ease(p / 0.3);
    if(p < 0.5) return HAMMER_BACK + (HAMMER_DOWN - HAMMER_BACK) * ease((p - 0.3) / 0.2);
    if(p < 0.75) return HAMMER_DOWN;
    return HAMMER_DOWN + (HAMMER_IDLE - HAMMER_DOWN) * ease((p - 0.75) / 0.25);
}

function updateHammer() {
    if(player.swing <= 0) return;
    player.swing--;
    // Balyoz yere indiği anda (ilerleme %50) önündeki polisi ez
    if(!player.swingHit && 1 - player.swing / SWING_FRAMES >= 0.5) {
        player.swingHit = true;
        const cx = player.x + player.w / 2;
        const reach = hammerReach();   // dev balyozla 1,6 kat
        const minX = Math.min(cx, cx + player.dir * reach), maxX = Math.max(cx, cx + player.dir * reach);
        const headX = cx + player.dir * (reach - 40), headY = player.y + player.h - 10;
        for(let i = 0; i < 8; i++) createParticle(headX, headY);   // toz
        camShake = Math.max(camShake, 5);
        if(stampMode()) createParticle(headX, headY - 50, "KHK", "#dc2626", 0.7);
        enemies.forEach(en => {
            if(!en.dead && en.x < maxX && en.x + en.w > minX && en.y < player.y + player.h + 20 && en.y + en.h > player.y - 60) {
                killEnemy(en);
            }
        });
        hammerBricks(minX, maxX);
        if(boss && boss.x + 30 < maxX && boss.x + boss.w - 30 > minX) {
            if(bossShielded(boss)) bossArmor(headX, headY - 60); else damageBoss(power.hammer > 0 ? 3 : 2);
        }
    }
}

// --- CAN SİSTEMİ ---
// Vurulunca bir can gider, Recep kısa süre yanıp söner ve dokunulmaz olur; canlar bitince ölür.
function updateHearts() {
    $('hearts').textContent = '❤️'.repeat(Math.max(0, player.hp)) + '🖤'.repeat(Math.max(0, player.maxHp - player.hp));
}
function die() {
    if(player.isDying || levelCompleted || levelEnding || player.invuln > 0 || power.star > 0) return;   // dokunulmazken hasar yok
    if(power.mask > 0) {   // baret + gaz maskesi vuruşu karşılar
        power.mask--; player.invuln = 60;
        createParticle(player.x + player.w / 2, player.y, t("maskSaved"), "#facc15", 1.0);
        playSfx('hit', { rate: 2, vol: 0.5 });
        return;
    }
    player.hp--; levelStats.lost++;
    updateHearts();
    if(player.hp <= 0) { killPlayer(); return; }
    player.invuln = 90;
    player.vy = -9;                                   // hafifçe havaya ve geriye savrulur
    player.vx = -player.dir * 9;
    player.knock = 12;
    hitStop = 4;
    playSfx('hit', { rate: 1.1, vol: 0.8 });
    createParticle(player.x + player.w / 2, player.y, "-1 ❤️", "#ef4444", 1.0);
    domShake();
    if(!playSfx('voice_ouch')) speak(t("ouch"), "Kore");
}

// Çukura düşünce: son sağlam zemine geri konur, bir can gider (son canla düşerse ölür)
function fallIntoPit() {
    if(player.isDying || levelCompleted || levelEnding) return;
    const free = power.star > 0;
    if(!free && player.hp <= 1) { killPlayer(); return; }
    if(!free) { player.hp--; levelStats.lost++; updateHearts(); }
    const sp = player.safePlat;
    if(sp && platforms.includes(sp)) {
        player.x = Math.max(sp.x + 10, Math.min(sp.x + player.safeOff, sp.x + sp.w - player.w - 10));
        player.y = sp.y - player.h;
    } else { player.x = Math.max(0, player.x - 400); player.y = 0; }
    player.vx = 0; player.vy = 0; player.knock = 0; player.invuln = 120;
    player.coyote = 0; player.jumpBuffer = 0; player.jumping = false;
    if(!free) {
        createParticle(player.x + player.w / 2, player.y, "-1 ❤️", "#ef4444", 1.0);
        playSfx('hit', { rate: 1.1, vol: 0.8 });
        domShake();
    }
}

async function killPlayer() {
    // Bölüm bitmek üzereyken artık ölünmez
    if(player.isDying || levelCompleted || levelEnding) return;
    levelStats.lost += player.hp; levelStats.deaths++;   // karne
    player.hp = 0; updateHearts();
    saveBest();
    player.isDying = true;
    domShake();
    $('sfx-explosion').currentTime = 0; $('sfx-explosion').play().catch(()=>{});

    // Vurulunca GEBER yazısı çıkar
    createParticle(player.x + player.w/2, player.y + player.h/2, t("die"), "red", 2.0);

    if(!playSfx('voice_ouch')) speak(t("ouch"), "Kore");
    // Sayfayı yenilemek yerine bulunulan bölümü baştan başlat
    setTimeout(restartLevel, 2500);
}

// --- BACAK ANİMASYONU (Recep ve polisler) ---
// Her bacak iki parçalı: kalça → diz → ayak bileği, ucunda ayakkabı.
// photoH: kafa resminin asıl yüksekliği (oran korunur); ratio: bacak boyu / kutu yüksekliği
const PLAYER_LEGS = {
    photoH: 1,
    ratio: 0.36, width: 13, swing: 0.65,          // bacak boyu, kalınlık, adım açısı
    front: "#475569", back: "#334155",            // füme takım pantolon (arka bacak daha koyu)
    shoe: "#111111"
};

// --- RECEP: fotoğraftan kafa + takım elbiseli gövde, kollar, bacaklar ---
// Koordinat: ayakların ortası (0,0), sağa bakar. Ön elde balyoz, arka elde "DİN" yazılı kalkan.
const RECEP_K = 0.45;                         // kafa fotoğrafının ölçeği
const RECEP_CHIN = 164 - RECEP_HEAD.y;        // fotoğrafta çenenin alt ucu (kafa kutusuna göre)

// Kalkan: altın kenarlı yeşil kalkan, üstünde DİN yazısı. dir: karakter aynalandıysa yazı ters dönmesin
function drawShield(ctx, x, y, s, dir = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * dir, s);
    ctx.beginPath();
    ctx.moveTo(-23, -29); ctx.lineTo(23, -29); ctx.lineTo(23, 4);
    ctx.quadraticCurveTo(22, 22, 0, 31); ctx.quadraticCurveTo(-22, 22, -23, 4);
    ctx.closePath();
    const g = ctx.createLinearGradient(-23, -29, 23, 31);
    g.addColorStop(0, "#166534"); g.addColorStop(1, "#052e16");
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = "rgba(253,230,138,0.6)"; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-18, -24); ctx.lineTo(18, -24); ctx.lineTo(18, 3);
    ctx.quadraticCurveTo(17, 18, 0, 25); ctx.quadraticCurveTo(-17, 18, -18, 3);
    ctx.closePath(); ctx.stroke();
    ctx.font = "bold 17px Georgia, serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 3; ctx.strokeStyle = "#052e16"; ctx.strokeText("DİN", 0, 1);
    ctx.fillStyle = "#fde68a"; ctx.fillText("DİN", 0, 1);
    ctx.restore();
}

// o: { h, phase, moving, airborne, mouthOpen, hammerAngle, shield, dir }
function drawRecep(ctx, o) {
    const h = o.h, st = PLAYER_LEGS;
    const SUIT = "#334155", SUIT_D = "#1e293b", SKIN = "#e8b48f";
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const legs = drawLegs(ctx, 0, -h, h, 1, o.phase, o.moving, o.airborne, st);
    const top = -h + legs.drop;
    const hipY = top + h - h * st.ratio - st.width * 0.6;
    const shY = hipY - 50;

    drawSack(ctx, shY, hipY, o.sack || 0, o.dir);   // sırttaki kul hakkı çuvalı

    // Arka kol: kalkan yanda asılı (kalkan kalkıkken en son, önde çizilir)
    const bsx = -10, bsy = shY + 8;
    if (!o.shield) {
        const sw = o.moving ? Math.sin(o.phase) * 5 : 0;
        const hx = bsx - 6 + sw, hy = bsy + 34;
        ctx.strokeStyle = SUIT_D; ctx.lineWidth = 11;
        ctx.beginPath(); ctx.moveTo(bsx, bsy); ctx.lineTo(bsx - 4 + sw / 2, bsy + 17); ctx.lineTo(hx, hy); ctx.stroke();
        drawShield(ctx, hx - 6, hy - 2, 0.9, o.dir);
        ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(hx, hy - 10, 5.5, 0, Math.PI * 2); ctx.fill();
    }

    // Gövde: ceket, gömlek, kravat, düğmeler
    ctx.fillStyle = SUIT;
    ctx.beginPath();
    ctx.moveTo(-22, shY + 3); ctx.quadraticCurveTo(0, shY - 6, 24, shY + 3);
    ctx.lineTo(19, hipY + 4); ctx.lineTo(-17, hipY + 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath(); ctx.moveTo(-1, shY); ctx.lineTo(16, shY); ctx.lineTo(8, shY + 22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#1e3a8a";
    ctx.beginPath(); ctx.moveTo(6, shY + 2); ctx.lineTo(10, shY + 2); ctx.lineTo(11, shY + 28); ctx.lineTo(8, shY + 33); ctx.lineTo(5, shY + 28); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = SUIT_D; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-1, shY); ctx.lineTo(8, shY + 24); ctx.lineTo(16, shY); ctx.stroke();
    ctx.fillStyle = "#0f172a";
    [36, 44].forEach(dy => { ctx.beginPath(); ctx.arc(9, shY + dy, 1.8, 0, Math.PI * 2); ctx.fill(); });
    drawSackStrap(ctx, shY, hipY);

    // Kafa (fotoğraf): çene, yakanın hemen üstüne oturur
    const H = RECEP_HEAD, k = RECEP_K;
    ctx.save();
    ctx.translate(6 - (H.neckX - H.x) * k, shY + 8 - RECEP_CHIN * k);
    ctx.scale(k, k);
    if (headCanvas) ctx.drawImage(headCanvas, 0, 0);
    if (o.mouthOpen > 0.1) {
        const mx = H.mouthX - H.x, my = H.mouthY - H.y, m = o.mouthOpen;
        ctx.fillStyle = "black";
        ctx.beginPath(); ctx.ellipse(mx, my, 15 * m, 19 * m, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "white"; ctx.fillRect(mx - 5, my - 15 * m, 10, 5 * m);
    }
    ctx.restore();

    // Ön kol + balyoz: kol, balyozun açısına göre kalkar/iner
    const ang = o.hammerAngle;
    const armA = ang <= HAMMER_IDLE
        ? 0.5 + (HAMMER_IDLE - ang) / (HAMMER_IDLE - HAMMER_BACK) * 2.9    // geri kaldırırken kol yukarı
        : 0.5 + (ang - HAMMER_IDLE) / (HAMMER_DOWN - HAMMER_IDLE) * 0.8;   // indirirken kol öne
    const sx = 8, sy = shY + 7;
    const ex = sx + Math.sin(armA + 0.3) * 18, ey = sy + Math.cos(armA + 0.3) * 18;
    const hx = ex + Math.sin(armA - 0.3) * 18, hy = ey + Math.cos(armA - 0.3) * 18;
    ctx.strokeStyle = SUIT; ctx.lineWidth = 11;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
    drawHammer(ctx, hx, hy, ang, o.bigHammer ? 1.5 : 1, o.dir);

    // Kalkan siper: arka kol öne-yukarı uzanır; büyük kalkan yukarı eğik durur, yüzü, gövdeyi ve tepeyi kapatır
    if (o.shield) {
        ctx.strokeStyle = SUIT_D; ctx.lineWidth = 11;
        ctx.beginPath(); ctx.moveTo(bsx, bsy); ctx.lineTo(18, bsy - 2); ctx.lineTo(42, shY - 18); ctx.stroke();
        ctx.save();
        ctx.translate(60, shY - 36);
        ctx.rotate(-SHIELD_TILT);   // üst kenar geriye yatar: kalkan öne ve yukarıya bakar
        drawShield(ctx, 0, 0, 2.0, o.dir);
        ctx.restore();
    }
}

// --- KALKAN İLE KORUNMA ---
// Kalkan kalkıkken oyuncunun baktığı yönden gelen mermi, alev ve dolarlar durur.
// Kalkan yukarı eğik tutulduğu için tepeden düşen saldırılar (gaz kutusu, nişancı mermisi, alev, dolar) da durur.
const SHIELD_TILT = 0.55;
function shieldBlocks(p) {
    if (!player.shield || player.isDying) return false;
    if ((p.vy || 0) > 0.5 && p.y < player.y + player.h * 0.5) return true;   // yukarıdan geliyor
    // Hızlı gidenlerde (mermi) yönüne, yavaş düşenlerde (dolar, alev) konumuna bakılır
    if (Math.abs(p.vx || 0) > 2) return p.vx * player.dir < 0;
    return (p.x - (player.x + player.w / 2)) * player.dir > -5;
}
function blockProjectile(p) {
    p.active = false;
    for (let i = 0; i < 6; i++) {
        particles.push({ x: p.x, y: p.y, vx: -player.dir * (2 + Math.random() * 4), vy: (Math.random() - 0.5) * 6,
                         life: 0.35, maxLife: 0.35, size: 3 + Math.random() * 3, text: null, color: "#fde047" });
    }
    playSfx('hit', { rate: 1.8, vol: 0.45 });
}

// Faza göre bir bacağın açıları: a = uyluk açısı (0 = dik, + = ileri), bend = diz bükümü
function legPose(phase, moving, airborne, swing) {
    if (airborne) return [{ a: 0.75, bend: 1.4 }, { a: -0.3, bend: 0.6 }];  // havada: bacaklar kırık
    if (!moving)  return [{ a: 0.08, bend: 0.06 }, { a: -0.08, bend: 0.06 }]; // ayakta duruş
    return [0, Math.PI].map(off => {
        const p = phase + off;
        // Öne doğru savrulurken (cos > 0) diz bükülür ve ayak yerden kalkar
        return { a: swing * Math.sin(p), bend: 0.12 + 1.1 * Math.max(0, Math.cos(p)) };
    });
}

function legJoints(hipX, hipY, len, leg) {
    const half = len / 2;
    const kx = hipX + Math.sin(leg.a) * half, ky = hipY + Math.cos(leg.a) * half;
    const s = leg.a - leg.bend;  // baldır uyluktan geriye kırılır (diz öne bakar)
    return { kx, ky, fx: kx + Math.sin(s) * half, fy: ky + Math.cos(s) * half, toe: Math.max(-0.5, Math.min(0.4, -s * 0.5)) };
}

function drawLeg(ctx, hipX, hipY, j, width, color, shoe) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(j.kx, j.ky);
    ctx.lineTo(j.fx, j.fy);
    ctx.stroke();
    // Ayakkabı: öne uzanan yuvarlak burun, kalkan ayakta hafif eğik
    ctx.save();
    ctx.translate(j.fx, j.fy);
    ctx.rotate(j.toe);
    ctx.fillStyle = shoe;
    ctx.beginPath();
    ctx.ellipse(width * 0.45, width * 0.2, width * 1.0, width * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// Kutunun (top-center = cx, topY; yükseklik h) alt kısmına bacakları çizer.
// Dönüş: { k: fotoğrafın asıl boyutuna göre ölçeği, drop: gövdenin adımlarla inip kalkma miktarı }
function drawLegs(ctx, cx, topY, h, dir, phase, moving, airborne, style) {
    const legSpace = h * style.ratio;
    const k = (h - legSpace) / style.photoH;        // fotoğraf kalan alana orantılı sığar
    const hipY = h - legSpace - style.width * 0.6;  // kalça çenenin hemen arkasında
    const len = h - style.width * 0.7 - hipY;       // ayakkabı tabanı tam zemine değsin
    const pose = legPose(phase, moving, airborne, style.swing);
    const hips = [3, -3];
    const joints = pose.map((leg, i) => legJoints(hips[i], hipY, len, leg));

    // Yerdeyken en alttaki ayak zemine bassın: gövde buna göre iner (doğal sallanma)
    const drop = airborne ? 0 : (hipY + len) - Math.max(joints[0].fy, joints[1].fy);

    ctx.save();
    ctx.translate(cx, topY + drop);
    ctx.scale(dir, 1);
    drawLeg(ctx, hips[1], hipY, joints[1], style.width, style.back, style.shoe);   // arka bacak önce
    drawLeg(ctx, hips[0], hipY, joints[0], style.width, style.front, style.shoe);
    ctx.restore();
    return { k, drop };
}

// Balyoz, oyuncunun merkezine göre piksel koordinatında (hx, hy) eldeki noktadan çizilir
function drawHammer(ctx, hx, hy, angle, size = 1, dir = 1) {
    if (stampMode()) { drawStamp(ctx, hx, hy, angle, size); return; }
    const L = 130;
    ctx.save();
    ctx.translate(hx, hy);            // el
    ctx.scale(0.94 * size, 0.94 * size);
    ctx.rotate(angle);
    // Sap
    ctx.fillStyle = "#8b5a2b";
    ctx.strokeStyle = "#5c3a1a";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(-5, -L, 10, L + 12, 4); ctx.fill(); ctx.stroke();
    // Demir baş
    const g = ctx.createLinearGradient(0, -L - 18, 0, -L + 18);
    g.addColorStop(0, "#9ca3af"); g.addColorStop(0.5, "#4b5563"); g.addColorStop(1, "#1f2937");
    ctx.fillStyle = g;
    ctx.strokeStyle = "#111827";
    ctx.beginPath(); ctx.roundRect(-24, -L - 16, 48, 32, 5); ctx.fill(); ctx.stroke();
    // Baştaki yazı: Recep sola bakarken de düz okunsun
    ctx.save(); ctx.translate(0, -L); if (dir === -1) ctx.scale(-1, 1);
    ctx.font = "bold 13px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 3; ctx.strokeStyle = "#111827"; ctx.strokeText("YARGI", 0, 1, 44);
    ctx.fillStyle = "#fde68a"; ctx.fillText("YARGI", 0, 1, 44);
    ctx.restore();
    // Sapı tutan yumruk
    ctx.fillStyle = "#e8b48f";
    ctx.strokeStyle = "#7c4a2d";
    ctx.beginPath(); ctx.arc(0, -4, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
}
