// Zorluk seviyesi: KOLAY / NORMAL / ZOR. Başlangıç ekranında seçilir, tarayıcıda saklanır.
// Can sayısı, düşman hızı ve ateş sıklığı, canavarın canı ve kazanılan puan buna göre değişir.
// Bütün puanlar addScore() ile eklenir: kolayda yarım, zorda iki kat puan.
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

//        can   düşman hızı  ateş aralığı  canavar canı  puan
const DIFFS = {
    easy:   { hp: 5, speed: 0.75, fire: 1.4,  boss: 0.7, score: 0.5 },
    normal: { hp: 3, speed: 1,    fire: 1,    boss: 1,   score: 1 },
    hard:   { hp: 2, speed: 1.25, fire: 0.7,  boss: 1.4, score: 2 }
};
const DIFF_ORDER = ['easy', 'normal', 'hard'];
const DIFF_TEXT = {
    tr: { easy: "KOLAY", normal: "NORMAL", hard: "ZOR", label: "Zorluk", pts: "puan", shake: "Sarsıntı" },
    en: { easy: "EASY", normal: "NORMAL", hard: "HARD", label: "Difficulty", pts: "points", shake: "Shake" },
    fr: { easy: "FACILE", normal: "NORMAL", hard: "DIFFICILE", label: "Difficulté", pts: "points", shake: "Secousses" },
    nl: { easy: "MAKKELIJK", normal: "NORMAAL", hard: "MOEILIJK", label: "Moeilijkheid", pts: "punten", shake: "Schudden" },
    de: { easy: "LEICHT", normal: "NORMAL", hard: "SCHWER", label: "Schwierigkeit", pts: "Punkte", shake: "Wackeln" },
    ru: { easy: "ЛЕГКО", normal: "НОРМА", hard: "СЛОЖНО", label: "Сложность", pts: "очки", shake: "Тряска" }
};
const dfT = k => (DIFF_TEXT[lang] || DIFF_TEXT.en)[k];

let difficulty = 'normal';
try { const d = localStorage.getItem('hirhizDiff'); if (DIFFS[d]) difficulty = d; } catch (e) {}
const diff = () => DIFFS[difficulty];

// Puan ekle (zorluk çarpanıyla); yeni skoru döndürür
function addScore(n) {
    score += Math.round(n * diff().score);
    return score;
}

function setDifficulty(d) {
    if (!DIFFS[d]) return;
    difficulty = d;
    try { localStorage.setItem('hirhizDiff', d); } catch (e) {}
    renderDiffPicker();
}
// "×½ puan" / "×2 puan"
const diffMult = d => DIFFS[d].score === 1 ? '' : ` ×${DIFFS[d].score === 0.5 ? '½' : DIFFS[d].score}`;
function renderDiffPicker() {
    const el = $('diff-picker');
    if (!el) return;
    el.innerHTML = `<span class="diff-label">${dfT('label')}:</span>` + DIFF_ORDER.map(d =>
        `<button type="button" class="lang-btn diff-btn${d === difficulty ? ' active' : ''}" data-diff="${d}">${dfT(d)}<small>${diffMult(d)}</small></button>`).join('');
    el.querySelectorAll('.diff-btn').forEach(b => b.addEventListener('click', () => setDifficulty(b.dataset.diff)));
    // Ekran sarsıntısı açık/kapalı (baş dönmesi yapanlar için; core.js shakeOn)
    const sb = document.createElement('button');
    sb.type = 'button'; sb.className = 'lang-btn' + (shakeOn ? ' active' : '');
    sb.textContent = (shakeOn ? '📳 ' : '📴 ') + dfT('shake');
    sb.addEventListener('click', () => { setShake(!shakeOn); renderDiffPicker(); });
    el.appendChild(sb);
}
// Canavarın zorluğa göre canı (en az 1)
const bossMaxHp = b => Math.max(1, Math.round(b.T.hp * diff().boss));
