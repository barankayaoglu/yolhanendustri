// Siteyi derler: icerik/site.json + sablon/*.mjs → dist/
// Çalıştırma: node araclar/olustur.mjs   (ek paket gerekmez)
import { readFile, writeFile, mkdir, rm, cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { SAYFALAR, grupSayfalari } from "../sablon/sayfalar.mjs";
import { SITE } from "../sablon/ortak.mjs";
import { urunSayfalari } from "../sablon/urunler.mjs";
import { rehberSayfalari } from "../sablon/rehberler.mjs";

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(KOK, "dist");

const icerik = JSON.parse(await readFile(path.join(KOK, "icerik/site.json"), "utf8"));

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

icerik.sss = JSON.parse(await readFile(path.join(KOK, "icerik/sss.json"), "utf8"));
icerik.rehberler = JSON.parse(await readFile(path.join(KOK, "icerik/rehberler.json"), "utf8"));
icerik.ralRenk = JSON.parse(await readFile(path.join(KOK, "icerik/ral-renk.json"), "utf8"));

let urunVerisi = null;
try { urunVerisi = JSON.parse(await readFile(path.join(KOK, "icerik/urunler.json"), "utf8")); } catch (e) { if (e.code !== "ENOENT") throw e; }

if (urunVerisi) { try { urunVerisi.acik = JSON.parse(await readFile(path.join(KOK, "icerik/aciklamalar.json"), "utf8")); } catch (e) { if (e.code !== "ENOENT") throw e; } }

if (urunVerisi) { // yeni ana sayfa: marka logoları ve ürün sayısı
  icerik._urunSayisi = urunVerisi.urunler.length;
  icerik._markaLogo = Object.fromEntries(urunVerisi.markalar.filter((m) => m.logo).map((m) => [m.ad, m.logo]));
}

const TUM = [...SAYFALAR, ...grupSayfalari(icerik), ...(urunVerisi ? urunSayfalari(urunVerisi) : []), ...(urunVerisi ? rehberSayfalari(urunVerisi, icerik.rehberler) : [])];
for (const { dosya, olustur } of TUM) {
  await mkdir(path.dirname(path.join(DIST, dosya)), { recursive: true });
  await writeFile(path.join(DIST, dosya), olustur(icerik), "utf8");
  if (!dosya.startsWith("urun/")) console.log("sayfa:", dosya);
}

// Sabit dosyalar ve panel
await cp(path.join(KOK, "statik"), DIST, { recursive: true });
for (const klasor of ["medya", "panel", "sablon", "icerik", "ekatalog"]) {
  try { await cp(path.join(KOK, klasor), path.join(DIST, klasor), { recursive: true }); }
  catch (e) { if (!(klasor === "ekatalog" && e.code === "ENOENT")) throw e; } // e-katalog henüz yayınlanmadıysa klasör yok
}

await writeFile(path.join(DIST, "CNAME"), "yolhanendustri.com\n");
await writeFile(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /panel/\n\nSitemap: ${SITE}sitemap.xml\n`);
// Yapay zekâ botları için özet (Google kullanmaz; isteğe bağlı)
const f = icerik.firma;
await writeFile(path.join(DIST, "llms.txt"), [
  `# ${f.unvan}`, "",
  `> ${icerik.anaSayfa.seoAciklama}`, "",
  `- Telefon / WhatsApp: ${f.telefon}`, `- E-posta: ${f.eposta}`, `- Çalışma saatleri: ${f.calismaSaatleri}`,
  ...icerik.subeler.map((s) => `- ${s.ad}: ${s.adres.replace(/\n/g, " ")}`), "",
  "## Sayfalar",
  `- [Ürünlerimiz](${SITE}urunlerimiz.html): ${icerik._urunSayisi || ""} ürün, fotoğraf ve kod (fiyat yok)`,
  `- [Markalarımız](${SITE}markalarimiz.html)`,
  `- [Ürün grupları](${SITE}urun-gruplari.html)`,
  `- [Rehberler](${SITE}rehberler.html)`,
  ...icerik.rehberler.map((g) => `  - [${g.baslik.replace(/\n/g, " ")}](${SITE}rehber/${g.slug}.html): ${g.ozet}`),
  `- [Hakkımızda](${SITE}hakkimizda.html)`,
  `- [İletişim ve sık sorulan sorular](${SITE}iletisim.html)`,
  `- [Bayi başvuru](${SITE}bayi-basvuru.html)`,
  `- [B2B girişi (bayiler)](${f.b2bAdres})`, "",
].join("\n"));
await writeFile(path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  TUM.map(({ dosya }) => `  <url><loc>${SITE}${dosya === "index.html" ? "" : dosya}</loc></url>`).join("\n") +
  `\n</urlset>\n`);

console.log("tamam →", DIST);
