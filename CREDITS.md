# Krediler

## Müzik
- **intro_title.mp3** (açılış ekranı ve 6. bölüm), **chiptune_level1.mp3** (1., 3. ve 8. bölüm) ve **chiptune_level3.mp3** (4. ve 7. bölüm): "Title Screen", "Level 1" ve "Level 3" — Juhani Junkala, *Retro Game Music Pack (5 Chiptunes – Action)*
  - Kaynak: https://opengameart.org/content/5-chiptunes-action
  - Lisans: CC0 (kamu malı). Orijinal WAV, 128 kbps MP3'e dönüştürüldü.
- **bozkir_dortnal.mp3** (2. ve 5. bölüm): "Bozkır Dörtnal" — bu oyun için bestelenmiş özgün parça.
  - `tools/bozkir.py` ile sentezlenir: `python tools/bozkir.py bozkir.wav`, ardından MP3'e dönüştürülür.

## Ses efektleri
- **sfx/uufff.mp3** (polis ölüm sesi), **sfx/ahh.mp3** (Recep vurulunca/ölünce), **sfx/voice/kulhakki.mp3** (bölüm sonu canavarı yenilince),
  **sfx/yaali.mp3** (ALEVİ'nin karşılaması), **sfx/kro.mp3** (KURT'un karşılaması),
  **sfx/gotununkili.mp3** (canavar ölünce gelen teyzeler, sonraki bölüme geçilene kadar tekrar eder): oyunun yapımcısının kendi sesiyle kaydedildi.
  - Kırpıldı, uğultusu azaltıldı, ses seviyesi eşitlendi, MP3'e dönüştürüldü.
- **sfx/feto_greet.mp3** (FETÖ'nün burun çekme ve tükürük sesi): `tools/feto_ses.py` ile sentezlenmiş özgün ses.
- **sfx/hit1–5.mp3** (darbe sesleri): "37 Hits/Punches" — Independent.nu
  - Kaynak: https://opengameart.org/content/37-hitspunches
  - Lisans: CC0. Kırpıldı, ses seviyesi eşitlendi, MP3'e dönüştürüldü.

## Grafikler
- Recep'in gövdesi ve "DİN" yazılı kalkanı, tabancalı 17/25 polisi, kalkanlı çevik kuvvet, keskin nişancı, platformlar ve çukurlar, bölüm sonu canavarları (ALEVİ, KURT, FETÖ), bölüm sonu kapısı, başörtülü teyzeler, güç küreleri, 1 dolar, bölüm arka planları ve Kaçak Saray'lı açılış sahnesi kodla (canvas) çizilmiştir, harici dosya kullanılmaz.
- 3-8. bölümlerin her şeyi de kodla çizilmiştir: arka planlar (Boğaz, Marmaris, gece uçuşu, OHAL Ankarası, karlı Pensilvanya), kaset, şarj aleti, rüşvet zarfı, mini tanklar, siviller, KHK damgası, uçaklar, canavarlar (PARA MAKİNESİ, DARBE TANKI, TANKER UÇAK, BYLOCK).
- Bölüm girişi hikâyelerindeki blok (piksel) karakterler: 4'lü çete (`resimler/4lucete.png`) ve Sarraf (`resimler/sarraf.png`) yapımcının verdiği fotoğraflardan pikselleştirilir; Recep `recep.jpg`'den alınır. Polis, FETÖ, KURT, spiker, öğretmen ve gazeteci 8x8 piksel olarak elle çizilmiştir (fotoğraf kullanılmaz).
