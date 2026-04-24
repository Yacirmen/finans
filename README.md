# Tasarruf Finansmanı

Bu proje, tasarruf finansmanı tekliflerini ve banka kredisi alternatifini bug�nk� değer mantigiyla değerlendiren bir finansal karar destek aray�z�d�r.

## Ana yapi

- `/`
  - ana hesaplayici
  - kredi limit mod�l�
  - veri / i�erik bloklari
- `/teklifleri-karsilastir`
  - iki teklifi yan yana karsilastiran karar destek sayfasi
- `/veri`
  - piyasa verisi ve endeks sayfasi
- `/kredi-test`
  - referans HTML kredi matematigi ile proje motorunu yan yana test eden sayfa

## Compare sayfasi hangi dosyalara bagli

- `C:\Users\PC\Desktop\tasarrufinansman\app\teklifleri-karsilastir\page.tsx`
- `C:\Users\PC\Desktop\tasarrufinansman\components\OfferComparisonPage.tsx`
- `C:\Users\PC\Desktop\tasarrufinansman\lib\comparisonEngine.ts`
- `C:\Users\PC\Desktop\tasarrufinansman\lib\loanEngine.ts`

## Kredi test alani hangi dosyalara bagli

- `C:\Users\PC\Desktop\tasarrufinansman\app\kredi-test\page.tsx`
- `C:\Users\PC\Desktop\tasarrufinansman\components\LoanMathTestPage.tsx`
- `C:\Users\PC\Desktop\tasarrufinansman\lib\loanEngine.ts`

## Hesap motoru nasil �alisiyor

Compare sayfasinda UI yalnizca kullanici girdilerini toplar. Finansal hesap mantigi iki katmanda �alisir:

1. `lib/comparisonEngine.ts`
   - teklif bazli tasarruf finansmanı hesaplari
   - NBM kirilimi
   - teslim senaryolari
   - risk ve karar skoru
   - nakit akisi tablolari
2. `lib/loanEngine.ts`
   - banka kredisi PMT / �deme plani / efektif maliyet hesaplari
   - KKDF ve BSMV toplamlari
   - net ele ge�en kredi
   - toplam kredi maliyeti
   - referans HTML matematigi ile proje motoru arasindaki fark analizi

UI tarafi hesap yapmaz; yalnizca bu motorlardan d�nen sonuçu render eder.

## NBM nasil hesaplaniyor

Aylık indirgeme orani:

`monthlyDiscountRate = Math.pow(1 + annualInflationRate / 100, 1 / 12) - 1`

Bug�nk� değer:

`PV = amount / Math.pow(1 + monthlyDiscountRate, month)`

Toplam NBM:

- Peşinat PV
- Hizmet bedeli PV
- Taksitler PV
- Kira PV

`Toplam NBM = peşinat PV + hizmet bedeli PV + taksitler PV + kira PV`

## Karar skoru nasil hesaplaniyor

�ekilisli modelde �� senaryo �retilir:

- iyi senaryo
- ortalama senaryo
- k�t� senaryo

Risk:

`risk = standardDeviation(nbmValues)`

Gecikme maliyeti:

`delayCost = Math.max(0, badDelivery - averageDelivery) * currentMonthlyRent`

Risk cezasi:

`riskPenalty = risk * riskWeight * companyRiskFactor`

Karar skoru:

`decisionScore = averageNBM + riskPenalty + delayCost`

## Sirket parametreleri nereden geliyor

Sirket parametreleri `lib/comparisonEngine.ts` i�indeki `companyParams` nesnesinden gelir.

Her sirket i�in:

- `defaultServiceFeeRate`
- `deliverySpeedFactor`
- `riskFactor`
- `campaignDiscountRate`
- `notes`

alanlari tanimlidir.

Not:
Bu değerler su an varsayilan tahmini parametrelerdir. Ger�ek firma verileri geldiginde ayni yapi �zerinden g�ncellenebilir.

## Banka kredisi matematigi

`lib/loanEngine.ts` i�indeki ana form�ller:

- vergili aylık oran:
  - `effectiveMonthlyRate = nominalRate * (1 + (BSMV + KKDF) / 100)`
- ann�ite taksit:
  - `payment = principal * rate * (1 + rate)^term / ((1 + rate)^term - 1)`
- toplam taksit �demesi:
  - `totalInstallmentPayment = payment * term`
- d�zeltilmis toplam geri �deme:
  - `totalRepayment = totalInstallmentPayment + fee`
- referans HTML toplam geri �deme:
  - `referenceTotalRepayment = totalWithInterest + fee`
- toplam kredi maliyeti:
  - `totalCreditCost = totalRepayment - netDisbursed`
- efektif aylık maliyet:
  - `solveRateByIRR(term, payment, netDisbursed)`
- efektif yıllık maliyet:
  - `Math.pow(1 + monthlyCostRate, 12) - 1`

## /kredi-test nasil kullanilir

1. Sayfayi a�:
   - `/kredi-test`
2. Bir kredi preset�i se�:
   - Konut - Evi Olmayan
   - Konut - Evi Olan
   - Tasit
   - Ihtiya�
3. Istersen anapara, vade, aylık faiz, masraf, BSMV ve KKDF değerlerini degistir.
4. Sol s�tunda referans HTML matematigi, sag s�tunda proje motoru g�r�n�r.
5. Alt tabloda fark analizi ve �deme plani farklari izlenir.

## Referans HTML ile proje motoru arasindaki fark nasil okunur

Yan yana fark analizinde:

- `OK`
  - fark tolerans i�indedir
- `Kontrol Et`
  - fark tolerans disindadir

Tolerans:

- parasal değerler: `0.05 TL`
- y�zdesel değerler: `0.0001`

## Bilin�li farkliliklar

Referans HTML ile proje motoru arasindaki en �nemli bilin�li fark:

- referans HTML:
  - `Toplam Geri �deme = Toplam Faizli Geri �deme + Masraf`
- proje motoru:
  - `Toplam Geri �deme = Toplam Taksit �demesi + Masraf`

Bu y�zden `/kredi-test` sayfasi yalnizca birebir eslesmeyi degil, bilin�li finansal farki da g�r�n�r kilar.

## Bilinen eksikler

- `InteractionScript.tsx` i�inde compare ile ilgili kullanilmayan eski yardimci fonksiyonlar h�l� dosyada duruyor; compare sayfasi artik bunlara bagli degil.
- Sirket parametreleri ger�ek veri degil, tahmini baslangi� parametreleri.
- CSV export saglam, ger�ek `.xlsx` export hen�z yok.
- Ana sayfa kredi kiyas paneli hen�z `loanEngine` detay �iktilarinin tamamini g�stermiyor.

## �alistirma

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```
