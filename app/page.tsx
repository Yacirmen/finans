import { BlogSection } from "../components/BlogSection";
import { CalculatorSection } from "../components/CalculatorSection";
import { ConsultationSection } from "../components/ConsultationSection";
import { FAQSection } from "../components/FAQSection";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { LoanLimitSection } from "../components/LoanLimitSection";
import { NewsletterSignup } from "../components/NewsletterSignup";

export default function HomePage() {
  return (
    <>
      <Header active="home" />
      <main>
        <HeroSection />
        <LoanLimitSection />
        <CalculatorSection />
        <FAQSection />
        <NewsletterSignup />
        <ConsultationSection />
        <BlogSection />
      </main>
      <Footer />
    </>
  );
}
