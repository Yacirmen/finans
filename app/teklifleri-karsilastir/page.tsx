import { Suspense } from "react";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { OfferComparisonPage } from "../../components/OfferComparisonPage";

export default function CompareOffersRoute() {
  return (
    <>
      <Header active="compare" />
      <Suspense
        fallback={
          <div className="page-container py-10 text-sm text-[#6f7d94]">
            Karşılaştırma modülü yükleniyor...
          </div>
        }
      >
        <OfferComparisonPage />
      </Suspense>
      <Footer />
    </>
  );
}
