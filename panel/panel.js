/* =========================================================
   Yolhan Endüstri — site paneli
   İçeriği (icerik/site.json) GitHub'dan okur, formlarla düzenletir,
   canlı önizler ve "Yayınla" ile tek commit olarak GitHub'a yazar.
   GitHub Actions siteyi derleyip yayına alır.
   ========================================================= */
import { BOLUMLER } from "./alanlar.mjs";
import { SAYFALAR } from "../sablon/sayfalar.mjs";

const SAHIP = "barankayaoglu", DEPO = "yolhanendustri", DAL = "main";
const ICERIK_YOLU = "icerik/site.json";
const API = "https://api.github.com";
const ANAHTAR_KAYIT = "yh-panel-anahtar";
const TASLAK_KAYIT = "yh-panel-taslak";

const $ = (s, k = document) => k.querySelector(s);
const el = (etiket, ozellik = {}, ...cocuk) => {
  const e = document.createElement(etiket);
  for (const [k, v] of Object.entries(ozellik)) {
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, "");
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const c of cocuk.flat()) if (c != null) e.append(c);
  return e;
};

/* ---------- Durum ---------- */
let anahtar = null;        // GitHub erişim anahtarı (null = göz atma modu)
let asil = null;           // GitHub'daki içerik
let asilSha = null;        // içerik dosyasının sürümü
let taslak = null;         // düzenlenen içerik
let bekleyen = {};         // yüklenmeyi bekleyen fotoğraflar: { "medya/yuklenen/x.webp": "data:image/webp;base64,…" }
let aktifBolum = null;
let cihaz = "masaustu";

const kopya = (o) => JSON.parse(JSON.stringify(o));
const degisti = () => JSON.stringify(taslak) !== JSON.stringify(asil) || Object.keys(bekleyen).length > 0;

function al(nesne, yol) { return yol.split(".").reduce((o, k) => (o == null ? o : o[k]), nesne); }
function koy(nesne, yol, deger) {
  const p = yol.split("."); let o = nesne;
  for (let i = 0; i < p.length - 1; i++) { if (o[p[i]] == null) o[p[i]] = /^\d+$/.test(p[i + 1]) ? [] : {}; o = o[p[i]]; }
  o[p[p.length - 1]] = deger;
}
const slug = (s) => String(s).toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
  .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "grup";

/* ---------- Bildirim ve durum çubuğu ---------- */
let bildirimZaman;
function bildir(metin, tur = "") {
  const b = $("#bildirim");
  b.textContent = metin; b.className = "bildirim " + tur; b.hidden = false;
  clearTimeout(bildirimZaman);
  bildirimZaman = setTimeout(() => { b.hidden = true; }, tur === "hata" ? 9000 : 4500);
}
function durumYaz(metin) { $("#durum").textContent = metin; }
function dugmeleriGuncelle() {
  const d = degisti();
  $("#yayinla").disabled = !d || !anahtar;
  $("#geri-al").disabled = !d;
  if (!anahtar) durumYaz("Göz atma modu: değişiklikler yayınlanamaz.");
  else if (d) durumYaz("Yayınlanmamış değişiklikleriniz var.");
}

/* ---------- GitHub ---------- */
async function gh(yol, secenek = {}) {
  const r = await fetch(API + yol, {
    ...secenek,
    headers: {
      Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28",
      ...(anahtar ? { Authorization: "Bearer " + anahtar } : {}),
      ...(secenek.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!r.ok) {
    let mesaj = r.status + "";
    try { mesaj = (await r.json()).message || mesaj; } catch (_) {}
    const hata = new Error(mesaj); hata.durum = r.status; throw hata;
  }
  return r.status === 204 ? null : r.json();
}
const base64Coz = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, "")), (c) => c.charCodeAt(0)));

async function icerikGetir() {
  if (!anahtar) {
    const r = await fetch("../icerik/site.json", { cache: "no-store" });
    return { icerik: await r.json(), sha: null };
  }
  const d = await gh(`/repos/${SAHIP}/${DEPO}/contents/${ICERIK_YOLU}?ref=${DAL}`);
  return { icerik: JSON.parse(base64Coz(d.content)), sha: d.sha };
}

/* ---------- Giriş ---------- */
const IZIN_MESAJI = "Anahtarın sitenin deposuna yazma izni yok. GitHub'da anahtarı düzenleyin: Repository access → Only select repositories → yolhanendustri; Permissions → + Add permissions → Contents: Read and write, Actions: Read-only. Sonra Update'e basın ve bu sayfayı yenileyin.";

/** Depo herkese açık olduğu için okuma her anahtarla çalışır; yazma iznini
    boş bir blob oluşturarak sınarız (commit oluşmaz, siteye hiçbir etkisi yoktur). */
async function yazmaIzniVar() {
  try {
    await gh(`/repos/${SAHIP}/${DEPO}/git/blobs`, { method: "POST", body: JSON.stringify({ content: "", encoding: "utf-8" }) });
    return true;
  } catch (err) {
    if (err.durum === 403 || err.durum === 404) return false;
    throw err;
  }
}

async function girisYap(yeniAnahtar, hatirla) {
  anahtar = yeniAnahtar;
  await gh(`/repos/${SAHIP}/${DEPO}`);
  if (!(await yazmaIzniVar())) {
    anahtar = null;
    throw new Error(IZIN_MESAJI);
  }
  try {
    (hatirla ? localStorage : sessionStorage).setItem(ANAHTAR_KAYIT, yeniAnahtar);
  } catch (_) {}
}

async function baslat() {
  const { icerik, sha } = await icerikGetir();
  asil = icerik; asilSha = sha; taslak = kopya(icerik); bekleyen = {};
  // Yarım kalan taslak var mı?
  try {
    const t = JSON.parse(localStorage.getItem(TASLAK_KAYIT) || "null");
    if (t && t.sha === asilSha && JSON.stringify(t.icerik) !== JSON.stringify(asil)) {
      if (confirm("Bu cihazda yayınlanmamış bir taslağınız var. Kaldığınız yerden devam edilsin mi?")) {
        taslak = t.icerik; bekleyen = t.bekleyen || {};
      }
    }
  } catch (_) {}
  $("#giris-ekrani").hidden = true;
  $("#uygulama").hidden = false;
  menuKur();
  bolumAc(location.hash.slice(1) || BOLUMLER[0].bolumler[0].id);
  dugmeleriGuncelle();
  if (anahtar) {
    durumYaz("Güncel içerik yüklendi.");
    yazmaIzniVar().then((var_) => {
      if (var_) sonYayinDurumu();
      else { durumYaz("Yayınlanamaz: anahtarın yazma izni yok."); bildir(IZIN_MESAJI, "hata"); }
    }).catch(() => {});
  }
}

function girisEkrani(hata) {
  $("#giris-ekrani").hidden = false;
  $("#uygulama").hidden = true;
  const h = $("#giris-hata");
  h.hidden = !hata; h.textContent = hata || "";
}

$("#giris-formu").addEventListener("submit", async (e) => {
  e.preventDefault();
  const d = e.submitter || $("#giris-formu button[type=submit]");
  d.disabled = true; d.textContent = "Kontrol ediliyor…";
  try {
    await girisYap($("#anahtar").value.trim(), $("#hatirla").checked);
    $("#anahtar").value = "";
    await baslat();
  } catch (err) {
    girisEkrani(err.durum === 401 ? "Anahtar geçersiz ya da süresi dolmuş. Yeni bir anahtar oluşturun." :
      err.durum === 404 ? "Anahtar sitenin deposunu göremiyor. Repository access bölümünde 'yolhanendustri' seçili olmalı." : err.message);
  } finally { d.disabled = false; d.textContent = "Giriş yap"; }
});
$("#dene").addEventListener("click", async () => { anahtar = null; await baslat(); });
$("#cikis").addEventListener("click", () => {
  if (degisti() && !confirm("Yayınlanmamış değişiklikleriniz kaybolacak. Çıkılsın mı?")) return;
  try { localStorage.removeItem(ANAHTAR_KAYIT); sessionStorage.removeItem(ANAHTAR_KAYIT); localStorage.removeItem(TASLAK_KAYIT); } catch (_) {}
  anahtar = null; location.hash = ""; location.reload();
});

/* ---------- Bölüm menüsü ---------- */
function menuKur() {
  const m = $("#bolum-menusu"); m.replaceChildren();
  for (const g of BOLUMLER) {
    m.append(el("h2", {}, g.grup));
    m.append(el("ul", {}, g.bolumler.map((b) => el("li", {}, el("a", { href: "#" + b.id, "data-bolum": b.id }, b.baslik)))));
  }
}
addEventListener("hashchange", () => { const id = location.hash.slice(1); if (id && id !== (aktifBolum && aktifBolum.id)) bolumAc(id); });

function bolumBul(id) { for (const g of BOLUMLER) for (const b of g.bolumler) if (b.id === id) return b; return null; }

function bolumAc(id) {
  const b = bolumBul(id) || BOLUMLER[0].bolumler[0];
  aktifBolum = b;
  document.querySelectorAll("[data-bolum]").forEach((a) => a.toggleAttribute("aria-current", a.dataset.bolum === b.id));
  formCiz();
  $("#sayfa-sec").value = b.sayfa;
  onizle({ kaydir: true });
}

/* ---------- Form ---------- */
function formCiz() {
  const b = aktifBolum, f = $("#form-alani");
  const kaydirma = f.scrollTop;
  f.replaceChildren(
    el("header", { class: "form-bas" }, el("h1", {}, b.baslik), b.aciklama ? el("p", {}, b.aciklama) : null),
    ...b.alanlar.map((a) => alanCiz(a, a.yol))
  );
  f.scrollTop = kaydirma;
}

function degisiklik(yeniden = false) {
  dugmeleriGuncelle();
  taslakSakla();
  if (yeniden) formCiz();
  onizle();
}

function etiket(a, id) {
  return [el("label", { for: id, class: "alan__ad" }, a.ad), a.ipucu ? el("p", { class: "alan__ipucu", id: id + "-ipucu" }, a.ipucu) : null];
}
let sayac = 0;
const yeniId = () => "a" + ++sayac;

function alanCiz(a, yol) {
  const id = yeniId();
  const deger = al(taslak, yol);
  const ozellik = { id, ...(a.ipucu ? { "aria-describedby": id + "-ipucu" } : {}) };

  if (a.tip === "metin" || a.tip === "uzun") {
    const giris = a.tip === "uzun"
      ? el("textarea", { ...ozellik, rows: Math.min(8, Math.max(2, String(deger || "").split("\n").length + 1)) })
      : el("input", { ...ozellik, type: "text" });
    giris.value = deger ?? "";
    giris.addEventListener("input", () => {
      koy(taslak, yol, giris.value);
      if (a.tip === "uzun") giris.rows = Math.min(10, Math.max(2, giris.value.split("\n").length + 1));
      kimlikGuncelle(yol, giris.value);
      degisiklik();
    });
    return el("div", { class: "alan" }, etiket(a, id), giris);
  }

  if (a.tip === "metinListesi") {
    const liste = Array.isArray(deger) ? deger : [];
    return el("fieldset", { class: "alan liste" },
      el("legend", { class: "alan__ad" }, a.ad), a.ipucu ? el("p", { class: "alan__ipucu" }, a.ipucu) : null,
      liste.map((t, i) => {
        const g = a.uzun ? el("textarea", { rows: 4, "aria-label": `${a.ad} ${i + 1}` }) : el("input", { type: "text", "aria-label": `${a.ad} ${i + 1}` });
        g.value = t;
        g.addEventListener("input", () => { liste[i] = g.value; degisiklik(); });
        return el("div", { class: "liste__satir" }, g, siraDugmeleri(liste, i, yol));
      }),
      el("button", { type: "button", class: "p-dugme p-dugme--ekle", onclick: () => { liste.push(""); koy(taslak, yol, liste); degisiklik(true); } }, "+ " + (a.ekle || "Ekle"))
    );
  }

  if (a.tip === "gorsel") {
    return el("div", { class: "alan" }, el("span", { class: "alan__ad" }, a.ad), a.ipucu ? el("p", { class: "alan__ipucu" }, a.ipucu) : null, gorselKart(yol, null));
  }

  if (a.tip === "gorselListesi") {
    const liste = Array.isArray(deger) ? deger : [];
    const dolu = a.en && liste.length >= a.en;
    return el("fieldset", { class: "alan" },
      el("legend", { class: "alan__ad" }, a.ad), a.ipucu ? el("p", { class: "alan__ipucu" }, a.ipucu) : null,
      el("div", { class: "gorsel-izgara" }, liste.map((_, i) => gorselKart(yol + "." + i, { liste, i, yol }))),
      dolu ? null : el("label", { class: "p-dugme p-dugme--ekle dosya-dugme" }, "+ Fotoğraf ekle",
        el("input", { type: "file", accept: "image/*", class: "gizli", onchange: async (e) => {
          const yeni = await fotografYukle(e.target.files[0]); if (!yeni) return;
          liste.push({ src: yeni, alt: "" }); koy(taslak, yol, liste); degisiklik(true);
        } }))
    );
  }

  if (a.tip === "secim") {
    const secili = new Set(Array.isArray(deger) ? deger : []);
    const kaynak = taslak[a.kaynak] || [];
    return el("fieldset", { class: "alan secim" },
      el("legend", { class: "alan__ad" }, a.ad),
      el("div", { class: "secim__liste" }, kaynak.map((k) => {
        const kid = yeniId();
        const kutu = el("input", { type: "checkbox", id: kid, checked: secili.has(k.id) });
        kutu.addEventListener("change", () => {
          kutu.checked ? secili.add(k.id) : secili.delete(k.id);
          koy(taslak, yol, kaynak.map((x) => x.id).filter((x) => secili.has(x)));
          degisiklik();
        });
        return el("label", { for: kid, class: "kutucuk" }, kutu, k.ad);
      }))
    );
  }

  if (a.tip === "nesneListesi") {
    const liste = Array.isArray(deger) ? deger : [];
    return el("div", { class: "alan nesne-listesi" },
      liste.map((n, i) => el("details", { class: "nesne", open: !a.kapali && liste.length <= 4 },
        el("summary", {}, el("span", {}, n[a.ozet] || "(adsız)"), siraDugmeleri(liste, i, yol, a)),
        el("div", { class: "nesne__ic" }, a.alanlar.map((alt) => alanCiz(alt, `${yol}.${i}.${alt.yol}`)))
      )),
      el("button", { type: "button", class: "p-dugme p-dugme--ekle", onclick: () => {
        const yeni = {};
        a.alanlar.forEach((alt) => { yeni[alt.yol] = alt.tip === "secim" || alt.tip === "metinListesi" ? [] : alt.tip === "gorsel" ? { src: "", alt: "" } : ""; });
        if (a.kimlik) yeni.id = "yeni-" + Date.now();
        liste.push(yeni); koy(taslak, yol, liste); degisiklik(true);
        const son = [...document.querySelectorAll(".nesne")].pop(); if (son) { son.open = true; son.scrollIntoView({ block: "center" }); }
      } }, "+ " + (a.ekle || "Ekle"))
    );
  }
  return el("p", {}, "Bilinmeyen alan türü: " + a.tip);
}

/** Yeni eklenen ürün grubunun kimliği (sayfa bağlantısı) adından üretilir */
function kimlikGuncelle(yol, deger) {
  const m = yol.match(/^gruplar\.(\d+)\.ad$/);
  if (!m) return;
  const g = taslak.gruplar[+m[1]];
  if (g && String(g.id || "").startsWith("yeni-")) g.yeniAd = deger;
}

function siraDugmeleri(liste, i, yol, a) {
  const tasi = (y) => (e) => {
    e.preventDefault(); e.stopPropagation();
    const j = i + y; if (j < 0 || j >= liste.length) return;
    [liste[i], liste[j]] = [liste[j], liste[i]]; koy(taslak, yol, liste); degisiklik(true);
  };
  const sil = (e) => {
    e.preventDefault(); e.stopPropagation();
    const ad = a && a.ozet ? liste[i][a.ozet] : "";
    if (!confirm(`${ad ? "“" + ad + "”" : "Bu öğe"} silinsin mi?`)) return;
    const silinen = liste.splice(i, 1)[0];
    if (yol === "gruplar" && silinen) (taslak.markalar || []).forEach((m) => { m.gruplar = (m.gruplar || []).filter((x) => x !== silinen.id); });
    koy(taslak, yol, liste); degisiklik(true);
  };
  return el("span", { class: "sira" },
    el("button", { type: "button", title: "Yukarı taşı", "aria-label": "Yukarı taşı", disabled: i === 0, onclick: tasi(-1) }, "↑"),
    el("button", { type: "button", title: "Aşağı taşı", "aria-label": "Aşağı taşı", disabled: i === liste.length - 1, onclick: tasi(1) }, "↓"),
    el("button", { type: "button", title: "Sil", "aria-label": "Sil", class: "sil", onclick: sil }, "Sil"));
}

/* ---------- Fotoğraflar ---------- */
const gorselAdres = (src) => (!src ? "" : bekleyen[src] || (/^(data:|https?:)/.test(src) ? src : "../" + src));

function gorselKart(yol, listede) {
  const g = al(taslak, yol) || { src: "", alt: "" };
  const altId = yeniId();
  const resim = g.src ? el("img", { src: gorselAdres(g.src), alt: "" }) : el("span", { class: "gorsel-kart__bos" }, "Fotoğraf yok");
  const altGiris = el("input", { type: "text", id: altId, placeholder: "Örn. Depoda forklift ile sevkiyat" });
  altGiris.value = g.alt || "";
  altGiris.addEventListener("input", () => { koy(taslak, yol + ".alt", altGiris.value); degisiklik(); });
  return el("div", { class: "gorsel-kart" },
    el("div", { class: "gorsel-kart__resim" }, resim),
    el("div", { class: "gorsel-kart__alt" },
      el("label", { class: "p-dugme p-dugme--sade dosya-dugme" }, g.src ? "Değiştir" : "Fotoğraf seç",
        el("input", { type: "file", accept: "image/*", class: "gizli", onchange: async (e) => {
          const yeni = await fotografYukle(e.target.files[0]); if (!yeni) return;
          koy(taslak, yol, { src: yeni, alt: altGiris.value }); degisiklik(true);
        } })),
      listede ? siraDugmeleri(listede.liste, listede.i, listede.yol) : null,
      el("label", { for: altId, class: "alan__ipucu" }, "Fotoğrafta ne var? (görme engelliler ve Google için)"),
      altGiris)
  );
}

/** Fotoğrafı tarayıcıda küçültüp WebP'ye çevirir, yayınlanana kadar bekletir */
async function fotografYukle(dosya) {
  if (!dosya) return null;
  if (!dosya.type.startsWith("image/")) { bildir("Bu dosya bir fotoğraf değil.", "hata"); return null; }
  bildir("Fotoğraf hazırlanıyor…");
  try {
    const bmp = await createImageBitmap(dosya);
    const EN = 2200, oran = Math.min(1, EN / Math.max(bmp.width, bmp.height));
    const t = Object.assign(document.createElement("canvas"), { width: Math.round(bmp.width * oran), height: Math.round(bmp.height * oran) });
    t.getContext("2d").drawImage(bmp, 0, 0, t.width, t.height);
    let veri = t.toDataURL("image/webp", 0.8);
    if (!veri.startsWith("data:image/webp")) veri = t.toDataURL("image/jpeg", 0.85);
    const uzanti = veri.startsWith("data:image/webp") ? "webp" : "jpg";
    const ad = `medya/yuklenen/${slug(dosya.name.replace(/\.[^.]+$/, ""))}-${Date.now().toString(36)}.${uzanti}`;
    bekleyen[ad] = veri;
    bildir("Fotoğraf eklendi. Yayınlayınca sitede görünür.", "tamam");
    return ad;
  } catch (err) {
    bildir("Fotoğraf açılamadı. JPG ya da PNG bir dosya deneyin.", "hata");
    return null;
  }
}

/* ---------- Taslak saklama ---------- */
let saklaZaman;
function taslakSakla() {
  clearTimeout(saklaZaman);
  saklaZaman = setTimeout(() => {
    try { localStorage.setItem(TASLAK_KAYIT, JSON.stringify({ sha: asilSha, icerik: taslak, bekleyen })); }
    catch (_) { try { localStorage.setItem(TASLAK_KAYIT, JSON.stringify({ sha: asilSha, icerik: taslak })); } catch (__) {} }
  }, 600);
}

$("#geri-al").addEventListener("click", () => {
  if (!confirm("Yayınlanmamış tüm değişiklikler silinsin mi?")) return;
  taslak = kopya(asil); bekleyen = {};
  try { localStorage.removeItem(TASLAK_KAYIT); } catch (_) {}
  formCiz(); onizle(); dugmeleriGuncelle();
  bildir("Değişiklikler geri alındı.");
});
addEventListener("beforeunload", (e) => { if (taslak && degisti()) { e.preventDefault(); e.returnValue = ""; } });

/* ---------- Önizleme ---------- */
let onizleZaman;
function onizle({ kaydir = false } = {}) {
  clearTimeout(onizleZaman);
  onizleZaman = setTimeout(() => onizleCiz(kaydir), kaydir ? 0 : 350);
}

function yayinaHazirla(icerik) {
  const c = kopya(icerik);
  (c.gruplar || []).forEach((g) => {
    if (String(g.id || "").startsWith("yeni-")) {
      const eski = g.id;
      let yeni = slug(g.ad || g.yeniAd || "grup"), n = 2;
      while (c.gruplar.some((x) => x !== g && x.id === yeni)) yeni = slug(g.ad) + "-" + n++;
      g.id = yeni;
      (c.markalar || []).forEach((m) => { m.gruplar = (m.gruplar || []).map((x) => (x === eski ? yeni : x)); });
    }
    delete g.yeniAd;
  });
  return c;
}

function onizleCiz(kaydir) {
  const sayfa = $("#sayfa-sec").value;
  const s = SAYFALAR.find((x) => x.dosya === sayfa) || SAYFALAR[0];
  const c = yayinaHazirla(taslak);
  // Bekleyen fotoğraflar önizlemede doğrudan gösterilir
  (function gez(o) {
    if (Array.isArray(o)) o.forEach(gez);
    else if (o && typeof o === "object") { if (typeof o.src === "string" && bekleyen[o.src]) o.src = bekleyen[o.src]; Object.values(o).forEach(gez); }
  })(c);
  let html;
  try { html = s.olustur(c); }
  catch (err) { bildir("Önizleme oluşturulamadı: " + err.message, "hata"); return; }
  const kok = new URL("../", location.href).href;
  html = html.replace("<head>", `<head><base href="${kok}"><style>.js .satir>span,.js .giris__ust,.js .giris__donen,.js .giris__aciklama,.js .giris .dugmeler,.js .sayfa-giris__aciklama{animation:none!important;transform:none!important;opacity:1!important}.perde{display:none}</style>`);
  const cerceve = $("#onizleme-cerceve");
  let eskiKaydirma = 0;
  try { eskiKaydirma = cerceve.contentWindow.scrollY || 0; } catch (_) {}
  cerceve.onload = () => {
    const w = cerceve.contentWindow;
    if (kaydir && aktifBolum && aktifBolum.hedef && aktifBolum.sayfa === sayfa) {
      const h = w.document.querySelector(aktifBolum.hedef);
      if (h) w.scrollTo(0, Math.max(0, h.getBoundingClientRect().top + w.scrollY - 70));
    } else w.scrollTo(0, eskiKaydirma);
  };
  cerceve.srcdoc = html;
}

$("#sayfa-sec").addEventListener("change", () => onizle({ kaydir: false }));
document.querySelectorAll("[data-cihaz]").forEach((b) => b.addEventListener("click", () => {
  cihaz = b.dataset.cihaz;
  document.querySelectorAll("[data-cihaz]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
  $("#cerceve-kutu").classList.toggle("telefon", cihaz === "telefon");
}));
$("#onizleme-ac").addEventListener("click", () => { document.body.classList.add("onizleme-acik"); onizle(); });
$("#onizleme-kapat").addEventListener("click", () => document.body.classList.remove("onizleme-acik"));

/* ---------- Yayınla ---------- */
$("#yayinla").addEventListener("click", yayinla);

async function yayinla() {
  if (!anahtar || !degisti()) return;
  const d = $("#yayinla");
  d.disabled = true; d.textContent = "Yayınlanıyor…";
  try {
    durumYaz("GitHub'daki son sürüm kontrol ediliyor…");
    const guncel = await gh(`/repos/${SAHIP}/${DEPO}/contents/${ICERIK_YOLU}?ref=${DAL}`);
    if (asilSha && guncel.sha !== asilSha &&
      !confirm("İçerik siz düzenlerken başka bir yerden değiştirilmiş. Sizin sürümünüz onun yerine yayınlansın mı?")) {
      durumYaz("Yayınlama iptal edildi."); return;
    }
    const ref = await gh(`/repos/${SAHIP}/${DEPO}/git/ref/heads/${DAL}`);
    const sonCommit = await gh(`/repos/${SAHIP}/${DEPO}/git/commits/${ref.object.sha}`);

    const yayinIcerik = yayinaHazirla(taslak);
    // Yalnızca içerikte hâlâ kullanılan fotoğrafları yükle
    const metin = JSON.stringify(yayinIcerik);
    const fotolar = Object.keys(bekleyen).filter((y) => metin.includes(JSON.stringify(y)));
    const agac = [{ path: ICERIK_YOLU, mode: "100644", type: "blob", content: JSON.stringify(yayinIcerik, null, 2) + "\n" }];
    let n = 0;
    for (const yol of fotolar) {
      durumYaz(`Fotoğraflar yükleniyor (${++n}/${fotolar.length})…`);
      const blob = await gh(`/repos/${SAHIP}/${DEPO}/git/blobs`, { method: "POST", body: JSON.stringify({ content: bekleyen[yol].split(",")[1], encoding: "base64" }) });
      agac.push({ path: yol, mode: "100644", type: "blob", sha: blob.sha });
    }
    durumYaz("Değişiklikler kaydediliyor…");
    const yeniAgac = await gh(`/repos/${SAHIP}/${DEPO}/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: sonCommit.tree.sha, tree: agac }) });
    const commit = await gh(`/repos/${SAHIP}/${DEPO}/git/commits`, { method: "POST", body: JSON.stringify({ message: "Panelden içerik güncellemesi", tree: yeniAgac.sha, parents: [ref.object.sha] }) });
    await gh(`/repos/${SAHIP}/${DEPO}/git/refs/heads/${DAL}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });

    asil = kopya(yayinIcerik); taslak = kopya(yayinIcerik); bekleyen = {};
    const yeniDosya = await gh(`/repos/${SAHIP}/${DEPO}/contents/${ICERIK_YOLU}?ref=${commit.sha}`);
    asilSha = yeniDosya.sha;
    try { localStorage.removeItem(TASLAK_KAYIT); } catch (_) {}
    formCiz(); onizle();
    bildir("Kaydedildi. Site 1–2 dakika içinde güncellenecek.", "tamam");
    yayinIzle(commit.sha);
  } catch (err) {
    bildir("Yayınlanamadı: " + (err.durum === 401 ? "anahtarın süresi dolmuş, yeniden giriş yapın." : err.durum === 403 ? IZIN_MESAJI : err.message), "hata");
    durumYaz("Yayınlanamadı. Değişiklikleriniz bu cihazda duruyor, tekrar deneyebilirsiniz.");
  } finally {
    d.textContent = "Yayınla"; dugmeleriGuncelle();
  }
}

async function yayinIzle(sha) {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await gh(`/repos/${SAHIP}/${DEPO}/actions/runs?head_sha=${sha}&per_page=1`);
      const run = r.workflow_runs && r.workflow_runs[0];
      if (run && run.status === "completed") {
        if (run.conclusion === "success") { durumYaz("Yayında. Değişiklikler sitede."); bildir("Site güncellendi.", "tamam"); }
        else durumYaz("Site derlenirken sorun çıktı. İçerik kaydedildi; birkaç dakika sonra tekrar yayınlamayı deneyin.");
        return;
      }
      durumYaz(run ? "Site güncelleniyor…" : "Güncelleme sıraya alındı…");
    } catch (_) { durumYaz("Kaydedildi. Site birkaç dakika içinde güncellenecek."); return; }
    await new Promise((r) => setTimeout(r, 5000));
  }
}

async function sonYayinDurumu() {
  try {
    const r = await gh(`/repos/${SAHIP}/${DEPO}/actions/runs?branch=${DAL}&per_page=1`);
    const run = r.workflow_runs && r.workflow_runs[0];
    if (!run || degisti()) return;
    if (run.status !== "completed") { durumYaz("Son değişiklik yayına alınıyor…"); yayinIzle(run.head_sha); }
    else durumYaz("Site güncel. Son yayın: " + new Date(run.updated_at).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }));
  } catch (_) {}
}

/* ---------- Açılış ---------- */
(async function () {
  let kayitli = null;
  try { kayitli = localStorage.getItem(ANAHTAR_KAYIT) || sessionStorage.getItem(ANAHTAR_KAYIT); } catch (_) {}
  if (!kayitli) return girisEkrani();
  try { anahtar = kayitli; await baslat(); }
  catch (err) {
    anahtar = null;
    girisEkrani(err.durum === 401 ? "Kayıtlı anahtarın süresi dolmuş. Yeni bir anahtarla giriş yapın." : "Bağlanılamadı: " + err.message);
  }
})();
