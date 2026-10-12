import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Rates",
  description: "Manage delivery locations and shipping fees.",
};

export default function ShippingRatesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}