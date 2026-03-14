import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Projekt-Anfrage | IMS – Ihr Möbel Schreiner",
  description: "Projektanfrage für Architekten und Planer. CNC-Fertigung, Einbaumöbel, Schreinerküchen – direkt aus der Werkstatt in Murrhardt.",
  openGraph: {
    title: "Projekt-Anfrage | IMS – Ihr Möbel Schreiner",
    description: "Projektanfrage für Architekten und Planer. CNC-Fertigung, Einbaumöbel, Schreinerküchen.",
    type: "website",
    locale: "de_DE",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F9F8F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
