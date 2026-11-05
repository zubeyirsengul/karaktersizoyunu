# Özgün chiptune: "Bozkır Dörtnal" — D Dorian / pentatonik, dombıra benzeri dörtnal vuruşu
import sys, wave
import numpy as np

SR = 44100
BPM = 150
SIX = 60 / BPM / 4          # onaltılık süresi (s)
BAR = 8                      # 2/4: ölçü başına 8 onaltılık
rng = np.random.default_rng(1725)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

def pulse(f, n, duty):
    ph = f * np.arange(n) / SR
    return np.where((ph % 1.0) < duty, 1.0, -1.0)

def triangle(f, n):
    ph = (f * np.arange(n) / SR) % 1.0
    return 4 * np.abs(ph - 0.5) - 1

def env(n, a=0.003, d=0.08, s=0.5, r=0.03):
    e = np.ones(n)
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = min(na, n); e[:na] = np.linspace(0, 1, na) if na else e[:na]
    end_d = min(na + nd, n)
    e[na:end_d] = np.linspace(1, s, end_d - na)
    e[end_d:] = s
    if nr and n > nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e

def pluck_env(n, k=28.0):
    return np.exp(-k * np.arange(n) / SR)

# --- Armoni (her ölçü için kök MIDI notası, dombıra ikilisi = kök + beşli) ---
D, C, F, A = 50, 48, 53, 45
A_HARM = [D, D, C, C, D, D, A, D]
B_HARM = [F, C, D, A, F, C, A, D]

# --- Melodi (nota, onaltılık süre); None = es ---
A_MEL = [
    [(69,3),(72,1),(69,2),(67,2)],
    [(65,2),(67,2),(69,4)],
    [(72,3),(74,1),(72,2),(69,2)],
    [(67,2),(65,2),(67,4)],
    [(69,2),(69,1),(72,1),(74,2),(76,2)],
    [(77,2),(76,2),(74,4)],
    [(72,2),(69,2),(67,2),(64,2)],
    [(62,6),(None,2)],
]
A2_MEL = A_MEL[:6] + [
    [(72,2),(74,2),(76,2),(72,2)],
    [(74,6),(None,2)],
]
B_MEL = [
    [(77,2),(77,1),(79,1),(81,4)],
    [(79,2),(77,2),(76,4)],
    [(74,2),(74,1),(76,1),(77,2),(76,2)],
    [(76,2),(73,2),(69,4)],          # C# : artık ikili, doğu havası
    [(77,2),(79,2),(81,2),(84,2)],
    [(81,3),(79,1),(77,4)],
    [(76,2),(77,2),(76,2),(73,2)],
    [(74,6),(None,2)],
]
INTRO_MEL = [[(None,8)]] * 4

sections = [
    (INTRO_MEL, [D]*4, False),
    (A_MEL, A_HARM, True), (A2_MEL, A_HARM, True),
    (B_MEL, B_HARM, True),
    (A_MEL, A_HARM, True),
    (B_MEL, B_HARM, True),
    (A2_MEL, A_HARM, True),
]
bars = [(m, h, drums) for mel, harm, drums in sections for m, h in zip(mel, harm)]
total = int(len(bars) * BAR * SIX * SR) + SR
lead, dombra, bass, drum = (np.zeros(total) for _ in range(4))

def add(buf, start, sig):
    end = min(start + len(sig), len(buf))
    buf[start:end] += sig[:end - start]

for bi, (mel, root, drums) in enumerate(bars):
    b0 = bi * BAR
    # Melodi: kare dalga + gecikmeli vibrato
    pos = 0
    for note, dur in mel:
        if note is not None:
            n = int(dur * SIX * SR * 0.95)
            t = np.arange(n) / SR
            f = hz(note) * (1 + 0.008 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.15) * 4, 0, 1))
            ph = np.cumsum(f) / SR
            sig = np.where((ph % 1) < 0.5, 1.0, -1.0) * env(n, d=0.1, s=0.6, r=0.02)
            add(lead, int((b0 + pos) * SIX * SR), sig)
        pos += dur
    # Dombıra: dörtnal (0, 2, 3 ve 4, 6, 7) — kök+beşli ikilisi, tiz tel vuruşları daha hafif
    for s16, acc in [(0,1.0),(2,0.6),(3,0.7),(4,0.9),(6,0.6),(7,0.7)]:
        n = int(SIX * SR * 1.8)
        low = root + 12
        sig = (pulse(hz(low), n, 0.25) + pulse(hz(low + 7), n, 0.25) * 0.8
               + (pulse(hz(low + 12), n, 0.125) * 0.4 if s16 in (2, 6) else 0))
        sig = sig * pluck_env(n, 30) * acc
        jitter = int(rng.integers(0, 60))   # el ile çalınmış gibi küçük kayma
        add(dombra, int((b0 + s16) * SIX * SR) + jitter, sig)
    # Bas: üçgen dalga, kök ve beşli
    for s16, m in [(0, root - 12), (4, root - 5)]:
        n = int(SIX * SR * 3.5)
        add(bass, int((b0 + s16) * SIX * SR), triangle(hz(m), n) * env(n, d=0.2, s=0.7, r=0.04))
    # Davul: kick 0 ve 4'te, hi-hat dörtnal vuruşlarında, kös (tom) son vuruşta
    if drums:
        for s16 in (0, 4):
            n = int(0.16 * SR); t = np.arange(n) / SR
            f = 120 * np.exp(-t * 25) + 45
            add(drum, int((b0 + s16) * SIX * SR), np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18))
        for s16 in (2, 3, 6, 7):
            n = int(0.04 * SR)
            add(drum, int((b0 + s16) * SIX * SR), rng.uniform(-1, 1, n) * np.exp(-np.arange(n) / SR * 90) * 0.25)
        if bi % 4 == 3:
            n = int(0.25 * SR); t = np.arange(n) / SR
            add(drum, int((b0 + 6) * SIX * SR), (np.sin(2 * np.pi * np.cumsum(180 * np.exp(-t * 8) + 70) / SR) * 0.6
                + rng.uniform(-1, 1, n) * 0.25) * np.exp(-t * 12))

# Melodiye hafif yankı (3 onaltılık gecikme)
dl = int(3 * SIX * SR)
echo = np.zeros_like(lead); echo[dl:] = lead[:-dl] * 0.25

mix = lead * 0.20 + echo * 0.20 + dombra * 0.13 + bass * 0.30 + drum * 0.45
mix = mix[: int(len(bars) * BAR * SIX * SR)]   # tam ölçüde kes: kesintisiz döngü
mix /= np.max(np.abs(mix)) / 0.9
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"{len(bars)} ölçü, {len(pcm)/SR:.1f} sn")
