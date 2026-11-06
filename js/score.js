// Yüksek skor (tarayıcıda saklanır)
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- YÜKSEK SKOR (tarayıcıda saklanır) ---
let bestScore = 0, newRecordShown = false;
try { bestScore = parseInt(localStorage.getItem('omurgasizBest') || '0', 10) || 0; } catch (e) {}
function saveBest() {
    try { localStorage.setItem('omurgasizBest', String(bestScore)); } catch (e) {}
}
function updateBestUi() {
    $('best-hud').textContent = bestScore > 0 ? ` · 🏆 ${bestScore}` : '';
    $('best-line').textContent = bestScore > 0 ? `🏆 ${t('best')}: ${bestScore}` : '';
}
// Her karede: skor rekoru geçerse rekor güncellenir, oyunda bir kez "YENİ REKOR!" yazar
function checkBest() {
    if (score <= bestScore) return;
    const hadRecord = bestScore > 0;
    bestScore = score;
    updateBestUi();
    if (hadRecord && !newRecordShown) {
        newRecordShown = true;
        createParticle(player.x + player.w / 2, player.y - 60, t('newRecord'), "#fde047", 2.2);
        playSfx('hit', { rate: 1.4, vol: 0.5 });
    }
}
