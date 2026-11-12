// Diller: metinler, dil seçimi
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- DİLLER ---
const LANGS = {
    tr: {
        title: "HIRHIZ - Sesli Edition",
        note: "\"Bu HIRHIZ bir yüzükle çıkmıştı yollara...\"",
        desc: "Kul Hakkı Torbalarını Topla!",
        best: "Rekor", newRecord: "YENİ REKOR!", pwSpeed: "HIZ!", pwDouble: "ÇİFT ZIPLAMA!", pwHammer: "DEV BALYOZ!", pwHeart: "+1 CAN!", pwStar: "DOKUNULMAZ!",
        start: "OYUNU BAŞLAT",
        rotate: "Telefonu yan çevir",
        treasure: "Hazine", level: "Seviye", kills: "Leş", pausedTitle: "DURAKLATILDI", pausedHint: "Devam etmek için ESC, P ya da ⏸",
        bribe: "RÜŞVET", shoot: "RÜŞVET VER", jump: "ZIPLA", hammer: "BALYOZ", shield: "KALKAN",
        die: "GEBER!", hit: "aaah", pickup: "MİS!",
        l1Title: "BÖLÜM 1 TAMAM!", l1Note: "Park boşaltıldı, TOMA sustu! Şimdi sıra ikinci bölümde.", l1Btn: "2. BÖLÜME GEÇ",
        winTitle: "ZAFER SİZİN!", winNote: "Karnımız doydu, ekonomi bitti!", winBtn: "TEKRAR OYNA",
        bag: ["KUL", "HAKKI"],
        voices: ["Ham!", "Gelsin paracıklar!", "Yarasın!", "Çok lezzetli!", "Kul hakkı gibisi yok!"],
        ouch: "Eyvah!", enemyCry: "ANAM",
        bossName: "TOMA", bossIntro: "BÖLÜM SONU CANAVARI!", kurtName: "KURT", policeCry: "DOSYA KAPANDI!",
        l2Title: "BÖLÜM 2 TAMAM!", l2Note: "Altınlar geri geldi! Sıra 25 Aralık kasetlerinde.", l2Btn: "3. BÖLÜME GEÇ", fetoName: "FETÖ",
        doorOpen: "KAPI AÇILDI!", gateHint: "KAPI", rage: "ÖFKELENDİ!", secret: "GİZLİ HAZİNE!", live: "CANLI", checkpoint: "KONTROL NOKTASI!",
        soundOn: "🔊 SESİ AÇ", soundOff: "🔇 SESİ KAPAT",
        montaj: "MONTAJ!", tapeLabel: "SIFIRLA", exileCry: "SÜRGÜN!", surrender: "TESLİM!", expel: "İHRAÇ!", batteryOut: "ŞARJ BİTTİ!", charge: "ŞARJ!", khkHud: "İhraç edilen", role_teacher: "ÖĞRETMEN", role_journalist: "GAZETECİ", role_academic: "AKADEMİSYEN", role_student: "ÖĞRENCİ", sayacName: "PARA MAKİNESİ", tankName: "DARBE TANKI", tankerName: "TANKER UÇAK", bylockName: "BYLOCK", feto2Name: "FETÖ: SON", lvlDone: "BÖLÜM {n} TAMAM!", lvlNext: "{n}. BÖLÜME GEÇ", l3Note: "Kasetler montaj oldu, para makinesi sıfırlandı!", l4Note: "Sandık kurtuldu... ama FETÖ'yle iş bitmedi. 15 Temmuz geliyor!", l5Note: "FaceTime bağlantısı kopmadı! Şimdi uçağa!", l6Note: "İstanbul'a inildi! Sıra OHAL'de.", l7Note: "Herkes ihraç edildi... Sıra Pensilvanya'da!"
    },
    en: {
        title: "HIRHIZ - Voice Edition",
        note: "\"This HIRHIZ set out on the road with a ring...\"",
        desc: "Collect the People's Due Bags!",
        best: "Best", newRecord: "NEW RECORD!", pwSpeed: "SPEED!", pwDouble: "DOUBLE JUMP!", pwHammer: "GIANT HAMMER!", pwHeart: "+1 LIFE!", pwStar: "INVINCIBLE!",
        start: "START GAME",
        rotate: "Rotate your phone",
        treasure: "Treasure", level: "Level", kills: "Kills", pausedTitle: "PAUSED", pausedHint: "Press ESC, P or ⏸ to continue",
        bribe: "BRIBE", shoot: "BRIBE", jump: "JUMP", hammer: "HAMMER", shield: "SHIELD",
        die: "YOU'RE DONE!", hit: "aaah", pickup: "YUM!",
        l1Title: "LEVEL 1 COMPLETE!", l1Note: "The park is cleared, the TOMA is silenced! Now on to level two.", l1Btn: "GO TO LEVEL 2",
        winTitle: "VICTORY IS YOURS!", winNote: "Our bellies are full, the economy is finished!", winBtn: "PLAY AGAIN",
        bag: ["PEOPLE'S", "DUE"],
        voices: ["Nom!", "Come to me, money!", "Enjoy!", "So delicious!", "Nothing beats the people's due!"],
        ouch: "Uh oh!", enemyCry: "MAMA!",
        bossName: "TOMA", bossIntro: "BOSS FIGHT!", kurtName: "KURT", policeCry: "CASE CLOSED!",
        l2Title: "LEVEL 2 COMPLETE!", l2Note: "The gold is back! Next up: the December 25 tapes.", l2Btn: "GO TO LEVEL 3", fetoName: "FETÖ",
        doorOpen: "THE GATE IS OPEN!", gateHint: "GATE", rage: "ENRAGED!", secret: "SECRET TREASURE!", live: "LIVE", checkpoint: "CHECKPOINT!",
        soundOn: "🔊 SOUND ON", soundOff: "🔇 SOUND OFF",
        montaj: "FAKE!", tapeLabel: "ZERO IT", exileCry: "EXILED!", surrender: "SURRENDER!", expel: "PURGED!", batteryOut: "BATTERY DEAD!", charge: "CHARGED!", khkHud: "Purged", role_teacher: "TEACHER", role_journalist: "JOURNALIST", role_academic: "ACADEMIC", role_student: "STUDENT", sayacName: "MONEY COUNTER", tankName: "COUP TANK", tankerName: "TANKER PLANE", bylockName: "BYLOCK", feto2Name: "FETÖ: FINAL", lvlDone: "LEVEL {n} COMPLETE!", lvlNext: "GO TO LEVEL {n}", l3Note: "The tapes are 'fake', the money counter is zeroed!", l4Note: "The ballot box is safe... but FETÖ isn't done. July 15 is coming!", l5Note: "The FaceTime call held! Now to the plane!", l6Note: "Landed in Istanbul! State of emergency next.", l7Note: "Everyone's been purged... Next stop: Pennsylvania!"
    },
    fr: {
        title: "HIRHIZ - Édition Vocale",
        note: "« Ce HIRHIZ avait pris la route avec une bague... »",
        desc: "Ramasse les sacs du Droit du Peuple !",
        best: "Record", newRecord: "NOUVEAU RECORD !", pwSpeed: "VITESSE !", pwDouble: "DOUBLE SAUT !", pwHammer: "MARTEAU GÉANT !", pwHeart: "+1 VIE !", pwStar: "INVINCIBLE !",
        start: "LANCER LE JEU",
        rotate: "Tourne ton téléphone",
        treasure: "Trésor", level: "Niveau", kills: "Éliminés", pausedTitle: "PAUSE", pausedHint: "ESC, P ou ⏸ pour continuer",
        bribe: "POT-DE-VIN", shoot: "POT-DE-VIN", jump: "SAUTER", hammer: "MARTEAU", shield: "BOUCLIER",
        die: "CREVÉ !", hit: "aaah", pickup: "MIAM !",
        l1Title: "NIVEAU 1 TERMINÉ !", l1Note: "Le parc est évacué, le TOMA s'est tu ! Place au deuxième niveau.", l1Btn: "NIVEAU 2",
        winTitle: "LA VICTOIRE EST À VOUS !", winNote: "Nos ventres sont pleins, l'économie est finie !", winBtn: "REJOUER",
        bag: ["DROIT DU", "PEUPLE"],
        voices: ["Miam !", "Venez, petits sous !", "Bon appétit !", "Délicieux !", "Rien ne vaut le bien du peuple !"],
        ouch: "Oh non !", enemyCry: "MAMAN !",
        bossName: "TOMA", bossIntro: "BOSS DE FIN !", kurtName: "KURT", policeCry: "AFFAIRE CLASSÉE !",
        l2Title: "NIVEAU 2 TERMINÉ !", l2Note: "L'or est revenu ! Place aux cassettes du 25 décembre.", l2Btn: "NIVEAU 3", fetoName: "FETÖ",
        doorOpen: "LA PORTE EST OUVERTE !", gateHint: "PORTE", rage: "ENRAGÉ !", secret: "TRÉSOR CACHÉ !", live: "EN DIRECT", checkpoint: "POINT DE CONTRÔLE !",
        soundOn: "🔊 ACTIVER LE SON", soundOff: "🔇 COUPER LE SON",
        montaj: "MONTAGE !", tapeLabel: "À ZÉRO", exileCry: "EXIL !", surrender: "REDDITION !", expel: "RADIÉ !", batteryOut: "BATTERIE VIDE !", charge: "RECHARGÉ !", khkHud: "Radiés", role_teacher: "PROF", role_journalist: "JOURNALISTE", role_academic: "UNIVERSITAIRE", role_student: "ÉTUDIANT", sayacName: "COMPTEUSE", tankName: "TANK DU PUTSCH", tankerName: "RAVITAILLEUR", bylockName: "BYLOCK", feto2Name: "FETÖ : FINAL", lvlDone: "NIVEAU {n} TERMINÉ !", lvlNext: "NIVEAU {n}", l3Note: "Les cassettes sont des « montages », la compteuse est à zéro !", l4Note: "L'urne est sauvée... mais FETÖ n'a pas dit son dernier mot. Le 15 juillet approche !", l5Note: "L'appel FaceTime a tenu ! Vite, à l'avion !", l6Note: "Atterrissage à Istanbul ! Place à l'état d'urgence.", l7Note: "Tout le monde est radié... Prochaine étape : la Pennsylvanie !"
    },
    nl: {
        title: "HIRHIZ - Spraakeditie",
        note: "\"Deze HIRHIZ was met een ring op pad gegaan...\"",
        desc: "Verzamel de Volksrecht-zakken!",
        best: "Record", newRecord: "NIEUW RECORD!", pwSpeed: "SNELHEID!", pwDouble: "DUBBELE SPRONG!", pwHammer: "REUZENHAMER!", pwHeart: "+1 LEVEN!", pwStar: "ONKWETSBAAR!",
        start: "SPEL STARTEN",
        rotate: "Draai je telefoon",
        treasure: "Schat", level: "Level", kills: "Gedood", pausedTitle: "GEPAUZEERD", pausedHint: "Druk op ESC, P of ⏸ om verder te gaan",
        bribe: "SMEERGELD", shoot: "OMKOPEN", jump: "SPRINGEN", hammer: "MOKER", shield: "SCHILD",
        die: "KAPOT!", hit: "aaah", pickup: "LEKKER!",
        l1Title: "LEVEL 1 VOLTOOID!", l1Note: "Het park is ontruimd, de TOMA is stil! Nu door naar level twee.", l1Btn: "NAAR LEVEL 2",
        winTitle: "DE OVERWINNING IS VAN JOU!", winNote: "Onze buiken zijn vol, de economie is op!", winBtn: "OPNIEUW SPELEN",
        bag: ["VOLKS", "RECHT"],
        voices: ["Hap!", "Kom maar, geldjes!", "Eet smakelijk!", "Heerlijk!", "Niets gaat boven volksrecht!"],
        ouch: "Oei!", enemyCry: "MAMA!",
        bossName: "TOMA", bossIntro: "EINDBAAS!", kurtName: "KURT", policeCry: "ZAAK GESLOTEN!",
        l2Title: "LEVEL 2 VOLTOOID!", l2Note: "Het goud is terug! Nu de banden van 25 december.", l2Btn: "NAAR LEVEL 3", fetoName: "FETÖ",
        doorOpen: "DE POORT IS OPEN!", gateHint: "POORT", rage: "WOEDEND!", secret: "GEHEIME SCHAT!", live: "LIVE", checkpoint: "CHECKPOINT!",
        soundOn: "🔊 GELUID AAN", soundOff: "🔇 GELUID UIT",
        montaj: "MONTAGE!", tapeLabel: "OP NUL", exileCry: "VERBANNEN!", surrender: "OVERGAVE!", expel: "ONTSLAGEN!", batteryOut: "BATTERIJ LEEG!", charge: "OPGELADEN!", khkHud: "Ontslagen", role_teacher: "LERAAR", role_journalist: "JOURNALIST", role_academic: "ACADEMICUS", role_student: "STUDENT", sayacName: "GELDTELLER", tankName: "COUPTANK", tankerName: "TANKVLIEGTUIG", bylockName: "BYLOCK", feto2Name: "FETÖ: FINALE", lvlDone: "LEVEL {n} VOLTOOID!", lvlNext: "NAAR LEVEL {n}", l3Note: "De banden zijn 'montage', de geldteller staat op nul!", l4Note: "De stembus is gered... maar FETÖ is nog niet klaar. 15 juli komt eraan!", l5Note: "Het FaceTime-gesprek hield stand! Snel naar het vliegtuig!", l6Note: "Geland in Istanbul! Nu de noodtoestand.", l7Note: "Iedereen is ontslagen... Volgende halte: Pennsylvania!"
    },
    de: {
        title: "HIRHIZ - Sprachausgabe",
        note: "„Dieser HIRHIZ war mit einem Ring losgezogen...“",
        desc: "Sammle die Volksrecht-Säcke!",
        best: "Rekord", newRecord: "NEUER REKORD!", pwSpeed: "TEMPO!", pwDouble: "DOPPELSPRUNG!", pwHammer: "RIESENHAMMER!", pwHeart: "+1 LEBEN!", pwStar: "UNVERWUNDBAR!",
        start: "SPIEL STARTEN",
        rotate: "Dreh dein Handy",
        treasure: "Schatz", level: "Level", kills: "Erledigt", pausedTitle: "PAUSE", pausedHint: "ESC, P oder ⏸ zum Weiterspielen",
        bribe: "SCHMIERGELD", shoot: "BESTECHEN", jump: "SPRINGEN", hammer: "HAMMER", shield: "SCHILD",
        die: "KAPUTT!", hit: "aaah", pickup: "LECKER!",
        l1Title: "LEVEL 1 GESCHAFFT!", l1Note: "Der Park ist geräumt, der TOMA schweigt! Weiter zu Level zwei.", l1Btn: "ZU LEVEL 2",
        winTitle: "DER SIEG GEHÖRT DIR!", winNote: "Die Bäuche sind voll, die Wirtschaft ist am Ende!", winBtn: "NOCHMAL SPIELEN",
        bag: ["VOLKS", "RECHT"],
        voices: ["Mampf!", "Her mit dem Geld!", "Guten Appetit!", "So lecker!", "Nichts geht über Volksrecht!"],
        ouch: "Oh nein!", enemyCry: "MAMA!",
        bossName: "TOMA", bossIntro: "ENDGEGNER!", kurtName: "KURT", policeCry: "FALL ABGESCHLOSSEN!",
        l2Title: "LEVEL 2 GESCHAFFT!", l2Note: "Das Gold ist zurück! Jetzt die Bänder vom 25. Dezember.", l2Btn: "ZU LEVEL 3", fetoName: "FETÖ",
        doorOpen: "DAS TOR IST OFFEN!", gateHint: "TOR", rage: "WÜTEND!", secret: "GEHEIMER SCHATZ!", live: "LIVE", checkpoint: "CHECKPOINT!",
        soundOn: "🔊 TON AN", soundOff: "🔇 TON AUS",
        montaj: "MONTAGE!", tapeLabel: "AUF NULL", exileCry: "VERBANNT!", surrender: "KAPITULATION!", expel: "ENTLASSEN!", batteryOut: "AKKU LEER!", charge: "GELADEN!", khkHud: "Entlassen", role_teacher: "LEHRER", role_journalist: "JOURNALIST", role_academic: "AKADEMIKER", role_student: "STUDENT", sayacName: "GELDZÄHLER", tankName: "PUTSCH-PANZER", tankerName: "TANKFLUGZEUG", bylockName: "BYLOCK", feto2Name: "FETÖ: FINALE", lvlDone: "LEVEL {n} GESCHAFFT!", lvlNext: "ZU LEVEL {n}", l3Note: "Die Bänder sind „Montage“, der Geldzähler steht auf null!", l4Note: "Die Urne ist gerettet... aber FETÖ gibt nicht auf. Der 15. Juli naht!", l5Note: "Der FaceTime-Anruf hat gehalten! Schnell ins Flugzeug!", l6Note: "Gelandet in Istanbul! Jetzt der Ausnahmezustand.", l7Note: "Alle sind entlassen... Nächster Halt: Pennsylvania!"
    },
    ru: {
        title: "HIRHIZ - Голосовая версия",
        note: "«Этот HIRHIZ отправился в путь с кольцом...»",
        desc: "Собирай мешки народного добра!",
        best: "Рекорд", newRecord: "НОВЫЙ РЕКОРД!", pwSpeed: "СКОРОСТЬ!", pwDouble: "ДВОЙНОЙ ПРЫЖОК!", pwHammer: "ГИГАНТСКИЙ МОЛОТ!", pwHeart: "+1 ЖИЗНЬ!", pwStar: "НЕУЯЗВИМ!",
        start: "НАЧАТЬ ИГРУ",
        rotate: "Поверни телефон",
        treasure: "Казна", level: "Уровень", kills: "Убито", pausedTitle: "ПАУЗА", pausedHint: "Нажмите ESC, P или ⏸, чтобы продолжить",
        bribe: "ВЗЯТКА", shoot: "ВЗЯТКА", jump: "ПРЫЖОК", hammer: "КУВАЛДА", shield: "ЩИТ",
        die: "КОНЕЦ!", hit: "aaah", pickup: "ВКУСНО!",
        l1Title: "УРОВЕНЬ 1 ПРОЙДЕН!", l1Note: "Парк очищен, ТОМА замолчала! Теперь второй уровень.", l1Btn: "НА УРОВЕНЬ 2",
        winTitle: "ПОБЕДА ЗА ВАМИ!", winNote: "Животы полны, экономике конец!", winBtn: "ИГРАТЬ СНОВА",
        bag: ["НАРОДНОЕ", "ДОБРО"],
        voices: ["Ам!", "Идите сюда, денежки!", "Приятного аппетита!", "Очень вкусно!", "Нет ничего лучше народного добра!"],
        ouch: "Ой-ой!", enemyCry: "МАМА!",
        bossName: "ТОМА", bossIntro: "БОСС!", kurtName: "КУРТ", policeCry: "ДЕЛО ЗАКРЫТО!",
        l2Title: "УРОВЕНЬ 2 ПРОЙДЕН!", l2Note: "Золото вернулось! Теперь записи 25 декабря.", l2Btn: "НА УРОВЕНЬ 3", fetoName: "ФЕТÖ",
        doorOpen: "ВОРОТА ОТКРЫТЫ!", gateHint: "ВОРОТА", rage: "В ЯРОСТИ!", secret: "ТАЙНЫЙ КЛАД!", live: "ЭФИР", checkpoint: "КОНТРОЛЬНАЯ ТОЧКА!",
        soundOn: "🔊 ВКЛЮЧИТЬ ЗВУК", soundOff: "🔇 ВЫКЛЮЧИТЬ ЗВУК",
        montaj: "МОНТАЖ!", tapeLabel: "ОБНУЛИ", exileCry: "В ССЫЛКУ!", surrender: "СДАЮСЬ!", expel: "УВОЛЕН!", batteryOut: "БАТАРЕЯ СЕЛА!", charge: "ЗАРЯД!", khkHud: "Уволено", role_teacher: "УЧИТЕЛЬ", role_journalist: "ЖУРНАЛИСТ", role_academic: "УЧЁНЫЙ", role_student: "СТУДЕНТ", sayacName: "СЧЁТНАЯ МАШИНКА", tankName: "ТАНК ПУТЧА", tankerName: "ЗАПРАВЩИК", bylockName: "BYLOCK", feto2Name: "ФЕТÖ: ФИНАЛ", lvlDone: "УРОВЕНЬ {n} ПРОЙДЕН!", lvlNext: "НА УРОВЕНЬ {n}", l3Note: "Записи — «монтаж», счётная машинка обнулена!", l4Note: "Урна спасена... но ФЕТÖ не сдаётся. Приближается 15 июля!", l5Note: "Звонок по FaceTime выдержал! Скорее в самолёт!", l6Note: "Посадка в Стамбуле! Дальше — чрезвычайное положение.", l7Note: "Все уволены... Следующая остановка: Пенсильвания!"
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
    try { $('story-skip').textContent = storyT('skip'); } catch (e) {}
    try { updateBestUi(); } catch (e) {}   // rekor satırı da dile göre (yüklenirken henüz tanımlı olmayabilir)
    try { renderHowto(); } catch (e) {}
    try { renderLevelSelect(); } catch (e) {}
    try { renderDiffPicker(); } catch (e) {}
}
