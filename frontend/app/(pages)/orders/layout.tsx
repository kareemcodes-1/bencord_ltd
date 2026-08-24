import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
  description:
    "Track your orders, view order history, and check delivery status.",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}