import { BlogSection } from "../components/BlogSection";
import { CalculatorSection } from "../components/CalculatorSection";
import { ExampleScenarioSection } from "../components/ExampleScenarioSection";
import { FAQSection } from "../components/FAQSection";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <CalculatorSection />
        <ExampleScenarioSection />
        <FAQSection />
        <BlogSection />
      </main>
      <Footer />
    </>
  );
}
