const faqs = [
  [
    "Tasarruf finansmanı sistemi nedir?",
    "Düzenli ödeme ve belirli teslim koşullarıyla konut veya taşıt edinmeye yönelik, maliyeti hizmet bedeli ve zaman etkisiyle oluşan bir finansman modelidir.",
  ],
  [
    "Net maliyet neyi gösterir?",
    "Peşinat, taksitler, hizmet bedeli, teslim zamanı ve paranın zaman değerini birlikte değerlendirerek bugünkü ekonomik yükü gösterir.",
  ],
  [
    "Çekilişli ve çekilişsiz model farkı nedir?",
    "Çekilişli modelde teslim sırası kura veya grup yapısına bağlıdır; çekilişsiz modelde teslim zamanı sözleşme şartlarıyla daha öngörülebilirdir.",
  ],
  [
    "Hizmet bedeli hesaplamaya nasıl girer?",
    "Hizmet bedeli genellikle sözleşme tutarı üzerinden oranla hesaplanır ve ödeme şekline göre nakit akışına eklenir.",
  ],
  [
    "Banka kredisi karşılaştırması neden gerekli?",
    "Aynı peşinat ve benzer varlık değeriyle kredi seçeneğinin toplam ve bugünkü maliyeti görüldüğünde karar daha netleşir.",
  ],
  [
    "Kira veya fırsat maliyeti neden soruluyor?",
    "Teslim alınana kadar geçen sürede ödenen kira veya kaçırılan kullanım faydası gerçek maliyeti etkileyen önemli bir değişkendir.",
  ],
  [
    "Lisanslı firma bilgisi neden önemli?",
    "Finansman şirketinin düzenleyici çerçevede çalışması, tüketici açısından hukuki güven ve şeffaflık beklentisini artırır.",
  ],
  [
    "Sonuçlar kesin teklif yerine geçer mi?",
    "Hayır. Hesaplama karar desteği sağlar; nihai şartlar firma sözleşmesi, kampanya ve güncel piyasa koşullarıyla doğrulanmalıdır.",
  ],
];

export function FAQSection() {
  return (
    <section id="nasıl-çalışır?" className="page-container mt-12">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950">Sıkça Sorulan Sorular</h2>
        <p className="mt-3 text-base text-slate-600">Sistem hakkında merak edilen temel kavramlar ve hesaplama mantığı.</p>
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
