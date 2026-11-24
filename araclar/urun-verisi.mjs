// Ürün verisini siteye hazırlar: katalog/veri/urunler.json → icerik/urunler.json + medya/urun/*.webp + medya/marka/*.png
// Çalıştırma (yolhanendustri/ içinden): node araclar/urun-verisi.mjs
// FİYAT ALANLARI (fiyat, b2bFiyat, listeUsd...) ASLA KOPYALANMAZ: site herkese açık.
import { readFile, writeFile, mkdir, copyFile, access } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KATALOG = path.resolve(KOK, "../katalog");
const sharp = (await import(pathToFileURL(path.join(KATALOG, "node_modules/sharp/lib/index.js")).href)).default;

const veri = JSON.parse(await readFile(path.join(KATALOG, "veri/urunler.json"), "utf8"));
const aileler = Object.fromEntries(veri.aileler.map((a) => [a.id, a]));

const BUYUK_KALIR = new Set(["PU", "MS", "PVC", "HSS", "DIN", "SDS", "RAL", "GFB", "NP1", "XPRO", "LED", "WD", "MDF", "ABS", "PE", "PP", "TS", "EN", "CE", "UV", "TIG", "MIG", "SDS-PLUS"]);
const BIRIM = { ML: "ml", GR: "g", GRM: "g", KG: "kg", LT: "lt", MM: "mm", CM: "cm", MT: "m", MTR: "m", CC: "cc" };
const KISALTMA = { "SP.": "Sprey", SPRAY: "Sprey", "TEM.": "Temizleyici", "KORU.": "Koruyucu", "ALÜ.": "Alüminyum", "AKR.": "Akrilik", "BOYA.": "Boya", "PLS.": "Plastik" };
const MARKA_AD = { Gfb: "GFB", STERN: "Stern", Np1: "NP1", Muhtelif: "Diğer", Mg: "MG" };
const GRUP_AD = {
  "kirici-delici": "Kırıcı, Delici ve Kesici Uçlar", "firca-boyaci": "Fırça ve Boyacı Malzemeleri", dubel: "Dübel ve Bağlantı",
  "sprey-boya": "Sprey Boya", "yapi-kimyasallari": "Yapı Kimyasalları", ambalaj: "Bant ve Ambalaj", "teknik-sprey": "Teknik Sprey",
  anaerobik: "Anaerobik Yapıştırıcı ve Sıvı Conta", zimpara: "Zımpara", "elektrikli-aletler": "Elektrikli ve Akülü Aletler",
  muhtelif: "Muhtelif", macun: "Macun ve Alçı", "is-guvenligi": "İş Güvenliği", yapistirici: "Yapıştırıcı",
};

const trKucuk = (s) => s.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
const trIlkBuyuk = (s) => (s ? s.charAt(0).replace(/i/g, "İ").toUpperCase() + s.slice(1) : s);
const harfli = (s) => /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(s);
const kucukVar = (s) => /[a-zçğıöşü]/.test(s);

/** "BEST SP. ELİTE 7035 AÇIK GRİ 400 ML." → "Best Sprey Elite 7035 Açık Gri 400 ml" */
export function adTemizle(ad) {
  const parcalar = String(ad).replace(/\s+/g, " ").trim().replace(/\.$/, "").split(" ");
  return parcalar.map((p) => {
    const dot = p.replace(/[,;]+$/, "");
    if (KISALTMA[dot.toUpperCase()]) return KISALTMA[dot.toUpperCase()];
    if (kucukVar(p)) return p;                         // zaten karışık harf
    const bos = dot.replace(/[().]/g, "");
    if (!harfli(bos)) return p;                         // sayı / işaret
    if (BIRIM[bos]) return BIRIM[bos];
    if (BUYUK_KALIR.has(bos) || /\d/.test(bos)) return p; // model kodu
    if (bos.length <= 2) return p;                       // "SP", "KA" gibi kısa kodlar
    return p.split(/([-/(])/).map((t) => trIlkBuyuk(trKucuk(t))).join("");
  }).join(" ");
}

const slugla = (s) => trKucuk(s).replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);

const gorunur = veri.urunler.filter((u) => u.katalogda !== false);
const kullanilan = new Set();
const urunler = [];
const fotoGorevleri = new Map();

for (const u of gorunur) {
  const marka = MARKA_AD[u.marka] || u.marka;
  let ad = adTemizle(u.ad);
  if (marka !== "Diğer" && !trKucuk(ad).includes(trKucuk(marka))) ad = `${marka} ${ad}`; // aramada marka adı geçsin
  let slug = slugla(ad) || "urun";
  if (kullanilan.has(slug)) slug = `${slug}-${slugla(u.kod)}`;
  kullanilan.add(slug);
  let foto = "";
  if (u.foto) {
    foto = "urun/" + u.foto.replace(/\.[a-z0-9]+$/i, "") + ".webp";
    fotoGorevleri.set(u.foto, foto);
  }
  const ral = (u.varyant || "").match(/^(\d{4})\s/);
  urunler.push({
    s: slug, a: ad, k: u.kod,
    m: marka,
    g: GRUP_AD[u.grup] || u.grup,
    v: u.varyant || "",
    f: foto,
    fa: u.aile || "",
    ...(ral && u.marka === "Best" && u.grup === "sprey-boya" ? { ral: ral[1] } : {}),
  });
}

// Fotoğraflar → 560 px WebP (yalnız yeni/eksik olanlar)
await mkdir(path.join(KOK, "medya/urun"), { recursive: true });
let yeni = 0, eksik = 0;
for (const [kaynak, hedef] of fotoGorevleri) {
  const cikis = path.join(KOK, "medya", hedef);
  try { await access(cikis); continue; } catch {}
  try {
    await sharp(path.join(KATALOG, "gorseller/urun", kaynak)).resize(560, 560, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" }).webp({ quality: 72 }).toFile(cikis);
    yeni++;
  } catch { eksik++; for (const x of urunler) if (x.f === hedef) x.f = ""; }
}

// Marka logoları
await mkdir(path.join(KOK, "medya/marka"), { recursive: true });
const logoHaritasi = veri.ayarlar.markaLogolari;
const markaSayac = new Map();
for (const x of urunler) markaSayac.set(x.m, (markaSayac.get(x.m) || 0) + 1);
const markalar = [];
for (const [ad, adet] of [...markaSayac].sort((a, b) => b[1] - a[1])) {
  const anahtar = Object.keys(logoHaritasi).find((k) => (MARKA_AD[k] || k) === ad);
  let logo = "";
  if (anahtar) {
    try { await copyFile(path.join(KATALOG, "gorseller/marka", logoHaritasi[anahtar]), path.join(KOK, "medya/marka", logoHaritasi[anahtar])); logo = "marka/" + logoHaritasi[anahtar]; } catch {}
  }
  markalar.push({ ad, slug: slugla(ad), logo, adet });
}
const gruplar = [...new Set(urunler.map((x) => x.g))].sort().map((ad) => ({ ad, adet: urunler.filter((x) => x.g === ad).length }));
const aileAd = {};
for (const x of urunler) if (x.fa && aileler[x.fa]) aileAd[x.fa] = aileler[x.fa].baslik;

await writeFile(path.join(KOK, "icerik/urunler.json"), JSON.stringify({ markalar, gruplar, aileAd, urunler }), "utf8");
console.log(`ürün: ${urunler.length}  marka: ${markalar.length}  grup: ${gruplar.length}  yeni foto: ${yeni}  eksik foto: ${eksik}`);
