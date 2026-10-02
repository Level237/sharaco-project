

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Logiciel de Devis et Facturation en Ligne | Sharaco",
  description: "Créez vos devis et factures professionnels en 2 minutes. La plateforme IA tout-en-un pour freelances, artisans et PME. Fini Word et Excel, gagnez 2h par jour.",
  keywords: ["logiciel devis", "facturation en ligne", "modèle de devis", "outil freelance", "créer un devis"],
  openGraph: {
    title: "Logiciel de Devis et Facturation en Ligne | Sharaco",
    description: "Créez vos devis et factures professionnels en 2 minutes avec Sharaco.",
    type: "website",
    locale: "fr_FR",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${inter.className} antialiased bg-[#0a0a0a] text-slate-50`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Sharaco",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR"
              },
              "description": "Logiciel de devis et facturation en ligne pour freelances et PME."
            })
          }}
        />
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
