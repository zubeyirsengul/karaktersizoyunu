// Diller: metinler, dil seçimi
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- DİLLER ---
const LANGS = {
    tr: {
        title: "OMURGASIZ - Sesli Edition",
        note: "\"Bu omurgasız bir yüzükle çıkmıştı yollara..\"",
        desc: "Kul Hakkı Torbalarını Topla!",
        best: "Rekor", newRecord: "YENİ REKOR!", pwSpeed: "HIZ!", pwDouble: "ÇİFT ZIPLAMA!", pwHammer: "DEV BALYOZ!", pwHeart: "+1 CAN!", pwStar: "DOKUNULMAZ!",
        start: "OYUNU BAŞLAT",
        treasure: "Hazine", level: "Seviye", kills: "Leş", pausedTitle: "DURAKLATILDI", pausedHint: "Devam etmek için ESC, P ya da ⏸",
        shoot: "FIRLAT", jump: "ZIPLA", hammer: "BALYOZ", shield: "KALKAN",
        die: "GEBER!", hit: "aaah", pickup: "MİS!",
        l1Title: "BÖLÜM 1 TAMAM!", l1Note: "Torbaları mideye indirdin! Şimdi sıra ikinci bölümde.", l1Btn: "2. BÖLÜME GEÇ",
        winTitle: "ZAFER SİZİN!", winNote: "Karnımız doydu, ekonomi bitti!", winBtn: "TEKRAR OYNA",
        bag: ["KUL", "HAKKI"],
        voices: ["Ham!", "Gelsin paracıklar!", "Yarasın!", "Çok lezzetli!", "Kul hakkı gibisi yok!"],
        ouch: "Eyvah!", enemyCry: "ANAM",
        bossName: "ALEVİ", bossIntro: "BÖLÜM SONU CANAVARI!", kurtName: "KURT", policeCry: "DOSYA KAPANDI!",
        l2Title: "BÖLÜM 2 TAMAM!", l2Note: "Kurt da gitti! Sıra FETÖ'de.", l2Btn: "3. BÖLÜME GEÇ", fetoName: "FETÖ",
        doorOpen: "KAPI AÇILDI!", gateHint: "KAPI",
        soundOn: "🔊 SESİ AÇ", soundOff: "🔇 SESİ KAPAT"
    },
    en: {
        title: "OMURGASIZ - Voice Edition",
        note: "\"This spineless one set out on the road with a ring..\"",
        desc: "Collect the People's Due Bags!",
        best: "Best", newRecord: "NEW RECORD!", pwSpeed: "SPEED!", pwDouble: "DOUBLE JUMP!", pwHammer: "GIANT HAMMER!", pwHeart: "+1 LIFE!", pwStar: "INVINCIBLE!",
        start: "START GAME",
        treasure: "Treasure", level: "Level", kills: "Kills", pausedTitle: "PAUSED", pausedHint: "Press ESC, P or ⏸ to continue",
        shoot: "THROW", jump: "JUMP", hammer: "HAMMER", shield: "SHIELD",
        die: "YOU'RE DONE!", hit: "aaah", pickup: "YUM!",
        l1Title: "LEVEL 1 COMPLETE!", l1Note: "You gobbled up the bags! Now on to level two.", l1Btn: "GO TO LEVEL 2",
        winTitle: "VICTORY IS YOURS!", winNote: "Our bellies are full, the economy is finished!", winBtn: "PLAY AGAIN",
        bag: ["PEOPLE'S", "DUE"],
        voices: ["Nom!", "Come to me, money!", "Enjoy!", "So delicious!", "Nothing beats the people's due!"],
        ouch: "Uh oh!", enemyCry: "MAMA!",
        bossName: "ALEVİ", bossIntro: "BOSS FIGHT!", kurtName: "KURT", policeCry: "CASE CLOSED!",
        l2Title: "LEVEL 2 COMPLETE!", l2Note: "The wolf is gone! Now it's FETÖ's turn.", l2Btn: "GO TO LEVEL 3", fetoName: "FETÖ",
        doorOpen: "THE GATE IS OPEN!", gateHint: "GATE",
        soundOn: "🔊 SOUND ON", soundOff: "🔇 SOUND OFF"
    },
    fr: {
        title: "OMURGASIZ - Édition Vocale",
        note: "« Cet invertébré avait pris la route avec une bague.. »",
        desc: "Ramasse les sacs du Droit du Peuple !",
        best: "Record", newRecord: "NOUVEAU RECORD !", pwSpeed: "VITESSE !", pwDouble: "DOUBLE SAUT !", pwHammer: "MARTEAU GÉANT !", pwHeart: "+1 VIE !", pwStar: "INVINCIBLE !",
        start: "LANCER LE JEU",
        treasure: "Trésor", level: "Niveau", kills: "Éliminés", pausedTitle: "PAUSE", pausedHint: "ESC, P ou ⏸ pour continuer",
        shoot: "LANCER", jump: "SAUTER", hammer: "MARTEAU", shield: "BOUCLIER",
        die: "CREVÉ !", hit: "aaah", pickup: "MIAM !",
        l1Title: "NIVEAU 1 TERMINÉ !", l1Note: "Tu as englouti les sacs ! Place au deuxième niveau.", l1Btn: "NIVEAU 2",
        winTitle: "LA VICTOIRE EST À VOUS !", winNote: "Nos ventres sont pleins, l'économie est finie !", winBtn: "REJOUER",
        bag: ["DROIT DU", "PEUPLE"],
        voices: ["Miam !", "Venez, petits sous !", "Bon appétit !", "Délicieux !", "Rien ne vaut le bien du peuple !"],
        ouch: "Oh non !", enemyCry: "MAMAN !",
        bossName: "ALEVİ", bossIntro: "BOSS DE FIN !", kurtName: "KURT", policeCry: "AFFAIRE CLASSÉE !",
        l2Title: "NIVEAU 2 TERMINÉ !", l2Note: "Le loup est parti ! Au tour de FETÖ.", l2Btn: "NIVEAU 3", fetoName: "FETÖ",
        doorOpen: "LA PORTE EST OUVERTE !", gateHint: "PORTE",
        soundOn: "🔊 ACTIVER LE SON", soundOff: "🔇 COUPER LE SON"
    },
    nl: {
        title: "OMURGASIZ - Spraakeditie",
        note: "\"Deze ruggengraatloze was met een ring op pad gegaan..\"",
        desc: "Verzamel de Volksrecht-zakken!",
        best: "Record", newRecord: "NIEUW RECORD!", pwSpeed: "SNELHEID!", pwDouble: "DUBBELE SPRONG!", pwHammer: "REUZENHAMER!", pwHeart: "+1 LEVEN!", pwStar: "ONKWETSBAAR!",
        start: "SPEL STARTEN",
        treasure: "Schat", level: "Level", kills: "Gedood", pausedTitle: "GEPAUZEERD", pausedHint: "Druk op ESC, P of ⏸ om verder te gaan",
        shoot: "GOOIEN", jump: "SPRINGEN", hammer: "MOKER", shield: "SCHILD",
        die: "KAPOT!", hit: "aaah", pickup: "LEKKER!",
        l1Title: "LEVEL 1 VOLTOOID!", l1Note: "Je hebt de zakken verslonden! Nu door naar level twee.", l1Btn: "NAAR LEVEL 2",
        winTitle: "DE OVERWINNING IS VAN JOU!", winNote: "Onze buiken zijn vol, de economie is op!", winBtn: "OPNIEUW SPELEN",
        bag: ["VOLKS", "RECHT"],
        voices: ["Hap!", "Kom maar, geldjes!", "Eet smakelijk!", "Heerlijk!", "Niets gaat boven volksrecht!"],
        ouch: "Oei!", enemyCry: "MAMA!",
        bossName: "ALEVİ", bossIntro: "EINDBAAS!", kurtName: "KURT", policeCry: "ZAAK GESLOTEN!",
        l2Title: "LEVEL 2 VOLTOOID!", l2Note: "De wolf is weg! Nu is FETÖ aan de beurt.", l2Btn: "NAAR LEVEL 3", fetoName: "FETÖ",
        doorOpen: "DE POORT IS OPEN!", gateHint: "POORT",
        soundOn: "🔊 GELUID AAN", soundOff: "🔇 GELUID UIT"
    },
    de: {
        title: "OMURGASIZ - Sprachausgabe",
        note: "„Dieser Rückgratlose war mit einem Ring losgezogen..“",
        desc: "Sammle die Volksrecht-Säcke!",
        best: "Rekord", newRecord: "NEUER REKORD!", pwSpeed: "TEMPO!", pwDouble: "DOPPELSPRUNG!", pwHammer: "RIESENHAMMER!", pwHeart: "+1 LEBEN!", pwStar: "UNVERWUNDBAR!",
        start: "SPIEL STARTEN",
        treasure: "Schatz", level: "Level", kills: "Erledigt", pausedTitle: "PAUSE", pausedHint: "ESC, P oder ⏸ zum Weiterspielen",
        shoot: "WERFEN", jump: "SPRINGEN", hammer: "HAMMER", shield: "SCHILD",
        die: "KAPUTT!", hit: "aaah", pickup: "LECKER!",
        l1Title: "LEVEL 1 GESCHAFFT!", l1Note: "Du hast die Säcke verschlungen! Weiter zu Level zwei.", l1Btn: "ZU LEVEL 2",
        winTitle: "DER SIEG GEHÖRT DIR!", winNote: "Die Bäuche sind voll, die Wirtschaft ist am Ende!", winBtn: "NOCHMAL SPIELEN",
        bag: ["VOLKS", "RECHT"],
        voices: ["Mampf!", "Her mit dem Geld!", "Guten Appetit!", "So lecker!", "Nichts geht über Volksrecht!"],
        ouch: "Oh nein!", enemyCry: "MAMA!",
        bossName: "ALEVİ", bossIntro: "ENDGEGNER!", kurtName: "KURT", policeCry: "FALL ABGESCHLOSSEN!",
        l2Title: "LEVEL 2 GESCHAFFT!", l2Note: "Der Wolf ist weg! Jetzt ist FETÖ dran.", l2Btn: "ZU LEVEL 3", fetoName: "FETÖ",
        doorOpen: "DAS TOR IST OFFEN!", gateHint: "TOR",
        soundOn: "🔊 TON AN", soundOff: "🔇 TON AUS"
    },
    ru: {
        title: "OMURGASIZ - Голосовая версия",
        note: "«Этот бесхребетный отправился в путь с кольцом..»",
        desc: "Собирай мешки народного добра!",
        best: "Рекорд", newRecord: "НОВЫЙ РЕКОРД!", pwSpeed: "СКОРОСТЬ!", pwDouble: "ДВОЙНОЙ ПРЫЖОК!", pwHammer: "ГИГАНТСКИЙ МОЛОТ!", pwHeart: "+1 ЖИЗНЬ!", pwStar: "НЕУЯЗВИМ!",
        start: "НАЧАТЬ ИГРУ",
        treasure: "Казна", level: "Уровень", kills: "Убито", pausedTitle: "ПАУЗА", pausedHint: "Нажмите ESC, P или ⏸, чтобы продолжить",
        shoot: "БРОСОК", jump: "ПРЫЖОК", hammer: "КУВАЛДА", shield: "ЩИТ",
        die: "КОНЕЦ!", hit: "aaah", pickup: "ВКУСНО!",
        l1Title: "УРОВЕНЬ 1 ПРОЙДЕН!", l1Note: "Ты проглотил мешки! Теперь второй уровень.", l1Btn: "НА УРОВЕНЬ 2",
        winTitle: "ПОБЕДА ЗА ВАМИ!", winNote: "Животы полны, экономике конец!", winBtn: "ИГРАТЬ СНОВА",
        bag: ["НАРОДНОЕ", "ДОБРО"],
        voices: ["Ам!", "Идите сюда, денежки!", "Приятного аппетита!", "Очень вкусно!", "Нет ничего лучше народного добра!"],
        ouch: "Ой-ой!", enemyCry: "МАМА!",
        bossName: "АЛЕВИ", bossIntro: "БОСС!", kurtName: "КУРТ", policeCry: "ДЕЛО ЗАКРЫТО!",
        l2Title: "УРОВЕНЬ 2 ПРОЙДЕН!", l2Note: "Волк повержен! Теперь очередь ФЕТÖ.", l2Btn: "НА УРОВЕНЬ 3", fetoName: "ФЕТÖ",
        doorOpen: "ВОРОТА ОТКРЫТЫ!", gateHint: "ВОРОТА",
        soundOn: "🔊 ВКЛЮЧИТЬ ЗВУК", soundOff: "🔇 ВЫКЛЮЧИТЬ ЗВУК"
    }
};

function detectLang() {
    try { const saved = localStorage.getItem('lang'); if (LANGS[saved]) return saved; } catch (e) {}
    const nav = (navigator.language || 'tr').slice(0, 2).toLowerCase();
    return LANGS[nav] ? nav : 'tr';
}
let lang = detectLang();
const t = key => LANGS[lang][key];

function applyLang(newLang) {
    lang = newLang;
    try { localStorage.setItem('lang', lang); } catch (e) {}
    document.documentElement.lang = lang;
    document.title = t('title');
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('.lang-btn[data-lang]').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    updateSoundBtn();
    try { updateBestUi(); } catch (e) {}   // rekor satırı da dile göre (yüklenirken henüz tanımlı olmayabilir)
    try { renderHowto(); } catch (e) {}
}
