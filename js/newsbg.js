// Haber arka planları: her bölümün arka planında o bölümün olayını anlatan TV "son dakika" ekranları ve gazete sayfaları
// Görseller kodla çizilir (lisans gerekmez). Fotoğraf yeri: resimler/arkaplan/<bölüm>-<sıra>.jpg dosyası varsa
// (ör. resimler/arkaplan/2-1.jpg) o ekranda çizim yerine o fotoğraf görünür. Dosya yoksa çizim kalır.
// Manşetler gerçek olaylara dayanır; Türkçe yazılır, oyunun diline göre çevirileri js/bgtext.js'tedir (bgT).
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- KÜÇÜK ÇİZİMLER (haber karelerinin içi) ---  (x, y, w, h: karenin alanı, t: zaman)
const sarrafImg = new Image(); sarrafImg.src = 'resimler/sarraf.png';
function newsFace(img, box, x, y, s) {   // fotoğraftan yüz (oyunun kendi resimleri)
    if (!img || !(img.naturalWidth || img.width)) return;
    const [bx, by, bw, bh] = box || [0, 0, img.width, img.height];
    ctx.drawImage(img, bx, by, bw, bh, x - s / 2, y - s / 2 * bh / bw, s, s * bh / bw);
}
function nightSky(x, y, w, h, a = "#0b1026", b = "#1e3a8a") {
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, a); g.addColorStop(1, b);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
}
function person(px, py, s, col, cuffs) {   // basit siluet (ayakların ortası px,py)
    ctx.fillStyle = col;
    ctx.fillRect(px - 9 * s, py - 46 * s, 18 * s, 30 * s);
    ctx.fillRect(px - 8 * s, py - 16 * s, 7 * s, 16 * s); ctx.fillRect(px + 1 * s, py - 16 * s, 7 * s, 16 * s);
    ctx.beginPath(); ctx.arc(px, py - 54 * s, 8 * s, 0, Math.PI * 2); ctx.fill();
    if (cuffs) { ctx.fillStyle = "#e5e7eb"; ctx.fillRect(px - 5 * s, py - 30 * s, 10 * s, 3 * s); }
}
function policeLights(cx, cy, t) {
    const on = Math.floor(t * 6) % 2;
    ctx.fillStyle = on ? "#ef4444" : "#3b82f6"; ctx.fillRect(cx - 12, cy, 10, 6);
    ctx.fillStyle = on ? "#3b82f6" : "#ef4444"; ctx.fillRect(cx + 2, cy, 10, 6);
    ctx.fillStyle = on ? "rgba(239,68,68,0.18)" : "rgba(59,130,246,0.18)";
    ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI * 2); ctx.fill();
}
function dollarStack(x, y, n) { for (let i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? "#16a34a" : "#22c55e"; ctx.fillRect(x, y - i * 5, 30, 5); } }
function flashes(x, y, w, h, t) {   // foto muhabirlerinin flaşları
    for (let i = 0; i < 4; i++) if (Math.sin(t * 7 + i * 2.3) > 0.85) {
        ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.beginPath(); ctx.arc(x + w * (0.15 + i * 0.22), y + h * 0.75, 7, 0, Math.PI * 2); ctx.fill();
    }
}

const NEWS_SCENES = {
    raid(x, y, w, h, t) {   // gece baskını: polis minibüsü, kelepçeli şüpheliler, flaşlar
        nightSky(x, y, w, h);
        ctx.fillStyle = "#1f2937"; ctx.fillRect(x, y + h * 0.35, w * 0.4, h * 0.65); ctx.fillRect(x + w * 0.62, y + h * 0.25, w * 0.38, h * 0.75);
        ctx.fillStyle = "#fde68a"; for (let i = 0; i < 6; i++) ctx.fillRect(x + 10 + (i % 3) * 22, y + h * 0.45 + Math.floor(i / 3) * 22, 10, 12);
        ctx.fillStyle = "#e5e7eb"; ctx.fillRect(x + w * 0.42, y + h * 0.52, w * 0.34, h * 0.3);
        ctx.fillStyle = "#1d4ed8"; ctx.fillRect(x + w * 0.42, y + h * 0.64, w * 0.34, 6);
        ctx.fillStyle = "#1d4ed8"; ctx.font = "bold 12px Arial"; ctx.textAlign = "center"; ctx.fillText(bgT("POLİS"), x + w * 0.59, y + h * 0.6);
        policeLights(x + w * 0.59, y + h * 0.5, t);
        person(x + w * 0.22, y + h * 0.95, 0.9, "#111827", true); person(x + w * 0.32, y + h * 0.95, 0.9, "#334155");
        person(x + w * 0.86, y + h * 0.95, 0.9, "#111827", true);
        flashes(x, y, w, h, t);
    },
    shoeboxes(x, y, w, h) {   // ayakkabı kutularında dolar
        ctx.fillStyle = "#e7e5e4"; ctx.fillRect(x, y, w, h);
        [[0.1, 0.55], [0.38, 0.55], [0.66, 0.55], [0.24, 0.2], [0.52, 0.2]].forEach(([fx, fy]) => {
            const bx = x + w * fx, by = y + h * fy, bw = w * 0.26, bh = h * 0.34;
            ctx.fillStyle = "#ea580c"; ctx.fillRect(bx, by, bw, bh); ctx.fillStyle = "#9a3412"; ctx.fillRect(bx, by, bw, bh * 0.2);
            dollarStack(bx + bw * 0.2, by + bh * 0.15, 3);
        });
    },
    counter(x, y, w, h, t) {   // para sayma makinesi
        ctx.fillStyle = "#3f3f46"; ctx.fillRect(x, y, w, h);
        const mx = x + w * 0.3, my = y + h * 0.35;
        ctx.fillStyle = "#d1d5db"; ctx.fillRect(mx, my, w * 0.4, h * 0.5);
        ctx.fillStyle = "#052e16"; ctx.fillRect(mx + 8, my + 8, w * 0.4 - 16, 16);
        ctx.fillStyle = "#4ade80"; ctx.font = "bold 12px monospace"; ctx.textAlign = "center";
        ctx.fillText(String(Math.floor(t * 7777) % 100000).padStart(5, "0"), mx + w * 0.2, my + 21);
        for (let i = 0; i < 5; i++) { const ph = (t * 1.5 + i / 5) % 1; ctx.fillStyle = "#22c55e"; ctx.fillRect(mx + w * 0.1 + i * 8, my - ph * h * 0.3, 14, 8); }
        dollarStack(x + 10, y + h - 10, 6); dollarStack(x + w - 40, y + h - 10, 8);
    },
    miami(x, y, w, h, t) {   // Miami: palmiye, FBI aracı, kelepçeli Sarraf
        const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, "#f97316"); g.addColorStop(1, "#fde68a");
        ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#0e7490"; ctx.fillRect(x, y + h * 0.62, w, h * 0.38);
        ctx.strokeStyle = "#78350f"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + w * 0.12, y + h); ctx.quadraticCurveTo(x + w * 0.16, y + h * 0.5, x + w * 0.1, y + h * 0.2); ctx.stroke();
        ctx.strokeStyle = "#166534"; ctx.lineWidth = 4;
        for (let k = 0; k < 5; k++) { const a = -Math.PI + k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(x + w * 0.1, y + h * 0.2); ctx.lineTo(x + w * 0.1 + Math.cos(a) * 26, y + h * 0.2 + Math.abs(Math.sin(a)) * 10 + 6); ctx.stroke(); }
        ctx.fillStyle = "#111827"; ctx.fillRect(x + w * 0.5, y + h * 0.55, w * 0.42, h * 0.3);
        ctx.fillStyle = "#fde047"; ctx.font = "bold 16px Arial"; ctx.textAlign = "center"; ctx.fillText("FBI", x + w * 0.71, y + h * 0.75);
        policeLights(x + w * 0.71, y + h * 0.5, t);
        person(x + w * 0.32, y + h * 0.95, 1, "#18181b", true);
        newsFace(sarrafImg, STORY_FACES.sarraf.box, x + w * 0.32, y + h * 0.95 - 58, 26);
    },
    gold(x, y, w, h, t) {   // altın külçeleri ve Sarraf
        ctx.fillStyle = "#1c1917"; ctx.fillRect(x, y, w, h);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 5 - r; k++) {
            const bx = x + w * 0.08 + r * 12 + k * 26, by = y + h - 18 - r * 14;
            ctx.fillStyle = "#eab308"; ctx.fillRect(bx, by, 24, 12); ctx.fillStyle = "#fde047"; ctx.fillRect(bx + 3, by + 2, 14, 3);
        }
        newsFace(sarrafImg, STORY_FACES.sarraf.box, x + w * 0.75, y + h * 0.5, h * 0.6);
        if (Math.sin(t * 4) > 0.6) { ctx.fillStyle = "#fff"; ctx.fillRect(x + w * 0.3, y + h * 0.6, 4, 4); }
    },
    court(x, y, w, h) {   // ABD mahkemesi
        ctx.fillStyle = "#cbd5e1"; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#f1f5f9"; ctx.beginPath(); ctx.moveTo(x + w * 0.1, y + h * 0.35); ctx.lineTo(x + w * 0.5, y + h * 0.1); ctx.lineTo(x + w * 0.9, y + h * 0.35); ctx.fill();
        ctx.fillRect(x + w * 0.1, y + h * 0.35, w * 0.8, h * 0.08);
        for (let i = 0; i < 6; i++) ctx.fillRect(x + w * (0.14 + i * 0.13), y + h * 0.45, 10, h * 0.42);
        ctx.fillRect(x + w * 0.08, y + h * 0.87, w * 0.84, h * 0.08);
        ctx.fillStyle = "#334155"; ctx.font = "bold 10px Arial"; ctx.textAlign = "center"; ctx.fillText("U.S. DISTRICT COURT · NEW YORK", x + w * 0.5, y + h * 0.42);
    },
    tape(x, y, w, h, t) {   // ses kaydı dalgası + kaset
        ctx.fillStyle = "#020617"; ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 3; ctx.beginPath();
        for (let i = 0; i <= 60; i++) { const px = x + (i / 60) * w, a = Math.sin(i * 0.9 + t * 9) * Math.sin(i * 0.23 + t * 2); ctx.lineTo(px, y + h * 0.35 + a * h * 0.22); }
        ctx.stroke();
        if (typeof drawCassette === 'function') { ctx.save(); ctx.translate(x + w * 0.5 - 60, y + h * 0.58); drawCassette(ctx, 0, 0); ctx.restore(); }
        ctx.fillStyle = "#fca5a5"; ctx.font = "bold 13px monospace"; ctx.textAlign = "left"; ctx.fillText(bgT("● REC  'SIFIRLA'"), x + 8, y + 16);
    },
    euro(x, y, w, h, t) {
        NEWS_SCENES.counter(x, y, w, h, t);
        ctx.fillStyle = "#fde047"; ctx.font = "bold 30px Arial"; ctx.textAlign = "center"; ctx.fillText("€30.000.000", x + w / 2, y + 34);
    },
    blackout(x, y, w, h, t) {   // seçim gecesi karanlık, telefon ışığında sayım
        ctx.fillStyle = "#020617"; ctx.fillRect(x, y, w, h);
        for (let i = 0; i < 3; i++) {
            const bx = x + w * (0.12 + i * 0.3), by = y + h * 0.55;
            ctx.fillStyle = "#e5e7eb"; ctx.fillRect(bx, by, w * 0.18, h * 0.3); ctx.fillStyle = "#1d4ed8"; ctx.fillRect(bx, by, w * 0.18, 5);
            const flick = 0.5 + 0.5 * Math.sin(t * 5 + i * 2);
            const g = ctx.createRadialGradient(bx + w * 0.09, by - 10, 2, bx + w * 0.09, by - 10, 50);
            g.addColorStop(0, `rgba(255,255,255,${0.5 * flick})`); g.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = g; ctx.fillRect(bx - 40, by - 60, w * 0.18 + 80, 110);
        }
    },
    cat(x, y, w, h, t) {   // trafoya giren kedi
        nightSky(x, y, w, h, "#020617", "#111827");
        ctx.fillStyle = "#6b7280"; ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.6);
        ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.moveTo(x + w * 0.5, y + h * 0.4); ctx.lineTo(x + w * 0.44, y + h * 0.6); ctx.lineTo(x + w * 0.52, y + h * 0.58); ctx.lineTo(x + w * 0.47, y + h * 0.78); ctx.lineTo(x + w * 0.58, y + h * 0.52); ctx.lineTo(x + w * 0.5, y + h * 0.54); ctx.fill();
        const cx = x + w * 0.66, cy = y + h * 0.3;
        ctx.fillStyle = "#111"; ctx.beginPath(); ctx.ellipse(cx, cy - 8, 16, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 14, cy - 18, 8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx + 8, cy - 24); ctx.lineTo(cx + 10, cy - 32); ctx.lineTo(cx + 14, cy - 25); ctx.moveTo(cx + 16, cy - 25); ctx.lineTo(cx + 20, cy - 32); ctx.lineTo(cx + 22, cy - 22); ctx.fill();
        ctx.strokeStyle = "#111"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 14, cy - 6); ctx.quadraticCurveTo(cx - 30, cy - 10 + Math.sin(t * 4) * 6, cx - 26, cy - 26); ctx.stroke();
        ctx.fillStyle = "#facc15"; ctx.fillRect(cx + 15, cy - 20, 3, 2);
        if (Math.sin(t * 9) > 0.7) { ctx.fillStyle = "rgba(253,224,71,0.5)"; ctx.fillRect(x, y, w, h); }
    },
    ysk(x, y, w, h) {   // YSK binası, damga
        ctx.fillStyle = "#e2e8f0"; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#94a3b8"; ctx.fillRect(x + w * 0.15, y + h * 0.25, w * 0.7, h * 0.65);
        for (let i = 0; i < 5; i++) ctx.fillRect(x + w * (0.2 + i * 0.14), y + h * 0.15, 10, h * 0.1);
        ctx.fillStyle = "#475569"; ctx.font = "bold 14px Arial"; ctx.textAlign = "center"; ctx.fillText("YSK", x + w / 2, y + h * 0.4);
        ctx.save(); ctx.translate(x + w * 0.5, y + h * 0.68); ctx.rotate(-0.2);
        ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 4; ctx.strokeRect(-56, -16, 112, 32);
        ctx.fillStyle = "#dc2626"; ctx.font = "bold 20px Arial"; ctx.fillText(bgT("RET"), 0, 8); ctx.restore();
    },
    facetime(x, y, w, h, t) {   // stüdyoda spiker telefonu kameraya tutuyor
        ctx.fillStyle = "#0c1445"; ctx.fillRect(x, y, w, h);
        person(x + w * 0.3, y + h * 1.05, 1.6, "#be123c");
        const px = x + w * 0.5, py = y + h * 0.18, pw = w * 0.26, ph = h * 0.62;
        ctx.fillStyle = "#111827"; ctx.fillRect(px - 4, py - 4, pw + 8, ph + 8);
        ctx.fillStyle = "#1e293b"; ctx.fillRect(px, py, pw, ph);
        if (typeof headCanvas !== 'undefined' && headCanvas) ctx.drawImage(headCanvas, px + 4, py + 10 + Math.sin(t * 6) * 2, pw - 8, (pw - 8) * headCanvas.height / headCanvas.width);
        ctx.fillStyle = "#ef4444"; ctx.fillRect(px + pw - 22, py + 4, 18, 8);
    },
    tanks(x, y, w, h, t) {   // gece köprüde tanklar
        nightSky(x, y, w, h, "#020617", "#1e1b4b");
        ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x, y + h * 0.55); ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.1, x + w, y + h * 0.55); ctx.stroke();
        ctx.fillStyle = "#64748b"; ctx.fillRect(x, y + h * 0.6, w, 6);
        for (let i = 0; i < 3; i++) {
            const tx = x + w * (0.15 + i * 0.3);
            ctx.fillStyle = "#3f6212"; ctx.fillRect(tx, y + h * 0.48, 40, 12); ctx.fillRect(tx + 10, y + h * 0.42, 18, 8); ctx.fillRect(tx + 26, y + h * 0.44, 22, 3);
        }
        for (let i = 0; i < 12; i++) { ctx.fillStyle = "#fde68a"; ctx.fillRect(x + (i * 37 + t * 20) % w, y + h * 0.6 + 2, 3, 2); }
    },
    trt(x, y, w, h) {   // TRT stüdyosunda bildiri
        ctx.fillStyle = "#1e3a8a"; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#93c5fd"; ctx.font = "bold 22px Arial"; ctx.textAlign = "left"; ctx.fillText("trt", x + 10, y + 26);
        person(x + w * 0.5, y + h * 1.05, 1.5, "#1f2937");
        ctx.fillStyle = "#f8fafc"; ctx.fillRect(x + w * 0.42, y + h * 0.62, w * 0.16, h * 0.2);
        ctx.fillStyle = "#94a3b8"; for (let i = 0; i < 4; i++) ctx.fillRect(x + w * 0.44, y + h * 0.66 + i * 6, w * 0.12, 2);
    },
    boxes(x, y, w, h) {   // 85 koli iade dosyası
        ctx.fillStyle = "#e7e5e4"; ctx.fillRect(x, y, w, h);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 6 - (r % 2); k++) {
            const bx = x + 8 + k * (w - 16) / 6 + (r % 2) * 14, by = y + h - 26 - r * 24;
            ctx.fillStyle = "#b45309"; ctx.fillRect(bx, by, (w - 16) / 6 - 4, 22); ctx.fillStyle = "#fde68a"; ctx.fillRect(bx + 4, by + 8, 16, 6);
        }
        ctx.fillStyle = "#991b1b"; ctx.font = "bold 26px Arial"; ctx.textAlign = "right"; ctx.fillText("85", x + w - 8, y + 28);
    },
    farm(x, y, w, h, t) {   // karlı çiftlik, kapalı kapı, ABD bayrağı
        ctx.fillStyle = "#cbd5e1"; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#f8fafc"; ctx.fillRect(x, y + h * 0.7, w, h * 0.3);
        ctx.fillStyle = "#991b1b"; ctx.fillRect(x + w * 0.45, y + h * 0.4, w * 0.35, h * 0.32);
        ctx.beginPath(); ctx.moveTo(x + w * 0.42, y + h * 0.4); ctx.lineTo(x + w * 0.625, y + h * 0.2); ctx.lineTo(x + w * 0.83, y + h * 0.4); ctx.fill();
        ctx.fillStyle = "#57534e"; for (let i = 0; i < 8; i++) ctx.fillRect(x + w * 0.05 + i * 12, y + h * 0.55, 4, h * 0.2);
        ctx.fillRect(x + w * 0.05, y + h * 0.6, 96, 3);
        ctx.fillStyle = "#475569"; ctx.fillRect(x + w * 0.9, y + h * 0.15, 3, h * 0.6);
        for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? "#fff" : "#b91c1c"; ctx.fillRect(x + w * 0.9 - 30, y + h * 0.15 + i * 4 + Math.sin(t * 3) * 1, 30, 4); }
        ctx.fillStyle = "#1e3a8a"; ctx.fillRect(x + w * 0.9 - 30, y + h * 0.15, 12, 10);
        ctx.fillStyle = "#fff"; for (let i = 0; i < 25; i++) ctx.fillRect(x + (i * 53) % w, y + ((i * 31 + t * 30) % h), 2, 2);
    },
    nightraid(x, y, w, h, t) {   // gece yarısı ev baskını, el fenerleri
        nightSky(x, y, w, h, "#020617", "#0f172a");
        ctx.fillStyle = "#334155"; ctx.fillRect(x + w * 0.45, y + h * 0.3, w * 0.45, h * 0.7);
        ctx.fillStyle = "#facc15"; ctx.fillRect(x + w * 0.52, y + h * 0.4, 18, 14);
        ctx.fillStyle = "#78350f"; ctx.fillRect(x + w * 0.7, y + h * 0.62, 22, h * 0.38);
        for (let i = 0; i < 3; i++) {
            const px = x + w * (0.12 + i * 0.12);
            person(px, y + h * 0.98, 0.9, "#0f172a");
            const a = Math.sin(t * 2 + i) * 0.2;
            ctx.fillStyle = "rgba(254,240,138,0.25)"; ctx.beginPath(); ctx.moveTo(px + 6, y + h * 0.7);
            ctx.lineTo(x + w * 0.75 + Math.sin(a) * 60, y + h * 0.5 - 30); ctx.lineTo(x + w * 0.75 + Math.sin(a) * 60, y + h * 0.5 + 40); ctx.fill();
        }
        policeLights(x + w * 0.1, y + h * 0.4, t);
    },
    aihm(x, y, w, h) {   // Strazburg: yıldız halkası, tokmak
        ctx.fillStyle = "#1d4ed8"; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#fde047";
        for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.arc(x + w * 0.3 + Math.cos(a) * h * 0.3, y + h * 0.5 + Math.sin(a) * h * 0.3, 4, 0, Math.PI * 2); ctx.fill(); }
        ctx.save(); ctx.translate(x + w * 0.72, y + h * 0.55); ctx.rotate(-0.5);
        ctx.fillStyle = "#78350f"; ctx.fillRect(-4, -4, 60, 8); ctx.fillRect(-20, -16, 26, 32); ctx.restore();
        ctx.fillStyle = "#78350f"; ctx.fillRect(x + w * 0.6, y + h * 0.82, w * 0.3, 8);
    },
    candidate(x, y, w, h) {   // parmaklık ardında aday: oy pusulası
        ctx.fillStyle = "#f8fafc"; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#e0ac69"; ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.42, h * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1c1917"; ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.32, h * 0.18, Math.PI, 0); ctx.fill();
        ctx.strokeStyle = "#7f1d1d"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.48, h * 0.08, 0.2, Math.PI - 0.2); ctx.stroke();
        ctx.fillStyle = "#6b7280"; for (let i = 0; i < 7; i++) ctx.fillRect(x + w * (0.2 + i * 0.1), y, 6, h);
        ctx.fillStyle = "#16a34a"; ctx.font = "bold 22px Arial"; ctx.textAlign = "center"; ctx.fillText(bgT("✔ EVET"), x + w * 0.5, y + h * 0.9);
    },
    book(x, y, w, h, t) {   // "SEHER" kitap kapağı, güneş doğuyor
        ctx.fillStyle = "#292524"; ctx.fillRect(x, y, w, h);
        const bx = x + w * 0.3, by = y + h * 0.08, bw = w * 0.4, bh = h * 0.84;
        const g = ctx.createLinearGradient(0, by, 0, by + bh); g.addColorStop(0, "#1e3a8a"); g.addColorStop(1, "#f97316");
        ctx.fillStyle = g; ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(bx + bw / 2, by + bh * 0.75 - Math.sin(t) * 4, bw * 0.2, Math.PI, 0); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 20px Georgia"; ctx.textAlign = "center"; ctx.fillText("SEHER", bx + bw / 2, by + 30);
    }
};

// --- BÖLÜMLERİN HABERLERİ ---  type: 'tv' (son dakika) ya da 'paper' (gazete); date: gazetenin tarihi
const NEWS = {   // 1, 2, 4 ve 10. bölümlerin haberleri kendi dosyalarında (gezi.js, saygili.js, temmuz.js, ekrem.js)
    3: [ { type: 'tv', head: "'SIFIRLA' SES KAYDI İNTERNETE DÜŞTÜ", scene: 'tape' },
         { type: 'paper', date: "25 ŞUBAT 2014", head: "KAYITLARA 'MONTAJ' DEDİ", scene: 'tape' },
         { type: 'tv', head: "KAYITTA: '30 MİLYON AVRO DAHA VAR'", scene: 'euro' } ],
    5: [ { type: 'tv', head: "CANLI: CUMHURBAŞKANI FACETIME İLE BAĞLANDI", scene: 'facetime' },
         { type: 'paper', date: "16 TEMMUZ 2016", head: "BOĞAZ KÖPRÜSÜ'NDE TANKLAR", scene: 'tanks' },
         { type: 'tv', head: "TRT'DE DARBE BİLDİRİSİ OKUNDU", scene: 'trt' } ],
    8: [ { type: 'tv', head: "85 KOLİ İADE DOSYASI ABD'YE GÖNDERİLDİ", scene: 'boxes' },
         { type: 'paper', date: "PENSİLVANYA", head: "ÇİFTLİKTEN İADE YOK", scene: 'farm' },
         { type: 'tv', head: "ABD İADE TALEBİNİ YANITSIZ BIRAKTI", scene: 'farm' } ],
    9: [ { type: 'tv', head: "SELO GECE YARISI GÖZALTINA ALINDI", scene: 'nightraid' },
         { type: 'paper', date: "20 KASIM 2018", head: "AİHM: 'DERHAL SERBEST BIRAKILSIN'", scene: 'aihm' },
         { type: 'tv', head: "CEZAEVİNDEN CUMHURBAŞKANI ADAYI", scene: 'candidate' },
         { type: 'paper', date: "2017", head: "'SEHER' ÇOK SATANLAR LİSTESİNDE", scene: 'book' } ]
};
// 6. bölüm (uçuş): gökte pankart çeken uçaklar
const FLIGHT_BANNERS = ["SON DAKİKA: REİS'İN UÇAĞI HAVADA", "TRT'DE DARBE BİLDİRİSİ", "MİNARELERDEN SELA OKUNUYOR", "UÇAK ATATÜRK HAVALİMANI'NA İNDİ"];

// --- FOTOĞRAF YERLERİ ---
const newsPhotos = {};   // "2-1" → Image (yüklendiyse)
function newsPhoto(level, k) {
    const key = level + '-' + k;
    if (!(key in newsPhotos)) {
        newsPhotos[key] = null;
        const im = new Image();
        im.onload = () => { newsPhotos[key] = im; };
        im.src = `resimler/arkaplan/${key}.jpg`;   // yoksa sessizce çizim kalır
    }
    return newsPhotos[key];
}
function drawCover(im, x, y, w, h) {   // fotoğrafı kareyi dolduracak şekilde kırp
    const s = Math.max(w / im.width, h / im.height), sw = w / s, sh = h / s;
    ctx.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, x, y, w, h);
}

// Yazıyı en çok n satıra sığdır (yazı boyu küçülerek). Sonuç saklanır: her karede yeniden ölçmek telefonda pahalı.
const fitCache = new Map();
function fitLines(text, maxW, maxLines, size, font = "Arial") {
    const key = text + '|' + maxW + '|' + maxLines + '|' + size + '|' + font;
    let r = fitCache.get(key);
    if (!r) { r = fitLinesRaw(text, maxW, maxLines, size, font); fitCache.set(key, r); }
    return r;
}
function fitLinesRaw(text, maxW, maxLines, size, font) {
    for (let s = size; s >= 9; s--) {
        ctx.font = `bold ${s}px ${font}`;
        const words = text.split(' '), lines = []; let line = '';
        words.forEach(wd => { const tst = line ? line + ' ' + wd : wd; if (ctx.measureText(tst).width > maxW && line) { lines.push(line); line = wd; } else line = tst; });
        if (line) lines.push(line);
        if (lines.length <= maxLines && lines.every(l => ctx.measureText(l).width <= maxW)) return { lines, size: s };
    }
    return { lines: [text], size: 9 };
}

function drawNewsTV(x, y, item, photo, t, w = 300, h = 180) {
    ctx.fillStyle = "#111827"; ctx.beginPath(); ctx.roundRect(x - 10, y - 10, w + 20, h + 20, 12); ctx.fill();
    ctx.fillStyle = "#374151"; ctx.fillRect(x + w / 2 - 6, y + h + 10, 12, 30); ctx.fillRect(x + w / 2 - 50, y + h + 38, 100, 8);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (photo) drawCover(photo, x, y, w, h); else NEWS_SCENES[item.scene](x, y, w, h, t);
    // kanal logosu ve CANLI
    ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(x + 6, y + 6, 70, 20);
    ctx.fillStyle = "#fff"; ctx.font = "bold 12px Arial"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(bgT("HABER"), x + 12, y + 16, 50);
    if (Math.floor(t * 2) % 2) { ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(x + 64, y + 16, 5, 0, Math.PI * 2); ctx.fill(); }
    // alt bant: SON DAKİKA + manşet + kayan yazı
    const by = y + h - 52;
    ctx.font = "bold 12px Arial"; const bk = bgT("SON DAKİKA"), bkw = Math.max(92, ctx.measureText(bk).width + 12);
    ctx.fillStyle = "#dc2626"; ctx.fillRect(x, by, bkw, 20);
    ctx.fillStyle = "#fff"; ctx.fillText(bk, x + 6, by + 10);
    ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fillRect(x, by + 20, w, 32);
    const f = fitLines(bgT(item.head), w - 12, 2, 15);
    ctx.fillStyle = "#111827"; ctx.font = `bold ${f.size}px Arial`;
    f.lines.forEach((ln, i) => ctx.fillText(ln, x + 6, by + 36 + (i - (f.lines.length - 1) / 2) * (f.size + 1)));
    ctx.restore();
    ctx.textBaseline = "alphabetic";
}
function drawNewsPaper(x, y, item, photo, t, w = 210, h = 270) {
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(-0.03); ctx.translate(-w / 2, -h / 2);
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(6, 6, w, h);
    ctx.fillStyle = "#f5f5f0"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#111827"; ctx.font = "bold 26px Georgia"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillText(bgT("GÜNDEM"), w / 2, 30, w - 20);
    ctx.fillRect(10, 36, w - 20, 2); ctx.font = "10px Georgia"; ctx.fillText(bgT(item.date || ""), w / 2, 48); ctx.fillRect(10, 52, w - 20, 1);
    const f = fitLines(bgT(item.head), w - 20, 3, 22, "Georgia");
    ctx.font = `bold ${f.size}px Georgia`; ctx.fillStyle = "#111";
    f.lines.forEach((ln, i) => ctx.fillText(ln, w / 2, 56 + f.size + i * (f.size + 2)));
    const iy = 62 + f.lines.length * (f.size + 2), ih = 100;
    ctx.save(); ctx.beginPath(); ctx.rect(10, iy, w - 20, ih); ctx.clip();
    ctx.translate(0, 0);
    if (photo) drawCover(photo, 10, iy, w - 20, ih); else NEWS_SCENES[item.scene](10, iy, w - 20, ih, t);
    ctx.restore();
    ctx.fillStyle = "#9ca3af";
    for (let c = 0; c < 2; c++) for (let r = 0; iy + ih + 10 + r * 7 < h - 8; r++) ctx.fillRect(10 + c * (w - 20) / 2, iy + ih + 10 + r * 7, (w - 20) / 2 - 8 - (r % 4 === 3 ? 20 : 0), 3);
    ctx.restore();
}

// Arka planın en önüne (zeminin arkasına) haber panoları: direk üstünde TV, duvara asılı gazete
function drawNewsBoards(time) {
    const list = NEWS[currentLevel];
    if (!list) return;
    const base = height - 60, n = list.length;
    layerProps(0.5, 1250, 1, 31, (sx, i) => {
        const k = ((i % n) + n) % n, item = list[k], photo = newsPhoto(currentLevel, k + 1);
        ctx.globalAlpha = 0.93;
        if (item.type === 'tv') {
            ctx.fillStyle = "#4b5563"; ctx.fillRect(sx + 143, base - 300, 14, 300);   // direk
            drawNewsTV(sx, base - 505, item, photo, time);   // alt bant üst rafın (T2) üstünde kalır
        } else {
            ctx.fillStyle = "#57534e"; ctx.fillRect(sx - 10, base - 330, 230, 330);     // ilan panosu
            ctx.fillStyle = "#44403c"; ctx.fillRect(sx - 18, base - 338, 246, 12);
            drawNewsPaper(sx, base - 312, item, photo, time);
        }
        ctx.globalAlpha = 1;
    });
}
// Uçuş bölümü: pankart çeken uçaklar
function drawFlightBanners(time) {
    for (let i = 0; i < 2; i++) {
        const P = width + 900, x = width + 300 - ((time * (55 + i * 20) + i * 700) % P), y = height * (0.16 + i * 0.22);
        const text = bgT(FLIGHT_BANNERS[(Math.floor((time * (55 + i * 20) + i * 700) / P) * 2 + i) % FLIGHT_BANNERS.length]);
        ctx.font = "bold 20px Arial"; const tw = ctx.measureText(text).width + 30;
        ctx.fillStyle = "#e5e7eb"; ctx.fillRect(x, y - 6, 60, 12); ctx.fillRect(x + 20, y - 20, 14, 28); ctx.fillRect(x + 50, y - 14, 8, 10);
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 60, y); ctx.lineTo(x + 100, y); ctx.stroke();
        const wave = Math.sin(time * 6 + i) * 3;
        ctx.fillStyle = "#dc2626"; ctx.fillRect(x + 100, y - 16 + wave, tw, 32);
        ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(text, x + 115, y + wave);
        ctx.textBaseline = "alphabetic";
    }
}
