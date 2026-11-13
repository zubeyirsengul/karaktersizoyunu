// 4. ve 8. bölüm canavarı FETÖ: bastonlu yaşlı adam, 1 dolar savurur, bastonla şok dalgası
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// 4. bölüm (15 Temmuz): karşılaşınca HIRHIZ "Hocam gel, bu hasret bitsin!" der (sfx/hasret.mp3), FETÖ öfkelenince "Ya Allah!"
BOSS_TYPES.feto = { greet: 'hasret', playerSay: "hasretSay", rageSfx: 'greet_feto2', w: 126, h: 203, dw: 180, dh: 290, scale: 0.7, hp: 20, arena: 900, nameKey: "fetoName", stomp: 55, labelY: 45, update: updateFeto, draw: drawFeto };
// FETÖ'nün son hâli (8. bölüm): aynı saldırılar, daha çok can
BOSS_TYPES.feto2 = { ...BOSS_TYPES.feto, hp: 28, nameKey: "feto2Name", greet: 'greet_feto2', say: "YA ALLAH!", playerSay: null, rageSfx: 'greet_feto2' };

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

// FETÖ'nün savurduğu 1 dolar: kırmızı parıltılı (tehlikeli olduğu belli olsun)
function drawOneDollar(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    drawGlow(ctx, "#ef4444", 30);
    ctx.fillStyle = "#4d7c0f"; ctx.fillRect(-22, -11, 44, 22);
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
