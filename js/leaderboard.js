// Dünya sıralaması: oyuncular isimleriyle en yüksek hazinelerini paylaşır.
// Sunucu: Firebase Realtime Database (REST, anahtar gerekmez). LB_URL boşsa sıralama kapalıdır ("henüz açılmadı" yazar).
// Her tarayıcı kendine rastgele bir kimlik alır (hirhizPid); sunucuda kimlik başına tek satır tutulur, yalnızca rekor kırılınca güncellenir.
// İsim (hirhizName) ilk bölüm sonunda karnenin altında sorulur; SIRALAMA panelinden değiştirilebilir.
// Firebase kuralları (Realtime Database → Kurallar):
// { "rules": { "scores": { ".read": true, ".indexOn": ["s"], "$pid": { ".write": true,
//   ".validate": "newData.hasChildren(['n','s']) && newData.child('n').isString() && newData.child('n').val().length >= 1 && newData.child('n').val().length <= 16 && newData.child('s').isNumber() && newData.child('s').val() >= 0 && newData.child('s').val() < 100000000 && (!data.exists() || newData.child('s').val() >= data.child('s').val())" } } } }
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

const LB_URL = '';   // ör. 'https://hirhiz-12345-default-rtdb.europe-west1.firebasedatabase.app'
const LB_TOP = 50;

const LB_TEXT = {
    tr: { btn: "🌍 SIRALAMA", title: "DÜNYA SIRALAMASI", ask: "Dünya sıralamasına girmek için adını yaz:", ph: "Adın", save: "KAYDET", name: "Adın", change: "DEĞİŞTİR",
          loading: "Yükleniyor...", error: "Sıralamaya ulaşılamadı. İnternet bağlantını kontrol et.", off: "Dünya sıralaması henüz açılmadı.", empty: "Henüz kimse yok, ilk sen ol!",
          close: "KAPAT", colName: "İsim", colScore: "Hazine", colLvl: "Bölüm", you: "sen", rank: "Sıralamadaki yerin", sent: "Skorun gönderildi!", yourBest: "Senin rekorun" },
    en: { btn: "🌍 RANKING", title: "WORLD RANKING", ask: "Type your name to join the world ranking:", ph: "Your name", save: "SAVE", name: "Your name", change: "CHANGE",
          loading: "Loading...", error: "Couldn't reach the ranking. Check your connection.", off: "The world ranking isn't open yet.", empty: "Nobody here yet, be the first!",
          close: "CLOSE", colName: "Name", colScore: "Treasure", colLvl: "Level", you: "you", rank: "Your rank", sent: "Score sent!", yourBest: "Your best" },
    fr: { btn: "🌍 CLASSEMENT", title: "CLASSEMENT MONDIAL", ask: "Écris ton nom pour entrer dans le classement mondial :", ph: "Ton nom", save: "ENREGISTRER", name: "Ton nom", change: "CHANGER",
          loading: "Chargement...", error: "Classement injoignable. Vérifie ta connexion.", off: "Le classement mondial n'est pas encore ouvert.", empty: "Personne pour l'instant, sois le premier !",
          close: "FERMER", colName: "Nom", colScore: "Trésor", colLvl: "Niveau", you: "toi", rank: "Ton rang", sent: "Score envoyé !", yourBest: "Ton record" },
    nl: { btn: "🌍 RANGLIJST", title: "WERELDRANGLIJST", ask: "Typ je naam om op de wereldranglijst te komen:", ph: "Je naam", save: "OPSLAAN", name: "Je naam", change: "WIJZIGEN",
          loading: "Laden...", error: "Ranglijst niet bereikbaar. Controleer je verbinding.", off: "De wereldranglijst is nog niet open.", empty: "Nog niemand, wees de eerste!",
          close: "SLUITEN", colName: "Naam", colScore: "Schat", colLvl: "Level", you: "jij", rank: "Jouw plaats", sent: "Score verstuurd!", yourBest: "Jouw record" },
    de: { btn: "🌍 RANGLISTE", title: "WELTRANGLISTE", ask: "Gib deinen Namen ein, um in die Weltrangliste zu kommen:", ph: "Dein Name", save: "SPEICHERN", name: "Dein Name", change: "ÄNDERN",
          loading: "Lädt...", error: "Rangliste nicht erreichbar. Prüfe deine Verbindung.", off: "Die Weltrangliste ist noch nicht geöffnet.", empty: "Noch niemand da, sei der Erste!",
          close: "SCHLIESSEN", colName: "Name", colScore: "Schatz", colLvl: "Level", you: "du", rank: "Dein Platz", sent: "Punkte gesendet!", yourBest: "Dein Rekord" },
    ru: { btn: "🌍 РЕЙТИНГ", title: "МИРОВОЙ РЕЙТИНГ", ask: "Впиши своё имя, чтобы попасть в мировой рейтинг:", ph: "Твоё имя", save: "СОХРАНИТЬ", name: "Твоё имя", change: "ИЗМЕНИТЬ",
          loading: "Загрузка...", error: "Рейтинг недоступен. Проверь подключение.", off: "Мировой рейтинг ещё не открыт.", empty: "Пока никого нет, будь первым!",
          close: "ЗАКРЫТЬ", colName: "Имя", colScore: "Казна", colLvl: "Уровень", you: "ты", rank: "Твоё место", sent: "Счёт отправлен!", yourBest: "Твой рекорд" }
};
const lbT = k => (LB_TEXT[lang] || LB_TEXT.en)[k];

// --- yerel bilgiler ---
const lbGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lbSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
let lbPid = lbGet('hirhizPid');
if (!lbPid) { lbPid = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); lbSet('hirhizPid', lbPid); }
let lbName = lbGet('hirhizName') || '';
let lbBest = +(lbGet('hirhizLbBest') || 0);         // sunucuya gönderilen en yüksek skor
let lbBestLevel = +(lbGet('hirhizLbLevel') || 0);
const lbOn = () => !!LB_URL;

// İsim: baştaki/sondaki boşluklar atılır, kontrol karakterleri ve < > silinir, en çok 16 harf
function cleanName(s) {
    return Array.from(String(s || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim()).slice(0, 16).join('');
}
const escHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// --- sunucu ---
async function lbPut(s, level) {
    const r = await fetch(`${LB_URL}/scores/${lbPid}.json`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n: lbName, s, l: level, d: difficulty, t: { '.sv': 'timestamp' } })
    });
    if (!r.ok) throw new Error('lb ' + r.status);
}
async function lbFetchTop() {
    const r = await fetch(`${LB_URL}/scores.json?orderBy=%22s%22&limitToLast=${LB_TOP}`);
    if (!r.ok) throw new Error('lb ' + r.status);
    const data = (await r.json()) || {};
    return Object.entries(data).map(([id, v]) => ({ id, n: cleanName(v.n) || '?', s: +v.s || 0, l: +v.l || 0, d: v.d }))
        .sort((a, b) => b.s - a.s);
}
// Rekor kırıldıysa gönderir; dönüş: gönderildi mi
async function lbSubmit() {
    if (!lbOn() || !lbName || score <= lbBest) return false;
    const s = score, lv = Math.max(lbBestLevel, currentLevel);
    await lbPut(s, lv);
    lbBest = s; lbBestLevel = lv;
    lbSet('hirhizLbBest', String(s)); lbSet('hirhizLbLevel', String(lv));
    return true;
}

// --- bölüm sonu: karnenin altında isim sorulur ya da skor gönderilip sıradaki yer yazılır ---
function lbAfterLevel() {
    if (!lbOn()) return;
    const box = document.createElement('div');
    box.className = 'lb-box';
    $('report').appendChild(box);
    if (!lbName) { renderNameForm(box, () => lbAfterLevelSend(box)); return; }
    lbAfterLevelSend(box);
}
async function lbAfterLevelSend(box) {
    box.textContent = '🌍 ' + lbT('loading');
    try {
        const sent = await lbSubmit();
        const top = await lbFetchTop();
        const i = top.findIndex(r => r.id === lbPid);
        box.textContent = '🌍 ' + (sent ? lbT('sent') + ' ' : '') + (i >= 0 ? `${lbT('rank')}: #${i + 1}` : `${lbT('yourBest')}: ${lbBest}`);
    } catch (e) { box.textContent = '🌍 ' + lbT('error'); }
}
function renderNameForm(box, onSaved) {
    box.innerHTML = `<div class="lb-ask">🌍 ${lbT('ask')}</div>
        <form class="lb-form"><input class="lb-input" maxlength="16" autocomplete="nickname" placeholder="${escHtml(lbT('ph'))}" value="${escHtml(lbName)}">
        <button class="lang-btn" type="submit">${lbT('save')}</button></form>`;
    const input = box.querySelector('input');
    box.querySelector('form').onsubmit = e => {
        e.preventDefault();
        const n = cleanName(input.value);
        if (!n) { input.focus(); return; }
        const changed = n !== lbName;
        lbName = n; lbSet('hirhizName', n);
        if (changed && lbBest > 0) lbPut(lbBest, lbBestLevel).catch(() => {});   // sunucudaki satırın adı da değişsin
        onSaved();
    };
}

// --- SIRALAMA paneli ---
function openRanking() {
    $('ranks').style.display = 'flex';
    renderRanking();
}
function closeRanking() { $('ranks').style.display = 'none'; }
const rankingOpen = () => $('ranks').style.display === 'flex';
async function renderRanking() {
    const P = $('ranks-panel');
    P.innerHTML = `<h2>${lbT('title')}</h2><div id="lb-me"></div><div id="lb-list"></div>
        <button id="ranks-close" class="lang-btn" type="button">${lbT('close')}</button>`;
    $('ranks-close').onclick = closeRanking;
    const list = $('lb-list');
    if (!lbOn()) { list.innerHTML = `<p class="lb-msg">${lbT('off')}</p>`; return; }
    renderMe();
    list.innerHTML = `<p class="lb-msg">${lbT('loading')}</p>`;
    try {
        const top = await lbFetchTop();
        if (!rankingOpen()) return;
        if (!top.length) { list.innerHTML = `<p class="lb-msg">${lbT('empty')}</p>`; return; }
        const medal = i => ['🥇', '🥈', '🥉'][i] || (i + 1);
        list.innerHTML = `<table class="lb-table"><thead><tr><th>#</th><th>${lbT('colName')}</th><th>${lbT('colScore')}</th><th>${lbT('colLvl')}</th></tr></thead><tbody>${
            top.map((r, i) => `<tr class="${r.id === lbPid ? 'me' : ''}"><td>${medal(i)}</td><td>${escHtml(r.n)}${r.id === lbPid ? ` <small>(${lbT('you')})</small>` : ''}</td>
                <td>${r.s.toLocaleString()}</td><td>${r.l || '-'}${DIFF_ORDER.includes(r.d) ? ` <small>${escHtml(dfT(r.d))}</small>` : ''}</td></tr>`).join('')}</tbody></table>`;
    } catch (e) { list.innerHTML = `<p class="lb-msg">${lbT('error')}</p>`; }
}
// Panelin üstünde: adın (değiştirilebilir) ve rekorun
function renderMe() {
    const me = $('lb-me');
    if (!me) return;
    if (!lbName) { renderNameForm(me, () => { renderRanking(); }); return; }
    me.innerHTML = `<div class="lb-ask">${lbT('name')}: <b>${escHtml(lbName)}</b>${lbBest ? ` · ${lbT('yourBest')}: <b>${lbBest.toLocaleString()}</b>` : ''}
        <button class="lang-btn lb-change" type="button">${lbT('change')}</button></div>`;
    me.querySelector('.lb-change').onclick = () => renderNameForm(me, () => renderRanking());
}
function renderRankBtn() { const b = $('rank-btn'); if (b) b.textContent = lbT('btn'); }
