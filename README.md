# Tasarruf Finansmanı

Bu proje, tasarruf finansmanı tekliflerini ve banka kredisi alternatifini bugünkü değer mantığıyla değerlendiren bir finansal karar destek arayüzüdür.

## Ana yapı

- `/`
  - ana hesaplayıcı
  - kredi limit modülü
  - veri / içerik blokları
- `/teklifleri-karsilastir`
  - iki teklifi yan yana karşılaştıran karar destek sayfası
- `/veri`
  - piyasa verisi ve endeks sayfası
- `/kredi-test`
  - referans HTML kredi matematiği ile proje motorunu yan yana test eden sayfa

## Compare sayfası hangi dosyalara bağlı

- `C:\Users\PC\Desktop\tasarrufinansman\app\teklifleri-karsilastir\page.tsx`
- `C:\Users\PC\Desktop\tasarrufinansman\components\OfferComparisonPage.tsx`
- `C:\Users\PC\Desktop\tasarrufinansman\lib\comparisonEngine.ts`
- `C:\Users\PC\Desktop\tasarrufinansman\lib\loanEngine.ts`

## Kredi test alanı hangi dosyalara bağlı

- `C:\Users\PC\Desktop\tasarrufinansman\app\kredi-test\page.tsx`
- `C:\Users\PC\Desktop\tasarrufinansman\components\LoanMathTestPage.tsx`
- `C:\Users\PC\Desktop\tasarrufinansman\lib\loanEngine.ts`

## Hesap motoru nasıl çalışıyor

Compare sayfasında UI yalnızca kullanıcı girdilerini toplar. Finansal hesap mantığı iki katmanda çalışır:

1. `lib/comparisonEngine.ts`
   - teklif bazlı tasarruf finansmanı hesapları
   - NBM kırılımı
   - teslim senaryoları
   - risk ve karar skoru
   - nakit akışı tabloları
2. `lib/loanEngine.ts`
   - banka kredisi PMT / ödeme planı / efektif maliyet hesapları
   - KKDF ve BSMV toplamları
   - net ele geçen kredi
   - toplam kredi maliyeti
   - referans HTML matematiği ile proje motoru arasındaki fark analizi

UI tarafı hesap yapmaz; yalnızca bu motorlardan dönen sonucu render eder.

## NBM nasıl hesaplanıyor

Aylık indirgeme oranı:

`monthlyDiscountRate = Math.pow(1 + annualInflationRate / 100, 1 / 12) - 1`

Bugünkü değer:

`PV = amount / Math.pow(1 + monthlyDiscountRate, month)`

Toplam NBM:

- Peşinat PV
- Hizmet bedeli PV
- Taksitler PV
- Kira PV

`Toplam NBM = peşinat PV + hizmet bedeli PV + taksitler PV + kira PV`

## Karar skoru nasıl hesaplanıyor

Çekilişli modelde üç senaryo üretilir:

- iyi senaryo
- ortalama senaryo
- kötü senaryo

Risk:

`risk = standardDeviation(nbmValues)`

Gecikme maliyeti:

`delayCost = Math.max(0, badDelivery - averageDelivery) * currentMonthlyRent`

Risk cezası:

`riskPenalty = risk * riskWeight * companyRiskFactor`

Karar skoru:

`decisionScore = averageNBM + riskPenalty + delayCost`

## Şirket parametreleri nereden geliyor

Şirket parametreleri `lib/comparisonEngine.ts` içindeki `companyParams` nesnesinden gelir.

Her şirket için:

- `defaultServiceFeeRate`
- `deliverySpeedFactor`
- `riskFactor`
- `campaignDiscountRate`
- `notes`

alanları tanımlıdır.

Not:
Bu değerler şu an varsayılan tahmini parametrelerdir. Gerçek firma verileri geldiğinde aynı yapı üzerinden güncellenebilir.

## Banka kredisi matematiği

`lib/loanEngine.ts` içindeki ana formüller:

- vergili aylık oran:
  - `effectiveMonthlyRate = nominalRate * (1 + (BSMV + KKDF) / 100)`
- annüite taksit:
  - `payment = principal * rate * (1 + rate)^term / ((1 + rate)^term - 1)`
- toplam taksit ödemesi:
  - `totalInstallmentPayment = payment * term`
- düzeltilmiş toplam geri ödeme:
  - `totalRepayment = totalInstallmentPayment + fee`
- referans HTML toplam geri ödeme:
  - `referenceTotalRepayment = totalWithInterest + fee`
- toplam kredi maliyeti:
  - `totalCreditCost = totalRepayment - netDisbursed`
- efektif aylık maliyet:
  - `solveRateByIRR(term, payment, netDisbursed)`
- efektif yıllık maliyet:
  - `Math.pow(1 + monthlyCostRate, 12) - 1`

## /kredi-test nasıl kullanılır

1. Sayfayı aç:
   - `/kredi-test`
2. Bir kredi preset’i seç:
   - Konut - Evi Olmayan
   - Konut - Evi Olan
   - Taşıt
   - İhtiyaç
3. İstersen anapara, vade, aylık faiz, masraf, BSMV ve KKDF değerlerini değiştir.
4. Sol sütunda referans HTML matematiği, sağ sütunda proje motoru görünür.
5. Alt tabloda fark analizi ve ödeme planı farkları izlenir.

## Referans HTML ile proje motoru arasındaki fark nasıl okunur

Yan yana fark analizinde:

- `OK`
  - fark tolerans içindedir
- `Kontrol Et`
  - fark tolerans dışındadır

Tolerans:

- parasal değerler: `0.05 TL`
- yüzdesel değerler: `0.0001`

## Bilinçli farklılıklar

Referans HTML ile proje motoru arasındaki en önemli bilinçli fark:

- referans HTML:
  - `Toplam Geri Ödeme = Toplam Faizli Geri Ödeme + Masraf`
- proje motoru:
  - `Toplam Geri Ödeme = Toplam Taksit Ödemesi + Masraf`

Bu yüzden `/kredi-test` sayfası yalnızca birebir eşleşmeyi değil, bilinçli finansal farkı da görünür kılar.

## Bilinen eksikler

- `InteractionScript.tsx` içinde compare ile ilgili kullanılmayan eski yardımcı fonksiyonlar hâlâ dosyada duruyor; compare sayfası artık bunlara bağlı değil.
- Şirket parametreleri gerçek veri değil, tahmini başlangıç parametreleri.
- CSV export sağlam, gerçek `.xlsx` export henüz yok.
- Ana sayfa kredi kıyas paneli henüz `loanEngine` detay çıktılarının tamamını göstermiyor.

## Çalıştırma

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```
