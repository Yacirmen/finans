export type BlogPost = {
  slug: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  sourceUrl: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "kira-artisi-hesaplama",
    date: "Nisan 2026",
    category: "Kira",
    title: "Kira artışı nasıl hesaplanır ve bütçeye etkisi nasıl okunur?",
    excerpt:
      "Kira artış oranı sadece yeni kira bedelini değil, finansman kararındaki bekleme maliyetini de değiştirir.",
    sourceUrl:
      "https://teklifimgelsin.com/kredi/konut-kredisi/hesaplama/kira-artisi-hesaplama",
    sections: [
      {
        heading: "Kira artışı neden finansman kararını etkiler?",
        body:
          "Tasarruf finansmanı tekliflerinde teslim ayı geciktikçe kirada kalınan dönem uzar. Bu yüzden kira artışı, görünen taksit maliyetinden ayrı olarak toplam bugünkü maliyeti etkileyen kritik bir kalemdir.",
      },
      {
        heading: "Hesaplama yaklaşımı",
        body:
          "Mevcut kira, artış oranı ve beklenen teslim süresi birlikte okunmalıdır. Kira her 12 ayda yeni seviyeye taşındığında, teslim öncesi toplam kira yükü karar skorunda açıkça görünür hale gelir.",
      },
      {
        heading: "Karar notu",
        body:
          "Düşük taksitli bir teklif, teslim tarihi uzadığı için yüksek kira maliyeti doğurabilir. Bu nedenle teklifleri sadece aylık ödeme üzerinden değil, kira etkisiyle birlikte karşılaştırmak gerekir.",
      },
    ],
  },
  {
    slug: "emlak-konut-kampanyasi",
    date: "Aralık 2025",
    category: "Konut",
    title: "Emlak Konut kampanyaları ödeme planında nasıl değerlendirilir?",
    excerpt:
      "Kampanyalı konut finansmanı incelenirken peşinat, vade, teslim tarihi ve toplam geri ödeme aynı tabloda görülmelidir.",
    sourceUrl: "https://teklifimgelsin.com/kredi/konut-kredisi/emlak-konut-kampanyasi",
    sections: [
      {
        heading: "Kampanya oranı tek başına yeterli değildir",
        body:
          "Konut kampanyalarında düşük oran veya esnek ödeme vurgusu cazip görünebilir. Ancak başlangıç çıkışı, ara ödeme, vade ve toplam geri ödeme birlikte hesaplanmadan gerçek maliyet netleşmez.",
      },
      {
        heading: "Bugünkü değerle okuma",
        body:
          "Farklı vadeler ve ödeme ritimleri bugünkü değere indirgenerek karşılaştırıldığında, hangi seçeneğin nakit akışı açısından daha sağlıklı olduğu daha net görünür.",
      },
      {
        heading: "Kontrol listesi",
        body:
          "Sözleşme öncesinde teslim koşulu, ödeme artışı, masraf kalemleri ve kampanya sonrası yükümlülükler ayrı ayrı kontrol edilmelidir.",
      },
    ],
  },
  {
    slug: "togg-tasit-kredisi",
    date: "Nisan 2026",
    category: "Taşıt",
    title: "TOGG taşıt kredisi seçeneklerinde vade ve kredi limiti nasıl okunur?",
    excerpt:
      "Taşıt kredilerinde model fiyatı, kredi limiti, faiz ve vade birlikte değiştiği için aylık taksit tek başına karar verdirmez.",
    sourceUrl: "https://teklifimgelsin.com/kredi/tasit-kredisi/togg-tasit-kredisi",
    sections: [
      {
        heading: "Taşıt değerine göre kredi limiti",
        body:
          "Araç finansmanında kullanılabilecek kredi oranı, aracın değer bandına göre değişebilir. Bu nedenle aynı araç için peşinat ihtiyacı ve vade sınırı birlikte değerlendirilmelidir.",
      },
      {
        heading: "Kampanyalı oranları karşılaştırma",
        body:
          "Bazı modellerde dönemsel kampanya oranları öne çıkabilir. Karar verirken faiz oranının yanında toplam ödeme, dosya masrafı ve vade sonu yükü de hesaplanmalıdır.",
      },
      {
        heading: "Tasarruf finansmanı ile farkı",
        body:
          "Taşıt için kredi ve tasarruf finansmanı karşılaştırılırken hızlı teslim avantajı, faiz yükü, taksit esnekliği ve toplam nakit çıkışı aynı zeminde incelenmelidir.",
      },
    ],
  },
];
