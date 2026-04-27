import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { RaffleCreditComparisonModule } from "../../components/calculators/RaffleCreditComparisonModule";

export default function RaffleCreditComparisonPage() {
  return (
    <>
      <Header active="calculator" />
      <RaffleCreditComparisonModule />
      <Footer />
    </>
  );
}
