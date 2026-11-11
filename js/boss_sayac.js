// 3. bölüm canavarı PARA SAYMA MAKİNESİ
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// PARA SAYMA MAKİNESİ: banknot savurur, "SIFIRLA!" diye bağırıp arenada yuvarlanır
BOSS_TYPES.sayac = { say: "SIFIRLAAA!", w: 190, h: 180, dw: 190, dh: 180, scale: 1, hp: 16, arena: 900, nameKey: "sayacName", stomp: 60, labelY: 40, update: updateSayac, draw: drawSayac };

function updateSayac(b) {
    b.y = bossGround(b);
    const dist = (player.x + player.w / 2) - (b.x + b.w / 2);
    b.look = Math.sign(dist) || b.look;
    if (b.state === 'walk') {
        b.dir = Math.sign(dist) || b.dir;
        if (Math.abs(dist) > 240) { b.x += b.dir * 1.8; b.run += 0.15; }
        if (!player.isDying && Math.abs(dist) < 1400 && ++b.timer > 80) {
            b.timer = 0; b.attacks++;
            b.next = b.attacks % 2 ? 'volley' : 'roll';
            b.state = 'crouch'; b.stateT = b.next === 'roll' ? 42 : 30;
            createParticle(b.x + b.w / 2, b.y - 50, b.next === 'roll' ? "SIFIRLA!" : "BRRRT!", "#4ade80", 1.0);
        }
    } else if (b.state === 'crouch') {
        if (--b.stateT <= 0) {
            b.dir = Math.sign(dist) || b.dir;
            if (b.next === 'volley') { dollarVolley(b); b.state = 'walk'; }
            else { b.state = 'dash'; b.stateT = 70; }
        }
    } else if (b.state === 'dash') {
        b.x += b.dir * 12; b.run += 0.6;
        if (--b.stateT <= 0 || b.x <= b.homeX - b.T.arena || b.x >= b.homeX + b.T.arena) { b.state = 'walk'; b.timer = 20; }
    }
    b.x = Math.max(b.homeX - b.T.arena, Math.min(b.x, b.homeX + b.T.arena, WORLD_WIDTH - b.w));
    b.crouch += ((b.state === 'crouch' ? 1 : 0) - b.crouch) * 0.25;
}
function drawSayac(ctx, b) {
    const shake = b.state === 'crouch' ? (Math.random() - 0.5) * 6 : 0, hop = b.state === 'walk' ? Math.abs(Math.sin(b.run)) * 8 : 0;
    ctx.save();
    bossBaseTransform(ctx, b, hop);
    ctx.translate(shake, 0);
    const W = 190, H = 170;
    // ayaklar
    ctx.fillStyle = "#111827";
    [-1, 1].forEach(s => ctx.fillRect(s * 50 - 18, -14, 36, 14 + (b.state === 'walk' ? Math.sin(b.run + (s > 0 ? Math.PI : 0)) * 3 : 0)));
    // gövde
    const g = ctx.createLinearGradient(-W / 2, -H, W / 2, 0);
    g.addColorStop(0, "#d1d5db"); g.addColorStop(1, "#6b7280");
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-W / 2, -H - 6, W, H - 6, 18); ctx.fill();
    ctx.strokeStyle = "#374151"; ctx.lineWidth = 4; ctx.stroke();
    // üstteki para yuvası: dönüp duran banknotlar
    ctx.fillStyle = "#1f2937"; ctx.fillRect(-60, -H - 10, 120, 12);
    for (let i = 0; i < 4; i++) {
        const a = Math.sin(b.anim * 0.5 + i) * 0.4;
        ctx.save(); ctx.translate(-36 + i * 24, -H - 8); ctx.rotate(a);
        ctx.fillStyle = "#22c55e"; ctx.fillRect(-10, -34, 20, 34); ctx.fillStyle = "#14532d"; ctx.font = "bold 12px Arial"; ctx.textAlign = "center"; ctx.fillText("$", 0, -14);
        ctx.restore();
    }
    // gözler (kızgın)
    const ex = b.look * 6;
    [-1, 1].forEach(s => {
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(s * 40, -H + 38, 22, 16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(s * 40 + ex, -H + 42, 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#111"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(s * 18, -H + 20); ctx.lineTo(s * 62, -H + 14 - (b.state !== 'walk' ? 6 : 0)); ctx.stroke();
    });
    // sayaç ekranı
    ctx.fillStyle = "#052e16"; ctx.fillRect(-70, -H + 66, 140, 36);
    ctx.fillStyle = "#4ade80"; ctx.font = "bold 24px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const n = b.state === 'dash' ? "000000" : String(Math.floor(b.anim * 1373) % 1000000).padStart(6, "0");
    ctx.fillText("€" + n, 0, -H + 85);
    // ağız: banknot çıkışı
    ctx.fillStyle = "#111827"; ctx.fillRect(-56, -48, 112, 14);
    ctx.fillStyle = "#16a34a"; ctx.fillRect(-46, -40, 92, 6 + (b.state === 'crouch' ? 10 : 0));
    // yuvarlanırken hız çizgileri
    if (b.state === 'dash') {
        ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 4;
        for (let i = 0; i < 4; i++) { const y = -30 - i * 36; ctx.beginPath(); ctx.moveTo(-b.dir * (W / 2 + 10), y); ctx.lineTo(-b.dir * (W / 2 + 60 + i * 10), y); ctx.stroke(); }
    }
    ctx.restore();
}
