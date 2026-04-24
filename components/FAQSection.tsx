const faqs = [
  [
    "Tasarruf Finansmanı (Evim Sistemi) Nedir?",
    "Tasarruf finansmanı, belirli bir plan dahilinde düzenli ödeme yaparak konut veya taşıt edinmeyi hedefleyen alternatif bir finansman modelidir. Nihai maliyeti sadece nominal ödemeler değil; peşinat, teslim süresi, kira etkisi ve hizmet bedeli birlikte belirler.",
  ],
  [
    "Net Maliyet ne anlama gelir?",
    "Net Bugünkü Maliyet, gelecekte yapılacak ödemelerin bugünkü değerini hesaplayarak gerçek ekonomik yükü gösterir. Böylece peşinat, taksitler, hizmet bedeli ve kira etkisi aynı zeminde karşılaştırılabilir.",
  ],
  [
    "Çekilişli ve çekilişsiz sistem arasındaki fark nedir?",
    "Çekilişsiz modelde teslim tarihi daha öngörülebilirdir. Çekilişli modelde ise teslim zamanı daha belirsizdir; bu yüzden iyi, ortalama ve kötü senaryo aralığıyla risk etkisi ayrıca değerlendirilmelidir.",
  ],
  [
    "Organizasyon ücreti nedir?",
    "Organizasyon ücreti, sözleşme tutarı üzerinden oranla hesaplanan hizmet bedelidir. Karar verirken bu tutarın yalnızca nominal değil, bugünkü değer etkisiyle birlikte okunması gerekir.",
  ],
  [
    "Hangi firmalar BDDK lisanslıdır?",
    "Piyasadaki lisanslı firmalar zaman içinde değişebilir. Bu araç, kullanıcıya hesap mantığını karşılaştırmalı görmek için alan sağlar; nihai doğrulama için firma ve düzenleyici kaynaklar ayrıca kontrol edilmelidir.",
  ],
  [
    "Tasarruf finansmanı mı yoksa banka kredisi mi daha avantajlı?",
    "Bu sorunun cevabı peşinat, teslim süresi, kira etkisi, hizmet bedeli ve kredi maliyetine göre değişir. Bu yüzden yalnızca toplam ödeme değil, bugünkü değer ve karar skoru birlikte okunmalıdır.",
  ],
  [
    "İndirgeme oranı nasıl kullanılır?",
    "Aylık indirgeme oranı, yıllık enflasyon varsayımından türetilir. Her gelecekteki ödeme bu oranla bugüne çekilerek gerçek ekonomik karşılığı hesaplanır.",
  ],
  [
    "Net Bugünkü Maliyet formülü nasıl çalışır?",
    "NBM; peşinat PV, hizmet bedeli PV, taksitler PV ve kira PV toplamıdır. Teslim gecikmesi, çekilişli risk aralığı ve kredi kıyası da karar yorumuna eklenerek teklif daha gerçekçi okunur.",
  ],
];

export function FAQSection() {
  return (
    <section id="faq" className="page-container mt-12">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950">Sıkça Sorulan Sorular</h2>
        <p className="mt-3 text-base text-slate-600">
          Tasarruf finansmanı kararını verirken en çok sorulan başlıklar ve hesap mantığı.
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white soft-shadow">
        {faqs.map(([question, answer], index) => (
          <details className="group border-b border-slate-200 last:border-b-0" key={question} open={index === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-base font-black text-slate-950">
              {question}
              <span className="text-xl text-[var(--green)] transition group-open:rotate-45">+</span>
            </summary>
            <p className="px-6 pb-6 text-[15px] leading-7 text-slate-600">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
