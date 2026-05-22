import "./globals.css";
import type { Metadata } from "next";
import Head from "next/head";
// import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "RESA",
  description: "The new web app to manage reservation in your restaurant.",
  icons: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <Head>
        <title>RESA</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        ></meta>
        <meta name="keywords" content="restaurant, booking, réservation, reservation" />
        <meta name="description" content="Resaurant booking management" />
        <meta property="og:title" content="RESA" />
        <meta property="og:image" content="" />
        <meta property="og:url" content="" />
        <meta charSet="utf-8"></meta>
        <link rel="icon" href="#"></link>
      </Head>
      <body>
        {children}
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
