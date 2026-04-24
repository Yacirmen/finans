# Project Progress

Last updated: 2026-04-24  
Project root: `C:\Users\PC\Desktop\tasarrufinansman`

## 1. Su ana kadar yapilanlar

- Ana site akisi oturdu:
  - `Header`
  - `Hero`
  - `Kredi Limit Mod�l�`
  - `Tasarruf Finansmanı Maliyet Hesaplayicisi`
  - `SSS`
  - `Blog`
  - `Footer`
- `/veri` sayfasi canli ve ana tasarim diliyle uyumlu.
- `/teklifleri-karsilastir` sayfasi ayri route olarak �alisiyor.
- Compare sayfasi tek motorlu karar destek ekranina d�n�st�r�ld�.
- Compare hesaplari `lib/comparisonEngine.ts` �zerinden �alisiyor.
- Banka kredisi kiyasi `lib/loanEngine.ts` ile g��lendirildi.
- Sonu� kartlarinda NBM kirilimi, risk ve banka kredisi farki g�r�n�r hale getirildi.
- Nakit akisi tablolari teklif bazinda �retiliyor ve CSV export veriyor.
- Sirket bazli tahmini parametre sistemi kuruldu.
- Yeni `/kredi-test` sayfasi eklendi:
  - referans HTML kredi matematigi
  - proje kredi motoru
  - fark analizi
  - �deme plani fark analizi

## 2. Hangi dosyalarda ne degisti

### Route / sayfa dosyalari

- `C:\Users\PC\Desktop\tasarrufinansman\app\layout.tsx`
  - Metadata T�rk�esi d�zeltildi.
  - Global `InteractionScript` tek noktada kaldi.
- `C:\Users\PC\Desktop\tasarrufinansman\app\veri\page.tsx`
  - T�rk�e karakterler d�zeltildi.
- `C:\Users\PC\Desktop\tasarrufinansman\app\teklifleri-karsilastir\page.tsx`
  - Compare route temiz fallback ile korunuyor.
- `C:\Users\PC\Desktop\tasarrufinansman\app\kredi-test\page.tsx`
  - Yeni kredi matematigi test alani route�u eklendi.

### Bilesenler

- `C:\Users\PC\Desktop\tasarrufinansman\components\Header.tsx`
  - Header metinleri temizlendi.
  - Compare CTA d�zg�n T�rk�e ile korundu.
- `C:\Users\PC\Desktop\tasarrufinansman\components\OfferComparisonPage.tsx`
  - Tam React kontroll� compare sayfasi kuruldu.
  - Sonu� kartlari, karar �zeti ve kredi �deme plani eklendi.
- `C:\Users\PC\Desktop\tasarrufinansman\components\LoanMathTestPage.tsx`
  - Referans HTML ve proje motorunu yan yana g�steren yeni test alani eklendi.
- `C:\Users\PC\Desktop\tasarrufinansman\components\InteractionScript.tsx`
  - Compare DOM fallback baslangici no-op halde tutuluyor.
  - Compare sayfasi artik bu script�e bagli degil.

### Motor / hesap katmani

- `C:\Users\PC\Desktop\tasarrufinansman\lib\loanEngine.ts`
  - Referans HTML kredi matematigi tasindi.
  - PMT, vergili aylık faiz, �deme plani, IRR/RATE, efektif yıllık maliyet burada.
  - Referans motor ve proje motoru fark analizi burada.
- `C:\Users\PC\Desktop\tasarrufinansman\lib\comparisonEngine.ts`
  - Teklif motoru, NBM, risk, gecikme maliyeti, sirket parametreleri ve `loanEngine` baglantisi burada.

### Dok�mantasyon

- `C:\Users\PC\Desktop\tasarrufinansman\README.md`
  - Hesap motoru, kredi test alani ve compare akisi g�ncellendi.
- `C:\Users\PC\Desktop\tasarrufinansman\progress.md`
  - Bu dosya g�ncellendi.

## 3. Sayfada �alisan �zellikler

### Ana sayfa

- Header linkleri �alisiyor.
- Hero CTA�lari �alisiyor.
- Kredi limit mod�l� �alisiyor:
  - Konut
  - Tasit
  - Ihtiya�
- Ana hesaplayici �alisiyor.
- Banka kredisi kiyas paneli �alisiyor.

### Teklifleri Karşılaştır sayfasi

- `Konut / Araba` se�imi �alisiyor.
- `Teklif 1 / Teklif 2` bagimsiz state ile �alisiyor.
- `�ekilissiz / �ekilisli` se�imleri �alisiyor.
- Sirket se�imi sonuçu etkiliyor:
  - hizmet bedeli varsayilani
  - teslim hizi
  - risk cezası
  - kampanya indirimi
- D�z plan �alisiyor.
- Artışlı plan �alisiyor.
- Manuel plan �alisiyor.
- Teslim ayi kira etkisini degistiriyor.
- Kredi kiyasi aktif/pasif �alisiyor.
- `T�M TEKLIFLERI HESAPLA` sonu� �retiyor.
- Kazanan teklif otomatik vurgulaniyor.
- �ekilisli teklif i�in iyi / ortalama / k�t� senaryo �retiliyor.
- NBM kirilimi g�steriliyor:
  - Peşinat PV
  - Hizmet bedeli PV
  - Taksitler PV
  - Kira PV
  - Toplam NBM
- Karar skoru g�steriliyor.
- Risk seviyesi g�steriliyor.
- Karar yorumu g�steriliyor.
- Banka kredisi i�in �deme plani tablosu g�steriliyor.
- Nakit akisi tablosu teklif bazinda olusuyor.
- CSV export �alisiyor.

### Kredi Matematigi Test Alani

- Kredi t�r� presetleri �alisiyor:
  - Konut - Evi Olmayan
  - Konut - Evi Olan
  - Tasit
  - Ihtiya�
- Ayni inputlarla iki motor yan yana hesap yapiyor:
  - Referans HTML Matematigi
  - Mevcut Proje Kredi Motoru
- Fark analizi tablosu �alisiyor.
- �deme plani fark analizi �alisiyor.
- `Ilk 12 Ay / T�m Plan` ge�isi �alisiyor.

## 4. Eksik kalan �zellikler

- `InteractionScript.tsx` i�indeki compare�a ait eski yardimci fonksiyonlar dosyada duruyor; �agrilmiyor ama fiziksel temizlik yapilmali.
- Sirket parametreleri su an tahmini.
- `.xlsx` export yok; CSV saglam �alisiyor.
- Ana sayfa kredi kiyas paneli hen�z `loanEngine` detay �iktilarinin tamamini g�stermiyor.
- Compare sayfasinda input maskeleme ve sayi formatlama UX�i daha da rafine edilebilir.

## 5. Bilinen buglar

- Workspace i�inde ge�ici dosyalar duruyor:
  - `.tmp-chrome*`
  - `tmp_compare.xlsx`
- Eski bilesenlerde tek t�k mojibake kalintisi olabilir; ana hedef dosyalar ve yeni kredi test alani temizlendi.

## 6. Hesap motorunda su an kullanilan form�ller

### Referans HTML�den tasinan kredi matematigi

- nominal aylık oran:
  - `nominalRate = monthlyRatePct / 100`
- vergili aylık oran:
  - `effectiveMonthlyRate = nominalRate * (1 + (BSMV + KKDF) / 100)`
- PMT:
  - `payment = principal * rate * (1 + rate)^term / ((1 + rate)^term - 1)`
- net ele ge�en kredi:
  - `netDisbursed = principal - fee`
- d�nemsel faiz:
  - `interest = remainingPrincipal * nominalRate`
- d�nemsel KKDF:
  - `kkdfAmount = interest * kkdf / 100`
- d�nemsel BSMV:
  - `bsmvAmount = interest * bsmv / 100`
- anapara �demesi:
  - `principalPayment = payment - interest - kkdfAmount - bsmvAmount`
- kalan anapara:
  - `remainingPrincipal = remainingPrincipal - principalPayment`
- toplam faiz:
  - `sum(interest)`
- toplam taksit �demesi:
  - `payment * term`
- referans HTML toplam geri �deme:
  - `totalWithInterest + fee`
- d�zeltilmis proje toplam geri �deme:
  - `totalInstallmentPayment + fee`
- toplam kredi maliyeti:
  - `totalRepayment - netDisbursed`
- efektif aylık maliyet:
  - `solveRateByIRR(term, payment, netDisbursed)`
- efektif yıllık maliyet:
  - `Math.pow(1 + monthlyCostRate, 12) - 1`

### Tasarruf finansmanı tarafi

#### Aylık indirgeme orani

`monthlyDiscountRate = Math.pow(1 + annualInflationRate / 100, 1 / 12) - 1`

#### Bug�nk� değer

`PV = amount / Math.pow(1 + monthlyDiscountRate, month)`

#### D�z plan

`installment = baseMonthlyPayment`

#### Artışlı plan

`installment = baseMonthlyPayment * Math.pow(1 + yearlyIncrease / 100, Math.floor((month - 1) / 12))`

#### Manuel plan

- kullanici değerleri satir satir veya virg�lle girer
- eksik aylar son değer ile doldurulur
- tamamen hataliysa d�z plan fallback olur

#### Kira motoru

- teslim ayina kadar kira olusur
- teslimden sonra kira `0`
- her 12 ayda enflasyon kadar artar

#### Hizmet bedeli

`serviceFeeAmount = assetPrice * (serviceFeeRate / 100)`

#### NBM

`NBM = peşinat PV + hizmet bedeli PV + taksitler PV + kira PV`

#### �ekilisli senaryo seti

- iyi teslim:
  - `goodDelivery = Math.max(1, Math.round(expectedDelivery * 0.6 * deliverySpeedFactor))`
- ortalama teslim:
  - `averageDelivery = expectedDelivery`
- k�t� teslim:
  - `badDelivery = Math.min(term, Math.round(expectedDelivery * (1.4 + Math.max(riskFactor - 1, 0) * 0.25)))`

#### Risk

`risk = standardDeviation(nbmValues)`

#### Gecikme maliyeti

`delayCost = Math.max(0, badDelivery - averageDelivery) * currentMonthlyRent`

#### Karar skoru

`decisionScore = averageNBM + riskPenalty + delayCost`

`riskPenalty = risk * riskWeight * companyRiskFactor`

## 7. Devam etmek i�in �nerilen siradaki adimlar

1. `InteractionScript.tsx` i�indeki compare�a ait �l� kodu tamamen kaldir.
2. Ana sayfa banka kiyas panelini `loanEngine` ile ayni detay seviyesine �ikar.
3. Sirket parametrelerini ger�ek veriyle besle.
4. Input formatlama ve validation UX�ini daha profesyonel hale getir.
5. CSV yaninda ger�ek `.xlsx` export ekle.
6. Ge�ici dosyalari �alisma klas�r�nden temizle.

## 8. Test edilen senaryolar

- D�z �ekilissiz plan
- Artışlı taksitli plan
- Manuel plan
- �ekilisli iyi / ortalama / k�t� senaryo
- Ge� teslim kaynakli kira maliyeti
- Y�ksek hizmet bedelli teklif
- Banka kredisi kiyasi a�ik / kapali
- Farkli sirket se�imi ile sonu� degisimi
- Kredi ana para / masraf / efektif maliyet hesaplari
- Kredi test alani presetleri:
  - Konut - Evi Olmayan
  - Konut - Evi Olan
  - Tasit
  - Ihtiya�
