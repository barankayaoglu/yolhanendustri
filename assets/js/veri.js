/* =========================================================
   YOLHAN ENDÜSTRİ — Ürün grupları ve markalar
   B2B prototipinden (hirdavat/assets/js/data.js) alındı.
   Ürün grubu ya da marka eklemek, çıkarmak için yalnızca
   bu dosyayı düzenleyin; ana sayfa ve Ürün Grupları sayfası
   listeyi buradan okur.
   ========================================================= */
window.YOLHAN = {
  gruplar: [
    { id: "yapi-kimyasallari", ad: "Yapı Kimyasalları", ikon: "flask",
      ozet: "Silikon, köpük, mastik, yapıştırıcı ve su yalıtımı",
      aciklama: "Profesyonel uygulamalar için formüle edilmiş yapı kimyasalları. Şantiye, tadilat ve endüstriyel bakım işlerinde iç ve dış mekânda güvenle kullanılır." },
    { id: "hirdavat-nalburiye", ad: "Hırdavat Nalburiye", ikon: "lock",
      ozet: "Menteşe, kulp, kilit, ray ve mobilya aksesuarı",
      aciklama: "Mobilya, kapı ve dolap uygulamaları için dayanıklı nalburiye ürünleri. Yoğun kullanıma uygun malzeme ve yüzey kalitesi." },
    { id: "kesme-delme", ad: "Kesme ve Delme Araçları", ikon: "disc",
      ozet: "Kesme ve taşlama diskleri, matkap uçları, panç",
      aciklama: "Metal, beton, ahşap ve seramik işleme için yüksek performanslı kesme ve delme ürünleri. Uzun ömür ve temiz kesim için tasarlandı." },
    { id: "bant-grubu", ad: "Bant Grubu", ikon: "tape",
      ozet: "Koli, maskeleme, izole, köpük ve ikaz bantları",
      aciklama: "Paketleme, boya, elektrik ve montaj işleri için güçlü yapışma sağlayan bantlar. Kolay açılır, iz bırakmadan çalışır." },
    { id: "boya-malzemeleri", ad: "Boya Malzemeleri", ikon: "roller",
      ozet: "Rulo, fırça, tekne, spatula ve sprey boya",
      aciklama: "Boya ve badana işlerinde düzgün ve hızlı uygulama sağlayan profesyonel ekipman. Ustaların günlük kullanımına uygun." },
    { id: "el-aletleri", ad: "El Aletleri", ikon: "wrench",
      ozet: "Çekiç, pense, tornavida, anahtar ve ölçü aletleri",
      aciklama: "Ergonomik tutuşlu, sertleştirilmiş çelikten el aletleri. Atölye ve saha kullanımında uzun ömürlü." },
    { id: "is-guvenligi", ad: "İş Güvenliği", ikon: "hardhat",
      ozet: "Eldiven, baret, gözlük, maske ve emniyet kemeri",
      aciklama: "İlgili EN standartlarına uygun kişisel koruyucu donanım. Şantiye ve sanayi ortamında çalışan güvenliği için." },
    { id: "baglanti-ekipmanlari", ad: "Bağlantı Ekipmanları", ikon: "nut",
      ozet: "Vida, dübel, cıvata, somun, pul ve kimyasal dübel",
      aciklama: "Ahşap, metal ve beton uygulamalarında güvenli sabitleme sağlayan bağlantı elemanları. Korozyona karşı yüzey işlemli." }
  ],

  // Marka adı → bu markanın bulunduğu ürün grupları (yukarıdaki id'ler).
  // b2b.yolhanendustri.com ürün filtresinden alındı (16.10.2026). "Muhtelif" marka sayılmadı.
  // Grubu boş olanlar B2B'de bu 8 grubun hiçbirinde listelenmiyor.
  markalar: [
    { ad: "Astel",    gruplar: [] },
    { ad: "Atlas",    gruplar: ["boya-malzemeleri"] },
    { ad: "Ay-San",   gruplar: ["is-guvenligi"] },
    { ad: "Bantex",   gruplar: ["bant-grubu", "boya-malzemeleri", "is-guvenligi"] },
    { ad: "Best",     gruplar: ["yapi-kimyasallari"] },
    { ad: "Dekor",    gruplar: ["hirdavat-nalburiye", "boya-malzemeleri"] },
    { ad: "Derby",    gruplar: ["yapi-kimyasallari"] },
    { ad: "Era Tool", gruplar: ["bant-grubu"] },
    { ad: "Es-Sa",    gruplar: ["bant-grubu"] },
    { ad: "Essafe",   gruplar: ["is-guvenligi"] },
    { ad: "Evobond",  gruplar: ["yapi-kimyasallari"] },
    { ad: "Förbix",   gruplar: ["yapi-kimyasallari"] },
    { ad: "GFB",      gruplar: ["hirdavat-nalburiye", "kesme-delme", "boya-malzemeleri", "el-aletleri"] },
    { ad: "GFB XPRO", gruplar: ["boya-malzemeleri"] },
    { ad: "Haıs",     gruplar: [] },
    { ad: "Kenito",   gruplar: [] },
    { ad: "Made",     gruplar: ["kesme-delme", "bant-grubu", "el-aletleri", "baglanti-ekipmanlari"] },
    { ad: "MG",       gruplar: ["is-guvenligi"] },
    { ad: "Np1",      gruplar: ["yapi-kimyasallari"] },
    { ad: "Polikor",  gruplar: ["yapi-kimyasallari"] },
    { ad: "Power",    gruplar: ["is-guvenligi"] },
    { ad: "Proft",    gruplar: ["yapi-kimyasallari"] },
    { ad: "Selsil",   gruplar: ["yapi-kimyasallari"] },
    { ad: "Stern",    gruplar: ["yapi-kimyasallari"] },
    { ad: "Tekno",    gruplar: [] },
    { ad: "Tesa",     gruplar: ["bant-grubu", "boya-malzemeleri"] },
    { ad: "Tork",     gruplar: ["baglanti-ekipmanlari"] },
    { ad: "Yılsan",   gruplar: ["boya-malzemeleri"] },
    { ad: "Zimak",    gruplar: [] }
  ]
};
