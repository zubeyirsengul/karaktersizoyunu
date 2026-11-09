// Bölüm sonu karnesi: 1-3 yıldız, kaybedilen can, ölüm sayısı ve süre (7. bölüm bulmacasının ölçütleri js/puzzle.js'te)
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)
//  ⭐ bölümü bitir   ⭐ hiç ölme   ⭐ en çok 1 can kaybet

const RP_TEXT = {
    tr: { title: "KARNE", c1: "Bölümü bitir", c2: "Hiç ölme", c3: "En çok 1 can kaybet", lost: "Kaybedilen can", deaths: "Ölüm", time: "Süre", best: "En iyi" },
    en: { title: "REPORT CARD", c1: "Finish the level", c2: "Never die", c3: "Lose at most 1 heart", lost: "Hearts lost", deaths: "Deaths", time: "Time", best: "Best" },
    fr: { title: "BULLETIN", c1: "Finir le niveau", c2: "Ne jamais mourir", c3: "Perdre 1 cœur max", lost: "Cœurs perdus", deaths: "Morts", time: "Temps", best: "Meilleur" },
    nl: { title: "RAPPORT", c1: "Voltooi het level", c2: "Ga nooit dood", c3: "Verlies max. 1 hart", lost: "Harten kwijt", deaths: "Doden", time: "Tijd", best: "Beste" },
    de: { title: "ZEUGNIS", c1: "Level schaffen", c2: "Nie sterben", c3: "Höchstens 1 Herz verlieren", lost: "Verlorene Herzen", deaths: "Tode", time: "Zeit", best: "Bestes" },
    ru: { title: "ТАБЕЛЬ", c1: "Пройди уровень", c2: "Не умирай", c3: "Потеряй не больше 1 сердца", lost: "Потеряно сердец", deaths: "Смертей", time: "Время", best: "Лучшее" }
};
const rpT = k => (RP_TEXT[lang] || RP_TEXT.en)[k];

// Bölüm boyunca tutulan sayaçlar (yeniden doğunca sıfırlanmaz, yeni bölüme geçince sıfırlanır)
let levelStats = { lost: 0, deaths: 0, frames: 0 };
function resetLevelStats() { levelStats = { lost: 0, deaths: 0, frames: 0 }; }

// Her bölümün en iyi yıldızı tarayıcıda saklanır
let bestStars = {};
try { bestStars = JSON.parse(localStorage.getItem('hirhizStars') || '{}') || {}; } catch (e) {}
function saveStars(n, s) {
    if ((bestStars[n] || 0) >= s) return;
    bestStars[n] = s;
    try { localStorage.setItem('hirhizStars', JSON.stringify(bestStars)); } catch (e) {}
}
const starText = s => '★'.repeat(s) + '☆'.repeat(3 - s);

function fmtTime(frames) {
    const sec = Math.round(frames / 60);
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
}

let reportTimers = [];
function hideReport() {
    reportTimers.forEach(clearTimeout); reportTimers = [];
    $('report').hidden = true;
}

// Bölüm bitince overlay'de gösterilir; yıldızlar birer birer düşer
function showReport(n) {
    const S = levelStats;
    // Bulmaca bölümünün kendi ölçütleri var (js/puzzle.js)
    const P = isPuzzle() ? puzzleReport() : null;
    const crits = P ? P.crit : [[rpT('c1'), true], [rpT('c2'), S.deaths === 0], [rpT('c3'), S.lost <= 1]];
    const ok = crits.map(c => c[1]);
    const stars = ok.filter(Boolean).length;
    const prevBest = bestStars[n] || 0;
    saveStars(n, stars);

    const crit = crits.map(([label, good]) =>
        `<li class="${good ? 'ok' : 'no'}"><span>${good ? '✔' : '✘'}</span>${label}</li>`).join('');
    $('report').innerHTML = `
        <div class="rp-title">${rpT('title')}</div>
        <div class="rp-stars">${[0, 1, 2].map(i => `<svg class="rp-star" viewBox="0 0 24 24"><path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z"/></svg>`).join('')}</div>
        <ul class="rp-crit">${crit}</ul>
        <div class="rp-stats">${P ? P.stats : `❤️ ${rpT('lost')}: <b>${S.lost}</b> · 💀 ${rpT('deaths')}: <b>${S.deaths}</b>`} · ⏱ ${rpT('time')}: <b>${fmtTime(S.frames)}</b>
            ${prevBest ? ` · ${rpT('best')}: <b>${starText(Math.max(prevBest, stars))}</b>` : ''}</div>`;
    $('report').hidden = false;
    reportTimers.forEach(clearTimeout); reportTimers = [];
    $('report').querySelectorAll('.rp-star').forEach((el, i) => {
        if (i >= stars) return;
        reportTimers.push(setTimeout(() => {
            el.classList.add('on');
            playSfx('hit', { rate: 1.5 + i * 0.25, vol: 0.45 });
        }, 450 + i * 450));
    });
}
