// 3. bölüm canavarı DEV ÇELİK KASA ("Paraları Sıfırla")
// Kapağı kapalıyken zırhlıdır: rüşvet, balyoz ve üstüne zıplamak işlemez. Saldırırken kapağı açılır:
//   - destelerini savurur (kavisli dolar yağmuru), ya da
//   - "SIFIRLA!" diye bağırır, sayacı sıfırlanır (sıfırlama sesi) ve oyuncunun üstüne gökten para yağar.
// Saldırıdan sonra kapak bir süre açık kalır: o sırada vurulabilir. İçinde para desteleri ve altın külçeleri görünür.
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

const KASA_TEXT = {
    tr: { kasaName: "DEV ÇELİK KASA", kasaClosed: "KAPAK KAPALI! AÇILINCA VUR!", kasaReset: "SIFIRLA!",
          l3Note: "Paralar sıfırlandı, kasa boşaldı! Sıra sandıkta." },
    en: { kasaName: "GIANT STEEL SAFE", kasaClosed: "DOOR SHUT! HIT IT WHEN IT OPENS!", kasaReset: "ZERO IT!",
          l3Note: "The money is zeroed, the safe is empty! Next: the election." },
    fr: { kasaName: "COFFRE-FORT GÉANT", kasaClosed: "PORTE FERMÉE ! FRAPPE QUAND ELLE S'OUVRE !", kasaReset: "À ZÉRO !",
          l3Note: "L'argent est remis à zéro, le coffre est vide ! Prochaine étape : l'élection." },
    nl: { kasaName: "REUZENKLUIS", kasaClosed: "DEUR DICHT! SLA TOE ALS HIJ OPENGAAT!", kasaReset: "OP NUL!",
          l3Note: "Het geld staat op nul, de kluis is leeg! Nu de verkiezingen." },
    de: { kasaName: "RIESEN-TRESOR", kasaClosed: "TÜR ZU! SCHLAG ZU, WENN SIE AUFGEHT!", kasaReset: "AUF NULL!",
          l3Note: "Das Geld ist auf null, der Tresor ist leer! Jetzt die Wahl." },
    ru: { kasaName: "ГИГАНТСКИЙ СЕЙФ", kasaClosed: "ДВЕРЦА ЗАКРЫТА! БЕЙ, КОГДА ОТКРОЕТСЯ!", kasaReset: "ОБНУЛИ!",
          l3Note: "Деньги обнулены, сейф пуст! Дальше — выборы." }
};
for (const L in KASA_TEXT) if (LANGS[L]) Object.assign(LANGS[L], KASA_TEXT[L]);

BOSS_TYPES.kasa = { say: "SIFIRLAAA!", w: 200, h: 220, scale: 1, hp: 12, arena: 900, nameKey: "kasaName", stomp: 60, labelY: 40,
                    armored: b => !(b.door >= 0.6), armorKey: "kasaClosed", update: updateKasa, draw: drawKasa };

const KASA_OPEN = 34, KASA_EXPOSED = 110;   // kapağın açılma süresi, saldırıdan sonra açık kalma süresi (kare)
function updateKasa(b) {
    b.y = bossGround(b);
    if (b.door === undefined) { b.door = 0; b.count = 0; }
    const dist = (player.x + player.w / 2) - (b.x + b.w / 2);
    b.look = Math.sign(dist) || b.look;
    b.count = b.state === 'reset' ? Math.max(0, b.count * 0.8) : b.count + 1373;   // üstteki sayaç
    if (b.state === 'walk') {
        b.door += (0 - b.door) * 0.2;
        b.dir = Math.sign(dist) || b.dir;
        if (Math.abs(dist) > 260) { b.x += b.dir * 1.6; b.run += 0.14; }   // ağır ağır sekerek yürür
        if (!player.isDying && Math.abs(dist) < 1400 && ++b.timer > 95) {
            b.timer = 0; b.attacks++;
            b.next = b.attacks % 2 ? 'volley' : 'reset';
            b.state = 'open'; b.stateT = KASA_OPEN;
        }
    } else if (b.state === 'open') {   // kapak gıcırdayarak açılır
        b.door = Math.min(1, b.door + 1 / KASA_OPEN);
        if (--b.stateT <= 0) {
            if (b.next === 'volley') { dollarVolley(b); b.state = 'exposed'; b.stateT = KASA_EXPOSED; b.volley2 = 28; }
            else {
                b.state = 'reset'; b.stateT = 50;
                createParticle(b.x + b.w / 2, b.y - 60, t("kasaReset"), "#4ade80", 1.4);
                playSfx('sifirla', { vol: 0.9 });
                moneyRain();
            }
        }
    } else if (b.state === 'reset') {
        if (--b.stateT <= 0) { b.state = 'exposed'; b.stateT = KASA_EXPOSED; }
    } else if (b.state === 'exposed') {   // kapak açık: vurulabilir
        if (b.volley2 > 0 && --b.volley2 === 0) dollarVolley(b);
        if (--b.stateT <= 0) { b.state = 'walk'; b.timer = 0; }
    }
    b.x = Math.max(b.homeX - b.T.arena, Math.min(b.x, b.homeX + b.T.arena, WORLD_WIDTH - b.w));
}
// Gökten oyuncunun çevresine dolar yağar (yaprak gibi süzülür, kalkan durdurur)
function moneyRain() {
    const cx = player.x + player.w / 2;
    for (let i = 0; i < 8; i++) {
        projectiles.push({ type: 'dollar1', x: cx - 420 + i * 120 + Math.random() * 60, y: -30 - Math.random() * 120, vx: 0, vy: 0.5,
                           active: true, life: 520, angle: 0, phase: Math.random() * 6, landed: false });
    }
}

function drawKasa(ctx, b) {
    const W = 200, H = 210, door = b.door || 0;
    const hop = b.state === 'walk' ? Math.abs(Math.sin(b.run)) * 10 : 0;
    const shake = b.state === 'open' || b.state === 'reset' ? (Math.random() - 0.5) * 5 : 0;
    ctx.save();
    bossBaseTransform(ctx, b, hop);
    ctx.translate(shake, 0);
    // ayaklar
    ctx.fillStyle = "#1f2937";
    [-1, 1].forEach(s => ctx.fillRect(s * 62 - 16, -14, 32, 14));
    // gövde (çelik)
    const g = ctx.createLinearGradient(-W / 2, 0, W / 2, 0);
    g.addColorStop(0, "#94a3b8"); g.addColorStop(0.5, "#cbd5e1"); g.addColorStop(1, "#64748b");
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-W / 2, -H - 12, W, H, 14); ctx.fill();
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = "#475569";                                               // perçinler
    for (let i = 0; i < 6; i++) [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(s * (W / 2 - 10), -H + i * 36, 3.5, 0, Math.PI * 2); ctx.fill(); });
    // üst bant: kızgın gözler ve sayaç
    const ex = b.look * 6, angry = b.state !== 'walk' || b.rage;
    [-1, 1].forEach(s => {
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(s * 46, -H + 22, 20, 14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(s * 46 + ex, -H + 25, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#111"; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(s * 24, -H + 6 + (angry ? 4 : 0)); ctx.lineTo(s * 68, -H + 2 - (angry ? 6 : 0)); ctx.stroke();
    });
    ctx.fillStyle = "#052e16"; ctx.fillRect(-36, -H + 8, 72, 26);
    ctx.fillStyle = b.state === 'reset' ? "#fde047" : "#4ade80"; ctx.font = "bold 17px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(Math.floor(b.count || 0) % 1000000).padStart(6, "0"), 0, -H + 21);
    // kapak boşluğu: içi (raflarda para ve altın)
    const dx = -W / 2 + 16, dy = -H + 48, dw = W - 32, dh = H - 70;
    ctx.fillStyle = "#1e293b"; ctx.fillRect(dx, dy, dw, dh);
    if (door > 0.05) {
        ctx.fillStyle = "#475569"; ctx.fillRect(dx, dy + dh * 0.5 - 3, dw, 6);
        for (let i = 0; i < 4; i++) {                                         // para desteleri (üst raf)
            ctx.fillStyle = "#16a34a"; ctx.fillRect(dx + 12 + i * 40, dy + dh * 0.5 - 30, 32, 26);
            ctx.fillStyle = "#86efac"; ctx.fillRect(dx + 12 + i * 40, dy + dh * 0.5 - 20, 32, 5);
        }
        for (let i = 0; i < 3; i++) {                                         // altın külçeler (alt raf)
            ctx.fillStyle = "#eab308"; ctx.fillRect(dx + 18 + i * 52, dy + dh - 28, 44, 22);
            ctx.fillStyle = "#fde047"; ctx.fillRect(dx + 22 + i * 52, dy + dh - 25, 30, 6);
        }
        const glow = ctx.createRadialGradient(0, dy + dh / 2, 10, 0, dy + dh / 2, dw);
        glow.addColorStop(0, `rgba(253,224,71,${0.35 * door})`); glow.addColorStop(1, "rgba(253,224,71,0)");
        ctx.fillStyle = glow; ctx.fillRect(dx, dy, dw, dh);
    }
    // kapak: sol menteşeden açılır (genişliği daralır, kenarı görünür)
    const k = Math.cos(door * Math.PI * 0.46), pw = dw * k;
    if (pw > 2) {
        const dg = ctx.createLinearGradient(dx, 0, dx + pw, 0);
        dg.addColorStop(0, "#64748b"); dg.addColorStop(1, "#94a3b8");
        ctx.fillStyle = dg; ctx.fillRect(dx, dy, pw, dh);
        ctx.strokeStyle = "#334155"; ctx.lineWidth = 3; ctx.strokeRect(dx, dy, pw, dh);
        const cx = dx + pw / 2, cy = dy + dh / 2;
        ctx.save(); ctx.translate(cx, cy); ctx.scale(k, 1);
        ctx.fillStyle = "#e2e8f0"; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill();   // şifre çarkı
        ctx.strokeStyle = "#334155"; ctx.lineWidth = 4; ctx.stroke();
        ctx.save(); ctx.rotate(b.anim * 0.05 + door * 6);
        for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.fillStyle = "#334155"; ctx.fillRect(-1.5, -30, 3, 8); }
        ctx.fillStyle = "#475569"; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.fillStyle = "#334155"; ctx.fillRect(40, -8, 26, 16);                                      // kol
        ctx.restore();
    }
    ctx.fillStyle = "#1e293b"; ctx.fillRect(dx - 6, dy + 14, 8, 22); ctx.fillRect(dx - 6, dy + dh - 36, 8, 22);   // menteşeler
    ctx.restore();
    ctx.textBaseline = "alphabetic";
}
