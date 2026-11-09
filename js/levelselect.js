// Bölüm seçme ekranı: bitirilen bölümler tarayıcıda saklanır, açılan bölümden oyuna başlanabilir
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

const LS_TEXT = {
    tr: { btn: "🗺 BÖLÜM SEÇ", title: "BÖLÜM SEÇ", locked: "Önceki bölümü bitir", boss: "Canavar", close: "KAPAT" },
    en: { btn: "🗺 SELECT LEVEL", title: "SELECT LEVEL", locked: "Finish the previous level", boss: "Boss", close: "CLOSE" },
    fr: { btn: "🗺 CHOISIR UN NIVEAU", title: "CHOISIR UN NIVEAU", locked: "Termine le niveau précédent", boss: "Boss", close: "FERMER" },
    nl: { btn: "🗺 KIES LEVEL", title: "KIES LEVEL", locked: "Voltooi eerst het vorige level", boss: "Eindbaas", close: "SLUITEN" },
    de: { btn: "🗺 LEVEL WÄHLEN", title: "LEVEL WÄHLEN", locked: "Schaffe zuerst das vorige Level", boss: "Endgegner", close: "SCHLIESSEN" },
    ru: { btn: "🗺 ВЫБОР УРОВНЯ", title: "ВЫБОР УРОВНЯ", locked: "Пройди предыдущий уровень", boss: "Босс", close: "ЗАКРЫТЬ" }
};
const lsT = k => (LS_TEXT[lang] || LS_TEXT.en)[k];

// Kart renkleri ve simgeleri bölümün arka planına göre
const LEVEL_CARDS = {
    1: { ico: '⛓️', boss: 'bossName',    c1: '#166534', c2: '#4ade80' },
    2: { ico: '🪙', boss: 'kurtName',    c1: '#92400e', c2: '#fbbf24' },
    3: { ico: '📼', boss: 'sayacName',   c1: '#581c87', c2: '#c084fc' },
    4: { ico: '🗳️', boss: 'fetoName',    c1: '#1e293b', c2: '#94a3b8' },
    5: { ico: '🔋', boss: 'tankName',    c1: '#1e3a8a', c2: '#60a5fa' },
    6: { ico: '✈️', boss: 'tankerName',  c1: '#0369a1', c2: '#7dd3fc' },
    7: { ico: '🔐', boss: 'bylockName',  c1: '#7f1d1d', c2: '#f87171', puzzle: true },
    8: { ico: '❄️', boss: 'feto2Name',   c1: '#334155', c2: '#e2e8f0' },
    9: { ico: '🪕', boss: 'seloName',    c1: '#4a044e', c2: '#e879f9' }
};

// Açılan en yüksek bölüm. Adres çubuğuna ?bolum=hepsi yazılırsa hepsi açılır (deneme için).
let unlockedLevel = 1;
try { unlockedLevel = Math.min(MAX_LEVEL, Math.max(1, parseInt(localStorage.getItem('hirhizUnlocked') || '1', 10) || 1)); } catch (e) {}
if (/[?&]bolum=hepsi/.test(location.search)) unlockedLevel = MAX_LEVEL;
function unlockLevel(n) {
    n = Math.min(MAX_LEVEL, n);
    if (n <= unlockedLevel) return;
    unlockedLevel = n;
    try { localStorage.setItem('hirhizUnlocked', String(n)); } catch (e) {}
}

// "GÖREV 3: KASETLERİ SIFIRLA" → "KASETLERİ SIFIRLA"
const missionName = n => { const s = storyT(`m${n}t`) || ''; const i = s.indexOf(':'); return (i >= 0 ? s.slice(i + 1) : s).trim(); };

function renderLevelSelect() {
    $('levels-btn').textContent = lsT('btn');
    let cards = '';
    for (let n = 1; n <= MAX_LEVEL; n++) {
        const C = LEVEL_CARDS[n], open = n <= unlockedLevel;
        cards += `<button type="button" class="lvl-card${open ? '' : ' locked'}" data-level="${n}" ${open ? '' : 'disabled'}
                    style="--c1:${C.c1};--c2:${C.c2}">
            <span class="lvl-num">${n}</span>
            <span class="lvl-ico">${open ? C.ico : '🔒'}</span>
            <span class="lvl-name">${open ? missionName(n) : lsT('locked')}</span>
            ${open ? `<span class="lvl-boss">${C.puzzle ? '🧩' : '👹'} ${t(C.boss)}</span>` : ''}
            ${open && bestStars[n] ? `<span class="lvl-stars">${starText(bestStars[n])}</span>` : ''}
        </button>`;
    }
    $('levels-panel').innerHTML = `<h2>${lsT('title')}</h2><div class="lvl-grid">${cards}</div>
        <button id="levels-close" class="lang-btn" type="button">${lsT('close')}</button>`;
    $('levels-panel').querySelectorAll('.lvl-card:not(.locked)').forEach(b =>
        b.addEventListener('click', () => pickLevel(+b.dataset.level)));
    $('levels-close').onclick = closeLevelSelect;
}
function openLevelSelect() {
    renderLevelSelect();
    $('levels').style.display = 'flex';
    $('levels-panel').scrollTop = 0;
}
function closeLevelSelect() { $('levels').style.display = 'none'; }
const levelSelectOpen = () => $('levels').style.display === 'flex';

function pickLevel(n) {
    closeLevelSelect();
    startLevelChoice = n;
    initAudio();
    goFullscreenLandscape();
    if (!howtoSeen()) openHowto(true);   // ilk kez oynayana önce kurallar
    else startGame();
}
