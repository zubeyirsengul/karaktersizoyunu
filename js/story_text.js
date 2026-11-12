// 3. bölümün hikâyesi (STORIES; 1. bölüm gezi.js'te, 2. bölüm saygili.js'te) ve tüm dillerde hikâye metinleri (STORY_TEXT); 3-8: story_chapters.js
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// Sahne: bg, props, actors [{ who, x, to, dir, talk, wave, jump }], say: { who, key } (who boşsa anlatıcı), card: true
const STORIES = {
    3: [
        { bg: 'city', props: ['ballot'], say: { key: 's3a' },
          actors: [{ who: 'police', x: 300, dir: 1 }, { who: 'police', x: 680, dir: -1 }] },
        { bg: 'city', props: ['ballot'], say: { who: 'feto', key: 's3b' },
          actors: [{ who: 'feto', x: 1060, to: 620, dir: -1, talk: true }] },
        { bg: 'city', props: ['ballot'], say: { who: 'recep', key: 's3c' },
          actors: [{ who: 'recep', x: -100, to: 300, dir: 1, talk: true, wave: true }, { who: 'feto', x: 620, dir: -1 }] },
        { bg: 'card', card: { title: 'm3t', text: 'm3' } }
    ]
};

const STORY_TEXT = {
    tr: { station: '17/25 KARAKOLU', ballot: 'SANDIK', skip: 'GEÇ ⏭', tap: 'Devam için dokun ▶', go: 'BAŞLA ▶',
          gang: '4\'LÜ ÇETE', recep: 'HIRHIZ', phone: 'TELEFON', sarraf: 'SARRAF', feto: 'FETÖ',
          s3a: 'Seçim gecesi. Sandıklar sayılıyor, şehir nefesini tutmuş...',
          s3b: 'Bu sandık benim olacak! Hehehe...',
          s3c: 'Sandık namusumuzdur! Ama sayımı biz yaparız!',
          m3t: 'GÖREV 3: SANDIĞI KORU', m3: 'Gece şehrinde polisleri geç, FETÖ\'yü yen, sandığı kurtar!' },
    en: { station: '17/25 POLICE STATION', ballot: 'BALLOT', skip: 'SKIP ⏭', tap: 'Tap to continue ▶', go: 'START ▶',
          gang: 'GANG OF FOUR', recep: 'HIRHIZ', phone: 'PHONE', sarraf: 'SARRAF', feto: 'FETÖ',
          s3a: 'Election night. The ballots are being counted, the city holds its breath...',
          s3b: 'This ballot box will be mine! Hehehe...',
          s3c: 'The ballot box is our honour! But we do the counting!',
          m3t: 'MISSION 3: GUARD THE BALLOT BOX', m3: 'Get past the police in the night city, beat FETÖ, save the ballot box!' },
    fr: { station: 'COMMISSARIAT 17/25', ballot: 'URNE', skip: 'PASSER ⏭', tap: 'Touchez pour continuer ▶', go: 'JOUER ▶',
          gang: 'BANDE DES QUATRE', recep: 'HIRHIZ', phone: 'TÉLÉPHONE', sarraf: 'SARRAF', feto: 'FETÖ',
          s3a: 'Soir d\'élection. On compte les urnes, la ville retient son souffle...',
          s3b: 'Cette urne sera à moi ! Héhéhé...',
          s3c: 'L\'urne, c\'est notre honneur ! Mais c\'est nous qui comptons !',
          m3t: 'MISSION 3 : PROTÈGE L\'URNE', m3: 'Traverse la ville de nuit, bats FETÖ, sauve l\'urne !' },
    nl: { station: '17/25 POLITIEBUREAU', ballot: 'STEMBUS', skip: 'OVERSLAAN ⏭', tap: 'Tik om verder te gaan ▶', go: 'START ▶',
          gang: 'BENDE VAN VIER', recep: 'HIRHIZ', phone: 'TELEFOON', sarraf: 'SARRAF', feto: 'FETÖ',
          s3a: 'Verkiezingsnacht. De stemmen worden geteld, de stad houdt de adem in...',
          s3b: 'Deze stembus wordt van mij! Hehehe...',
          s3c: 'De stembus is onze eer! Maar wij tellen de stemmen!',
          m3t: 'MISSIE 3: BEWAAK DE STEMBUS', m3: 'Kom langs de politie in de nachtstad, versla FETÖ, red de stembus!' },
    de: { station: 'WACHE 17/25', ballot: 'URNE', skip: 'ÜBERSPRINGEN ⏭', tap: 'Tippen zum Fortfahren ▶', go: 'START ▶',
          gang: 'VIERERBANDE', recep: 'HIRHIZ', phone: 'TELEFON', sarraf: 'SARRAF', feto: 'FETÖ',
          s3a: 'Wahlnacht. Die Urnen werden ausgezählt, die Stadt hält den Atem an...',
          s3b: 'Diese Urne gehört bald mir! Hehehe...',
          s3c: 'Die Urne ist unsere Ehre! Aber zählen tun wir!',
          m3t: 'MISSION 3: BESCHÜTZE DIE URNE', m3: 'Komm an der Polizei in der Nachtstadt vorbei, besiege FETÖ, rette die Urne!' },
    ru: { station: 'УЧАСТОК 17/25', ballot: 'УРНА', skip: 'ПРОПУСТИТЬ ⏭', tap: 'Нажми, чтобы продолжить ▶', go: 'НАЧАТЬ ▶',
          gang: 'БАНДА ЧЕТЫРЁХ', recep: 'HIRHIZ', phone: 'ТЕЛЕФОН', sarraf: 'САРРАФ', feto: 'ФЕТÖ',
          s3a: 'Ночь выборов. Урны подсчитывают, город затаил дыхание...',
          s3b: 'Эта урна будет моей! Хе-хе-хе...',
          s3c: 'Урна — наша честь! Но считаем мы!',
          m3t: 'МИССИЯ 3: ЗАЩИТИ УРНУ', m3: 'Пройди полицию в ночном городе, победи ФЕТÖ, спаси урну!' }
};
const storyT = k => (STORY_TEXT[lang] && STORY_TEXT[lang][k]) || STORY_TEXT.tr[k];
