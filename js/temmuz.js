// 4. bölüm: 15 TEMMUZ. Düşmanlar polis değil darbeci askerler (aralarında askeri öğrenciler var);
// yenilen asker silahını bırakır, elleri arkadan kelepçelenir ve tutuklanıp götürülür.
// Arka plan: gece Boğaz Köprüsü'nde tanklar, alçak uçan F-16'lar, sela okunan camiler, bayraklı kalabalık.
// Canavar FETÖ (js/boss_feto.js): karşılaşınca HIRHIZ'ın başında balon çıkar ("Hocam gel bu hasret bitsin", sfx/hasret.mp3), sonra kapışma.
// FETÖ yenilince HIRHIZ "Bir savcı 2 polisle hepinizi bitiririm!" der (sfx/savci.mp3, Windows Türkçe yapay sesi Tolga),
// ardından teyzeler yerine resimler/sonpeygamber.png'deki adam yumruğunu sallayarak kutlamaya gelir (sfx/sonpeygamber.mp3).
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- METİNLER (oyun içi) ---
const TEMMUZ_TEXT = {
    tr: { hashasiSay: "Bunlar haşhaşi! Bunlar sülük!", graveSay: "FETÖ öldü ve mezara girdi!", lutufSay: "15 Temmuz Allah'ın bir lütfü!", arrestCry: "TUTUKLANDI!", cadet: "ASKERİ ÖĞRENCİ", hasretSay: "Hocam gel, bu hasret bitsin!", savciSay: "Bir savcı 2 polisle hepinizi bitiririm!",
          peygamberSay: "Eğer son peygamber Hz. Muhammet olmasaydı..." },
    en: { hashasiSay: "They're assassins! They're leeches!", graveSay: "FETÖ died and went into the grave!", lutufSay: "July 15 is a gift from God!", arrestCry: "ARRESTED!", cadet: "MILITARY CADET", hasretSay: "Come, my master, let this longing end!", savciSay: "One prosecutor and 2 cops, I'll finish you all!",
          peygamberSay: "If the last prophet weren't Muhammad..." },
    fr: { hashasiSay: "Ce sont des haschischins ! Des sangsues !", graveSay: "FETÖ est mort et entré dans la tombe !", lutufSay: "Le 15 juillet est un don de Dieu !", arrestCry: "ARRÊTÉ !", cadet: "ÉLÈVE OFFICIER", hasretSay: "Viens, mon maître, que cette nostalgie cesse !", savciSay: "Un procureur et 2 flics, et je vous finis tous !",
          peygamberSay: "Si le dernier prophète n'était pas Mahomet..." },
    nl: { hashasiSay: "Het zijn assassijnen! Het zijn bloedzuigers!", graveSay: "FETÖ is dood en ging het graf in!", lutufSay: "15 juli is een geschenk van God!", arrestCry: "GEARRESTEERD!", cadet: "MILITAIRE CADET", hasretSay: "Kom, meester, laat dit verlangen eindigen!", savciSay: "Eén aanklager en 2 agenten, en ik maak jullie allemaal af!",
          peygamberSay: "Als de laatste profeet niet Mohammed was..." },
    de: { hashasiSay: "Das sind Assassinen! Das sind Blutegel!", graveSay: "FETÖ ist tot und liegt im Grab!", lutufSay: "Der 15. Juli ist ein Geschenk Gottes!", arrestCry: "VERHAFTET!", cadet: "MILITÄRKADETT", hasretSay: "Komm, mein Meister, beenden wir die Sehnsucht!", savciSay: "Ein Staatsanwalt und 2 Polizisten, und ich erledige euch alle!",
          peygamberSay: "Wäre der letzte Prophet nicht Mohammed..." },
    ru: { hashasiSay: "Это ассасины! Это пиявки!", graveSay: "ФЕТÖ умер и лёг в могилу!", lutufSay: "15 июля — это дар Божий!", arrestCry: "АРЕСТОВАН!", cadet: "КУРСАНТ", hasretSay: "Ходжа, приди, пусть кончится разлука!", savciSay: "Один прокурор и 2 полицейских — и вам всем конец!",
          peygamberSay: "Если бы последним пророком не был Мухаммед..." }
};
for (const L in TEMMUZ_TEXT) if (LANGS[L]) Object.assign(LANGS[L], TEMMUZ_TEXT[L]);

// --- DARBECİ ASKERLER ---
// Kamuflajlı, miğferli, G3 tüfekli asker. Koordinat: ayakların ortası, sağa bakar (polis çizimiyle aynı 128 birimlik ızgara).
// en.cadet: askeri öğrenci (genç, bıyıksız, bereli, başının üstünde adı yazar). Ölünce (en.dead) tutuklanır: silahsız, eller arkada kelepçeli.
const ARMY_LEGS = { photoH: 1, ratio: 0.36, width: 14, swing: 0.6, front: "#4d5b2a", back: "#3a4520", shoe: "#1c1917" };
const CAMO = ["#36401c", "#6b7a3a", "#2b2f1a", "#7c6a46"];
function camoPatch(ctx, x, y, w, h, seed) {
    ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.clip();
    for (let i = 0; i < 14; i++) {
        ctx.fillStyle = CAMO[i % CAMO.length];
        ctx.beginPath(); ctx.ellipse(x + hash(seed + i * 1.7) * w, y + hash(seed + i * 2.9) * h, 6 + hash(seed + i) * 8, 3 + hash(seed + i * 3.3) * 4, hash(seed * 2 + i) * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}
function drawSoldier(ctx, en, o = {}) {
    const h = en.h < 150 ? 200 : en.h;   // keskin nişancı tutuklanınca ayağa kalkar
    const moving = en.lastSpeed > 0, arrested = en.dead, cadet = en.cadet;
    ctx.save();
    ctx.translate(en.x + en.w / 2, en.y + en.h);
    if (en.dir === -1) ctx.scale(-1, 1);
    const legs = drawLegs(ctx, 0, -h, h, 1, en.walkCycle, moving, false, ARMY_LEGS);
    const s = h * (1 - ARMY_LEGS.ratio) / 128;
    ctx.translate(0, -h + legs.drop);
    ctx.scale(s, s);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    const SKIN = "#e8b48f", swing = moving ? Math.sin(en.walkCycle) * 0.5 : 0.1;

    // Arka kol (tutuklanınca arkada, bileğinde kelepçe)
    ctx.save(); ctx.translate(-12, 56); ctx.rotate(arrested ? 0.55 : -swing);
    ctx.strokeStyle = "#3a4520"; ctx.lineWidth = 13;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 44); ctx.stroke();
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 48, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Gövde: kamuflaj ceket, göğüs cepleri, omuzda bayrak, kemer
    ctx.fillStyle = "#4d5b2a"; ctx.beginPath(); ctx.roundRect(-27, 50, 54, 72, 10); ctx.fill();
    camoPatch(ctx, -27, 50, 54, 72, en.homeX * 0.01);
    ctx.strokeStyle = "#1a1f0d"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect(-27, 50, 54, 72, 10); ctx.stroke();
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(-20, 66, 16, 12); ctx.fillRect(6, 66, 16, 12);
    ctx.fillStyle = "#e30a17"; ctx.fillRect(-25, 56, 13, 9);
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-20.5, 60.5, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e30a17"; ctx.beginPath(); ctx.arc(-19.6, 60.5, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1c1917"; ctx.fillRect(-27, 110, 54, 9);
    ctx.fillStyle = "#3f3f1a"; ctx.fillRect(-22, 104, 12, 12); ctx.fillRect(10, 104, 12, 12);   // fişeklik

    // Kafa
    ctx.fillStyle = SKIN; ctx.strokeStyle = "#7c4a24"; ctx.lineWidth = 2;
    ctx.fillRect(-6, 40, 12, 12);
    ctx.beginPath(); ctx.ellipse(2, 28, 18, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(11, 26, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#111"; ctx.lineWidth = 2.5; ctx.beginPath();
    if (arrested) { ctx.moveTo(5, 22); ctx.lineTo(16, 19); } else { ctx.moveTo(5, 19); ctx.lineTo(16, 22); }   // tutuklanınca kaşlar düşer
    ctx.stroke();
    if (!cadet) { ctx.fillStyle = "#3f2a1d"; ctx.beginPath(); ctx.ellipse(12, 37, 9, 3.5, 0.1, 0, Math.PI * 2); ctx.fill(); }
    if (arrested) { ctx.strokeStyle = "#7c2d12"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(11, 44, 5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    if (cadet) {   // askeri öğrenci: bordo bere
        ctx.fillStyle = "#7f1d1d"; ctx.beginPath(); ctx.ellipse(-1, 12, 21, 9, -0.15, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(12, 13, 3, 0, Math.PI * 2); ctx.fill();
    } else {       // miğfer ve çene kayışı
        ctx.fillStyle = "#4d5b2a"; ctx.beginPath(); ctx.ellipse(1, 18, 23, 19, 0, Math.PI, 0); ctx.fill();
        ctx.fillRect(-23, 16, 47, 6);
        ctx.fillStyle = "#36401c"; ctx.beginPath(); ctx.ellipse(-6, 8, 6, 3, 0.4, 0, Math.PI * 2); ctx.ellipse(10, 4, 5, 2.5, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#1c1917"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-14, 22); ctx.quadraticCurveTo(-2, 46, 14, 36); ctx.stroke();
    }
    if (en.kind === 'gas' && !arrested) {   // gaz maskesi
        ctx.fillStyle = "#374151"; ctx.strokeStyle = "#111827"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(-6, 18, 26, 24, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#a5f3fc"; ctx.beginPath(); ctx.arc(12, 25, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#4b5563"; ctx.beginPath(); ctx.arc(18, 37, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }

    // Ön kol
    if (arrested) {   // eller arkada, kelepçeli
        ctx.save(); ctx.translate(-12, 56); ctx.rotate(0.45);
        ctx.strokeStyle = "#4d5b2a"; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 44); ctx.stroke();
        ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 48, 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(-34, 92, 6, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(-37, 99, 6, 0, Math.PI * 2); ctx.stroke();
    } else if (o.shield) {   // kalkanlı asker: koyu yeşil balistik kalkan
        const bob = moving ? Math.sin(en.walkCycle * 2) * 2 : 0;
        ctx.strokeStyle = "#4d5b2a"; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(10, 58); ctx.lineTo(26, 84); ctx.stroke();
        ctx.fillStyle = "#283618"; ctx.strokeStyle = "#111"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(16, 22 + bob, 38, 118, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "rgba(148,163,184,0.7)"; ctx.fillRect(24, 34 + bob, 22, 8);   // görüş camı
        ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(22, 50 + bob); ctx.lineTo(22, 120 + bob); ctx.stroke();
        ctx.fillStyle = "#e30a17"; ctx.fillRect(28, 70 + bob, 14, 9);
    } else if (en.kind === 'gas') {   // gaz bombası atar
        ctx.save(); ctx.translate(-12, 56); ctx.rotate(-1.2 - (en.flash > 0 ? 0.3 : 0));
        ctx.strokeStyle = "#4d5b2a"; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 40); ctx.stroke();
        ctx.fillStyle = "#1c1917"; ctx.fillRect(-9, 30, 18, 46); ctx.fillStyle = "#3f6212"; ctx.fillRect(-7, 74, 14, 5);
        if (en.flash > 0) { ctx.fillStyle = "rgba(190,242,100,0.7)"; ctx.beginPath(); ctx.arc(0, 86, 12, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 44, 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    } else {          // G3 tüfeği: yürürken namlu aşağıda, oyuncu yakınsa nişan alır
        const aim = en.aim || 0;
        ctx.save(); ctx.translate(-12, 56); ctx.rotate(-(swing * 0.3 + 0.5) * (1 - aim) - Math.PI / 2 * aim);
        ctx.strokeStyle = "#4d5b2a"; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 40); ctx.stroke();
        ctx.fillStyle = "#1c1917";
        ctx.fillRect(-4, 4, 9, 70);                         // gövde
        ctx.fillRect(-2, 74, 4, 14);                        // namlu
        ctx.fillStyle = "#3f2a1d"; ctx.fillRect(-5, -14, 11, 22);   // dipçik
        ctx.fillStyle = "#1c1917"; ctx.fillRect(4, 34, 12, 7);      // şarjör (yana)
        ctx.fillRect(-9, 50, 6, 12);                        // tutamak
        if (en.flash > 0) {
            ctx.fillStyle = "#fde047"; ctx.beginPath();
            for (let i = 0; i < 10; i++) { const r = i % 2 ? 5 : 14, a = i * Math.PI / 5; ctx.lineTo(Math.sin(a) * r * 0.7, 96 + Math.cos(a) * r); }
            ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 44, 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    ctx.restore();
}
// render.js'ten: 4. bölümde düşmanı asker olarak çizer (true dönerse başka çizim yapılmaz)
function drawArmy(ctx, en) {
    if (en.kind === 'sniper' && !en.dead) return false;   // nişancı: drawSniper asker renkleriyle çizer
    if (!['police', 'gas', 'riot', 'sniper'].includes(en.kind)) return false;
    drawSoldier(ctx, en, { shield: en.kind === 'riot' });
    if (en.cadet && !en.dead) heroLabel(ctx, t("cadet"), en.x + en.w / 2, en.y - 14);
    return true;
}

// --- ARKA PLAN: 15 Temmuz gecesi İstanbul ---
THEMES.temmuz = { sky: ["#020617", "#1e1b4b", "#4c1d3d", "#7f1d1d"], moon: { x: 0.82, y: 0.14, r: 26 }, stars: true,
                  ground: ["#3f3f46", "#18181b"], grass: "#71717a", grassDark: "#3f3f46", curb: true };
function drawTemmuzBg(time) {
    // Anadolu yakası: tepeler ve şehir ışıkları
    const sea = height * 0.64;
    hillLayer(0.04, sea - 10, 40, 3.7, "#111827");
    ctx.fillStyle = "rgba(253,230,138,0.7)";
    for (let i = 0; i < 70; i++) {
        const x = ((hash(i * 3.7) * 2400 - camX * 0.04) % 2400 + 2400) % 2400;
        if (x < width) ctx.fillRect(x, hillY(x, 0.04, sea - 10, 40, 3.7) + 6 + hash(i) * 20, 2, 2);
    }
    // Boğaz: deniz ve ay ışığı
    ctx.fillStyle = "#0b1736"; ctx.fillRect(0, sea, width, height - sea);
    ctx.fillStyle = "rgba(226,232,240,0.3)";
    for (let i = 0; i < 10; i++) ctx.fillRect(width * 0.82 - 30 + Math.sin(time * 1.5 + i) * 10, sea + 8 + i * 10, 60 - i * 4, 2);
    // Köprü: iki kule, sarkan kablolar, tabliyede farları yanan tanklar
    const span = 2400, off = camX * 0.07;
    for (let k = Math.floor(off / span) - 1; k <= Math.floor((off + width) / span) + 1; k++) {
        const x0 = k * span - off, deck = sea - 34, tw = 12, th = height * 0.3, t1 = x0 + 300, t2 = x0 + 1300;
        ctx.fillStyle = "#1e293b"; ctx.fillRect(x0 - 200, deck, 1700, 9);
        [t1, t2].forEach(tx => { ctx.fillRect(tx - tw / 2, deck - th, tw, th + 40); ctx.fillRect(tx - 18, deck - th * 0.55, 36, 5); });
        ctx.strokeStyle = "rgba(220,38,38,0.85)"; ctx.lineWidth = 2;   // o gece köprünün ışıkları kırmızı
        ctx.beginPath(); ctx.moveTo(x0 - 200, deck); ctx.quadraticCurveTo(t1 - 100, deck - th * 0.2, t1, deck - th);
        ctx.quadraticCurveTo((t1 + t2) / 2, deck + th * 0.75, t2, deck - th); ctx.quadraticCurveTo(t2 + 100, deck - th * 0.2, x0 + 1500, deck); ctx.stroke();
        ctx.strokeStyle = "rgba(220,38,38,0.3)"; ctx.lineWidth = 1;
        for (let c = t1 + 40; c < t2; c += 40) { const u = (c - t1) / (t2 - t1), cy = deck - th + th * 1.75 * (4 * u * (1 - u)) * 0.5; ctx.beginPath(); ctx.moveTo(c, cy); ctx.lineTo(c, deck); ctx.stroke(); }
        for (let j = 0; j < 3; j++) {   // köprüyü kesen tanklar
            const tx = t1 + 250 + j * 230 + Math.sin(time * 0.3 + j) * 12;
            ctx.fillStyle = "#0f172a"; ctx.fillRect(tx, deck - 12, 34, 12); ctx.fillRect(tx + 8, deck - 19, 16, 8); ctx.fillRect(tx + 22, deck - 17, 20, 3);
            const g = ctx.createRadialGradient(tx + 40, deck - 6, 1, tx + 40, deck - 6, 30); g.addColorStop(0, "rgba(254,240,138,0.8)"); g.addColorStop(1, "rgba(254,240,138,0)");
            ctx.fillStyle = g; ctx.fillRect(tx + 30, deck - 30, 50, 40);
        }
    }
    // Avrupa yakası: camiler; minarelerin şerefeleri yanar (sela okunuyor)
    const mb = height * 0.8;
    hillLayer(0.18, mb, 18, 6.1, "#1c1917");
    layerProps(0.18, 620, 0.85, 14, (sx, i) => {
        const y = hillY(sx, 0.18, mb, 18, 6.1) + 6, s = 0.8 + hash(i * 2.1) * 0.4, glow = 0.55 + 0.45 * Math.sin(time * 2 + i);
        ctx.fillStyle = "#292524";
        ctx.fillRect(sx - 70 * s, y - 40 * s, 140 * s, 40 * s);
        ctx.beginPath(); ctx.arc(sx, y - 40 * s, 46 * s, Math.PI, 0); ctx.fill();
        [-1, 1].forEach(d => { ctx.beginPath(); ctx.arc(sx + d * 52 * s, y - 40 * s, 20 * s, Math.PI, 0); ctx.fill(); });
        ctx.fillStyle = "#57534e"; ctx.fillRect(sx - 1.5, y - 100 * s, 3, 14 * s);
        [-1, 1].forEach(d => {
            const mx = sx + d * 95 * s;
            ctx.fillStyle = "#292524"; ctx.fillRect(mx - 5 * s, y - 150 * s, 10 * s, 150 * s);
            ctx.beginPath(); ctx.moveTo(mx - 6 * s, y - 150 * s); ctx.lineTo(mx, y - 182 * s); ctx.lineTo(mx + 6 * s, y - 150 * s); ctx.fill();
            ctx.fillStyle = `rgba(253,224,71,${glow})`; ctx.fillRect(mx - 8 * s, y - 118 * s, 16 * s, 4 * s);
            const g = ctx.createRadialGradient(mx, y - 116 * s, 1, mx, y - 116 * s, 30 * s); g.addColorStop(0, `rgba(253,224,71,${0.35 * glow})`); g.addColorStop(1, "rgba(253,224,71,0)");
            ctx.fillStyle = g; ctx.fillRect(mx - 30 * s, y - 146 * s, 60 * s, 60 * s);
        });
    });
    // Alçak uçan F-16'lar: arkalarında ses patlaması halkası
    for (let i = 0; i < 2; i++) {
        const P = width + 1400, ph = time * (260 + i * 90) + i * 900, x = width + 200 - (ph % P), y = height * (0.12 + i * 0.13);
        ctx.save(); ctx.translate(x, y); ctx.fillStyle = "#111827";
        ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(26, -3); ctx.lineTo(30, 0); ctx.lineTo(26, 3); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(12, -16); ctx.lineTo(16, 0); ctx.lineTo(12, 16); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(18, -2); ctx.lineTo(28, -12); ctx.lineTo(30, -2); ctx.fill();
        ctx.fillStyle = "#f97316"; ctx.beginPath(); ctx.moveTo(30, -2); ctx.lineTo(42 + Math.random() * 8, 0); ctx.lineTo(30, 2); ctx.fill();
        ctx.restore();
        const boom = (ph % P) / P;
        if (boom > 0.35 && boom < 0.6) {
            const k = (boom - 0.35) / 0.25;
            ctx.strokeStyle = `rgba(255,255,255,${0.35 * (1 - k)})`; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(x + 60 + k * 200, y, 10 + k * 140, 0, Math.PI * 2); ctx.stroke();
        }
    }
    // Helikopter ve aşağıyı tarayan projektörü
    const hx = ((time * 70 - camX * 0.1) % (width + 400) + width + 400) % (width + 400) - 200, hy = height * 0.3 + Math.sin(time) * 10;
    const sa = Math.sin(time * 0.9) * 0.4, L = height * 0.6;
    const bg = ctx.createLinearGradient(hx, hy, hx + Math.sin(sa) * L, hy + L); bg.addColorStop(0, "rgba(254,249,195,0.35)"); bg.addColorStop(1, "rgba(254,249,195,0)");
    ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(hx - 3, hy + 6); ctx.lineTo(hx + Math.sin(sa - 0.12) * L, hy + L); ctx.lineTo(hx + Math.sin(sa + 0.12) * L, hy + L); ctx.lineTo(hx + 3, hy + 6); ctx.fill();
    ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.ellipse(hx, hy, 22, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(hx - 50, hy - 3, 30, 5); ctx.fillRect(hx - 54, hy - 10, 5, 12);
    ctx.fillRect(hx - 40 + Math.sin(time * 40) * 30, hy - 14, 50, 2);
    ctx.fillStyle = Math.floor(time * 3) % 2 ? "#ef4444" : "#0f172a"; ctx.fillRect(hx - 2, hy + 8, 4, 3);
    // Kalabalık: bayraklar, telefon ışıkları, pankart
    const cb = height * 0.92, coff = camX * 0.4;
    for (let x = -(coff % 24) - 24, i = Math.floor(coff / 24); x < width + 24; x += 24, i++) {
        const j = Math.sin(time * 3 + i) * 2;
        ctx.fillStyle = i % 3 ? "#0c0a09" : "#1c1917";
        ctx.beginPath(); ctx.arc(x, cb - 34 + j, 9, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 11, cb - 26 + j, 22, 40);
        if (hash(i * 3.1) > 0.8) {
            ctx.fillStyle = "#9ca3af"; ctx.fillRect(x - 1, cb - 112, 2, 84);
            const w = Math.sin(time * 5 + i) * 4;
            ctx.fillStyle = "#e30a17"; ctx.beginPath(); ctx.moveTo(x + 1, cb - 112); ctx.quadraticCurveTo(x + 18, cb - 106 + w, x + 36, cb - 112); ctx.lineTo(x + 36, cb - 88); ctx.quadraticCurveTo(x + 18, cb - 82 + w, x + 1, cb - 88); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x + 14, cb - 100, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#e30a17"; ctx.beginPath(); ctx.arc(x + 15.5, cb - 100, 4.8, 0, Math.PI * 2); ctx.fill();
        } else if (hash(i * 1.9) > 0.75) {
            const on = 0.6 + 0.4 * Math.sin(time * 2 + i);
            ctx.fillStyle = `rgba(255,255,255,${on})`; ctx.fillRect(x + 6, cb - 60 + j, 4, 6);
        }
        if (i % 47 === 0) {
            const txt = bgT("DARBEYE HAYIR!");
            ctx.font = "bold 18px Arial"; const tw = Math.max(200, ctx.measureText(txt).width + 30);
            ctx.fillStyle = "#fff"; ctx.fillRect(x - 10, cb - 128, tw, 36);
            ctx.fillStyle = "#b91c1c"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, x - 10 + tw / 2, cb - 110);
            ctx.fillStyle = "#57534e"; ctx.fillRect(x, cb - 92, 3, 40); ctx.fillRect(x + tw - 24, cb - 92, 3, 40);
            ctx.textBaseline = "alphabetic";
        }
    }
}

// --- HABERLER (arka plan TV'leri ve gazeteleri, js/newsbg.js) ---
Object.assign(NEWS_SCENES, {
    surrender(x, y, w, h, t) {   // köprüde elleri havada teslim olan askerler
        nightSky(x, y, w, h, "#020617", "#1e1b4b");
        ctx.fillStyle = "#475569"; ctx.fillRect(x, y + h * 0.78, w, 6);
        for (let i = 0; i < 6; i++) {
            const px = x + w * (0.1 + i * 0.15), py = y + h * 0.78;
            person(px, py, 0.9, "#3f6212");
            ctx.strokeStyle = "#3f6212"; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(px - 7, py - 42); ctx.lineTo(px - 11, py - 62 - Math.sin(t * 3 + i) * 2); ctx.moveTo(px + 7, py - 42); ctx.lineTo(px + 11, py - 62 - Math.sin(t * 3 + i) * 2); ctx.stroke();
        }
        flashes(x, y, w, h, t);
    },
    jets(x, y, w, h, t) {   // Ankara semalarında F-16
        nightSky(x, y, w, h, "#0b1026", "#4c1d95");
        skylineMini(x, y, w, h);
        const px = x + ((t * 80) % (w + 80)) - 40, py = y + h * 0.3;
        ctx.fillStyle = "#e5e7eb"; ctx.beginPath(); ctx.moveTo(px + 30, py); ctx.lineTo(px - 20, py - 4); ctx.lineTo(px - 20, py + 4); ctx.fill();
        ctx.beginPath(); ctx.moveTo(px + 4, py); ctx.lineTo(px - 8, py - 14); ctx.lineTo(px - 12, py); ctx.lineTo(px - 8, py + 14); ctx.fill();
        ctx.fillStyle = "#f97316"; ctx.fillRect(px - 30, py - 2, 10, 4);
    },
    tbmm(x, y, w, h, t) {   // bombalanan Meclis
        nightSky(x, y, w, h, "#020617", "#7f1d1d");
        ctx.fillStyle = "#cbd5e1"; ctx.fillRect(x + w * 0.15, y + h * 0.45, w * 0.7, h * 0.45);
        for (let i = 0; i < 9; i++) { ctx.fillStyle = "#94a3b8"; ctx.fillRect(x + w * (0.18 + i * 0.075), y + h * 0.5, 6, h * 0.36); }
        ctx.fillStyle = "#e30a17"; ctx.fillRect(x + w * 0.5 - 1, y + h * 0.2, 2, h * 0.25); ctx.fillRect(x + w * 0.5 + 1, y + h * 0.2, 20, 12);
        for (let k = 0; k < 5; k++) { ctx.fillStyle = `rgba(68,64,60,${0.6 - k * 0.1})`; ctx.beginPath(); ctx.arc(x + w * 0.3 + Math.sin(t + k) * 8, y + h * (0.4 - k * 0.07), 10 + k * 5, 0, Math.PI * 2); ctx.fill(); }
        if (Math.sin(t * 5) > 0.8) { ctx.fillStyle = "rgba(251,146,60,0.5)"; ctx.fillRect(x, y, w, h); }
    }
});
function skylineMini(x, y, w, h) {
    ctx.fillStyle = "#111827";
    for (let i = 0; i < 9; i++) { const bh = h * (0.15 + hash(i * 1.3) * 0.3); ctx.fillRect(x + i * w / 9, y + h - bh, w / 9 - 3, bh); }
}
NEWS[4] = [
    { type: 'tv', head: "BOĞAZ KÖPRÜSÜ ASKERLER TARAFINDAN KAPATILDI", scene: 'tanks' },
    { type: 'paper', date: "16 TEMMUZ 2016", head: "DARBE GİRİŞİMİ BASTIRILDI", scene: 'surrender' },
    { type: 'tv', head: "F-16'LAR ANKARA'DA ALÇAK UÇUŞ YAPIYOR", scene: 'jets' },
    { type: 'paper', date: "17 TEMMUZ 2016", head: "ASKERİ ÖĞRENCİLER TUTUKLANDI", scene: 'surrender' },
    { type: 'tv', head: "TBMM BOMBALANDI", scene: 'tbmm' }
];

// --- BÖLÜM SONU: HIRHIZ konuşur, ardından sonpeygamber resmindeki adam kutlamaya gelir (boss_outro.js 'walk' + pre) ---
const peygamberImg = new Image(); peygamberImg.src = 'resimler/sonpeygamber.png';
let peygamberHead = null;
function peygamberHeadCanvas() {
    if (peygamberHead) return peygamberHead;
    if (!peygamberImg.complete || !peygamberImg.naturalWidth) return null;
    const c = document.createElement('canvas'); c.width = 84; c.height = 128;
    const x = c.getContext('2d');
    x.beginPath(); x.ellipse(42, 66, 40, 62, 0, 0, Math.PI * 2); x.clip();
    x.drawImage(peygamberImg, 196, 94, 84, 128, 0, 0, 84, 128);   // fotoğrafta yüzün kutusu (saç dahil, arka plan hariç)
    return (peygamberHead = c);
}
// Gri takım, beyaz gömlek, siyah kravat. Bir eli havada, işaret parmağı yukarıda (fotoğraftaki gibi): konuşurken yumruğunu sallar.
// Öbür elinde mikrofon. Yürürken kolları sallanır.
function drawPeygamber(ctx, x, gy, walk, talkT) {
    ctx.save();
    ctx.translate(x, gy);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const bob = walk ? Math.abs(Math.sin(walk)) * 3 : talkT ? Math.abs(Math.sin(talkT * 0.18)) * 4 : 0;
    [-1, 1].forEach(s => {   // bacaklar
        const a = walk ? Math.sin(walk + (s > 0 ? 0 : Math.PI)) * 0.4 : 0;
        const fx = Math.sin(a) * 66 + s * 10, fy = -Math.cos(a) * 66 + 66;
        ctx.strokeStyle = "#374151"; ctx.lineWidth = 20;
        ctx.beginPath(); ctx.moveTo(s * 10, -66 - bob); ctx.lineTo(fx, fy - 6); ctx.stroke();
        ctx.fillStyle = "#0a0a0a"; ctx.beginPath(); ctx.ellipse(fx - 6, fy - 4, 15, 6, 0, 0, Math.PI * 2); ctx.fill();
    });
    ctx.translate(0, -bob);
    // yürürken sallanan kol (arkada)
    if (walk) {
        ctx.save(); ctx.translate(26, -140); ctx.rotate(Math.sin(walk) * 0.4);
        ctx.strokeStyle = "#4b5563"; ctx.lineWidth = 17; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 58); ctx.stroke();
        ctx.fillStyle = "#e0a98a"; ctx.beginPath(); ctx.arc(0, 62, 8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    // gövde
    ctx.fillStyle = "#4b5563"; ctx.beginPath(); ctx.roundRect(-34, -150, 68, 92, 14); ctx.fill();
    ctx.fillStyle = "#e0f2fe"; ctx.beginPath(); ctx.moveTo(-14, -150); ctx.lineTo(14, -150); ctx.lineTo(0, -112); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#111827"; ctx.beginPath(); ctx.moveTo(-5, -146); ctx.lineTo(5, -146); ctx.lineTo(7, -110); ctx.lineTo(0, -102); ctx.lineTo(-7, -110); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#374151"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-15, -150); ctx.lineTo(-4, -108); ctx.moveTo(15, -150); ctx.lineTo(4, -108); ctx.stroke();
    ctx.fillStyle = "#b91c1c"; ctx.beginPath(); ctx.arc(-20, -126, 3, 0, Math.PI * 2); ctx.fill();   // yaka rozeti
    // havadaki kol: konuşurken işaret parmağıyla yukarıyı gösterip yumruğunu sallar (fotoğraftaki gibi)
    const pump = talkT ? Math.sin(talkT * 0.32) : 0;
    const up = walk ? Math.sin(walk + Math.PI) * 0.4 + 0.1 : 2.55 + pump * 0.22;
    ctx.save(); ctx.translate(-28, -142); ctx.rotate(up);
    const elbow = walk ? 0 : 0.5 + pump * 0.3;
    ctx.strokeStyle = "#4b5563"; ctx.lineWidth = 17;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 34); ctx.lineTo(Math.sin(-elbow) * 30, 34 + Math.cos(elbow) * 30); ctx.stroke();
    const hx = Math.sin(-elbow) * 30, hy = 34 + Math.cos(elbow) * 30;
    ctx.fillStyle = "#e0a98a"; ctx.beginPath(); ctx.arc(hx, hy + 4, 9, 0, Math.PI * 2); ctx.fill();
    if (!walk) { ctx.strokeStyle = "#e0a98a"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hx, hy + 8); ctx.lineTo(hx + Math.sin(-elbow) * 14, hy + 8 + Math.cos(elbow) * 14); ctx.stroke(); }   // işaret parmağı
    ctx.restore();
    // kafa: fotoğraftan; konuşurken yukarı bakıp sallanır
    const hc = peygamberHeadCanvas();
    ctx.save();
    ctx.translate(0, -150);
    if (talkT) ctx.rotate(Math.sin(talkT * 0.32) * 0.07 - 0.04);
    if (hc) ctx.drawImage(hc, -31, -92, 62, 94);
    else { ctx.fillStyle = "#e0a98a"; ctx.beginPath(); ctx.ellipse(0, -45, 31, 47, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    // durunca öbür elinde mikrofon: çenesine doğru tutar (fotoğraftaki gibi)
    if (!walk) {
        ctx.strokeStyle = "#4b5563"; ctx.lineWidth = 17;
        ctx.beginPath(); ctx.moveTo(26, -140); ctx.lineTo(34, -104); ctx.lineTo(4, -116); ctx.stroke();
        ctx.save(); ctx.translate(2, -118); ctx.rotate(-0.6);
        ctx.fillStyle = "#111827"; ctx.fillRect(-3.5, -26, 7, 28);
        ctx.fillStyle = "#6b7280"; ctx.beginPath(); ctx.arc(0, -30, 7.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#374151"; ctx.lineWidth = 1; for (let k = -6; k <= 6; k += 3) { ctx.beginPath(); ctx.moveTo(k, -36); ctx.lineTo(k, -24); ctx.stroke(); }
        ctx.restore();
        ctx.fillStyle = "#e0a98a"; ctx.beginPath(); ctx.arc(4, -116, 8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}
BOSS_OUTROS[4] = { style: 'walk', draw: drawPeygamber, bubbleY: 270, sfx: 'sonpeygamber', bubble: () => t("peygamberSay"), grannies: false,
                   pre: { sfx: 'savci', bubble: () => t("savciSay") } };   // önce HIRHIZ konuşur
