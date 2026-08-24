import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preferences",
  description: "Switch between light and dark mode and manage display preferences.",
};

export default function PreferencesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}