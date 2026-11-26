/* Yeni ana sayfa. İçerik icerik/site.json'dan gelir (panelden düzenlenir). Kendi (sade) iskeletini kullanır.
   Animasyonlar: statik/js/yeni.js  (kaynak: yolhan-site/src/scripts, `npm run paketle`).
   Şubeler artık İletişim sayfasında. */
import { esc, br, iskelet, ustHtml, altHtml } from "./ortak.mjs";
import { anaSayfaLd } from "./sayfalar.mjs";

const FILM = { baslik: "Tanıtım filmimiz", src: "medya/tanitim-filmi.mp4", poster: "medya/tanitim-filmi.jpg", mobil: "medya/tanitim-filmi-mobil.mp4" };

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

  const mk = markaSerit(c);
  const fotolar = (a.profil.gorseller || []).slice(0, 5);

  const govde = `
${ustHtml(c, "index.html", "ilk")}
<main id="top">
  <section class="hero" id="hero" data-tema="koyu">
    <div class="hero__fotolar">
      <video class="hero__video" autoplay muted loop playsinline preload="metadata" poster="${esc(film.poster)}" aria-label="${esc(film.baslik)}" disablepictureinpicture data-mobil="${esc(film.mobil)}"><source src="${esc(film.src)}" type="video/mp4"></video>
      <script>(function(){var v=document.currentScript.previousElementSibling;if(matchMedia("(max-width:768px)").matches){v.querySelector("source").src=v.dataset.mobil;v.load()}})()</script>
      <div class="hero__golge"></div>
    </div>
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

  <section class="about" id="hakkimizda" data-tema="koyu">
    <div class="about__foto" role="region" aria-label="Fotoğraflar">
      ${fotolar.map((x, i) => `<img class="fs${i === 0 ? " on" : ""}" src="${esc(x.src)}" alt="${esc(x.alt)}" loading="lazy" decoding="async">`).join("")}
    </div>
    <div class="about__metin">
      <h2>${br(h.baslik)}</h2>
      ${(h.hikaye || []).slice(0, 2).map((p) => `<p>${esc(p)}</p>`).join("")}
      <a class="ok" href="hakkimizda.html">${esc(a.profil.baglanti)} →</a>
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

  <section id="ilkeler" data-tema="acik"><div class="wrap">
    <h2 class="center" data-reveal>${esc(h.ilkelerBaslik)}</h2>
    <div class="team">
      ${(h.ilkeler || []).map((t) => `<div class="ilke" data-reveal><h3>${esc(t.ad)}</h3><p>${esc(t.metin)}</p></div>`).join("")}
    </div>
  </div></section>${c.sss ? `

  <section id="sss" data-tema="acik"><div class="wrap">
    <h2 class="center" data-reveal>${esc(c.sss.baslik)}</h2>
    <div class="sss">${c.sss.sorular.map((q) => `<details><summary>${esc(q.s)}</summary><p>${esc(q.c)}</p></details>`).join("")}</div>
  </div></section>` : ""}
</main>
${altHtml(c)}`;

  return iskelet(c, {
    dosya: "index.html", baslik: a.seoBaslik, aciklama: a.seoAciklama, govde, jsonLd: anaSayfaLd(c),
    css: ["css/anasayfa.css"], js: ["js/yeni.js"], sade: true,
  });
}
