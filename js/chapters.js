// 3-8. bölümlerin özel içerikleri: arka planlar, yeni düşmanlar, bölüme özel mekanikler, yeni canavarlar
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)
//
// 3 SIFIRLA      : torbalar yerine ses kasetleri ("MONTAJ!"), canavar PARA SAYMA MAKİNESİ
// 4 SANDIK       : rüşvet verilen polis ölmez, bavuluyla sürgüne gider; canavar FETÖ
// 5 FACETIME     : telefonun şarjı azalır, şarj aletleri toplanır; mini tanklar; canavar DARBE TANKI
// 6 UÇUŞ         : flight.js
// 7 OHAL         : balyoz yerine KHK damgası; sivilleri de ihraç eder; canavar BYLOCK
// 8 PENSİLVANYA  : karlı çiftlik; canavar FETÖ'nün son hâli

const curLevel = () => LEVELS[currentLevel];

// --- ARKA PLANLAR ---
Object.assign(THEMES, {
    villa:  { sky: ["#312e81", "#7e22ce", "#db2777", "#fb923c"], sun: { x: 0.72, y: 0.5, r: 58, c: "#fdba74", glow: "rgba(251,146,60,0.4)" },
              clouds: "rgba(251,207,232,0.35)", ground: ["#57534e", "#292524"], grass: "#a8a29e", grassDark: "#57534e", curb: true },
    coast:  { sky: ["#020617", "#0c1445", "#1e3a8a"], moon: { x: 0.18, y: 0.16, r: 30 }, stars: true,
              ground: ["#c9b27a", "#7c6232"], grass: "#e7d7a7", grassDark: "#b49a5e", curb: true },
    sky:    { sky: ["#0b1026", "#1e1b4b", "#4c1d95", "#9d174d"], moon: { x: 0.8, y: 0.15, r: 28 }, stars: true,
              ground: ["#000", "#000"], grass: "#000", grassDark: "#000" },
    ankara: { sky: ["#94a3b8", "#cbd5e1", "#e2e8f0"], sun: { x: 0.78, y: 0.14, r: 34, c: "#f8fafc", glow: "rgba(255,255,255,0.3)" },
              clouds: "rgba(241,245,249,0.85)", ground: ["#6b7280", "#374151"], grass: "#9ca3af", grassDark: "#4b5563", curb: true },
    snow:   { sky: ["#475569", "#94a3b8", "#cbd5e1"], sun: { x: 0.22, y: 0.18, r: 30, c: "#f8fafc", glow: "rgba(255,255,255,0.25)" },
              clouds: "rgba(226,232,240,0.8)", ground: ["#e2e8f0", "#94a3b8"], grass: "#f8fafc", grassDark: "#cbd5e1" }
});

function drawChapterBackground(bg, time) {
    if (bg === 'villa') {
        // Boğaz: su, köprü silüeti, tepedeki villalar
        const sea = height * 0.68;
        ctx.fillStyle = "#1e1b4b"; ctx.fillRect(0, sea, width, height - sea);
        ctx.fillStyle = "rgba(251,146,60,0.35)";
        for (let i = 0; i < 14; i++) { const y = sea + 8 + i * 9; ctx.fillRect(width * 0.72 - 40 + Math.sin(time * 2 + i) * 12, y, 80 - i * 3, 2); }
        const span = 2600, off = (camX * 0.05) % span;
        for (let k = -1; k < 2; k++) {
            const x0 = k * span - off + 200;
            ctx.strokeStyle = "#1e1b4b"; ctx.fillStyle = "#1e1b4b"; ctx.lineWidth = 3;
            ctx.fillRect(x0, sea - 150, 10, 150); ctx.fillRect(x0 + 700, sea - 150, 10, 150);
            ctx.fillRect(x0 - 200, sea - 40, 1100, 7);
            ctx.beginPath(); ctx.moveTo(x0 - 200, sea - 40); ctx.quadraticCurveTo(x0 + 5, sea - 160, x0 + 5, sea - 150);
            ctx.quadraticCurveTo(x0 + 355, sea + 10, x0 + 705, sea - 150); ctx.quadraticCurveTo(x0 + 705, sea - 160, x0 + 900, sea - 40); ctx.stroke();
        }
        const hb = height * 0.84;
        hillLayer(0.3, hb, 16, 3.3, "#2e1065");
        layerProps(0.3, 240, 0.75, 3, (sx, i) => {
            const y = hillY(sx, 0.3, hb, 16, 3.3) + 4, w = 70 + hash(i * 3.7) * 40, h = 46 + hash(i * 1.9) * 30;
            ctx.fillStyle = "#4c1d95"; ctx.fillRect(sx - w / 2, y - h, w, h);
            ctx.fillStyle = "#7f1d1d"; ctx.beginPath(); ctx.moveTo(sx - w / 2 - 8, y - h); ctx.lineTo(sx, y - h - 26); ctx.lineTo(sx + w / 2 + 8, y - h); ctx.fill();
            ctx.fillStyle = "#fde68a";
            for (let c = 0; c < 3; c++) for (let r = 0; r < 2; r++) if (hash(i * 9 + c * 3 + r) > 0.35) ctx.fillRect(sx - w / 2 + 10 + c * (w - 20) / 3, y - h + 10 + r * 18, 10, 10);
        });
    } else if (bg === 'coast') {
        // Marmaris: gece denizi, ay ışığı, otel ışıkları, palmiyeler
        hillLayer(0.05, height * 0.6, 50, 2.2, "#0f172a");
        const sea = height * 0.66;
        ctx.fillStyle = "#0b1a3d"; ctx.fillRect(0, sea, width, height - sea);
        ctx.fillStyle = "rgba(226,232,240,0.35)";
        for (let i = 0; i < 12; i++) ctx.fillRect(width * 0.18 - 30 + Math.sin(time * 1.6 + i) * 10, sea + 6 + i * 10, 60 - i * 3, 2);
        skyline(0.2, height * 0.74, 30, 110, "#111827", "rgba(253,230,138,0.75)", 4);
        layerProps(0.45, 260, 0.6, 9, (sx, i) => {
            const y = height * 0.9, s = 0.8 + hash(i * 2.3) * 0.5, sway = Math.sin(time + i) * 4;
            ctx.strokeStyle = "#3f2a1d"; ctx.lineWidth = 7 * s; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(sx, y); ctx.quadraticCurveTo(sx + 10 * s, y - 60 * s, sx + sway, y - 110 * s); ctx.stroke();
            ctx.strokeStyle = "#14532d"; ctx.lineWidth = 6 * s;
            for (let k = 0; k < 6; k++) {
                const a = -Math.PI + k * Math.PI / 5;
                ctx.beginPath(); ctx.moveTo(sx + sway, y - 110 * s);
                ctx.quadraticCurveTo(sx + sway + Math.cos(a) * 30 * s, y - 128 * s, sx + sway + Math.cos(a) * 48 * s, y - 100 * s + Math.abs(Math.sin(a)) * 8);
                ctx.stroke();
            }
        });
    } else if (bg === 'ankara') {
        // OHAL Ankarası: gri bakanlıklar, kırmızı KHK pankartları, uçuşan kararname kâğıtları
        skyline(0.12, height * 0.72, 80, 220, "#64748b", null, 3);
        const gb = height * 0.88;
        layerProps(0.35, 520, 0.85, 6, (sx, i) => {
            const w = 300, h = 170 + hash(i) * 50;
            ctx.fillStyle = "#94a3b8"; ctx.fillRect(sx - w / 2, gb - h, w, h);
            ctx.fillStyle = "#cbd5e1"; ctx.fillRect(sx - w / 2 - 10, gb - h - 14, w + 20, 16);
            ctx.fillStyle = "#64748b"; for (let c = 0; c < 8; c++) ctx.fillRect(sx - w / 2 + 14 + c * 36, gb - h + 20, 12, h - 20);
            ctx.fillStyle = "#b91c1c"; ctx.fillRect(sx - 70, gb - h + 34, 140, 36);
            ctx.fillStyle = "#fff"; ctx.font = "bold 22px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(i % 2 ? "OHAL" : "KHK", sx, gb - h + 53);
            ctx.fillStyle = "#e30a17"; ctx.fillRect(sx + w / 2 - 30, gb - h - 70, 26, 17); ctx.fillStyle = "#475569"; ctx.fillRect(sx + w / 2 - 32, gb - h - 70, 3, 56);
        });
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        for (let i = 0; i < 14; i++) {
            const x = ((hash(i * 4.1) * (width + 200) - time * (20 + hash(i) * 30) - camX * 0.3) % (width + 200) + width + 200) % (width + 200) - 100;
            const y = (hash(i * 2.9) * height * 0.7 + time * 25) % (height * 0.8);
            ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(time * 2 + i)); ctx.fillRect(-9, -12, 18, 24);
            ctx.fillStyle = "#94a3b8"; ctx.fillRect(-6, -7, 12, 2); ctx.fillRect(-6, -2, 12, 2); ctx.fillRect(-6, 3, 8, 2);
            ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.restore();
        }
    } else if (bg === 'saracane') {
        drawSaracaneBg(time);   // 10. bölüm: js/ekrem.js
    } else if (bg === 'prison') {
        drawPrisonBg(time);   // 9. bölüm: js/selo.js
    } else if (bg === 'snow') {
        // Pensilvanya: karlı dağlar, çam ormanı, kırmızı ahır, kar yağışı
        hillLayer(0.08, height * 0.6, 70, 1.7, "#cbd5e1");
        const fb = height * 0.78;
        hillLayer(0.25, fb, 20, 4.4, "#e2e8f0");
        layerProps(0.25, 70, 0.7, 4, (sx, i) => {
            const y = hillY(sx, 0.25, fb, 20, 4.4) + 6, s = 0.7 + hash(i * 1.7) * 0.6;
            ctx.fillStyle = "#14532d";
            for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(sx - (26 - k * 6) * s, y - k * 22 * s); ctx.lineTo(sx, y - (40 + k * 22) * s); ctx.lineTo(sx + (26 - k * 6) * s, y - k * 22 * s); ctx.fill(); }
            ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.moveTo(sx - 8 * s, y - 72 * s); ctx.lineTo(sx, y - 84 * s); ctx.lineTo(sx + 8 * s, y - 72 * s); ctx.fill();
        });
        layerProps(0.45, 1100, 0.6, 8, sx => {
            const y = height * 0.9;
            ctx.fillStyle = "#991b1b"; ctx.fillRect(sx - 80, y - 110, 160, 110);
            ctx.beginPath(); ctx.moveTo(sx - 95, y - 110); ctx.lineTo(sx, y - 170); ctx.lineTo(sx + 95, y - 110); ctx.fill();
            ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.moveTo(sx - 95, y - 110); ctx.lineTo(sx, y - 170); ctx.lineTo(sx + 95, y - 110); ctx.lineTo(sx + 80, y - 104); ctx.lineTo(sx, y - 158); ctx.lineTo(sx - 80, y - 104); ctx.fill();
            ctx.strokeStyle = "#fef2f2"; ctx.lineWidth = 4; ctx.strokeRect(sx - 28, y - 70, 56, 70);
            ctx.beginPath(); ctx.moveTo(sx - 28, y - 70); ctx.lineTo(sx + 28, y); ctx.moveTo(sx + 28, y - 70); ctx.lineTo(sx - 28, y); ctx.stroke();
            ctx.fillStyle = "#1e3a8a"; ctx.fillRect(sx + 100, y - 60, 30, 20); ctx.fillStyle = "#475569"; ctx.fillRect(sx + 112, y - 40, 5, 40);   // posta kutusu
        });
        ctx.fillStyle = "#fff";
        for (let i = 0; i < 90; i++) {
            const x = ((hash(i * 3.3) * (width + 100) + Math.sin(time + i) * 20 - camX * 0.6) % (width + 100) + width + 100) % (width + 100) - 50;
            const y = (hash(i * 7.1) * height + time * (40 + hash(i) * 50)) % height;
            ctx.fillRect(x, y, hash(i * 5) > 0.7 ? 4 : 2.5, hash(i * 5) > 0.7 ? 4 : 2.5);
        }
    }
}

// --- BÖLÜM DURUMU ---
let battery = 100, khkCount = 0;
function initChapter() {
    battery = 100; khkCount = 0;
}
function updateChapter() {
    const L = curLevel();
    if (L.battery && !gate && !boss && !player.isDying && !levelEnding) {
        battery -= 0.03;   // dolu şarj ~55 sn dayanır
        if (battery <= 0) {
            battery = 55;
            createParticle(player.x + player.w / 2, player.y - 20, t("batteryOut"), "#ef4444", 1.6);
            player.invuln = 0; die();
        }
    }
}
// Bölüm başında eşyalar ve ek düşmanlar (createLevel'dan çağrılır)
function populateChapter() {
    const L = curLevel();
    if (L.battery) for (let i = 0; i < 14; i++) items.push({ x: 2100 + i * 2600, y: height - 210, collected: false, charger: true });
    if (L.civilians) {
        const roles = ['teacher', 'journalist', 'academic', 'student'];
        for (let i = 0; i < 18; i++) {
            const homeX = 1900 + i * 1500 + (i % 2) * 300;
            enemies.push({ kind: 'civil', role: roles[i % 4], x: homeX, y: height - 60 - 170, w: 70, h: 170, homeX, dead: false,
                           dir: i % 2 ? 1 : -1, speed: 1 + (i % 3) * 0.3, walkCycle: i, lastSpeed: 1 });
        }
    }
}
// Torba yerine çizilen eşya
function drawChapterItem(ctx, it) {
    if (it.charger) { drawCharger(ctx, it.x, it.y); return true; }
    if (curLevel().item === 'tape') { drawCassette(ctx, it.x, it.y); return true; }
    return false;
}
// Toplayınca: true dönerse olağan torba işlemi yapılmaz
function pickupChapterItem(it) {
    if (it.charger) {
        battery = Math.min(100, battery + 45);
        createParticle(it.x, it.y, t("charge"), "#4ade80", 1.0);
        playSfx('hit', { rate: 1.9, vol: 0.4 });
        return true;
    }
    return false;
}
const pickupText = () => curLevel().item === 'tape' ? t("montaj") : t("pickup");

function drawCassette(ctx, x, y) {
    const tm = performance.now() / 1000, bob = Math.sin(tm * 3 + x) * 5;
    ctx.save(); ctx.translate(x, y + bob); ctx.rotate(Math.sin(tm * 2 + x) * 0.08);
    ctx.fillStyle = "#111827"; ctx.beginPath(); ctx.roundRect(-40, -26, 80, 52, 6); ctx.fill();
    ctx.fillStyle = "#f59e0b"; ctx.fillRect(-34, -20, 68, 22);
    ctx.fillStyle = "#111827"; ctx.font = "bold 11px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(t("tapeLabel"), 0, -9, 64);
    ctx.fillStyle = "#e5e7eb";
    [-16, 16].forEach(cx => {
        ctx.beginPath(); ctx.arc(cx, 13, 8, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.translate(cx, 13); ctx.rotate(tm * 4); ctx.fillStyle = "#111827";
        for (let k = 0; k < 3; k++) { ctx.rotate(Math.PI * 2 / 3); ctx.fillRect(-1.5, -6, 3, 5); }
        ctx.restore();
    });
    ctx.fillStyle = "#4b5563"; ctx.fillRect(-10, 9, 20, 8);
    ctx.restore();
}
function drawCharger(ctx, x, y) {
    const tm = performance.now() / 1000, bob = Math.sin(tm * 3 + x) * 6;
    ctx.save(); ctx.translate(x, y + bob);
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 50);
    g.addColorStop(0, "rgba(74,222,128,0.6)"); g.addColorStop(1, "rgba(74,222,128,0)");
    ctx.fillStyle = g; ctx.fillRect(-50, -50, 100, 100);
    ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.roundRect(-20, -26, 40, 40, 6); ctx.fill();
    ctx.fillStyle = "#9ca3af"; ctx.fillRect(-12, -38, 6, 14); ctx.fillRect(6, -38, 6, 14);
    ctx.strokeStyle = "#f8fafc"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 14); ctx.quadraticCurveTo(0, 34, 20, 30); ctx.stroke();
    ctx.fillStyle = "#16a34a"; ctx.beginPath(); ctx.moveTo(3, -20); ctx.lineTo(-8, -4); ctx.lineTo(0, -4); ctx.lineTo(-3, 8); ctx.lineTo(8, -8); ctx.lineTo(0, -8); ctx.closePath(); ctx.fill();
    ctx.restore();
}

// Bölüme özel gösterge: şarj (5), ihraç sayacı (7)
function drawChapterHud(ctx) {
    const L = curLevel();
    if (L.battery) {
        const w = 150, x = width / 2 - w / 2, y = 52, low = battery < 25, blink = low && Math.floor(performance.now() / 250) % 2;
        ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(x - 40, y - 4, w + 56, 28);
        ctx.font = "18px sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff";
        ctx.fillText("📱", x - 34, y + 10);
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, 20); ctx.fillStyle = "#fff"; ctx.fillRect(x + w, y + 6, 5, 8);
        ctx.fillStyle = blink ? "#7f1d1d" : (low ? "#ef4444" : battery < 50 ? "#facc15" : "#4ade80");
        ctx.fillRect(x + 2, y + 2, (w - 4) * Math.max(0, battery) / 100, 16);
        ctx.fillStyle = "#000"; ctx.font = "bold 13px Arial"; ctx.textAlign = "center";
        ctx.fillText("%" + Math.ceil(Math.max(0, battery)), x + w / 2, y + 11);
    }
    if (L.civilians) {
        ctx.fillStyle = "rgba(127,29,29,0.75)"; ctx.fillRect(width / 2 - 95, 50, 190, 28);
        ctx.fillStyle = "#fff"; ctx.font = "bold 16px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(t("khkHud") + ": " + khkCount.toLocaleString(), width / 2, 64);
    }
    ctx.textBaseline = "alphabetic";
}

// --- SÜRGÜN / İHRAÇ: ölen düşman bavuluyla yürüyüp gider ---
function enemyLeaves(en) {
    return !!curLevel().exile || en.kind === 'civil';
}
function applyExilePose(ctx, en) {
    ctx.translate(en.fallDir * en.deathT * 9, -Math.abs(Math.sin(en.deathT * 0.5)) * 5);
    ctx.globalAlpha = Math.max(0, Math.min(1, (DEATH_FRAMES - en.deathT) / 15));
}
function drawSuitcase(ctx, en) {
    const x = en.x + en.w / 2 + en.fallDir * 40, y = en.y + en.h * 0.62;
    ctx.fillStyle = "#78350f"; ctx.fillRect(x - 18, y, 36, 26);
    ctx.fillStyle = "#451a03"; ctx.fillRect(x - 6, y - 6, 12, 6); ctx.fillRect(x - 18, y + 10, 36, 3);
    ctx.fillStyle = "#fde68a"; ctx.font = "bold 9px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(curLevel().exile === 'ihrac' || en.kind === 'civil' ? "KHK" : "✈", x, y + 18);
}
// killEnemy'den önce: sivilse ihraç edilir (sayılmaz), true döner
function chapterKill(en) {
    if (en.kind !== 'civil') {
        if (curLevel().exile === 'ihrac') khkCount++;
        return false;
    }
    en.dead = true; en.deathT = 0; en.lastSpeed = 0;
    en.fallDir = Math.sign(en.x + en.w / 2 - (player.x + player.w / 2)) || 1;
    khkCount++;
    createParticle(en.x + en.w / 2, en.y, t("expel"), "#ef4444", 1.2);
    playSfx('hit', { rate: 1.4, vol: 0.4 });
    return true;
}
function enemyCryText(en) {
    if (en.kind === 'tank') return [t("surrender"), "#f8fafc"];
    const ex = curLevel().exile;
    if (ex === 'surgun') return [t("exileCry"), "#fbbf24"];
    if (ex === 'ihrac') return [t("expel"), "#ef4444"];
    return [t("policeCry"), "#60a5fa"];
}

// --- SİVİLLER (7. bölüm): zararsız öğretmen, gazeteci, akademisyen, öğrenci ---
function updateCivil(en) {
    if (en.x - en.homeX > 200) en.dir = -1; else if (en.x - en.homeX < -200) en.dir = 1;
    en.x += en.dir * en.speed; en.walkCycle += en.speed * 0.1; en.lastSpeed = en.speed;
}
const CIVIL_LOOK = {
    teacher:    { top: "#9a3412", leg: "#44403c", hair: "#57534e" },
    journalist: { top: "#1d4ed8", leg: "#1f2937", hair: "#1c1917" },
    academic:   { top: "#475569", leg: "#334155", hair: "#e5e7eb" },
    student:    { top: "#15803d", leg: "#1e3a8a", hair: "#78350f" }
};
function drawCivil(ctx, en) {
    const C = CIVIL_LOOK[en.role], walking = en.dead ? true : en.lastSpeed > 0;
    ctx.save();
    ctx.translate(en.x + en.w / 2, en.y + en.h);
    ctx.scale(en.dir, 1);
    ctx.lineCap = "round";
    [0, Math.PI].forEach(ph => {
        const a = walking ? Math.sin(en.walkCycle + ph) * 0.45 : 0;
        ctx.strokeStyle = C.leg; ctx.lineWidth = 11;
        ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(Math.sin(a) * 66, -70 + Math.cos(a) * 66); ctx.stroke();
    });
    ctx.fillStyle = C.top; ctx.beginPath(); ctx.roundRect(-20, -128, 40, 64, 10); ctx.fill();
    ctx.strokeStyle = C.top; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(18, -88); ctx.stroke();
    ctx.fillStyle = "#e0ac69"; ctx.beginPath(); ctx.arc(0, -146, 17, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.hair; ctx.beginPath(); ctx.arc(-2, -152, 17, Math.PI, Math.PI * 2.05); ctx.fill();
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(8, -147, 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#7c2d12"; ctx.lineWidth = 2; ctx.beginPath();
    if (en.dead) ctx.arc(7, -134, 5, Math.PI * 1.15, Math.PI * 1.85); else ctx.arc(7, -140, 5, 0.2, Math.PI - 0.2);
    ctx.stroke();
    if (en.role === 'teacher') { ctx.fillStyle = "#1e3a8a"; ctx.fillRect(14, -98, 22, 28); ctx.fillStyle = "#fff"; ctx.fillRect(17, -94, 16, 2); }
    if (en.role === 'journalist') { ctx.fillStyle = "#111"; ctx.fillRect(18, -96, 6, 22); ctx.beginPath(); ctx.arc(21, -100, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fbbf24"; ctx.fillRect(-14, -118, 14, 10); }
    if (en.role === 'academic') { ctx.strokeStyle = "#111"; ctx.lineWidth = 2; ctx.strokeRect(3, -151, 9, 7); ctx.fillStyle = "#f5f5dc"; ctx.fillRect(14, -98, 26, 18); ctx.fillStyle = "#b91c1c"; ctx.fillRect(14, -92, 26, 3); }
    if (en.role === 'student') { ctx.fillStyle = "#b45309"; ctx.beginPath(); ctx.roundRect(-34, -124, 18, 40, 6); ctx.fill(); }
    ctx.restore();
    if (!en.dead) {
        ctx.font = "bold 15px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.lineWidth = 3; ctx.strokeStyle = "#0f172a"; const lb = t("role_" + en.role);
        ctx.strokeText(lb, en.x + en.w / 2, en.y - 12); ctx.fillStyle = "#f8fafc"; ctx.fillText(lb, en.x + en.w / 2, en.y - 12);
    }
}

// --- MİNİ TANK (5. bölüm) ---
function updateTank(en) {
    const toPlayer = (player.x + player.w / 2) - (en.x + en.w / 2);
    let speed = en.speed;
    if (!player.isDying && Math.abs(toPlayer) < 750) {
        en.dir = Math.sign(toPlayer) || en.dir;
        if (Math.abs(en.x + en.dir * speed - en.homeX) > 380 || Math.abs(toPlayer) < 200) speed = 0;
    } else {
        if (en.x - en.homeX > 250) en.dir = -1; else if (en.x - en.homeX < -250) en.dir = 1;
    }
    en.x += en.dir * speed; en.walkCycle += speed * 0.12; en.lastSpeed = speed;
    if (en.flash > 0) en.flash--;
    const near = !player.isDying && Math.abs(toPlayer) < 900, facing = Math.sign(toPlayer) === en.dir;
    if (near && facing && ++en.timer > en.interval) {
        en.timer = 0; en.flash = 8;
        projectiles.push({ type: 'bullet', shell: true, x: en.x + en.w / 2 + en.dir * 92, y: en.y + 24, vx: en.dir * 9, vy: 0, active: true, life: 150, angle: 0 });
        playGunshot((en.x + en.w / 2 - camX - width / 2) / (width / 2), 0.35);
    }
}
function drawTank(ctx, en, scale = 1) {
    ctx.save();
    ctx.translate(en.x + en.w / 2, en.y + en.h);
    ctx.scale(en.dir * scale, scale);
    const OL = "#4d5b2a", OD = "#36401c";
    // paletler
    ctx.fillStyle = "#1f2937"; ctx.beginPath(); ctx.roundRect(-78, -34, 156, 34, 16); ctx.fill();
    ctx.fillStyle = "#6b7280";
    for (let i = 0; i < 6; i++) {
        const x = -62 + i * 25;
        ctx.save(); ctx.translate(x, -17); ctx.rotate(en.walkCycle || 0);
        ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#374151"; ctx.fillRect(-2, -9, 4, 18); ctx.fillStyle = "#6b7280";
        ctx.restore();
    }
    // gövde ve kule
    ctx.fillStyle = OL; ctx.beginPath(); ctx.moveTo(-74, -34); ctx.lineTo(-64, -60); ctx.lineTo(68, -60); ctx.lineTo(80, -34); ctx.closePath(); ctx.fill();
    ctx.fillStyle = OD; ctx.fillRect(-40, -52, 20, 8); ctx.fillRect(10, -46, 26, 6);
    ctx.fillStyle = OL; ctx.beginPath(); ctx.roundRect(-34, -88, 64, 30, 10); ctx.fill();
    ctx.fillStyle = OD; ctx.fillRect(26, -78, 66, 9);
    ctx.fillStyle = "#1f2937"; ctx.fillRect(88, -80, 8, 13);
    if (en.flash > 0) {
        ctx.fillStyle = "#fde047"; ctx.beginPath();
        for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 : 16, a = i * Math.PI / 5; ctx.lineTo(104 + Math.cos(a) * r, -74 + Math.sin(a) * r); }
        ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = OD; ctx.beginPath(); ctx.arc(-6, -88, 10, Math.PI, 0); ctx.fill();
    // teslim olunca kapaktan beyaz bayrak çıkar
    if (en.dead) {
        ctx.strokeStyle = "#78350f"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, -90); ctx.lineTo(-6, -140); ctx.stroke();
        ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.moveTo(-6, -140); ctx.quadraticCurveTo(14, -134 + Math.sin(en.deathT * 0.4) * 4, 30, -138); ctx.lineTo(30, -116); ctx.quadraticCurveTo(14, -114, -6, -118); ctx.fill();
    }
    ctx.restore();
}

// --- KHK DAMGASI (7. bölüm, balyozun yerine) ---
function drawStamp(ctx, hx, hy, angle, size) {
    const L = 120;
    ctx.save();
    ctx.translate(hx, hy); ctx.scale(0.94 * size, 0.94 * size); ctx.rotate(angle);
    ctx.fillStyle = "#7c4a1e"; ctx.beginPath(); ctx.roundRect(-6, -L, 12, L + 10, 4); ctx.fill();
    ctx.fillStyle = "#5c3a1a"; ctx.beginPath(); ctx.arc(0, -L + 4, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1f2937"; ctx.fillRect(-34, -L - 30, 68, 24);
    ctx.fillStyle = "#dc2626"; ctx.fillRect(-36, -L - 38, 72, 10);
    ctx.save(); ctx.translate(0, -L - 18); ctx.rotate(Math.PI / 2);
    ctx.fillStyle = "#fecaca"; ctx.font = "bold 15px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("KHK", 0, 0);
    ctx.restore();
    ctx.fillStyle = "#e8b48f"; ctx.strokeStyle = "#7c4a2d"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -4, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
}
const stampMode = () => !!curLevel().stamp;

// --- YENİ CANAVARLAR ---
Object.assign(BOSS_TYPES, {
    // PARA SAYMA MAKİNESİ: banknot savurur, "SIFIRLA!" diye bağırıp arenada yuvarlanır
    sayac: { say: "SIFIRLAAA!", w: 190, h: 180, dw: 190, dh: 180, scale: 1, hp: 16, arena: 900, nameKey: "sayacName", stomp: 60, labelY: 40, update: updateSayac, draw: drawSayac },
    // DARBE TANKI: alev topu mermileri atar, arada hızla üstüne sürer
    darbetank: { say: "YOL KAPALI!", w: 300, h: 150, dw: 300, dh: 150, scale: 1, hp: 18, arena: 900, nameKey: "tankName", stomp: 62, labelY: 60, update: updateBigTank, draw: drawBigTank },
    // BYLOCK: dev akıllı telefon; zıplayıp şok dalgası yapar, kilit simgeleri fırlatır
    bylock: { say: "İNDİRDİN Mİ?", w: 150, h: 230, dw: 150, dh: 230, scale: 1, hp: 20, arena: 900, nameKey: "bylockName", stomp: 55, labelY: 40, update: updateBylock, draw: drawBylock },
    // FETÖ'nün son hâli: aynı saldırılar, daha çok can
    feto2: { ...BOSS_TYPES.feto, hp: 28, nameKey: "feto2Name", say: "YA ALLAH!" }
});

function bossGround(b) { return height - 60 - b.h; }

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
