import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { OfferComparisonPage } from "../../components/OfferComparisonPage";

export default function CompareOffersRoute() {
  return (
    <>
      <Header active="compare" />
      <OfferComparisonPage />
      <Footer />
    </>
  );
}
