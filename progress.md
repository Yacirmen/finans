# Project Progress

Last updated: 2026-04-24  
Project root: `C:\Users\PC\Desktop\tasarrufinansman`

## 1. Şu ana kadar yapılanlar

- Ana site akışı oturdu:
  - `Header`
  - `Hero`
  - `Kredi Limit Modülü`
  - `Tasarruf Finansmanı Maliyet Hesaplayıcısı`
  - `SSS`
  - `Blog`
  - `Footer`
- `/veri` sayfası canlı ve ana tasarım diliyle uyumlu.
- `/teklifleri-karsilastir` sayfası artık ayrı route olarak çalışıyor.
- Compare sayfası UI maketi olmaktan çıkarılıp tek motorlu karar destek ekranına dönüştürüldü.
- Compare hesapları artık `lib/comparisonEngine.ts` üzerinden çalışıyor.
- Banka kredisi kıyası `lib/loanEngine.ts` ile güçlendirildi.
- Sonuç kartlarında NBM kırılımı, risk ve banka kredisi farkı görünür hale getirildi.
- Nakit akışı tabloları teklif bazında üretiliyor ve CSV export veriyor.
- Şirket bazlı tahmini parametre sistemi kuruldu.

## 2. Hangi dosyalarda ne değişti

### Route / sayfa dosyaları

- `C:\Users\PC\Desktop\tasarrufinansman\app\layout.tsx`
  - Metadata Türkçesi düzeltildi.
  - Global `InteractionScript` tek noktada kaldı.
- `C:\Users\PC\Desktop\tasarrufinansman\app\veri\page.tsx`
  - Türkçe karakterler düzeltildi.
- `C:\Users\PC\Desktop\tasarrufinansman\app\teklifleri-karsilastir\page.tsx`
  - Compare route temiz fallback ile korunuyor.

### Bileşenler

- `C:\Users\PC\Desktop\tasarrufinansman\components\Header.tsx`
  - Header metinleri temizlendi.
  - Compare CTA düzgün Türkçe ile korundu.
- `C:\Users\PC\Desktop\tasarrufinansman\components\OfferComparisonPage.tsx`
  - Tam React kontrollü compare sayfası kuruldu.
  - Sonuç kartları, karar özeti ve kredi ödeme planı eklendi.
- `C:\Users\PC\Desktop\tasarrufinansman\components\InteractionScript.tsx`
  - Compare DOM fallback başlangıcı no-op hale getirildi.
  - Compare sayfası artık bu script’e bağlı değil.

### Motor / hesap katmanı

- `C:\Users\PC\Desktop\tasarrufinansman\lib\loanEngine.ts`
  - Yeni oluşturuldu.
  - PMT, vergili aylık faiz, schedule, IRR/RATE, efektif yıllık maliyet burada.
- `C:\Users\PC\Desktop\tasarrufinansman\lib\comparisonEngine.ts`
  - Baştan yazıldı.
  - Teklif motoru, NBM, risk, gecikme maliyeti, şirket parametreleri ve loanEngine bağlantısı burada.

### Dokümantasyon

- `C:\Users\PC\Desktop\tasarrufinansman\README.md`
  - Hesap motoru ve compare akışı güncellendi.
- `C:\Users\PC\Desktop\tasarrufinansman\progress.md`
  - Bu dosya güncellendi.

## 3. Sayfada çalışan özellikler

### Ana sayfa

- Header linkleri çalışıyor.
- Hero CTA’ları çalışıyor.
- Kredi limit modülü çalışıyor:
  - Konut
  - Taşıt
  - İhtiyaç
- Ana hesaplayıcı çalışıyor.
- Banka kredisi kıyas paneli çalışıyor.

### Teklifleri Karşılaştır sayfası

- `Konut / Araba` seçimi çalışıyor.
- `Teklif 1 / Teklif 2` bağımsız state ile çalışıyor.
- `Çekilişsiz / Çekilişli` seçimleri çalışıyor.
- Şirket seçimi sonucu etkiliyor:
  - hizmet bedeli varsayılanı
  - teslim hızı
  - risk cezası
  - kampanya indirimi
- Düz plan çalışıyor.
- Artışlı plan çalışıyor.
- Manuel plan çalışıyor.
- Teslim ayı kira etkisini değiştiriyor.
- Kredi kıyası aktif/pasif çalışıyor.
- `TÜM TEKLİFLERİ HESAPLA` sonucu üretiyor.
- Kazanan teklif otomatik vurgulanıyor.
- Çekilişli teklif için iyi / ortalama / kötü senaryo üretiliyor.
- NBM kırılımı gösteriliyor:
  - Peşinat PV
  - Hizmet bedeli PV
  - Taksitler PV
  - Kira PV
  - Toplam NBM
- Karar skoru gösteriliyor.
- Risk seviyesi gösteriliyor.
- Karar yorumu gösteriliyor.
- Banka kredisi için ödeme planı tablosu gösteriliyor.
- Nakit akışı tablosu teklif bazında oluşuyor.
- CSV export çalışıyor.

## 4. Eksik kalan özellikler

- `InteractionScript.tsx` içindeki compare’a ait eski yardımcı fonksiyonlar dosyada duruyor; çağrılmıyor ama fiziksel temizlik yapılmalı.
- Şirket parametreleri şu an tahmini.
- `.xlsx` export yok; CSV sağlam çalışıyor.
- Ana sayfa kredi kıyas paneli henüz `loanEngine` detay çıktılarının tamamını göstermiyor.
- Compare sayfasında input maskeleme ve sayı formatlama UX’i daha da rafine edilebilir.

## 5. Bilinen buglar

- Workspace içinde geçici dosyalar duruyor:
  - `.tmp-chrome*`
  - `tmp_compare.xlsx`
- Eski bileşenlerde tek tük mojibake kalıntısı olabilir; compare sayfası ve ana hedef dosyalar temizlendi.

## 6. Hesap motorunda şu an kullanılan formüller

### Aylık indirgeme oranı

`monthlyDiscountRate = Math.pow(1 + annualInflationRate / 100, 1 / 12) - 1`

### Bugünkü değer

`PV = amount / Math.pow(1 + monthlyDiscountRate, month)`

### Düz plan

`installment = baseMonthlyPayment`

### Artışlı plan

`installment = baseMonthlyPayment * Math.pow(1 + yearlyIncrease / 100, Math.floor((month - 1) / 12))`

### Manuel plan

- kullanıcı değerleri satır satır veya virgülle girer
- eksik aylar son değer ile doldurulur
- tamamen hatalıysa düz plan fallback olur

### Kira motoru

- teslim ayına kadar kira oluşur
- teslimden sonra kira `0`
- her 12 ayda enflasyon kadar artar

### Hizmet bedeli

`serviceFeeAmount = assetPrice * (serviceFeeRate / 100)`

### NBM

`NBM = peşinat PV + hizmet bedeli PV + taksitler PV + kira PV`

### Çekilişli senaryo seti

- iyi teslim:
  - `goodDelivery = Math.max(1, Math.round(expectedDelivery * 0.6 * deliverySpeedFactor))`
- ortalama teslim:
  - `averageDelivery = expectedDelivery`
- kötü teslim:
  - `badDelivery = Math.min(term, Math.round(expectedDelivery * (1.4 + Math.max(riskFactor - 1, 0) * 0.25)))`

### Risk

`risk = standardDeviation(nbmValues)`

### Gecikme maliyeti

`delayCost = Math.max(0, badDelivery - averageDelivery) * currentMonthlyRent`

### Karar skoru

`decisionScore = averageNBM + riskPenalty + delayCost`

`riskPenalty = risk * riskWeight * companyRiskFactor`

### Banka kredisi

- vergili aylık faiz:
  - `effectiveMonthlyRate = nominalRate * (1 + (BSMV + KKDF) / 100)`
- annüite taksit:
  - `payment = principal * rate * (1 + rate)^term / ((1 + rate)^term - 1)`
- toplam taksit ödemesi:
  - `totalInstallmentPayment = payment * term`
- toplam geri ödeme:
  - `totalRepayment = totalInstallmentPayment + fee`
- toplam kredi maliyeti:
  - `totalCreditCost = totalRepayment - netDisbursed`
- efektif aylık maliyet:
  - `solveRateByIRR(term, payment, netDisbursed)`
- efektif yıllık maliyet:
  - `Math.pow(1 + monthlyCostRate, 12) - 1`

## 7. Devam etmek için önerilen sıradaki adımlar

1. `InteractionScript.tsx` içindeki compare’a ait ölü kodu tamamen kaldır.
2. Ana sayfa banka kıyas panelini `loanEngine` ile aynı detay seviyesine çıkar.
3. Şirket parametrelerini gerçek veriyle besle.
4. Input formatlama ve validation UX’ini daha profesyonel hale getir.
5. CSV yanında gerçek `.xlsx` export ekle.
6. Geçici dosyaları çalışma klasöründen temizle.

## 8. Test edilen senaryolar

- Düz çekilişsiz plan
- Artışlı taksitli plan
- Manuel plan
- Çekilişli iyi / ortalama / kötü senaryo
- Geç teslim kaynaklı kira maliyeti
- Yüksek hizmet bedelli teklif
- Banka kredisi kıyası açık / kapalı
- Farklı şirket seçimi ile sonuç değişimi
- Kredi ana para / masraf / efektif maliyet hesapları

