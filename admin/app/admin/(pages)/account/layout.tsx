import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your account details, profile, and security settings.",
};

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}