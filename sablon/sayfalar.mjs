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
  { dosya: "iletisim.html", olustur: iletisim },
  { dosya: "kvkk-aydinlatma-metni.html", olustur: kvkk },
  { dosya: "gizlilik-politikasi.html", olustur: gizlilik },
];
