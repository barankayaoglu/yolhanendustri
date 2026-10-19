/* Dört sayfanın şablonları. İçerik (icerik/site.json) alır, tam HTML döndürür.
   Derleme aracı ve panel önizlemesi aynı fonksiyonları kullanır. */
import {
  esc, br, satirlar, ikon, gorsel, telHref, waHref, haritaHref,
  iskelet, sayfaGiris, bayiBandi, yasalMetin, SITE,
} from "./ortak.mjs";

const grupMarkalari = (c, id) => (c.markalar || []).filter((m) => (m.gruplar || []).includes(id));
const grupAdi = (c, id) => ((c.gruplar || []).find((g) => g.id === id) || {}).ad || id;

/* ---------- Parçalar ---------- */

function grupKarolari(c) {
  return (c.gruplar || []).map((g, i) => {
    const sayi = grupMarkalari(c, g.id).length;
    return `
        <a class="karo karo--${(i % 8) + 1}" href="urun-gruplari.html#${esc(g.id)}">
          ${gorsel(g.gorsel, { sinif: "karo__gorsel", boyutlar: "(min-width: 900px) 50vw, 100vw" })}
          <span class="karo__metin">
            <span class="karo__ad">${esc(g.ad)}</span>
            <span class="karo__ozet">${esc(g.ozet)}</span>
            ${sayi ? `<span class="karo__sayi">${sayi} marka</span>` : ""}
          </span>
        </a>`;
  }).join("");
}

function markaSeridi(c) {
  const m = c.markalar || [];
  const yarim = Math.ceil(m.length / 2);
  const sira = (liste) => liste.map((x) => `<span class="serit__ad">${esc(x.ad)}</span><span class="serit__ayrac" aria-hidden="true">${ikon("han")}</span>`).join("");
  const satir = (liste, yon) => `
        <div class="serit__satir serit__satir--${yon}" aria-hidden="true"><div class="serit__akis">${sira(liste)}${sira(liste)}</div></div>`;
  return `
      <div class="serit">
        <p class="gizli">${m.map((x) => esc(x.ad)).join(", ")}</p>
        ${satir(m.slice(0, yarim), "sol")}${satir(m.slice(yarim), "sag")}
      </div>`;
}

function subeKartlari(c, { harita = false } = {}) {
  const f = c.firma;
  return (c.subeler || []).map((s) => `
        <article class="sube">
          <div class="sube__gorsel">${gorsel(s.gorsel, { boyutlar: "(min-width: 900px) 50vw, 100vw" })}</div>
          ${harita ? `
          <div class="harita" data-harita="${esc(s.haritaSorgu)}" data-baslik="${esc(s.ad)} haritası">
            <button type="button" class="dugme dugme--koyu">${ikon("pin", "i--k")}Haritayı göster</button>
            <small>Harita Google tarafından sağlanır, yüklendiğinde çerez kullanabilir.</small>
          </div>` : ""}
          <div class="sube__metin">
            <span class="sube__ad">${ikon(s === c.subeler[0] ? "warehouse" : "store")}${esc(s.ad)}</span>
            <h3 class="sube__ilce">${esc(s.ilce)}</h3>
            <address>${br(s.adres)}</address>
            <div class="dugmeler">
              <a class="dugme dugme--koyu" href="${haritaHref(s.haritaSorgu)}" target="_blank" rel="noopener">${ikon("pin", "i--k")}Yol tarifi</a>
              <a class="dugme dugme--cizgi-koyu" href="${telHref(f.telefon)}">${ikon("phone", "i--k")}${esc(f.telefon)}</a>
            </div>
          </div>
        </article>`).join("");
}

/* ---------- Ana sayfa ---------- */

export function anaSayfa(c) {
  const a = c.anaSayfa, g = a.giris, p = a.profil, f = c.firma;
  const gorseller = (g.gorseller || []).map((x, i) =>
    gorsel(x, { sinif: "giris__gorsel" + (i === 0 ? " aktif" : ""), yukle: i === 0 ? "eager" : "lazy" })).join("");
  const imler = (g.gorseller || []).map(() => `<span class="giris__im"><span></span></span>`).join("");

  const jsonLd = `
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "Organization",
    name: f.ad, legalName: f.unvan, url: SITE, logo: SITE + "img/logo.png",
    foundingDate: f.kurulus, email: f.eposta, telephone: "+90 " + f.telefon.replace(/^0/, ""),
    location: (c.subeler || []).map((s) => ({
      "@type": "HardwareStore", name: f.ad + " - " + s.ad,
      address: { "@type": "PostalAddress", streetAddress: s.adres.split("\n")[0], addressLocality: s.ilce, addressRegion: "İzmir", addressCountry: "TR" },
    })),
  })}</script>`;

  const govde = `
    <section class="giris" data-durak>
      <div class="giris__gorseller">${gorseller}</div>
      <div class="kap giris__ic">
        <p class="giris__ust">${esc(g.ustSatir)}</p>
        <h1 class="giris__baslik">${satirlar(g.baslik)}</h1>
        <p class="giris__donen">${esc(g.doneneOnEk)} <span class="donen" data-donen='${esc(JSON.stringify(g.donenler || []))}'><span>${esc((g.donenler || [])[0] || "")}</span></span></p>
        <p class="giris__aciklama">${br(g.aciklama)}</p>
        <div class="dugmeler">
          <a class="dugme dugme--sari dugme--b" href="urun-gruplari.html">${esc(g.buton1)}${ikon("arrow", "i--k")}</a>
          <a class="dugme dugme--cizgi dugme--b" href="${esc(f.b2bAdres)}" target="_blank" rel="noopener">${esc(g.buton2)}${ikon("external", "i--k")}</a>
        </div>
      </div>
      <div class="giris__imler" aria-hidden="true">${imler}</div>
    </section>

    <section class="profil bolum" data-durak>
      <div class="kap profil__izgara">
        <div class="kolaj">
          ${(p.gorseller || []).slice(0, 3).map((x, i) => `<figure class="kolaj__${i + 1}" data-parallax="${[-6, 10, -3][i]}">${gorsel(x, { boyutlar: "(min-width: 900px) 30vw, 60vw" })}</figure>`).join("")}
          <span class="kolaj__yil" aria-hidden="true">${esc(f.kurulus)}</span>
        </div>
        <div class="profil__metin">
          <h2 class="baslik-2">${br(p.baslik)}</h2>
          <p class="buyuk">${br(p.metin)}</p>
          <ul class="ilkeler-satir">${(p.maddeler || []).map((m) => `<li>${ikon("check")}${esc(m)}</li>`).join("")}</ul>
          <a class="ok-link" href="hakkimizda.html">${esc(p.baglanti)}${ikon("arrow", "i--k")}</a>
        </div>
      </div>
    </section>

    <section class="gruplar bolum bolum--beton" data-durak>
      <div class="kap">
        <div class="bolum-bas">
          <h2 class="baslik-2">${br(a.gruplar.baslik)}</h2>
          <p>${br(a.gruplar.aciklama)}</p>
        </div>
        <div class="karolar">${grupKarolari(c)}</div>
        <a class="ok-link" href="urun-gruplari.html">${esc(a.gruplar.baglanti)}${ikon("arrow", "i--k")}</a>
      </div>
    </section>

    <section class="markalar bolum bolum--gece" data-durak>
      <div class="kap bolum-bas">
        <h2 class="baslik-2">${br(a.markalar.baslik)}</h2>
        <p>${br(a.markalar.aciklama)}</p>
      </div>
      ${markaSeridi(c)}
    </section>

    <section class="subeler bolum" data-durak>
      <div class="kap">
        <div class="bolum-bas">
          <h2 class="baslik-2">${br(a.subeler.baslik)}</h2>
          <p>${br(a.subeler.aciklama)}</p>
        </div>
        <div class="sube-izgara">${subeKartlari(c)}</div>
      </div>
    </section>
${bayiBandi(c)}`;

  return iskelet(c, { dosya: "index.html", baslik: a.seoBaslik, aciklama: a.seoAciklama, govde, jsonLd });
}

/* ---------- Hakkımızda ---------- */

const ILKE_IKON = ["users", "shield", "spark", "check", "han"];

export function hakkimizda(c) {
  const h = c.hakkimizda;
  const [ilk, ...kalan] = h.hikaye || [];
  const govde = `${sayfaGiris(h)}

    <section class="hikaye bolum" data-durak>
      <div class="kap hikaye__izgara">
        <div class="hikaye__yan">
          <h2 class="baslik-3">${esc(h.hikayeBaslik)}</h2>
          <span class="hikaye__yil" aria-hidden="true">${esc(c.firma.kurulus)}</span>
        </div>
        <div class="hikaye__metin">
          ${ilk ? `<p class="buyuk">${br(ilk)}</p>` : ""}
          ${kalan.map((t) => `<p>${br(t)}</p>`).join("")}
        </div>
      </div>
    </section>

    <section class="ilkeler bolum bolum--gece" data-durak>
      <div class="kap">
        <h2 class="baslik-2">${esc(h.ilkelerBaslik)}</h2>
        <div class="ilkeler__izgara">
          ${(h.ilkeler || []).map((x, i) => `
          <article class="ilke">${ikon(ILKE_IKON[i % ILKE_IKON.length], "i--b")}<h3>${esc(x.ad)}</h3><p>${br(x.metin)}</p></article>`).join("")}
        </div>
      </div>
    </section>

    <section class="galeri" aria-label="Depo ve mağazadan kareler">
      ${(h.galeri || []).map((x, i) => `<figure class="galeri__${i + 1}" data-parallax="${[-8, 6, -4][i % 3]}">${gorsel(x, { boyutlar: "(min-width: 900px) 40vw, 90vw" })}</figure>`).join("")}
    </section>
${bayiBandi(c)}`;
  return iskelet(c, { dosya: "hakkimizda.html", baslik: h.seoBaslik, aciklama: h.seoAciklama, govde });
}

/* ---------- Ürün grupları ---------- */

export function urunGruplari(c) {
  const u = c.urunGruplari;
  const satirlarHtml = (c.gruplar || []).map((g, i) => {
    const markalar = grupMarkalari(c, g.id);
    return `
        <article class="grup-satir${i % 2 ? " grup-satir--ters" : ""}" id="${esc(g.id)}" data-durak>
          <div class="grup-satir__gorsel">${gorsel(g.gorsel, { boyutlar: "(min-width: 900px) 45vw, 100vw" })}</div>
          <div class="grup-satir__metin">
            <h2 class="baslik-2">${esc(g.ad)}</h2>
            <p class="grup-satir__ozet">${esc(g.ozet)}</p>
            <p>${br(g.aciklama)}</p>
            ${markalar.length ? `<ul class="etiketler" aria-label="Markalar">${markalar.map((m) => `<li>${esc(m.ad)}</li>`).join("")}</ul>` : ""}
          </div>
        </article>`;
  }).join("");

  const markaKartlari = (c.markalar || []).map((m) => {
    const gruplar = (m.gruplar || []).map((id) => grupAdi(c, id)).join(", ");
    return `<li class="marka-kart"><span>${esc(m.ad)}</span>${gruplar ? `<small>${esc(gruplar)}</small>` : ""}</li>`;
  }).join("");

  const govde = `${sayfaGiris(u)}

    <section class="bolum grup-listesi">
      <div class="kap">${satirlarHtml}
      </div>
    </section>

    <section class="bolum bolum--beton" data-durak>
      <div class="kap">
        <div class="bolum-bas">
          <h2 class="baslik-2">${esc(u.markalarBaslik)}</h2>
          <p>${br(u.markalarAciklama)}</p>
        </div>
        <ul class="marka-kartlari">${markaKartlari}</ul>
      </div>
    </section>
${bayiBandi(c)}`;
  return iskelet(c, { dosya: "urun-gruplari.html", baslik: u.seoBaslik, aciklama: u.seoAciklama, govde });
}

/* ---------- E-katalog ---------- */

// Kitap motoru (statik/js/ekatalog.js) bu iskeleti doldurur; sayfa görselleri ve fihrist
// ekatalog/ klasöründen gelir (Yolhan Fiyat Paneli'nden yayınlanır).
const ek = (yol) => `<svg class="ekat__i" viewBox="0 0 24 24" aria-hidden="true">${yol}</svg>`;
const EK_IKON = {
  geri: ek('<path d="M15 5l-7 7 7 7"/>'),
  ileri: ek('<path d="M9 5l7 7-7 7"/>'),
  liste: ek('<path d="M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>'),
  ara: ek('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>'),
  buyut: ek('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5M11 8v6M8 11h6"/>'),
  tam: ek('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  paylas: ek('<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>'),
  kapat: ek('<path d="M6 6l12 12M18 6L6 18"/>'),
};

export function eKatalog(c) {
  const e = c.ekatalog;
  const f = c.firma;
  const govde = `
    <section class="ekat" data-ekatalog data-durak aria-label="${esc(e.baslik.replace(/\n/g, " "))}">
      <div class="ekat__ust kap">
        <p class="ekat__ustsatir">${esc(e.ustSatir)}</p>
        <h1 class="ekat__baslik">${satirlar(e.baslik)}</h1>
        <p class="ekat__aciklama">${br(e.aciklama)} <span class="ekat__tarih" data-tarih></span></p>
      </div>

      <div class="ekat__sahne">
        <button class="ekat__ok ekat__ok--geri" type="button" data-geri aria-label="Önceki sayfa">${EK_IKON.geri}</button>
        <div class="ekat__alan" data-alan tabindex="0" role="group" aria-roledescription="katalog" aria-label="Katalog sayfaları. Ok tuşlarıyla sayfa çevirin.">
          <div class="ekat__yukleniyor" data-yukleniyor><span class="ekat__donen" aria-hidden="true"></span><span>Katalog açılıyor…</span></div>
          <div class="ekat__kayan" data-kayan><div class="ekat__cilt" data-cilt></div></div>
          <p class="ekat__ipucu" data-ipucu hidden>${esc(e.ipucu)}</p>
        </div>
        <button class="ekat__ok ekat__ok--ileri" type="button" data-ileri aria-label="Sonraki sayfa">${EK_IKON.ileri}</button>
      </div>

      <div class="ekat__cubuk">
        <button class="ekat__dugme" type="button" data-ac="icindekiler" aria-expanded="false">${EK_IKON.liste}<span>İçindekiler</span></button>
        <button class="ekat__dugme" type="button" data-ac="ara" aria-expanded="false">${EK_IKON.ara}<span>Ürün ara</span></button>
        <div class="ekat__ilerleme">
          <output class="ekat__etiket" data-etiket aria-live="polite">1</output>
          <input class="ekat__kaydirgac" type="range" min="1" max="2" value="1" step="1" data-kaydirgac aria-label="Sayfaya git">
          <span class="ekat__toplam" data-toplam></span>
        </div>
        <button class="ekat__dugme ekat__dugme--ikon" type="button" data-buyut aria-pressed="false" aria-label="Yakınlaştır">${EK_IKON.buyut}</button>
        <button class="ekat__dugme ekat__dugme--ikon" type="button" data-paylas aria-label="Bu sayfayı paylaş">${EK_IKON.paylas}</button>
        <button class="ekat__dugme ekat__dugme--ikon" type="button" data-tam aria-label="Tam ekran">${EK_IKON.tam}</button>
      </div>

      <aside class="ekat__cekmece" data-cekmece hidden aria-label="Katalog gezinmesi">
        <div class="ekat__cekmece-bas">
          <div class="ekat__sekmeler" role="tablist">
            <button type="button" role="tab" data-sekme="icindekiler">İçindekiler</button>
            <button type="button" role="tab" data-sekme="ara">Ürün ara</button>
          </div>
          <button class="ekat__dugme ekat__dugme--ikon" type="button" data-kapat aria-label="Kapat">${EK_IKON.kapat}</button>
        </div>
        <div class="ekat__panel" data-panel="icindekiler"><ol class="ekat__bolumler" data-bolumler></ol></div>
        <div class="ekat__panel" data-panel="ara">
          <input class="ekat__arama" type="search" placeholder="Ürün ya da marka yazın" autocomplete="off" data-arama aria-label="Ürün ya da marka ara">
          <ul class="ekat__sonuclar" data-sonuclar></ul>
        </div>
      </aside>

      <noscript><p class="ekat__nojs">Katalog sayfalarını görmek için JavaScript gerekir. Güncel ürün ve fiyat bilgisi için <a href="${esc(f.b2bAdres)}">B2B sistemimizi</a> kullanabilir ya da bizi arayabilirsiniz: <a href="${telHref(f.telefon)}">${esc(f.telefon)}</a>.</p></noscript>
    </section>

    <section class="ekat-not bolum bolum--gece" data-durak>
      <div class="kap ekat-not__ic">
        <div>
          <h2 class="baslik-3">${br(e.notBaslik)}</h2>
          <p>${br(e.notMetin)}</p>
        </div>
        <div class="dugmeler">
          <a class="dugme dugme--sari dugme--b" href="${esc(f.b2bAdres)}" target="_blank" rel="noopener">${esc(e.notButon1)}${ikon("external", "i--k")}</a>
          <a class="dugme dugme--cizgi dugme--b" href="${waHref(f.whatsapp, e.whatsappMesaji)}" target="_blank" rel="noopener">${ikon("chat", "i--k")}${esc(e.notButon2)}</a>
        </div>
      </div>
    </section>`;
  return iskelet(c, { dosya: "e-katalog.html", baslik: e.seoBaslik, aciklama: e.seoAciklama, govde, css: ["css/ekatalog.css"], js: ["js/ekatalog.js"] });
}

/* ---------- İletişim ---------- */

export function iletisim(c) {
  const i = c.iletisim, f = c.firma;
  const kart = (href, ik, etiket, deger, dis) => `
          <a class="iletisim-kart" href="${href}"${dis ? ' target="_blank" rel="noopener"' : ""}>
            <span class="iletisim-kart__ikon">${ikon(ik)}</span><span class="iletisim-kart__etiket">${etiket}</span><span class="iletisim-kart__deger">${esc(deger)}</span>
          </a>`;
  const govde = `${sayfaGiris(i)}

    <section class="bolum" data-durak>
      <div class="kap"><div class="iletisim-kartlari">
        ${kart(telHref(f.telefon), "phone", "Telefon", f.telefon)}
        ${kart(waHref(f.whatsapp), "chat", "WhatsApp", f.whatsapp, true)}
        ${kart("mailto:" + esc(f.eposta), "mail", "E-posta", f.eposta)}
        <div class="iletisim-kart"><span class="iletisim-kart__ikon">${ikon("clock")}</span><span class="iletisim-kart__etiket">Çalışma saatleri</span><span class="iletisim-kart__deger">${esc(f.calismaSaatleri)}</span></div>
      </div></div>
    </section>

    <section class="bolum bolum--beton" data-durak>
      <div class="kap">
        <div class="bolum-bas"><h2 class="baslik-2">${esc(i.subelerBaslik)}</h2></div>
        <div class="sube-izgara">${subeKartlari(c, { harita: true })}</div>
      </div>
    </section>

    <section class="bolum bolum--gece bayilik" id="bayilik" data-durak>
      <div class="kap bayilik__ic">
        <h2 class="baslik-2">${br(i.bayilikBaslik)}</h2>
        <p class="buyuk">${br(i.bayilikMetin)}</p>
        <div class="dugmeler">
          <a class="dugme dugme--sari dugme--b" href="${waHref(f.whatsapp, f.bayilikMesaji)}" target="_blank" rel="noopener">${ikon("chat", "i--k")}WhatsApp'tan yazın</a>
          <a class="dugme dugme--cizgi dugme--b" href="${telHref(f.telefon)}">${ikon("phone", "i--k")}${esc(f.telefon)}</a>
        </div>
      </div>
    </section>`;
  return iskelet(c, { dosya: "iletisim.html", baslik: i.seoBaslik, aciklama: i.seoAciklama, govde });
}

/* ---------- Yasal metinler (KVKK, gizlilik) ---------- */

function yasalSayfa(c, anahtar, dosya) {
  const y = (c.yasal || {})[anahtar] || { baslik: "", bolumler: [] };
  const bolumler = y.bolumler || [];
  const govde = `
    <section class="yasal-giris" data-durak>
      <div class="kap">
        <h1 class="yasal-giris__baslik">${satirlar(y.baslik)}</h1>
        ${y.aciklama ? `<p class="yasal-giris__aciklama">${br(y.aciklama)}</p>` : ""}
        ${y.guncelleme ? `<p class="yasal-giris__tarih">Son güncelleme: ${esc(y.guncelleme)}</p>` : ""}
      </div>
    </section>

    <section class="bolum yasal" data-durak>
      <div class="kap yasal__izgara">
        <nav class="yasal__icindekiler" aria-label="İçindekiler">
          <h2>İçindekiler</h2>
          <ol>${bolumler.map((b, i) => `<li><a href="#bolum-${i + 1}">${esc(b.baslik)}</a></li>`).join("")}</ol>
        </nav>
        <div class="yasal__metin">
          ${bolumler.map((b, i) => `
          <section id="bolum-${i + 1}">
            <h2><span aria-hidden="true">${i + 1}.</span> ${esc(b.baslik)}</h2>
            ${yasalMetin(b.metin, c)}
          </section>`).join("")}
        </div>
      </div>
    </section>`;
  return iskelet(c, { dosya, baslik: y.seoBaslik || y.baslik, aciklama: y.seoAciklama || y.aciklama, govde });
}

export const kvkk = (c) => yasalSayfa(c, "kvkk", "kvkk-aydinlatma-metni.html");
export const gizlilik = (c) => yasalSayfa(c, "gizlilik", "gizlilik-politikasi.html");

export const SAYFALAR = [
  { dosya: "index.html", olustur: anaSayfa },
  { dosya: "hakkimizda.html", olustur: hakkimizda },
  { dosya: "urun-gruplari.html", olustur: urunGruplari },
  { dosya: "e-katalog.html", olustur: eKatalog },
  { dosya: "iletisim.html", olustur: iletisim },
  { dosya: "kvkk-aydinlatma-metni.html", olustur: kvkk },
  { dosya: "gizlilik-politikasi.html", olustur: gizlilik },
];
