// Ortak durum: kanvas, oyuncu, oyun değişkenleri, Recep'in kafa fotoğrafı
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// Gemini anahtarı koda YAZILMAZ (GitHub'da herkes görür).
// Sesli konuşmayı açmak için tarayıcı konsolunda bir kez çalıştır:
//   localStorage.setItem('geminiKey', 'ANAHTARIN')
let apiKey = "";
try { apiKey = localStorage.getItem('geminiKey') || ""; } catch (e) {}
const $ = id => document.getElementById(id);
const canvas = $('gameCanvas'), ctx = canvas.getContext('2d');

let width, height, score = 0, gameStarted = false, camX = 0, paused = false;
let items = [], platforms = [], enemies = [], projectiles = [], playerProjectiles = [], particles = [];
let killedEnemies = 0, currentLevel = 1, targetKills = 7, levelCompleted = false, levelStartScore = 0;
let levelEnding = false;                 // bitiş ekranı gelmek üzere: artık ölünmez
let boss = null, bossCheckpoint = null;  // 1. bölüm sonu canavarı ALEVİ; ölünce canavardan devam
const keys = { a: false, d: false, s: false };
let shieldHeld = false;   // dokunmatik KALKAN butonu basılı mı
let userPaused = false;   // oyuncunun duraklatması (bölüm sonu ekranından ayrı)

const GRAVITY = 0.95;
const WORLD_WIDTH = 40000;

// Oyuncu Özellikleri
const player = {
    x: 100, y: 0, w: 100, h: 180,   // 120 kafa + 60 bacak
    vx: 0, vy: 0,
    speed: 7, jumpPower: -22,
    grounded: false, dir: 1,
    isDying: false, deathAngle: 0,
    opacity: 1, legCycle: 0,
    mouthOpen: 0,
    shield: false,                   // kalkan kalkık mı
    hp: 3, maxHp: 3, invuln: 0,      // can; vurulduktan sonra kısa dokunulmazlık (kare)
    swing: 0, swingHit: false        // balyoz: kalan animasyon karesi, bu vuruşta isabet kontrolü yapıldı mı
};

const imgPlayer = new Image(); imgPlayer.src = 'recep.jpg';

// Recep'in resminden sadece kafa alınır (gövdesi bacaklarla çakışmasın).
// Koordinatlar recep.jpg (194x259) piksellerinde: x,y,w,h = kafanın kutusu;
// clip = çene hattını izleyen kesim (soldaki ceket ve alttaki atkı dışarıda kalır).
const RECEP_HEAD = {
    x: 36, y: 8, w: 120, h: 162,
    neckX: 115,                 // bacakların bağlandığı nokta (çenenin altı)
    mouthX: 122, mouthY: 146,   // ağız açılma efekti
    handX: 150, handY: 156,     // balyozu tutan el
    clip: [[0,0],[194,0],[194,150],[150,152],[142,158],[132,163],[120,164],[108,168],[98,165],
           [88,160],[78,157],[68,154],[64,145],[63,132],[55,128],[0,128]]
};
let headCanvas = null;
function prepareHead() {
    const H = RECEP_HEAD, c = document.createElement('canvas');
    c.width = H.w; c.height = H.h;
    const x = c.getContext('2d');
    x.translate(-H.x, -H.y);
    x.beginPath();
    H.clip.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py));
    x.closePath();
    x.clip();
    x.drawImage(imgPlayer, 0, 0);
    headCanvas = c;
}
imgPlayer.onload = prepareHead;
if (imgPlayer.complete && imgPlayer.naturalWidth) prepareHead();

function createParticle(x, y, text = null, color = "white", duration = 1.0) {
    particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: text ? -2 : -Math.random() * 5,
        life: duration,
        maxLife: duration,
        size: Math.random() * 10 + 5,
        text: text,
        color: color
    });
}
