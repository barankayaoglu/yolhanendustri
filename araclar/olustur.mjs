// Siteyi derler: icerik/site.json + sablon/*.mjs → dist/
// Çalıştırma: node araclar/olustur.mjs   (ek paket gerekmez)
import { readFile, writeFile, mkdir, rm, cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { SAYFALAR } from "../sablon/sayfalar.mjs";
import { SITE } from "../sablon/ortak.mjs";

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(KOK, "dist");

const icerik = JSON.parse(await readFile(path.join(KOK, "icerik/site.json"), "utf8"));

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

for (const { dosya, olustur } of SAYFALAR) {
  await writeFile(path.join(DIST, dosya), olustur(icerik), "utf8");
  console.log("sayfa:", dosya);
}

// Sabit dosyalar ve panel
await cp(path.join(KOK, "statik"), DIST, { recursive: true });
for (const klasor of ["medya", "panel", "sablon", "icerik", "ekatalog"]) {
  try { await cp(path.join(KOK, klasor), path.join(DIST, klasor), { recursive: true }); }
  catch (e) { if (!(klasor === "ekatalog" && e.code === "ENOENT")) throw e; } // e-katalog henüz yayınlanmadıysa klasör yok
}

await writeFile(path.join(DIST, "CNAME"), "yolhanendustri.com\n");
await writeFile(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /panel/\n\nSitemap: ${SITE}sitemap.xml\n`);
await writeFile(path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  SAYFALAR.map(({ dosya }) => `  <url><loc>${SITE}${dosya === "index.html" ? "" : dosya}</loc></url>`).join("\n") +
  `\n</urlset>\n`);

console.log("tamam →", DIST);
