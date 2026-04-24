import { CreditLimitCalculatorModule } from "../../components/calculators/CreditLimitCalculatorModule";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";

export default function CreditLimitRoute() {
  return (
    <>
      <Header active="calculator" />
      <CreditLimitCalculatorModule />
      <Footer />
    </>
  );
}
