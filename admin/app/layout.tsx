import type { Metadata } from "next";
import "./globals.css";

import { Geist } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import NextTopLoader from "nextjs-toploader";
import ToastProvider from "@/providers/toast-provider";
import AuthProvider from "@/providers/session-provider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bencord Ltd — Admin",
    template: "%s | Bencord Ltd Admin",
  },
  description: "Bencord Ltd administration dashboard.",
  applicationName: "Bencord Ltd Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
      <AuthProvider>
      <ToastProvider />

      <NextTopLoader
        color="#ee0a0a"
        height={2}
        showSpinner={false}
        crawlSpeed={200}
        speed={400}
        shadow="0 0 10px #ee0a0a, 0 0 5px #ee0a0a"
      />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}