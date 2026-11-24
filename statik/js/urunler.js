/* Ürünlerimiz süzgeci: sayfalar sunucudan hazır (taranabilir); bu betik süzgeç/arama yapar. */
(function () {
  var form = document.querySelector("[data-urun-filtre]");
  var izgara = document.querySelector("[data-urun-izgara]");
  if (!form || !izgara) return;
  var sonuc = document.querySelector("[data-urun-sonuc]");
  var sayfalama = document.querySelector("[data-urun-sayfa]");
  var BOYUT = 48, veri = null, liste = [], gosterilen = 0, daha = null;
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var kucuk = function (s) { return String(s).replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase(); };
  var kart = function (u) {
    var g = u.f ? '<img src="medya/' + esc(u.f) + '" alt="' + esc(u.a) + '" loading="lazy" decoding="async" width="280" height="280">' : '<span class="urn-kart__bos" aria-hidden="true">' + esc(u.m) + "</span>";
    return '<li class="urn-kart"><a href="urun/' + u.s + '.html"><span class="urn-kart__gorsel">' + g + '</span><span class="urn-kart__marka">' + esc(u.m) + '</span><span class="urn-kart__ad">' + esc(u.a) + '</span><span class="urn-kart__kod">Kod: ' + esc(u.k) + "</span></a></li>";
  };
  function alanlar() {
    var p = new URLSearchParams(new FormData(form));
    return { marka: p.get("marka") || "", grup: p.get("grup") || "", q: kucuk((p.get("q") || "").trim()) };
  }
  function ciz() {
    var son = Math.min(gosterilen + BOYUT, liste.length);
    izgara.insertAdjacentHTML("beforeend", liste.slice(gosterilen, son).map(kart).join(""));
    gosterilen = son;
    sonuc.textContent = liste.length.toLocaleString("tr") + " ürün bulundu";
    if (daha) daha.hidden = gosterilen >= liste.length;
  }
  function uygula() {
    var f = alanlar();
    var kelimeler = f.q ? f.q.split(/\s+/) : [];
    liste = veri.urunler.filter(function (u) {
      if (f.marka && u.m !== f.marka) return false;
      if (f.grup && u.g !== f.grup) return false;
      if (!kelimeler.length) return true;
      var h = kucuk(u.a + " " + u.k + " " + u.v + " " + u.m + " " + u.g + (u.ral ? " ral " + u.ral : ""));
      return kelimeler.every(function (k) { return h.indexOf(k) !== -1; });
    });
    izgara.innerHTML = ""; gosterilen = 0;
    if (sayfalama) sayfalama.hidden = true;
    if (!daha) {
      daha = document.createElement("div"); daha.className = "urn-daha";
      daha.innerHTML = '<button type="button" class="dugme dugme--koyu">Daha fazla göster</button>';
      izgara.parentNode.insertBefore(daha, izgara.nextSibling);
      daha.firstChild.addEventListener("click", ciz);
    }
    ciz();
  }
  function yukle(sonra) {
    if (veri) return sonra();
    sonuc.textContent = "Yükleniyor…";
    fetch(location.pathname.replace(/[^/]*$/, "") + "icerik/urunler.json").then(function (r) { return r.json(); }).then(function (j) { veri = j; sonra(); })
      .catch(function () { sonuc.textContent = "Liste yüklenemedi; sayfalardan gezebilirsiniz."; });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var p = new URLSearchParams(new FormData(form));
    for (var k of Array.from(p.keys())) if (!p.get(k)) p.delete(k);
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
    yukle(uygula);
  });
  var gelen = new URLSearchParams(location.search);
  if (gelen.get("marka") || gelen.get("grup") || gelen.get("q")) {
    ["marka", "grup", "q"].forEach(function (a) { if (form.elements[a] && gelen.get(a)) form.elements[a].value = gelen.get(a); });
    yukle(uygula);
  }
})();
