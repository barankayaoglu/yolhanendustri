/* Yeni ana sayfa (koyu, fotoğraflı, scroll animasyonlu). İçerik icerik/site.json'dan gelir;
   panelden yapılan düzenlemeler bu sayfaya da yansır. Kendi iskeletini (sade) kullanır.
   Animasyonlar: statik/js/yeni.js (yolhan-site/src/scripts/motion.ts'den paketlenir, GSAP+Lenis+Embla, kendi sunucudan). */
import { esc, br, waHref, telHref, haritaHref, iskelet } from "./ortak.mjs";
import { anaSayfaLd } from "./sayfalar.mjs";

const img = (g, o = {}) => (g && g.src
  ? `<img ${o.sinif ? `class="${o.sinif}" ` : ""}src="${esc(g.src)}" alt="${esc(o.bos ? "" : g.alt)}"${o.bos ? ' aria-hidden="true"' : ""} loading="${o.yukle || "lazy"}" decoding="async"${o.oncelik ? ' fetchpriority="high"' : ""}>`
  : "");

export function anaSayfaYeni(c) {
  const a = c.anaSayfa, g = a.giris, f = c.firma, h = c.hakkimizda;
  const logoVar = c._markaLogo || {};
  const yil = new Date().getFullYear() - Number(f.kurulus || yilSon());
  const sayac = [
    { v: yil, ek: "", e: "Yıllık tecrübe" },
    { v: (c.gruplar || []).length, ek: "", e: "Ana ürün grubu" },
    { v: (c.markalar || []).length, ek: "", e: "Marka" },
    ...(c._urunSayisi ? [{ v: c._urunSayisi, ek: "+", e: "Ürün çeşidi" }] : []),
  ];
  const menu = [
    ["#urunler", "Ürün Grupları", "urunler"],
    ["#subeler", "Şubeler", "subeler"],
    ["hakkimizda.html", c.menu.hakkimizda || "Hakkımızda"],
    ["e-katalog.html", c.menu.ekatalog || "E-Katalog"],
    ["iletisim.html", c.menu.iletisim || "İletişim"],
  ];
  const menuLink = ([href, ad, s]) => `<a href="${href}"${s ? ` data-s="${s}"` : ""}>${esc(ad)}</a>`;
  const tel = telHref(f.telefon);

  const govde = `
<header class="nav" id="nav">
  <a class="logo" href="index.html" aria-label="${esc(f.ad)} ana sayfa"><img src="img/logo.png" alt="${esc(f.ad)}" width="640" height="150"></a>
  <nav class="pill" aria-label="Ana menü">
    <span class="hap" aria-hidden="true"></span>
    ${menu.map(menuLink).join("")}
  </nav>
  <div class="right">
    <a class="btn" href="${esc(f.b2bAdres)}" target="_blank" rel="noopener">${esc(c.menu.b2bGiris || "B2B Giriş")}</a>
    <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menüyü aç">Menü</button>
  </div>
</header>
<div id="menu" class="menu" role="dialog" aria-modal="true" aria-label="Menü" hidden>
  ${menu.map(menuLink).join("")}
  <a href="${esc(f.b2bAdres)}" target="_blank" rel="noopener">${esc(c.menu.b2bGiris || "B2B Giriş")}</a>
</div>
<main id="top">
  <section class="hero" id="hero">
    ${(g.gorseller || []).map((x, i) => i === 0
      ? img(x, { sinif: "slide", yukle: "eager", oncelik: true })
      : `<img class="slide" data-src="${esc(x.src)}" alt="" aria-hidden="true" decoding="async">`).join("")}
    <div class="txt">
      <p class="kicker">${esc(g.ustSatir)}</p>
      <h1>${br(g.baslik)}</h1>
      <p>${br(g.aciklama)}</p>
      <div class="cta"><a class="btn" href="#urunler">${esc(g.buton1)}</a><a class="btn chip" href="${esc(f.b2bAdres)}" target="_blank" rel="noopener">${esc(g.buton2)}</a></div>
    </div>
    <div class="txt txt2" aria-hidden="true">
      <h2>${br(a.gruplar.baslik)}</h2>
      <p>${br(a.gruplar.aciklama)}</p>
    </div>
  </section>

  <section id="hakkimizda"><div class="wrap">
    <h2 class="center tag" data-reveal>${br(a.profil.baslik)}</h2>
    <div class="stats">
      ${sayac.map((s) => `<div class="stat" data-reveal><b data-count="${s.v}" data-suffix="${s.ek}" aria-label="${s.v}${s.ek}">${s.v}${s.ek}</b><span>${esc(s.e)}</span></div>`).join("")}
    </div>
  </div></section>

  <section><div class="wrap about">
    <div data-reveal><h2 style="margin-bottom:24px">${br(h.baslik)}</h2>${(h.hikaye || []).slice(0, 2).map((p) => `<p style="margin-bottom:16px;color:var(--color-text-muted)">${esc(p)}</p>`).join("")}<a class="ok" href="hakkimizda.html">${esc(a.profil.baglanti)} →</a></div>
    <div data-reveal>${img(h.gorsel, { sinif: "aimg" })}<div class="since"><small>Kuruluş</small>${esc(f.kurulus)}</div></div>
  </div></section>

  <section class="cases" id="urunler"><div class="wrap">
    <h2 class="up">${br(a.gruplar.baslik)}</h2>
    <p class="lead">${br(a.gruplar.aciklama)}</p>
    <div class="embla" role="region" aria-roledescription="carousel" aria-label="Ürün grupları">
      <div class="embla__c">
        ${(c.gruplar || []).map((p) => `<article class="card">${img(p.gorsel, { sinif: "img" })}<div class="b"><span class="cat">Ürün grubu</span><h3><a href="urun-${esc(p.id)}.html" class="stretch">${esc(p.ad)}</a></h3><p>${esc(p.ozet)}</p></div></article>`).join("")}
      </div>
    </div>
    <div class="ctl"><button id="prev" type="button" aria-label="Önceki">‹</button><button id="next" type="button" aria-label="Sonraki">›</button></div>
  </div></section>

  <section id="markalar"><div class="wrap center">
    <h2 data-reveal>${br(a.markalar.baslik)}</h2>
    <div class="chips">${(c.markalar || []).map((m) => `<div data-reveal>${logoVar[m.ad] ? `<img src="medya/${esc(logoVar[m.ad])}" alt="${esc(m.ad)}" loading="lazy" decoding="async">` : esc(m.ad)}</div>`).join("")}</div>
  </div></section>

  <section id="subeler"><div class="wrap center">
    <h2 data-reveal>${br(a.subeler.baslik)}</h2>
    <p class="lead" data-reveal>${br(a.subeler.aciklama)}</p>
    <div class="branches">
      ${(c.subeler || []).map((s) => `<a class="bcard" href="${haritaHref(s.haritaSorgu)}" target="_blank" rel="noopener" data-reveal>${img(s.gorsel)}<div><b>${esc(s.ad)}</b><small>${esc(s.ilce)}</small><span>${esc(String(s.adres).replace("\n", " "))}</span><em>HARİTADA AÇ ↗</em></div></a>`).join("")}
    </div>
  </div></section>

  <section id="ilkeler"><div class="wrap">
    <h2 class="up center" data-reveal>${esc(h.ilkelerBaslik)}</h2>
    <div class="team">
      ${(h.ilkeler || []).map((t) => `<div class="ilke" data-reveal><h3>${esc(t.ad)}</h3><p>${esc(t.metin)}</p></div>`).join("")}
    </div>
  </div></section>

  <section class="bayi"><div class="wrap center">
    <h2 data-reveal>${br(a.bayi.baslik)}</h2>
    <p class="lead" data-reveal>${br(a.bayi.metin)}</p>
    <div class="cta" data-reveal><a class="btn" href="${esc(f.b2bAdres)}" target="_blank" rel="noopener">${esc(a.bayi.buton1)}</a><a class="btn chip" href="${waHref(f.whatsapp, f.bayilikMesaji)}" target="_blank" rel="noopener">${esc(a.bayi.buton2)}</a></div>
  </div></section>
</main>
<footer>
  <div class="mega" aria-hidden="true">YOLHAN</div>
  <div class="fcols">
    <div><a class="flogo" href="index.html"><img src="img/logo.png" alt="${esc(f.ad)}" width="320" height="75" loading="lazy"></a><p class="copy" style="text-align:left;margin-top:12px">${esc(f.unvan)}</p></div>
    <div><h3>Sayfalar</h3>${menu.map(menuLink).join("")}<a href="urunlerimiz.html">${esc(c.menu.urunlerimiz || "Ürünlerimiz")}</a><a href="markalarimiz.html">${esc(c.menu.markalarimiz || "Markalarımız")}</a></div>
    <div><h3>${esc(c.menu.iletisim || "İletişim")}</h3><a href="${tel}">${esc(f.telefon)}</a><a href="${waHref(f.whatsapp)}" target="_blank" rel="noopener">WhatsApp ${esc(f.whatsapp)}</a><a href="mailto:${esc(f.eposta)}">${esc(f.eposta)}</a><span class="copy" style="text-align:left;display:block">${esc(f.calismaSaatleri)}</span></div>
  </div>
  <p class="copy">© ${new Date().getFullYear()} ${esc(f.unvan)} · <a href="kvkk-aydinlatma-metni.html">${esc(c.menu.kvkk || "KVKK Aydınlatma Metni")}</a> · <a href="gizlilik-politikasi.html">${esc(c.menu.gizlilik || "Gizlilik Politikası")}</a></p>
</footer>`;

  return iskelet(c, {
    dosya: "index.html", baslik: a.seoBaslik, aciklama: a.seoAciklama, govde, jsonLd: anaSayfaLd(c),
    css: ["css/yeni.css"], js: ["js/yeni.js"], sade: true,
  });
}

function yilSon() { return new Date().getFullYear(); }
