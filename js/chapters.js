// 3-8. bölümlerin özel içerikleri: arka planlar, yeni düşmanlar, bölüme özel mekanikler, yeni canavarlar
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)
//
// 3 SIFIRLA      : torbalar yerine ses kasetleri ("MONTAJ!"), canavar PARA SAYMA MAKİNESİ
// 4 SANDIK       : rüşvet verilen polis ölmez, bavuluyla sürgüne gider; canavar FETÖ
// 5 FACETIME     : telefonun şarjı azalır, şarj aletleri toplanır; mini tanklar; canavar DARBE TANKI
// 6 UÇUŞ         : flight.js
// 7 OHAL         : balyoz yerine KHK damgası; sivilleri de ihraç eder; canavar BYLOCK
// 8 PENSİLVANYA  : karlı çiftlik; canavar FETÖ'nün son hâli

//
// Arka planlar: chapter_bg.js, canavarlar: boss_sayac.js, boss_darbetank.js, boss_bylock.js

const curLevel = () => LEVELS[currentLevel];

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
