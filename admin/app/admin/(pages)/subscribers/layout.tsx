import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscribers",
  description: "Users who signed up for email updates and offers.",
};

export default function SubscribersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}