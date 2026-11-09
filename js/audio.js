// Sesler: Web Audio efektleri, silah sesi, Gemini konuşma
// (index.html bu dosyaları sırayla yükler; tanımlar paylaşılır, yükleme anında çalışan kod main.js'tedir)

// TTS exponential backoff implementation
// Aynı anda tek konuşma; geç gelen ses anlamsız olacağı için en fazla 1 kısa tekrar
let speaking = false;
async function speak(text, voice = "Kore") {
    if (!apiKey || speaking) return;
    speaking = true;
    try {
        for (let attempt = 0; attempt < 2; attempt++) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${encodeURIComponent(apiKey)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: text }] }],
                    generationConfig: {
                        responseModalities: ["AUDIO"],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
                    }
                })
            });
            if (response.ok) {
                const result = await response.json();
                const pcmData = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (pcmData) {
                    const url = URL.createObjectURL(pcmToWav(pcmData, 24000));
                    const audio = new Audio(url);
                    audio.onended = () => URL.revokeObjectURL(url);
                    audio.play().catch(() => {});
                }
                return;
            }
            // Sadece geçici hatalarda (çok istek / sunucu) tekrar dene
            if (response.status !== 429 && response.status < 500) return;
            await new Promise(res => setTimeout(res, 1000));
        }
    } catch (e) {
        // Ağ hatası: sessizce geç
    } finally {
        speaking = false;
    }
}

function pcmToWav(b64, rate) {
    const bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (let i=0; i<bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const head = new ArrayBuffer(44), v = new DataView(head);
    v.setUint32(0, 0x52494646, false); v.setUint32(4, 36+bin.length, true); v.setUint32(8, 0x57415645, false);
    v.setUint32(12, 0x666d7420, false); v.setUint16(16, 16, true); v.setUint16(20, 1, true);
    v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate*2, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true); v.setUint32(36, 0x64617461, false); v.setUint32(40, bin.length, true);
    return new Blob([head, bytes], { type: 'audio/wav' });
}

// --- SES EFEKTLERİ (Web Audio) ---
// Gerçek ses kayıtları: çığlıklar, canavar karşılamaları ve teyzeler (oyunun yapımcısının kendi sesi),
// darbeler (Independent.nu, CC0), FETÖ'nün "Ya Allah!" sesi (Windows Türkçe yapay sesi)
const SFX_FILES = {
    cry: ['sfx/uufff.mp3'],                                // polis ölümü
    hit: [1, 2, 3, 4, 5].map(i => `sfx/hit${i}.mp3`),
    greet_alevi: ['sfx/yaali.mp3'],                         // canavarların karşılama sesleri
    greet_kurt: ['sfx/kro.mp3'],
    greet_feto2: ['sfx/feto2_greet.mp3'],                   // FETÖ (4. ve 8. bölüm): "Ya Allah!" (Windows Türkçe yapay sesi Tolga, kalınlaştırılıp yankılandı)
    granny: ['sfx/gotununkili.mp3'],                        // canavar ölünce gelen teyzeler
    yalarim: ['sfx/yalarim.mp3'],
    selo_baskan: ['sfx/selo_baskan.mp3'],                   // 9. bölüm SELO: "Seni başkan yaptırmayacağız!" (Windows Türkçe yapay sesi Tolga, inceltildi)
    selo_kitap: ['sfx/selo_kitap.mp3'],                     // hikâyede: "Burada da kitap yazarım..."                           // 2. bölüm canavarı ölünce ara sahne
    // Recep'in replikleri (kayıt yoksa yapay sese, Gemini, düşer)
    voice_ouch: ['sfx/ahh.mp3']                                         // vurulunca ve ölünce
};
let audioCtx = null;
const sfxBuffers = Object.fromEntries(Object.keys(SFX_FILES).map(k => [k, []])), sfxLast = {};
function initAudio() {
    if (audioCtx) { if (audioCtx.resume) audioCtx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
    for (const [kind, list] of Object.entries(SFX_FILES)) list.forEach((url, i) =>
        fetch(url).then(r => r.arrayBuffer()).then(b => audioCtx.decodeAudioData(b))
            .then(buf => { sfxBuffers[kind][i] = buf; }).catch(() => {}));
}
// Rastgele bir kayıt çalar (aynısı art arda gelmez); rate: perde/hız, pan: sol-sağ konum.
// Dönüş: çalan sesin süresi (saniye), çalamazsa 0
// Konuşma kanalı: yeni replik başlayınca öncekini susturur (hikâyede sahne geçerken)
let lastSfxSrc = null, voiceSrc = null;
function playVoice(kind) {
    stopVoice();
    const d = playSfx(kind, { vol: 1 });
    if (d) voiceSrc = lastSfxSrc;
    return d;
}
function stopVoice() {
    if (voiceSrc) { try { voiceSrc.stop(); } catch (e) {} }
    voiceSrc = null;
}
function playSfx(kind, { rate = 1, vol = 1, delay = 0, pan = 0 } = {}) {
    if (!audioCtx || !sfxBuffers[kind]) return 0;
    const list = sfxBuffers[kind].map((b, i) => [b, i]).filter(([b, i]) => b && (i !== sfxLast[kind] || sfxBuffers[kind].length < 2));
    if (!list.length) return 0;
    const [buf, idx] = list[Math.floor(Math.random() * list.length)];
    sfxLast[kind] = idx;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    lastSfxSrc = src;
    src.playbackRate.value = rate;
    const gain = audioCtx.createGain();
    gain.gain.value = vol;
    src.connect(gain);
    if (audioCtx.createStereoPanner) {
        const panner = audioCtx.createStereoPanner();
        panner.pan.value = Math.max(-1, Math.min(1, pan));
        gain.connect(panner); panner.connect(audioCtx.destination);
    } else gain.connect(audioCtx.destination);
    src.start(audioCtx.currentTime + delay);
    return buf.duration / rate;
}
// Düşman ölümü: önce darbe, hemen ardından çığlık. Polisin sesi daha kalın, ses ekrandaki konumuna göre sağdan/soldan gelir.
function enemyDeathSound(en) {
    const pan = (en.x + en.w / 2 - camX - width / 2) / (width / 2);
    playSfx('hit', { rate: 0.9 + Math.random() * 0.2, vol: 0.9, pan });
    const rate = en.kind === 'police' ? 0.76 + Math.random() * 0.08 : 0.92 + Math.random() * 0.2;
    playSfx('cry', { rate, vol: 0.85, delay: 0.05, pan });
}

// Silah sesi: Web Audio ile üretilen kısa, boğuk patlama (dosya gerekmez)
let gunBuffer = null;
function playGunshot(pan = 0, vol = 0.5) {
    if (!audioCtx) return;
    if (!gunBuffer) {
        const n = Math.floor(audioCtx.sampleRate * 0.28);
        gunBuffer = audioCtx.createBuffer(1, n, audioCtx.sampleRate);
        const d = gunBuffer.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 5);
    }
    const src = audioCtx.createBufferSource(); src.buffer = gunBuffer;
    const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
    const g = audioCtx.createGain(); g.gain.value = vol;
    src.connect(lp); lp.connect(g);
    if (audioCtx.createStereoPanner) {
        const pn = audioCtx.createStereoPanner(); pn.pan.value = Math.max(-1, Math.min(1, pan));
        g.connect(pn); pn.connect(audioCtx.destination);
    } else g.connect(audioCtx.destination);
    src.start();
}

// Bir kaydın süresi (yüklenmediyse 0)
const sfxDuration = kind => ((sfxBuffers[kind] || []).find(b => b) || {}).duration || 0;

// Teyzelerin tezahüratı: 2 kez söylenir
const GRANNY_REPEATS = 2;
let grannyChant = null;
function startGrannyChant(delay) {
    stopGrannyChant();
    const token = { left: GRANNY_REPEATS };
    grannyChant = token;
    const once = () => {
        if (grannyChant !== token || token.left-- <= 0) return;
        const d = playSfx('granny', { vol: 1 });
        token.t = setTimeout(once, ((d || 1.5) + 0.5) * 1000);
    };
    token.t = setTimeout(once, delay * 1000);
}
function stopGrannyChant() {
    if (grannyChant) clearTimeout(grannyChant.t);
    grannyChant = null;
}
