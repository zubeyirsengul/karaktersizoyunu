// 7. bölüm: BYLOCK şifre kırma bulmacası (polis, platform, canavar yok)
// 4 farklı rakamlı şifre tahmin edilir. Her tahminde kutular boyanır:
//   yeşil = rakam doğru yerde, sarı = rakam şifrede var ama yeri yanlış, gri = rakam şifrede yok.
// Hak bitince "İNDİRDİN Mİ?" der, şifre değişir ve yeni tur başlar. Şifre çözülünce bölüm biter.
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

const isPuzzle = () => curLevel().mode === 'puzzle';
const PZ_LEN = 4, PZ_TRIES = 8, PZ_GOOD = 5;   // PZ_GOOD: 3. yıldız için en çok bu kadar tahmin

const PZ_TEXT = {
    tr: { app: "ByLock", sub: "Şifre 4 farklı rakam. Kır, liste çıksın!", legG: "doğru yer", legY: "var, yeri yanlış", legX: "yok",
          left: "Kalan hak", round: "Tur", fail: "İNDİRDİN Mİ?! Şifre {code} idi, değiştirildi!", win: "ŞİFRE ÇÖZÜLDÜ! Liste hazır: herkes ihraç!",
          need: "4 rakam gir", c1: "Şifreyi çöz", c2: "İlk turda çöz", c3: "En çok 5 tahminde çöz", guesses: "Tahmin", rounds: "Tur" },
    en: { app: "ByLock", sub: "The code is 4 different digits. Crack it, get the list!", legG: "right spot", legY: "in code, wrong spot", legX: "not in code",
          left: "Tries left", round: "Round", fail: "DID YOU DOWNLOAD IT?! The code was {code}, now it's changed!", win: "CODE CRACKED! The list is ready: purge everyone!",
          need: "Enter 4 digits", c1: "Crack the code", c2: "Crack it in round one", c3: "Crack it in 5 guesses or less", guesses: "Guesses", rounds: "Rounds" },
    fr: { app: "ByLock", sub: "Le code : 4 chiffres différents. Casse-le, sors la liste !", legG: "bonne place", legY: "présent, mal placé", legX: "absent",
          left: "Essais restants", round: "Manche", fail: "TU L'AS TÉLÉCHARGÉ ?! Le code était {code}, il a changé !", win: "CODE CASSÉ ! La liste est prête : tout le monde radié !",
          need: "Entre 4 chiffres", c1: "Casser le code", c2: "Dès la 1re manche", c3: "En 5 essais max", guesses: "Essais", rounds: "Manches" },
    nl: { app: "ByLock", sub: "De code is 4 verschillende cijfers. Kraak hem, krijg de lijst!", legG: "goede plek", legY: "zit erin, verkeerde plek", legX: "zit er niet in",
          left: "Pogingen over", round: "Ronde", fail: "HEB JE HET GEDOWNLOAD?! De code was {code}, nu veranderd!", win: "CODE GEKRAAKT! De lijst is klaar: iedereen ontslagen!",
          need: "Voer 4 cijfers in", c1: "Kraak de code", c2: "In de eerste ronde", c3: "In max. 5 pogingen", guesses: "Pogingen", rounds: "Rondes" },
    de: { app: "ByLock", sub: "Der Code: 4 verschiedene Ziffern. Knack ihn, hol die Liste!", legG: "richtige Stelle", legY: "drin, falsche Stelle", legX: "nicht drin",
          left: "Versuche übrig", round: "Runde", fail: "HAST DU ES GELADEN?! Der Code war {code}, jetzt geändert!", win: "CODE GEKNACKT! Die Liste ist fertig: alle entlassen!",
          need: "Gib 4 Ziffern ein", c1: "Code knacken", c2: "In der ersten Runde", c3: "In höchstens 5 Versuchen", guesses: "Versuche", rounds: "Runden" },
    ru: { app: "ByLock", sub: "Код — 4 разные цифры. Взломай, получи список!", legG: "на месте", legY: "есть, не на месте", legX: "нет",
          left: "Осталось попыток", round: "Раунд", fail: "ТЫ ЕГО СКАЧАЛ?! Код был {code}, теперь сменён!", win: "КОД ВЗЛОМАН! Список готов: уволить всех!",
          need: "Введи 4 цифры", c1: "Взломай код", c2: "С первого раунда", c3: "Не больше 5 попыток", guesses: "Попыток", rounds: "Раундов" }
};
const pzT = k => (PZ_TEXT[lang] || PZ_TEXT.en)[k];

// Telefonun altında kayan haber bandı (gerçek olaylar; oyun içi yazı olduğu için Türkçe)
const PZ_TICKER = "BYLOCK LİSTELERİ AÇIKLANDI • 'MOR BEYİN' UYGULAMASI: 11 BİN 480 KİŞİNİN LİSTEDE YANLIŞLIKLA YER ALDIĞI ORTAYA ÇIKTI • KHK İLE 125 BİNDEN FAZLA KAMU GÖREVLİSİ İHRAÇ EDİLDİ • ÖĞRETMENLER, AKADEMİSYENLER, GAZETECİLER DE LİSTEDE • ";

let pz = null;   // { code, rows: [{guess, marks}], cur, round, guesses, lastRoundGuesses, locked, solved }

function newPuzzleCode() {
    const d = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
    return d.slice(0, PZ_LEN).join('');
}
// 'g' doğru yer, 'y' var ama yeri yanlış, 'x' yok
const scoreGuess = (code, guess) => [...guess].map((c, i) => code[i] === c ? 'g' : code.includes(c) ? 'y' : 'x');

function createPuzzle() {
    pz = { code: newPuzzleCode(), rows: [], cur: '', round: 1, guesses: 0, lastRoundGuesses: 0, locked: false, solved: false, msg: '' };
    document.body.classList.add('puzzle');
    $('puzzle').style.display = 'flex';
    renderPuzzle();
}
function closePuzzle() {
    pz = null;
    document.body.classList.remove('puzzle');
    $('puzzle').style.display = 'none';
}

// Klavyede görülen rakamların en iyi durumu (yeşil > sarı > gri)
function keyStates() {
    const st = {}, rank = { g: 3, y: 2, x: 1 };
    pz.rows.forEach(r => [...r.guess].forEach((c, i) => { if (!st[c] || rank[r.marks[i]] > rank[st[c]]) st[c] = r.marks[i]; }));
    return st;
}

function renderPuzzle() {
    if (!pz) return;
    let rows = '';
    for (let i = 0; i < PZ_TRIES; i++) {
        const r = pz.rows[i], active = i === pz.rows.length && !pz.locked;
        let cells = '';
        for (let j = 0; j < PZ_LEN; j++) {
            const ch = r ? r.guess[j] : active ? (pz.cur[j] || '') : '';
            const cls = r ? ' ' + r.marks[j] : active && ch ? ' typed' : '';
            cells += `<span class="pz-cell${cls}" style="--d:${j * 0.12}s">${ch}</span>`;
        }
        rows += `<div class="pz-row${active ? ' active' : ''}${active && pz.shake ? ' shake' : ''}">${cells}</div>`;
    }
    const ks = keyStates();
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✔'].map(k => {
        const used = /\d/.test(k) && pz.cur.includes(k);
        return `<button type="button" class="pz-key${ks[k] ? ' ' + ks[k] : ''}${used ? ' used' : ''}${k === '✔' ? ' ok' : ''}${k === '⌫' ? ' del' : ''}" data-k="${k}">${k}</button>`;
    }).join('');
    const left = PZ_TRIES - pz.rows.length;
    $('puzzle').innerHTML = `
      <div class="pz-phone">
        <div class="pz-bar"><span class="pz-lock">🔒</span><b>${pzT('app')}</b><span class="pz-round">${pzT('round')} ${pz.round}</span></div>
        <div class="pz-body">
          <div class="pz-board">${rows}</div>
          <div class="pz-side">
            <p class="pz-sub">${pzT('sub')}</p>
            <div class="pz-legend"><span><i class="g"></i>${pzT('legG')}</span><span><i class="y"></i>${pzT('legY')}</span><span><i class="x"></i>${pzT('legX')}</span></div>
            <div class="pz-keys">${keys}</div>
            <div class="pz-left">${pzT('left')}: <b>${left}</b></div>
            <div class="pz-msg${pz.solved ? ' win' : pz.msg ? ' fail' : ''}">${pz.msg}</div>
          </div>
        </div>
        <div class="pz-ticker"><b>${bgT("SON DAKİKA")}</b><div class="pz-tick-wrap"><span>${bgT(PZ_TICKER)}</span></div></div>
      </div>`;
    $('puzzle').querySelectorAll('.pz-key').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); puzzleInput(b.dataset.k); }));
    pz.shake = false;
}

function puzzleInput(k) {
    if (!pz || pz.locked || levelCompleted) return;
    if (userPaused) setUserPause(false);   // sekmeden dönünce ilk dokunuş oyunu sürdürür
    if (/^\d$/.test(k)) {
        if (pz.cur.length >= PZ_LEN || pz.cur.includes(k)) return;   // rakamlar farklı
        pz.cur += k; pz.msg = '';
        playSfx('hit', { rate: 2.2, vol: 0.15 });
    } else if (k === '⌫') {
        pz.cur = pz.cur.slice(0, -1);
    } else if (k === '✔') {
        if (pz.cur.length < PZ_LEN) { pz.msg = pzT('need'); pz.shake = true; renderPuzzle(); return; }
        submitGuess();
        return;
    }
    renderPuzzle();
}

function submitGuess() {
    const guess = pz.cur, marks = scoreGuess(pz.code, guess);
    pz.rows.push({ guess, marks }); pz.cur = ''; pz.guesses++; pz.msg = '';
    marks.forEach((m, i) => setTimeout(() => playSfx('hit', { rate: m === 'g' ? 1.8 : m === 'y' ? 1.4 : 0.9, vol: 0.3 }), i * 120));
    if (guess === pz.code) {
        pz.solved = true; pz.locked = true; pz.lastRoundGuesses = pz.rows.length;
        pz.msg = pzT('win');
        levelEnding = true;
        renderPuzzle();
        setTimeout(() => { if (pz && pz.solved) { addScore(50000); $('score').innerText = score; completeLevel(); } }, 2400);
        return;
    }
    if (pz.rows.length >= PZ_TRIES) {
        // Hak bitti: şifre gösterilir, değişir, yeni tur
        pz.locked = true;
        pz.msg = pzT('fail').replace('{code}', pz.code);
        levelStats.deaths++; levelStats.lost++;
        playSfx('voice_ouch');
        renderPuzzle();
        setTimeout(() => {
            if (!pz || levelCompleted) return;
            pz.code = newPuzzleCode(); pz.rows = []; pz.round++; pz.locked = false; pz.msg = '';
            renderPuzzle();
        }, 2800);
        return;
    }
    renderPuzzle();
}

function puzzleKey(e) {
    if (e.key === 'Backspace') { e.preventDefault(); puzzleInput('⌫'); }
    else if (e.key === 'Enter') puzzleInput('✔');
    else if (/^\d$/.test(e.key)) puzzleInput(e.key);
}

// Karne için bulmacaya özel ölçütler
function puzzleReport() {
    const solvedIn = pz ? pz.lastRoundGuesses : PZ_TRIES;
    return {
        crit: [['c1', true], ['c2', levelStats.deaths === 0], ['c3', solvedIn <= PZ_GOOD]].map(([k, ok]) => [pzT(k), ok]),
        stats: `🔢 ${pzT('guesses')}: <b>${pz ? pz.guesses : 0}</b> · 🔁 ${pzT('rounds')}: <b>${pz ? pz.round : 1}</b>`
    };
}
