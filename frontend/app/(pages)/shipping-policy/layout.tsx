import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Everything you need to know about shipping times, delivery areas, and tracking your order.",
};

export default function ShippingPolicyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-white">
      {children}
    </main>
  );
}