import { BlogSection } from "../components/BlogSection";
import { CalculatorSection } from "../components/CalculatorSection";
import { FAQSection } from "../components/FAQSection";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { InteractionScript } from "../components/InteractionScript";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <CalculatorSection />
        <FAQSection />
        <BlogSection />
      </main>
      <Footer />
      <InteractionScript />
    </>
  );
}
