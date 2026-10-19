/* E-katalog: sayfa çevirmeli kitap. Dış kütüphane yok.
   Sayfa görselleri ve fihrist ekatalog/ klasöründen gelir (ekatalog/index.json).
   Model: kitap "yapraklardan" oluşur. İki sayfalı (cift) modda yaprağın önü tek, arkası çift sayfadır;
   tek sayfalı (tek) modda her yaprak tek sayfadır. Her yaprağın ilerlemesi p ∈ [0,1] (0 = sağda, 1 = çevrilmiş). */
(() => {
  "use strict";
  const kok = document.querySelector("[data-ekatalog]");
  if (!kok) return;

  const YOL = "ekatalog/";
  const azHareket = document.documentElement.classList.contains("az-hareket");
  const $ = (s) => kok.querySelector(s);
  const el = {
    alan: $("[data-alan]"), kayan: $("[data-kayan]"), cilt: $("[data-cilt]"), yukleniyor: $("[data-yukleniyor]"),
    ipucu: $("[data-ipucu]"), geri: $("[data-geri]"), ileri: $("[data-ileri]"),
    kaydirgac: $("[data-kaydirgac]"), etiket: $("[data-etiket]"), toplam: $("[data-toplam]"), tarih: $("[data-tarih]"),
    buyut: $("[data-buyut]"), paylas: $("[data-paylas]"), tam: $("[data-tam]"),
    cekmece: $("[data-cekmece]"), bolumler: $("[data-bolumler]"), arama: $("[data-arama]"), sonuclar: $("[data-sonuclar]"),
  };

  let D = null;            // index.json
  let N = 0;               // sayfa sayısı
  let S = 0;               // yaprak sayısı
  let mod = "cift";        // cift | tek
  let konum = 0;           // çevrilmiş yaprak sayısı (mantıksal)
  let p = [];              // yaprak ilerlemeleri
  let yapraklar = [];
  let pw = 0, ph = 0;      // sayfa ölçüsü (px)
  let zoom = 1, kx = 0, ky = 0;
  let animler = new Map(); // yaprak -> raf kimliği
  let hash;

  const sinir = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
  const norm = (s) => String(s).toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");

  /* ---------- Sayfa ↔ yaprak eşlemesi ---------- */

  const onSayfa = (i) => (mod === "cift" ? 2 * i + 1 : i + 1);
  const arkaSayfa = (i) => (mod === "cift" && 2 * i + 2 <= N ? 2 * i + 2 : 0);
  const yaprakSayisi = () => (mod === "cift" ? Math.ceil(N / 2) : N);
  const sayfadanKonum = (n) => (mod === "cift" ? Math.floor(n / 2) : n - 1);
  const gorunenSayfalar = () => {
    if (mod === "tek") return [konum + 1];
    return [konum > 0 ? 2 * konum : 0, konum < S ? 2 * konum + 1 : 0].filter((n) => n >= 1 && n <= N);
  };
  const aktifSayfa = () => gorunenSayfalar().slice(-1)[0] || 1;

  /* ---------- Kurulum ---------- */

  function resimKur(n) {
    if (!n) return '<div class="ekat__bos"></div>';
    return `<img class="ekat__resim" data-n="${n}" alt="Katalog sayfa ${n}" draggable="false" decoding="async">`;
  }

  function kitapKur() {
    S = yaprakSayisi();
    el.cilt.innerHTML = `<i class="ekat__zemin" data-zemin></i><i class="ekat__kenar ekat__kenar--sol" data-kenar-sol></i><i class="ekat__kenar ekat__kenar--sag" data-kenar-sag></i>`
      + Array.from({ length: S }, (_, i) => `
      <div class="ekat__yaprak" data-i="${i}">
        <div class="ekat__yuz ekat__yuz--on">${resimKur(onSayfa(i))}<i class="ekat__golge"></i></div>
        <div class="ekat__yuz ekat__yuz--arka">${resimKur(arkaSayfa(i))}<i class="ekat__golge"></i></div>
      </div>`).join("")
      + `<i class="ekat__omurga" data-omurga></i><i class="ekat__yer ekat__yer--sol" data-yer-sol></i><i class="ekat__yer ekat__yer--sag" data-yer-sag></i>`;
    yapraklar = [...el.cilt.querySelectorAll(".ekat__yaprak")];
    p = Array.from({ length: S }, (_, i) => (i < konum ? 1 : 0));
    yapraklar.forEach((y) => { y.style.setProperty("--n", y.dataset.i); });
    animler.forEach((id) => cancelAnimationFrame(id));
    animler = new Map();
  }

  function yerlestir() {
    const r = D.en / D.boy;
    const alanW = el.alan.clientWidth, alanH = el.alan.clientHeight;
    const yeniMod = alanW >= 760 && alanW / alanH > 1.05 ? "cift" : "tek";
    const sayfaNo = kitapHazir ? aktifSayfa() : 1;
    if (yeniMod !== mod || !kitapHazir) {
      mod = yeniMod;
      konum = sayfadanKonum(sayfaNo);
      kitapKur();
      for (let i = 0; i < S; i++) p[i] = i < konum ? 1 : 0;
      kitapHazir = true;
      durumGuncelle();
    }
    const genis = mod === "cift" ? 2 : 1;
    ph = Math.floor(Math.min(alanH, alanW / (genis * r)));
    pw = Math.floor(ph * r);
    el.cilt.style.setProperty("--pw", pw + "px");
    el.cilt.style.setProperty("--ph", ph + "px");
    el.cilt.style.width = genis * pw + "px";
    el.cilt.style.height = ph + "px";
    el.cilt.dataset.mod = mod;
    zoomUygula();
    ciz();
  }
  let kitapHazir = false;

  /* ---------- Çizim ---------- */

  function resimleriYukle() {
    const bas = Math.max(0, konum - 3), son = Math.min(S - 1, konum + 4);
    for (let i = bas; i <= son; i++) {
      for (const im of yapraklar[i].querySelectorAll("img[data-n]")) {
        if (im.src) continue;
        const k = D.sayfalar[im.dataset.n - 1];
        im.src = `${YOL}${k.d}?v=${k.h}`;
        im.addEventListener("load", () => im.classList.add("yuklendi"), { once: true });
        if (im.complete) im.classList.add("yuklendi");
      }
    }
  }

  const kayma = (x) => {
    // x: toplam çevrilmiş yaprak (kesirli). Kapak ve arka kapak tek başına durunca kitap ortalanır.
    if (mod !== "cift") return 0;
    if (x < 1) return -0.25 * (1 - x);
    if (x > S - 1) return 0.25 * (x - (S - 1));
    return 0;
  };

  function ciz() {
    if (!kitapHazir) return;
    let x = 0;
    for (let i = 0; i < S; i++) x += p[i];
    const cift = mod === "cift";
    const W = cift ? 2 * pw : pw;
    // Son yaprak tek sayfaysa (N tek) kapak gibi sağda kalır; kayma yalnız çift N için ortalar.
    el.cilt.style.setProperty("--ox", kayma(x) * W + "px");

    yapraklar.forEach((y, i) => {
      const yakin = i >= konum - 4 && i <= konum + 4;
      const v = p[i];
      if (!yakin && v !== 0 && v !== 1) { /* animasyonda: görünür kalsın */ }
      y.hidden = !yakin && !animler.has(i);
      if (y.hidden) return;
      const donuyor = v > 0 && v < 1;
      let aci, opak = 1;
      if (cift) aci = -180 * v;
      else { aci = -105 * v; opak = v > 0.6 ? sinir(1 - (v - 0.6) / 0.4) : 1; }
      y.style.transform = `rotateY(${aci}deg)`;
      y.style.opacity = opak;
      y.style.zIndex = donuyor ? S + 2 : v >= 1 ? 1 + i : S - i;
      y.classList.toggle("donuyor", donuyor);
      y.style.visibility = !cift && v >= 1 ? "hidden" : "";
      // Köşe gölgesi: dönen yaprağın yüzlerinde, ışığın geldiği yöne göre.
      const sin = Math.sin(Math.PI * v);
      y.style.setProperty("--g-on", (v * 0.55).toFixed(3));
      y.style.setProperty("--g-arka", ((1 - v) * 0.55).toFixed(3));
      y.style.setProperty("--g-cep", (sin * 0.5).toFixed(3));
    });

    // Dönen yaprağın altına düşen gölge (sağ/sol sayfa üstüne)
    const f = x - Math.floor(x);
    const dok = Math.sin(Math.PI * f);
    el.cilt.style.setProperty("--dok-sag", (dok * (1 - f) * 0.9).toFixed(3));
    el.cilt.style.setProperty("--dok-sol", (dok * f * 0.9).toFixed(3));

    // Yaprak yığını kalınlığı (kenarlar) ve zemin gölgesi
    const kal = (v) => Math.round(1 + v * (cift ? 11 : 8));
    const solKal = cift && x > 0.05 ? kal(x / S) : 0;
    const sagKal = x < S - 0.05 ? kal(1 - x / S) : 0;
    const kSol = el.cilt.querySelector("[data-kenar-sol]"), kSag = el.cilt.querySelector("[data-kenar-sag]");
    if (kSol) kSol.style.width = solKal + "px";
    if (kSag) kSag.style.width = sagKal + "px";
    const zemin = el.cilt.querySelector("[data-zemin]");
    if (zemin) {
      const solPay = cift ? 50 * (1 - sinir(x)) : 0;
      const sagPay = cift ? 50 * sinir(x - (S - 1)) : 0;
      zemin.style.left = solPay + "%";
      zemin.style.right = sagPay + "%";
    }
    const omurga = el.cilt.querySelector("[data-omurga]");
    if (omurga) omurga.style.opacity = cift ? (sinir(x) * (1 - sinir(x - (S - 1)))).toFixed(2) : 0;

    resimleriYukle();
  }

  /* ---------- Animasyon ---------- */

  function yaprakAnim(i, hedef, sure = 950) {
    return new Promise((coz) => {
      if (animler.has(i)) cancelAnimationFrame(animler.get(i));
      const bas = p[i];
      if (bas === hedef || azHareket) { p[i] = hedef; animler.delete(i); ciz(); return coz(); }
      const toplam = sure * Math.abs(hedef - bas);
      const t0 = performance.now();
      const adim = (t) => {
        const k = sinir((t - t0) / toplam);
        p[i] = bas + (hedef - bas) * easeInOut(k);
        if (k >= 1) { p[i] = hedef; animler.delete(i); ciz(); coz(); return; }
        animler.set(i, requestAnimationFrame(adim));
        ciz();
      };
      animler.set(i, requestAnimationFrame(adim));
    });
  }

  function ileriGit() {
    if (zoom > 1 || konum >= S) return;
    const i = konum++;
    durumGuncelle();
    return yaprakAnim(i, 1);
  }
  function geriGit() {
    if (zoom > 1 || konum <= 0) return;
    const i = --konum;
    durumGuncelle();
    return yaprakAnim(i, 0);
  }

  let gidiyor = false;
  async function sayfayaGit(n) {
    n = sinir(Math.round(n), 1, N);
    const hedef = sinir(sayfadanKonum(n), 0, S);
    if (hedef === konum || gidiyor) { durumGuncelle(); return; }
    gidiyor = true;
    if (zoom > 1) zoomAyarla(1);
    const fark = hedef - konum;
    if (Math.abs(fark) <= 8 && !azHareket) {
      const yon = Math.sign(fark);
      for (let k = 0; k < Math.abs(fark); k++) { yon > 0 ? ileriGit() : geriGit(); await bekle(120); }
    } else {
      // Uzak atlama: kitap kısa süre silinip yeni konumda belirir.
      el.cilt.classList.add("atliyor");
      await bekle(azHareket ? 0 : 220);
      animler.forEach((id) => cancelAnimationFrame(id)); animler.clear();
      konum = hedef;
      for (let i = 0; i < S; i++) p[i] = i < konum ? 1 : 0;
      ciz(); durumGuncelle();
      await bekle(azHareket ? 0 : 60);
      el.cilt.classList.remove("atliyor");
    }
    gidiyor = false;
  }

  /* ---------- Durum, ilerleme, adres ---------- */

  function durumGuncelle() {
    const s = gorunenSayfalar();
    el.etiket.textContent = s.length === 2 ? `${s[0]}–${s[1]}` : String(s[0]);
    el.kaydirgac.value = s[0];
    el.kaydirgac.style.setProperty("--dolu", ((s[0] - 1) / Math.max(1, N - 1) * 100).toFixed(2) + "%");
    el.geri.disabled = konum <= 0;
    el.ileri.disabled = konum >= S;
    el.cilt.dataset.bas = konum <= 0 ? "1" : "";
    el.cilt.dataset.son = konum >= S ? "1" : "";
    clearTimeout(hash);
    hash = setTimeout(() => { try { history.replaceState(null, "", "#s=" + s[0]); } catch { /* sessiz */ } }, 250);
    bolumIsaretle(s[0]);
  }

  function bolumIsaretle(n) {
    let aktif = null;
    for (const b of D.bolumler) if (b.sayfa <= n) aktif = b.id;
    el.bolumler.querySelectorAll("button").forEach((b) => {
      if (b.dataset.bolum === aktif) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
    el.kaydirgac.style.setProperty("--renk", (D.bolumler.find((b) => b.id === aktif) || {}).renk || "");
  }

  /* ---------- Sürükleme, tıklama ---------- */

  let surukle = null;
  el.alan.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target.closest("button, a, input")) return;
    surukle = { x0: e.clientX, y0: e.clientY, son: e.clientX, sonT: performance.now(), hiz: 0, aktif: false, yon: 0, i: -1, p0: 0, id: e.pointerId, kx0: kx, ky0: ky };
    const r = el.cilt.getBoundingClientRect();
    surukle.sagTaraf = e.clientX >= r.left + r.width * (mod === "cift" ? 0.5 : 0.3);
  });

  el.alan.addEventListener("pointermove", (e) => {
    const d = surukle;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    if (zoom > 1) {
      if (!d.aktif && Math.hypot(dx, dy) < 5) return;
      d.aktif = true;
      el.alan.setPointerCapture(e.pointerId);
      kx = d.kx0 + dx; ky = d.ky0 + dy; zoomUygula();
      return;
    }
    if (!d.aktif) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      // sola sürükleme -> ileri, sağa sürükleme -> geri
      const ileriMi = dx < 0;
      if (mod === "cift" && ileriMi !== d.sagTaraf) return; // yanlış taraftan başlayan sürükleme
      if (ileriMi ? konum >= S : konum <= 0) return;
      d.aktif = true; d.yon = ileriMi ? 1 : -1;
      d.i = ileriMi ? konum : konum - 1;
      if (animler.has(d.i)) { cancelAnimationFrame(animler.get(d.i)); animler.delete(d.i); }
      d.p0 = p[d.i];
      d.x0 = e.clientX; // eşik farkını atla
      el.alan.setPointerCapture(e.pointerId);
      el.cilt.classList.add("suruklu");
    }
    const t = performance.now();
    d.hiz = (e.clientX - d.son) / Math.max(1, t - d.sonT);
    d.son = e.clientX; d.sonT = t;
    const yol = pw * 1.25;
    p[d.i] = sinir(d.p0 - (e.clientX - d.x0) / yol);
    ciz();
  });

  function suruklemeBitir(e, iptal) {
    const d = surukle;
    if (!d || d.id !== e.pointerId) return;
    surukle = null;
    el.cilt.classList.remove("suruklu");
    if (d.aktif && zoom > 1) return;
    if (d.aktif) {
      const ileriMi = d.yon > 0;
      const oran = ileriMi ? p[d.i] : 1 - p[d.i];
      const hizliMi = ileriMi ? d.hiz < -0.4 : d.hiz > 0.4;
      const tamam = !iptal && (oran > 0.3 || hizliMi);
      if (ileriMi && tamam) konum++;
      if (!ileriMi && tamam) konum--;
      durumGuncelle();
      yaprakAnim(d.i, ileriMi ? (tamam ? 1 : 0) : (tamam ? 0 : 1), 650);
      return;
    }
    if (iptal) return;
    // Tıklama: kitabın sağ yarısı ileri, sol yarısı geri.
    if (!el.cilt.contains(e.target) && e.target !== el.alan && e.target !== el.kayan) return;
    if (zoom > 1) return;
    d.sagTaraf ? ileriGit() : geriGit();
    ipucuKapat();
  }
  el.alan.addEventListener("pointerup", (e) => suruklemeBitir(e, false));
  el.alan.addEventListener("pointercancel", (e) => suruklemeBitir(e, true));
  el.alan.addEventListener("dblclick", (e) => {
    if (e.target.closest("button, a, input")) return;
    zoomAyarla(zoom > 1 ? 1 : 2.2, e);
  });

  /* ---------- Yakınlaştırma ---------- */

  function zoomUygula() {
    const W = (mod === "cift" ? 2 : 1) * pw;
    const sx = Math.max(0, (W * zoom - el.alan.clientWidth) / 2 + (zoom > 1 ? pw * 0.1 : 0));
    const sy = Math.max(0, (ph * zoom - el.alan.clientHeight) / 2 + (zoom > 1 ? ph * 0.04 : 0));
    kx = sinir(kx, -sx, sx); ky = sinir(ky, -sy, sy);
    el.kayan.style.transform = zoom > 1 ? `translate(${kx}px, ${ky}px) scale(${zoom})` : "";
    el.kayan.classList.toggle("yakin", zoom > 1);
  }
  function zoomAyarla(z, e) {
    zoom = z;
    if (z === 1) { kx = 0; ky = 0; }
    else if (e) {
      const r = el.alan.getBoundingClientRect();
      kx = -(e.clientX - (r.left + r.width / 2)) * (z - 1);
      ky = -(e.clientY - (r.top + r.height / 2)) * (z - 1);
    }
    el.buyut.setAttribute("aria-pressed", z > 1 ? "true" : "false");
    el.buyut.setAttribute("aria-label", z > 1 ? "Uzaklaştır" : "Yakınlaştır");
    zoomUygula();
  }

  /* ---------- Düğmeler, klavye ---------- */

  el.ileri.addEventListener("click", () => { ileriGit(); ipucuKapat(); });
  el.geri.addEventListener("click", () => { geriGit(); ipucuKapat(); });
  el.buyut.addEventListener("click", () => zoomAyarla(zoom > 1 ? 1 : 2.2));
  el.kaydirgac.addEventListener("input", () => { el.etiket.textContent = el.kaydirgac.value; });
  el.kaydirgac.addEventListener("change", () => sayfayaGit(Number(el.kaydirgac.value)));

  el.tam.addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (kok.requestFullscreen) kok.requestFullscreen().catch(() => {});
    else kok.classList.toggle("tam-ekran");
  });
  document.addEventListener("fullscreenchange", () => { setTimeout(yerlestir, 60); });

  el.paylas.addEventListener("click", async () => {
    const url = `${location.origin}${location.pathname}#s=${aktifSayfa() === 0 ? 1 : gorunenSayfalar()[0]}`;
    const baslik = document.title;
    if (navigator.share) { try { await navigator.share({ title: baslik, url }); return; } catch { return; } }
    window.open("https://wa.me/?text=" + encodeURIComponent(baslik + " " + url), "_blank", "noopener");
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input[type=range]")) return;
    if (e.target.closest("input[type=search], textarea")) { if (e.key === "Escape") cekmeceKapat(); return; }
    const kitapta = kok.contains(document.activeElement) || document.activeElement === document.body;
    if (!kitapta) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); ileriGit(); ipucuKapat(); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); geriGit(); ipucuKapat(); }
    else if (e.key === "Home") { e.preventDefault(); sayfayaGit(1); }
    else if (e.key === "End") { e.preventDefault(); sayfayaGit(N); }
    else if (e.key === "+" || e.key === "=") zoomAyarla(2.2);
    else if (e.key === "-") zoomAyarla(1);
    else if (e.key === "Escape") { if (!cekmece_kapali()) cekmeceKapat(); else if (zoom > 1) zoomAyarla(1); }
  });

  function ipucuKapat() { if (!el.ipucu.hidden) { el.ipucu.classList.add("gizle"); setTimeout(() => { el.ipucu.hidden = true; }, 500); } }

  /* ---------- Çekmece: içindekiler + arama ---------- */

  const cekmece_kapali = () => el.cekmece.hidden;
  function cekmeceAc(sekme) {
    el.cekmece.hidden = false;
    requestAnimationFrame(() => el.cekmece.classList.add("acik"));
    sekmeSec(sekme);
    kok.querySelectorAll("[data-ac]").forEach((b) => b.setAttribute("aria-expanded", b.dataset.ac === sekme ? "true" : "false"));
    if (sekme === "ara") setTimeout(() => el.arama.focus(), 50);
  }
  function cekmeceKapat() {
    el.cekmece.classList.remove("acik");
    kok.querySelectorAll("[data-ac]").forEach((b) => b.setAttribute("aria-expanded", "false"));
    setTimeout(() => { if (!el.cekmece.classList.contains("acik")) el.cekmece.hidden = true; }, azHareket ? 0 : 320);
  }
  function sekmeSec(s) {
    el.cekmece.querySelectorAll("[data-sekme]").forEach((b) => b.setAttribute("aria-selected", b.dataset.sekme === s ? "true" : "false"));
    el.cekmece.querySelectorAll("[data-panel]").forEach((b) => { b.hidden = b.dataset.panel !== s; });
  }
  kok.querySelectorAll("[data-ac]").forEach((b) => b.addEventListener("click", () => {
    if (!el.cekmece.hidden && el.cekmece.classList.contains("acik") && b.getAttribute("aria-expanded") === "true") cekmeceKapat();
    else cekmeceAc(b.dataset.ac);
  }));
  el.cekmece.querySelectorAll("[data-sekme]").forEach((b) => b.addEventListener("click", () => cekmeceAc(b.dataset.sekme)));
  $("[data-kapat]").addEventListener("click", cekmeceKapat);

  function gitVeKapat(n) {
    if (matchMedia("(max-width: 899px)").matches) cekmeceKapat();
    sayfayaGit(n);
  }
  el.cekmece.addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]");
    if (b) gitVeKapat(Number(b.dataset.s));
  });

  function bolumleriCiz() {
    el.bolumler.innerHTML = D.bolumler.map((b, i) => `
      <li><button type="button" data-s="${b.sayfa}" data-bolum="${b.id}" style="--renk:${b.renk}">
        <span class="ekat__no">${String(i + 1).padStart(2, "0")}</span><span class="ekat__bolum-ad">${b.ad}</span><span class="ekat__bolum-sayfa">${b.sayfa}</span>
      </button></li>`).join("");
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  let aramaIndeks = null;
  function aramaYap() {
    const q = norm(el.arama.value.trim());
    if (!aramaIndeks) aramaIndeks = D.urunler.map(([baslik, marka, sayfa]) => ({ baslik, marka, sayfa, k: norm(baslik + " " + marka) }));
    if (q.length < 2) {
      el.sonuclar.innerHTML = `<li class="ekat__bos-sonuc">En az iki harf yazın. Ürün adı, marka ya da ürün ailesiyle arayabilirsiniz.</li>`;
      return;
    }
    const kelimeler = q.split(/\s+/);
    const bulunan = aramaIndeks.filter((u) => kelimeler.every((k) => u.k.includes(k)));
    bulunan.sort((a, b) => (norm(a.baslik).startsWith(q) ? 0 : 1) - (norm(b.baslik).startsWith(q) ? 0 : 1) || a.sayfa - b.sayfa);
    el.sonuclar.innerHTML = bulunan.length
      ? bulunan.slice(0, 80).map((u) => `<li><button type="button" data-s="${u.sayfa}"><b>${esc(u.baslik)}</b><small>${esc(u.marka)}</small><span>s. ${u.sayfa}</span></button></li>`).join("")
        + (bulunan.length > 80 ? `<li class="ekat__bos-sonuc">${bulunan.length - 80} sonuç daha var; aramayı daraltın.</li>` : "")
      : `<li class="ekat__bos-sonuc">“${esc(el.arama.value.trim())}” için sonuç yok.</li>`;
  }
  let aramaZaman;
  el.arama.addEventListener("input", () => { clearTimeout(aramaZaman); aramaZaman = setTimeout(aramaYap, 120); });

  /* ---------- Başlatma ---------- */

  const tarihMetni = (t) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t || "");
    if (!m) return "";
    const aylar = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    return `${Number(m[3])} ${aylar[Number(m[2]) - 1]} ${m[1]} baskısı`;
  };

  async function baslat() {
    try {
      const yanit = await fetch(YOL + "index.json", { cache: "no-cache" });
      if (!yanit.ok) throw new Error(String(yanit.status));
      D = await yanit.json();
    } catch {
      el.yukleniyor.innerHTML = `<span>Katalog şu an yüklenemedi. Lütfen sayfayı yenileyin ya da bizi arayın.</span>`;
      el.yukleniyor.classList.add("hata");
      return;
    }
    N = D.toplam;
    el.toplam.textContent = "/ " + N;
    el.kaydirgac.max = N;
    el.tarih.textContent = tarihMetni(D.tarih);
    bolumleriCiz();
    sekmeSec("icindekiler");

    const m = /s=(\d+)/.exec(location.hash);
    const ilk = m ? sinir(Number(m[1]), 1, N) : 1;
    konum = 0;
    mod = "";
    // ilk yerleşim: hedef sayfaya göre konumu ayarla
    kitapHazir = false;
    const gecici = ilk;
    yerlestir();
    if (gecici > 1) { konum = sayfadanKonum(gecici); for (let i = 0; i < S; i++) p[i] = i < konum ? 1 : 0; ciz(); }
    durumGuncelle();
    el.yukleniyor.hidden = true;
    kok.classList.add("hazir");
    // İlk kapak görseli yüklenince kitap "açılır"
    const ilkResim = el.cilt.querySelector("img[data-n]");
    const goster = () => { el.cilt.classList.add("girdi"); el.ipucu.hidden = false; setTimeout(ipucuKapat, 6000); };
    if (ilkResim && !ilkResim.complete) { ilkResim.addEventListener("load", goster, { once: true }); ilkResim.addEventListener("error", goster, { once: true }); } else goster();

    new ResizeObserver(() => yerlestir()).observe(el.alan);
    window.addEventListener("hashchange", () => { const h = /s=(\d+)/.exec(location.hash); if (h) sayfayaGit(Number(h[1])); });
  }

  baslat();
})();
