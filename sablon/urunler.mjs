/* Ürünlerimiz, Markalarımız ve tek tek ürün sayfaları.
   Veri: icerik/urunler.json (araclar/urun-verisi.mjs üretir; FİYAT İÇERMEZ). */
import { esc, br, ikon, telHref, waHref, iskelet, sayfaGiris, bayiBandi, SITE } from "./ortak.mjs";

export const SAYFA_BOYUTU = 48;

const ldBlok = (o) => `\n  <script type="application/ld+json">${JSON.stringify(o)}</script>`;
const ekmek = (adimlar) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: adimlar.map(([ad, yol], i) => ({ "@type": "ListItem", position: i + 1, name: ad, item: SITE + yol })),
});
const kucuk = (s) => String(s).replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
const urunYolu = (u) => `urun/${u.s}.html`;
const logoVar = (u, v) => (v.markalar.find((m) => m.ad === u.m) || {}).logo || "";
const GIRIS_GORSEL = { src: "medya/depo-koridor.webp", alt: "Yolhan Endüstri merkez deposunda raf koridoru" };

export function kart(u) {
  const gorsel = u.f
    ? `<img src="medya/${esc(u.f)}" alt="${esc(u.a)}" loading="lazy" decoding="async" width="280" height="280">`
    : `<span class="urn-kart__bos" aria-hidden="true">${esc(u.m)}</span>`;
  return `<li class="urn-kart"><a href="${urunYolu(u)}"><span class="urn-kart__gorsel">${gorsel}</span><span class="urn-kart__marka">${esc(u.m)}</span><span class="urn-kart__ad">${esc(u.a)}</span><span class="urn-kart__kod">Kod: ${esc(u.k)}</span></a></li>`;
}

function aciklamaYaz(c, u, v, kardesler) {
  const f = c.firma;
  const cesit = u.v ? ` Çeşit/ölçü: ${u.v.replace(/\s*·\s*/g, ", ")}.` : "";
  const ral = u.ral ? ` RAL ${u.ral} renk koduyla sunulan bu sprey boya, metal, ahşap ve plastik yüzeylerde dekoratif ve koruyucu boyama için kullanılır.` : "";
  const fa = v.acik && ((v.acik.aileler && v.acik.aileler[u.fa]) || (v.acik.urunler && v.acik.urunler[u.s]));
  const kisa = `${u.a}, ${u.m} markasının ${kucuk(u.g)} grubundaki ürünüdür (ürün kodu ${u.k}).${cesit}${ral}`;
  const kurum = `${f.ad}, ${u.m} ürünlerini İzmir'de Bornova merkez deposundan ve Konak şubesinden işletmelere, ustalara ve bayilere tedarik eder. Güncel fiyat ve stok bilgisi için bizi arayın veya bayi hesabıyla B2B sistemimizden bakın.`;
  return { kisa, kurum, fa, grupMetni: [v.acik && v.acik.markalar && v.acik.markalar[u.m], v.acik && v.acik.gruplar && v.acik.gruplar[u.g]].filter(Boolean).join(" ") };
}

/* ---------- Ürünlerimiz (sayfalı liste + süzgeç) ---------- */

function filtreFormu(v, { marka = "", grup = "", q = "" } = {}) {
  const sec = (ad, etiket, liste, secili) => `<label class="urn-alan"><span>${etiket}</span><select name="${ad}"><option value="">Tümü</option>${liste.map((x) => `<option value="${esc(x.ad)}"${x.ad === secili ? " selected" : ""}>${esc(x.ad)} (${x.adet})</option>`).join("")}</select></label>`;
  return `<form class="urn-filtre" action="urunlerimiz.html" method="get" role="search" data-urun-filtre>
        ${sec("marka", "Marka", v.markalar, marka)}
        ${sec("grup", "Ürün grubu", v.gruplar, grup)}
        <label class="urn-alan urn-alan--ara"><span>Ara</span><input type="search" name="q" value="${esc(q)}" placeholder="Ürün adı, kod, renk veya ölçü" autocomplete="off"></label>
        <button class="dugme dugme--koyu" type="submit">Ürünleri bul</button>
      </form>`;
}

function sayfaNumaralari(n, toplam) {
  const dosya = (i) => (i === 1 ? "urunlerimiz.html" : `urunlerimiz-${i}.html`);
  const aday = new Set([1, toplam, n - 2, n - 1, n, n + 1, n + 2]);
  const liste = [...aday].filter((i) => i >= 1 && i <= toplam).sort((a, b) => a - b);
  let onceki = 0, cikti = "";
  for (const i of liste) {
    if (i - onceki > 1) cikti += `<span class="urn-sayfa__bos">…</span>`;
    cikti += i === n ? `<span class="urn-sayfa__su" aria-current="page">${i}</span>` : `<a href="${dosya(i)}">${i}</a>`;
    onceki = i;
  }
  return `<nav class="urn-sayfa" aria-label="Sayfalar" data-urun-sayfa>${n > 1 ? `<a href="${dosya(n - 1)}" rel="prev">Önceki</a>` : ""}${cikti}${n < toplam ? `<a href="${dosya(n + 1)}" rel="next">Sonraki</a>` : ""}</nav>`;
}

export function urunlerimizSayfasi(c, v, n) {
  const f = c.firma;
  const toplam = Math.ceil(v.urunler.length / SAYFA_BOYUTU);
  const dosya = n === 1 ? "urunlerimiz.html" : `urunlerimiz-${n}.html`;
  const dilim = v.urunler.slice((n - 1) * SAYFA_BOYUTU, n * SAYFA_BOYUTU);
  const govde = `${sayfaGiris({ baslik: "Ürünlerimiz", aciklama: `${v.urunler.length.toLocaleString("tr")} ürün, ${v.markalar.length} marka.\nFiyat ve stok için B2B'ye giriş yapın.`, gorsel: GIRIS_GORSEL })}

    <section class="bolum urn-liste">
      <div class="kap">
        ${filtreFormu(v)}
        <p class="urn-sonuc" data-urun-sonuc aria-live="polite">${v.urunler.length.toLocaleString("tr")} ürün · Sayfa ${n}/${toplam}</p>
        <ul class="urn-izgara" data-urun-izgara>${dilim.map(kart).join("")}</ul>
        ${sayfaNumaralari(n, toplam)}
        <p class="urn-not">Fiyatlar yalnız bayilerimize açıktır. <a href="${esc(f.b2bAdres)}" target="_blank" rel="noopener">B2B sistemine giriş yapın</a> ya da <a href="${waHref(f.whatsapp, f.bayilikMesaji)}" target="_blank" rel="noopener">WhatsApp ile yazın</a>.</p>
      </div>
    </section>
${bayiBandi(c)}`;
  return iskelet(c, {
    dosya,
    baslik: n === 1 ? `Ürünlerimiz — Hırdavat, Yapı Kimyasalları, Sprey Boya | ${f.ad}` : `Ürünlerimiz, sayfa ${n} | ${f.ad}`,
    aciklama: `${f.ad} ürün kataloğu: Best sprey boya ve teknik sprey, GFB matkap uçları, Selsil, NP1, Made, Yılsan ve daha fazlası. İzmir Bornova ve Konak'tan toptan tedarik.`,
    govde, css: ["css/urunler.css"], js: ["js/urunler.js"],
    jsonLd: ldBlok(ekmek([["Ana sayfa", ""], ["Ürünlerimiz", "urunlerimiz.html"]])),
  });
}

/* ---------- Markalarımız ---------- */

export function markalarimizSayfasi(c, v) {
  const f = c.firma;
  const govde = `${sayfaGiris({ baslik: "Markalarımız", aciklama: `${v.markalar.length} markanın ürünlerini İzmir'de tedarik ediyoruz.`, gorsel: GIRIS_GORSEL })}

    <section class="bolum">
      <div class="kap">
        <ul class="urn-markalar">${v.markalar.map((m) => `
          <li><a href="urunlerimiz.html?marka=${encodeURIComponent(m.ad)}">
            <span class="urn-marka__logo">${m.logo ? `<img src="medya/${esc(m.logo)}" alt="${esc(m.ad)} logosu" loading="lazy" decoding="async">` : `<b>${esc(m.ad)}</b>`}</span>
            <span class="urn-marka__ad">${esc(m.ad)}</span>
            <span class="urn-marka__adet">${m.adet.toLocaleString("tr")} ürün</span>
          </a></li>`).join("")}
        </ul>
      </div>
    </section>
${bayiBandi(c)}`;
  return iskelet(c, {
    dosya: "markalarimiz.html",
    baslik: `Markalarımız — Best, GFB, Selsil, NP1, Made, Yılsan | ${f.ad}`,
    aciklama: `${f.ad} İzmir'de ${v.markalar.map((m) => m.ad).slice(0, 8).join(", ")} ve daha fazla markanın ürünlerini toptan tedarik eder.`,
    govde, css: ["css/urunler.css"],
    jsonLd: ldBlok(ekmek([["Ana sayfa", ""], ["Markalarımız", "markalarimiz.html"]])),
  });
}

/* ---------- Ürün detay ---------- */

export function urunSayfasi(c, v, u, kardesler, benzerler) {
  const f = c.firma;
  const dosya = urunYolu(u);
  const { kisa, kurum, fa, grupMetni } = aciklamaYaz(c, u, v, kardesler);
  const mesaj = `Merhaba, ${u.a} (kod: ${u.k}) ürünü hakkında bilgi almak istiyorum.`;
  const gorsel = u.f
    ? `<img src="medya/${esc(u.f)}" alt="${esc(u.a)}" width="560" height="560" decoding="async">`
    : `<span class="urn-kart__bos urn-kart__bos--buyuk" aria-hidden="true">${esc(u.m)}</span>`;
  const satirlar = [["Ürün kodu", u.k], ["Marka", u.m], ["Ürün grubu", u.g], ...(u.ral ? [["RAL kodu", u.ral]] : []), ...(u.v ? [["Çeşit / ölçü", u.v.replace(/\s*·\s*/g, ", ")]] : [])];
  const aile = v.aileAd[u.fa];
  const kardesHtml = kardesler.length ? `
      <section class="urn-ek"><h2 class="baslik-3">${esc(aile || u.m)} çeşitleri</h2>
        <ul class="urn-cesit">${kardesler.map((k) => `<li><a href="${urunYolu(k)}"${k.s === u.s ? ' aria-current="page"' : ""}><b>${esc(k.v ? k.v.replace(/\s*·\s*/g, ", ") : k.a)}</b><span>${esc(k.k)}</span></a></li>`).join("")}</ul>
      </section>` : "";
  const hakkinda = fa || grupMetni ? `
      <section class="urn-ek urn-hakkinda"><h2 class="baslik-3">${esc(aile || u.g)} hakkında</h2>
        <p>${esc(fa ? fa.ozet : grupMetni)}</p>${fa && fa.kullanim ? `
        <h3 class="urn-alt">Kullanım alanları</h3><ul>${fa.kullanim.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}${fa && fa.ipucu ? `
        <p class="urn-ipucu"><b>İpucu:</b> ${esc(fa.ipucu)}</p>` : ""}
      </section>` : "";
  const benzerHtml = benzerler.length ? `
      <section class="urn-ek"><h2 class="baslik-3">Benzer ürünler</h2><ul class="urn-izgara">${benzerler.map(kart).join("")}</ul></section>` : "";
  const govde = `
    <section class="bolum urn-detay">
      <div class="kap">
        <nav class="urn-ekmek" aria-label="Sayfa yolu"><a href="index.html">Ana sayfa</a><span>/</span><a href="urunlerimiz.html">Ürünlerimiz</a><span>/</span><a href="urunlerimiz.html?marka=${encodeURIComponent(u.m)}">${esc(u.m)}</a></nav>
        <div class="urn-detay__izgara">
          <div class="urn-detay__gorsel">${gorsel}</div>
          <div class="urn-detay__bilgi">
            <p class="urn-detay__marka">${esc(u.m)}</p>
            <h1 class="urn-detay__baslik">${esc(u.a)}</h1>
            <dl class="urn-ozellik">${satirlar.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("")}</dl>
            <p>${esc(kisa)}</p>
            <p>${esc(kurum)}</p>
            <div class="dugmeler">
              <a class="dugme dugme--sari dugme--b" href="${esc(f.b2bAdres)}" target="_blank" rel="noopener">Fiyat için B2B giriş${ikon("external", "i--k")}</a>
              <a class="dugme dugme--cizgi-koyu dugme--b" href="${waHref(f.whatsapp, mesaj)}" target="_blank" rel="noopener">${ikon("chat", "i--k")}WhatsApp ile sorun</a>
              <a class="dugme dugme--cizgi-koyu dugme--b" href="${telHref(f.telefon)}">${ikon("phone", "i--k")}${esc(f.telefon)}</a>
            </div>
          </div>
        </div>${hakkinda}${kardesHtml}${benzerHtml}
      </div>
    </section>`;
  const urunLd = {
    "@context": "https://schema.org", "@type": "Product", name: u.a, sku: u.k, mpn: u.k, category: u.g,
    brand: { "@type": "Brand", name: u.m }, description: fa ? `${u.a}. ${fa.ozet}` : kisa,
    ...(u.f ? { image: `${SITE}medya/${u.f}` } : {}), url: SITE + dosya,
  };
  return iskelet(c, {
    dosya,
    baslik: `${u.a} (${u.k}) — ${u.m} | ${f.ad}`.slice(0, 160),
    aciklama: `${u.a}, ürün kodu ${u.k}. ${fa ? fa.ozet.split(". ")[0] + ". " : ""}${u.m} ${kucuk(u.g)} ürünü İzmir'de ${f.ad} Bornova ve Konak'tan toptan tedarik. Fiyat için B2B giriş.`.slice(0, 300),
    govde, css: ["css/urunler.css"],
    jsonLd: ldBlok(urunLd) + ldBlok(ekmek([["Ana sayfa", ""], ["Ürünlerimiz", "urunlerimiz.html"], [u.m, `urunlerimiz.html?marka=${encodeURIComponent(u.m)}`], [u.a, dosya]])),
  });
}

/** Tüm ürün sistemi sayfaları [{dosya, olustur}] */
export function urunSayfalari(v) {
  const sayfalar = [];
  const toplam = Math.ceil(v.urunler.length / SAYFA_BOYUTU);
  for (let n = 1; n <= toplam; n++) sayfalar.push({ dosya: n === 1 ? "urunlerimiz.html" : `urunlerimiz-${n}.html`, olustur: (c) => urunlerimizSayfasi(c, v, n) });
  sayfalar.push({ dosya: "markalarimiz.html", olustur: (c) => markalarimizSayfasi(c, v) });

  const aileler = new Map(), grupMarka = new Map();
  for (const u of v.urunler) {
    if (u.fa) (aileler.get(u.fa) || aileler.set(u.fa, []).get(u.fa)).push(u);
    const k = u.m + "|" + u.g;
    (grupMarka.get(k) || grupMarka.set(k, []).get(k)).push(u);
  }
  for (const u of v.urunler) {
    const kardesler = u.fa ? aileler.get(u.fa).slice(0, 80) : [];
    const havuz = grupMarka.get(u.m + "|" + u.g);
    const i = havuz.indexOf(u);
    const benzerler = [];
    for (let j = 1; benzerler.length < 8 && j < havuz.length; j++) {
      const k = havuz[(i + j) % havuz.length];
      if (k.fa !== u.fa || !u.fa) benzerler.push(k);
    }
    sayfalar.push({ dosya: urunYolu(u), olustur: (c) => urunSayfasi(c, v, u, kardesler, benzerler) });
  }
  return sayfalar;
}
