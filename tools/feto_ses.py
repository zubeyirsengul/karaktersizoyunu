# FETÖ'nün karşılama sesi: iki kısa burun çekme, uzun hırıltılı çekiş, ardından "ptuh" tükürük ve ıslak şapırtı.
# Kullanım: python tools/feto_ses.py feto.wav  (sonra MP3'e dönüştürülür)
import sys, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(15)

def band(sig, lo, hi):
    """FFT ile bant geçiren süzgeç."""
    f = np.fft.rfft(sig)
    fr = np.fft.rfftfreq(len(sig), 1 / SR)
    f[(fr < lo) | (fr > hi)] = 0
    return np.fft.irfft(f, len(sig))

def noise(d):
    return rng.uniform(-1, 1, int(d * SR))

def sniff(d, lo=1500, hi=6000):
    n = int(d * SR); t = np.linspace(0, 1, n)
    env = np.sin(np.pi * t) ** 0.6 * (0.6 + 0.4 * t)          # içe çekiş: sonlara doğru güçlenir
    return band(noise(d), lo, hi) * env

def snort(d):
    n = int(d * SR); t = np.arange(n) / SR
    burble = 1 + 0.7 * np.sin(2 * np.pi * 28 * t)               # hırıltı titreşimi
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.5
    low = np.sin(2 * np.pi * 95 * t) * 0.25                     # boğazdan gelen alçak ses
    return (band(noise(d), 300, 2600) * burble + low) * env

def spit():
    click = np.zeros(int(0.012 * SR)); click[:40] = np.linspace(1, 0, 40)       # "p"
    n = int(0.16 * SR); t = np.arange(n) / SR
    tuh = band(noise(0.16), 700, 4200) * np.exp(-t * 22)                       # "tuh"
    spray = band(noise(0.2), 3000, 9000) * np.exp(-np.arange(int(0.2 * SR)) / SR * 14) * 0.35   # tükürük zerresi
    out = np.zeros(len(click) + max(len(tuh), len(spray)))
    out[:len(click)] += band(click, 100, 3000) * 3
    out[len(click):len(click) + len(tuh)] += tuh
    out[len(click):len(click) + len(spray)] += spray
    return out

def splat():
    n = int(0.12 * SR); t = np.arange(n) / SR
    return band(noise(0.12), 150, 1200) * np.exp(-t * 35) + np.sin(2 * np.pi * 150 * t) * np.exp(-t * 40) * 0.4

parts = [(0.00, sniff(0.16) * 0.8), (0.22, sniff(0.16) * 0.9), (0.45, snort(0.40)), (1.08, spit()), (1.48, splat() * 0.7)]
total = np.zeros(int(1.75 * SR))
for at, s in parts:
    i = int(at * SR); total[i:i + len(s)] += s[:len(total) - i]
total /= np.max(np.abs(total)) / 0.8
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((total * 32767).astype(np.int16).tobytes())
print(f"{len(total) / SR:.2f} sn")
