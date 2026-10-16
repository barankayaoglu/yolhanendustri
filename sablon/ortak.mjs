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

const SAYFALAR = [
  ["index.html", "anaSayfa"],
  ["hakkimizda.html", "hakkimizda"],
  ["urun-gruplari.html", "urunGruplari"],
  ["iletisim.html", "iletisim"],
];

function ustBolum(c, aktif) {
  const m = c.menu, f = c.firma;
  const linkler = SAYFALAR.map(([href, anahtar]) =>
    `<a href="${href}"${href === aktif ? ' aria-current="page"' : ""}>${esc(m[anahtar])}</a>`).join("");
  return `
  <header class="ust" data-ust>
    <div class="ust__ic">
      <a class="ust__logo" href="index.html" aria-label="${esc(f.ad)} ana sayfa">
        <img class="logo-acik" src="img/logo-negatif.png" alt="" width="640" height="150">
        <img class="logo-koyu" src="img/logo.png" alt="" width="640" height="150">
      </a>
      <nav class="menu" id="menu" aria-label="Ana menü">
        <div class="menu__linkler">${linkler}</div>
        <div class="menu__eylem">
          <a class="dugme dugme--cizgi" href="iletisim.html#bayilik">${esc(m.bayiOl)}</a>
          <a class="dugme dugme--sari" href="${esc(f.b2bAdres)}" target="_blank" rel="noopener">${esc(m.b2bGiris)}${ikon("external", "i--k")}</a>
        </div>
        <div class="menu__alt">
          <a href="${telHref(f.telefon)}">${esc(f.telefon)}</a>
          <a href="mailto:${esc(f.eposta)}">${esc(f.eposta)}</a>
        </div>
      </nav>
      <button class="menu-dugme" type="button" aria-expanded="false" aria-controls="menu">
        <span class="gizli">Menü</span><span class="menu-dugme__cizgi"></span><span class="menu-dugme__cizgi"></span>
      </button>
    </div>
  </header>`;
}

function altBolum(c) {
  const f = c.firma, m = c.menu;
  const subeler = (c.subeler || []).map((s) =>
    `<address><b>${esc(s.ad)}</b>${br(s.adres)}</address>`).join("");
  return `
  <footer class="alt">
    <div class="kap">
      <div class="alt__son-durak" data-durak="son" aria-hidden="true"><img src="img/isaret-512.png" alt="" width="96" height="96" loading="lazy"></div>
      <div class="alt__izgara">
        <div class="alt__marka">
          <img src="img/logo-negatif.png" alt="${esc(f.ad)}" width="640" height="150" loading="lazy">
          <p>${esc(f.unvan)}</p>
        </div>
        <div><h2>${esc(c.iletisim.subelerBaslik)}</h2>${subeler}</div>
        <div>
          <h2>${esc(m.iletisim)}</h2>
          <ul>
            <li><a href="${telHref(f.telefon)}">${esc(f.telefon)}</a></li>
            <li><a href="${waHref(f.whatsapp)}" target="_blank" rel="noopener">WhatsApp ${esc(f.whatsapp)}</a></li>
            <li><a href="mailto:${esc(f.eposta)}">${esc(f.eposta)}</a></li>
            <li>${esc(f.calismaSaatleri)}</li>
          </ul>
        </div>
        <div>
          <h2>Sayfalar</h2>
          <ul>${SAYFALAR.slice(1).map(([h, a]) => `<li><a href="${h}">${esc(m[a])}</a></li>`).join("")}
            <li><a href="${esc(f.b2bAdres)}" target="_blank" rel="noopener">${esc(m.b2bGiris)}</a></li>
          </ul>
        </div>
      </div>
      <p class="alt__telif">© <span data-yil>${new Date().getFullYear()}</span> ${esc(f.unvan)}</p>
    </div>
  </footer>
  <a class="wa" href="${waHref(f.whatsapp)}" target="_blank" rel="noopener" aria-label="WhatsApp ile yazın">${ikon("chat")}</a>`;
}

/** Tam sayfa iskeleti */
export function iskelet(c, { dosya, baslik, aciklama, govde, jsonLd = "" }) {
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
  <meta property="og:type" content="website">
  <meta property="og:locale" content="tr_TR">
  <meta property="og:site_name" content="${esc(c.firma.ad)}">
  <meta property="og:title" content="${esc(baslik)}">
  <meta property="og:description" content="${esc(aciklama)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}${esc((c.anaSayfa.giris.gorseller[0] || {}).src || "img/logo.png")}">
  <link rel="icon" type="image/png" href="img/isaret-512.png">
  <link rel="apple-touch-icon" href="img/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600..900&family=Manrope:wght@400..700&display=swap">
  <link rel="stylesheet" href="css/site.css">
  <script>
    (function (d) {
      d.classList.add("js");
      try { if (sessionStorage.getItem("yh-perde")) { d.classList.add("perde-gelis"); sessionStorage.removeItem("yh-perde"); } } catch (e) {}
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) d.classList.add("az-hareket");
    })(document.documentElement);
  </script>
  <script defer src="js/site.js"></script>${jsonLd}
</head>
<body data-sayfa="${dosya.replace(".html", "")}">
  <a class="atla" href="#ana">İçeriğe geç</a>
  <div class="perde" aria-hidden="true"><div class="perde__serit"></div><img class="perde__isaret" src="img/isaret-512.png" alt="" width="96" height="96"></div>
  ${ustBolum(c, dosya)}
  <main id="ana">
    <div class="yol" aria-hidden="true"></div>
${govde}
  </main>
  ${altBolum(c)}
</body>
</html>
`;
}

/** Sayfa üstü (alt sayfalar için fotoğraflı giriş) */
export function sayfaGiris({ baslik, aciklama, gorsel: g }) {
  return `
    <section class="sayfa-giris" data-durak>
      <div class="sayfa-giris__gorsel">${gorsel(g, { yukle: "eager" })}</div>
      <div class="kap sayfa-giris__ic">
        <h1 class="sayfa-giris__baslik">${satirlar(baslik)}</h1>
        <p class="sayfa-giris__aciklama">${br(aciklama)}</p>
      </div>
    </section>`;
}

/** Bayi çağrısı bandı (birçok sayfada) */
export function bayiBandi(c) {
  const b = c.anaSayfa.bayi, f = c.firma;
  return `
    <section class="bayi" data-durak>
      <div class="bayi__gorsel">${gorsel(b.gorsel)}</div>
      <div class="kap bayi__ic">
        <h2 class="baslik-2">${br(b.baslik)}</h2>
        <p>${br(b.metin)}</p>
        <div class="dugmeler">
          <a class="dugme dugme--sari dugme--b" href="${esc(f.b2bAdres)}" target="_blank" rel="noopener">${esc(b.buton1)}${ikon("external", "i--k")}</a>
          <a class="dugme dugme--cizgi dugme--b" href="${waHref(f.whatsapp, f.bayilikMesaji)}" target="_blank" rel="noopener">${ikon("chat", "i--k")}${esc(b.buton2)}</a>
        </div>
      </div>
    </section>`;
}
