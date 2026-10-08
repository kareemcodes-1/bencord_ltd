import type { Metadata } from "next";
import "./globals.css";

import { Geist } from "next/font/google";
import ToastProvider from "@/providers/toast-provider";
import AuthProvider from "@/providers/session-provider";
import WebsiteSchema from "./components/seo/website-schema";
import OrganizationSchema from "./components/seo/organization-schema";
import Script from "next/script";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bencord Ltd | Printers, Toners, Ink Cartridges & Office Supplies",
    template: "%s | Bencord Ltd",
  },

  description:
    "Bencord Ltd supplies genuine printers, toner cartridges, ink cartridges, laptops, accessories, and office supplies with fast nationwide delivery across Ghana.",

  keywords: [
    "HP toner cartridges",
    "HP ink cartridges",
    "Canon toner cartridges",
    "Canon ink cartridges",
    "printers Ghana",
    "office supplies Ghana",
    "laptops Ghana",
    "printer accessories",
    "office equipment",
    "Bencord Ltd",
  ],

  authors: [
    {
      name: "Bencord Ltd",
    },
  ],

  creator: "Bencord Ltd",

  openGraph: {
    title:
      "Bencord Ltd | Printers, Toners, Ink Cartridges & Office Supplies",

    description:
      "Shop genuine printers, toner cartridges, ink cartridges, laptops, accessories, and office supplies with fast nationwide delivery across Ghana.",

    url: "https://bencordltd.com.ng",

    siteName: "Bencord Ltd",

    images: [
      {
        url: "https://ik.imagekit.io/jl7pziosr/logo.jpeg",
        width: 1200,
        height: 630,
        alt: "Bencord Ltd Office Supplies",
      },
    ],

    locale: "en_GH",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Bencord Ltd | Printers, Toners, Ink Cartridges & Office Supplies",

    description:
      "Shop genuine office supplies with fast delivery across Ghana.",

    images: ["https://ik.imagekit.io/jl7pziosr/logo.jpeg?updatedAt=1787569894340"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

   icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
    <head>
            <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
    
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
    
                gtag('config', 'G-5XHLTRH74B');
              `}
            </Script>
          </head>
      <body className="bg-white text-black antialiased">
        <ToastProvider />
        <WebsiteSchema />
        <OrganizationSchema />

        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}