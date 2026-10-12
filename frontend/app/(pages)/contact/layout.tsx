import type { Metadata } from "next";
import FAQ from "@/app/components/faq";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Bencord Ltd for enquiries about printers, ink cartridges, toner cartridges, office supplies, and computer accessories. We're here to help your business find the right solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    {children}
    <FAQ />
    </>
  );
}