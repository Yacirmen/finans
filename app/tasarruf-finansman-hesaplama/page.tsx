import { CalculatorSection } from "../../components/CalculatorSection";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";

export default function SavingsFinanceCalculatorPage() {
  return (
    <>
      <Header active="calculator" />
      <main className="bg-[radial-gradient(circle_at_top_left,#e6f2ff_0%,#f7faff_35%,#f4f7fb_100%)] pb-14 pt-8">
        <CalculatorSection />
      </main>
      <Footer />
    </>
  );
}
