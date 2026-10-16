/* =========================================================
   YOLHAN ENDÜSTRİ — Kurumsal site davranışları
   Menü, ürün grubu / marka listeleri, haritalar, görünme hareketi.
   ========================================================= */
(function () {
  var d = document;
  var IKON = "assets/img/ikonlar.svg#i-";
  var veri = window.YOLHAN || { gruplar: [], markalar: [] };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function ikon(ad, cls) {
    return '<svg class="i' + (cls ? " " + cls : "") + '" aria-hidden="true"><use href="' + IKON + ad + '"/></svg>';
  }
  function grupMarkalari(id) {
    return veri.markalar.filter(function (m) { return m.gruplar.indexOf(id) > -1; });
  }
  function grupAdi(id) {
    for (var i = 0; i < veri.gruplar.length; i++) if (veri.gruplar[i].id === id) return veri.gruplar[i].ad;
    return id;
  }
  function chips(markalar) {
    return markalar.map(function (m) { return '<span class="chip">' + esc(m.ad) + "</span>"; }).join("");
  }

  /* ---------- Mobil menü ---------- */
  var btn = d.querySelector(".menu-btn");
  if (btn) {
    var kapat = function () { d.body.classList.remove("menu-open"); btn.setAttribute("aria-expanded", "false"); };
    btn.addEventListener("click", function () {
      var acik = d.body.classList.toggle("menu-open");
      btn.setAttribute("aria-expanded", acik ? "true" : "false");
    });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape") kapat(); });
    d.querySelectorAll(".nav a").forEach(function (a) { a.addEventListener("click", kapat); });
    matchMedia("(min-width: 900px)").addEventListener("change", kapat);
  }

  /* ---------- Ürün grupları ---------- */
  d.querySelectorAll("[data-gruplar]").forEach(function (el) {
    var detay = el.getAttribute("data-gruplar") === "detay";
    el.innerHTML = veri.gruplar.map(function (g) {
      var markalar = grupMarkalari(g.id);
      var ust = '<span class="group__ic">' + ikon(g.ikon) + "</span>" + '<h3 class="h3">' + esc(g.ad) + "</h3>";
      var alt = markalar.length ? '<div class="group__brands" aria-label="Markalar">' + chips(markalar) + "</div>" : "";
      if (detay) {
        return '<article class="group" id="' + esc(g.id) + '" data-reveal>' + ust +
          '<p class="group__summary">' + esc(g.ozet) + "</p>" +
          '<p class="muted">' + esc(g.aciklama) + "</p>" + alt + "</article>";
      }
      return '<a class="group" href="urun-gruplari.html#' + esc(g.id) + '" style="text-decoration:none" data-reveal>' + ust +
        '<p class="muted">' + esc(g.ozet) + "</p>" + alt + "</a>";
    }).join("");
  });

  /* ---------- Markalar ---------- */
  d.querySelectorAll("[data-markalar]").forEach(function (el) {
    var kompakt = el.getAttribute("data-markalar") === "kompakt";
    el.innerHTML = veri.markalar.map(function (m) {
      var gruplar = m.gruplar.map(grupAdi).join(", ");
      var alt = !kompakt && gruplar
        ? '<small><span class="visually-hidden">Ürün grupları: </span>' + esc(gruplar) + "</small>" : "";
      return '<li class="brand" data-reveal>' + esc(m.ad) + alt + "</li>";
    }).join("");
  });
  d.querySelectorAll("[data-grup-sayisi]").forEach(function (el) { el.textContent = veri.gruplar.length; });
  d.querySelectorAll("[data-marka-sayisi]").forEach(function (el) { el.textContent = veri.markalar.length; });

  // Adresteki #grup, listeler çizildikten sonra var olur; oraya kaydır
  if (location.hash.length > 1) {
    var hedef = d.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (hedef) hedef.scrollIntoView();
  }

  /* ---------- Haritalar (tıklayınca yüklenir; Google çerezleri ancak o zaman gelir) ---------- */
  d.querySelectorAll("[data-harita]").forEach(function (kutu) {
    var dugme = kutu.querySelector("button");
    if (!dugme) return;
    dugme.addEventListener("click", function () {
      var f = d.createElement("iframe");
      f.src = "https://www.google.com/maps?output=embed&q=" + encodeURIComponent(kutu.getAttribute("data-harita"));
      f.title = kutu.getAttribute("data-baslik") || "Harita";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.allowFullscreen = true;
      kutu.innerHTML = "";
      kutu.appendChild(f);
    });
  });

  /* ---------- Yıl ---------- */
  d.querySelectorAll("[data-yil]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Görünme hareketi ---------- */
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (girdiler) {
      girdiler.forEach(function (g) {
        if (g.isIntersecting) { g.target.classList.add("is-in"); io.unobserve(g.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    // Sayfa açıldığında zaten ekranda olanlar beklemeden görünsün (ölçüm, gizleme sınıfından önce)
    var bekleyenler = [];
    d.querySelectorAll("[data-reveal]").forEach(function (el) {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-in");
      else bekleyenler.push(el);
    });
    d.documentElement.classList.add("js-motion");
    bekleyenler.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + "ms";
      io.observe(el);
    });
  }
})();
