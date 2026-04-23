export const sourceCatalog = [
  { name: "Konut ve iş yeri satış istatistikleri", period: "Aylık", institution: "TÜİK", url: "https://veriportali.tuik.gov.tr/tr/press/58342", note: "Aylık manuel güncelleme" },
  { name: "Haftalık kredi ve mevduat gelişmeleri", period: "Haftalık", institution: "TCMB", url: "https://www.sbb.gov.tr/mali-piyasalar/", note: "Ortalama faiz görünümü" },
  { name: "Konut ve taşıt kredileri", period: "Haftalık", institution: "BDDK", url: "https://www.bddk.org.tr/bultenhaftalik", note: "Konut/taşıt kredi hacmi" },
  { name: "TÜFE", period: "Aylık/Yıllık", institution: "TCMB", url: "https://evds3.tcmb.gov.tr/charts/portlet/Njk2Zjc5NmQ2MTZmNzcyMGUxNGQzZTg0/tr", note: "Dış bağlantı" },
  { name: "Otomobil satış adetleri", period: "Aylık", institution: "ODMD", url: "https://www.odmd.org.tr/web_2837_1/neuralnetwork.aspx?type=36", note: "Manuel aylık güncelleme" },
  { name: "Konut fiyat endeksi", period: "Aylık", institution: "TCMB", url: "https://evds3.tcmb.gov.tr/charts/portlet/Njk2ZmRhNWViYjU5ZWMxOTViZjJiODVh/tr", note: "Dış bağlantı" },
  { name: "Tüketici güven endeksi", period: "Aylık", institution: "TÜİK", url: "https://veriportali.tuik.gov.tr/tr/press/58173", note: "Piyasa duyarlılığı" },
  { name: "İnşaat maliyetleri endeksi", period: "Aylık", institution: "TÜİK", url: "https://veriportali.tuik.gov.tr/tr/databrowser/tuik/categories/6/6_8/TR,DF_UFE_INSAAT,1.0", note: "Manuel aylık güncelleme" },
  { name: "Konut istatistikleri", period: "Aylık", institution: "TÜİK", url: "https://nip.tuik.gov.tr/?value=KonutIstatistikleri", note: "Sahiplik oranı" },
  { name: "TCMB fonlama faizi", period: "Günlük", institution: "TCMB", url: "https://evds3.tcmb.gov.tr/charts/portlet/Njk2ZmU2Yzk2MTZmNzcyMGUxNGQzZWQz/tr", note: "Dış bağlantı" },
  { name: "Yabancı para mevduatlar", period: "Haftalık", institution: "TCMB", url: "https://evds3.tcmb.gov.tr/charts/portlet/Njk3MjFkODlmYTZlZDc0NGFhNzVjMWQy/tr", note: "Kur talebi göstergesi" },
  { name: "Kapasite kullanım oranı", period: "Haftalık", institution: "TCMB", url: "https://evds3.tcmb.gov.tr/charts/portlet/Njk2ZmU2NWU5NzdlZDExMDI0MjhkYWYy/tr", note: "Makro aktivite" },
  { name: "Beklenen enflasyon", period: "Haftalık", institution: "TCMB", url: "https://evds3.tcmb.gov.tr/charts/portlet/Njk2ZmViODM5NzdlZDExMDI0MjhkYjIy/tr", note: "12 ve 24 ay beklenti" },
  { name: "Geçmiş getiri verileri", period: "Direkt", institution: "Finansal Okuryazarlık", url: "https://finansalokuryazarlik.gov.tr/gecmis-getiri-verileri", note: "Karşılaştırma tablosu" },
  { name: "Altın ons", period: "Günlük", institution: "Piyasa", url: "", note: "Manuel ekran/veri" },
  { name: "USD / EUR", period: "Günlük", institution: "TCMB", url: "https://evds3.tcmb.gov.tr/tumSeriler/2501/bie_dkdovytl", note: "Kur göstergesi" },
  { name: "m2 başına ortalama kira", period: "Belirsiz", institution: "Endeksa", url: "https://www.endeksa.com/tr/analiz/turkiye/endeks/kiralik/konut", note: "Kira baskısı" },
  { name: "CDS", period: "Günlük", institution: "Investing", url: "https://tr.investing.com/rates-bonds/turkey-cds-5-year-usd-historical-data", note: "Risk primi" },
  { name: "Reel faiz", period: "Hesaplama", institution: "Model", url: "", note: "Faiz - enflasyon yaklaşımı" },
];

export const currentIndicators = [
  { name: "Konut Kredi Faizi", value: 36.5, unit: "%", description: "Güncel" },
  { name: "Taşıt Kredi Faizi", value: 43.2, unit: "%", description: "Güncel" },
  { name: "Mevduat Faizi", value: 47, unit: "%", description: "Güncel" },
  { name: "Konut Kredisi Değişimi", value: 11.7, unit: "%", description: "Yıl başından bu yana" },
  { name: "Taşıt Kredisi Değişimi", value: -11.1, unit: "%", description: "Yıl başından bu yana" },
  { name: "TÜFE", value: 30.87, unit: "%", description: "Yıllık" },
  { name: "Otomobil Satış Adetleri", value: -5, unit: "%", description: "Yıllık" },
  { name: "Konut Fiyat Endeksi", value: 26.4, unit: "%", description: "Yıllık" },
  { name: "Tüketici Güven Endeksi", value: 85.5, unit: "", description: "Aylık" },
  { name: "İnşaat Maliyetleri Endeksi", value: 25.72, unit: "%", description: "Aylık" },
  { name: "Ev Sahiplik Oranı", value: 60.7, unit: "%", description: "Güncel" },
  { name: "TCMB Ortalama Fonlama", value: 40, unit: "%", description: "Güncel" },
  { name: "Yabancı Para Mevduatlar", value: 6.36, unit: "%", description: "Yıl başından bu yana" },
  { name: "Kapasite Kullanım Oranı", value: 74, unit: "%", description: "Aylık" },
  { name: "Beklenen Enflasyon", value: 23.39, unit: "%", description: "12 aylık" },
  { name: "Altın Ons", value: 4709.91, unit: "$", description: "Güncel" },
  { name: "USD", value: 44.58, unit: "TL", description: "Güncel" },
  { name: "EUR", value: 52.04, unit: "TL", description: "Güncel" },
  { name: "m2 Ortalama Kira", value: 23.6, unit: "%", description: "Yıllık" },
  { name: "CDS", value: 233.12, unit: "", description: "Güncel" },
  { name: "Reel Faiz", value: 9.13, unit: "%", description: "Güncel" },
];

export const financingIndex = {
  title: "Konut Kredisi mi, Tasarruf Finansman mı Endeksi",
  score: 47.524419277724355,
  season: "Geçiş / Kararsız Dönem",
  creditScore: 40.329805996472665,
  riskScore: 53.64458257958259,
  housingScore: 49.402709359605915,
  updatedLabel: "Haftalık güncelleme modülü",
};

export const topIndexDrivers = [
  { name: "TÜFE", group: "Risk", rawScore: 70.19, weight: 0.1, impact: 7.02, comment: "Kredi lehine" },
  { name: "Konut Kredi Faizi", group: "Kredi", rawScore: 38.57, weight: 0.18, impact: 6.94, comment: "Tasarruf lehine" },
  { name: "Beklenen Enflasyon", group: "Risk", rawScore: 73.22, weight: 0.08, impact: 5.86, comment: "Kredi lehine" },
  { name: "Reel Faiz", group: "Kredi", rawScore: 68.94, weight: 0.07, impact: 4.83, comment: "Kredi lehine" },
  { name: "Tüketici Güven Endeksi", group: "Konut", rawScore: 65, weight: 0.06, impact: 3.9, comment: "Nötr" },
  { name: "İnşaat Maliyetleri Endeksi", group: "Konut", rawScore: 67.85, weight: 0.05, impact: 3.39, comment: "Kredi lehine" },
  { name: "TCMB Ortalama Fonlama", group: "Risk", rawScore: 40, weight: 0.08, impact: 3.2, comment: "Tasarruf lehine" },
  { name: "Konut Fiyat Endeksi", group: "Konut", rawScore: 33, weight: 0.08, impact: 2.64, comment: "Tasarruf lehine" },
];

export const housingSales = [
  { period: "2026-03", total: 113367, firstHand: 35725, secondHand: 77642, mortgaged: 25978, mortgagedShare: 22.9, other: 87389 },
  { period: "2026-02", total: 124549, firstHand: 37785, secondHand: 86764, mortgaged: 25035, mortgagedShare: 20.1, other: 99514 },
  { period: "2026-01", total: 111480, firstHand: 34069, secondHand: 77411, mortgaged: 20263, mortgagedShare: 18.2, other: 91217 },
  { period: "2025-12", total: 265223, firstHand: 101721, secondHand: 163502, mortgaged: 30604, mortgagedShare: 11.5, other: 234619 },
  { period: "2025-11", total: 146989, firstHand: 49174, secondHand: 97815, mortgaged: 22523, mortgagedShare: 15.3, other: 124466 },
  { period: "2025-10", total: 170955, firstHand: 57675, secondHand: 113280, mortgaged: 24684, mortgagedShare: 14.4, other: 146271 },
  { period: "2025-09", total: 156918, firstHand: 49608, secondHand: 107310, mortgaged: 22264, mortgagedShare: 14.2, other: 134654 },
  { period: "2025-08", total: 149440, firstHand: 46459, secondHand: 102981, mortgaged: 20646, mortgagedShare: 13.8, other: 128794 },
];

export const creditRows = [
  { name: "Toplam Krediler", latest: 25124221.63, weekly: 0.89, ytd: 9.82, yearly: 139.58 },
  { name: "Tüketici Kredileri + BKK", latest: 6204779.08, weekly: 0.54, ytd: 11.3, yearly: 147.3 },
  { name: "Tüketici Kredileri", latest: 3172011.91, weekly: 0.4, ytd: 10.09, yearly: 143.73 },
  { name: "Konut", latest: 752738, weekly: 0.76, ytd: 11.7, yearly: 136.43 },
  { name: "Taşıt", latest: 45607.35, weekly: -1.21, ytd: -11.14, yearly: 70.08 },
  { name: "İhtiyaç", latest: 2373666.56, weekly: 0.32, ytd: 10.09, yearly: 149.28 },
  { name: "Bireysel Kredi Kartları", latest: 3032767.18, weekly: 0.69, ytd: 12.59, yearly: 151.24 },
  { name: "Taksitli Kart", latest: 1149090.83, weekly: 0.44, ytd: 14.7, yearly: 168.25 },
];

export const autoTopBrands = [
  { brand: "Renault", q1_2025: 30332, q1_2026: 34244, change: 12.9 },
  { brand: "Toyota", q1_2025: 17776, q1_2026: 23982, change: 34.9 },
  { brand: "Fiat", q1_2025: 22046, q1_2026: 22748, change: 3.2 },
  { brand: "Volkswagen", q1_2025: 20041, q1_2026: 19166, change: -4.4 },
  { brand: "Peugeot", q1_2025: 19602, q1_2026: 18049, change: -7.9 },
  { brand: "Ford", q1_2025: 21767, q1_2026: 17267, change: -20.7 },
  { brand: "Hyundai", q1_2025: 15125, q1_2026: 15030, change: -0.6 },
  { brand: "Opel", q1_2025: 15349, q1_2026: 14451, change: -5.9 },
  { brand: "Citroen", q1_2025: 12870, q1_2026: 14140, change: 9.9 },
  { brand: "Togg", q1_2025: 3708, q1_2026: 9419, change: 154 },
];

export const autoTotals = { q1_2025: 275151, q1_2026: 262728, change: -4.51 };
