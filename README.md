# Tasarruf Finansmanı

Tasarruf finansmanı tekliflerini, banka kredisi alternatiflerini ve piyasa göstergelerini aynı karar ekranında okumak için hazırlanmış finansal karar destek projesidir.

## Sayfalar

- `/`: Ana sayfa, hero, kredi limit alanı, maliyet hesaplayıcı, bülten, danışmanlık formu, SSS ve blog.
- `/teklifleri-karsilastir`: İki şirket teklifini Excel referans formülleriyle yan yana kıyaslar.
- `/veri`: Piyasa endeksi ve market slider.
- `/kredi-hesaplama`: Kredi taksit, maliyet ve ödeme planı modülü.
- `/kredi-limit`: Konut, taşıt ve ihtiyaç limit modülü.
- `/kredi-test`: Kredi motoru test alanı.
- `/engine-test`: Tasarruf finansmanı motoru test alanı.
- `/profil`: LocalStorage üzerinde kaydedilen müşteri/profil kayıtları.

## Hesap motorları

- `lib/comparisonEngine.ts`: Ana tasarruf finansmanı hesapları, NBM kırılımı, nakit akışı ve risk/karar skoru.
- `lib/loanEngine.ts`: PMT, ödeme planı, BSMV/KKDF, toplam kredi maliyeti ve efektif maliyet hesapları.
- `lib/calculations/offerComparison.ts`: `/teklifleri-karsilastir` sayfasının Excel referanslı iki senaryo motoru.
- `lib/companyParams.ts`: Şirket bazlı varsayılan hizmet bedeli, teslim hızı, risk katsayısı ve kampanya indirimi.
- `lib/formatters.ts`: Türkçe sayı, TL ve yüzde parse/format yardımcıları.

UI katmanı hesap yapmaz; input toplar, hesap motoruna gönderir ve sonucu render eder.

## Teklif karşılaştırma formülü

Ana referans: `2-TEKLİFKARŞILAŞTIRMAMODÜLÜ (3).xlsx`

Özet eşleme:

- `financingPresentCost = assetValue / (1 + monthlyDiscountRate) ^ deliveryMonth`
- `organizationFeeAndDownPayment = assetValue * organizationFeeRate / 100 + downPayment`
- `initialCashOut = downPayment + organizationFeeAndDownPayment`
- `financeAmount = assetValue - downPayment`
- `monthlyInstallment = financeAmount / termMonths`
- `deliveryMonth = MAX(5, ROUNDUP(termMonths * 0.4 * (1 - downPayment / assetValue), 0))`
- `monthlyPaymentsPV = PV(monthlyDiscountRate, termMonths, -monthlyInstallment)`
- `rentPV = PV(monthlyDiscountRate, deliveryMonth, -monthlyRent, 0)`
- `npv = monthlyPaymentsPV + rentPV + organizationFeeAndDownPayment - financingPresentCost`

Excel notu: `initialCashOut` formülü peşinatı ikinci kez topluyor gibi görünüyor. İş kuralı korunarak isimli fonksiyonda bırakıldı.

## Kredi matematiği

Merkez dosya: `lib/loanEngine.ts`

- `nominalRate = monthlyRatePct / 100`
- `effectiveMonthlyRate = nominalRate * (1 + (BSMV + KKDF) / 100)`
- `payment = principal * rate * Math.pow(1 + rate, term) / (Math.pow(1 + rate, term) - 1)`
- `netDisbursed = principal - fee`
- `totalInstallmentPayment = payment * term`
- `totalRepayment = totalInstallmentPayment + fee`
- `totalCreditCost = totalRepayment - netDisbursed`
- `annualEffectiveCost = Math.pow(1 + monthlyCostRate, 12) - 1`

## Market slider güncelleme

GitHub Pages statik yayın olduğu için canlı Excel upload yoktur. Yerel güncelleme akışı:

1. Excel dosyasını `data/market-upload.xlsx` olarak ekle.
2. `npm run update:market` çalıştır.
3. Script `data/market-data.json` dosyasını günceller.
4. `npm run build` çalıştır.
5. Deploy et.

## LocalStorage alanları

- `financeProfiles`: Profil kayıtları.
- `newsletterEmails`: Bülten kayıtları.
- `consultationRequests`: Uzmanına danış talepleri.

Bu alanlar backend/auth bağlanana kadar yerel kayıt olarak çalışır.

## Çalıştırma

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Son doğrulanan build route'ları:

- `/`
- `/veri`
- `/teklifleri-karsilastir`
- `/kredi-test`
- `/engine-test`
- `/kredi-hesaplama`
- `/kredi-limit`
- `/profil`
