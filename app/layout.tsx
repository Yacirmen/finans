import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finansman Maliyet Hesaplama",
  description:
    "Tasarruf finansmanı maliyetini hesaplayın, teklifleri karşılaştırın ve kararınızı netleştirin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
