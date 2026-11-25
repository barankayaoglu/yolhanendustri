/* Dört sayfanın şablonları. İçerik (icerik/site.json) alır, tam HTML döndürür.
   Derleme aracı ve panel önizlemesi aynı fonksiyonları kullanır. */
import {
  esc, br, satirlar, ikon, gorsel, telHref, waHref, haritaHref,
  iskelet, sayfaGiris, yasalMetin, SITE,
} from "./ortak.mjs";
import { anaSayfaYeni } from "./ana-yeni.mjs";

const grupMarkalari = (c, id) => (c.markalar || []).filter((m) => (m.gruplar || []).includes(id));
const grupAdi = (c, id) => ((c.gruplar || []).find((g) => g.id === id) || {}).ad || id;

/* ---------- Parçalar ---------- */

const ldBlok = (o) => `\n  <script type="application/ld+json">${JSON.stringify(o)}</script>`;
const ekmek = (adimlar) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: adimlar.map(([ad, yol], i) => ({ "@type": "ListItem", position: i + 1, name: ad, item: SITE + yol })),
});

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

export function anaSayfaLd(c) {
  const f = c.firma;
  return ldBlok({
    "@context": "https://schema.org", "@graph": [
      {
        "@type": "Organization", "@id": SITE + "#firma",
        name: f.ad, legalName: f.unvan, url: SITE, logo: SITE + "img/logo.png",
        foundingDate: f.kurulus, email: f.eposta, telephone: "+90 " + f.telefon.replace(/^0/, ""),
        sameAs: ["https://www.instagram.com/yolhanendustri/"],
        location: (c.subeler || []).map((s) => ({
          "@type": "HardwareStore", name: f.ad + " - " + s.ad, url: SITE, image: SITE + s.gorsel.src,
          telephone: "+90 " + f.telefon.replace(/^0/, ""),
          address: { "@type": "PostalAddress", streetAddress: s.adres.split("\n")[0], addressLocality: s.ilce, addressRegion: "İzmir", addressCountry: "TR" },
        })),
      },
      { "@type": "WebSite", "@id": SITE + "#site", url: SITE, name: f.ad, inLanguage: "tr", publisher: { "@id": SITE + "#firma" } },
    ],
  });
}


/* ---------- Hakkımızda ---------- */

const ILKE_IKON = ["users", "shield", "spark", "check", "han"];

export function hakkimizda(c) {
  const h = c.hakkimizda;
  const [ilk, ...kalan] = h.hikaye || [];
  const govde = `${sayfaGiris(h)}

    <section class="hikaye bolum">
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

    <section class="ilkeler bolum bolum--gece">
      <div class="kap">
        <h2 class="baslik-2">${esc(h.ilkelerBaslik)}</h2>
        <div class="ilkeler__izgara">
          ${(h.ilkeler || []).map((x, i) => `
          <article class="ilke">${ikon(ILKE_IKON[i % ILKE_IKON.length], "i--b")}<h3>${esc(x.ad)}</h3><p>${br(x.metin)}</p></article>`).join("")}
        </div>
      </div>
    </section>

    <section class="galeri" aria-label="Depo ve mağazadan kareler">
      ${(h.galeri || []).map((x, i) => `<figure class="galeri__${i + 1}">${gorsel(x, { boyutlar: "(min-width: 900px) 40vw, 90vw" })}</figure>`).join("")}
    </section>`;
  return iskelet(c, { dosya: "hakkimizda.html", baslik: h.seoBaslik, aciklama: h.seoAciklama, govde });
}


/* ---------- Vizyon ve misyon ---------- */

export function vizyonMisyon(c) {
  const v = c.vizyonMisyon;
  const blok = (b, m) => `
    <section class="hikaye bolum">
      <div class="kap hikaye__izgara">
        <div class="hikaye__yan"><h2 class="baslik-3">${esc(b)}</h2></div>
        <div class="hikaye__metin"><p class="buyuk">${br(m)}</p></div>
      </div>
    </section>`;
  const govde = `${sayfaGiris(v)}${blok(v.vizyonBaslik, v.vizyon)}${blok(v.misyonBaslik, v.misyon)}`;
  return iskelet(c, { dosya: "vizyon-misyon.html", baslik: v.seoBaslik, aciklama: v.seoAciklama, govde });
}

/* ---------- Medya ---------- */

export function medya(c) {
  const m = c.medya, film = { src: "medya/tanitim-filmi.mp4", poster: "medya/tanitim-filmi.jpg", ...(c.anaSayfa.film || {}) };
  const gorseller = [...(c.hakkimizda.galeri || []), ...(c.anaSayfa.profil.gorseller || []), ...(c.anaSayfa.giris.gorseller || [])]
    .filter((x, i, a) => x && x.src && a.findIndex((y) => y.src === x.src) === i);
  const govde = `${sayfaGiris(m)}
    <section class="bolum">
      <div class="kap">
        <h2 class="baslik-2">${esc(m.filmBaslik)}</h2>
        <video class="medya-film" controls preload="none" playsinline poster="${esc(film.poster)}" aria-label="${esc(m.filmBaslik)}"><source src="${esc(film.src)}" type="video/mp4"></video>
      </div>
    </section>
    <section class="bolum bolum--beton">
      <div class="kap">
        <h2 class="baslik-2">${esc(m.galeriBaslik)}</h2>
        <div class="medya-galeri">${gorseller.map((x) => `<figure>${gorsel(x, { boyutlar: "(min-width: 900px) 30vw, 90vw" })}</figure>`).join("")}</div>
      </div>
    </section>`;
  return iskelet(c, { dosya: "medya.html", baslik: m.seoBaslik, aciklama: m.seoAciklama, govde });
}

/* ---------- Ürün grupları ---------- */

export function urunGruplari(c) {
  const u = c.urunGruplari;
  const satirlarHtml = (c.gruplar || []).map((g, i) => {
    const markalar = grupMarkalari(c, g.id);
    return `
        <article class="grup-satir${i % 2 ? " grup-satir--ters" : ""}" id="${esc(g.id)}">
          <div class="grup-satir__gorsel">${gorsel(g.gorsel, { boyutlar: "(min-width: 900px) 45vw, 100vw" })}</div>
          <div class="grup-satir__metin">
            <h2 class="baslik-2">${esc(g.ad)}</h2>
            <p class="grup-satir__ozet">${esc(g.ozet)}</p>
            <p>${br(g.aciklama)}</p>
            ${markalar.length ? `<ul class="etiketler" aria-label="Markalar">${markalar.map((m) => `<li>${esc(m.ad)}</li>`).join("")}</ul>` : ""}
            <a class="ok-link" href="urun-${esc(g.id)}.html">${esc(g.ad)} hakkında ayrıntılar${ikon("arrow", "i--k")}</a>
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

    <section class="bolum bolum--beton">
      <div class="kap">
        <div class="bolum-bas">
          <h2 class="baslik-2">${esc(u.markalarBaslik)}</h2>
          <p>${br(u.markalarAciklama)}</p>
        </div>
        <ul class="marka-kartlari">${markaKartlari}</ul>
      </div>
    </section>`;
  return iskelet(c, { dosya: "urun-gruplari.html", baslik: u.seoBaslik, aciklama: u.seoAciklama, govde,
    jsonLd: ldBlok(ekmek([["Ana sayfa", ""], [c.menu.urunGruplari || "Ürün Grupları", "urun-gruplari.html"]])) });
}

/* ---------- Ürün grubu sayfaları (urun-<id>.html) ---------- */

export function grupSayfasi(c, g) {
  const f = c.firma;
  const markalar = grupMarkalari(c, g.id);
  const dosya = `urun-${g.id}.html`;
  const digerleri = (c.gruplar || []).filter((x) => x.id !== g.id)
    .map((x) => `<li><a href="urun-${esc(x.id)}.html">${esc(x.ad)}</a></li>`).join("");
  const govde = `${sayfaGiris({ baslik: g.ad, aciklama: g.ozet, gorsel: g.gorsel })}

    <section class="bolum grup-listesi">
      <div class="kap">
        <div class="bolum-bas">
          <h2 class="baslik-2">İzmir'de ${esc(g.ad)} tedariki</h2>
          <p>${br(g.aciklama)}</p>
          <p>${esc(g.ad)} ürünlerini ${esc(f.ad)}'in Bornova merkez deposundan ve Konak şubesinden işletmelere, ustalara ve bayilere tedarik ediyoruz. Güncel fiyat ve stok bilgisi için bizi arayın veya bayi hesabıyla B2B sistemimizden bakın.</p>
        </div>
        ${markalar.length ? `<h2 class="baslik-3">${esc(g.ad)} markalarımız</h2><ul class="etiketler" aria-label="Markalar">${markalar.map((m) => `<li>${esc(m.ad)}</li>`).join("")}</ul>` : ""}
        <p><a class="ok-link" href="${telHref(f.telefon)}">${esc(f.telefon)}${ikon("phone", "i--k")}</a></p>
      </div>
    </section>

    <section class="bolum bolum--beton">
      <div class="kap">
        <div class="bolum-bas"><h2 class="baslik-2">Diğer ürün gruplarımız</h2></div>
        <ul class="etiketler">${digerleri}</ul>
      </div>
    </section>`;
  return iskelet(c, {
    dosya,
    baslik: `${g.ad} — İzmir'de Tedarik | ${f.ad}`,
    aciklama: `${g.ozet}. ${f.ad} Bornova merkez depo ve Konak şubesinden İzmir'deki işletme ve bayilere ${g.ad.toLocaleLowerCase("tr")} tedariki.`,
    govde,
    jsonLd: ldBlok(ekmek([["Ana sayfa", ""], ["Ürün Grupları", "urun-gruplari.html"], [g.ad, dosya]])),
  });
}

/** İçeriğe bağlı sayfalar: her ürün grubu için bir sayfa */
export const grupSayfalari = (c) => (c.gruplar || []).map((g) => ({ dosya: `urun-${g.id}.html`, olustur: (cc) => grupSayfasi(cc, g) }));

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
    <section class="ekat" data-ekatalog aria-label="${esc(e.baslik.replace(/\n/g, " "))}">
      <h1 class="gizli">${esc(e.baslik.replace(/\n/g, " "))}</h1>
      <span data-tarih hidden></span>

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
    </section>`;
  return iskelet(c, { dosya: "e-katalog.html", baslik: e.seoBaslik, aciklama: e.seoAciklama, govde, css: ["css/ekatalog.css"], js: ["js/ekatalog.js"] });
}

/* ---------- Bayi başvuru formu ---------- */

// Statik sitede sunucu yok: form FormSubmit (formsubmit.co) üzerinden firma e-postasına gider.
// İlk gönderimde info@ adresine bir onay e-postası gelir; bağlantıya tıklanınca form açılır.
const alanF = (ad, etiket, o = {}) => `
        <label class="bf-alan${o.genis ? " bf-alan--genis" : ""}"><span>${esc(etiket)}${o.zorunlu ? ' <i aria-hidden="true">*</i>' : ""}</span>${
  o.tip === "uzun"
    ? `<textarea name="${ad}" rows="4"${o.zorunlu ? " required" : ""} maxlength="1500"></textarea>`
    : o.tip === "sec"
      ? `<select name="${ad}"${o.zorunlu ? " required" : ""}><option value="">Seçiniz</option>${o.secenekler.map((x) => `<option>${esc(x)}</option>`).join("")}</select>`
      : `<input name="${ad}" type="${o.tip || "text"}"${o.zorunlu ? " required" : ""}${o.oto ? ` autocomplete="${o.oto}"` : ""}${o.kalip ? ` pattern="${o.kalip}"` : ""}${o.ipucu ? ` placeholder="${esc(o.ipucu)}"` : ""} maxlength="200">`}</label>`;

export function bayiBasvuru(c) {
  const b = c.bayiBasvuru, f = c.firma;
  const govde = `${sayfaGiris(b)}

    <section class="bolum bolum--beton">
      <div class="kap bf-kap">
        <form class="bf" data-bayi-form action="https://formsubmit.co/${esc(f.eposta)}" method="POST" novalidate>
          <input type="hidden" name="_subject" value="Yeni bayi başvurusu — ${esc(SITE.replace(/^https?:\/\//, "").replace(/\/$/, ""))}">
          <input type="hidden" name="_template" value="table">
          <input type="hidden" name="_captcha" value="false">
          <input type="hidden" name="_next" value="${SITE}bayi-basvuru.html?gonderildi=1">
          <input class="bf-bal" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="bf-izgara">${alanF("Firma adı", "Firma / işletme adı", { zorunlu: true, oto: "organization" })}${alanF("Yetkili", "Yetkili adı soyadı", { zorunlu: true, oto: "name" })}${alanF("Telefon", "Telefon", { zorunlu: true, tip: "tel", oto: "tel", kalip: "[\\d\\s\\+\\(\\)\\-]{10,20}", ipucu: "05xx xxx xx xx" })}${alanF("email", "E-posta", { zorunlu: true, tip: "email", oto: "email" })}${alanF("İl / ilçe", "İl / ilçe", { zorunlu: true })}${alanF("Vergi numarası", "Vergi numarası", { ipucu: "İsteğe bağlı" })}${alanF("İşletme türü", "İşletme türü", { tip: "sec", genis: true, zorunlu: true, secenekler: b.isletmeTurleri })}${alanF("Mesaj", "Eklemek istedikleriniz", { tip: "uzun", genis: true })}
          </div>
          <label class="bf-onay"><input type="checkbox" name="KVKK onayı" value="Evet" required><span>${esc(b.onayMetni)} <a href="kvkk-aydinlatma-metni.html" target="_blank" rel="noopener">KVKK Aydınlatma Metni</a></span></label>
          <p class="bf-durum" data-bf-durum role="status" aria-live="polite" hidden></p>
          <div class="dugmeler"><button class="dugme dugme--sari dugme--b" type="submit">${esc(b.gonder)}</button></div>
          <p class="bf-not">${esc(b.not)} <a href="${telHref(f.telefon)}">${esc(f.telefon)}</a></p>
        </form>
        <p class="bf-tesekkur" data-bf-tesekkur role="status" hidden><b>${esc(b.basariBaslik)}</b><span>${esc(b.basariMetin)}</span></p>
      </div>
    </section>`;
  return iskelet(c, { dosya: "bayi-basvuru.html", baslik: b.seoBaslik, aciklama: b.seoAciklama, govde });
}

/* ---------- İletişim ---------- */

export function iletisim(c) {
  const i = c.iletisim, sss = c.sss; // sss: icerik/sss.json (derlemede eklenir; panel önizlemesinde yoksa bölüm çıkmaz)
  const govde = `${sayfaGiris(i)}

    <section class="bolum bolum--beton" id="subeler">
      <div class="kap">
        <div class="bolum-bas"><h2 class="baslik-2">${esc(i.subelerBaslik)}</h2></div>
        <div class="sube-izgara">${subeKartlari(c, { harita: true })}</div>
      </div>
    </section>${sss ? `

    <section class="bolum" id="sss">
      <div class="kap">
        <div class="bolum-bas"><h2 class="baslik-2">${esc(sss.baslik)}</h2></div>
        <div class="sss">${sss.sorular.map((q) => `<details><summary>${esc(q.s)}</summary><p>${esc(q.c)}</p></details>`).join("")}</div>
      </div>
    </section>` : ""}`;
  const jsonLd = sss ? ldBlok({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: sss.sorular.map((q) => ({ "@type": "Question", name: q.s, acceptedAnswer: { "@type": "Answer", text: q.c } })),
  }) : "";
  return iskelet(c, { dosya: "iletisim.html", baslik: i.seoBaslik, aciklama: i.seoAciklama, govde, jsonLd });
}

/* ---------- Yasal metinler (KVKK, gizlilik) ---------- */

function yasalSayfa(c, anahtar, dosya) {
  const y = (c.yasal || {})[anahtar] || { baslik: "", bolumler: [] };
  const bolumler = y.bolumler || [];
  const govde = `
    <section class="yasal-giris">
      <div class="kap">
        <h1 class="yasal-giris__baslik">${satirlar(y.baslik)}</h1>
        ${y.aciklama ? `<p class="yasal-giris__aciklama">${br(y.aciklama)}</p>` : ""}
        ${y.guncelleme ? `<p class="yasal-giris__tarih">Son güncelleme: ${esc(y.guncelleme)}</p>` : ""}
      </div>
    </section>

    <section class="bolum yasal">
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
  { dosya: "index.html", olustur: anaSayfaYeni },
  { dosya: "hakkimizda.html", olustur: hakkimizda },
  { dosya: "vizyon-misyon.html", olustur: vizyonMisyon },
  { dosya: "medya.html", olustur: medya },
  { dosya: "urun-gruplari.html", olustur: urunGruplari },
  { dosya: "e-katalog.html", olustur: eKatalog },
  { dosya: "bayi-basvuru.html", olustur: bayiBasvuru },
  { dosya: "iletisim.html", olustur: iletisim },
  { dosya: "kvkk-aydinlatma-metni.html", olustur: kvkk },
  { dosya: "gizlilik-politikasi.html", olustur: gizlilik },
];
