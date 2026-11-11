// BYLOCK canavarı: dev akıllı telefon
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// BYLOCK: dev akıllı telefon; zıplayıp şok dalgası yapar, kilit simgeleri fırlatır
BOSS_TYPES.bylock = { say: "İNDİRDİN Mİ?", w: 150, h: 230, dw: 150, dh: 230, scale: 1, hp: 20, arena: 900, nameKey: "bylockName", stomp: 55, labelY: 40, update: updateBylock, draw: drawBylock };

function updateBylock(b) {
    const ground = bossGround(b);
    const dist = (player.x + player.w / 2) - (b.x + b.w / 2);
    b.look = Math.sign(dist) || b.look;
    if (b.state === 'walk') {
        b.y = ground;
        b.dir = Math.sign(dist) || b.dir;
        if (Math.abs(dist) > 260) { b.x += b.dir * 1.6; b.run += 0.12; }
        if (!player.isDying && Math.abs(dist) < 1400 && ++b.timer > 75) {
            b.timer = 0; b.attacks++;
            b.next = b.attacks % 2 ? 'locks' : 'leap';
            b.state = 'crouch'; b.stateT = b.next === 'leap' ? 30 : 26;
            createParticle(b.x + b.w / 2, b.y - 50, b.next === 'leap' ? "GÜNCELLEME!" : "BİLDİRİM!", "#38bdf8", 1.0);
        }
    } else if (b.state === 'crouch') {
        b.y = ground;
        if (--b.stateT <= 0) {
            if (b.next === 'locks') { lockVolley(b); b.state = 'walk'; }
            else { b.state = 'leap'; b.vy = -18; b.vx = Math.max(-11, Math.min(11, dist / 40)); }
        }
    } else if (b.state === 'leap') {
        b.vy += 0.9; b.x += b.vx; b.y += b.vy;
        if (b.y >= ground) {
            b.y = ground; b.state = 'walk'; b.timer = 15;
            const cx = b.x + b.w / 2;
            [-1, 1].forEach(d => projectiles.push({ type: 'wave', x: cx + d * 50, y: height - 60, vx: d * 8, active: true, life: 85, angle: 0 }));
            playSfx('hit', { rate: 0.5, vol: 0.7 });
        }
    }
    b.x = Math.max(b.homeX - b.T.arena, Math.min(b.x, b.homeX + b.T.arena, WORLD_WIDTH - b.w));
    b.crouch += ((b.state === 'crouch' ? 1 : 0) - b.crouch) * 0.25;
}
function lockVolley(b) {
    const mx = b.x + b.w / 2, my = b.y + 40, side = Math.sign(player.x + player.w / 2 - mx) || 1;
    for (let i = 0; i < 5; i++) projectiles.push({ type: 'dollar1', skin: 'lock', x: mx, y: my, vx: side * (2 + i * 1.8), vy: -10 - Math.random() * 3,
                                                   active: true, life: 420, angle: 0, phase: Math.random() * 6, landed: false });
}
function drawLockIcon(ctx, x, y, angle) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 10;
    ctx.fillStyle = "#0ea5e9"; ctx.beginPath(); ctx.roundRect(-18, -18, 36, 36, 9); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -3, 7, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.fillRect(-10, -3, 20, 14);
    ctx.restore();
}
function drawBylock(ctx, b) {
    const sq = b.crouch * 12;
    ctx.save();
    bossBaseTransform(ctx, b);
    ctx.scale(1 + sq / 150, 1 - sq / 230);
    const W = 150, H = 230;
    // bacaklar ve kollar
    ctx.strokeStyle = "#111827"; ctx.lineWidth = 10; ctx.lineCap = "round";
    [-1, 1].forEach(s => {
        const a = b.state === 'walk' ? Math.sin(b.run * 2 + (s > 0 ? Math.PI : 0)) * 0.4 : 0;
        ctx.beginPath(); ctx.moveTo(s * 30, -26); ctx.lineTo(s * 30 + Math.sin(a) * 26, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s * W / 2, -H * 0.55); ctx.lineTo(s * (W / 2 + 34), -H * 0.55 + (b.state === 'crouch' ? -40 : 20)); ctx.stroke();
    });
    ctx.fillStyle = "#111827"; ctx.beginPath(); ctx.roundRect(-W / 2, -H, W, H - 24, 24); ctx.fill();
    const g = ctx.createLinearGradient(0, -H + 16, 0, -36);
    g.addColorStop(0, "#1e3a8a"); g.addColorStop(1, "#0ea5e9");
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-W / 2 + 10, -H + 16, W - 20, H - 64, 12); ctx.fill();
    ctx.fillStyle = "#111827"; ctx.fillRect(-20, -H + 6, 40, 6);
    // ekrandaki yüz
    [-1, 1].forEach(s => { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s * 28, -H + 60, 14, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(s * 28 + b.look * 5, -H + 62, 6, 0, Math.PI * 2); ctx.fill(); });
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -H + 96, 18, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    // kilit simgesi ve yazı
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -H + 132, 12, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.fillRect(-18, -H + 132, 36, 26);
    ctx.font = "bold 20px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("ByLock", 0, -60);
    const prog = (b.anim % 240) / 240;
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fillRect(-50, -46, 100, 6); ctx.fillStyle = "#4ade80"; ctx.fillRect(-50, -46, 100 * prog, 6);
    ctx.restore();
}
