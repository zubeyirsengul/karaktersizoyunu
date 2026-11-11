// 1. bölüm canavarı ALEVİ: alevden adam, etrafa alev saçar
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

BOSS_TYPES.alevi = { greet: 'greet_alevi', say: "YA ALİ!", w: 156, h: 204, dw: 260, dh: 340, scale: 0.6, hp: 12, arena: 700, nameKey: "bossName", stomp: 66, labelY: 45, update: updateAlevi, draw: drawAlevi };

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
