import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Manage products, inventory, pricing, and product information.",
};

export default function ProductsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}