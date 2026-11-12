// 8. bölüm canavarı FETÖ: SON. Arena sınırı yok: HIRHIZ'ı her yere kovalar, raflara zıplar, raftan iner,
// 1 dolar savurur (yerdeyken her üçüncü saldırıda bastonla şok dalgası). Yenilince devrilir, mezara girer, üstüne mezar taşı diker.
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

BOSS_TYPES.feto2 = { ...BOSS_TYPES.feto2, arena: 1e6, update: updateFetoSon };

const FETO_G = 0.9, FETO_JUMP = -24, FETO_SPEED = 2.4;
function updateFetoSon(b) {
    const gy = height - 60, cx = b.x + b.w / 2, pcx = player.x + player.w / 2, dist = pcx - cx;
    const pBottom = player.y + player.h;
    b.look = Math.sign(dist) || b.look;
    if (b.recover > 0) b.recover--;
    if (b.jumpCd > 0) b.jumpCd--;
    if (b.drop > 0) b.drop--;

    // Yerçekimi: zemine (çukurlar yok sayılır) ya da üstüne düştüğü rafa iner; b.drop sürerken raflardan geçip aşağı iner
    const prevBottom = b.y + b.h;
    b.vy = Math.min((b.vy || 0) + FETO_G, 22);
    b.y += b.vy;
    b.grounded = false;
    if (b.vy >= 0) {
        if (!(b.drop > 0)) for (const p of platforms) {
            if (p.y >= gy - 1 || b.x + b.w - 35 < p.x || b.x + 35 > p.x + p.w) continue;   // ayakları rafa basıyor mu
            if (prevBottom <= p.y + 1 && b.y + b.h >= p.y) { b.y = p.y - b.h; b.vy = 0; b.grounded = true; break; }
        }
        if (b.y + b.h >= gy) { b.y = gy - b.h; b.vy = 0; b.grounded = true; }
    }
    const onLedge = b.grounded && b.y + b.h < gy - 1;

    if (b.state === 'walk') {
        // Kovalar: yakına kadar yürür (havadayken de oyuncuya doğru süzülür)
        const above = pBottom < b.y + b.h - 70;   // oyuncu yukarıdaysa altına kadar gelir (rafa zıplayabilsin)
        if (Math.abs(dist) > (above ? 15 : 120) && b.recover <= 0) { b.x += Math.sign(dist) * FETO_SPEED * (b.grounded ? 1 : 1.3); b.run += 0.1; }
        if (b.grounded && !player.isDying) {
            if (above && Math.abs(dist) < 220 && !(b.jumpCd > 0)) {   // oyuncu yukarıda: zıpla
                b.vy = FETO_JUMP; b.grounded = false; b.jumpCd = 50;
                createParticle(cx, b.y - 30, "HOP!", "#fde047", 0.7);
            } else if (onLedge && pBottom > b.y + b.h + 60) {                            // oyuncu aşağıda: raftan in
                b.drop = 14; b.vy = 2;
            }
        }
        if (!player.isDying && Math.abs(dist) < 1400 && ++b.timer > 85) {
            b.timer = 0; b.attacks++;
            b.next = b.attacks % 3 === 0 && b.grounded && !onLedge ? 'slam' : 'volley';
            b.state = 'crouch'; b.stateT = b.next === 'slam' ? 34 : 30;
            createParticle(cx, b.y - 50, b.next === 'slam' ? "HOOOP!" : "AL!", "#fde047", 1.0);
        }
    } else if (b.state === 'crouch' && --b.stateT <= 0) {
        if (b.next === 'volley') dollarVolley(b);
        else {
            const sx = cx + b.look * 70 * b.T.scale;
            [-1, 1].forEach(d => projectiles.push({ type: 'wave', x: sx + d * 30, y: gy, vx: d * 8, active: true, life: 85, angle: 0 }));
            for (let i = 0; i < 10; i++) createParticle(sx + (Math.random() - 0.5) * 80, gy - 10);
            playSfx('hit', { rate: 0.5, vol: 0.8 });
            b.recover = 18;
        }
        b.state = 'walk';
    }
    b.x = Math.max(0, Math.min(b.x, WORLD_WIDTH - b.w));
    b.crouch += ((b.state === 'crouch' ? 1 : 0) - b.crouch) * 0.25;
}

// --- BÖLÜM SONU: FETÖ ölür ve mezara girer ---
// Devrilir → altında mezar açılır → içine iner → toprak örtülür → mezar taşı yükselir, üstte "FETÖ öldü ve mezara girdi!" yazar.
const GRAVE = { fall: 30, open: 80, sink: 140, fill: 190, stone: 250, end: 380 };
function graveUpdate(o) {
    if (!o.fb) {
        if (!boss) { outro = null; completeLevel(); return; }
        o.fb = { ...boss, dying: false, hurt: 0, state: 'walk', talk: 0, rage: false, recover: 0, crouch: 0, stateT: 0 };
        o.fdir = Math.sign(boss.x + boss.w / 2 - (player.x + player.w / 2)) || 1;   // oyuncudan uzağa devrilir
        o.wx = Math.max(camX + 300, Math.min(boss.x + boss.w / 2, camX + width - 300));   // mezar ekranda kalsın
        if (o.wx + o.fdir * 260 > camX + width || o.wx + o.fdir * 260 < camX) o.fdir = -o.fdir;
        boss = null;
        projectiles = projectiles.filter(p => p.type === 'bullet');
    }
    if (o.t === GRAVE.fall) { camShake = Math.max(camShake, 8); playSfx('hit', { rate: 0.45, vol: 0.9 }); }
    if (o.t === GRAVE.fill) playSfx('hit', { rate: 0.35, vol: 0.8 });
    if (o.t === GRAVE.stone) { camShake = Math.max(camShake, 6); playSfx('hit', { rate: 0.6, vol: 0.8 }); }
    if (o.t >= GRAVE.fill && o.t < GRAVE.stone && o.t % 4 === 0) {   // kürekle atılan toprak
        const hx = o.wx + o.fdir * 100;
        for (let i = 0; i < 3; i++) particles.push({ x: hx + (Math.random() - 0.5) * 160, y: height - 70, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 5,
                                                   life: 0.5, maxLife: 0.5, size: 4 + Math.random() * 4, text: null, color: "#78350f" });
    }
    if (o.t >= GRAVE.end) { outro = null; completeLevel(); }
}
const easeIO = v => Math.max(0, Math.min(1, v)) * Math.max(0, Math.min(1, v)) * (3 - 2 * Math.max(0, Math.min(1, v)));
function graveDraw(ctx, o) {
    if (!o.fb) return;
    const gy = height - 60, fx = o.wx - camX, d = o.fdir, hx = fx + d * 100, HW = 125;   // mezarın ortası ve yarı genişliği
    const tt = o.t;
    const fallK = easeIO(tt / GRAVE.fall), openK = easeIO((tt - GRAVE.fall) / (GRAVE.open - GRAVE.fall));
    const sinkK = easeIO((tt - GRAVE.open) / (GRAVE.sink - GRAVE.open)), fillK = easeIO((tt - GRAVE.sink) / (GRAVE.fill - GRAVE.sink));
    const stoneK = easeIO((tt - GRAVE.fill) / (GRAVE.stone - GRAVE.fill));

    // Kazılan toprak yığını (mezarın arkasında), sonra mezarın içine akar
    const pile = openK * (1 - fillK);
    if (pile > 0) {
        ctx.fillStyle = "#78350f"; ctx.beginPath(); ctx.ellipse(hx + d * (HW + 60), gy, 70 * pile + 10, 45 * pile, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.ellipse(hx + d * (HW + 60) - 10, gy - 40 * pile, 26 * pile, 8 * pile, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Çukur
    if (openK > 0 && fillK < 1) {
        ctx.fillStyle = "#1c1917"; ctx.fillRect(hx - HW * openK, gy, HW * 2 * openK, 26);
        ctx.fillStyle = "#44403c"; ctx.fillRect(hx - HW * openK, gy, HW * 2 * openK, 5);
    }
    // FETÖ'nün cesedi: devrilir, sonra mezara iner (zeminin altında kalan kısmı görünmez)
    if (sinkK < 1) {
        ctx.save();
        ctx.beginPath(); ctx.rect(-50, -50, width + 100, gy + 50);
        if (openK > 0) ctx.rect(hx - HW * openK, gy, HW * 2 * openK, 300);
        ctx.clip();
        ctx.translate(fx, gy + sinkK * 120 - Math.sin(fallK * Math.PI) * 14);
        ctx.rotate(d * fallK * Math.PI / 2);
        ctx.translate(0, -18 * fallK);   // yatınca gövdenin kalınlığı kadar yukarıda dursun
        const fb = o.fb; fb.x = -fb.w / 2; fb.y = -fb.h; fb.look = d; fb.run = 0;
        fb.T.draw(ctx, fb);
        ctx.restore();
    }
    // Toprak örtüsü: tümsek
    if (fillK > 0) {
        ctx.fillStyle = "#78350f"; ctx.beginPath(); ctx.ellipse(hx, gy, HW * 1.05, 30 * fillK, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = "rgba(248,250,252,0.9)"; ctx.beginPath(); ctx.ellipse(hx, gy - 24 * fillK, HW * 0.6, 6 * fillK, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Mezar taşı: tümseğin başında yerden yükselir
    if (stoneK > 0) {
        const sx = hx + d * (HW - 20), sh = 130, sw = 84, top = gy - 22 - sh * stoneK;
        ctx.save();
        ctx.beginPath(); ctx.rect(sx - 60, -50, 120, gy - 10 + 50); ctx.clip();
        ctx.fillStyle = "#9ca3af"; ctx.strokeStyle = "#4b5563"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(sx - sw / 2, top + sh); ctx.lineTo(sx - sw / 2, top + 30); ctx.arc(sx, top + 30, sw / 2, Math.PI, 0); ctx.lineTo(sx + sw / 2, top + sh); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.ellipse(sx, top + 4, sw / 2 - 6, 7, 0, Math.PI, 0); ctx.fill();   // karlı tepe
        ctx.fillStyle = "#1f2937"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = "bold 22px Georgia"; ctx.fillText(t("feto2Name").split(':')[0], sx, top + 48, sw - 12);
        ctx.font = "bold 13px Georgia"; ctx.fillText("1941 - 2024", sx, top + 76);
        ctx.strokeStyle = "#4b5563"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx - 24, top + 92); ctx.lineTo(sx + 24, top + 92); ctx.stroke();
        ctx.restore();
        ctx.textBaseline = "alphabetic";
    }
    // Üstte yazı
    if (tt > GRAVE.fill) {
        const a = Math.min(1, (tt - GRAVE.fill) / 20), txt = t("graveSay");
        ctx.save(); ctx.globalAlpha = a;
        ctx.font = `900 ${Math.max(24, Math.min(44, width / 22))}px Arial`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.lineWidth = 7; ctx.strokeStyle = "#000"; ctx.strokeText(txt, width / 2, height * 0.24, width - 40);
        ctx.fillStyle = "#fde047"; ctx.fillText(txt, width / 2, height * 0.24, width - 40);
        ctx.restore(); ctx.textBaseline = "alphabetic";
    }
}
BOSS_OUTROS[8] = { style: 'custom', update: graveUpdate, draw: graveDraw };
