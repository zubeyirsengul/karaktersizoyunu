// Başörtülü teyzeler: canavar ölünce koşarak gelir, kutlarlar (celebrate() bosses.js'te)
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

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
