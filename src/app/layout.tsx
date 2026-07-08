import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Schibsted_Grotesk, Hanken_Grotesk, Newsreader } from "next/font/google";

const SITE_URL = "https://resa-service.com";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-schibsted",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RESA — Site web & réservations en ligne pour restaurants",
    template: "%s | RESA",
  },
  description:
    "RESA crée le site web de votre restaurant, gère les réservations en ligne et centralise horaires, menus, congés et évènements depuis un espace d'administration unique. Hébergement, maintenance et SEO inclus.",
  applicationName: "RESA",
  keywords: [
    "site web restaurant",
    "réservation restaurant en ligne",
    "logiciel réservation restaurant",
    "gestion réservations restaurant",
    "création site restaurant",
    "SEO restaurant",
    "menu en ligne restaurant",
    "RESA",
  ],
  authors: [{ name: "RESA" }],
  creator: "RESA",
  publisher: "RESA",
  category: "Business Software",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "RESA",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "RESA",
    title: "RESA — Site web & réservations en ligne pour restaurants",
    description:
      "Site sur-mesure, réservations en ligne et espace d'administration tout-en-un pour les restaurants. Hébergement, maintenance et SEO inclus.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RESA — Site web & réservations en ligne pour restaurants",
    description:
      "Site sur-mesure, réservations en ligne et espace d'administration tout-en-un pour les restaurants.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#13503B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${schibsted.variable} ${hanken.variable} ${newsreader.variable}`}
    >
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
