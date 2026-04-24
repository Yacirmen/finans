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

## Compare sayfası hangi dosyalara bağlı

- `C:\Users\PC\Desktop\tasarrufinansman\app\teklifleri-karsilastir\page.tsx`
- `C:\Users\PC\Desktop\tasarrufinansman\components\OfferComparisonPage.tsx`
- `C:\Users\PC\Desktop\tasarrufinansman\lib\comparisonEngine.ts`
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
   - banka kredisi PMT / schedule / efektif maliyet hesapları
   - KKDF ve BSMV toplamları
   - net ele geçen kredi
   - toplam kredi maliyeti

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

## Banka kredisi kıyası

`lib/loanEngine.ts` içindeki ana formüller:

- vergili aylık oran:
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

Compare sayfasında kredi kıyası şu çıktıları gösterir:

- kredi ana para
- net ele geçen kredi
- aylık taksit
- toplam taksit ödemesi
- toplam faiz
- toplam KKDF
- toplam BSMV
- kredi hariç masraf
- toplam geri ödeme
- toplam kredi maliyeti
- efektif aylık maliyet
- efektif yıllık maliyet
- ödeme planı tablosu

## Bilinen eksikler

- `InteractionScript.tsx` içinde compare ile ilgili kullanılmayan eski yardımcı fonksiyonlar hâlâ dosyada duruyor; compare sayfası artık bunlara bağlı değil.
- Şirket parametreleri gerçek veri değil, tahmini başlangıç parametreleri.
- CSV export sağlam, gerçek `.xlsx` export henüz yok.
- Ana sayfa kredi kıyas paneli henüz `loanEngine` seviyesinde ayrıştırılmış değil; compare sayfası daha ileri seviyede.

## Çalıştırma

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

