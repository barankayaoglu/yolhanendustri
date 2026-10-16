/* =========================================================
   YOLHAN ENDÜSTRİ — site davranışları
   Yol şeridi, giriş slaytı, dönen kelimeler, sayfa geçiş perdesi,
   paralaks, mobil menü, haritalar. Dış kütüphane kullanmaz.
   ========================================================= */
(function () {
  "use strict";
  var d = document, kok = d.documentElement;
  var azHareket = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVG = "http://www.w3.org/2000/svg";

  /* ---------- Başlık ve mobil menü ---------- */
  var ust = d.querySelector("[data-ust]");
  var menuDugme = d.querySelector(".menu-dugme");
  function ustDurum() { if (ust) ust.classList.toggle("ust--dolu", scrollY > 40 || kok.classList.contains("menu-acik")); }
  addEventListener("scroll", ustDurum, { passive: true });
  ustDurum();
  if (menuDugme) {
    var menuKapat = function () { kok.classList.remove("menu-acik"); menuDugme.setAttribute("aria-expanded", "false"); ustDurum(); };
    menuDugme.addEventListener("click", function () {
      var acik = kok.classList.toggle("menu-acik");
      menuDugme.setAttribute("aria-expanded", acik ? "true" : "false");
      ustDurum();
    });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape") menuKapat(); });
    matchMedia("(min-width: 1100px)").addEventListener("change", menuKapat);
  }

  /* ---------- Sayfa geçiş perdesi ---------- */
  var perde = d.querySelector(".perde");
  d.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || !perde || azHareket || e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.protocol.indexOf("http") !== 0) return;
    if (url.pathname === location.pathname && url.hash) return; // aynı sayfa içi
    e.preventDefault();
    kok.classList.remove("menu-acik");
    perde.classList.add("perde--kapan");
    try { sessionStorage.setItem("yh-perde", "1"); } catch (_) {}
    setTimeout(function () { location.href = url.href; }, 560);
  });
  addEventListener("pageshow", function (e) { if (e.persisted && perde) perde.classList.remove("perde--kapan"); });

  /* ---------- Giriş slaytı ---------- */
  var slaytlar = d.querySelectorAll(".giris__gorsel");
  var imler = d.querySelectorAll(".giris__im");
  if (slaytlar.length) {
    var sira = 0, SURE = 6000;
    var goster = function (i) {
      slaytlar.forEach(function (s, k) { s.classList.toggle("aktif", k === i); });
      imler.forEach(function (m, k) {
        m.classList.remove("aktif");
        if (k === i) { void m.offsetWidth; m.classList.add("aktif"); }
      });
    };
    goster(0);
    if (slaytlar.length > 1) {
      // Sonraki görselleri ilk görsel yüklendikten sonra hazırla
      slaytlar.forEach(function (s) { s.loading = "eager"; });
      setInterval(function () { sira = (sira + 1) % slaytlar.length; goster(sira); }, SURE);
    }
  }

  /* ---------- Dönen kelimeler ---------- */
  d.querySelectorAll("[data-donen]").forEach(function (el) {
    var liste; try { liste = JSON.parse(el.getAttribute("data-donen")); } catch (_) { return; }
    if (!liste || liste.length < 2) return;
    var i = 0;
    setInterval(function () {
      var eski = el.firstElementChild;
      i = (i + 1) % liste.length;
      var yeni = d.createElement("span");
      yeni.textContent = liste[i];
      if (azHareket || !eski) { el.replaceChildren(yeni); return; }
      eski.classList.add("cikis");
      setTimeout(function () { yeni.className = "giris-k"; el.replaceChildren(yeni); }, 380);
    }, 2600);
  });

  /* ---------- Yol şeridi ---------- */
  var yolKatman = d.querySelector(".yol");
  var ana = d.getElementById("ana");
  var yol = null;

  function yolKur() {
    if (!yolKatman || !ana) return;
    yolKatman.replaceChildren();
    yol = null;
    if (!matchMedia("(min-width: 1024px)").matches) return;
    var kap = ana.querySelector(".kap");
    if (!kap) return;
    var anaR = ana.getBoundingClientRect();
    var kapR = kap.getBoundingClientRect();
    var serit = parseFloat(getComputedStyle(kok).getPropertyValue("--serit")) || 72;
    var x = kapR.left - anaR.left + parseFloat(getComputedStyle(kap).paddingLeft) - serit / 2;
    var duraklar = Array.prototype.slice.call(ana.querySelectorAll("[data-durak]"));
    if (!duraklar.length) return;

    var noktalar = [];
    duraklar.forEach(function (b, i) {
      var r = b.getBoundingClientRect();
      var ust = r.top - anaR.top;
      var y = i === 0 ? ust + r.height - 56 : ust + Math.min(parseFloat(getComputedStyle(b).paddingTop) || 0, 160) + 18;
      if (!noktalar.length || y > noktalar[noktalar.length - 1] + 60) noktalar.push(y);
    });
    noktalar.push(anaR.height); // alt bilgideki son durak

    var dgen = noktalar.map(function (y, i) {
      if (i === 0) return "M" + x + " " + y;
      var y0 = noktalar[i - 1], dy = y - y0, a = (i % 2 ? 1 : -1) * Math.min(26, dy * 0.05);
      return "C" + (x + a) + " " + (y0 + dy * 0.38) + " " + (x - a) + " " + (y - dy * 0.38) + " " + x + " " + y;
    }).join(" ");

    var svg = d.createElementNS(SVG, "svg");
    svg.setAttribute("width", anaR.width);
    svg.setAttribute("height", anaR.height);
    svg.innerHTML =
      '<defs><mask id="yol-maske" maskUnits="userSpaceOnUse" x="0" y="0" width="' + anaR.width + '" height="' + anaR.height + '">' +
      '<path class="yol__maske" d="' + dgen + '" fill="none" stroke="#fff" stroke-width="12"/></mask></defs>' +
      '<path class="yol__asfalt" d="' + dgen + '"/>' +
      '<path class="yol__cizgi" d="' + dgen + '" mask="url(#yol-maske)"/>';
    var duraklarG = noktalar.slice(0, -1).map(function (y) {
      var g = d.createElementNS(SVG, "g");
      g.setAttribute("class", "yol__durak");
      g.setAttribute("transform", "translate(" + x + " " + y + ")");
      g.innerHTML = '<circle r="15"/><path d="M-7 1 0-5.5 7 1M-4.6-.8V6h9.2V-.8"/>';
      svg.appendChild(g);
      return { g: g, y: y };
    });
    yolKatman.appendChild(svg);

    var maske = svg.querySelector(".yol__maske");
    var uzunluk = maske.getTotalLength();
    // Uzunluk → y tablosu (yol aşağı doğru ilerler, y artan)
    var ornek = [], ADIM = 24;
    for (var l = 0; l <= uzunluk; l += ADIM) ornek.push([l, maske.getPointAtLength(l).y]);
    ornek.push([uzunluk, maske.getPointAtLength(uzunluk).y]);
    maske.style.strokeDasharray = uzunluk + " " + uzunluk;
    yol = { maske: maske, uzunluk: uzunluk, ornek: ornek, duraklar: duraklarG };
    yolCiz();
  }

  function yolCiz() {
    if (!yol) return;
    var ucY = scrollY - (ana.getBoundingClientRect().top + scrollY) + innerHeight * 0.62;
    if (azHareket) ucY = Infinity;
    var o = yol.ornek, lo = 0, hi = o.length - 1;
    if (ucY <= o[0][1]) hi = 0;
    else if (ucY >= o[hi][1]) lo = hi;
    else while (hi - lo > 1) { var m = (lo + hi) >> 1; if (o[m][1] < ucY) lo = m; else hi = m; }
    var a = o[lo], b = o[hi], t = b[1] === a[1] ? 1 : Math.min(1, Math.max(0, (ucY - a[1]) / (b[1] - a[1])));
    var cizilen = a[0] + (b[0] - a[0]) * t;
    yol.maske.style.strokeDashoffset = Math.max(0, yol.uzunluk - cizilen);
    yol.duraklar.forEach(function (k) { k.g.classList.toggle("gecildi", ucY >= k.y); });
  }

  /* ---------- Paralaks ---------- */
  d.querySelectorAll(".bayi__gorsel img").forEach(function (img) { img.setAttribute("data-parallax", "-10"); });
  var paralaks = Array.prototype.slice.call(d.querySelectorAll("[data-parallax]"));
  function paralaksCiz() {
    if (azHareket) return;
    var h = innerHeight;
    paralaks.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > h + 200) return;
      var p = (r.top + r.height / 2 - h / 2) / h;
      el.style.transform = "translate3d(0," + (p * parseFloat(el.getAttribute("data-parallax")) * 10).toFixed(1) + "px,0)";
    });
  }

  var bekliyor = false;
  function kare() {
    if (bekliyor) return;
    bekliyor = true;
    requestAnimationFrame(function () { bekliyor = false; yolCiz(); paralaksCiz(); });
  }
  addEventListener("scroll", kare, { passive: true });

  var zamanlayici;
  function yenidenKur() { clearTimeout(zamanlayici); zamanlayici = setTimeout(function () { yolKur(); paralaksCiz(); }, 120); }
  addEventListener("resize", yenidenKur);
  if ("ResizeObserver" in window && ana) new ResizeObserver(yenidenKur).observe(ana);
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function () { yolKur(); paralaksCiz(); });
  addEventListener("load", yenidenKur);

  /* ---------- Adresteki #grup ---------- */
  if (location.hash.length > 1) {
    var hedef = d.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (hedef) setTimeout(function () { hedef.scrollIntoView(); }, 50);
  }

  /* ---------- Haritalar (tıklayınca yüklenir) ---------- */
  d.querySelectorAll("[data-harita]").forEach(function (kutu) {
    var dugme = kutu.querySelector("button");
    if (!dugme) return;
    dugme.addEventListener("click", function () {
      var f = d.createElement("iframe");
      f.src = "https://www.google.com/maps?output=embed&q=" + encodeURIComponent(kutu.getAttribute("data-harita"));
      f.title = kutu.getAttribute("data-baslik") || "Harita";
      f.loading = "lazy";
      f.allowFullscreen = true;
      kutu.replaceChildren(f);
    });
  });

  d.querySelectorAll("[data-yil]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
