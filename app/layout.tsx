import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bormio.vercel.app"),
  title: "La mia Notte Bormina",
  description:
    "Scegli le tue tappe e crea il percorso perfetto per la Notte Bormina 2026.",
  applicationName: "La mia Notte Bormina",
  openGraph: {
    title: "La mia Notte Bormina",
    description:
      "Scegli le tue tappe e crea il percorso perfetto per la Notte Bormina 2026.",
    type: "website",
    locale: "it_IT",
    images: [
      {
        url: "/notte-bormina-social.png",
        width: 1200,
        height: 630,
        alt: "La mia Notte Bormina — 25 luglio 2026, Bormio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "La mia Notte Bormina",
    description:
      "Scegli le tue tappe e crea il percorso perfetto per la Notte Bormina 2026.",
    images: ["/notte-bormina-social.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5EC" },
    { media: "(prefers-color-scheme: dark)", color: "#20231F" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
