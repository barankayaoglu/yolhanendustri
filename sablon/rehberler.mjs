/* Rehber sayfaları: icerik/rehberler.json (derlemede c.rehberler olarak eklenir) + ürün verisi (RAL tablosu).
   Adresler: rehberler.html (liste), rehber/<slug>.html. Fiyat yok. */
import { esc, ikon, telHref, waHref, iskelet, sayfaGiris, SITE } from "./ortak.mjs";

const ldBlok = (o) => `\n  <script type="application/ld+json">${JSON.stringify(o)}</script>`;
const yol = (g) => `rehber/${g.slug}.html`;
const AILE = { 1: "Sarı ve bej", 2: "Turuncu", 3: "Kırmızı", 4: "Mor", 5: "Mavi", 6: "Yeşil", 7: "Gri", 8: "Kahverengi", 9: "Beyaz ve siyah" };
const TARIH = (d) => new Date(d + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

function ralVerisi(v) {
  const liste = v.urunler.filter((u) => u.ral).sort((a, b) => a.ral.localeCompare(b.ral) || a.k.localeCompare(b.k));
  const aileler = {};
  for (const u of liste) (aileler[u.ral[0]] ||= []).push(u);
  return { liste, aileler };
}

function ralAileTablosu({ aileler }) {
  return `<table class="rehber-tablo"><thead><tr><th>İlk hane</th><th>Renk ailesi</th><th>Listemizdeki renk</th></tr></thead><tbody>${
    Object.keys(AILE).map((h) => `<tr><td>${h}</td><td>${esc(AILE[h])}</td><td>${(aileler[h] || []).length}</td></tr>`).join("")}</tbody></table>`;
}

function ralTablosu({ aileler }, renk = {}) {
  return Object.keys(AILE).filter((h) => aileler[h]).map((h) => `
        <h3 class="rehber__alt">${h}xxx · ${esc(AILE[h])}</h3>
        <table class="rehber-tablo"><thead><tr><th>Görsel</th><th>Renk</th><th>RAL</th><th>Renk adı</th><th>Seçenek</th><th>Ürün kodu</th></tr></thead><tbody>${aileler[h].map((u) => {
          const [ad, secenek] = u.v.split(" · ");
          const hex = renk[u.ral === "9005" && /mat/i.test(ad) ? "9005M" : u.ral];
          return `<tr><td>${u.f ? `<a href="urun/${esc(u.s)}.html"><img src="medya/${esc(u.f)}" alt="${esc(u.a)}" width="56" height="56" loading="lazy" decoding="async"></a>` : ""}</td><td>${hex ? `<span class="rehber-renk" style="background:${hex}" role="img" aria-label="Yaklaşık renk"></span>` : ""}</td><td><b>${esc(u.ral)}</b></td><td><a href="urun/${esc(u.s)}.html">${esc(ad.replace(/^\d{4}\s*/, ""))}</a></td><td>${esc(secenek || "")}</td><td>${esc(u.k)}</td></tr>`;
        }).join("")}</tbody></table>`).join("");
}

function bolum(b, ral, renk) {
  return `
      <section class="rehber__bolum" id="${esc(b.id)}">
        <h2 class="baslik-3">${esc(b.baslik)}</h2>
        ${(b.paragraflar || []).map((p) => `<p>${esc(p)}</p>`).join("")}
        ${b.ralAileleri && ral ? ralAileTablosu(ral) : ""}${b.ralTablosu && ral ? ralTablosu(ral, renk) : ""}
        ${b.tablo ? `<table class="rehber-tablo"><thead><tr>${b.tablo.basliklar.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${b.tablo.satirlar.map((r) => `<tr>${r.map((h, i) => `<td>${i === 0 ? `<b>${esc(h)}</b>` : esc(h)}</td>`).join("")}</tr>`).join("")}</tbody></table>` : ""}
        ${b.liste ? `<ul>${b.liste.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      </section>`;
}

export function rehberSayfasi(c, v, g) {
  const f = c.firma, ral = ralVerisi(v), dosya = yol(g);
  const mesaj = `Merhaba, "${g.baslik.replace(/\n/g, " ")}" rehberiniz hakkında bilgi almak istiyorum.`;
  const govde = `${sayfaGiris({ baslik: g.baslik, aciklama: g.seoAciklama.split(/(?<=[.?!]) /)[0], gorsel: g.gorsel })}
    <section class="bolum rehber">
      <div class="kap rehber__ic">
        <nav class="urn-ekmek" aria-label="Sayfa yolu"><a href="index.html">Ana sayfa</a><span>/</span><a href="rehberler.html">Rehberler</a></nav>
        <p class="rehber__tarih">Son güncelleme: ${esc(TARIH(g.tarih))}</p>
        <aside class="rehber__kisa"><b>Kısa cevap</b><p>${esc(g.ozet)}</p></aside>
        ${g.bolumler.map((b) => bolum(b, ral, c.ralRenk)).join("")}
        <section class="rehber__bolum" id="sss">
          <h2 class="baslik-3">Sık sorulan sorular</h2>
          <div class="sss">${g.sss.map((q) => `<details><summary>${esc(q.s)}</summary><p>${esc(q.c)}</p></details>`).join("")}</div>
        </section>
        <section class="rehber__bolum rehber__cta">
          <h2 class="baslik-3">Ürün ve stok için bize ulaşın</h2>
          <p>Fiyat ve güncel stok bilgisi için arayın veya WhatsApp'tan yazın. Çalışma saatlerimiz ${esc(f.calismaSaatleri)}.</p>
          <div class="dugmeler">
            <a class="dugme dugme--koyu" href="${waHref(f.whatsapp, mesaj)}" target="_blank" rel="noopener">WhatsApp'tan sor</a>
            <a class="dugme dugme--cizgi-koyu" href="${telHref(f.telefon)}">${ikon("phone", "i--k")}${esc(f.telefon)}</a>
          </div>
          <ul class="rehber__ilgili">${g.ilgili.map((x) => `<li><a href="${esc(x.href)}">${esc(x.ad)}</a></li>`).join("")}</ul>
        </section>
      </div>
    </section>`;
  const baslikDuz = g.baslik.replace(/\n/g, " ");
  const makale = {
    "@context": "https://schema.org", "@type": "Article", headline: baslikDuz.charAt(0).toUpperCase() + baslikDuz.slice(1),
    description: g.seoAciklama, datePublished: g.tarih, dateModified: g.tarih, inLanguage: "tr",
    image: SITE + g.gorsel.src, mainEntityOfPage: SITE + dosya,
    author: { "@id": SITE + "#firma" }, publisher: { "@id": SITE + "#firma" },
  };
  const sss = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: g.sss.map((q) => ({ "@type": "Question", name: q.s, acceptedAnswer: { "@type": "Answer", text: q.c } })),
  };
  const ekmek = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [["Ana sayfa", ""], ["Rehberler", "rehberler.html"], [baslikDuz, dosya]].map(([ad, y], i) => ({ "@type": "ListItem", position: i + 1, name: ad, item: SITE + y })),
  };
  return iskelet(c, { dosya, baslik: g.seoBaslik, aciklama: g.seoAciklama, govde, css: ["css/urunler.css"], jsonLd: ldBlok(makale) + ldBlok(sss) + ldBlok(ekmek) });
}

export function rehberListesi(c) {
  const govde = `${sayfaGiris({ baslik: "Rehberler", aciklama: "Doğru ürünü seçmenize yardımcı olan kısa ve net rehberler.", gorsel: { src: "medya/depo-koridor.webp", alt: "Yolhan Endüstri merkez deposunda raf koridoru" } })}
    <section class="bolum rehber">
      <div class="kap rehber__ic">
        <ul class="rehber__liste">${c.rehberler.map((g) => `<li><a href="${yol(g)}"><b>${esc(g.baslik.replace(/\n/g, " "))}</b><span>${esc(g.ozet)}</span></a></li>`).join("")}</ul>
      </div>
    </section>`;
  const ekmek = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [["Ana sayfa", ""], ["Rehberler", "rehberler.html"]].map(([ad, y], i) => ({ "@type": "ListItem", position: i + 1, name: ad, item: SITE + y })),
  };
  return iskelet(c, { dosya: "rehberler.html", baslik: "Rehberler — Yolhan Endüstri", aciklama: "RAL sprey boya seçimi ve diğer ürün seçim rehberleri. Yolhan Endüstri, İzmir.", govde, js: ["js/rehber-liste.js"], jsonLd: ldBlok(ekmek) });
}

/** [{dosya, olustur}] — rehberler.json yüklüyse */
export function rehberSayfalari(v, rehberler) {
  if (!rehberler || !rehberler.length) return [];
  return [
    { dosya: "rehberler.html", olustur: rehberListesi },
    ...rehberler.map((g) => ({ dosya: yol(g), olustur: (c) => rehberSayfasi(c, v, g) })),
  ];
}
