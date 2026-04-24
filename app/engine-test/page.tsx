import { EngineTestPage } from "../../components/EngineTestPage";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";

export const metadata = {
  title: "Hesap Motoru Testleri",
  description: "Tasarruf finansmanı hesap motorunun senaryo bazlı doğrulama ekranı.",
};

export default function EngineTestRoute() {
  return (
    <>
      <Header active="compare" />
      <EngineTestPage />
      <Footer />
    </>
  );
}
