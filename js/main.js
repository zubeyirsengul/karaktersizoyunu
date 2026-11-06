// Başlangıç: bütün dosyalar yüklendikten sonra olay dinleyicileri kurulur, açılış sahnesi başlar
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

document.querySelectorAll('.lang-btn[data-lang]').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));
applyLang(lang);
updateBestUi();
$('pause-btn').addEventListener('click', () => setUserPause(!userPaused));
// Başka sekmeye geçince oyun kendiliğinden durur
document.addEventListener('visibilitychange', () => { if(document.hidden) { setUserPause(true); saveBest(); } });

window.onkeydown = e => {
    let k = e.key.toLowerCase();
    if(story) { storyKey(e); return; }
    if($('howto').style.display === 'flex') { if(e.key === 'Escape' || e.key === 'Enter') closeHowto(); return; }
    if(e.key === 'Escape' || k === 'p') { setUserPause(!userPaused); return; }
    if(userPaused) return;
    if(k==='a' || e.key==='ArrowLeft') keys.a=true; if(k==='d' || e.key==='ArrowRight') keys.d=true; if(k==='s' || e.key==='ArrowDown') keys.s=true;
    if(k==='w' || e.key==='ArrowUp') keys.w=true;
    if(e.key===' ' && !e.repeat) jump(); if(e.key==='Enter') shoot(); if(k==='f' && !e.repeat) hammer();
};
window.onkeyup = e => {
    let k = e.key.toLowerCase();
    if(k==='a' || e.key==='ArrowLeft') keys.a=false; if(k==='d' || e.key==='ArrowRight') keys.d=false; if(k==='s' || e.key==='ArrowDown') keys.s=false;
    if(k==='w' || e.key==='ArrowUp') keys.w=false;
};
resizeIntro();
window.addEventListener('resize', () => { if (introRAF) resizeIntro(); if (story) resizeStory(); });
$('story').addEventListener('pointerdown', e => { if (e.target.id !== 'story-skip') storyNext(); });
$('story-skip').addEventListener('click', endStory);
introRAF = requestAnimationFrame(introLoop);
$('sound-btn').addEventListener('click', () => setIntroSound(!$('sound-btn').dataset.on));
$('overlay-screen').addEventListener('pointerdown', e => {
    const b = $('sound-btn');
    if (!b || b.dataset.touched || e.target === b) return;
    b.dataset.touched = '1';
    setIntroSound(true);
});
$('howto-btn').addEventListener('click', () => openHowto(false));
$('help-btn').addEventListener('click', () => openHowto(false));
$('howto').addEventListener('click', e => { if (e.target === $('howto')) closeHowto(); });   // panelin dışına tıklayınca kapanır
renderHowto();
$('start-button').onclick = () => {
    initAudio();
    goFullscreenLandscape();
    if (!howtoSeen()) openHowto(true);   // ilk kez oynayana önce kurallar
    else startGame();
};
joyWrap.addEventListener('pointerdown', e => {
    e.preventDefault();
    joyPointer = e.pointerId;
    joyWrap.setPointerCapture(e.pointerId);
    joyMove(e);
});
joyWrap.addEventListener('pointermove', e => { if (e.pointerId === joyPointer) joyMove(e); });
joyWrap.addEventListener('pointerup', joyEnd);
joyWrap.addEventListener('pointercancel', joyEnd);

$('jump-btn').addEventListener('pointerdown', e => { e.preventDefault(); jump(); });
$('shoot-btn').addEventListener('pointerdown', e => { e.preventDefault(); shoot(); });
$('hammer-btn').addEventListener('pointerdown', e => { e.preventDefault(); hammer(); });
// Kalkan: buton basılı tutulduğu sürece kalkık kalır
$('shield-btn').addEventListener('pointerdown', e => { e.preventDefault(); shieldHeld = true; $('shield-btn').setPointerCapture(e.pointerId); });
['pointerup', 'pointercancel'].forEach(ev => $('shield-btn').addEventListener(ev, () => { shieldHeld = false; }));

window.onresize = () => {
    const oldHeight = height;
    resizeCanvas();
    if(!gameStarted || oldHeight === undefined) return;
    // Dünya ekranın altına hizalı; yükseklik değişince her şeyi aynı miktarda kaydır
    const dy = height - oldHeight;
    if(dy === 0) return;
    [platforms, items, enemies, projectiles, playerProjectiles, particles].forEach(list => list.forEach(o => o.y += dy));
    player.y += dy;
    if(boss) boss.y += dy;
};
