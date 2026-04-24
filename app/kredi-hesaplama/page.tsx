import { CreditCalculatorModule } from "../../components/calculators/CreditCalculatorModule";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";

export default function CreditCalculatorRoute() {
  return (
    <>
      <Header active="calculator" />
      <CreditCalculatorModule />
      <Footer />
    </>
  );
}

