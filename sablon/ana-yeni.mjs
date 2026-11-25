/* Yeni ana sayfa. İçerik icerik/site.json'dan gelir (panelden düzenlenir). Kendi (sade) iskeletini kullanır.
   Animasyonlar: statik/js/yeni.js  (kaynak: yolhan-site/src/scripts, `npm run paketle`).
   Türkiye şekli: sablon/turkiye-harita.mjs (Natural Earth, kamu malı; yolhan-site/scripts/harita-uret.mjs). */
import { esc, br, waHref, haritaHref, iskelet, ustHtml, altHtml } from "./ortak.mjs";
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
  const a = c.anaSayfa, g = a.giris, f = c.firma, h = c.hakkimizda, film = { ...FILM, ...(a.film || {}) };
  const sayac = [
    { v: new Date().getFullYear() - Number(f.kurulus), ek: "", e: "Yıllık tecrübe" },
    { v: (c.gruplar || []).length, ek: "", e: "Ana ürün grubu" },
    { v: (c.markalar || []).length, ek: "", e: "Marka" },
    ...(c._urunSayisi ? [{ v: c._urunSayisi, ek: "+", e: "Ürün çeşidi" }] : []),
  ];

  const izmir = { x: (TR.izmir[0] / TR.w) * 100, y: (TR.izmir[1] / TR.h) * 100 };
  const mk = markaSerit(c);
  const fotolar = (a.profil.gorseller || []).slice(0, 3);

  const govde = `
${ustHtml(c, "index.html", "ilk")}
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
${altHtml(c)}`;

  return iskelet(c, {
    dosya: "index.html", baslik: a.seoBaslik, aciklama: a.seoAciklama, govde, jsonLd: anaSayfaLd(c),
    css: ["css/anasayfa.css"], js: ["js/yeni.js"], sade: true,
  });
}
