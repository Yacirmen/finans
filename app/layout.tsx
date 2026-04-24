import type { Metadata } from "next";
import { InteractionScript } from "../components/InteractionScript";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Finansman Maliyet Hesaplama",
  description:
    "Tasarruf finansmanı maliyetini hesaplayın, teklifleri karşılaştırın ve kararınızı netleştirin.",
  icons: {
    icon: `${basePath}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        {children}
        <InteractionScript />
      </body>
    </html>
  );
}
