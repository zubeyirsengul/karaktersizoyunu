// Dokunmatik joystick
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// --- JOYSTICK ---
let joyDir = 0, joyPointer = null;
const joyWrap = $('joystick-wrapper'), joyStick = $('joystick-stick');
const JOY_MAX = 35, JOY_DEADZONE = 10;

function joyMove(e) {
    const r = joyWrap.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy);
    if (dist > JOY_MAX) { dx = dx / dist * JOY_MAX; dy = dy / dist * JOY_MAX; }
    joyStick.style.transform = `translate(${dx}px, ${dy}px)`;
    joyDir = Math.abs(dx) < JOY_DEADZONE ? 0 : Math.sign(dx);
}
function joyEnd(e) {
    if (e.pointerId !== joyPointer) return;
    joyPointer = null; joyDir = 0;
    joyStick.style.transform = '';
}
