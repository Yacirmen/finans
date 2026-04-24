# Project Progress

Last updated: 2026-04-25  
Project root: `C:\Users\PC\Desktop\tasarrufinansman`

## 1. Bu turda yapılanlar

- Header menüsü yeniden düzenlendi.
  - `Firmalar` kaldırıldı.
  - `Nasıl Çalışır?` kaldırıldı.
  - `Hesaplama Modülü` ana menüsü eklendi.
  - Altında:
    - `Kredi Limit Modülü`
    - `Kredi Hesaplama Modülü`
      linkleri eklendi.
- Ana sayfadaki eski kredi limit teaser bloğu kaldırıldı.
  - Yerine gerçek modüllere yönlendiren temiz bir “Hesaplama modülleri” alanı geldi.
- Yeni sayfalar eklendi:
  - `/kredi-hesaplama`
  - `/kredi-limit`
  - `/engine-test`
- `Teklifleri Karşılaştır` sayfası yeni referans modül mantığına göre sadeleştirildi ve React kontrollü hale getirildi.
- `Kredi Matematiği Test Alanı` korundu ve görünür metinleri temizlendi.
- `README.md` ve kullanıcıya görünen kritik metin katmanları temiz Türkçe ile yeniden yazıldı.

## 2. Hangi dosyalar değişti

### Güncellenen dosyalar

- `app/layout.tsx`
- `app/kredi-test/page.tsx`
- `app/teklifleri-karsilastir/page.tsx`
- `components/Header.tsx`
- `components/HeroSection.tsx`
- `components/CalculatorSection.tsx`
- `components/LoanLimitSection.tsx`
- `components/OfferComparisonPage.tsx`
- `components/DataHubSection.tsx`
- `components/FAQSection.tsx`
- `components/BlogSection.tsx`
- `components/Footer.tsx`
- `lib/comparisonEngine.ts`
- `README.md`
- `progress.md`

### Eklenen dosyalar

- `app/kredi-hesaplama/page.tsx`
- `app/kredi-limit/page.tsx`
- `app/engine-test/page.tsx`
- `components/calculators/CreditCalculatorModule.tsx`
- `components/calculators/CreditLimitCalculatorModule.tsx`
- `components/EngineTestPage.tsx`
- `lib/formatters.ts`
- `lib/companyParams.ts`
- `lib/calculations/creditLimit.ts`
- `lib/calculations/offerComparison.ts`

### Kaldırılan teknik borç dosyaları

- `components/InteractionScript.tsx`

## 3. CalculatorSection refactor edildi mi?

Evet.

- Ana sayfa hesaplayıcısı React kontrollü çalışıyor.
- UI sadece input topluyor.
- Hesap tarafı `comparisonEngine.ts` üzerinden gidiyor.
- Örnek senaryo butonu referans değerleri dolduruyor:
  - `3.000.000 TL`
  - `1.000.000 TL peşinat`
  - `48 ay`
  - `41.667 TL`
  - `%7,5 hizmet bedeli`
  - `25.000 TL kira`
  - `2.000.000 TL kredi`
  - `%2,80 faiz`
  - `120 ay`

## 4. InteractionScript’ten hangi kodlar silindi?

- Eski DOM fallback hesap katmanı fiziksel olarak kaldırıldı.
- `components/InteractionScript.tsx` artık projede yok.
- Compare, kredi-test, engine-test ve ana sayfa hesaplayıcısı script fallback’e bağlı değil.

## 5. companyParams entegrasyonu tamam mı?

Büyük ölçüde tamam.

- `lib/companyParams.ts` aktif.
- Şirket seçimi için bu yapı tutuluyor:
  - `displayName`
  - `defaultServiceFeeRate`
  - `deliverySpeedFactor`
  - `riskFactor`
  - `campaignDiscountRate`
  - `notes`
- `comparisonEngine.ts` bu yapıdan veri okuyacak şekilde düzenlendi.

## 6. Ana sayfada hedef siteye yaklaştırılan alanlar

- Header spacing ve CTA oranları
- Hero başlık ve alt başlık hiyerarşisi
- Hero içindeki bilgi kartları
- Hesaplayıcı kart oranı
- Input yüksekliği ve radius dili
- Sonuç paneli
- FAQ görünümü
- Blog kartları
- Footer boşlukları
- Kredi limit teaser bloğu yerine gerçek modül yönlendirmesi

## 7. Sayfada çalışan özellikler

### Navigasyon

- `Ana Sayfa`
- `Hesaplama Modülü`
  - `Kredi Limit Modülü`
  - `Kredi Hesaplama Modülü`
- `Teklifleri Karşılaştır`
- `Blog`
- `Hakkımızda`
- `Endeks`
- `Giriş Yap`

### Kredi Hesaplama Modülü

- Kredi tipi presetleri çalışıyor:
  - Konut İlk Evim
  - Konut Evi Olan
  - Taşıt
  - İhtiyaç
- Girdi değişince hesap güncelleniyor.
- `Hesapla`
- `Varsayılana Dön`
- Ödeme planı tablosu
- KPI kartları
- Net maliyet ve toplam geri ödeme

### Kredi Limit Modülü

- Gelir / borç / faiz / vade / masraf girdileri çalışıyor.
- Maksimum limit hesaplanıyor.
- Risk seviyesi güncelleniyor.
- Negatif limit engelleniyor.

### Teklifleri Karşılaştır

- Senaryo A bağımsız state ile çalışıyor.
- Senaryo B bağımsız state ile çalışıyor.
- KPI alanı otomatik güncelleniyor:
  - Daha Mantıklı Senaryo
  - NPV Farkı
  - Toplam Maliyet Farkı
- `Hesapla` butonu sonuç özetine scroll ediyor.
- `Varsayılanlara Dön` çalışıyor.
- Karşılaştırma tablosu güncelleniyor.

### Test Sayfaları

- `/kredi-test`
- `/engine-test`

## 8. Mobil QA sonucu

Kod seviyesi responsive kontrol yapıldı.

Yerinde doğrulanan ana alanlar:
- Ana sayfa
- Teklif karşılaştırma sayfası
- Header hesaplama modülü açılır menüsü
- Kredi hesaplama sayfası

Not:
- Gerçek cihaz bazlı tam mobile viewport QA turu henüz bitmedi.
- Özellikle tablo yoğun ekranlarda son bir görsel mobil tur daha faydalı olur.

## 9. Build / export sonucu

`npm run build` temiz geçti.

Üretilen static route’lar:
- `/`
- `/veri`
- `/teklifleri-karsilastir`
- `/kredi-test`
- `/engine-test`
- `/kredi-hesaplama`
- `/kredi-limit`

`out` doğrulaması:
- `out/index.html`
- `out/veri/index.html`
- `out/teklifleri-karsilastir/index.html`
- `out/kredi-test/index.html`
- `out/engine-test/index.html`
- `out/kredi-hesaplama/index.html`
- `out/kredi-limit/index.html`

## 10. Hâlâ kalan eksikler

- Compare sayfası işlevsel olarak temizlendi ama hedef HTML’e görsel sıkılık açısından bir tur daha yaklaşabilir.
- `README.md` ve bazı geliştirici odaklı dosyalarda ek gözden geçirme yapılabilir.
- Tüm sayfalar için gerçek mobile viewport göz testi tamamlanmalı.

## 11. UI benzerlik checklist’i

- [x] Header hedef yapıya yaklaştı
- [x] Hero hedef yapıya yaklaştı
- [x] Ana sayfa hesaplayıcı referans ritme yaklaştı
- [x] Teklif karşılaştırma yeni sade modül mantığına geçti
- [x] Kredi hesaplama modülü eklendi
- [x] Kredi limit modülü eklendi
- [x] Kredi testi route’u çalışıyor
- [x] Engine test route’u çalışıyor
- [x] Footer tamam
- [x] Eski ana sayfa limit bloğu gerçek modüllerle hizalandı
- [ ] Son mobil görsel QA tamamlanmalı
