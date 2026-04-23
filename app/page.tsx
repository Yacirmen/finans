import { BlogSection } from "../components/BlogSection";
import { CalculatorSection } from "../components/CalculatorSection";
import { FAQSection } from "../components/FAQSection";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { InteractionScript } from "../components/InteractionScript";
import { LoanLimitSection } from "../components/LoanLimitSection";

export default function HomePage() {
  return (
    <>
      <Header active="home" />
      <main>
        <HeroSection />
        <LoanLimitSection />
        <CalculatorSection />
        <FAQSection />
        <BlogSection />
      </main>
      <Footer />
      <InteractionScript />
    </>
  );
}
