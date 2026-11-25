/* Rehber listesi: dokunmatik ekranda ekranın ortasındaki kart .aktif olur (fareli cihazda :hover çalışır). */
(function () {
  if (!("IntersectionObserver" in window) || !matchMedia("(hover: none)").matches) return;
  var kartlar = document.querySelectorAll(".rehber__liste a");
  var io = new IntersectionObserver(function (kayitlar) {
    kayitlar.forEach(function (k) { k.target.classList.toggle("aktif", k.isIntersecting); });
  }, { rootMargin: "-42% 0px -42% 0px" });
  kartlar.forEach(function (a) { io.observe(a); });
})();
