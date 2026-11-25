/* Sayfaların ortak parçaları: başlık, menü, alt bilgi, sayfa iskeleti.
   Hem derleme aracı (Node) hem panel önizlemesi (tarayıcı) bu dosyayı kullanır;
   bu yüzden Node'a özgü hiçbir şey içermez. */

export const SITE = "https://yolhanendustri.com/";

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
/** Satır sonlarını <br> yapar */
export const br = (s) => esc(s).replace(/\n/g, "<br>");
/** Başlığı satır satır maskelenmiş span'lere böler (giriş animasyonu için) */
export const satirlar = (s) =>
  String(s ?? "").split("\n").map((t) => `<span class="satir"><span>${esc(t)}</span></span>`).join("");
export const ikon = (ad, sinif = "") =>
  `<svg class="i${sinif ? " " + sinif : ""}" aria-hidden="true"><use href="img/ikonlar.svg#i-${ad}"/></svg>`;

const rakam = (s) => String(s ?? "").replace(/\D/g, "");
export const telHref = (t) => "tel:+90" + rakam(t).replace(/^0/, "");
export const waHref = (t, mesaj) =>
  "https://wa.me/90" + rakam(t).replace(/^0/, "") + (mesaj ? "?text=" + encodeURIComponent(mesaj) : "");
export const haritaHref = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

export function gorsel(g, { sinif = "", yukle = "lazy", boyutlar = "100vw" } = {}) {
  if (!g || !g.src) return "";
  return `<img class="${sinif}" src="${esc(g.src)}" alt="${esc(g.alt)}" loading="${yukle}" decoding="async" sizes="${boyutlar}">`;
}

/* ---------- Ortak kabuk: üst menü, mobil menü, alt bilgi, yukarı çık (tüm sayfalarda aynı) ---------- */

/** Menü verisi: Ana Sayfa, Kurumsal (açılır), Ürünlerimiz, Markalarımız, Medya, İletişim, E-Katalog */
export function menuVeri(c) {
  const M = c.menu || {};
  return {
    anaSayfa: ["index.html", M.anaSayfa || "Ana Sayfa"],
    kurumsalAd: M.kurumsal || "Kurumsal",
    kurumsal: [
      ["hakkimizda.html", M.hakkimizda || "Hakkımızda"],
      ["vizyon-misyon.html", M.vizyon || "Vizyonumuz ve Misyonumuz"],
    ],
    duz: [
      ["urunlerimiz.html", M.urunlerimiz || "Ürünlerimiz"],
      ["markalarimiz.html", M.markalarimiz || "Markalarımız"],
      ["medya.html", M.medya || "Medya"],
      ["iletisim.html", M.iletisim || "İletişim"],
      ["e-katalog.html", M.ekatalog || "E-Katalog"],
    ],
    b2b: M.b2bGiris || "B2B Giriş",
    bayi: M.bayiBasvuru || "Bayi Başvuru Formu",
  };
}

/** Hangi menü öğesi aktif: sayfa dosya adından */
function aktifOge(dosya) {
  if (dosya === "index.html") return "ana";
  if (["hakkimizda.html", "vizyon-misyon.html"].includes(dosya)) return "kurumsal";
  if (dosya.startsWith("urun") && dosya !== "urun-gruplari.html" || dosya === "urun-gruplari.html" || dosya.startsWith("urun/")) return "urunlerimiz.html";
  if (["markalarimiz.html", "medya.html", "iletisim.html", "e-katalog.html"].includes(dosya)) return dosya;
  return "";
}

export function ustHtml(c, dosya = "index.html", tema = "koyu") {
  const m = menuVeri(c), f = c.firma, aktif = aktifOge(dosya);
  const pi = ([href, ad]) => `<a class="pi" href="${href}"${aktif === href ? ' aria-current="page"' : ""}>${esc(ad)}</a>`;
  return `
<header class="nav" id="nav" data-tema="${tema}">
  <a class="logo" href="index.html" aria-label="${esc(f.ad)} ana sayfa"><img class="neg" src="img/logo-negatif.png" alt="${esc(f.ad)}" width="640" height="150"><img class="org" src="img/logo.png" alt="" width="640" height="150"></a>
  <nav class="pill" aria-label="Ana menü">
    <span class="hap" aria-hidden="true"></span>
    <a class="pi" href="${m.anaSayfa[0]}"${aktif === "ana" ? ' aria-current="page"' : ""}>${esc(m.anaSayfa[1])}</a>
    <div class="dd">
      <button class="pi dd__btn" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="dd-kurumsal"${aktif === "kurumsal" ? ' data-aktif="1"' : ""}>${esc(m.kurumsalAd)}<svg viewBox="0 0 10 6" width="9" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="dd__list" id="dd-kurumsal" hidden>${m.kurumsal.map(([href, ad]) => `<a href="${href}"${dosya === href ? ' aria-current="page"' : ""}>${esc(ad)}</a>`).join("")}</div>
    </div>
    ${m.duz.map(pi).join("")}
  </nav>
  <div class="right">
    <a class="btn btn--b2b" href="${esc(f.b2bAdres)}" target="_blank" rel="noopener"><span>${esc(m.b2b)}</span></a>
    <a class="btn chip btn--bayi" href="bayi-basvuru.html">${esc(m.bayi)}</a>
    <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menüyü aç">Menü</button>
  </div>
</header>
<div id="menu" class="menu" role="dialog" aria-modal="true" aria-label="Menü" hidden>
  <a href="${m.anaSayfa[0]}">${esc(m.anaSayfa[1])}</a>
  <span class="menu__bas">${esc(m.kurumsalAd)}</span>
  ${m.kurumsal.map(([href, ad]) => `<a class="menu__alt" href="${href}">${esc(ad)}</a>`).join("")}
  ${m.duz.map(([href, ad]) => `<a href="${href}">${esc(ad)}</a>`).join("")}
  <a class="menu__b2b" href="${esc(f.b2bAdres)}" target="_blank" rel="noopener">${esc(m.b2b)}</a>
  <a href="bayi-basvuru.html">${esc(m.bayi)}</a>
</div>`;
}

/** Sosyal medya simgeleri (kendi çizimimiz, tek renk) */
export const SOSYAL_IKON = {
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/>',
  youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor"/>',
  facebook: '<path d="M13.5 21v-8h2.7l.5-3.2h-3.2V7.9c0-.9.4-1.6 1.7-1.6h1.6V3.4c-.3 0-1.3-.2-2.4-.2-2.5 0-4.1 1.5-4.1 4.2v2.4H7.5V13h2.8v8z" fill="currentColor"/>',
  linkedin: '<rect x="4" y="9.5" width="3.2" height="10" fill="currentColor"/><circle cx="5.6" cy="5.8" r="1.9" fill="currentColor"/><path d="M10 9.5h3v1.4c.5-.9 1.6-1.6 3.1-1.6 2.9 0 3.9 1.8 3.9 4.6v5.6h-3.2v-5c0-1.3-.4-2.2-1.6-2.2-1.3 0-1.9.9-1.9 2.2v5H10z" fill="currentColor"/>',
  whatsapp: '<path d="M4 20l1.2-4.1A8 8 0 1 1 8.2 19z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.2 8.6c.3 2.6 2.6 5 5.3 5.6l1.1-1.3-1.9-1-.8.7c-.9-.4-1.7-1.2-2.1-2.1l.7-.8-1-1.9z" fill="currentColor"/>',
};

export const WA_MESAJ = "Merhaba, Yolhan Endüstri hakkında bilgi almak istiyorum.";

export function altHtml(c) {
  const m = menuVeri(c), f = c.firma, M = c.menu || {};
  const sosyal = [
    ["instagram", "Instagram", f.instagram],
    ["youtube", "YouTube", f.youtube],
    ["facebook", "Facebook", f.facebook],
    ["linkedin", "LinkedIn", f.linkedin],
    ["whatsapp", "WhatsApp", f.whatsapp ? waHref(f.whatsapp, WA_MESAJ) : ""],
  ].filter((x) => x[2]);
  return `
<footer data-tema="koyu">
  <div class="mega" aria-hidden="true"><svg viewBox="0 0 1000 352" preserveAspectRatio="xMidYMid meet" focusable="false"><defs><linearGradient id="mega-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d6"/><stop offset=".55" stop-color="#f9d65a"/><stop offset="1" stop-color="#f2a900"/></linearGradient></defs><text x="0" y="349" textLength="1000" lengthAdjust="spacingAndGlyphs" fill="url(#mega-g)">YOLHAN</text></svg></div>
  <div class="fmark">
    <a class="flogo" href="index.html" aria-label="${esc(f.ad)} ana sayfa"><img src="img/logo-negatif.png" alt="${esc(f.ad)}" width="640" height="150" loading="lazy"></a>
    <ul class="sosyal" aria-label="Sosyal medya">${sosyal.map(([k, ad, href]) => `<li><a href="${esc(href)}" target="_blank" rel="noopener" aria-label="${ad}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">${SOSYAL_IKON[k]}</svg></a></li>`).join("")}</ul>
  </div>
  <div class="fcols">
    <h2 class="gizli">Site bağlantıları ve iletişim</h2>
    <div><h3>${esc(m.kurumsalAd)}</h3>${m.kurumsal.map(([href, ad]) => `<a href="${href}">${esc(ad)}</a>`).join("")}<a href="bayi-basvuru.html">${esc(m.bayi)}</a></div>
    <div><h3>Sayfalar</h3>${m.duz.map(([href, ad]) => `<a href="${href}">${esc(ad)}</a>`).join("")}</div>
    <div><h3>${esc(M.iletisim || "İletişim")}</h3><a href="${telHref(f.telefon)}">${esc(f.telefon)}</a><a href="${waHref(f.whatsapp, WA_MESAJ)}" target="_blank" rel="noopener">WhatsApp asistanı ${esc(f.whatsapp)}</a><a href="mailto:${esc(f.eposta)}">${esc(f.eposta)}</a><span class="copy" style="text-align:left;display:block">${esc(f.calismaSaatleri)}</span></div>
  </div>
  <p class="copy">© <span data-yil>${new Date().getFullYear()}</span> ${esc(f.unvan)} · <a href="kvkk-aydinlatma-metni.html">${esc(M.kvkk || "KVKK Aydınlatma Metni")}</a> · <a href="gizlilik-politikasi.html">${esc(M.gizlilik || "Gizlilik Politikası")}</a></p>
</footer>
<aside aria-label="WhatsApp yapay zekâ asistanı"><a class="wa-bot" href="${waHref(f.whatsapp, WA_MESAJ)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">${SOSYAL_IKON.whatsapp}</svg><span class="wa-bot__yaz"><b>WhatsApp botumuza sorun</b><small>Yapay zekâ asistanı · 7/24</small></span><i class="wa-bot__ai" aria-hidden="true">AI</i></a></aside>
<button class="top" id="top-btn" type="button" aria-label="En üste çık" hidden><svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path d="M3 10l5-5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
}

/** Tam sayfa iskeleti */
export function iskelet(c, o) {
  const html = iskeletHam(c, o);
  // urun/ gibi alt klasördeki sayfalarda göreli adresleri kökten çöz
  return o.dosya.includes("/") ? html.replace(/(href|src)="(?!https?:|\/\/|mailto:|tel:|data:|#|\/|\.\.\/)/g, '$1="../') : html;
}

function iskeletHam(c, { dosya, baslik, aciklama, govde, jsonLd = "", css = [], js = [], sade = false }) {
  // iç sayfalar: ortak kabuk + sayfa stilleri; ana sayfa (sade) kendi stilini getirir
  css = sade ? ["css/temel.css", ...css] : ["css/temel.css", "css/sayfa.css", ...css];
  js = sade ? js : ["js/sayfa.js", ...js];
  const url = SITE + (dosya === "index.html" ? "" : dosya);
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(baslik)}</title>
  <meta name="description" content="${esc(aciklama)}">
  <link rel="canonical" href="${url}">
  <meta name="theme-color" content="#10203f">
  <meta name="facebook-domain-verification" content="xti50lg1k51xgf5lwkl1p1h224gk2m">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="tr_TR">
  <meta property="og:site_name" content="${esc(c.firma.ad)}">
  <meta property="og:title" content="${esc(baslik)}">
  <meta property="og:description" content="${esc(aciklama)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}${esc((c.anaSayfa.giris.gorseller[0] || {}).src || "img/logo.png")}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(baslik)}">
  <meta name="twitter:description" content="${esc(aciklama)}">
  <link rel="icon" href="favicon.ico" sizes="48x48">
  <link rel="icon" type="image/png" href="img/isaret-512.png">
  <link rel="apple-touch-icon" href="img/apple-touch-icon.png">
  <link rel="preload" href="fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="fonts/anton-latin.woff2" as="font" type="font/woff2" crossorigin>${css.map((h) => `\n  <link rel="stylesheet" href="${h}">`).join("")}
  <script>
    (function (d) {
      d.classList.add("js");
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) d.classList.add("az-hareket");
    })(document.documentElement);
  </script>
${js.map((h) => `  <script defer src="${h}"></script>`).join("\n")}${jsonLd}
</head>
<body data-sayfa="${dosya.replace(".html", "")}">
${sade ? govde : `  <a class="atla" href="#ana">İçeriğe geç</a>${ustHtml(c, dosya)}
  <main id="ana">
${govde}
  </main>${altHtml(c)}`}
</body>
</html>
`;
}

/** Yasal metin biçimlendirme. Boş satır paragrafı ayırır, "- " ile başlayan satırlar
    liste olur, [yazı](adres) bağlantı olur. {unvan} {telefon} {eposta} {merkezAdres}
    {siteAdresi} firma bilgilerinden doldurulur. */
export function yasalMetin(metin, c) {
  const f = c.firma || {};
  const degiskenler = {
    unvan: f.unvan, telefon: f.telefon, eposta: f.eposta, siteAdresi: "yolhanendustri.com",
    merkezAdres: String(((c.subeler || [])[0] || {}).adres || "").replace(/\n/g, ", "),
  };
  const doldur = (s) => s.replace(/\{(\w+)\}/g, (t, k) => (k in degiskenler ? degiskenler[k] : t));
  const satirIci = (s) => esc(doldur(s)).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (t, yazi, adres) => {
    const dis = /^https?:\/\//i.test(adres);
    if (!dis && !/^[a-z0-9-]+\.html(#[\w-]*)?$|^#[\w-]+$/i.test(adres)) return yazi;
    return `<a href="${adres}"${dis ? ' target="_blank" rel="noopener"' : ""}>${yazi}</a>`;
  });
  return String(metin ?? "").trim().split(/\n\s*\n/).map((blok) => {
    const satirlar = blok.split("\n");
    if (satirlar.every((s) => /^\s*-\s+/.test(s))) {
      return `<ul>${satirlar.map((s) => `<li>${satirIci(s.replace(/^\s*-\s+/, ""))}</li>`).join("")}</ul>`;
    }
    return `<p>${satirlar.map(satirIci).join("<br>")}</p>`;
  }).join("\n");
}

/** Sayfa üstü (alt sayfalar için fotoğraflı giriş) */
export function sayfaGiris({ baslik, aciklama, gorsel: g }) {
  return `
    <section class="sayfa-giris">
      <div class="sayfa-giris__gorsel">${gorsel(g, { yukle: "eager" })}</div>
      <div class="kap sayfa-giris__ic">
        <h1 class="sayfa-giris__baslik">${satirlar(baslik)}</h1>
        <p class="sayfa-giris__aciklama">${br(aciklama)}</p>
      </div>
    </section>`;
}
