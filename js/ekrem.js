// 10. bölüm: EKREM. İstanbul seçimi, iptali, tekrarı; diploma iptali ve Silivri.
// Hikâye: 31 Mart 2019'da 13 bin farkla kazanır, YSK seçimi iptal eder, 23 Haziran'da fark 800 bine çıkar;
// 2025'te diploması iptal edilir, gözaltına alınır, Silivri'deyken 15 milyon oyla aday gösterilir.
// Oyunda: 11 polis → kapı → canavar EKREM. Yenilince "YSK: SEÇİM İPTAL!" der, Ekrem "SEÇİM TEKRARI" olarak
// daha güçlü geri gelir (23 Haziran). İkinci kez yenilince diploması iptal, Silivri hücresi.
// Çizimler kodla; sesler Windows Türkçe yapay sesi (Tolga) ile üretildi.
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- METİNLER (oyun içi) ---
const EKREM_TEXT = {
    tr: { ekremName: "EKREM", ekrem2Name: "EKREM: SEÇİM TEKRARI", l9Note: "Selo içeride! Sıra İstanbul'da: Ekrem!", l9Btn: "10. BÖLÜME GEÇ",
          yskCancel: "YSK: SEÇİM İPTAL!", rerun: "SEÇİM YENİLENİYOR!", margin: "FARK: 13 BİN → 800 BİN!", diplomaVoid: "DİPLOMA İPTAL!", votes15: "15 MİLYON OY: ADAY!", cantRun: "ADAY OLAMAZ!" },
    en: { ekremName: "EKREM", ekrem2Name: "EKREM: THE RERUN", l9Note: "Selo is locked up! Next stop Istanbul: Ekrem!", l9Btn: "GO TO LEVEL 10",
          yskCancel: "ELECTION BOARD: VOID!", rerun: "ELECTION RERUN!", margin: "MARGIN: 13K → 800K!", diplomaVoid: "DIPLOMA REVOKED!", votes15: "15 MILLION VOTES: CANDIDATE!", cantRun: "HE CAN'T RUN!" },
    fr: { ekremName: "EKREM", ekrem2Name: "EKREM : LE NOUVEAU SCRUTIN", l9Note: "Selo est en prison ! Prochaine étape Istanbul : Ekrem !", l9Btn: "NIVEAU 10",
          yskCancel: "YSK : ÉLECTION ANNULÉE !", rerun: "ON REVOTE !", margin: "ÉCART : 13 000 → 800 000 !", diplomaVoid: "DIPLÔME ANNULÉ !", votes15: "15 MILLIONS DE VOIX : CANDIDAT !", cantRun: "IL NE PEUT PAS SE PRÉSENTER !" },
    nl: { ekremName: "EKREM", ekrem2Name: "EKREM: DE HERVERKIEZING", l9Note: "Selo zit vast! Volgende halte Istanbul: Ekrem!", l9Btn: "NAAR LEVEL 10",
          yskCancel: "KIESRAAD: ONGELDIG!", rerun: "NIEUWE VERKIEZING!", margin: "VERSCHIL: 13K → 800K!", diplomaVoid: "DIPLOMA INGETROKKEN!", votes15: "15 MILJOEN STEMMEN: KANDIDAAT!", cantRun: "HIJ MAG NIET MEEDOEN!" },
    de: { ekremName: "EKREM", ekrem2Name: "EKREM: DIE WIEDERHOLUNG", l9Note: "Selo sitzt! Nächster Halt Istanbul: Ekrem!", l9Btn: "ZU LEVEL 10",
          yskCancel: "WAHLRAT: UNGÜLTIG!", rerun: "WAHL WIRD WIEDERHOLT!", margin: "ABSTAND: 13.000 → 800.000!", diplomaVoid: "DIPLOM ANNULLIERT!", votes15: "15 MILLIONEN STIMMEN: KANDIDAT!", cantRun: "ER DARF NICHT ANTRETEN!" },
    ru: { ekremName: "ЭКРЕМ", ekrem2Name: "ЭКРЕМ: ПЕРЕВЫБОРЫ", l9Note: "Село за решёткой! Следующая остановка Стамбул: Экрем!", l9Btn: "НА УРОВЕНЬ 10",
          yskCancel: "ЦИК: ВЫБОРЫ ОТМЕНЕНЫ!", rerun: "ПЕРЕВЫБОРЫ!", margin: "РАЗРЫВ: 13 ТЫС. → 800 ТЫС.!", diplomaVoid: "ДИПЛОМ АННУЛИРОВАН!", votes15: "15 МИЛЛИОНОВ ГОЛОСОВ: КАНДИДАТ!", cantRun: "ЕМУ НЕЛЬЗЯ БАЛЛОТИРОВАТЬСЯ!" }
};
for (const L in EKREM_TEXT) if (LANGS[L]) Object.assign(LANGS[L], EKREM_TEXT[L]);

// --- ARKA PLAN: Saraçhane gecesi. Uzakta camiler, Bozdoğan Kemeri, İBB binası, telefon ışıklı kalabalık ---
THEMES.saracane = { sky: ["#020617", "#111a3a", "#1e1b4b", "#3b0764"], moon: { x: 0.85, y: 0.14, r: 26 }, stars: true,
                    ground: ["#57534e", "#292524"], grass: "#a8a29e", grassDark: "#57534e", curb: true };
function drawSaracaneBg(time) {
    const off = (camX * 0.05) % 2600;
    for (let k = -1; k < 2; k++) drawSelimiye(k * 2600 - off + width * 0.25, height * 0.66, 0.75, "#1e1b4b");   // tarihi yarımada siluetleri
    skyline(0.1, height * 0.68, 20, 70, "#1e1b4b", "rgba(253,230,138,0.45)", 4);
    // Bozdoğan Kemeri: iki katlı taş kemerler, alttan ışıklı
    const ab = height * 0.8, ah = 170, ap = 0.25, aoff = camX * ap;
    ctx.fillStyle = "#a16207"; ctx.fillRect(0, ab - ah, width, ah);
    const glow = ctx.createLinearGradient(0, ab - ah, 0, ab); glow.addColorStop(0, "rgba(120,53,15,0.6)"); glow.addColorStop(1, "rgba(253,186,116,0.35)");
    ctx.fillStyle = glow; ctx.fillRect(0, ab - ah, width, ah);
    ctx.fillStyle = "#1e1b4b";
    for (let x = -(aoff % 90) - 90; x < width + 90; x += 90) {
        ctx.beginPath(); ctx.moveTo(x + 14, ab); ctx.lineTo(x + 14, ab - 62); ctx.arc(x + 45, ab - 62, 31, Math.PI, 0); ctx.lineTo(x + 76, ab); ctx.fill();        // alt kemerler
        ctx.beginPath(); ctx.moveTo(x + 22, ab - 96); ctx.lineTo(x + 22, ab - 124); ctx.arc(x + 45, ab - 124, 23, Math.PI, 0); ctx.lineTo(x + 68, ab - 96); ctx.fill();   // üst kemerler
    }
    ctx.fillStyle = "#713f12"; ctx.fillRect(0, ab - ah - 6, width, 8);
    // İBB binası
    layerProps(0.4, 1700, 1, 12, (sx) => {
        const b = height * 0.9, w = 420, h = 150;
        ctx.fillStyle = "#334155"; ctx.fillRect(sx - w / 2, b - h, w, h);
        ctx.fillStyle = "#475569"; ctx.fillRect(sx - w / 2 - 10, b - h - 12, w + 20, 14);
        for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++) { ctx.fillStyle = hash(sx * 0.01 + r * 7 + c) > 0.35 ? "#fde68a" : "#1e293b"; ctx.fillRect(sx - w / 2 + 14 + c * 33, b - h + 14 + r * 30, 20, 16); }
        ctx.fillStyle = "#e30a17"; ctx.fillRect(sx - 150, b - h - 50, 300, 30);
        ctx.fillStyle = "#fff"; ctx.font = "bold 15px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("İSTANBUL BÜYÜKŞEHİR BELEDİYESİ", sx, b - h - 35);
    });
    // Kalabalık: başlar, havada telefon ışıkları, bayraklar, pankart
    const cb = height * 0.92, cp = 0.55, coff = camX * cp;
    for (let x = -(coff % 26) - 26, i = Math.floor(coff / 26); x < width + 26; x += 26, i++) {
        const j = Math.sin(time * 3 + i) * 2;
        ctx.fillStyle = i % 3 ? "#0f172a" : "#1e293b";
        ctx.beginPath(); ctx.arc(x, cb - 34 + j, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 12, cb - 26 + j, 24, 40);
        if (hash(i * 1.7) > 0.55) {   // telefon feneri
            const on = 0.6 + 0.4 * Math.sin(time * 2 + i);
            ctx.fillStyle = `rgba(255,255,255,${on})`; ctx.fillRect(x + 6, cb - 62 + j, 4, 6);
            const g = ctx.createRadialGradient(x + 8, cb - 60 + j, 1, x + 8, cb - 60 + j, 16); g.addColorStop(0, `rgba(255,255,255,${0.4 * on})`); g.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = g; ctx.fillRect(x - 8, cb - 76 + j, 32, 32);
        }
        if (hash(i * 3.1) > 0.92) {   // bayrak
            ctx.fillStyle = "#9ca3af"; ctx.fillRect(x - 1, cb - 110, 2, 80);
            ctx.fillStyle = "#e30a17"; ctx.beginPath(); ctx.moveTo(x + 1, cb - 110); ctx.quadraticCurveTo(x + 18, cb - 104 + Math.sin(time * 5 + i) * 4, x + 34, cb - 110); ctx.lineTo(x + 34, cb - 88); ctx.quadraticCurveTo(x + 18, cb - 82 + Math.sin(time * 5 + i) * 4, x + 1, cb - 88); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x + 14, cb - 99, 5, 0, Math.PI * 2); ctx.fill();
        }
        if (i % 61 === 0) {   // pankart
            ctx.fillStyle = "#fff"; ctx.fillRect(x - 10, cb - 120, 260, 34);
            ctx.fillStyle = "#b91c1c"; ctx.font = "bold 16px Arial"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("HER ŞEY ÇOK GÜZEL OLACAK", x, cb - 103);
            ctx.fillStyle = "#57534e"; ctx.fillRect(x, cb - 86, 3, 40); ctx.fillRect(x + 236, cb - 86, 3, 40);
        }
    }
    ctx.textBaseline = "alphabetic";
}

// --- CANAVAR: EKREM ---
// 1. tur: kalp atar, oy pusulası yağdırır. Yenilince YSK seçimi iptal eder → 2. tur (SEÇİM TEKRARI): daha çok can,
// ek olarak "HER ŞEY ÇOK GÜZEL OLACAK!" diye bağırıp şok dalgası yapar ve maraton koşusuyla üstüne atılır.
BOSS_TYPES.ekrem = { greet: 'ekrem_guzel', chantDelay: 2.2, say: "HER ŞEY ÇOK GÜZEL OLACAK!", w: 120, h: 215, scale: 1, hp: 16, arena: 900,
                     nameKey: "ekremName", stomp: 55, labelY: 40, update: updateEkrem, draw: drawEkrem, onDefeat: ekremRerun,
                     moves: ['heart', 'votes'] };
BOSS_TYPES.ekrem2 = { ...BOSS_TYPES.ekrem, hp: 22, nameKey: "ekrem2Name", onDefeat: null, moves: ['heart', 'votes', 'shout', 'dash'] };

function ekremRerun(b) {
    if (b.T !== BOSS_TYPES.ekrem) return false;
    b.T = BOSS_TYPES.ekrem2; b.hp = b.T.hp; b.rage = false;
    if (bossCheckpoint) bossCheckpoint.rerun = true;   // ölünce seçim tekrarından devam
    b.hurt = 150; b.state = 'walk'; b.timer = 0; b.stamp = 150;   // "İPTAL" damgası, kısa dokunulmazlık
    projectiles = projectiles.filter(p => p.type === 'bullet');
    screenFlash = 1; camShake = Math.max(camShake, 16);
    playSfx('hit', { rate: 0.35, vol: 1 });
    // Yazılar ekranın ortasında sırayla çıkar (üst üste binmesin): iptal → yenileniyor → fark
    const say = (key, col, life, fy) => createParticle(camX + width / 2, height * fy, t(key), col, life);
    say("yskCancel", "#ef4444", 1.2, 0.3);
    setTimeout(() => {
        if (!boss || boss !== b || b.dying) return;
        say("rerun", "#fde047", 1.6, 0.3);
        b.talk = Math.round(((playSfx('ekrem_guzel', { vol: 1 }) || 1.1) + 0.3) * 60);
    }, 1300);
    setTimeout(() => { if (boss === b && !b.dying) say("margin", "#4ade80", 2.2, 0.3); }, 2900);
    return true;
}

function updateEkrem(b) {
    b.y = bossGround(b);
    if (b.stamp > 0) b.stamp--;
    const dist = (player.x + player.w / 2) - (b.x + b.w / 2);
    b.look = Math.sign(dist) || b.look;
    if (b.recover > 0) b.recover--;
    if (b.state === 'walk') {
        b.dir = Math.sign(dist) || b.dir;
        if (Math.abs(dist) > 240 && b.recover <= 0) { b.x += b.dir * 1.8; b.run += 0.12; }
        if (!player.isDying && Math.abs(dist) < 1400 && b.stamp <= 0 && ++b.timer > 78) {
            b.timer = 0; b.attacks++;
            const M = b.T.moves; b.next = M[b.attacks % M.length];
            b.state = 'crouch'; b.stateT = b.next === 'dash' ? 40 : 30;
            const [txt, col] = { heart: ["♥ ♥ ♥", "#f43f5e"], votes: ["✔ EVET", "#4ade80"], shout: ["HER ŞEY...", "#fde047"], dash: ["KOŞ!", "#38bdf8"] }[b.next];
            createParticle(b.x + b.w / 2, b.y - 60, txt, col, 1.1);
            if (b.next === 'shout') b.stateT = Math.max(40, Math.round((playSfx('ekrem_guzel', { vol: 1, rate: b.rage ? 1.1 : 1 }) || 0.7) * 60));
        }
    } else if (b.state === 'crouch') {
        if (--b.stateT <= 0) {
            b.dir = Math.sign(dist) || b.dir;
            if (b.next === 'heart') heartVolley(b);
            else if (b.next === 'votes') voteRain();
            else if (b.next === 'shout') {
                createParticle(b.x + b.w / 2, b.y - 90, "...ÇOK GÜZEL OLACAK!", "#fde047", 1.4);
                const cx = b.x + b.w / 2;
                [-1, 1].forEach(d => projectiles.push({ type: 'wave', x: cx + d * 30, y: height - 60, vx: d * 8, active: true, life: 85, angle: 0 }));
                camShake = Math.max(camShake, 8); playSfx('hit', { rate: 0.5, vol: 0.8 });
                b.recover = 18;
            } else { b.state = 'dash'; b.stateT = 60; return; }
            b.state = 'walk';
        }
    } else if (b.state === 'dash') {   // maraton koşusu: üstüne zıplanarak geçilir
        b.x += b.dir * 11; b.run += 0.55;
        if (--b.stateT <= 0 || b.x <= b.homeX - b.T.arena || b.x >= b.homeX + b.T.arena) { b.state = 'walk'; b.timer = 20; }
    }
    b.x = Math.max(b.homeX - b.T.arena, Math.min(b.x, b.homeX + b.T.arena, WORLD_WIDTH - b.w));
    b.crouch += ((b.state === 'crouch' ? 1 : 0) - b.crouch) * 0.25;
}
function heartVolley(b) {
    const mx = b.x + b.w / 2, my = b.y + 50, side = Math.sign(player.x + player.w / 2 - mx) || 1;
    for (let i = 0; i < 5; i++) projectiles.push({ type: 'dollar1', skin: 'heart', x: mx, y: my, vx: side * (2.5 + i * 1.7), vy: -11 - Math.random() * 3,
                                                   active: true, life: 420, angle: 0, phase: Math.random() * 6, landed: false });
}
function voteRain() {   // gökten oy pusulaları: kalkan yukarı!
    const cx = player.x + player.w / 2;
    for (let i = 0; i < 7; i++) projectiles.push({ type: 'dollar1', skin: 'vote', x: cx - 360 + i * 120 + (Math.random() - 0.5) * 40, y: -40 - (i % 3) * 70,
                                                   vx: 0, vy: 0, active: true, life: 520, angle: 0, phase: Math.random() * 6, landed: false });
}
function drawHeartIcon(ctx, x, y, angle) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle * 0.5);
    ctx.shadowColor = "#fb7185"; ctx.shadowBlur = 12; ctx.fillStyle = "#e11d48";
    ctx.beginPath(); ctx.moveTo(0, 14); ctx.bezierCurveTo(-26, -4, -12, -22, 0, -8); ctx.bezierCurveTo(12, -22, 26, -4, 0, 14); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.arc(-7, -6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}
function drawVotePaper(ctx, x, y, angle) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle * 0.6);
    ctx.shadowColor = "#4ade80"; ctx.shadowBlur = 10;
    ctx.fillStyle = "#fefce8"; ctx.fillRect(-20, -26, 40, 52); ctx.shadowBlur = 0;
    ctx.strokeStyle = "#a8a29e"; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) ctx.strokeRect(-16, -22 + i * 16, 32, 14);
    ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, -15, 6, 0, Math.PI * 2); ctx.stroke();   // "EVET" mührü
    ctx.fillStyle = "#7c3aed"; ctx.font = "bold 5px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("EVET", 0, -15);
    ctx.restore();
}
Object.assign(DOLLAR_SKINS, { heart: drawHeartIcon, vote: drawVotePaper });

// Ekrem'in çizimi (orijin: ayakların ortası, sağa bakar). o: { walk, talk, heart, wave, angry, run }
function drawEkremFigure(ctx, o) {
    const SKIN = "#eac39f", HAIR = "#292524", GREY = "#a8a29e", SUIT = "#1e3a8a", PANTS = "#172554";
    const walk = Math.sin(o.walk || 0), hipY = -92, shY = -160;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    [-1, 1].forEach(k => {   // uzun bacaklar
        const fx = k * 14 + walk * k * (o.run ? 26 : 15);
        ctx.strokeStyle = k < 0 ? "#0f1a40" : PANTS; ctx.lineWidth = 19;
        ctx.beginPath(); ctx.moveTo(k * 12, hipY); ctx.lineTo(k * 10 + walk * k * 8, hipY / 2); ctx.lineTo(fx, -10); ctx.stroke();
        ctx.fillStyle = "#0b0b0b"; ctx.beginPath(); ctx.ellipse(fx + 8, -6, 18, 8, 0, 0, Math.PI * 2); ctx.fill();
    });
    // kollar: kalp yaparken iki el başın üstünde birleşir; el sallarken biri havada
    const arm = (side, tx, ty) => {
        ctx.strokeStyle = side < 0 ? "#172554" : SUIT; ctx.lineWidth = 15;
        ctx.beginPath(); ctx.moveTo(side * 26, shY + 8); ctx.lineTo((side * 26 + tx) / 2 + side * 10, (shY + 8 + ty) / 2); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(tx, ty, 7, 0, Math.PI * 2); ctx.fill();
    };
    const sw = o.run ? walk * 30 : walk * 10;
    if (o.heart) { arm(-1, -6, shY - 74); arm(1, 10, shY - 74); }
    else if (o.wave) { arm(-1, -30 - sw / 3, shY + 70); arm(1, 44, shY - 60 + Math.sin(performance.now() / 110) * 8); }
    else arm(-1, -30 - sw, shY + 70);
    // gövde: lacivert takım, beyaz gömlek, kırmızı kravat
    ctx.fillStyle = SUIT;
    ctx.beginPath(); ctx.moveTo(-30, shY); ctx.quadraticCurveTo(0, shY - 10, 30, shY); ctx.lineTo(26, hipY + 6); ctx.lineTo(-26, hipY + 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.moveTo(-9, shY - 4); ctx.lineTo(9, shY - 4); ctx.lineTo(0, shY + 26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#b91c1c"; ctx.beginPath(); ctx.moveTo(-3, shY); ctx.lineTo(3, shY); ctx.lineTo(4, shY + 34); ctx.lineTo(0, shY + 40); ctx.lineTo(-4, shY + 34); ctx.closePath(); ctx.fill();
    // kafa: uzun yüz, geriye taranmış koyu saç, şakaklar kır, geniş gülümseme
    ctx.fillStyle = SKIN; ctx.fillRect(-8, shY - 14, 16, 14);
    ctx.save(); ctx.translate(2, shY - 42);
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(0, 0, 23, 31, 0, 0, Math.PI * 2); ctx.fill();
    [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(s * 23, 2, 5, 9, 0, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = HAIR; ctx.beginPath(); ctx.ellipse(0, -20, 25, 14, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-25, -22, 50, 6);
    ctx.fillStyle = GREY; [-1, 1].forEach(s => ctx.fillRect(s > 0 ? 19 : -25, -18, 6, 14));
    [-1, 1].forEach(s => {
        ctx.save(); ctx.translate(s * 10, -8); ctx.rotate(s * (o.angry ? 0.25 : -0.05)); ctx.fillStyle = HAIR; ctx.fillRect(-7, -2, 14, 3); ctx.restore();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(s * 10, 0, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#3f2a1d"; ctx.beginPath(); ctx.arc(s * 10 + 1.5, 0.5, 2.3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(1, 2); ctx.lineTo(4, 13); ctx.lineTo(0, 14); ctx.stroke();
    const m = o.talk || 0;
    ctx.fillStyle = "#7f1d1d"; ctx.beginPath(); ctx.ellipse(0, 20, 12, 4 + m * 6, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillRect(-9, 20, 18, 3);
    ctx.restore();
    if (!o.heart && !o.wave) arm(1, 32 + sw, shY + 68);
    if (o.heart) {   // başının üstünde kalp
        ctx.fillStyle = "rgba(244,63,94,0.85)"; ctx.beginPath(); ctx.moveTo(2, shY - 62); ctx.bezierCurveTo(-22, shY - 80, -10, shY - 100, 2, shY - 86); ctx.bezierCurveTo(14, shY - 100, 26, shY - 80, 2, shY - 62); ctx.fill();
    }
}
function drawEkrem(ctx, b) {
    if (b.dying) return;   // yerine hücredeki Ekrem çizilir
    const talk = b.talk > 0 ? Math.abs(Math.sin(b.anim * 0.45)) : 0;
    ctx.save();
    bossBaseTransform(ctx, b);
    ctx.scale(b.look, 1);
    if (b.T === BOSS_TYPES.ekrem2) ctx.scale(1.12, 1.12);   // seçim tekrarında daha büyük
    drawEkremFigure(ctx, { walk: b.run, run: b.state === 'dash', angry: b.rage,
                           talk: Math.max(talk, b.next === 'shout' && b.state === 'crouch' ? 1 : 0),
                           heart: b.next === 'heart' && b.state === 'crouch', wave: b.next === 'votes' && b.state === 'crouch' });
    ctx.restore();
    if (b.stamp > 0) {   // YSK'nın kırmızı "İPTAL" damgası
        const a = Math.min(1, b.stamp / 40), s = 1 + Math.max(0, (b.stamp - 130) / 20);
        ctx.save(); ctx.translate(b.x + b.w / 2, b.y + b.h * 0.45); ctx.rotate(-0.25); ctx.scale(s, s);
        ctx.globalAlpha = a; ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 7; ctx.strokeRect(-95, -32, 190, 64);
        ctx.fillStyle = "#dc2626"; ctx.font = "bold 46px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("İPTAL", 0, 2);
        ctx.restore(); ctx.globalAlpha = 1; ctx.textBaseline = "alphabetic";
    }
}
// Silivri hücresi: önce diploma iptal, sonra parmaklık; içeriden el sallar, 15 milyon oyla aday olur
JAILS.ekrem = {
    sign: "SİLİVRİ", voice: 'ekrem_guzel',
    figure: (ctx, c) => drawEkremFigure(ctx, { walk: 0, talk: cellTalk(c), wave: c.t > 24 && c.t % 160 < 100 }),
    events: { 1: (c, gy) => createParticle(c.x, gy - CELL_H - 10, t("diplomaVoid"), "#ef4444", 2.0),
              80: (c, gy) => createParticle(c.x, gy - CELL_H - 40, t("votes15"), "#4ade80", 2.4),
              170: () => createParticle(player.x + player.w / 2, player.y - 40, t("cantRun"), "#ef4444", 2.2) },
    tick: (c, gy) => { if (c.t > 40 && c.t % 45 === 0) createParticle(c.x + 20, gy - 170, "♥", "#f43f5e", 1.4); }
};

// --- HİKÂYE ---
Object.assign(PIX_FACES, {
    ekrem: { pal: { h: '#292524', g: '#a8a29e', s: '#eac39f', e: '#3f2a1d', k: '#44403c', w: '#fff', m: '#7f1d1d' },
             rows: ['.hhhhhh.', 'ghhhhhhg', 'gssssssg', 'skksskks', 'sesssess', 'ssssssss', 'smwwwwms', '.ssmmss.'] }
});
Object.assign(STORY_CAST, {
    ekrem: { pix: 'ekrem', suit: '#1e3a8a', arm: '#1e3a8a', leg: '#172554', shoe: '#000', hand: '#eac39f', tie: '#b91c1c' }
});
Object.assign(STORY_BG, {
    // Saraçhane: Bozdoğan Kemeri önünde telefon ışıklı kalabalık
    saracane(c, time) {
        storySky(c, ['#020617', '#0b1026', '#1e1b4b', '#3b0764']);
        blockStars(c, time); blockMoon(c, 820, 40);
        c.fillStyle = '#a16207'; c.fillRect(0, 170, STORY_W, 150);
        c.fillStyle = '#1e1b4b';
        for (let x = 0; x < STORY_W; x += 96) { c.fillRect(x + 16, 236, 64, 84); c.fillRect(x + 26, 186, 44, 36); }
        blockRect(c, 280, 70, 400, 56, '#fff');
        c.fillStyle = '#b91c1c'; c.font = 'bold 26px monospace'; c.textAlign = 'center'; c.fillText('HER ŞEY ÇOK GÜZEL OLACAK', 480, 108);
        for (let i = 0; i < 26; i++) {
            const x = i * 38 + (i % 2) * 8, j = Math.abs(Math.sin(time * 4 + i)) * 8;
            c.fillStyle = ['#0f172a', '#1e293b', '#312e81'][i % 3]; c.fillRect(x, STORY_GROUND - 64 - j, 30, 64 + j);
            c.fillStyle = '#e0ac69'; c.fillRect(x + 5, STORY_GROUND - 84 - j, 20, 20);
            if (i % 3 === 0) { c.fillStyle = '#fff'; c.fillRect(x + 22, STORY_GROUND - 116 - j, 6, 10); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x + 12, STORY_GROUND - 132 - j, 26, 26); }
            if (i % 7 === 3) { c.fillStyle = '#e30a17'; c.fillRect(x + 10, STORY_GROUND - 150 - j, 34, 22); c.fillStyle = '#fff'; c.fillRect(x + 18, STORY_GROUND - 143 - j, 8, 8); c.fillStyle = '#9ca3af'; c.fillRect(x + 8, STORY_GROUND - 150 - j, 3, 60); }
        }
        storyGround(c, '#57534e', '#44403c');
    },
    // Silivri cezaevi (Edirne çiziminin üstüne kendi tabelası)
    silivri(c, time) {
        STORY_BG.prison(c, time);
        blockRect(c, 150, 180, 240, 44, '#7f1d1d');
        c.fillStyle = '#fff'; c.font = 'bold 22px monospace'; c.textAlign = 'center'; c.fillText('SİLİVRİ', 270, 210);
    }
});
Object.assign(STORY_PROPS, {
    iptal(c, time) {   // YSK'nın dev "İPTAL" damgası iner
        const p = (time * 0.9) % 1, drop = p < 0.25 ? p / 0.25 : 1;
        c.save(); c.translate(480, 150 + drop * 110); c.rotate(-0.2);
        c.globalAlpha = p < 0.25 ? 0.6 : 1; c.strokeStyle = '#dc2626'; c.lineWidth = 10; c.strokeRect(-150, -46, 300, 92);
        c.fillStyle = '#dc2626'; c.font = 'bold 64px monospace'; c.textAlign = 'center'; c.fillText('İPTAL', 0, 22);
        c.restore(); c.globalAlpha = 1;
    },
    diploma(c) {   // üstü çizili diploma
        blockRect(c, 360, 230, 240, 160, '#fefce8');
        c.fillStyle = '#92400e'; c.font = 'bold 22px monospace'; c.textAlign = 'center'; c.fillText('DİPLOMA', 480, 270);
        c.fillStyle = '#a8a29e'; for (let i = 0; i < 4; i++) c.fillRect(390, 290 + i * 18, 180, 4);
        c.strokeStyle = '#dc2626'; c.lineWidth = 10; c.beginPath(); c.moveTo(370, 240); c.lineTo(590, 380); c.moveTo(590, 240); c.lineTo(370, 380); c.stroke();
    }
});
STORIES[10] = [
    { bg: 'saracane', say: { key: 's10a' }, actors: [{ who: 'ekrem', x: 480, dir: 1, wave: true }] },
    { bg: 'saracane', say: { who: 'ekrem', key: 's10b' }, actors: [{ who: 'ekrem', x: 480, dir: 1, talk: true, jump: true }] },
    { bg: 'palace', props: ['iptal'], say: { who: 'recep', key: 's10c' }, actors: [{ who: 'recep', x: 260, dir: 1, talk: true, jump: true }] },
    { bg: 'saracane', say: { key: 's10d' }, actors: [{ who: 'ekrem', x: 480, dir: 1, jump: true, wave: true }] },
    { bg: 'palace', props: ['diploma'], say: { who: 'recep', key: 's10e' }, actors: [{ who: 'recep', x: 200, dir: 1, talk: true }] },
    { bg: 'silivri', props: ['bars'], say: { who: 'ekrem', key: 's10f' }, actors: [{ who: 'ekrem', x: 690, dir: -1, talk: true, wave: true }] },
    { bg: 'card', card: { title: 'm10t', text: 'm10' } }
];
// Oyun sonu: Selo ile Ekrem aynı parmaklığın ardından el sallar
STORIES.end[0] = { bg: 'prison', props: ['bars'], say: { key: 'e1' },
                   actors: [{ who: 'recep', x: 240, dir: 1, wave: true }, { who: 'selo', x: 620, dir: -1, wave: true }, { who: 'ekrem', x: 800, dir: -1, wave: true }] };
Object.assign(STORY_VOICES, { s10b: 'ekrem_guzel', s10f: 'ekrem_aday' });

const EKREM_STORY = {
    tr: { ekrem: 'EKREM',
          s10a: '31 Mart 2019, İstanbul. Ekrem seçimi 13 bin oy farkla kazandı!',
          s10b: 'Her şey çok güzel olacak!',
          s10c: 'Olmaz! Seçimi iptal edin, yeniden yapılsın!',
          s10d: '23 Haziran 2019. Seçim yenilendi... ve fark 13 binden 800 bine çıktı!',
          s10e: 'Diplomasını iptal edin! Sonra da doğru Silivri\'ye!',
          s10f: '15 milyon oyla aday seçildim. Her şey çok güzel olacak!',
          m10t: 'GÖREV 10: SEÇİMİ İPTAL ET', m10: 'Saraçhane\'de polisleri geç, EKREM\'i yen... ama seçim tekrarlanacak, onu iki kez yenmen lazım! Gökten oy pusulası yağıyor: kalkanı kaldır!',
          e1: 'FETÖ yenildi; Selo da Ekrem de içeride... ama iade dosyası da AİHM kararı da hâlâ yolda.' },
    en: { ekrem: 'EKREM',
          s10a: 'March 31, 2019, Istanbul. Ekrem won the election by 13 thousand votes!',
          s10b: 'Everything is going to be great!',
          s10c: 'No way! Cancel the election, do it again!',
          s10d: 'June 23, 2019. The election was rerun... and the margin went from 13 thousand to 800 thousand!',
          s10e: 'Revoke his diploma! Then straight to Silivri!',
          s10f: '15 million votes made me the candidate. Everything is going to be great!',
          m10t: 'MISSION 10: CANCEL THE ELECTION', m10: 'Get past the police at Saraçhane and beat EKREM... but the election gets rerun, so you have to beat him twice! Ballots rain from the sky: raise your shield!',
          e1: 'FETÖ is beaten; Selo and Ekrem are both behind bars... but the extradition file and the ECHR ruling are still on their way.' },
    fr: { ekrem: 'EKREM',
          s10a: '31 mars 2019, Istanbul. Ekrem remporte l\'élection avec 13 000 voix d\'avance !',
          s10b: 'Tout va très bien se passer !',
          s10c: 'Hors de question ! Annulez l\'élection, on revote !',
          s10d: '23 juin 2019. On a revoté... et l\'écart est passé de 13 000 à 800 000 voix !',
          s10e: 'Annulez son diplôme ! Puis direct à Silivri !',
          s10f: '15 millions de voix m\'ont fait candidat. Tout va très bien se passer !',
          m10t: 'MISSION 10 : ANNULE L\'ÉLECTION', m10: 'Passe la police à Saraçhane et bats EKREM... mais l\'élection sera refaite, il faut le battre deux fois ! Des bulletins tombent du ciel : lève ton bouclier !',
          e1: 'FETÖ est battu ; Selo et Ekrem sont en prison... mais l\'extradition et l\'arrêt de la CEDH sont toujours en route.' },
    nl: { ekrem: 'EKREM',
          s10a: '31 maart 2019, Istanbul. Ekrem wint de verkiezing met 13 duizend stemmen verschil!',
          s10b: 'Alles komt helemaal goed!',
          s10c: 'Geen sprake van! Verkiezing ongeldig, opnieuw doen!',
          s10d: '23 juni 2019. De verkiezing werd overgedaan... en het verschil ging van 13 duizend naar 800 duizend!',
          s10e: 'Trek zijn diploma in! En dan meteen naar Silivri!',
          s10f: '15 miljoen stemmen maakten mij kandidaat. Alles komt helemaal goed!',
          m10t: 'MISSIE 10: VERKIEZING ONGELDIG', m10: 'Kom langs de politie bij Saraçhane en versla EKREM... maar de verkiezing wordt overgedaan, dus je moet hem twee keer verslaan! Stembiljetten regenen uit de lucht: schild omhoog!',
          e1: 'FETÖ is verslagen; Selo en Ekrem zitten allebei vast... maar het uitleveringsdossier en de EHRM-uitspraak zijn nog onderweg.' },
    de: { ekrem: 'EKREM',
          s10a: '31. März 2019, Istanbul. Ekrem gewinnt die Wahl mit 13.000 Stimmen Vorsprung!',
          s10b: 'Alles wird sehr schön werden!',
          s10c: 'Kommt nicht in Frage! Wahl annullieren, nochmal wählen!',
          s10d: '23. Juni 2019. Die Wahl wurde wiederholt... und der Vorsprung stieg von 13.000 auf 800.000!',
          s10e: 'Annulliert sein Diplom! Und dann ab nach Silivri!',
          s10f: '15 Millionen Stimmen haben mich zum Kandidaten gemacht. Alles wird sehr schön werden!',
          m10t: 'MISSION 10: ANNULLIER DIE WAHL', m10: 'Komm an der Polizei in Saraçhane vorbei und besiege EKREM... aber die Wahl wird wiederholt, du musst ihn zweimal besiegen! Stimmzettel regnen vom Himmel: Schild hoch!',
          e1: 'FETÖ ist besiegt; Selo und Ekrem sitzen beide... aber die Auslieferungsakte und das EGMR-Urteil sind noch unterwegs.' },
    ru: { ekrem: 'ЭКРЕМ',
          s10a: '31 марта 2019 года, Стамбул. Экрем выиграл выборы с перевесом в 13 тысяч голосов!',
          s10b: 'Всё будет очень хорошо!',
          s10c: 'Ни за что! Отменить выборы, переголосовать!',
          s10d: '23 июня 2019 года. Выборы провели заново... и разрыв вырос с 13 тысяч до 800 тысяч!',
          s10e: 'Аннулировать его диплом! А потом прямо в Силиври!',
          s10f: '15 миллионов голосов сделали меня кандидатом. Всё будет очень хорошо!',
          m10t: 'МИССИЯ 10: ОТМЕНИ ВЫБОРЫ', m10: 'Пройди полицию на Сарачхане и победи ЭКРЕМА... но выборы переиграют, придётся победить его дважды! С неба сыплются бюллетени: подними щит!',
          e1: 'ФЕТÖ побеждён; Село и Экрем оба за решёткой... но запрос об экстрадиции и решение ЕСПЧ всё ещё в пути.' }
};
for (const L in EKREM_STORY) if (STORY_TEXT[L]) Object.assign(STORY_TEXT[L], EKREM_STORY[L]);

// --- HABERLER (arka plan TV'leri ve gazeteleri, js/newsbg.js) ---
Object.assign(NEWS_SCENES, {
    ysk_iptal(x, y, w, h) {   // YSK salonu, kırmızı İPTAL
        ctx.fillStyle = "#7f1d1d"; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#451a03"; ctx.fillRect(x + w * 0.1, y + h * 0.55, w * 0.8, h * 0.2);
        for (let i = 0; i < 5; i++) person(x + w * (0.2 + i * 0.15), y + h * 0.6, 0.6, "#111827");
        ctx.save(); ctx.translate(x + w / 2, y + h * 0.3); ctx.rotate(-0.15);
        ctx.strokeStyle = "#fecaca"; ctx.lineWidth = 4; ctx.strokeRect(-60, -18, 120, 36);
        ctx.fillStyle = "#fecaca"; ctx.font = "bold 24px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("İPTAL", 0, 1); ctx.restore();
    },
    margin(x, y, w, h) {   // seçim sonucu çubukları
        ctx.fillStyle = "#f1f5f9"; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#dc2626"; ctx.fillRect(x + w * 0.2, y + h * 0.2, w * 0.25, h * 0.7);
        ctx.fillStyle = "#f59e0b"; ctx.fillRect(x + w * 0.55, y + h * 0.42, w * 0.25, h * 0.48);
        ctx.fillStyle = "#111827"; ctx.font = "bold 16px Arial"; ctx.textAlign = "center"; ctx.fillText("%54", x + w * 0.325, y + h * 0.16); ctx.fillText("%45", x + w * 0.675, y + h * 0.38);
    },
    diploma(x, y, w, h) {
        ctx.fillStyle = "#292524"; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#fefce8"; ctx.fillRect(x + w * 0.2, y + h * 0.15, w * 0.6, h * 0.7);
        ctx.fillStyle = "#92400e"; ctx.font = "bold 14px Georgia"; ctx.textAlign = "center"; ctx.fillText("DİPLOMA", x + w / 2, y + h * 0.32);
        ctx.fillStyle = "#a8a29e"; for (let i = 0; i < 3; i++) ctx.fillRect(x + w * 0.28, y + h * (0.42 + i * 0.12), w * 0.44, 3);
        ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + w * 0.22, y + h * 0.18); ctx.lineTo(x + w * 0.78, y + h * 0.82); ctx.moveTo(x + w * 0.78, y + h * 0.18); ctx.lineTo(x + w * 0.22, y + h * 0.82); ctx.stroke();
    },
    saracane(x, y, w, h, t) {   // Saraçhane: kemer önünde telefon ışıkları
        nightSky(x, y, w, h, "#020617", "#1e1b4b");
        ctx.fillStyle = "#a16207"; ctx.fillRect(x, y + h * 0.3, w, h * 0.35);
        ctx.fillStyle = "#1e1b4b"; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(x + 25 + i * 52, y + h * 0.62, 16, Math.PI, 0); ctx.fill(); ctx.fillRect(x + 9 + i * 52, y + h * 0.62, 32, h * 0.05); }
        for (let i = 0; i < 40; i++) { const on = Math.sin(t * 3 + i * 1.7) > -0.3; ctx.fillStyle = on ? "#fff" : "#94a3b8"; ctx.fillRect(x + (i * 37) % w, y + h * 0.7 + ((i * 13) % 30), 3, 4); }
        ctx.fillStyle = "#0f172a"; ctx.fillRect(x, y + h * 0.85, w, h * 0.15);
    }
});
NEWS[10] = [
    { type: 'tv', head: "YSK İSTANBUL SEÇİMİNİ İPTAL ETTİ", scene: 'ysk_iptal' },
    { type: 'paper', date: "24 HAZİRAN 2019", head: "FARK 800 BİNE ÇIKTI", scene: 'margin' },
    { type: 'tv', head: "EKREM'İN DİPLOMASI İPTAL EDİLDİ", scene: 'diploma' },
    { type: 'paper', date: "MART 2025", head: "SARAÇHANE'DE DEV MİTİNG", scene: 'saracane' },
    { type: 'tv', head: "SİLİVRİ'DEN ADAY: 15 MİLYON OY", scene: 'candidate' }
];
