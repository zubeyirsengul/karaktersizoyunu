// 3-8. bölümlerin arka planları (THEMES ekleri ve drawChapterBackground)
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

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
    } else if (bg === 'emniyet') {
        drawEmniyetBg(time);   // 2. bölüm: js/saygili.js
    } else if (bg === 'gezi') {
        drawGeziBg(time);   // 1. bölüm: js/gezi.js
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
