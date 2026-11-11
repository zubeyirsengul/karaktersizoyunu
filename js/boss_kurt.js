// 2. bölüm canavarı KURT: atılma ve sıçrama + şok dalgası
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

    // Canavar çizimleri büyük tasarlandı (dw x dh); oyunda scale ile küçültülür ki
    // oyuncu (zıplama yüksekliği ~255 px) üzerlerinden atlayıp kafalarına basabilsin
BOSS_TYPES.kurt = { greet: 'greet_kurt', say: "KROOO!", w: 143, h: 204, dw: 210, dh: 300, scale: 0.68, hp: 16, arena: 900, nameKey: "kurtName", stomp: 60, update: updateKurt, draw: drawKurt };

// KURT: koşarak yaklaşır; sırayla ATILMA (çömel → hızla koş) ve SIÇRAMA (zıpla → inişte şok dalgası)
function updateKurt(b) {
    const groundY = height - 60 - b.h;
    const dist = (player.x + player.w / 2) - (b.x + b.w / 2);
    b.look = Math.sign(dist) || b.look;
    switch(b.state) {
        case 'walk':
            b.dir = Math.sign(dist) || b.dir;
            if(Math.abs(dist) > 220) { b.x += b.dir * 2.2; b.run += 0.14; }
            if(!player.isDying && Math.abs(dist) < 1400 && ++b.timer > 80) {
                b.timer = 0;
                b.attacks++;
                b.next = b.attacks % 2 ? 'dash' : 'leap';
                b.state = 'crouch';
                b.stateT = b.next === 'dash' ? 40 : 28;   // hazırlık: oyuncuya kaçma süresi
                createParticle(b.x + b.w / 2, b.y - 50, b.next === 'dash' ? "GRRR!" : "AUUU!", "#e5e7eb", 1.0);
            }
            break;
        case 'crouch':
            if(--b.stateT <= 0) {
                b.dir = Math.sign(dist) || b.dir;
                if(b.next === 'dash') { b.state = 'dash'; b.stateT = 75; }
                else {
                    b.state = 'leap'; b.vy = -19;
                    const air = 2 * 19 / 0.9;   // havada kalma süresi (kare)
                    b.vx = Math.max(-12, Math.min(12, dist / air));
                }
            }
            break;
        case 'dash':
            b.x += b.dir * 13; b.run += 0.5;
            if(--b.stateT <= 0 || b.x <= b.homeX - b.T.arena || b.x >= b.homeX + b.T.arena) { b.state = 'walk'; b.timer = 20; }
            break;
        case 'leap':
            b.vy += 0.9; b.x += b.vx; b.y += b.vy;
            if(b.y >= groundY) {
                b.y = groundY; b.state = 'walk'; b.timer = 15;
                const cx = b.x + b.w / 2;
                [-1, 1].forEach(d => projectiles.push({ type: 'wave', x: cx + d * b.w * 0.3, y: height - 60, vx: d * 8, active: true, life: 85, angle: 0 }));
                for(let i = 0; i < 12; i++) createParticle(cx + (Math.random() - 0.5) * b.w, height - 70);
            }
            break;
    }
    if(b.state !== 'leap') b.y = groundY;
    b.x = Math.max(b.homeX - b.T.arena, Math.min(b.x, b.homeX + b.T.arena, WORLD_WIDTH - b.w));
    b.crouch += ((b.state === 'crouch' ? 1 : 0) - b.crouch) * 0.25;
}

// KURT: iki ayağı üstünde kambur duran, kıllı bir insan (sağa bakar, sola dönünce aynalanır).
// Kurt bacakları (parmak ucunda basar, bilek yerden yüksek), yırtık kot şort, pençeli uzun kollar,
// gür saçlı, sakallı insan yüzü.
function drawKurt(ctx, b) {
    const W = b.T.dw, H = b.T.dh, c = b.crouch, air = b.state === 'leap';   // tasarım boyutu
    const talk = b.talk > 0 && Math.sin(b.anim * 0.45) > 0;   // konuşurken çene açılıp kapanır
    const angry = b.state === 'crouch' || b.state === 'dash' || talk;
    const moving = b.state === 'dash' || (b.state === 'walk' && Math.abs((player.x + player.w / 2) - (b.x + b.w / 2)) > 220);
    const run = b.run, dash = b.state === 'dash';
    const FUR = "#6b6259", FUR_D = "#4a433d", FUR_L = "#b8afa6";
    ctx.save();
    bossBaseTransform(ctx, b);
    ctx.scale(b.dir, 1);
    ctx.lineCap = "round"; ctx.lineJoin = "round";

    const lean = dash ? 46 : moving ? 24 : 12;                          // öne eğilme
    const hipX = -12, hipY = -H * 0.42 + c * 34 + (moving ? -Math.abs(Math.sin(run)) * 6 : 0);
    const S = { x: hipX + 24 + lean, y: -H * 0.76 + c * 40 };           // omuz
    const L = 70;                                                       // uyluk = baldır

    // Bacak: kalça → diz (öne kırık) → bilek (yerden yüksek) → pati
    const leg = (s, col) => {
        const p = run + (s > 0 ? 0 : Math.PI);
        let fx, fy;
        if (air) { fx = hipX + (s > 0 ? 44 : -18); fy = hipY + 110; }
        else if (moving) { fx = hipX + Math.sin(p) * (dash ? 62 : 40); fy = -Math.max(0, Math.cos(p)) * 26; }
        else { fx = hipX + s * 16; fy = 0; }
        const ax = fx - 24, ay = fy - 36;
        const dx = ax - hipX, dy = ay - hipY, d = Math.hypot(dx, dy) || 1;
        const bend = Math.sqrt(Math.max(0, L * L - (d / 2) ** 2));
        const kx = (hipX + ax) / 2 + (dy / d) * bend, ky = (hipY + ay) / 2 - (dx / d) * bend;
        ctx.strokeStyle = col;
        ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(kx, ky); ctx.stroke();
        ctx.lineWidth = 19; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(ax, ay); ctx.stroke();
        ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(fx + 12, fy - 5); ctx.stroke();
        ctx.fillStyle = "#e7e5e4";                                      // ayak pençeleri
        for (let k = 0; k < 3; k++) {
            ctx.beginPath(); ctx.moveTo(fx + 14 + k * 4, fy - 9 + k * 3); ctx.lineTo(fx + 30 + k * 2, fy - 2 + k * 2); ctx.lineTo(fx + 14 + k * 4, fy - 1 + k * 2); ctx.closePath(); ctx.fill();
        }
    };

    // Kol: omuz → dirsek → pençeli el. Yürürken bacakların tersine sallanır,
    // hazırlıkta pençeler öne kalkar, atılmada geride, sıçramada havada.
    const arm = (s, col) => {
        const p = run + (s > 0 ? Math.PI : 0);
        let a1;
        if (air) a1 = 2.6 + s * 0.15;
        else if (b.state === 'crouch') a1 = 1.7 + s * 0.2;
        else if (dash) a1 = -0.9 + Math.sin(p * 2) * 0.3;
        else if (moving) a1 = 0.3 + Math.sin(p) * 0.6;
        else a1 = 0.35 + s * 0.1 + Math.sin(b.anim * 0.05) * 0.05;
        const a2 = a1 + 0.6;
        const sx = S.x + 4, sy = S.y + 10;
        const ex = sx + Math.sin(a1) * 66, ey = sy + Math.cos(a1) * 66;
        const hx = ex + Math.sin(a2) * 60, hy = ey + Math.cos(a2) * 60;
        ctx.strokeStyle = col;
        ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(hx, hy, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#f5f5f4"; ctx.lineWidth = 3.5;
        for (let k = -1; k <= 1; k++) {
            const a = a2 + k * 0.4;
            ctx.beginPath(); ctx.moveTo(hx + Math.sin(a) * 9, hy + Math.cos(a) * 9); ctx.lineTo(hx + Math.sin(a) * 27, hy + Math.cos(a) * 27); ctx.stroke();
        }
    };

    arm(-1, FUR_D);                     // uzaktaki kol ve bacak (koyu) önce
    leg(-1, FUR_D);

    // Kuyruk: kalçanın arkasından gür, sallanan
    const tw = Math.sin(b.anim * 0.15) * 10;
    ctx.fillStyle = FUR;
    ctx.beginPath();
    ctx.moveTo(hipX - 26, hipY - 16);
    ctx.quadraticCurveTo(hipX - 80, hipY - 10 + tw, hipX - 96, hipY + 50 + tw);
    ctx.quadraticCurveTo(hipX - 60, hipY + 20 + tw, hipX - 20, hipY + 10);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = FUR_L;
    ctx.beginPath(); ctx.ellipse(hipX - 94, hipY + 46 + tw, 7, 12, 0.5, 0, Math.PI * 2); ctx.fill();

    // Gövde: kambur sırt, geniş göğüs
    ctx.fillStyle = FUR;
    ctx.beginPath();
    ctx.moveTo(hipX - 36, hipY + 8);
    ctx.quadraticCurveTo(hipX - 44, (hipY + S.y) / 2, S.x - 40, S.y - 14);
    ctx.quadraticCurveTo(S.x, S.y - 34, S.x + 40, S.y + 6);
    ctx.quadraticCurveTo(S.x + 30, (hipY + S.y) / 2 + 20, hipX + 34, hipY + 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = FUR_L;                                              // açık renk göğüs ve karın
    ctx.beginPath(); ctx.ellipse((hipX + S.x) / 2 + 18, (hipY + S.y) / 2 + 6, 24, (hipY - S.y) * 0.42, -0.25, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(74,67,61,0.7)"; ctx.lineWidth = 3;          // kas çizgileri
    ctx.beginPath();
    ctx.moveTo(S.x - 6, S.y + 26); ctx.quadraticCurveTo(S.x + 14, S.y + 40, S.x + 30, S.y + 22);
    for (let r = 0; r < 3; r++) { const y = S.y + 54 + r * 17; ctx.moveTo((hipX + S.x) / 2 + 6, y); ctx.lineTo((hipX + S.x) / 2 + 28, y - 3); }
    ctx.stroke();
    ctx.fillStyle = FUR_D;                                              // sırttaki diken tüyler
    for (let i = 0; i < 7; i++) {
        const k = i / 6, x = hipX - 38 + (S.x - 40 - hipX + 38) * k, y = hipY + (S.y - 16 - hipY) * k;
        ctx.beginPath(); ctx.moveTo(x - 4, y + 10); ctx.lineTo(x - 22, y - 8 - i); ctx.lineTo(x + 10, y + 2); ctx.closePath(); ctx.fill();
    }

    leg(1, FUR);                        // yakındaki bacak

    // Yırtık kot şort (kalan son insanlık izi)
    ctx.fillStyle = "#1d4ed8";
    ctx.beginPath();
    ctx.moveTo(hipX - 40, hipY - 20); ctx.lineTo(hipX + 38, hipY - 22); ctx.lineTo(hipX + 44, hipY + 26);
    for (let i = 0; i <= 6; i++) ctx.lineTo(hipX + 44 - i * 14, hipY + 26 + (i % 2 ? 14 : 0));
    ctx.lineTo(hipX - 44, hipY + 22);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#93c5fd"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(hipX - 6, hipY - 18); ctx.lineTo(hipX - 2, hipY + 18); ctx.moveTo(hipX + 20, hipY + 4); ctx.lineTo(hipX + 32, hipY + 12); ctx.stroke();
    ctx.fillStyle = "#422006"; ctx.fillRect(hipX - 40, hipY - 22, 80, 7);   // kemer

    // Boyun ve yele
    const hx = S.x + 40, hy = S.y - 30 + c * 10;
    ctx.fillStyle = FUR;
    ctx.beginPath(); ctx.moveTo(S.x - 30, S.y); ctx.lineTo(hx - 24, hy - 20); ctx.lineTo(hx + 10, hy + 24); ctx.lineTo(S.x + 34, S.y + 20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = FUR_D;
    for (let i = 0; i < 5; i++) {
        const x = S.x - 26 + i * 12, y = S.y - 10 - i * 6;
        ctx.beginPath(); ctx.moveTo(x - 6, y + 10); ctx.lineTo(x - 16, y - 14); ctx.lineTo(x + 8, y + 4); ctx.closePath(); ctx.fill();
    }

    // Kıllı insan kafası (sağa bakar; orijin kafanın merkezi): gür saç, favori ve sakal, insan yüzü
    ctx.save();
    ctx.translate(hx - 10, hy + 4);
    const SKIN = "#c99a6e", SKIN_D = "#9c6f4a";
    ctx.fillStyle = FUR_D;                                              // arkadaki gür, dağınık saç
    ctx.beginPath(); ctx.ellipse(-10, -6, 42, 44, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 8; i++) {
        const a = -2.6 + i * 0.42, r = 44;
        ctx.beginPath(); ctx.moveTo(-10 + Math.cos(a) * (r - 14), -6 + Math.sin(a) * (r - 14));
        ctx.lineTo(-10 + Math.cos(a + 0.12) * (r + 16), -6 + Math.sin(a + 0.12) * (r + 16));
        ctx.lineTo(-10 + Math.cos(a + 0.3) * (r - 10), -6 + Math.sin(a + 0.3) * (r - 10)); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = SKIN;                                               // yüz
    ctx.beginPath(); ctx.ellipse(10, 6, 30, 36, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-16, 4, 7, 11, 0, 0, Math.PI * 2); ctx.fill();   // kulak
    ctx.strokeStyle = SKIN_D; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(-16, 4, 4, -1.2, 1.4); ctx.stroke();
    ctx.fillStyle = FUR;                                                // favoriler + yanaklara kadar sakal
    ctx.beginPath();
    ctx.moveTo(-8, -6); ctx.lineTo(-4, 26); ctx.quadraticCurveTo(10, 50, 30, 44);
    ctx.lineTo(40, 30); ctx.lineTo(36, 26); ctx.quadraticCurveTo(22, 36, 12, 26); ctx.lineTo(6, 4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = FUR_D; ctx.lineWidth = 2;                         // sakal kılları
    for (let i = 0; i < 9; i++) { const x = -4 + i * 4.5, y = 28 + Math.sin(i) * 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 2, y + 9); ctx.stroke(); }
    ctx.fillStyle = FUR_D;                                              // alına düşen perçemler
    ctx.beginPath(); ctx.moveTo(-12, -30); ctx.lineTo(34, -32); ctx.lineTo(28, -20); ctx.lineTo(22, -26); ctx.lineTo(16, -16); ctx.lineTo(8, -24); ctx.lineTo(0, -14); ctx.lineTo(-6, -22); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#2a2522"; ctx.lineWidth = 6; ctx.lineCap = "round";   // gür, birleşik kaş
    ctx.beginPath(); ctx.moveTo(6, angry ? -14 : -12); ctx.lineTo(22, angry ? -6 : -10); ctx.lineTo(38, angry ? -13 : -11); ctx.stroke();
    ctx.fillStyle = "#fff";                                             // göz: saldırıda sarı-kırmızı parlar
    ctx.beginPath(); ctx.ellipse(27, -2, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = angry ? "#ef4444" : "#ca8a04";
    if (angry) { ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 12; }
    ctx.beginPath(); ctx.arc(29, -2, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(29.5, -2, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = SKIN; ctx.strokeStyle = SKIN_D; ctx.lineWidth = 2;  // burun
    ctx.beginPath(); ctx.moveTo(36, 0); ctx.quadraticCurveTo(48, 14, 42, 18); ctx.lineTo(34, 16); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = FUR_D;                                              // bıyık
    ctx.beginPath(); ctx.ellipse(32, 22, 11, 4, 0.15, 0, Math.PI * 2); ctx.fill();
    if (angry) {                                                        // hırlayan ağız, sivri dişler
        ctx.fillStyle = "#5b1010";
        ctx.beginPath(); ctx.ellipse(30, 30, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        [[23, 26], [35, 26]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4, y); ctx.lineTo(x + 2, y + 7); ctx.closePath(); ctx.fill(); });
    } else {
        ctx.strokeStyle = "#5b3a24"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(24, 30); ctx.lineTo(37, 29); ctx.stroke();
    }
    ctx.restore();

    arm(1, FUR);                        // yakındaki kol en önde
    ctx.restore();
}
