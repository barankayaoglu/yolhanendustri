// Best dışındaki markalar için ürün ailesi açıklamalarını üretir ve icerik/aciklamalar.json'a ekler.
// Elle yazılmış kayıtların (Best vb.) üstüne yazmaz. Çalıştırma: node araclar/aciklama-uret.mjs
// Kural tablosu ürün TÜRÜNÜ anlatır; teknik değer (sıcaklık, mukavemet vb.) UYDURULMAZ, başlıktaki bilgi dışında sayı verilmez.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const veri = JSON.parse(await readFile(path.join(KOK, "icerik/urunler.json"), "utf8"));
const dosya = path.join(KOK, "icerik/aciklamalar.json");
const acik = JSON.parse(await readFile(dosya, "utf8"));
acik.aileler ||= {}; acik.urunler ||= {}; acik.markalar ||= {};

// [desen, "ne olduğu", [kullanım alanları], ipucu?]
const K = [
  [/polikor|politherm|polifibro/i, "macun, astar, kaplama ve cila gibi yüzey işleri ürünüdür", ["Karoser, mobilya ve yüzey düzeltme", "Boya öncesi hazırlık ve cilalama"]],
  [/delme kesme yağı|kesme yağı/i, "delme ve kesme işlerinde soğutma ve yağlama sağlayan kesme yağıdır", ["Matkap, torna, freze ve kılavuz işlerinde soğutma ve yağlama"]],
  [/izolasyon dübeli/i, "yalıtım levhalarını duvara sabitlemek için dübeldir", ["Mantolama ve izolasyon levhalarının sabitlenmesi"]],
  [/dizlik/i, "yere çalışırken dizleri koruyan dizliktir", ["Fayans, parke ve zemin işleri"]],
  [/asma kilit/i, "asma kilittir", ["Kapı, depo, dolap ve ekipman kilitleme"]],
  [/kablolu makara|makara/i, "uzatma kablolu makaradır", ["Atölye ve şantiyede elektrik uzatma"]],
  [/high tack/i, "yüksek ilk tutunmalı yapıştırıcı mastiktir", ["Yapıştırma ve montaj işleri"]],
  [/ayak düz - ters|pinyon|spiral dişli|mors kovan|elmas çanak taş/i, "torna ve işleme tezgahları için aksesuar veya yedek parçadır", ["Torna aynası ve tezgah bakım, yedek parça işleri"]],
  [/\beld\.|eldiven/i, "el koruması için nitril eldivendir", ["Kimyasal, yağ ve kirli işlerde el koruma", "Atölye, bakım ve temizlik"]],
  [/cırt düz|cırt/i, "cırt cırtlı zımpara diskidir", ["Zımpara makinelerinde yüzey zımparalama"]],
  [/\bkablo\b/i, "kablo bağıdır", ["Kablo toplama ve sabitleme"]],
  [/çuval/i, "çuvaldır", ["Moloz ve malzeme taşıma, saklama"]],

  // ---- Ölçü aletleri
  [/dijital kumpas|dijital derinlik kumpas/i, "dijital göstergeli kumpastır", ["Parça dış/iç çap, derinlik ve uzunluk ölçümü", "Atölye, kalite kontrol ve imalat"], "Ölçüme başlamadan önce sıfırlama yapın."],
  [/saatli kumpas|kumpas|derinlik kump/i, "hassas uzunluk, çap ve derinlik ölçümü için kumpastır", ["Parça dış/iç çap ve derinlik ölçümü", "Atölye, tornacılık ve kalite kontrol"]],
  [/mikrometre/i, "hassas ölçüm için mikrometredir", ["Küçük toleranslı parçaların çap, kalınlık ve derinlik ölçümü", "İmalat ve kalite kontrol"]],
  [/yükseklik mihengir/i, "yükseklik ölçme ve işaretleme için mihengirdir", ["Tezgah üzerinde parça yüksekliği ölçümü ve çizgi işaretleme", "Kalite kontrol ve imalat"]],
  [/komparatör/i, "parçalardaki sapma ve salgıyı ölçen komparatör saatidir", ["Tezgah ve mil salgı kontrolü", "Parça yüzey ve ayar kontrolü"]],
  [/mastar|johnson|radius|diş tarağı|sentil|filler/i, "ölçü ve kontrol mastarıdır", ["Radius, diş ve aralık kontrolü", "İmalat ve kalite kontrol"]],
  [/gönye/i, "dik açı kontrolü ve işaretleme için gönyedir", ["Metal ve ahşap işlerinde dik açı kontrolü", "Atölye ve montaj"]],
  [/çelik cetvel/i, "çelik cetveldir", ["Hassas ölçüm ve çizim", "Atölye ve imalat"]],
  [/su terazi|terazi/i, "yüzey ve montaj düzgünlüğünü kontrol etmek için su terazisidir", ["Raf, kapı, pencere ve makine montajında düzlük kontrolü", "İnşaat, tadilat ve atölye"]],
  [/şerit metre/i, "ölçüm için şerit metredir", ["Şantiye, tadilat ve atölye ölçümü"]],
  [/prop|v yatağı|manyetik ayak|z sıfırlama/i, "ölçüm ve tezgah kurulumunda kullanılan yardımcı ekipmandır", ["Torna, freze ve ölçüm tezgahında parça tutma ve ayar"]],
  // ---- Matkap uçları
  [/sds (plus|max).*(matkap|elmaslı)|elmaslı sds|4 elmaslı sds/i, "beton, taş ve tuğla delmek için SDS saplı matkap ucudur", ["Kırıcı delici matkapla beton, taş, tuğla ve duvar delme", "Dübel ve montaj delikleri"], "SDS Plus ve SDS Max sap ölçüleri farklıdır; makinenizin mandrenine uygun ucu seçin."],
  [/sds.*(keski|murç)|keski ve murç/i, "kırıcı ve delici makineler için keski veya murç uçtur", ["Beton ve duvar kırma, yarma ve kanal açma"]],
  [/sds ağaç|sds kalıpçı/i, "SDS saplı özel matkap ucudur", ["SDS matkaplarla ahşap veya kalıp işlerinde delme"]],
  [/hss.*matkap|matkap ucu seti|morslu konik matkap|uzun din 340/i, "metal ve genel delme işleri için HSS (yüksek hız çeliği) matkap ucudur", ["Çelik, dökme demir, alüminyum ve ahşapta delme", "Atölye, bakım ve imalat"], "Delme sırasında soğutma sıvısı veya kesme yağı kullanmak uç ömrünü uzatır."],
  [/yaprak matkap|menteşe yeri/i, "ahşap ve panel işleri için özel matkap ucudur", ["Mobilya ve panel işlerinde geniş delik ve menteşe yeri açma"]],
  [/cam - seramik|cam seramik/i, "cam, seramik ve fayans delmek için üniversal matkap ucudur", ["Fayans, seramik, cam ve mermer yüzeylerde delme"], "Düşük devirde, hafif baskıyla çalışın."],
  [/kademeli matkap/i, "ince saç ve plastikte farklı çaplarda delik açan kademeli matkap ucudur", ["Saç, plastik ve ince metal yüzeylerde delme ve genişletme"]],
  [/havşa/i, "havşa açmak için kullanılan uçtur", ["Vida başının yüzeyle aynı seviyede kalmasını sağlayan havşa açma"]],
  [/tilki kuyruğu|dekupaj/i, "kesme işleri için testere ağzıdır", ["Ahşap, metal veya yapı malzemelerinde kesme"]],
  [/ahşap freze|alüminyum freze|freze ucu|freze/i, "freze ve talaşlı imalat için kesici takımdır", ["Torna ve freze tezgahlarında metal ve ahşap işleme"]],
  // ---- Panç / elmas / disk
  [/bi - metal panç|bi-metal panç|metal delme panç|tct/i, "metal ve sac delmek için kullanılan panç (delik açma testeresi) dir", ["Sac, boru ve profillerde geniş çaplı delik açma", "Pano, kanal ve tesisat işleri"], "Panç adaptörünü kullandığınız makineye uygun saplı seçin."],
  [/elmaslı beton delme panç|vakumlu mermer|mermer - granit panç|mermer -granit/i, "beton, mermer ve granit delmek için elmaslı panç (karot ucu) dur", ["Beton, mermer, granit ve seramikte geniş çaplı delik açma"], "Su ile soğutarak kullanmak ömrü artırır."],
  [/panç merkezleme|panç adap|buat açma panç|pprc/i, "panç ve delik açma işleri için yardımcı ekipmandır", ["Panç montajı, merkezleme ve adaptasyonu"]],
  [/elmas.*(testere|kesici|disk)|turbo elmas|granit kesme|beton kesme|asfalt kesme|elektrolize elmas|elmaslı taşlama/i, "beton, mermer, granit, seramik veya asfalt kesmek ve taşlamak için elmas disktir", ["Taş, beton, seramik ve asfalt kesme", "Taşlama ve yüzey hazırlama"], "Kesilecek malzemeye uygun segment tipini seçin."],
  [/flap disk/i, "taşlama ve yüzey düzeltme için flap disktir", ["Metal yüzeylerde taşlama, pas ve boya alma, kaynak yeri temizleme"]],
  [/cırtlı disk zımpara|cırt zımpara tabanı/i, "cırt cırtlı zımpara diski ve tabanı ürünüdür", ["Zımpara makinelerinde ahşap, boya ve metal yüzey zımparalama"]],
  [/inox kesici|metal kesme taş|metal taşlama|kesici taş|taşlama taşı/i, "metal kesme ve taşlama diskidir", ["Açılı taşlama makineleriyle metal ve inox kesme ve taşlama"], "Disk üzerindeki devir sınırını aşmayın ve koruyucu siperlik kullanın."],
  [/çanak fırça|daire fırça|kalem fırça|tel fırça|saçaklı|pimli|burgulu/i, "pas, boya ve kir temizlemek için çelik tel fırçadır", ["Metal yüzeylerde pas, kaynak cürufu ve boya temizleme", "Taşlama ve el motoru işlerinde yüzey hazırlama"], "Paslanmaz seçeneği, inox yüzeylerde kullanılır."],
  // ---- Bits / lokma
  [/bits|bit |uç seti|tornavida ucu/i, "vidalama için bits uç ve ek parçalardır", ["Akülü tornavida ve matkaplarla vidalama", "Montaj ve otomotiv işleri"], "Vida başının tipine (yıldız, pozi, tork, allen, düz) uygun uç seçin."],
  [/lokma|adaptör/i, "lokma, adaptör ve uzatma ekipmanıdır", ["Matkap ve vidalama makinelerine farklı uç ve lokma takma"]],
  // ---- Torna / CNC / mandren / pens
  [/torna aynası|hidrolik ayna|divizör/i, "torna ve CNC tezgahlarında parça bağlamak için ayna ekipmanıdır", ["Torna ve CNC tezgahlarında iş parçası bağlama"]],
  [/mandren|mors konik/i, "matkap mandreni veya bağlantı ekipmanıdır", ["Matkap ve tezgahlarda uç bağlama"]],
  [/pens|er \d+|oz \d+|bt 40|kılavuz adaptör|kılavuz çekme|pens montaj|çektirme civatası|er anahtar|er kapak|oz kapak/i, "CNC ve freze tezgahlarında takım bağlamak için pens ve bağlantı ekipmanıdır", ["CNC freze ve tezgahlarda kesici takım bağlama"]],
  [/kılavuz|pafta|helicoil/i, "diş açma ve diş tamiri için kılavuz, pafta veya yardımcı ekipmandır", ["Metal parçalarda iç (kılavuz) ve dış (pafta) diş açma", "Diş tamiri ve bakım işleri"], "Diş açarken kesme yağı kullanın."],
  [/torna kalemi|keski kalemi|patograf|punta|trapez keski/i, "torna ve işleme tezgahlarında kullanılan kesici kalem veya punta ucudur", ["Torna tezgahında metal işleme"]],
  [/mengene/i, "hassas iş parçası bağlamak için mengenedir", ["Freze, taşlama ve CNC işlerinde parça sabitleme"]],
  [/rakam|harf takımı|çizgi kalemi|manyetik kaldıraç|çapak|taş düzeltme|a - silindir|b -silindir|c - silindir|d - küre|e - oval|f - küre|g - sivri|h - alev|l - konik|m - konik|kalıp bağlama/i, "metal işleme ve atölye işleri için yardımcı ekipmandır", ["Atölye, kalıp ve imalat işleri"]],
  // ---- El aletleri / hava / genel
  [/tabanca|hava jakı|hava ve boya|mazot|gres tabanca|kompresör|lastik şişirme/i, "atölye ve tesisat işlerinde kullanılan tabanca veya hava ekipmanıdır", ["Silikon, gres, boya uygulama veya hava ile çalışma"]],
  [/maket bıçağı|temizleme bıçağı|cam kazıma/i, "kesme ve kazıma işleri için bıçaktır", ["Karton, plastik, boya ve cam yüzeylerde kesme ve kazıma"]],
  [/kaynak maskesi/i, "kaynak sırasında yüzü ve gözleri koruyan maskedir", ["Elektrik ve MIG/MAG kaynak işleri"]],
  [/led lamba|aydınlatma/i, "çalışma ve aydınlatma ürünüdür", ["Atölye ve şantiye aydınlatması"]],
  [/pvc boru kesme/i, "PVC boruları kesmek için makastır", ["Tesisat işlerinde PVC boru kesme"]],
  [/tokmak/i, "tokmaktır", ["Montaj ve şantiye işleri"]],
  [/mıknatıs/i, "mıknatıslı yardımcı ekipmandır", ["Atölyede metal parça tutma ve toplama"]],
  // ---- Dübel, bant, kablo (Made, Bantex, Tork...)
  [/çelik dübel|performance dübel|ağır yük dübeli|kalibre dübel|gaz beton dübel|turbolet|zamak turbolet/i, "ağır yük taşıyan bağlantılar için çelik veya metal dübeldir", ["Beton, tuğla ve gaz betonda ağır yük bağlama", "Raf, korkuluk ve tesisat askıları"]],
  [/plastik dübel|dübeli plastik çivi|tuğla boşluk|kanatlı alçıpan|alçıpan askı|izolasyon dübeli|sabitleme takozu/i, "duvara vida ve çivi sabitlemek için plastik dübeldir", ["Beton, tuğla ve alçıpan duvarlara hafif ve orta yük bağlama", "Askı, raf ve aksesuar montajı"]],
  [/kroşe/i, "askı ve bağlantı için çelik çivili kroşedir", ["Tavan ve duvar tesisat askıları"]],
  [/hortum kelepçe/i, "hortum ve boru bağlantılarını sıkan kelepçedir", ["Su, hava ve yakıt hortumu sabitleme"]],
  [/derz artısı/i, "fayans ve seramik döşemede derz aralığı bırakmak için artıdır", ["Fayans, seramik döşeme", "Eşit derz aralığı"]],
  [/çanta|organizer/i, "alet taşımak ve saklamak için çanta veya organizerdir", ["Alet ve parça saklama"]],
  [/kablo bağı|kablo kanalı|makaralı kablo/i, "kablo düzenleme ve bağlama ürünüdür", ["Elektrik ve tesisat işlerinde kablo toplama ve sabitleme"]],
  [/ikaz bandı|yer işaretleme|merdiven kaydırmaz/i, "uyarı ve işaretleme bandıdır", ["Zemin işaretleme, uyarı ve güvenlik"]],
  [/maskeleme|koruyucu örtü/i, "boya ve kaplama işlerinde yüzey korumak için maskeleme ürünüdür", ["Boyama sırasında yüzey ve kenar koruma"]],
  [/çift taraflı|köpük bant|akrilik silikonize/i, "iki yüzeyi birbirine yapıştıran çift taraflı banttır", ["Montaj, ayna ve süs yapıştırma"]],
  [/duck bant|folyo|pvc|izole|otocam|koli bandı|lifli|klima bandı|tüylü bant|teflon bant|bant/i, "yapıştırma, sızdırmazlık veya paketleme için banttır", ["Paketleme, yalıtım ve genel tamir işleri"]],
  [/menfez|baca kapağı|korniş|tampon|wc matik|dolap askı|stand|cam menfez/i, "yapı ve montaj işleri için aksesuardır", ["Tadilat ve montaj işleri"]],
  [/ayar pensesi/i, "ayarlı penseidir", ["Boru, somun ve genel montaj işleri"]],
  // ---- Zımpara, fırça, rulo, mala, spatula
  [/su zımpar|zımpara|zımp\./i, "yüzey zımparalamak için zımparadır", ["Ahşap, boya, macun ve metal yüzeyi pürüzsüzleştirme"], "Sıralı kum numaraları (düşükten yükseğe) ile çalışın."],
  [/rulo/i, "boya uygulamak için rulodur", ["İç ve dış cephe duvar ve tavan boyama", "Ev ve profesyonel boya işleri"]],
  [/boya fırça|kestirme|badana|robot|kalem fırça|yağlı boya/i, "boya ve badana işleri için fırçadır", ["Duvar, ahşap ve metal yüzeyleri boyama", "Kenar ve ince işler"]],
  [/çalı fırça|yer fırça|oto yıkama|çelik tel|kalorifer|gıda fırça/i, "temizlik ve yüzey işleri için fırçadır", ["Zemin, araç, kalorifer petekleri ve genel temizlik"]],
  [/yersil|camsil/i, "su toplama ve cam silme için aparattır", ["Cam ve zemin silme"]],
  [/spatula|kazıma|küreği|macun/i, "macun, alçı ve boya hazırlığı için spatula veya kürektir", ["Macun çekme, boya kazıma ve yüzey hazırlama"]],
  [/mala|sistre|alçı aletleri|derz mala|fayans tarağı|raspa/i, "sıva, alçı, seramik ve fayans işleri için mala veya takımdır", ["Sıva, alçı ve fayans uygulama"]],
  [/hışır örtü|kalın örtü|örtü/i, "boya ve tadilatta zemin ve eşya korumak için örtüdür", ["Boya ve tadilat sırasında koruma"]],
  [/sırık|aksesuar|junıor/i, "boya ve temizlik ekipmanının aksesuarıdır", ["Rulo ve fırça uzatma ve takma"]],
  [/elastik kova|lastik tokmak/i, "şantiye ve boya işleri için kova veya yardımcı ekipmandır", ["Malzeme taşıma ve karıştırma"]],
  // ---- Kimyasal
  [/silikon|mastik/i, "derz, çatlak ve birleşim yerlerini doldurmak ve sızdırmaz hale getirmek için mastik veya silikondur", ["Cam, doğrama, banyo, mutfak ve cephe derzleri", "Yapı ve tadilat işleri"], "Uygulama yüzeyi kuru ve temiz olmalıdır."],
  [/köpük temizleyici/i, "poliüretan köpük tabancası ve köpük artıklarını temizleyen spreydir", ["Köpük tabancası ve uygulama sonrası artık temizliği"]],
  [/pu köpük|mantolama köpüğü|köpük|köpük temizleyici/i, "dolgu, yalıtım ve montaj için poliüretan köpüktür", ["Kapı ve pencere kasası montajı, boşluk doldurma, mantolama yapıştırma"], "Boşlukları tamamen doldurmayın; köpük genleşir."],
  [/kimyasal d[uü]bel|polyester bazlı kimyasal|epoksi akrilat|nozzle|mikser/i, "kimyasal dübel (kimyasal ankraj) ürünüdür", ["Beton ve dolu yapı malzemelerine ankraj, donatı ve saplama bağlama", "Yüksek çekme yükü taşıyan bağlantılar"]],
  [/ms polimer/i, "MS polimer esaslı yapıştırıcı ve dolgu mastiğidir", ["Yapıştırma ve derz doldurma", "Farklı malzemelerde esnek bağlantı"]],
  [/water stop|membran|su yalıtım/i, "su yalıtımı için sıvı membran ürünüdür", ["Teras, banyo ve ıslak hacim su yalıtımı"]],
  [/epoksi.*(şırınga|yapıştırıcı)|epoksi genel|şırınga/i, "iki bileşenli epoksi yapıştırıcıdır", ["Metal, seramik, ahşap ve plastik parçaların yapıştırılması"]],
  [/derby yapıştırıcı|yapıştırıcı (teneke|galon)|evobond|502|twin gum|mdf|ninja/i, "yapıştırıcıdır", ["Genel yapıştırma ve montaj işleri"]],
  [/temizleyici|çok amaçlı tem/i, "temizlik amaçlı üründür", ["Atölye, şantiye ve ev temizliği"]],
  [/polikor|macun|astar|kaplama|pütür|polish|pasta/i, "oto, mobilya ve yüzey işleri için macun, astar veya cila ürünüdür", ["Karoser, mobilya ve yüzey düzeltme", "Boya öncesi hazırlık ve cilalama"]],
  // ---- İş güvenliği
  [/eldiven/i, "el koruması için nitril eldivendir", ["Kimyasal, yağ ve kirli işlerde el koruma", "Atölye, bakım ve temizlik"]],
  [/baret/i, "baş koruma için baret ürünüdür", ["Şantiye ve sanayide baş koruma"]],
  [/kulak tıkacı/i, "gürültüden korunmak için kulak tıkacıdır", ["Yüksek gürültülü ortamlarda işitme koruma"]],
  [/toz maskesi|ffp/i, "toz ve partiküllere karşı koruyucu maskedir", ["Toz yoğun ortamlarda solunum koruma"]],
  [/kalıp marka boyası/i, "kalıp ve parça işaretlemek için marka boyasıdır", ["İmalat ve kalıp işaretleme"]],
  // ---- Testere, akülü
  [/testere/i, "kesme işleri için testeredir", ["Ahşap, alüminyum veya yapı malzemesi kesme"]],
  [/akülü|matkap|vidalama|taşlama|kesme makine/i, "akülü elektrikli el aleti veya aksesuarıdır", ["Şantiye, atölye ve bakım işlerinde kablosuz çalışma"]],
  [/koli bantlama|bantlama makinas/i, "koli bantlama makinasıdır", ["Paketleme ve sevkiyat"]],
];

const MARKA_NOT = {
  Selsil: "Selsil ürünleri silikon, mastik, köpük ve yapıştırıcı gibi yapı kimyasalları sunar.",
  NP1: "NP1 ürünleri MS polimer yapıştırıcı ve mastik ile kimyasal dübel çözümlerini kapsar.",
  Stern: "Stern ürünleri silikon, köpük ve mastik gibi yapı kimyasalları sunar.",
  Polikor: "Polikor ürünleri macun, astar, kaplama ve cila gibi yüzey işleri çözümleri sunar.",
  Derby: "Derby, yapıştırıcı ürün grubunu sunar.",
  Made: "Made ürünleri dübel, kelepçe, bağlantı elemanı ve montaj aksesuarlarını kapsar.",
  Bantex: "Bantex ürünleri maskeleme, koli, çift taraflı, izole ve işaretleme bantları sunar.",
  "Yılsan": "Yılsan ürünleri boya fırçası, rulo, mala ve temizlik fırçaları sunar.",
  Dekor: "Dekor ürünleri mala, spatula, şerit metre ve inşaat el aletleri sunar.",
  Atlas: "Atlas ürünleri zımpara ve yüzey işleme ürünleri sunar.",
  GFB: "GFB ürünleri ölçü aletleri, matkap uçları, panç, elmas kesici ve CNC kesici takımları kapsar.",
  "GFB XPRO": "GFB XPRO, darbeli tornavida uçları ve bits uzatma ürünlerini sunar.",
  Tork: "Tork, kablo bağı ürünlerini sunar.",
  "Haıs": "Haıs, akülü el aletleri ve aksesuarlarını sunar.",
  Kupa: "Kupa; kilit, su terazisi ve el aleti ürünlerini sunar.",
};

const kucuk = (s) => String(s).replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
const uret = (ad, marka, r) => ({
  ozet: `${ad}, ${marka === "Diğer" ? "" : marka + " markasının "}${r[1]}.`.replace(/\s+/g, " "),
  kullanim: r[2],
  ...(r[3] ? { ipucu: r[3] } : {}),
});

let aileEklenen = 0, urunEklenen = 0, eslesmeyen = [];
const goruldu = new Set();
for (const u of veri.urunler) {
  if (u.m === "Best") continue;
  if (u.fa) {
    if (goruldu.has(u.fa) || acik.aileler[u.fa]) continue;
    goruldu.add(u.fa);
    const baslik = veri.aileAd[u.fa] || u.a;
    const bk = kucuk(baslik), r = K.find(([d]) => d.test(bk)) || K.find(([d]) => d.test(bk + " " + kucuk(u.a)));
    if (r) { acik.aileler[u.fa] = uret(baslik, u.m, r); aileEklenen++; } else eslesmeyen.push(`${u.m}: ${baslik}`);
  } else if (!acik.urunler[u.s]) {
    const r = K.find(([d]) => d.test(kucuk(u.a)));
    if (r) { acik.urunler[u.s] = uret(u.a, u.m, r); urunEklenen++; } else eslesmeyen.push(`${u.m}: ${u.a}`);
  }
}
for (const [m, t] of Object.entries(MARKA_NOT)) acik.markalar[m] = t;
await writeFile(dosya, JSON.stringify(acik, null, 2) + "\n", "utf8");
console.log(`aile: ${aileEklenen}  tek ürün: ${urunEklenen}  eşleşmeyen: ${eslesmeyen.length}`);
if (eslesmeyen.length) console.log(eslesmeyen.join("\n"));
