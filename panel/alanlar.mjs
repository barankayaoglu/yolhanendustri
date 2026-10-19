/* Panelde düzenlenebilen alanlar. Her bölüm bir form olur.
   yol: icerik/site.json içindeki konum · tip: alanın türü
   Türler: metin, uzun, metinListesi, gorsel, gorselListesi, nesneListesi, secim */

const seo = (kok) => [
  { yol: kok + ".seoBaslik", ad: "Google başlığı", tip: "metin", ipucu: "Arama sonuçlarında ve tarayıcı sekmesinde görünür. 60 karakteri geçmemesi iyi olur." },
  { yol: kok + ".seoAciklama", ad: "Google açıklaması", tip: "uzun", ipucu: "Arama sonuçlarında başlığın altında görünür. 150–160 karakter idealdir." },
];

const YASAL_ACIKLAMA = "Metinde {unvan}, {telefon}, {eposta}, {merkezAdres} ve {siteAdresi} yazdığınız yerler firma bilgilerinden otomatik doldurulur. Boş satır yeni paragraf başlatır, “- ” ile başlayan satırlar madde işaretli liste olur, [yazı](adres) bağlantı olur. Metni değiştirdiğinizde güncelleme tarihini de değiştirin.";

const yasalAlanlar = (k) => [
  { yol: `yasal.${k}.baslik`, ad: "Sayfa başlığı", tip: "metin" },
  { yol: `yasal.${k}.aciklama`, ad: "Başlık altı açıklama", tip: "uzun" },
  { yol: `yasal.${k}.guncelleme`, ad: "Son güncelleme tarihi", tip: "metin", ipucu: "Örn. 16 Ekim 2026" },
  { yol: `yasal.${k}.bolumler`, ad: "Bölümler", tip: "nesneListesi", ekle: "Bölüm ekle", ozet: "baslik", kapali: true,
    alanlar: [{ yol: "baslik", ad: "Bölüm başlığı", tip: "metin" }, { yol: "metin", ad: "Metin", tip: "uzun" }] },
  ...seo(`yasal.${k}`),
];

export const BOLUMLER = [
  {
    grup: "Genel",
    bolumler: [
      {
        id: "firma", baslik: "Firma ve iletişim bilgileri", sayfa: "iletisim.html", hedef: ".iletisim-kartlari",
        aciklama: "Telefon, e-posta ve adres bilgileri sitenin her yerinde (menü, alt bilgi, butonlar) buradan okunur.",
        alanlar: [
          { yol: "firma.ad", ad: "Firma adı", tip: "metin" },
          { yol: "firma.unvan", ad: "Ticari unvan", tip: "metin" },
          { yol: "firma.kurulus", ad: "Kuruluş yılı", tip: "metin" },
          { yol: "firma.telefon", ad: "Telefon", tip: "metin" },
          { yol: "firma.whatsapp", ad: "WhatsApp numarası", tip: "metin" },
          { yol: "firma.eposta", ad: "E-posta", tip: "metin" },
          { yol: "firma.calismaSaatleri", ad: "Çalışma saatleri", tip: "metin" },
          { yol: "firma.b2bAdres", ad: "B2B sitesinin adresi", tip: "metin" },
          { yol: "firma.bayilikMesaji", ad: "Bayilik WhatsApp mesajı", tip: "uzun", ipucu: "Ziyaretçi 'Bayilik için yazın'a basınca WhatsApp'ta hazır gelen mesaj." },
        ],
      },
      {
        id: "menu", baslik: "Menü yazıları", sayfa: "index.html", hedef: ".ust",
        alanlar: [
          { yol: "menu.anaSayfa", ad: "Ana Sayfa", tip: "metin" },
          { yol: "menu.hakkimizda", ad: "Hakkımızda", tip: "metin" },
          { yol: "menu.urunGruplari", ad: "Ürün Grupları", tip: "metin" },
          { yol: "menu.ekatalog", ad: "E-Katalog", tip: "metin" },
          { yol: "menu.iletisim", ad: "İletişim", tip: "metin" },
          { yol: "menu.bayiOl", ad: "Bayi olun düğmesi", tip: "metin" },
          { yol: "menu.b2bGiris", ad: "B2B Giriş düğmesi", tip: "metin" },
          { yol: "menu.kvkk", ad: "Alt bilgi: KVKK bağlantısı", tip: "metin" },
          { yol: "menu.gizlilik", ad: "Alt bilgi: Gizlilik bağlantısı", tip: "metin" },
        ],
      },
    ],
  },
  {
    grup: "Ana sayfa",
    bolumler: [
      {
        id: "giris", baslik: "Giriş (en üst bölüm)", sayfa: "index.html", hedef: ".giris",
        alanlar: [
          { yol: "anaSayfa.giris.ustSatir", ad: "Üst satır", tip: "metin" },
          { yol: "anaSayfa.giris.baslik", ad: "Büyük başlık", tip: "uzun", ipucu: "Yeni satıra geçmek için Enter'a basın. Kısa tutun; her satır ekranı boydan boya kaplar." },
          { yol: "anaSayfa.giris.doneneOnEk", ad: "Dönen kelimelerin önündeki yazı", tip: "metin" },
          { yol: "anaSayfa.giris.donenler", ad: "Dönen kelimeler", tip: "metinListesi", ekle: "Kelime ekle" },
          { yol: "anaSayfa.giris.aciklama", ad: "Açıklama", tip: "uzun" },
          { yol: "anaSayfa.giris.buton1", ad: "Sarı düğme", tip: "metin" },
          { yol: "anaSayfa.giris.buton2", ad: "Çerçeveli düğme", tip: "metin" },
          { yol: "anaSayfa.giris.gorseller", ad: "Slayt fotoğrafları", tip: "gorselListesi", ipucu: "Yatay ve geniş fotoğraflar en iyi sonucu verir. Sıra, gösterim sırasıdır." },
        ],
      },
      {
        id: "profil", baslik: "Firma profili", sayfa: "index.html", hedef: ".profil",
        alanlar: [
          { yol: "anaSayfa.profil.baslik", ad: "Başlık", tip: "uzun" },
          { yol: "anaSayfa.profil.metin", ad: "Metin", tip: "uzun" },
          { yol: "anaSayfa.profil.maddeler", ad: "İşaretli maddeler", tip: "metinListesi", ekle: "Madde ekle" },
          { yol: "anaSayfa.profil.baglanti", ad: "Bağlantı yazısı", tip: "metin" },
          { yol: "anaSayfa.profil.gorseller", ad: "Kolaj fotoğrafları (3 adet)", tip: "gorselListesi", en: 3, ipucu: "1: büyük yatay, 2: dikey, 3: küçük yatay." },
        ],
      },
      {
        id: "anaGruplar", baslik: "Ürün grupları bölümü", sayfa: "index.html", hedef: ".gruplar",
        aciklama: "Karolardaki grup adları, açıklamaları ve fotoğrafları 'Ürün grupları' listesinden gelir.",
        alanlar: [
          { yol: "anaSayfa.gruplar.baslik", ad: "Başlık", tip: "uzun" },
          { yol: "anaSayfa.gruplar.aciklama", ad: "Açıklama", tip: "uzun" },
          { yol: "anaSayfa.gruplar.baglanti", ad: "Bağlantı yazısı", tip: "metin" },
        ],
      },
      {
        id: "anaMarkalar", baslik: "Markalar bölümü", sayfa: "index.html", hedef: ".markalar",
        alanlar: [
          { yol: "anaSayfa.markalar.baslik", ad: "Başlık", tip: "uzun" },
          { yol: "anaSayfa.markalar.aciklama", ad: "Açıklama", tip: "uzun" },
        ],
      },
      {
        id: "anaSubeler", baslik: "Şubeler bölümü", sayfa: "index.html", hedef: ".subeler",
        alanlar: [
          { yol: "anaSayfa.subeler.baslik", ad: "Başlık", tip: "uzun" },
          { yol: "anaSayfa.subeler.aciklama", ad: "Açıklama", tip: "uzun" },
        ],
      },
      {
        id: "bayi", baslik: "Bayi bandı (sayfa sonu)", sayfa: "index.html", hedef: ".bayi",
        aciklama: "Bu bant ana sayfa, Hakkımızda ve Ürün Grupları sayfalarının sonunda görünür.",
        alanlar: [
          { yol: "anaSayfa.bayi.baslik", ad: "Başlık", tip: "uzun" },
          { yol: "anaSayfa.bayi.metin", ad: "Metin", tip: "uzun" },
          { yol: "anaSayfa.bayi.buton1", ad: "Sarı düğme", tip: "metin" },
          { yol: "anaSayfa.bayi.buton2", ad: "Çerçeveli düğme", tip: "metin" },
          { yol: "anaSayfa.bayi.gorsel", ad: "Arka plan fotoğrafı", tip: "gorsel" },
        ],
      },
      { id: "anaSeo", baslik: "Google ayarları", sayfa: "index.html", hedef: ".giris", alanlar: seo("anaSayfa") },
    ],
  },
  {
    grup: "Diğer sayfalar",
    bolumler: [
      {
        id: "hakkimizda", baslik: "Hakkımızda sayfası", sayfa: "hakkimizda.html", hedef: ".sayfa-giris",
        alanlar: [
          { yol: "hakkimizda.baslik", ad: "Sayfa başlığı", tip: "uzun" },
          { yol: "hakkimizda.aciklama", ad: "Başlık altı açıklama", tip: "uzun" },
          { yol: "hakkimizda.gorsel", ad: "Üst fotoğraf", tip: "gorsel" },
          { yol: "hakkimizda.hikayeBaslik", ad: "Hikâye başlığı", tip: "metin" },
          { yol: "hakkimizda.hikaye", ad: "Hikâye paragrafları", tip: "metinListesi", uzun: true, ekle: "Paragraf ekle", ipucu: "İlk paragraf büyük yazılır." },
          { yol: "hakkimizda.ilkelerBaslik", ad: "İlkeler başlığı", tip: "metin" },
          { yol: "hakkimizda.ilkeler", ad: "İlkeler", tip: "nesneListesi", ekle: "İlke ekle", ozet: "ad",
            alanlar: [{ yol: "ad", ad: "Başlık", tip: "metin" }, { yol: "metin", ad: "Açıklama", tip: "uzun" }] },
          { yol: "hakkimizda.galeri", ad: "Fotoğraf galerisi (3 adet)", tip: "gorselListesi", en: 3 },
          ...seo("hakkimizda"),
        ],
      },
      {
        id: "urunGruplariSayfa", baslik: "Ürün Grupları sayfası", sayfa: "urun-gruplari.html", hedef: ".sayfa-giris",
        alanlar: [
          { yol: "urunGruplari.baslik", ad: "Sayfa başlığı", tip: "uzun" },
          { yol: "urunGruplari.aciklama", ad: "Başlık altı açıklama", tip: "uzun" },
          { yol: "urunGruplari.gorsel", ad: "Üst fotoğraf", tip: "gorsel" },
          { yol: "urunGruplari.markalarBaslik", ad: "Markalar başlığı", tip: "metin" },
          { yol: "urunGruplari.markalarAciklama", ad: "Markalar açıklaması", tip: "uzun" },
          ...seo("urunGruplari"),
        ],
      },
      {
        id: "ekatalogSayfa", baslik: "E-Katalog sayfası", sayfa: "e-katalog.html", hedef: ".ekat__ust",
        aciklama: "Katalog sayfaları Yolhan Fiyat Paneli'ndeki “E-kataloğu yayınla” düğmesiyle güncellenir; burada yalnız çevresindeki yazılar düzenlenir.",
        alanlar: [
          { yol: "ekatalog.ustSatir", ad: "Üst satır", tip: "metin" },
          { yol: "ekatalog.baslik", ad: "Başlık", tip: "uzun", ipucu: "Yeni satıra geçmek için Enter'a basın." },
          { yol: "ekatalog.aciklama", ad: "Başlık altı açıklama", tip: "uzun" },
          { yol: "ekatalog.ipucu", ad: "Kullanım ipucu (ilk açılışta)", tip: "metin" },
          { yol: "ekatalog.notBaslik", ad: "Alt bant başlığı", tip: "uzun" },
          { yol: "ekatalog.notMetin", ad: "Alt bant metni", tip: "uzun" },
          { yol: "ekatalog.notButon1", ad: "Alt bant: B2B düğmesi", tip: "metin" },
          { yol: "ekatalog.notButon2", ad: "Alt bant: WhatsApp düğmesi", tip: "metin" },
          { yol: "ekatalog.whatsappMesaji", ad: "WhatsApp mesajı", tip: "uzun" },
          ...seo("ekatalog"),
        ],
      },
      {
        id: "iletisimSayfa", baslik: "İletişim sayfası", sayfa: "iletisim.html", hedef: ".sayfa-giris",
        alanlar: [
          { yol: "iletisim.baslik", ad: "Sayfa başlığı", tip: "uzun" },
          { yol: "iletisim.aciklama", ad: "Başlık altı açıklama", tip: "uzun" },
          { yol: "iletisim.gorsel", ad: "Üst fotoğraf", tip: "gorsel" },
          { yol: "iletisim.subelerBaslik", ad: "Şubeler başlığı", tip: "metin" },
          { yol: "iletisim.bayilikBaslik", ad: "Bayilik başlığı", tip: "uzun" },
          { yol: "iletisim.bayilikMetin", ad: "Bayilik metni", tip: "uzun" },
          ...seo("iletisim"),
        ],
      },
    ],
  },
  {
    grup: "Yasal metinler",
    bolumler: [
      { id: "kvkk", baslik: "KVKK Aydınlatma Metni", sayfa: "kvkk-aydinlatma-metni.html", hedef: ".yasal-giris", aciklama: YASAL_ACIKLAMA, alanlar: yasalAlanlar("kvkk") },
      { id: "gizlilik", baslik: "Gizlilik Politikası", sayfa: "gizlilik-politikasi.html", hedef: ".yasal-giris", aciklama: YASAL_ACIKLAMA, alanlar: yasalAlanlar("gizlilik") },
    ],
  },
  {
    grup: "Listeler",
    bolumler: [
      {
        id: "gruplar", baslik: "Ürün grupları", sayfa: "urun-gruplari.html", hedef: ".grup-listesi",
        aciklama: "Ana sayfadaki karolar ve Ürün Grupları sayfası bu listeden oluşur. Sıralamayı oklarla değiştirebilirsiniz.",
        alanlar: [
          { yol: "gruplar", ad: "Ürün grupları", tip: "nesneListesi", ekle: "Ürün grubu ekle", ozet: "ad", kimlik: true,
            alanlar: [
              { yol: "ad", ad: "Grup adı", tip: "metin" },
              { yol: "ozet", ad: "Kısa özet", tip: "metin" },
              { yol: "aciklama", ad: "Açıklama", tip: "uzun" },
              { yol: "gorsel", ad: "Fotoğraf", tip: "gorsel" },
            ] },
        ],
      },
      {
        id: "markalar", baslik: "Markalar", sayfa: "urun-gruplari.html", hedef: ".marka-kartlari",
        aciklama: "Her markanın hangi ürün gruplarında bulunduğunu işaretleyin; Ürün Grupları sayfasında grupların altında görünür.",
        alanlar: [
          { yol: "markalar", ad: "Markalar", tip: "nesneListesi", ekle: "Marka ekle", ozet: "ad", kapali: true,
            alanlar: [
              { yol: "ad", ad: "Marka adı", tip: "metin" },
              { yol: "gruplar", ad: "Bulunduğu ürün grupları", tip: "secim", kaynak: "gruplar" },
            ] },
        ],
      },
      {
        id: "subeler", baslik: "Şubeler", sayfa: "iletisim.html", hedef: ".sube-izgara",
        alanlar: [
          { yol: "subeler", ad: "Şubeler", tip: "nesneListesi", ekle: "Şube ekle", ozet: "ad",
            alanlar: [
              { yol: "ad", ad: "Şube adı", tip: "metin" },
              { yol: "ilce", ad: "İlçe", tip: "metin" },
              { yol: "adres", ad: "Adres", tip: "uzun" },
              { yol: "haritaSorgu", ad: "Google Haritalar'da aranacak ad", tip: "metin", ipucu: "Haritada işletmenin doğru bulunması için Google'daki kayıt adını yazın." },
              { yol: "gorsel", ad: "Fotoğraf", tip: "gorsel" },
            ] },
        ],
      },
    ],
  },
];
