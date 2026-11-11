// 5. bölüm canavarı DARBE TANKI
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// DARBE TANKI: alev topu mermileri atar, arada hızla üstüne sürer
BOSS_TYPES.darbetank = { say: "YOL KAPALI!", w: 300, h: 150, dw: 300, dh: 150, scale: 1, hp: 18, arena: 900, nameKey: "tankName", stomp: 62, labelY: 60, update: updateBigTank, draw: drawBigTank };

function updateBigTank(b) {
    b.y = bossGround(b);
    const dist = (player.x + player.w / 2) - (b.x + b.w / 2);
    b.look = Math.sign(dist) || b.look;
    if (b.recover > 0) b.recover--;
    if (b.state === 'walk') {
        b.dir = Math.sign(dist) || b.dir;
        if (Math.abs(dist) > 320) { b.x += b.dir * 1.5; b.run += 0.12; }
        if (!player.isDying && Math.abs(dist) < 1400 && ++b.timer > 90) {
            b.timer = 0; b.attacks++;
            b.next = b.attacks % 3 === 0 ? 'ram' : 'shell';
            b.state = 'crouch'; b.stateT = b.next === 'ram' ? 45 : 28;
            createParticle(b.x + b.w / 2, b.y - 60, b.next === 'ram' ? "VRRROOOM!" : "ATEŞ!", "#fde047", 1.0);
        }
    } else if (b.state === 'crouch') {
        if (--b.stateT <= 0) {
            b.dir = Math.sign(dist) || b.dir;
            if (b.next === 'shell') {
                const mx = b.x + b.w / 2 + b.dir * 150, my = b.y + 20;
                for (let i = 0; i < 3; i++) fireball(mx, my, b.dir * (5 + i * 2.6), -9 + i * 1.2);
                b.recover = 12; playGunshot(0, 0.6);
                b.state = 'walk';
            } else { b.state = 'dash'; b.stateT = 80; }
        }
    } else if (b.state === 'dash') {
        b.x += b.dir * 10; b.run += 0.5;
        if (--b.stateT <= 0 || b.x <= b.homeX - b.T.arena || b.x >= b.homeX + b.T.arena) { b.state = 'walk'; b.timer = 30; }
    }
    b.x = Math.max(b.homeX - b.T.arena, Math.min(b.x, b.homeX + b.T.arena, WORLD_WIDTH - b.w));
    b.crouch += ((b.state === 'crouch' ? 1 : 0) - b.crouch) * 0.25;
}
function drawBigTank(ctx, b) {
    ctx.save();
    bossBaseTransform(ctx, b);
    if (b.state === 'crouch') ctx.translate((Math.random() - 0.5) * 4, 0);
    ctx.scale(b.dir || -1, 1);
    const OL = "#4d5b2a", OD = "#36401c";
    ctx.fillStyle = "#111827"; ctx.beginPath(); ctx.roundRect(-150, -56, 300, 56, 26); ctx.fill();
    for (let i = 0; i < 9; i++) {
        ctx.save(); ctx.translate(-124 + i * 31, -28); ctx.rotate(b.run);
        ctx.fillStyle = "#6b7280"; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#374151"; ctx.fillRect(-3, -14, 6, 28); ctx.restore();
    }
    ctx.fillStyle = OL; ctx.beginPath(); ctx.moveTo(-146, -56); ctx.lineTo(-126, -100); ctx.lineTo(132, -100); ctx.lineTo(152, -56); ctx.closePath(); ctx.fill();
    ctx.fillStyle = OD; [[-100, -88, 40, 14], [-20, -80, 30, 10], [60, -92, 46, 12]].forEach(r => ctx.fillRect(...r));
    // kule ve namlu (oyuncuya hafifçe eğilir)
    ctx.fillStyle = OL; ctx.beginPath(); ctx.roundRect(-64, -150, 124, 52, 18); ctx.fill();
    ctx.save(); ctx.translate(50, -128); ctx.rotate(b.state === 'crouch' && b.next === 'shell' ? -0.25 : -0.05);
    ctx.fillStyle = OD; ctx.fillRect(0, -8, 130, 16); ctx.fillStyle = "#1f2937"; ctx.fillRect(124, -11, 14, 22);
    if (b.recover > 0) {
        ctx.fillStyle = "#fde047"; ctx.beginPath();
        for (let i = 0; i < 10; i++) { const r = i % 2 ? 10 : 28, a = i * Math.PI / 5; ctx.lineTo(150 + Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // kızgın gözler (komik) ve kapak
    [-24, 14].forEach(x => { ctx.fillStyle = "#fff"; ctx.fillRect(x, -136, 20, 14); ctx.fillStyle = "#111"; ctx.fillRect(x + 8, -132, 8, 8); });
    ctx.strokeStyle = "#111"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-28, -142); ctx.lineTo(-4, -138); ctx.moveTo(10, -138); ctx.lineTo(34, -142); ctx.stroke();
    ctx.fillStyle = OD; ctx.beginPath(); ctx.arc(-20, -150, 18, Math.PI, 0); ctx.fill();
    if (b.dying) {
        ctx.strokeStyle = "#78350f"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-20, -152); ctx.lineTo(-20, -230); ctx.stroke();
        ctx.fillStyle = "#f8fafc"; ctx.fillRect(-20, -230, 54, 34);
    }
    ctx.restore();
}
