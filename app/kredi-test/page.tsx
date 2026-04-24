import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { LoanMathTestPage } from "../../components/LoanMathTestPage";

export default function LoanTestRoute() {
  return (
    <>
      <Header active="data" />
      <LoanMathTestPage />
      <Footer />
    </>
  );
}
