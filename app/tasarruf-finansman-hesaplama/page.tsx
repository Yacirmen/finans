import { CalculatorSection } from "../../components/CalculatorSection";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";

export default function SavingsFinanceCalculatorPage() {
  return (
    <>
      <Header active="calculator" />
      <main className="bg-[linear-gradient(180deg,#fff7f1_0%,#f6f8fb_42%,#ffffff_100%)] pb-14 pt-8">
        <CalculatorSection />
      </main>
      <Footer />
    </>
  );
}
