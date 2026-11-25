/* Yeni ana sayfa. İçerik icerik/site.json'dan gelir (panelden düzenlenir). Kendi (sade) iskeletini kullanır.
   Animasyonlar: statik/js/yeni.js  (kaynak: yolhan-site/src/scripts, `npm run paketle`).
   Türkiye şekli: sablon/turkiye-harita.mjs (Natural Earth, kamu malı; yolhan-site/scripts/harita-uret.mjs). */
import { esc, br, waHref, telHref, haritaHref, iskelet } from "./ortak.mjs";
import { anaSayfaLd } from "./sayfalar.mjs";
import { TR } from "./turkiye-harita.mjs";

const FILM = { baslik: "Tanıtım filmimiz", src: "medya/tanitim-filmi.mp4", poster: "medya/tanitim-filmi.jpg" };

const img = (g, o = {}) => (g && g.src
  ? `<img ${o.sinif ? `class="${o.sinif}" ` : ""}src="${esc(g.src)}" alt="${esc(o.bos ? "" : g.alt)}"${o.bos ? ' aria-hidden="true"' : ""} loading="${o.yukle || "lazy"}" decoding="async"${o.oncelik ? ' fetchpriority="high"' : ""}>`
  : "");

function markaSerit(c) {
  const logo = c._markaLogo || {};
  const m = c.markalar || [];
  const yarim = Math.ceil(m.length / 2);
  const cip = (x) => `<div class="chip-m">${logo[x.ad] ? `<img src="medya/${esc(logo[x.ad])}" alt="${esc(x.ad)}" loading="lazy" decoding="async">` : esc(x.ad)}</div>`;
  const satir = (liste) => `<div class="serit__satir"><div class="serit__akis">${liste.map(cip).join("")}</div><div class="serit__akis" aria-hidden="true">${liste.map(cip).join("").replace(/alt="[^"]*"/g, 'alt=""')}</div></div>`;
  return { yarim, m, satir };
}

export function anaSayfaYeni(c) {
  const a = c.anaSayfa, g = a.giris, f = c.firma, h = c.hakkimizda, M = c.menu, film = { ...FILM, ...(a.film || {}) };
  const sayac = [
    { v: new Date().getFullYear() - Number(f.kurulus), ek: "", e: "Yıllık tecrübe" },
    { v: (c.gruplar || []).length, ek: "", e: "Ana ürün grubu" },
    { v: (c.markalar || []).length, ek: "", e: "Marka" },
    ...(c._urunSayisi ? [{ v: c._urunSayisi, ek: "+", e: "Ürün çeşidi" }] : []),
  ];

  // Menü: Ana Sayfa, Kurumsal (açılır), Ürünlerimiz, Markalarımız, Medya, İletişim, E-Katalog
  const kurumsal = [
    ["hakkimizda.html", M.hakkimizda || "Hakkımızda"],
    ["vizyon-misyon.html", M.vizyon || "Vizyonumuz ve Misyonumuz"],
    ["iletisim.html#bayilik", M.bayimizOlun || "Bayimiz Olun"],
  ];
  const duz = [
    ["urunlerimiz.html", M.urunlerimiz || "Ürünlerimiz"],
    ["markalarimiz.html", M.markalarimiz || "Markalarımız"],
    ["medya.html", M.medya || "Medya"],
    ["iletisim.html", M.iletisim || "İletişim"],
    ["e-katalog.html", M.ekatalog || "E-Katalog"],
  ];
  const pi = ([href, ad]) => `<a class="pi" href="${href}">${esc(ad)}</a>`;
  const b2bAd = M.b2bGiris || "B2B Giriş", bayiAd = M.bayiBasvuru || "Bayi Başvuru Formu";
  const izmir = { x: (TR.izmir[0] / TR.w) * 100, y: (TR.izmir[1] / TR.h) * 100 };
  const mk = markaSerit(c);
  const fotolar = (a.profil.gorseller || []).slice(0, 3);
  const tel = telHref(f.telefon);
  const harfler = "YOLHAN".split("").map((x) => `<span>${x}</span>`).join("");

  const govde = `
<header class="nav" id="nav" data-tema="ilk">
  <a class="logo" href="index.html" aria-label="${esc(f.ad)} ana sayfa"><img class="neg" src="img/logo-negatif.png" alt="${esc(f.ad)}" width="640" height="150"><img class="org" src="img/logo.png" alt="" width="640" height="150"></a>
  <nav class="pill" aria-label="Ana menü">
    <span class="hap" aria-hidden="true"></span>
    <a class="pi on" href="index.html" aria-current="page">${esc(M.anaSayfa || "Ana Sayfa")}</a>
    <div class="dd">
      <button class="pi dd__btn" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="dd-kurumsal">${esc(M.kurumsal || "Kurumsal")}<svg viewBox="0 0 10 6" width="9" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="dd__list" id="dd-kurumsal" hidden>${kurumsal.map(([href, ad]) => `<a href="${href}">${esc(ad)}</a>`).join("")}</div>
    </div>
    ${duz.map(pi).join("")}
  </nav>
  <div class="right">
    <a class="btn btn--b2b" href="${esc(f.b2bAdres)}" target="_blank" rel="noopener"><span>${esc(b2bAd)}</span></a>
    <a class="btn chip btn--bayi" href="iletisim.html#bayilik">${esc(bayiAd)}</a>
    <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menüyü aç">Menü</button>
  </div>
</header>
<div id="menu" class="menu" role="dialog" aria-modal="true" aria-label="Menü" hidden>
  <a href="index.html">${esc(M.anaSayfa || "Ana Sayfa")}</a>
  <span class="menu__bas">${esc(M.kurumsal || "Kurumsal")}</span>
  ${kurumsal.map(([href, ad]) => `<a class="menu__alt" href="${href}">${esc(ad)}</a>`).join("")}
  ${duz.map(([href, ad]) => `<a href="${href}">${esc(ad)}</a>`).join("")}
  <a class="menu__b2b" href="${esc(f.b2bAdres)}" target="_blank" rel="noopener">${esc(b2bAd)}</a>
  <a href="iletisim.html#bayilik">${esc(bayiAd)}</a>
</div>
<main id="top">
  <section class="hero" id="hero" data-tema="koyu">
    <div class="hero__fotolar">
      <video class="hero__video" autoplay muted loop playsinline preload="auto" poster="${esc(film.poster)}" aria-label="${esc(film.baslik)}" disablepictureinpicture><source src="${esc(film.src)}" type="video/mp4"></video>
      <div class="hero__golge"></div>
    </div>
    <svg class="kapak" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d=""/></svg>
    <h1 class="gizli">${esc(String(g.baslik).replace(/\n/g, " "))}</h1>
  </section>

  <section class="sari" id="istatistik" data-tema="sari">
    <canvas class="bars" aria-hidden="true"></canvas>
    <div class="wrap center">
      <h2 data-reveal>${br(a.profil.baslik)}</h2>
      <div class="stats">
        ${sayac.map((s) => `<div class="stat" data-reveal><b data-count="${s.v}" data-suffix="${s.ek}" aria-label="${s.v}${s.ek}">${s.v}${s.ek}</b><span>${esc(s.e)}</span></div>`).join("")}
      </div>
    </div>
  </section>

  <section class="about" id="hakkimizda" data-tema="acik">
    <div class="about__izgara">
      <div class="about__metin">
        <h2 data-reveal>${br(h.baslik)}</h2>
        ${(h.hikaye || []).slice(0, 2).map((p) => `<p data-reveal>${esc(p)}</p>`).join("")}
        <a class="ok" href="hakkimizda.html" data-reveal>${esc(a.profil.baglanti)} →</a>
        <div class="about__yil" data-reveal><span>Kuruluş yılımız</span><b>${esc(f.kurulus)}</b></div>
      </div>
      <div class="about__foto" role="region" aria-roledescription="carousel" aria-label="Fotoğraflar">
        ${fotolar.map((x, i) => `<img class="fs${i === 0 ? " on" : ""}" src="${esc(x.src)}" alt="${esc(x.alt)}" loading="lazy" decoding="async">`).join("")}
        ${fotolar.length > 1 ? `<div class="ctl"><button type="button" id="fprev" aria-label="Önceki fotoğraf">‹</button><button type="button" id="fnext" aria-label="Sonraki fotoğraf">›</button></div>` : ""}
      </div>
    </div>
  </section>

  <section class="markalar" id="markalar" data-tema="koyu"><div class="wrap center">
    <h2 data-reveal>${br(a.markalar.baslik)}</h2>
    <p class="lead" data-reveal>${br(a.markalar.aciklama)}</p>
  </div>
    <p class="gizli">${mk.m.map((x) => esc(x.ad)).join(", ")}</p>
    <div class="serit">
      ${mk.satir(mk.m.slice(0, mk.yarim))}
      ${mk.satir(mk.m.slice(mk.yarim))}
    </div>
  </section>

  <section class="cases" id="urunler" data-tema="koyu">
    <div class="wrap"><h2>${br(a.gruplar.baslik)}</h2><p class="lead">${br(a.gruplar.aciklama)}</p></div>
    <div class="embla" role="region" aria-roledescription="carousel" aria-label="Ürün grupları">
      <div class="embla__c">
        ${(c.gruplar || []).map((p) => `<article class="card">${img(p.gorsel, { sinif: "img" })}<div class="b"><h3><a href="urun-${esc(p.id)}.html" class="stretch">${esc(p.ad)}</a></h3><p>${esc(p.ozet)}</p></div></article>`).join("")}
      </div>
    </div>
    <div class="ctl"><button id="prev" type="button" aria-label="Önceki">‹</button><button id="next" type="button" aria-label="Sonraki">›</button></div>
  </section>

  <section id="subeler" data-tema="koyu"><div class="wrap center">
    <h2 data-reveal>${br(a.subeler.baslik)}</h2>
    <p class="lead" data-reveal>${br(a.subeler.aciklama)}</p>
    <div class="trharita" data-reveal>
      <svg viewBox="0 0 ${TR.w} ${TR.h}" role="img" aria-label="Türkiye haritası, İzmir işaretli"><path d="${TR.d}"/></svg>
      <span class="dot" style="left:${izmir.x.toFixed(2)}%;top:${izmir.y.toFixed(2)}%" data-l="İzmir"></span>
    </div>
    <div class="branches">
      ${(c.subeler || []).map((s) => `<a class="bcard" href="${haritaHref(s.haritaSorgu)}" target="_blank" rel="noopener" data-reveal>${img(s.gorsel)}<div><b>${esc(s.ad)}</b><small>${esc(s.ilce)}</small><span>${esc(String(s.adres).replace("\n", " "))}</span><em>HARİTADA AÇ ↗</em></div></a>`).join("")}
    </div>
  </div></section>

  <section id="ilkeler" data-tema="acik"><div class="wrap">
    <h2 class="center" data-reveal>${esc(h.ilkelerBaslik)}</h2>
    <div class="team">
      ${(h.ilkeler || []).map((t) => `<div class="ilke" data-reveal><h3>${esc(t.ad)}</h3><p>${esc(t.metin)}</p></div>`).join("")}
    </div>
  </div></section>

  <section class="bayi" data-tema="koyu"><div class="wrap center">
    <h2 data-reveal>${br(a.bayi.baslik)}</h2>
    <p class="lead" data-reveal>${br(a.bayi.metin)}</p>
    <div class="cta" data-reveal><a class="btn" href="${esc(f.b2bAdres)}" target="_blank" rel="noopener">${esc(a.bayi.buton1)}</a><a class="btn chip" href="${waHref(f.whatsapp, f.bayilikMesaji)}" target="_blank" rel="noopener">${esc(a.bayi.buton2)}</a></div>
  </div></section>
</main>
<footer data-tema="koyu">
  <div class="mega" aria-hidden="true">${harfler}</div>
  <div class="fcols">
    <div><a class="flogo" href="index.html"><img src="img/logo-negatif.png" alt="${esc(f.ad)}" width="640" height="150" loading="lazy"></a><p class="copy" style="text-align:left;margin-top:12px">${esc(f.unvan)}</p></div>
    <div><h3>${esc(M.kurumsal || "Kurumsal")}</h3>${kurumsal.map(([href, ad]) => `<a href="${href}">${esc(ad)}</a>`).join("")}</div>
    <div><h3>Sayfalar</h3>${duz.map(([href, ad]) => `<a href="${href}">${esc(ad)}</a>`).join("")}</div>
    <div><h3>${esc(M.iletisim || "İletişim")}</h3><a href="${tel}">${esc(f.telefon)}</a><a href="${waHref(f.whatsapp)}" target="_blank" rel="noopener">WhatsApp ${esc(f.whatsapp)}</a><a href="mailto:${esc(f.eposta)}">${esc(f.eposta)}</a><span class="copy" style="text-align:left;display:block">${esc(f.calismaSaatleri)}</span></div>
  </div>
  <p class="copy">© ${new Date().getFullYear()} ${esc(f.unvan)} · <a href="kvkk-aydinlatma-metni.html">${esc(M.kvkk || "KVKK Aydınlatma Metni")}</a> · <a href="gizlilik-politikasi.html">${esc(M.gizlilik || "Gizlilik Politikası")}</a></p>
</footer>
<button class="top" id="top-btn" type="button" aria-label="En üste çık" hidden><svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path d="M3 10l5-5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;

  return iskelet(c, {
    dosya: "index.html", baslik: a.seoBaslik, aciklama: a.seoAciklama, govde, jsonLd: anaSayfaLd(c),
    css: ["css/yeni.css"], js: ["js/yeni.js"], sade: true,
  });
}
