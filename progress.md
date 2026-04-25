# Project Progress

Last updated: 2026-04-25

## 1. Bu turda yapılanlar

- Teklif karşılaştırma motoru `2-TEKLİFKARŞILAŞTIRMAMODÜLÜ (3).xlsx` içinde tarif edilen NPV mantığına göre yeniden hizalandı.
- `/teklifleri-karsilastir` sayfasında finansman modeli seçimi kaldırıldı; modül iki şirket teklifini karşılaştıran sade yapıya geçti.
- Aylık taksit, teslim zamanı, finansman tutarı, organizasyon ücreti + peşinat, toplam geri ödeme, toplam maliyet ve NPV otomatik hesaplanıyor.
- Daha yüksek NPV senaryosu avantajlı teklif olarak işaretleniyor.
- Tahmini faiz bilgisi anonim kullanıcı için kilitli kart olarak eklendi.
- Sayı formatlama yardımcıları temizlendi; TL ve yüzde alanları Türkçe formatla parse/format ediliyor.
- Endeks bölümüne JSON veriden beslenen React tabanlı market slider eklendi.
- Market verisini Excel'den JSON'a aktarmak için `npm run update:market` scripti eklendi.
- Kredi limit modülüne `Profilime Kaydet` akışı eklendi.
- `/profil` sayfası localStorage kayıtlarını listeleme, silme ve temizleme özelliğiyle eklendi.
- Ana sayfaya bülten ve uzmanına danış formu eklendi; ikisi de localStorage ile çalışıyor.
- Footer sosyal linkleri eklendi.
- Header, footer, blog ve kritik görünür metinlerde Türkçe karakterler temizlendi.

## 2. Değişen dosyalar

- `app/page.tsx`
- `app/veri/page.tsx`
- `app/profil/page.tsx`
- `app/globals.css`
- `components/Header.tsx`
- `components/Footer.tsx`
- `components/BlogSection.tsx`
- `components/DataHubSection.tsx`
- `components/MarketSlider.tsx`
- `components/NewsletterSignup.tsx`
- `components/ConsultationSection.tsx`
- `components/ProfilePage.tsx`
- `components/OfferComparisonPage.tsx`
- `components/calculators/CreditLimitCalculatorModule.tsx`
- `lib/calculations/offerComparison.ts`
- `lib/companyParams.ts`
- `lib/formatters.ts`
- `lib/loanLimit.ts`
- `data/market-data.json`
- `scripts/update-market-data-from-excel.js`
- `package.json`
- `package-lock.json`

## 3. Teklif karşılaştırma formül eşlemesi

- `financingPresentCost = assetValue / (1 + monthlyDiscountRate) ^ deliveryMonth`
- `downRateFirstInstallment = downPayment / assetValue`
- `downRateUntilDelivery = (downPayment + deliveryMonth * monthlyInstallment) / assetValue`
- `organizationFeeAndDownPayment = assetValue * organizationFeeRate / 100 + downPayment`
- `initialCashOut = downPayment + organizationFeeAndDownPayment`
- `financeAmount = assetValue - downPayment`
- `term40 = termMonths * 0.4`
- `monthlyInstallment = financeAmount / termMonths`
- `monthlyPaymentsPV = PV(monthlyDiscountRate, termMonths, -monthlyInstallment)`
- `totalRepayment = monthlyInstallment * termMonths + additionalCost`
- `totalCost = totalRepayment + initialCashOut`
- `deliveryMonth = MAX(5, ROUNDUP(termMonths * 0.4 * (1 - downPayment / assetValue), 0))`
- `rentPV = PV(monthlyDiscountRate, deliveryMonth, -monthlyRent, 0)`
- `npv = monthlyPaymentsPV + rentPV + organizationFeeAndDownPayment - financingPresentCost`

Not: Excel'de `initialCashOut` formülü peşinatı ikinci kez topluyor gibi görünüyor. İş kuralı korunarak fonksiyon içinde isimli bırakıldı; gerekirse tek noktadan değiştirilebilir.

## 4. Çalışan özellikler

- `/teklifleri-karsilastir`: iki senaryo bağımsız state, otomatik taksit/teslim/NPV, kazanan vurgusu, fark tablosu, kilitli tahmini faiz kartı.
- `/kredi-limit`: konut/taşıt/ihtiyaç limit hesapları, peşinat oranı/tutarı, profil kaydı.
- `/profil`: kayıt listeleme, kayıt silme, tüm kayıtları temizleme, bülten kayıt alanı.
- Ana sayfa: bülten formu, uzmanına danış formu, blog kartları.
- `/veri`: market slider JSON verisiyle render oluyor.

## 5. Market slider güncelleme akışı

1. Excel dosyasını `data/market-upload.xlsx` olarak koy.
2. `npm run update:market` çalıştır.
3. Script `data/market-data.json` dosyasını günceller.
4. `npm run build` al.
5. Deploy et.

Beklenen kolon isimleri esnek tutuldu: `label/value/change/direction/type/sparkline` veya Türkçe karşılıkları okunabilir.

## 6. LocalStorage kalan alanlar

- Profil kayıtları localStorage kullanıyor.
- Bülten kayıtları localStorage kullanıyor.
- Uzmanına danış talepleri localStorage kullanıyor.
- Gerçek auth/backend henüz yok; bu bilinçli olarak mock/local ilerliyor.

## 7. Build sonucu

`npm run build` temiz geçti.

Üretilen static route'lar:

- `/`
- `/veri`
- `/teklifleri-karsilastir`
- `/kredi-test`
- `/engine-test`
- `/kredi-hesaplama`
- `/kredi-limit`
- `/profil`

## 8. Bilinen sınırlamalar

- Tahmini faiz kartı anonim kullanıcıda kilitli; gerçek üyelik/auth bağlanmadı.
- Market slider canlı veri çekmiyor; GitHub Pages statik olduğu için Excel -> JSON -> build akışı kullanılıyor.
- `data/market-upload.xlsx` örnek dosyası repoda yok; kullanıcı veri yüklediğinde script çalıştırılmalı.
