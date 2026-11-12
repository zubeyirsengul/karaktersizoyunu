// Güçlendirmeler: hız, çift zıplama, dev balyoz, can, dokunulmazlık
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- GÜÇLENDİRMELER ---
// Bazı torbaların yerinde parlayan güç küreleri durur. Süreler kare cinsinden (60 kare = 1 sn).
const POWERS = {
    speed:  { icon: "⚡", color: "#facc15", frames: 480, key: "pwSpeed" },    // 1,6 kat hız
    double: { icon: "⏫", color: "#38bdf8", frames: 720, key: "pwDouble" },   // havada ikinci zıplama
    hammer: { icon: "🔨", color: "#f97316", frames: 600, key: "pwHammer" },   // dev balyoz
    heart:  { icon: "❤️", color: "#ef4444", frames: 0,   key: "pwHeart" },    // +1 can
    star:   { icon: "⭐", color: "#fde047", frames: 360, key: "pwStar" },     // dokunulmazlık
    mask:   { icon: "⛑️", color: "#f59e0b", frames: 3,   key: "pwMask" }      // 1. bölüm: baret + gaz maskesi; süre değil 3 vuruş
};
const POWER_ORDER = ['speed', 'double', 'hammer', 'heart', 'star', 'mask'];
let power = { speed: 0, double: 0, hammer: 0, star: 0 }, usedDouble = false;
const hammerReach = () => HAMMER_REACH * (power.hammer > 0 ? 1.6 : 1) * (LEVELS[currentLevel].stamp ? 1.3 : 1);   // KHK damgası daha geniş vurur

function grantPower(kind, x, y) {
    const P = POWERS[kind];
    if (kind === 'heart') {
        if (player.hp < player.maxHp) { player.hp++; updateHearts(); }
        else { addScore(5000); $('score').innerText = score; }      // canlar doluysa puan
    } else power[kind] = P.frames;
    createParticle(x, y - 30, t(P.key), P.color, 1.4);
    playSfx('hit', { rate: 1.6, vol: 0.5 });
}
function updatePowers() {
    for (const k in power) if (power[k] > 0 && k !== 'mask') power[k]--;   // baret süreyle değil vuruşla biter
    if (player.grounded) usedDouble = false;
}
// Havadayken ikinci zıplama (çift zıplama gücü açıkken)
function tryDoubleJump() {
    if (power.double > 0 && !player.grounded && !usedDouble && !player.isDying) {
        usedDouble = true;
        player.vy = player.jumpPower * 0.9;
        for (let i = 0; i < 6; i++) particles.push({ x: player.x + player.w / 2, y: player.y + player.h, vx: (Math.random() - 0.5) * 6, vy: Math.random() * 2,
                                                     life: 0.4, maxLife: 0.4, size: 4 + Math.random() * 4, text: null, color: "#bae6fd" });
        return true;
    }
    return false;
}

// Güç küresi: renkli parıltı, ortasında simge, hafifçe süzülür
function drawPowerOrb(ctx, it) {
    const P = POWERS[it.power], t0 = performance.now() / 1000, y = it.y + Math.sin(t0 * 3 + it.x) * 6;
    const g = ctx.createRadialGradient(it.x, y, 4, it.x, y, 46);
    g.addColorStop(0, P.color); g.addColorStop(0.45, P.color + "aa"); g.addColorStop(1, P.color + "00");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(it.x, y, 46, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.strokeStyle = P.color; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(it.x, y, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.font = "26px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(P.icon, it.x, y + 1);
    ctx.textBaseline = "alphabetic";
}
// Etkin güçler: sol üstte simge + kalan süre çubuğu
function drawPowerHud(ctx) {
    let y = 138;
    POWER_ORDER.forEach(k => {
        if (!(power[k] > 0)) return;
        const P = POWERS[k], f = power[k] / P.frames;
        ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.fillRect(16, y - 16, 150, 30);
        ctx.font = "20px sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff"; ctx.fillText(P.icon, 22, y);   // simge soluk çıkmasın
        ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(52, y - 6, 106, 12);
        ctx.fillStyle = P.color; ctx.fillRect(52, y - 6, 106 * f, 12);
        y += 36;
    });
    ctx.textBaseline = "alphabetic";
}
// Dokunulmazken Recep'in etrafında yanıp sönen altın hale
function drawStarAura(ctx) {
    if (!(power.star > 0) || player.isDying) return;
    const t0 = performance.now() / 1000, cx = player.x + player.w / 2, cy = player.y + player.h / 2;
    const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 130);
    const a = 0.35 + 0.2 * Math.sin(t0 * 12);
    g.addColorStop(0, `rgba(253,224,71,${a})`); g.addColorStop(1, "rgba(253,224,71,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 130, 0, Math.PI * 2); ctx.fill();
}
