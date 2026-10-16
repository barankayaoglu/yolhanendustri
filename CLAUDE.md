# yolhanendustri.com — proje notları

Bu depo (github.com/barankayaoglu/yolhanendustri, herkese açık) sitenin tek kaynağıdır. `claudecalisma` deposunun içinde `yolhanendustri/` klasörüne klonlanmıştır ve orada `.gitignore` ile dışarıda tutulur.

## Nasıl çalışır

- **İçerik** tek dosyada: `icerik/site.json` (tüm metinler, fotoğraflar, markalar, ürün grupları, şubeler).
- **Şablonlar** `sablon/*.mjs`: içerikten tam HTML üretir. Node'a özgü bir şey içermez; panel önizlemesi de aynı dosyaları tarayıcıda çalıştırır.
- **Derleme** `node araclar/olustur.mjs` → `dist/` (paket gerekmez). `dist/` depoya girmez.
- **Yayın**: `main`'e her push'ta `.github/workflows/yayinla.yml` derleyip GitHub Pages'e yükler (Pages kaynağı: GitHub Actions). Alan adı Pages ayarlarında `yolhanendustri.com`.
- **Panel**: `yolhanendustri.com/panel/` (`panel/`). Kullanıcı GitHub ince ayarlı erişim anahtarıyla girer (yalnızca bu depo; Contents yaz, Actions oku). Panel `icerik/site.json`'u ve yüklenen fotoğrafları (`medya/yuklenen/`) GitHub API ile tek commit olarak yazar; iş akışı siteyi yayınlar. Alan tanımları `panel/alanlar.mjs`; yeni bir içerik alanı eklerken hem şablona hem buraya ekle.

Panelden yapılan commit'ler doğrudan `main`'e gider: çalışmaya başlamadan önce `git pull` yap.

## Tasarım

Fikir: logodaki çatı (han) ve altından geçen yol. Masaüstünde solda 72 px'lik bir şerit var; kaydırdıkça sarı kesik çizgili bir yol çizilir ve her bölümde bir "durak"tan geçip alt bilgideki son durakta biter (`statik/js/site.js` → yolKur/yolCiz). Bölümler `data-durak` ile işaretlenir.

- Renkler: gece mavisi `#10203f`, Yolhan mavisi `#2a539f`, şerit sarısı `#f2b705` (yalnızca yol ve ana düğme), asfalt `#2b2e33`, beton `#e7e9ec`.
- Yazı tipleri: Big Shoulders Display (başlıklar), Manrope (metin).
- Animasyonlar dış kütüphane olmadan: başlık satırları maskeden yükselir, giriş slaytı yavaş yakınlaşarak geçer, dönen kelimeler, marka şeridi, sayfa geçiş perdesi (CSS + `sessionStorage` bayrağı). `prefers-reduced-motion`'da hepsi kapanır.

## Fotoğraflar

Ham çekimler `fotograflar-ham/` (depoya girmez). Web sürümleri `medya/*.webp`; seçim ve kırpmalar bir kerelik Pillow betiğiyle üretildi. Yeni fotoğraflar panelden yüklenir; panel tarayıcıda 2200 px'e küçültüp WebP yapar.

## DNS (GoDaddy)

`@` → 185.199.108.153 / .109 / .110 / .111 (A), `www` → barankayaoglu.github.io (CNAME). `b2b` (BayiPro, 185.95.0.229) ve e-posta kayıtları (MX, SPF, DKIM, DMARC) ayrı; dokunma.

## Yerel önizleme

`claudecalisma/.claude/launch.json` → `yolhanendustri` (port 5530, `dist/`'i sunar). Önce derle.
