# Tasarruf Finansmanı

Bu proje, tasarruf finansmanı tekliflerini ve banka kredisi alternatifini bugünkü değer mantığıyla değerlendiren bir finansal karar destek ürünüdür.

## Sayfalar

- `/`
  - ana sayfa
  - hero
  - hesaplama modülleri yönlendirme alanı
  - tasarruf finansmanı maliyet hesaplayıcısı
  - SSS
  - blog
- `/teklifleri-karsilastir`
  - iki senaryoyu yan yana kıyaslayan karar destek sayfası
- `/veri`
  - piyasa endeksi ve veri yüzeyi
- `/kredi-test`
  - referans kredi matematiği ile proje motorunu yan yana test eden sayfa
- `/engine-test`
  - tasarruf finansmanı motorunu senaryo bazlı test eden sayfa
- `/kredi-hesaplama`
  - kredi hesaplama modülü
- `/kredi-limit`
  - kredi limit modülü

## Mimari

### Ana hesap motorları

- `C:\Users\PC\Desktop\tasarrufinansman\lib\comparisonEngine.ts`
  - tasarruf finansmanı teklif hesapları
  - NBM kırılımı
  - teslim senaryoları
  - risk ve karar skoru
  - nakit akışı tabloları
- `C:\Users\PC\Desktop\tasarrufinansman\lib\loanEngine.ts`
  - banka kredisi PMT, ödeme planı ve efektif maliyet hesapları
  - KKDF ve BSMV toplamları
  - net ele geçen kredi
  - toplam kredi maliyeti
  - referans kredi matematiği ile proje motoru arasındaki fark analizi
- `C:\Users\PC\Desktop\tasarrufinansman\lib\companyParams.ts`
  - şirket bazlı varsayılan hizmet bedeli, teslim hızı ve risk katsayıları
- `C:\Users\PC\Desktop\tasarrufinansman\lib\calculations\creditLimit.ts`
  - gelir, borç ve faiz üzerinden limit tahmini
- `C:\Users\PC\Desktop\tasarrufinansman\lib\calculations\offerComparison.ts`
  - sade iki senaryolu teklif karşılaştırma matematiği

UI katmanı hesap yapmaz; input toplar, motorlara gönderir ve sonucu render eder.

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

## Kredi matematiği

Merkez dosya: `C:\Users\PC\Desktop\tasarrufinansman\lib\loanEngine.ts`

Ana formüller:

- nominal aylık oran:
  - `nominalRate = monthlyRatePct / 100`
- vergili aylık oran:
  - `effectiveMonthlyRate = nominalRate * (1 + (BSMV + KKDF) / 100)`
- annüite taksit:
  - `payment = principal * rate * Math.pow(1 + rate, term) / (Math.pow(1 + rate, term) - 1)`
- net ele geçen kredi:
  - `netDisbursed = principal - fee`
- toplam taksit ödemesi:
  - `totalInstallmentPayment = payment * term`
- düzeltilmiş toplam geri ödeme:
  - `totalRepayment = totalInstallmentPayment + fee`
- toplam kredi maliyeti:
  - `totalCreditCost = totalRepayment - netDisbursed`
- efektif aylık maliyet:
  - `solveRateByIRR(term, payment, netDisbursed)`
- efektif yıllık maliyet:
  - `Math.pow(1 + monthlyCostRate, 12) - 1`

## /kredi-test nasıl kullanılır

1. `/kredi-test` sayfasını açın.
2. Bir kredi preset’i seçin:
   - Konut - Evi Olmayan
   - Konut - Evi Olan
   - Taşıt
   - İhtiyaç
3. İsterseniz anapara, vade, aylık faiz, masraf, BSMV ve KKDF değerlerini değiştirin.
4. Sol sütunda referans kredi matematiği, sağ sütunda proje motoru görünür.
5. Alt tabloda fark analizi ve ödeme planı farkları izlenir.

## /engine-test nasıl kullanılır

1. `/engine-test` sayfasını açın.
2. Hazır senaryoları satır satır kontrol edin.
3. Her senaryo için:
   - inputlar
   - beklenen davranış
   - hesaplanan sonuç
   - durum: `OK / Kontrol Et`
4. Bu sayfa compare ve ana hesap motorunun temel davranışlarını hızlıca doğrulamak için kullanılır.

## Bilinçli farklar

Referans kredi matematiği ile proje motoru arasındaki en önemli bilinçli fark:

- referans yaklaşım:
  - `Toplam Geri Ödeme = Toplam Faizli Geri Ödeme + Masraf`
- proje yaklaşımı:
  - `Toplam Geri Ödeme = Toplam Taksit Ödemesi + Masraf`

Bu fark `/kredi-test` ekranında özellikle görünür bırakılır.

## Bilinen eksikler

- Ana sayfadaki hesaplayıcı hâlâ hedef siteye piksel olarak biraz daha yaklaşabilir.
- Compare sayfası işlevsel olarak doğru, ancak görsel sıkılık açısından bir tur daha rafine edilebilir.
- `companyParams.ts` içinde geçmiş query parametre uyumluluğu için birkaç alias anahtar korunuyor.
- Tüm route’lar için son tur gerçek mobil viewport göz testi yapılmalı.

## Çalıştırma

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
