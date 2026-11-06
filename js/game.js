// Oyun döngüsü: güncelleme, sabit adımlı döngü, duraklatma, oyunu başlatma, ekran boyutu
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

function update() {
    if(!gameStarted || paused || userPaused) return;
    if(isFlight()) { updateFlight(); return; }

    if(!player.isDying) {
        let moveDir = (keys.a ? -1 : (keys.d ? 1 : joyDir));
        player.shield = keys.s || shieldHeld;
        if(player.invuln > 0) player.invuln--;
        if(player.knock > 0) { player.knock--; player.vx *= 0.9; }   // vurulunca kısa süre geri savrulur
        else player.vx = moveDir ? moveDir * player.speed * (player.shield ? 0.5 : 1) * (power.speed > 0 ? 1.6 : 1) : player.vx * 0.85;   // kalkanla yavaş, hız gücüyle hızlı
        if(moveDir) player.dir = moveDir;
        // Adım hızı yürüme hızına bağlı: ayaklar yerde kaymaz
        if(player.grounded) player.legCycle += Math.abs(player.vx) * 0.06;

        player.vy += GRAVITY;
        player.x += player.vx;
        player.y += player.vy;

        // Harita sınırları: zeminin dışına çıkılmasın
        player.x = Math.max(0, Math.min(player.x, WORLD_WIDTH - player.w));
        // Bir şekilde aşağı düşülürse öl
        if(player.y > height + 200) killPlayer();   // uçuruma düşmek can sormaz

        if(player.mouthOpen > 0) player.mouthOpen -= 0.05;
        updateHammer();

        player.grounded = false;
        for(let p of platforms) {
            if (player.x + player.w * 0.2 < p.x + p.w && player.x + player.w * 0.8 > p.x &&
                player.y + player.h > p.y && player.y + player.h < p.y + p.h + player.vy + 10 && player.vy >= 0) {
                player.y = p.y - player.h; player.vy = 0; player.grounded = true;
            }
        }
    } else {
        player.y += 2; player.deathAngle += 0.05; player.opacity -= 0.01;
    }

    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= (1/60); });
    particles = particles.filter(p => p.life > 0);
    camX = player.x - width/2;

    items.forEach(it => {
        if(!it.collected && Math.hypot(player.x + player.w/2 - it.x, player.y + player.h/2 - it.y) < 100) {
            it.collected = true;
            if(it.power) { grantPower(it.power, it.x, it.y); score += 1000; $('score').innerText = score; return; }
            if(pickupChapterItem(it)) return;
            score += 5000; 
            $('score').innerText = score;
            $('sfx-pickup').currentTime = 0; $('sfx-pickup').play().catch(()=>{});
            player.mouthOpen = 1.0;
            if(!playSfx('voice_pickup')) speak(t("voices")[Math.floor(Math.random()*t("voices").length)], "Kore");
            createParticle(it.x, it.y, pickupText(), "#22c55e", 0.8);
        }
    });

    enemies.forEach(en => {
        if(en.dead) {
            if(en.deathT < DEATH_FRAMES) en.deathT++;
            if(enemyLeaves(en)) { en.dir = en.fallDir; en.walkCycle += 0.4; en.lastSpeed = 5; }   // bavuluyla yürüyüp gider
            return;
        }
        if(en.kind === 'riot') { updateRiot(en); enemyContact(en); return; }
        if(en.kind === 'sniper') { updateSniper(en); enemyContact(en); return; }
        if(en.kind === 'tank') { updateTank(en); enemyContact(en); return; }
        if(en.kind === 'civil') { updateCivil(en); return; }   // siviller zararsız

        // --- Düşman hareketi (tabancalı polis) ---
        const PATROL_RANGE = 250, CHASE_RANGE = 400, CHASE_DIST = 700;
        const enCenter = en.x + en.w / 2, plCenter = player.x + player.w / 2;
        const distToPlayer = plCenter - enCenter;
        let speed = en.speed;
        if(!player.isDying && Math.abs(distToPlayer) < CHASE_DIST) {
            // Oyuncu yakında: ona doğru yürü (ama bölgesinden fazla uzaklaşma)
            en.dir = Math.sign(distToPlayer) || en.dir;
            speed *= 1.4;
            if(Math.abs(en.x + en.dir * speed - en.homeX) > CHASE_RANGE) speed = 0;
            if(Math.abs(distToPlayer) < 20) speed = 0; // Tam üstündeyken titreme olmasın
        } else {
            // Devriye: bölge sınırına gelince geri dön
            if(en.x - en.homeX > PATROL_RANGE) en.dir = -1;
            else if(en.x - en.homeX < -PATROL_RANGE) en.dir = 1;
        }
        en.x += en.dir * speed;
        en.x = Math.max(0, Math.min(en.x, WORLD_WIDTH - en.w));
        en.walkCycle += speed * 0.08;   // Adım hızı yürüme hızına bağlı
        en.lastSpeed = speed;           // Çizimde "yürüyor mu / duruyor mu" için

        // Polis: oyuncu yakındaysa ve ona dönükse nişan alır, ardından ateş eder
        const toPlayer = (player.x + player.w / 2) - (en.x + en.w / 2);
        const near = !player.isDying && Math.abs(toPlayer) < 900;
        const facing = Math.sign(toPlayer) === en.dir;
        en.aim += ((near && facing ? 1 : 0) - en.aim) * 0.12;
        if(en.flash > 0) en.flash--;
        if(near && ++en.timer > en.interval && en.aim > 0.8) {
            en.timer = 0;
            en.flash = 6;
            projectiles.push({ type: 'bullet', x: en.x + en.w / 2 + en.dir * 60, y: en.y + 57,
                               vx: en.dir * 11, vy: 0, active: true, life: 140, angle: 0 });
            const pan = (en.x + en.w / 2 - camX - width / 2) / (width / 2);
            playGunshot(pan, Math.max(0.15, 0.6 - Math.abs(toPlayer) / 2000));
        }
        enemyContact(en);
    });

    playerProjectiles.forEach(p => {
        p.x += p.vx; p.vy += GRAVITY * 0.4; p.y += p.vy; p.angle += 0.2; p.life--;
        enemies.forEach(en => {
            if(!en.dead && p.active && p.x > en.x && p.x < en.x + en.w && p.y > en.y && p.y < en.y + en.h) {
                if(en.kind === 'riot' && p.vx * en.dir < 0) riotBlock(p);   // kalkana önden çarptı
                else { p.active = false; killEnemy(en); }
            }
        });
        if(boss && !boss.dying && p.active && p.x > boss.x + 40 && p.x < boss.x + boss.w - 40 && p.y > boss.y && p.y < boss.y + boss.h) {
            p.active = false;
            damageBoss(1);
        }
    });
    playerProjectiles = playerProjectiles.filter(p => p.active && p.life > 0);

    projectiles.forEach(p => {
        p.x += p.vx;
        if(p.type === 'fire') { updateFire(p); return; }
        if(p.type === 'wave') { updateWave(p); return; }
        if(p.type === 'dollar1') { updateOneDollar(p); return; }
        if(p.type === 'bullet') updateBullet(p);
    });
    projectiles = projectiles.filter(p => p.active && p.life > 0);
    updateBoss();
    updateGate();
    updateGrannies();
    updatePowers();
    updateChapter();
    checkBest();
}

// Sabit adımlı döngü: oyun mantığı her ekranda saniyede 60 kez çalışır
// (120 Hz ekranlarda oyun hızlanmaz, 30 Hz'de yavaşlamaz)
const STEP = 1000 / 60;
let lastTime = null, accumulator = 0;
function loop(now) {
    if(lastTime === null) lastTime = now;
    // Sekme arka plandayken biriken süreyi sınırla (geri dönünce ışınlanma olmasın)
    accumulator += Math.min(now - lastTime, 250);
    lastTime = now;
    while(accumulator >= STEP) { update(); accumulator -= STEP; }
    draw();
    requestAnimationFrame(loop);
}

// --- DURAKLATMA ---
function setUserPause(on) {
    if(!gameStarted || paused || levelCompleted) on = false;   // bölüm sonu ekranındayken duraklatma yok
    if(userPaused === on) return;
    userPaused = on;
    keys.a = keys.d = keys.s = keys.w = false; shieldHeld = false;
    const m = $('bg-music');
    if(on) m.pause(); else m.play().catch(()=>{});
    $('pause-btn').textContent = on ? '▶' : '⏸';
}

function startGame() {
    if (!storyDone[1]) { playStory(1, startGame); return; }   // önce 1. bölümün hikâyesi
    initAudio();   // tarayıcılar sesi ancak bir tıklamayla başlatmaya izin verir
    removeIntro();
    $('overlay-screen').style.display = 'none';
    gameStarted = true;
    document.body.classList.add('playing');
    $('pause-btn').style.display = 'block';
    $('help-btn').style.display = 'block';
    resizeCanvas();
    createLevel();
    requestAnimationFrame(loop);
    const bgMusic = $('bg-music');
    bgMusic.volume = 0.1; bgMusic.play().catch(()=>{});
}
// Canvas'ı ekranın gerçek piksel yoğunluğuna göre boyutlandır (Retina/telefonlarda net görüntü).
// Küçük ekranlarda (yan tutulan telefon) dünya küçültülerek çizilir: oyun en az MIN_VIEW_H x MIN_VIEW_W
// birimlik bir alan görür, böylece 180 birim boyundaki oyuncu ekranın yarısını kaplamaz.
// width/height oyun birimidir; ölçekleme setTransform ile yapılır.
const MIN_VIEW_H = 620, MIN_VIEW_W = 960;
let viewScale = 1;
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const cssW = window.innerWidth, cssH = window.innerHeight;
    viewScale = Math.min(1, cssH / MIN_VIEW_H, cssW / MIN_VIEW_W);
    width = cssW / viewScale;
    height = cssH / viewScale;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr * viewScale, 0, 0, dpr * viewScale, 0, 0);
}

// Telefonda oyunu tam ekran ve yatay aç (tarayıcı çubukları ekranı yemesin). Desteklenmiyorsa sessizce geçer.
function goFullscreenLandscape() {
    if (!matchMedia('(pointer: coarse)').matches) return;
    const el = document.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req || document.fullscreenElement || document.webkitFullscreenElement) return;
    try {
        const p = req.call(el, { navigationUI: 'hide' });
        const lock = () => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} };
        if (p && p.then) p.then(lock).catch(() => {}); else lock();
    } catch (e) {}
}
