import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Simple guide to using the admin panel.",
};

export default function DocumentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}