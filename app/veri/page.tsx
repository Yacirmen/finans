import { DataHubSection } from "../../components/DataHubSection";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";

export const metadata = {
  title: "Piyasa Endeksi ve Veri Sayfası",
  description: "Konut, taşıt, kredi ve makro veri göstergeleriyle tasarruf finansmanı piyasa endeksi.",
};

export default function DataPage() {
  return (
    <>
      <Header active="data" />
      <DataHubSection />
      <Footer />
    </>
  );
}

